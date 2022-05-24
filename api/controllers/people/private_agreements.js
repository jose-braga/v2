const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const projects = require('./projects');

var actionGetAllProjects = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    if (req.query.q !== undefined & req.query.q !== null) {
        let q = '%'
        let qraw = req.query.q;
        q = '%' + qraw.replace(/\s/gi,'%') + '%';
        querySQL = querySQL
            + 'SELECT DISTINCT private_agreements.id,'
            + ' NULL AS project_type_id,'
            + ' NULL AS project_type_name,'
            + ' NULL AS call_type_id,'
            + ' NULL AS call_type_name,'
            + ' private_agreements.agreement_type_id,'
            + ' private_agreement_types.name AS agreement_type_name,'
            + ' private_agreements.title,'
            + ' private_agreements.acronym,'
            + ' private_agreements.reference,'
            + ' private_agreements.confidential,'
            + ' private_agreements.start,'
            + ' private_agreements.end,'
            + ' private_agreements.global_amount,'
            + ' private_agreements.website,'
            + ' private_agreements.notes,'
            + ' 1 AS industry_project'
            + ' FROM private_agreements'
            + ' LEFT JOIN private_agreement_types ON private_agreement_types.id = private_agreements.agreement_type_id'
            + ' LEFT JOIN people_private_agreements ON people_private_agreements.agreement_id = private_agreements.id'
            + ' WHERE (private_agreements.title LIKE ? OR private_agreements.acronym LIKE ? OR private_agreements.reference LIKE ?)'
            + ' AND private_agreements.id NOT IN ('
            +       'SELECT agreement_id FROM people_private_agreements WHERE person_id = ?'
            + ')'
            + ' UNION '
            + 'SELECT DISTINCT projects.id,'
            + ' projects.project_type_id,'
            + ' project_types.name AS project_type_name,'
            + ' projects.call_type_id,'
            + ' call_types.name AS call_type_name,'
            + ' NULL AS agreement_type_id,'
            + ' NULL AS agreement_type_name,'
            + ' projects.title,'
            + ' projects.acronym,'
            + ' projects.reference,'
            + ' NULL AS confidential,'
            + ' projects.start,'
            + ' projects.end,'
            + ' projects.global_amount,'
            + ' projects.website,'
            + ' projects.notes,'
            + ' 0 AS industry_project'
            + ' FROM projects'
            + ' LEFT JOIN project_types ON project_types.id = projects.project_type_id'
            + ' LEFT JOIN call_types ON call_types.id = projects.call_type_id'
            + ' LEFT JOIN people_projects ON people_projects.project_id = projects.id'
            + ' WHERE (projects.title LIKE ? OR projects.acronym LIKE ? OR projects.reference LIKE ?)'
            + ' AND people_projects.project_id NOT IN ('
            +       'SELECT project_id FROM people_projects WHERE person_id = ?'
            + ')'
            + ';'
        places.push(
            q, q, q, personID,
            q, q, q, personID
        );
    } else {
        // change this
        querySQL = querySQL
            + 'SELECT private_agreements.*, private_agreement_types.name,'
            + ' 1 AS industry_project, NULL AS project_type_id, NULL AS call_type_id'
            + ' FROM private_agreements'
            + ' LEFT JOIN private_agreement_types ON private_agreement_types.id = private_agreements.agreement_type_id'
            + ' UNION '
            + 'SELECT projects.*, project_types.name, call_types.name,'
            + ' 0 AS industry_project, NULL AS agreement_type_id, NULL AS confidential'
            + ' FROM projects'
            + ' LEFT JOIN project_types ON project_types.id = projects.project_type_id'
            + ' LEFT JOIN call_types ON call_types.id = projects.call_type_id'
            + ';'
    }
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getAllProjects = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetAllProjects(options) },
        { req, res, next }
    );
};

