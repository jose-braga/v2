const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
//const notifications = require('../utilities/notifications');

function compareTwoStrings(first, second) {
    //https://github.com/aceakash/string-similarity/blob/master/compare-strings.js
    first = first.replace(/\s+/g, '')
    second = second.replace(/\s+/g, '')

    if (!first.length && !second.length) return 1;                   // if both are empty strings
    if (!first.length || !second.length) return 0;                   // if only one is empty string
    if (first === second) return 1;       							 // identical
    if (first.length === 1 && second.length === 1) return 0;         // both are 1-letter strings
    if (first.length < 2 || second.length < 2) return 0;			 // if either is a 1-letter string

    let firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
        const bigram = first.substr(i, 2);
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram) + 1
            : 1;

        firstBigrams.set(bigram, count);
    }

    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
        const bigram = second.substr(i, 2);
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram)
            : 0;

        if (count > 0) {
            firstBigrams.set(bigram, count - 1);
            intersectionSize++;
        }
    }

    return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

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
            + 'SELECT DISTINCT projects.*, project_types.name, call_types.name'
            + ' FROM projects'
            + ' LEFT JOIN project_types ON project_types.id = projects.project_type_id'
            + ' LEFT JOIN call_types ON call_types.id = projects.call_type_id'
            + ' LEFT JOIN people_projects ON people_projects.project_id = projects.id'
            + ' WHERE (projects.title LIKE ? OR projects.acronym LIKE ? OR projects.reference LIKE ?)'
            + ' AND people_projects.project_id NOT IN ('
            +       'SELECT project_id FROM people_projects WHERE person_id = ?'
            + ')'
            + ';'
        places.push(q, q, q, personID);
    } else {
        querySQL = querySQL
            + 'SELECT projects.*, project_types.name, call_types.name'
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
        + 'SELECT DISTINCT people_projects.person_id, people_projects.project_id'
        + ' FROM people_projects'
        + ' JOIN projects ON projects.id = people_projects.project_id'
        + ' WHERE people_projects.person_id = ?'
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
        + 'SELECT projects.*, project_types.name AS project_type_name, call_types.name AS call_type_name'
        + ' FROM projects'
        + ' LEFT JOIN project_types ON project_types.id = projects.project_type_id'
        + ' LEFT JOIN call_types ON call_types.id = projects.call_type_id'
        + ' WHERE projects.id = ?'
        + ';';
    places.push(project.project_id)
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
        + ' FROM project_areas'
        + ' WHERE project_id = ?'
        + ';';
    places.push(project.project_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let researchAreas = [];
            for (let ind in resQuery) {
                researchAreas.push(resQuery[ind].research_area);
            }
            options.projects[i].project_details.project_areas = researchAreas;
            return getProjectFundingEntities(options);
        },
        options);
}
var getProjectFundingEntities = function (options) {
    let { req, res, next, projects, i } = options;
    let project = projects[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT projects_funding_entities.id AS projects_funding_entities_id,'
        + ' projects_funding_entities.project_id, projects_funding_entities.funding_entity_id AS id,'
        + ' funding_agencies.official_name, funding_agencies.official_name_en, funding_agencies.short_name'
        + ' FROM projects_funding_entities'
        + ' JOIN funding_agencies ON funding_agencies.id = projects_funding_entities.funding_entity_id'
        + ' WHERE projects_funding_entities.project_id = ?'
        + ';';
    places.push(project.project_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.projects[i].project_details.funding_agencies = resQuery;
            return getProjectOtherFundingEntities(options);
        },
        options);
}
var getProjectOtherFundingEntities = function (options) {
    let { req, res, next, projects, i } = options;
    let project = projects[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT *'
        + ' FROM projects_other_funding_entities'
        + ' WHERE project_id = ?'
        + ';';
    places.push(project.project_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.projects[i].project_details.other_funding_agencies = resQuery[0];
            } else {
                options.projects[i].project_details.other_funding_agencies = {};
            }
            return getProjectManagementEntities(options);
        },
        options);
}
var getProjectManagementEntities = function (options) {
    let { req, res, next, projects, i } = options;
    let project = projects[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT projects_management_entities.*,'
        + ' management_entities.official_name, management_entities.short_name'
        + ' FROM projects_management_entities'
        + ' JOIN management_entities ON management_entities.id = projects_management_entities.management_entity_id'
        + ' WHERE projects_management_entities.project_id = ?'
        + ';';
    places.push(project.project_id)
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
        + 'SELECT labs_projects.*,'
        + ' labs.name AS lab_name, labs.short_name AS lab_short_name'
        + ' FROM labs_projects'
        + ' JOIN labs ON labs.id = labs_projects.lab_id'
        + ' WHERE labs_projects.project_id = ?'
        + ';';
    places.push(project.project_id)
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
        + 'SELECT people_projects.*,'
        + ' person_project_positions.name_en AS position_name_en,'
        + ' people.name AS person_name, people.colloquial_name AS person_colloquial_name'
        + ' FROM people_projects'
        + ' LEFT JOIN person_project_positions ON person_project_positions.id = people_projects.position_id'
        + ' JOIN people ON people.id = people_projects.person_id'
        + ' WHERE people_projects.project_id = ?'
        + ';';
    places.push(project.project_id)
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

var actionGetProjectInfo = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let projectID = req.params.projectID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT people_projects.person_id, people_projects.project_id'
        + ' FROM people_projects'
        + ' JOIN projects ON projects.id = people_projects.project_id'
        + ' WHERE people_projects.person_id = ? AND people_projects.project_id = ?'
        + ';';
    places.push(personID, projectID)
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
module.exports.getProjectInfo = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetProjectInfo(options) },
        { req, res, next }
    );
};

