const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

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
            + 'SELECT DISTINCT training_networks.*'
            + ' FROM training_networks'
            + ' LEFT JOIN people_training_networks ON people_training_networks.training_id = training_networks.id'
            + ' WHERE (training_networks.title LIKE ? OR training_networks.acronym LIKE ? OR training_networks.reference LIKE ?)'
            + ' AND training_networks.id NOT IN ('
            +       'SELECT training_id FROM people_training_networks WHERE person_id = ?'
            + ')'
            + ';'
        places.push(q, q, q, personID);
    } else {
        querySQL = querySQL
            + 'SELECT *'
            + ' FROM training_networks'
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
        + 'SELECT DISTINCT people_training_networks.person_id, people_training_networks.training_id'
        + ' FROM people_training_networks'
        + ' JOIN training_networks ON training_networks.id = people_training_networks.training_id'
        + ' WHERE people_training_networks.person_id = ?'
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
        + 'SELECT *'
        + ' FROM training_networks'
        + ' WHERE id = ?'
        + ';';
    places.push(project.training_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.projects[i].project_details = resQuery[0];
            } else {
                options.projects[i].project_details = {};
            }
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
        + 'SELECT training_networks_management_entities.*,'
        + ' management_entities.official_name, management_entities.short_name'
        + ' FROM training_networks_management_entities'
        + ' JOIN management_entities ON management_entities.id = training_networks_management_entities.management_entity_id'
        + ' WHERE training_networks_management_entities.training_id = ?'
        + ';';
    places.push(project.training_id)
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
};
var getLabProjectDetails = function (options) {
    let { req, res, next, projects, i } = options;
    let personID = req.params.personID;
    let project = projects[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT labs_training_networks.*,'
        + ' labs.name AS lab_name, labs.short_name AS lab_short_name'
        + ' FROM labs_training_networks'
        + ' JOIN labs ON labs.id = labs_training_networks.lab_id'
        + ' WHERE labs_training_networks.training_id = ?'
        + ';';
    places.push(project.training_id)
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
        + 'SELECT people_training_networks.*,'
        + ' people.name AS person_name, people.colloquial_name AS person_colloquial_name'
        + ' FROM people_training_networks'
        + ' JOIN people ON people.id = people_training_networks.person_id'
        + ' WHERE people_training_networks.training_id = ?'
        + ';';
    places.push(project.training_id)
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
    if (data.global_amount === '') data.global_amount = null;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO training_networks'
        + ' (network_name, title, acronym, reference, global_amount, coordinating_entity, country_id, start, end, website, notes)'
        +' VALUES (?,?,?,?,?,?,?,?,?,?,?);';
    places.push(
        data.network_name,
        data.title,
        data.acronym,
        data.reference,
        data.global_amount,
        data.coordinating_entity,
        data.country_id,
        data.start,
        data.end,
        data.website,
        data.notes
    )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.networkID = resQuery.insertId;
            return addProjectManagementEntity(options);
        },
        options);
};
var addProjectManagementEntity = function (options) {
    let { req, res, next, networkID } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO training_networks_management_entities'
        + ' (training_id, management_entity_id, amount)'
        +' VALUES (?,?,?);';
    places.push(
        networkID,
        data.management_entity_id,
        data.amount
    )
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            options.i = 0;
            if (data.person_details !== undefined
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
    let { req, res, next, networkID, i } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO people_training_networks'
        + ' (person_id, role_id, training_id)'
        +' VALUES (?,?,?);';
    places.push(
        data.person_details[i].person_id,
        data.person_details[i].role_id,
        networkID
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
    let { req, res, next, networkID, i } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO labs_training_networks'
        + ' (lab_id, training_id)'
        +' VALUES (?,?);';
    places.push(
        data.labs_details[i].lab_id,
        networkID
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
    let global_amount = null;
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
        + 'UPDATE training_networks'
        + ' SET network_name = ?,'
        + ' title = ?,'
        + ' acronym = ?,'
        + ' reference = ?,'
        + ' coordinating_entity = ?,'
        + ' country_id = ?,'
        + ' start = ?,'
        + ' end = ?,'
        + ' global_amount = ?,'
        + ' website = ?,'
        + ' notes = ?'
        + ' WHERE id = ?'
        +';';
    places.push(
        data.network_name,
        data.title,
        data.acronym,
        data.reference,
        data.coordinating_entity,
        data.country_id,
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
        + 'DELETE FROM training_networks_management_entities WHERE training_id = ?;'
    places.push(projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (req.body.data.project_details.management_entities.management_entity_id !== undefined) {
                return insertProjectManagementEntities(options);
            } else {
                if (req.body.data.toDeletePerson.length > 0) {
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
        + 'INSERT INTO training_networks_management_entities'
        + ' (training_id, management_entity_id, amount)'
        + ' VALUES (?, ?, ?)'
        +';';
    places.push(
        projectID,
        data.management_entity_id,
        data.amount
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (req.body.data.toDeletePerson.length > 0) {
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
        + 'DELETE FROM people_training_networks WHERE person_id = ? AND training_id = ?;'
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
            + 'INSERT INTO people_training_networks'
            + ' (person_id, training_id)'
            + ' VALUES (?, ?)'
            +';';
        places.push(
            data.person_id,
            projectID,
        );
    } else {
        querySQL = querySQL
            + 'UPDATE people_training_networks'
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
        + 'DELETE FROM labs_training_networks WHERE lab_id = ? AND training_id = ?;'
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
            + 'INSERT INTO labs_training_networks'
            + ' (lab_id, training_id)'
            + ' VALUES (?, ?)'
            +';';
        places.push(
            data.lab_id,
            projectID
        );
    } else {
        querySQL = querySQL
            + 'UPDATE labs_training_networks'
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
        (options) => { actionUpdateProject(options) },
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
        + 'INSERT INTO people_training_networks'
        + ' (person_id, training_id)'
        + ' SELECT ?, ? FROM DUAL'
        + ' WHERE NOT EXISTS (SELECT *'
        +       ' FROM people_training_networks'
        +       ' WHERE person_id = ? AND training_id = ?'
        +   ');';
    places.push(
        personID,
        projectID,
        personID,
        projectID
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createPersonProjectAssociation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreatePersonProjectAssociation(options) },
        { req, res, next }
    );
};