var actionGetPersonProjects = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT people_private_agreements.person_id, people_private_agreements.agreement_id'
        + ' FROM people_private_agreements'
        + ' JOIN private_agreements ON private_agreements.id = people_private_agreements.agreement_id'
        + ' WHERE people_private_agreements.person_id = ?'
        + ';';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.projects = resQuery;
            if (resQuery.length > 0) {
                options.i = 0;
                return getProjectDetails(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 0,
                        "result": [],
                    }
                });
                return;
            }

        },
        options);
};
var getProjectDetails = function (options) {
    let { req, res, next, projects, i } = options;
    let project = projects[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT private_agreements.*, private_agreement_types.name AS private_agreement_type_name,'
        + ' 1 AS industry_project'
        + ' FROM private_agreements'
        + ' LEFT JOIN private_agreement_types ON private_agreement_types.id = private_agreements.agreement_type_id'
        + ' WHERE private_agreements.id = ?'
        + ';';
    places.push(project.agreement_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.projects[i].project_details = resQuery[0];
            } else {
                options.projects[i].project_details = {};
            }
            return getProjectAreas(options);
        },
        options);
};
var getProjectAreas = function (options) {
    let { req, res, next, projects, i } = options;
    let project = projects[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT *'
        + ' FROM private_agreement_areas'
        + ' WHERE agreement_id = ?'
        + ';';
    places.push(project.agreement_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let researchAreas = [];
            for (let ind in resQuery) {
                researchAreas.push(resQuery[ind].research_area);
            }
            options.projects[i].project_details.project_areas = researchAreas;
            return getProjectPartners(options);
        },
        options);
}
var getProjectPartners = function (options) {
    let { req, res, next, projects, i } = options;
    let project = projects[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT private_agreements_partners.*, countries.name AS country_name'
        + ' FROM private_agreements_partners'
        + ' LEFT JOIN countries ON countries.id = private_agreements_partners.country_id'
        + ' WHERE private_agreements_partners.agreement_id = ?'
        + ';';
    places.push(project.agreement_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.projects[i].project_details.partners = resQuery;
            return getProjectManagementEntities(options);
        },
        options);
};
var getProjectManagementEntities = function (options) {
    let { req, res, next, projects, i } = options;
    let project = projects[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT private_agreements_management_entities.*,'
        + ' management_entities.official_name, management_entities.short_name'
        + ' FROM private_agreements_management_entities'
        + ' JOIN management_entities ON management_entities.id = private_agreements_management_entities.management_entity_id'
        + ' WHERE private_agreements_management_entities.agreement_id = ?'
        + ';';
    places.push(project.agreement_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.projects[i].project_details.management_entities = resQuery[0];
            } else {
                options.projects[i].project_details.management_entities = {};
            }
            return getLabProjectDetails(options);
        },
        options);
}
var getLabProjectDetails = function (options) {
    let { req, res, next, projects, i } = options;
    let personID = req.params.personID;
    let project = projects[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT labs_private_agreements.*,'
        + ' labs.name AS lab_name, labs.short_name AS lab_short_name'
        + ' FROM labs_private_agreements'
        + ' JOIN labs ON labs.id = labs_private_agreements.lab_id'
        + ' WHERE labs_private_agreements.agreement_id = ?'
        + ';';
    places.push(project.agreement_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.projects[i].labs_details = resQuery;
            return getPersonProjectDetails(options);
        },
        options);
};
var getPersonProjectDetails = function (options) {
    let { req, res, next, projects, i } = options;
    let personID = req.params.personID;
    let project = projects[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_private_agreements.*,'
        + ' people.name AS person_name, people.colloquial_name AS person_colloquial_name'
        + ' FROM people_private_agreements'
        + ' JOIN people ON people.id = people_private_agreements.person_id'
        + ' WHERE people_private_agreements.agreement_id = ?'
        + ';';
    places.push(project.agreement_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.projects[i].person_details = resQuery;
            if (i + 1 < projects.length) {
                options.i = i + 1;
                return getProjectDetails(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": options.projects.length,
                        "result": options.projects,
                    }
                });
                return;
            }
        },
        options);
};
module.exports.getPersonProjects = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPersonProjects(options) },
        { req, res, next }
    );
};