var actionCreateProject = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    let dateStart = '';
    let dateEnd = '';
    if (data['start-date'] !== null && data['start-date'] !== undefined) {
        if (data['start-date'].year !== null && data['start-date'].year !== undefined) {
            if (data['start-date'].year.value !== null && data['start-date'].year.value !== undefined) {
                dateStart = dateStart + data['start-date'].year.value;
            }
        }
        if (data['start-date'].month !== null && data['start-date'].month !== undefined) {
            if (data['start-date'].month.value !== null && data['start-date'].month.value !== undefined) {
                dateStart = dateStart + '-' + data['start-date'].month.value;
            } else {
                dateStart = dateStart + '-01';
            }
        } else {
            dateStart = dateStart + '-01';
        }
        if (data['start-date'].day !== null && data['start-date'].day !== undefined) {
            if (data['start-date'].day.value !== null && data['start-date'].day.value !== undefined) {
                dateStart = dateStart + '-' + data['start-date'].day.value;
            } else {
                dateStart = dateStart + '-01';
            }
        } else {
            dateStart = dateStart + '-01';
        }
    }
    if (data['end-date'] !== null && data['end-date'] !== undefined) {
        if (data['end-date'].year !== null && data['end-date'].year !== undefined) {
            if (data['end-date'].year.value !== null && data['end-date'].year.value !== undefined) {
                dateEnd = dateEnd + data['end-date'].year.value;
            }
        }
        let month = '12';
        if (data['end-date'].month !== null && data['end-date'].month !== undefined) {
            if (data['end-date'].month.value !== null && data['end-date'].month.value !== undefined) {
                dateEnd = dateEnd + '-' + data['end-date'].month.value;
                month = data['end-date'].month.value
            } else {
                dateEnd = dateEnd + '-12';
            }
        } else {
            dateEnd = dateEnd + '-12';
        }
        if (data['end-date'].day !== null && data['end-date'].day !== undefined) {
            if (data['end-date'].day.value !== null && data['end-date'].day.value !== undefined) {
                dateEnd = dateEnd + '-' + data['end-date'].day.value;
            } else if (month === '01' || month === '03' || month === '05'
                        || month === '07' || month === '08' || month === '10'
                        || month === '12') {
                dateEnd = dateEnd + '-31';
            } else if (month === '04' || month === '06' || month === '09'
                        || month === '11') {
                dateEnd = dateEnd + '-30';
            } else if (month === '02') {
                dateEnd = dateEnd + '-28';
            }
        } else if (month === '01' || month === '03' || month === '05'
                || month === '07' || month === '08' || month === '10'
                || month === '12')
        {
            dateEnd = dateEnd + '-31';
        } else if (month === '04' || month === '06' || month === '09'
                || month === '11')
        {
            dateEnd = dateEnd + '-30';
        } else if (month === '02') {
            dateEnd = dateEnd + '-28';
        }
    }
    if (dateStart === '') dateStart = null;
    if (dateEnd === '') dateEnd = null;
    let amount = null;
    if (data.amount !== null && data.amount !== undefined) {
        if (data.amount.value !== null && data.amount.value !== undefined) {
            amount = data.amount.value;
        }
    }
    let reference = null;
    let website = null;
    if (data['external-ids'] !== null && data['external-ids'] !== undefined) {
        if (data['external-ids']['external-id'] !== null && data['external-ids']['external-id'] !== undefined
            && data['external-ids']['external-id'].length > 0
        ) {
            for (let ind in data['external-ids']['external-id']) {
                let extID = data['external-ids']['external-id'][ind];
                if (extID['external-id-value'] !== null && extID['external-id-value'] !== undefined) {
                    if (extID['external-id-url'] === null
                        || (extID['external-id-url'] !== null && extID['external-id-url'].value === null)) {
                        reference = extID['external-id-value'];
                    }
                }
                if (extID['external-id-url'] !== null && extID['external-id-url'] !== undefined) {
                    if (extID['external-id-url'].value !== null && extID['external-id-url'].value !== undefined) {
                        website = extID['external-id-url'].value;
                    }
                }
            }
        }
    }
    let organization = null;
    if (data.organization !== null && data.organization !== undefined) {
        if (data.organization.name !== null && data.organization.name !== undefined) {
            organization = data.organization.name;
        }
    }
    options.organizationName = organization;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO projects'
        + ' (title, reference, start, end, global_amount, website)'
        +' VALUES (?,?,?,?,?,?);';
    places.push(
        data.title,
        reference,
        dateStart,
        dateEnd,
        amount,
        website
    )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.projectID = resQuery.insertId;
            return getFundingAgencies(options, addProjectFundingAgency);
        },
        options);
};
var getFundingAgencies = function (options, callback) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM funding_agencies;';
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.fundingAgencies = resQuery;
            return callback(options);
        },
        options);

};
var addProjectFundingAgency = function (options) {
    let { req, res, next, projectID, fundingAgencies, organizationName } = options;
    let fundingAgencyID = null;
    if (organizationName !== undefined && organizationName !== null
        && organizationName !== ''
    ) {
        for (let ind in fundingAgencies) {
            if (compareTwoStrings(fundingAgencies[ind].official_name, organizationName) > 0.95
                || ( fundingAgencies[ind].official_name_en !== null && fundingAgencies[ind].official_name_en !== ''
                    &&
                    compareTwoStrings(fundingAgencies[ind].official_name_en, organizationName) > 0.95
                )
                || ( fundingAgencies[ind].short_name !== null && fundingAgencies[ind].short_name !== ''
                    &&
                    compareTwoStrings(fundingAgencies[ind].short_name, organizationName) > 0.95
                )
            ) {
                fundingAgencyID = fundingAgencies[ind].id;
                break;
            }
        }
        if (fundingAgencyID === null) {
            return addProjectOtherFundingAgency(options);
        } else {
            var querySQL = '';
            var places = [];
            querySQL = querySQL
                + 'INSERT INTO projects_funding_entities'
                + ' (project_id, funding_entity_id)'
                +' VALUES (?,?);';
            places.push(
                projectID,
                fundingAgencyID
            )
            return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => {
                    return addPersonProject(options);
                },
                options);
        }
    } else {
        return addPersonProject(options);
    }
};
var addProjectOtherFundingAgency = function (options) {
    let { req, res, next, projectID, organizationName } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO projects_other_funding_entities'
        + ' (project_id, name)'
        +' VALUES (?,?);';
    places.push(
        projectID,
        organizationName
    )
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return addPersonProject(options);
        },
        options);
};
var addPersonProject = function (options) {
    let { req, res, next, projectID } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO people_projects'
        + ' (person_id, project_id)'
        +' VALUES (?,?);';
    places.push(
        personID,
        projectID
    );
    return sql.makeSQLOperation(req, res, querySQL, places)
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
    if (data.start !== null && data.start !== undefined && data.start !== '') {
        start = data.start
    }
    if (data.end !== null && data.end !== undefined && data.end !== '') {
        end = data.end
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE projects'
        + ' SET project_type_id = ?,'
        + ' call_type_id = ?,'
        + ' title = ?,'
        + ' acronym = ?,'
        + ' reference = ?,'
        + ' start = ?,'
        + ' end = ?,'
        + ' global_amount = ?,'
        + ' website = ?,'
        + ' notes = ?'
        + ' WHERE id = ?'
        +';';
    places.push(
        data.project_type_id,
        data.call_type_id,
        data.title,
        data.acronym,
        data.reference,
        start,
        end,
        data.global_amount,
        data.website,
        data.notes,
        projectID
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteProjectFundingAgencies(options);
        },
        options);
};
var deleteProjectFundingAgencies = function (options) {
    let { req, res, next } = options;
    //let personID = req.params.personID;
    let projectID = req.params.projectID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM projects_funding_entities WHERE project_id = ?;'
    places.push(projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (req.body.data.project_details.funding_agencies.length > 0) {
                options.i = 0;
                return insertProjectFundingAgencies(options);
            } else {
                return deleteProjectManagementEntities(options);
            }
        },
        options);
};
var insertProjectFundingAgencies = function (options) {
    let { req, res, next, i } = options;
    //let personID = req.params.personID;
    let projectID = req.params.projectID;
    let data = req.body.data.project_details.funding_agencies[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO projects_funding_entities'
        + ' (project_id, funding_entity_id)'
        + ' VALUES (?, ?)'
        +';';
    places.push(
        projectID,
        data.id
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.project_details.funding_agencies.length) {
                options.i = i + 1;
                return insertProjectFundingAgencies(options);
            } else {
                return deleteProjectManagementEntities(options);
            }
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
        + 'DELETE FROM projects_management_entities WHERE project_id = ?;'
    places.push(projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (req.body.data.project_details.management_entities.management_entity_id !== undefined) {
                return insertProjectManagementEntities(options);
            } else {
                return deleteProjectOtherFundingAgencies(options);
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
        + 'INSERT INTO projects_management_entities'
        + ' (project_id, management_entity_id, amount)'
        + ' VALUES (?, ?, ?)'
        +';';
    places.push(
        projectID,
        data.management_entity_id,
        data.amount
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteProjectOtherFundingAgencies(options);
        },
        options);

};
var deleteProjectOtherFundingAgencies = function (options) {
    let { req, res, next } = options;
    //let personID = req.params.personID;
    let projectID = req.params.projectID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM projects_other_funding_entities WHERE project_id = ?;'
    places.push(projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (req.body.data.project_details.other_funding_agencies.name !== ''
                && req.body.data.project_details.other_funding_agencies.name !== null
                && req.body.data.project_details.other_funding_agencies.name !== undefined
                && req.body.data.project_details.funding_agencies.length === 0
            ) {
                return insertProjectOtherFundingAgencies(options);
            } else {
                return deleteProjectAreas(options);
            }
        },
        options);
};
var insertProjectOtherFundingAgencies = function (options) {
    let { req, res, next } = options;
    //let personID = req.params.personID;
    let projectID = req.params.projectID;
    let data = req.body.data.project_details.other_funding_agencies;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO projects_other_funding_entities'
        + ' (project_id, name)'
        + ' VALUES (?, ?)'
        +';';
    places.push(
        projectID,
        data.name
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteProjectAreas(options);
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
        + 'DELETE FROM project_areas WHERE project_id = ?;'
    places.push(projectID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (req.body.data.project_details.project_areas.length > 0) {
                options.i = 0;
                return insertProjectAreas(options);
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
        + 'INSERT INTO project_areas'
        + ' (project_id, research_area)'
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
        + 'DELETE FROM people_projects WHERE person_id = ? AND project_id = ?;'
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
            + 'INSERT INTO people_projects'
            + ' (person_id, position_id, project_id, valid_from, valid_until)'
            + ' VALUES (?, ?, ?, ?, ?)'
            +';';
        places.push(
            data.person_id,
            data.position_id,
            projectID,
            data.valid_from,
            data.valid_until
        );
    } else {
        querySQL = querySQL
            + 'UPDATE people_projects'
            + ' SET position_id = ?,'
            + ' valid_from = ?,'
            + ' valid_until = ?'
            + ' WHERE person_id = ? AND project_id = ?'
            +';';
        places.push(
            data.position_id,
            data.valid_from,
            data.valid_until,
            data.person_id,
            projectID,
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
        + 'DELETE FROM labs_projects WHERE lab_id = ? AND project_id = ?;'
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
            + 'INSERT INTO labs_projects'
            + ' (lab_id, project_id, valid_from, valid_until)'
            + ' VALUES (?, ?, ?, ?)'
            +';';
        places.push(
            data.lab_id,
            projectID,
            data.valid_from,
            data.valid_until
        );
    } else {
        querySQL = querySQL
            + 'UPDATE labs_projects'
            + ' SET valid_from = ?,'
            + ' valid_until = ?'
            + ' WHERE lab_id = ? AND project_id = ?'
            +';';
        places.push(
            data.valid_from,
            data.valid_until,
            data.lab_id,
            projectID
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
        + 'INSERT INTO people_projects'
        + ' (person_id, project_id)'
        + ' SELECT ?, ? FROM DUAL'
        + ' WHERE NOT EXISTS (SELECT *'
        +       ' FROM people_projects'
        +       ' WHERE person_id = ? AND project_id = ?'
        +    ');';
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

/*
module.exports.deletePersonProjectAssociation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetAllProjects(options) },
        { req, res, next }
    );
};
*/