var actionCreateProject = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    if (data.start === '') data.start = null;
    if (data.end === '') data.end = null;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO private_agreements'
        + ' (title, acronym, reference, confidential, start, end, global_amount, website, notes)'
        +' VALUES (?,?,?,?,?,?,?,?,?);';
    places.push(
        data.title,
        data.acronym,
        data.reference,
        data.confidential,
        data.start,
        data.end,
        data.global_amount,
        data.website,
        data.notes
    )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.agreementID = resQuery.insertId;
            return addProjectManagementEntity(options);
        },
        options);
};
var addProjectManagementEntity = function (options) {
    let { req, res, next, agreementID } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO private_agreements_management_entities'
        + ' (agreement_id, management_entity_id, amount)'
        +' VALUES (?,?,?);';
    places.push(
        agreementID,
        data.management_entity_id,
        data.amount
    )
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            options.i = 0;
            if (data.project_areas !== undefined
                    && data.project_areas !== null
                    && data.project_areas.length > 0) {
                return addProjectAreas(options);
            } else if (data.partners !== undefined
                    && data.partners !== null
                    && data.partners.length > 0) {
                options.i = 0;
                return addProjectPartners(options);
            } else if (data.person_details !== undefined
                    && data.person_details !== null
                    && data.person_details.length > 0) {
                options.i = 0;
                return addPersonProject(options);
            } else if (data.labs_details !== undefined
                    && data.labs_details !== null
                    && data.labs_details.length > 0) {
                options.i = 0;
                return addLabProject(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Project successfully created.'
                    }
                });
                return;
            }
        },
        options);
};
var addProjectAreas = function (options) {
    let { req, res, next, agreementID, i } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO private_agreement_areas'
        + ' (agreement_id, research_area)'
        +' VALUES (?,?);';
    places.push(
        agreementID,
        data.project_areas[i]
    )
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < data.project_areas.length) {
                options.i = i + 1;
                return addProjectAreas(options);
            } else if (data.partners !== undefined
                    && data.partners !== null
                    && data.partners.length > 0) {
                options.i = 0;
                return addProjectPartners(options);
            } else if (data.person_details !== undefined
                    && data.person_details !== null
                    && data.person_details.length > 0) {
                options.i = 0;
                return addPersonProject(options);
            } else if (data.labs_details !== undefined
                    && data.labs_details !== null
                    && data.labs_details.length > 0) {
                options.i = 0;
                return addLabProject(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Project successfully created.'
                    }
                });
                return;
            }
        },
        options);
};
var addProjectPartners = function (options) {
    let { req, res, next, agreementID, i } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO private_agreements_partners'
        + ' (agreement_id, country_id, name)'
        +' VALUES (?,?,?);';
    places.push(
        agreementID,
        data.partners[i].country_id,
        data.partners[i].name
    )
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < data.partners.length) {
                options.i = i + 1;
                return addProjectPartners(options);
            } else if (data.person_details !== undefined
                    && data.person_details !== null
                    && data.person_details.length > 0) {
                options.i = 0;
                return addPersonProject(options);
            } else if (data.labs_details !== undefined
                    && data.labs_details !== null
                    && data.labs_details.length > 0) {
                options.i = 0;
                return addLabProject(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Project successfully created.'
                    }
                });
                return;
            }
        },
        options);
};
var addPersonProject = function (options) {
    let { req, res, next, agreementID, i } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO people_private_agreements'
        + ' (person_id, agreement_id)'
        +' VALUES (?,?);';
    places.push(
        data.person_details[i].person_id,
        agreementID
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < data.person_details.length) {
                options.i = i + 1;
                return addPersonProject(options);
            } else if (data.labs_details !== undefined
                    && data.labs_details !== null
                    && data.labs_details.length > 0) {
                options.i = 0;
                return addLabProject(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Project successfully created.'
                    }
                });
                return;
            }
        },
        options)
};
var addLabProject = function (options) {
    let { req, res, next, agreementID, i } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO labs_private_agreements'
        + ' (lab_id, agreement_id)'
        +' VALUES (?,?);';
    places.push(
        data.labs_details[i].lab_id,
        agreementID
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i+ 1 < data.labs_details.length) {
                options.i = i + 1;
                return addLabProject(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Project successfully created.'
                    }
                });
                return;
            }
        },
        options)
};
module.exports.createPersonProject = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateProject(options) },
        { req, res, next }
    );
};

var actionUpdateProject = function (options) {
    let { req, res, next } = options;
    //let personID = req.params.personID;
    let projectID = req.params.projectID;
    let data = req.body.data.project_details;
    let start = null;
    let end = null;
    let global_amount= null;
    if (data.start !== null && data.start !== undefined && data.start !== '') {
        start = data.start
    }
    if (data.end !== null && data.end !== undefined && data.end !== '') {
        end = data.end
    }
    if (data.global_amount !== null && data.global_amount !== undefined && data.global_amount !== '') {
        global_amount = data.global_amount
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE private_agreements'
        + ' SET title = ?,'
        + ' acronym = ?,'
        + ' reference = ?,'
        + ' confidential = ?,'
        + ' start = ?,'
        + ' end = ?,'
        + ' global_amount = ?,'
        + ' website = ?,'
        + ' notes = ?'
        + ' WHERE id = ?'
        +';';
    places.push(
        data.title,
        data.acronym,
        data.reference,
        data.confidential,
        start,
        end,
        global_amount,
        data.website,
        data.notes,
        projectID
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteProjectManagementEntities(options);
        },
        options);
};
var deleteProjectManagementEntities = function (options) {
    let { req, res, next } = options;
    //let personID = req.params.personID;
    let projectID = req.params.projectID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM private_agreements_management_entities WHERE agreement_id = ?;'
    places.push(projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (req.body.data.project_details.management_entities.management_entity_id !== undefined) {
                return insertProjectManagementEntities(options);
            } else {
                return deleteProjectAreas(options)
            }
        },
        options);
};
var insertProjectManagementEntities = function (options) {
    let { req, res, next } = options;
    //let personID = req.params.personID;
    let projectID = req.params.projectID;
    let data = req.body.data.project_details.management_entities;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO private_agreements_management_entities'
        + ' (agreement_id, management_entity_id, amount)'
        + ' VALUES (?, ?, ?)'
        +';';
    places.push(
        projectID,
        data.management_entity_id,
        data.amount
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteProjectAreas(options)
        },
        options);

};
var deleteProjectAreas = function (options) {
    let { req, res, next } = options;
    //let personID = req.params.personID;
    let projectID = req.params.projectID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM private_agreement_areas WHERE agreement_id = ?;'
    places.push(projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (req.body.data.project_details.project_areas.length > 0) {
                options.i = 0;
                return insertProjectAreas(options);
            } else if (req.body.data.toDeletePartner.length > 0) {
                options.i = 0;
                return deleteProjectPartner(options);
            } else if (req.body.data.project_details.partners.length > 0) {
                options.i = 0;
                return updateCreateProjectPartner(options);
            } else if (req.body.data.toDeletePerson.length > 0) {
                options.i = 0;
                return deleteProjectPerson(options);
            } else if (req.body.data.person_details.length > 0) {
                options.i = 0;
                return updateCreateProjectPerson(options);
            } else if (req.body.data.toDeleteLab.length > 0) {
                options.i = 0;
                return deleteProjectLab(options);
            } else if (req.body.data.labs_details.length > 0) {
                options.i = 0;
                return updateCreateProjectLab(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Project successfully updated.'
                    }
                });
                return;
            }
        },
        options);
};
var insertProjectAreas = function (options) {
    let { req, res, next, i } = options;
    //let personID = req.params.personID;
    let projectID = req.params.projectID;
    let data = req.body.data.project_details.project_areas[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO private_agreement_areas'
        + ' (agreement_id, research_area)'
        + ' VALUES (?, ?)'
        +';';
    places.push(
        projectID,
        data
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.project_details.project_areas.length) {
                options.i = i + 1;
                return insertProjectAreas(options);
            } else if (req.body.data.toDeletePartner.length > 0) {
                options.i = 0;
                return deleteProjectPartner(options);
            } else if (req.body.data.project_details.partners.length > 0) {
                options.i = 0;
                return updateCreateProjectPartner(options);
            } else if (req.body.data.toDeletePerson.length > 0) {
                options.i = 0;
                return deleteProjectPerson(options);
            } else if (req.body.data.person_details.length > 0) {
                options.i = 0;
                return updateCreateProjectPerson(options);
            } else if (req.body.data.toDeleteLab.length > 0) {
                options.i = 0;
                return deleteProjectLab(options);
            } else if (req.body.data.labs_details.length > 0) {
                options.i = 0;
                return updateCreateProjectLab(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Project successfully updated.'
                    }
                });
                return;
            }
        },
        options);

};
var deleteProjectPartner = function (options) {
    let { req, res, next, i } = options;
    //let personID = req.params.personID;
    let projectID = req.params.projectID;
    let data = req.body.data.toDeletePartner[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM private_agreements_partners WHERE person_id = ? AND agreement_id = ?;'
    places.push(data.person_id, projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.toDeletePartner.length) {
                options.i = i + 1;
                return deleteProjectPartner(options);
            } else if (req.body.data.project_details.partners.length > 0) {
                options.i = 0;
                return updateCreateProjectPartner(options);
            } else if (req.body.data.toDeletePerson.length > 0) {
                options.i = 0;
                return deleteProjectPerson(options);
            } else if (req.body.data.person_details.length > 0) {
                options.i = 0;
                return updateCreateProjectPerson(options);
            } else if (req.body.data.toDeleteLab.length > 0) {
                options.i = 0;
                return deleteProjectLab(options);
            } else if (req.body.data.labs_details.length > 0) {
                options.i = 0;
                return updateCreateProjectLab(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Project successfully updated.'
                    }
                });
                return;
            }
        },
        options);
};
var updateCreateProjectPartner = function (options) {
    let { req, res, next, i } = options;
    //let personID = req.params.personID;
    let projectID = req.params.projectID;
    let data = req.body.data.project_details.partners[i];
    var querySQL = '';
    var places = [];
    if (data.id === 'new') {
        querySQL = querySQL
            + 'INSERT INTO private_agreements_partners'
            + ' (agreement_id, country_id, name)'
            + ' VALUES (?, ?, ?)'
            +';';
        places.push(
            projectID,
            data.country_id,
            data.name
        );
    } else {
        querySQL = querySQL
            + 'UPDATE private_agreements_partners'
            + ' SET country_id = ?,'
            + ' name = ?'
            + ' WHERE id = ?'
            +';';
        places.push(
            data.country_id,
            data.name,
            data.id
        );
    }
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.project_details.partners.length) {
                options.i = i + 1;
                return updateCreateProjectPartner(options);
            } else if (req.body.data.toDeletePerson.length > 0) {
                options.i = 0;
                return deleteProjectPerson(options);
            } else if (req.body.data.person_details.length > 0) {
                options.i = 0;
                return updateCreateProjectPerson(options);
            } else if (req.body.data.toDeleteLab.length > 0) {
                options.i = 0;
                return deleteProjectLab(options);
            } else if (req.body.data.labs_details.length > 0) {
                options.i = 0;
                return updateCreateProjectLab(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Project successfully updated.'
                    }
                });
                return;
            }
        },
        options);
};
var deleteProjectPerson = function (options) {
    let { req, res, next, i } = options;
    //let personID = req.params.personID;
    let projectID = req.params.projectID;
    let data = req.body.data.toDeletePerson[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM people_private_agreements WHERE person_id = ? AND agreement_id = ?;'
    places.push(data.person_id, projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.toDeletePerson.length) {
                options.i = i + 1;
                return deleteProjectPerson(options);
            } else if (req.body.data.person_details.length > 0) {
                options.i = 0;
                return updateCreateProjectPerson(options);
            } else if (req.body.data.toDeleteLab.length > 0) {
                options.i = 0;
                return deleteProjectLab(options);
            } else if (req.body.data.labs_details.length > 0) {
                options.i = 0;
                return updateCreateProjectLab(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Project successfully updated.'
                    }
                });
                return;
            }
        },
        options);
};
var updateCreateProjectPerson = function (options) {
    let { req, res, next, i } = options;
    //let personID = req.params.personID;
    let projectID = req.params.projectID;
    let data = req.body.data.person_details[i];
    if (data.valid_from === '') {
        data.valid_from = null
    }
    if (data.valid_until === '') {
        data.valid_until = null
    }
    var querySQL = '';
    var places = [];
    if (data.id === 'new') {
        querySQL = querySQL
            + 'INSERT INTO people_private_agreements'
            + ' (person_id, agreement_id)'
            + ' VALUES (?, ?)'
            +';';
        places.push(
            data.person_id,
            projectID,
        );
    } else {
        querySQL = querySQL
            + 'UPDATE people_private_agreements'
            + ' SET person_id = ?'
            + ' WHERE id = ?'
            +';';
        places.push(
            data.person_id,
            data.id
        );
    }
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.person_details.length) {
                options.i = i + 1;
                return updateCreateProjectPerson(options);
            } else if (req.body.data.toDeleteLab.length > 0) {
                options.i = 0;
                return deleteProjectLab(options);
            } else if (req.body.data.labs_details.length > 0) {
                options.i = 0;
                return updateCreateProjectLab(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Project successfully updated.'
                    }
                });
                return;
            }
        },
        options);
};
var deleteProjectLab = function (options) {
    let { req, res, next, i } = options;
    //let personID = req.params.personID;
    let projectID = req.params.projectID;
    let data = req.body.data.toDeleteLab[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM labs_private_agreements WHERE lab_id = ? AND agreement_id = ?;'
    places.push(data.lab_id, projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.toDeleteLab.length) {
                options.i = i + 1;
                return deleteProjectLab(options);
            } else if (req.body.data.labs_details.length > 0) {
                options.i = 0;
                return updateCreateProjectLab(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Project successfully updated.'
                    }
                });
                return;
            }
        },
        options);
};
var updateCreateProjectLab = function (options) {
    let { req, res, next, i } = options;
    //let personID = req.params.personID;
    let projectID = req.params.projectID;
    let data = req.body.data.labs_details[i];
    if (data.valid_from === '') {
        data.valid_from = null
    }
    if (data.valid_until === '') {
        data.valid_until = null
    }
    var querySQL = '';
    var places = [];
    if (data.id === 'new') {
        querySQL = querySQL
            + 'INSERT INTO labs_private_agreements'
            + ' (lab_id, agreement_id)'
            + ' VALUES (?, ?)'
            +';';
        places.push(
            data.lab_id,
            projectID
        );
    } else {
        querySQL = querySQL
            + 'UPDATE labs_private_agreements'
            + ' SET lab_id = ?'
            + ' WHERE id = ?'
            +';';
        places.push(
            data.lab_id,
            data.id
        );
    }
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.labs_details.length) {
                options.i = i + 1;
                return updateCreateProjectLab(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Project successfully updated.'
                    }
                });
                return;
            }
        },
        options);
};
module.exports.updatePersonProject = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            let project = req.body.data;
            let isIndustryProject = 1;
            if (project.industry_project !== undefined) {
                isIndustryProject = project.industry_project;
            } else if (project.project_details !== undefined
                && project.project_details.industry_project !== undefined
            ) {
                isIndustryProject = project.project_details.industry_project;
            }
            if (isIndustryProject === 1) {
                actionUpdateProject(options)
            } else {
                req.body.data.operation = 'from-industry-project'
                return projects.createPersonProjectAssociation(req, res, next);
            }
        },
        { req, res, next }
    );
};

var actionCreatePersonProjectAssociation = function (options) {
    let { req, res, next, i } = options;
    let personID = req.params.personID;
    let projectID = req.params.projectID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO people_private_agreements'
        + ' (person_id, agreement_id)'
        + ' SELECT ?, ? FROM DUAL'
        + ' WHERE NOT EXISTS (SELECT *'
        +       ' FROM people_private_agreements'
        +       ' WHERE person_id = ? AND agreement_id = ?'
        +    ');';
    places.push(
        personID,
        projectID,
        personID,
        projectID
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};

var getThisProjectAreas = function (options) {
    let { req, res, next, project } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT *'
        + ' FROM project_areas'
        + ' WHERE project_id = ?'
        + ';';
    if (project.industry_project === 0) {
        places = [ project.id ]
    }
    if (project.operation === 'from-project') {
        places = [ project.project_id ]
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let researchAreas = [];
            for (let ind in resQuery) {
                researchAreas.push(resQuery[ind].research_area);
            }
            options.project.project_areas = researchAreas;
            return getThisProjectManagementEntities(options);
        },
        options);
}
var getThisProjectManagementEntities = function (options) {
    let { req, res, next, project } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT projects_management_entities.*,'
        + ' management_entities.official_name, management_entities.short_name'
        + ' FROM projects_management_entities'
        + ' JOIN management_entities ON management_entities.id = projects_management_entities.management_entity_id'
        + ' WHERE projects_management_entities.project_id = ?'
        + ';';
    if (project.industry_project === 0) {
        places = [ project.id ]
    }
    if (project.operation === 'from-project') {
        places = [ project.project_id ]
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.project.management_entities = resQuery[0];
            } else {
                options.project.management_entities = {};
            }
            return getThisLabProjectDetails(options);
        },
        options);
}
var getThisLabProjectDetails = function (options) {
    let { req, res, next, project } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT labs_projects.*,'
        + ' labs.name AS lab_name, labs.short_name AS lab_short_name'
        + ' FROM labs_projects'
        + ' JOIN labs ON labs.id = labs_projects.lab_id'
        + ' WHERE labs_projects.project_id = ?'
        + ';';
    if (project.industry_project === 0) {
        places = [ project.id ]
    }
    if (project.operation === 'from-project') {
        places = [ project.project_id ]
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.project.labs_details = resQuery;
            return getThisPersonProjectDetails(options);
        },
        options);
};
var getThisPersonProjectDetails = function (options) {
    let { req, res, next, project } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_projects.*,'
        + ' person_project_positions.name_en AS position_name_en,'
        + ' people.name AS person_name, people.colloquial_name AS person_colloquial_name'
        + ' FROM people_projects'
        + ' LEFT JOIN person_project_positions ON person_project_positions.id = people_projects.position_id'
        + ' JOIN people ON people.id = people_projects.person_id'
        + ' WHERE people_projects.project_id = ?'
        + ';';
    if (project.industry_project === 0) {
        places = [ project.id ]
    }
    if (project.operation === 'from-project') {
        places = [ project.project_id ]
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.project.person_details = resQuery;
            return moveProjectToIndustryProject(options)
        },
        options);
};
var moveProjectToIndustryProject = function (options) {
    let { req, res, next, project } = options;
    let data = project;
    if (project.operation === 'from-project') {
        data = project.project_details;
    }
    if (data.start === '') data.start = null;
    if (data.end === '') data.end = null;
    if (data.global_amount === '') data.global_amount = null;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO private_agreements'
        + ' (title, acronym, reference, confidential, start, end, global_amount, website, notes)'
        +' VALUES (?,?,?,?,?,?,?,?,?);';
    places.push(
        data.title,
        data.acronym,
        data.reference,
        null,
        data.start,
        data.end,
        data.global_amount,
        data.website,
        data.notes
    )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.agreementID = resQuery.insertId;
            return addThisProjectManagementEntity(options);
        },
        options);
};
var addThisProjectManagementEntity = function (options) {
    let { req, res, next, agreementID, project } = options;
    let data = project.management_entities;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO private_agreements_management_entities'
        + ' (agreement_id, management_entity_id, amount)'
        +' VALUES (?,?,?);';
    places.push(
        agreementID,
        data.management_entity_id,
        data.amount
    )
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            options.i = 0;
            if (project.project_areas !== undefined
                    && project.project_areas !== null
                    && project.project_areas.length > 0) {
                return addThisProjectAreas(options);
            } else if (project.person_details !== undefined
                    && project.person_details !== null
                    && project.person_details.length > 0) {
                options.i = 0;
                return addThisPersonProject(options);
            } else if (project.labs_details !== undefined
                    && project.labs_details !== null
                    && project.labs_details.length > 0) {
                options.i = 0;
                return addThisLabProject(options);
            } else {
                return insertRequesterIntoPeopleProject(options);
            }
        },
        options);
};
var addThisProjectAreas = function (options) {
    let { req, res, next, agreementID, project, i } = options;
    let data = project.project_areas;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO private_agreement_areas'
        + ' (agreement_id, research_area)'
        +' VALUES (?,?);';
    places.push(
        agreementID,
        data[i]
    )
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < project.project_areas.length) {
                options.i = i + 1;
                return addThisProjectAreas(options);
            } else if (project.person_details !== undefined
                    && project.person_details !== null
                    && project.person_details.length > 0) {
                options.i = 0;
                return addThisPersonProject(options);
            } else if (project.labs_details !== undefined
                    && project.labs_details !== null
                    && project.labs_details.length > 0) {
                options.i = 0;
                return addThisLabProject(options);
            } else {
                return insertRequesterIntoPeopleProject(options);
            }
        },
        options);
};
var addThisPersonProject = function (options) {
    let { req, res, next, agreementID, project, i } = options;
    let data = project;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO people_private_agreements'
        + ' (person_id, agreement_id)'
        +' VALUES (?,?);';
    places.push(
        data.person_details[i].person_id,
        agreementID
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < project.person_details.length) {
                options.i = i + 1;
                return addThisPersonProject(options);
            } else if (project.labs_details !== undefined
                    && project.labs_details !== null
                    && project.labs_details.length > 0) {
                options.i = 0;
                return addThisLabProject(options);
            } else {
                return insertRequesterIntoPeopleProject(options);
            }
        },
        options)
};
var addThisLabProject = function (options) {
    let { req, res, next, agreementID, project, i } = options;
    let data = project;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO labs_private_agreements'
        + ' (lab_id, agreement_id)'
        +' VALUES (?,?);';
    places.push(
        data.labs_details[i].lab_id,
        agreementID
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < project.labs_details.length) {
                options.i = i + 1;
                return addThisLabProject(options);
            } else {
                return insertRequesterIntoPeopleProject(options);
            }
        },
        options)
};
var insertRequesterIntoPeopleProject = function (options) {
    let { req, res, next, agreementID } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO people_private_agreements'
        + ' (person_id, agreement_id)'
        + ' SELECT ?, ? FROM DUAL'
        + ' WHERE NOT EXISTS (SELECT *'
        +       ' FROM people_private_agreements'
        +       ' WHERE person_id = ? AND agreement_id = ?'
        +    ');';
    places.push(
        personID,
        agreementID,
        personID,
        agreementID
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteOriginalPeopleProject(options);
        },
        options)
};
var deleteOriginalPeopleProject = function (options) {
    let { req, res, next, project } = options;
    //let personID = req.params.personID;
    let projectID = project.id;
    if (project.operation === 'from-project') {
        projectID = project.project_details.id;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM people_projects WHERE project_id = ?;'
    places.push(projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteOriginalLabProject(options);
        },
        options);
};
var deleteOriginalLabProject = function (options) {
    let { req, res, next, project } = options;
    //let personID = req.params.personID;
    let projectID = project.id;
    if (project.operation === 'from-project') {
        projectID = project.project_details.id;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM labs_projects WHERE project_id = ?;'
    places.push(projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteOriginalAreasProject(options);
        },
        options);
};
var deleteOriginalAreasProject = function (options) {
    let { req, res, next, project } = options;
    //let personID = req.params.personID;
    let projectID = project.id;
    if (project.operation === 'from-project') {
        projectID = project.project_details.id;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM project_areas WHERE project_id = ?;'
    places.push(projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteOriginalFundingProject(options);
        },
        options);
};
var deleteOriginalFundingProject = function (options) {
    let { req, res, next, project } = options;
    //let personID = req.params.personID;
    let projectID = project.id;
    if (project.operation === 'from-project') {
        projectID = project.project_details.id;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM projects_funding_entities WHERE project_id = ?;'
    places.push(projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteOriginalOtherFundingProject(options);
        },
        options);
};
var deleteOriginalOtherFundingProject = function (options) {
    let { req, res, next, project } = options;
    //let personID = req.params.personID;
    let projectID = project.id;
    if (project.operation === 'from-project') {
        projectID = project.project_details.id;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM projects_other_funding_entities WHERE project_id = ?;'
    places.push(projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteOriginalManagementEntitiesProject(options);
        },
        options);
};
var deleteOriginalManagementEntitiesProject = function (options) {
    let { req, res, next, project } = options;
    //let personID = req.params.personID;
    let projectID = project.id;
    if (project.operation === 'from-project') {
        projectID = project.project_details.id;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM projects_management_entities WHERE project_id = ?;'
    places.push(projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteOriginalProject(options);
        },
        options);
};
var deleteOriginalProject = function (options) {
    let { req, res, next, project } = options;
    //let personID = req.params.personID;
    let projectID = project.id;
    if (project.operation === 'from-project') {
        projectID = project.project_details.id;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM projects WHERE id = ?;'
    places.push(projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "message": 'Project successfully created.'
                }
            });
            return;
        },
        options);
};
module.exports.createPersonProjectAssociation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            let project = req.body.data;
            if (project.industry_project === 1 && project.operation !== 'from-project') {
                actionCreatePersonProjectAssociation(options);
            } else if (project.industry_project === 0 || project.operation === 'from-project') {
                // we get all the project details to move the data to industry projects
                options.project = project;
                getThisProjectAreas(options)
            }
        },
        { req, res, next }
    );
};