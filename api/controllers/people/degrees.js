const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

/**
 * For reading degrees data
 */

var actionGetDegrees = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from degrees_people'
                        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => { processDegreesDetails(resQuery, options) },
        options);
};

var processDegreesDetails = function (resQuery, options) {
    let { req, res, next } = options;
    options.i = 0;
    options.degrees = resQuery;
    if (resQuery.length > 0) {
        return getDegreesSupervisors(options)
    } else {
        responses.sendJSONResponseOptions({
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": []
            }
        });
        return;
    }
};

var getDegreesSupervisors = function (options) {
    let { req, res, next, degrees, i } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT degrees_supervisors.*, people.colloquial_name '
                        + ' FROM degrees_supervisors'
                        + ' LEFT JOIN people on people.id = degrees_supervisors.supervisor_id'
                        + ' WHERE degree_person_id = ?';
    places.push(degrees[i].id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => { processDegreesSupervisors(resQuery, options) },
        options);
};

var processDegreesSupervisors = function (resQuery, options) {
    let { req, res, next, degrees, i } = options;
    options.degrees[i].supervisors = [];
    if (resQuery.length > 0) {
        options.degrees[i].supervisors = resQuery;
    }
    if (i + 1 < degrees.length) {
        options.i = i + 1;
        return getDegreesSupervisors(options);
    } else {
        options.i = 0;
        return getDegreesExternalSupervisors(options);
    }
};

var getDegreesExternalSupervisors = function (options) {
    let { req, res, next, degrees, i } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM degrees_external_supervisors'
                        + ' WHERE degree_person_id = ?';
    places.push(degrees[i].id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => { processDegreesExternalSupervisors(resQuery, options) },
        options);
};

var processDegreesExternalSupervisors = function (resQuery, options) {
    let { req, res, next, degrees, i } = options;
    options.degrees[i].external_supervisors = [];
    if (resQuery.length > 0) {
        options.degrees[i].external_supervisors = resQuery;
    }
    if (i + 1 < degrees.length) {
        options.i = i + 1;
        return getDegreesExternalSupervisors(options);
    } else {
        responses.sendJSONResponseOptions({
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": degrees.length,
                "result": options.degrees
            }
        });
        return;
    }
};

module.exports.getDegrees = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetDegrees(options) },
        { req, res, next }
    );
};

/**
 * For changing degrees data
 */

var actionCreateDegrees = function (options) {
    let { req, res, next, i } = options;
    let personID = req.params.personID;
    let personDegreeID = req.params.degreeID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO degrees_people'
        + ' (person_id, degree_id, area, institution, start, estimate_end, end, title, program)'
        + ' VALUES (?,?,?,?,?,?,?,?,?);';
    places.push(personID,
        data.degree_id,
        data.area,
        data.institution,
        data.start,
        data.estimate_end,
        data.end,
        data.title,
        data.program
        );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => { getPeopleDegreesID(resQuery, options) },
        options);
};

var getPeopleDegreesID = function (resQuery, options) {
    let { req, res, next } = options;
    let personDegreeID = resQuery.insertId;
    let data = req.body.data;

    if (data.supervisors.length > 0) {
        return actionCreateDegreesCreateSupervisors({ req, res, next, personDegreeID, i: 0 });
    } else if (data.external_supervisors.length > 0) {
        return actionCreateDegreesCreateExtSupervisors({ req, res, next, personDegreeID, i: 0 });
    } else {
        responses.sendJSONResponseOptions({
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "message": "success",
            }
        });
    }
};

var actionCreateDegreesCreateSupervisors = function (options) {
    let { req, res, next, personDegreeID, i } = options;
    let data = req.body.data.supervisors[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO degrees_supervisors'
        + ' (degree_person_id, supervisor_type_id, supervisor_id, valid_from, valid_until)'
        + ' VALUES (?,?,?,?,?);';
    places.push(personDegreeID,
        data.supervisor_type_id,
        data.supervisor_id,
        data.valid_from,
        data.valid_until);
    if (i + 1 < req.body.data.supervisors.length) {
        return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionCreateDegreesCreateSupervisors(options) },
                { req, res, next, personDegreeID,i: i + 1 });
    } else if (req.body.data.external_supervisors.length > 0) {
        return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionCreateDegreesCreateExtSupervisors(options) },
                { req, res, next, personDegreeID, i: 0 });
    } else {
        return sql.makeSQLOperation(req, res, querySQL, places)
    }
};

var actionCreateDegreesCreateExtSupervisors = function (options) {
    let { req, res, next, personDegreeID, i } = options;
    let data = req.body.data.external_supervisors[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO degrees_external_supervisors'
        + ' (degree_person_id, supervisor_type_id, colloquial_name, organization, valid_from, valid_until)'
        + ' VALUES (?,?,?,?,?,?);';
    places.push(personDegreeID,
        data.supervisor_type_id,
        data.colloquial_name,
        data.organization,
        data.valid_from,
        data.valid_until);
    if (i +1 < req.body.data.external_supervisors.length) {
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => { actionCreateDegreesCreateExtSupervisors(options) },
            { req, res, next, personDegreeID, i: i + 1 });
    } else {
        return sql.makeSQLOperation(req, res, querySQL, places)
    }

};

var actionDeleteDegreesDeleteSupervisors = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let personDegreeID = req.params.degreeID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM degrees_supervisors WHERE degree_person_id = ?;';
    places.push(personDegreeID)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => { actionDeleteDegreesDeleteExtSupervisors(options) },
        options);    
};

var actionDeleteDegreesDeleteExtSupervisors = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let personDegreeID = req.params.degreeID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM degrees_external_supervisors WHERE degree_person_id = ?;';
    places.push(personDegreeID)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => { actionDeleteDegrees(options) },
        options);
};

var actionDeleteDegrees = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let personDegreeID = req.params.degreeID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM degrees_people WHERE id = ?;';
    places.push(personDegreeID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};

var actionUpdateDegrees = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let personDegreeID = req.params.degreeID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE degrees_people'
                        + ' SET degree_id = ?,'
                        + ' area = ?,'
                        + ' institution = ?,'
                        + ' start = ?,'
                        + ' estimate_end = ?,'
                        + ' end = ?,'
                        + ' title = ?,'
                        + ' program = ?'
                        + ' WHERE id = ? AND person_id = ?;';
    places.push(data.degree_id,
        data.area,
        data.institution,
        data.start,
        data.estimate_end,
        data.end,
        data.title,
        data.program,
        personDegreeID, personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => { processSupervisors(resQuery, options) },
        options);
};

var processSupervisors = function (resQuery, options) {
    let { req, res, next } = options;
    let data = req.body.data;
    if (data.supervisors.length > 0) {
        if (data.supervisors[0].id === 'new') {
            return actionCreateSupervisors({ req, res, next, i: 0 });
        } else {
            return actionUpdateSupervisors({ req, res, next, i: 0 });
        }
    } else {
        if (data.deleteSupervisors.length > 0) {
            return actionDeleteSupervisors({ req, res, next, i: 0 });
        } else if (data.external_supervisors.length > 0) {
            if (data.external_supervisors[0].id === 'new') {
                return actionCreateExtSupervisors({ req, res, next, i: 0 });
            } else {
                return actionUpdateExtSupervisors({ req, res, next, i: 0 });
            }

        } else if (data.external_supervisors.length === 0 
                && data.deleteExtSupervisors.length > 0) {
            return actionDeleteExtSupervisors({ req, res, next, i: 0 });
        } else {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200, "message": "success",
                }
            });             
        }
    }
};

var actionUpdateSupervisors = function (options) {
    let { req, res, next, i } = options;
    let data = req.body.data.supervisors[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE degrees_supervisors'
                        + ' SET supervisor_type_id = ?,'
                        + ' supervisor_id = ?,'
                        + ' valid_from = ?,'
                        + ' valid_until = ?'
                        + ' WHERE id = ?;';
    places.push(data.supervisor_type_id,
                data.supervisor_id,
                data.valid_from,
                data.valid_until,
                data.id);
    if (i + 1 < req.body.data.supervisors.length) {
        if (req.body.data.supervisors[i+1].id === 'new') {
            return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionCreateSupervisors(options) },
                { req, res, next, i: i + 1 });
        } else {
            return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionUpdateSupervisors(options) },
                { req, res, next, i: i + 1 });
        }
        
    } else {
        if (req.body.data.deleteSupervisors.length > 0) {
            return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionDeleteSupervisors(options) },
                { req, res, next, i: 0 });            
        } else if (req.body.data.external_supervisors.length > 0) {
            if (req.body.data.external_supervisors[0].id === 'new') {
                return sql.makeSQLOperation(req, res, querySQL, places,
                    (options) => { actionCreateExtSupervisors(options) },
                    { req, res, next, i: 0 });                
            } else {
                return sql.makeSQLOperation(req, res, querySQL, places,
                    (options) => { actionUpdateExtSupervisors(options) },
                    { req, res, next, i: 0 });                
            }
        } else if (req.body.data.external_supervisors.length === 0
                && req.body.data.deleteExtSupervisors.length > 0) {
            return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionDeleteExtSupervisors(options) },
                { req, res, next, i: 0 });
        } else {
            return sql.makeSQLOperation(req, res, querySQL, places)
        }
    }
};

var actionCreateSupervisors = function (options) {
    let { req, res, next, i } = options;
    let personDegreeID = req.params.degreeID;
    let data = req.body.data.supervisors[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO degrees_supervisors'
                        + ' (degree_person_id, supervisor_type_id, supervisor_id, valid_from, valid_until)'
                        + ' VALUES (?,?,?,?,?);';
    places.push(personDegreeID,        
        data.supervisor_type_id,
        data.supervisor_id,
        data.valid_from,
        data.valid_until);
    if (i + 1 < req.body.data.supervisors.length) {
        if (req.body.data.supervisors[i + 1].id === 'new') {
            return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionCreateSupervisors(options) },
                { req, res, next, i: i + 1 });
        } else {
            return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionUpdateSupervisors(options) },
                { req, res, next, i: i + 1 });
        }

    } else {
        if (req.body.data.deleteSupervisors.length > 0) {
            return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionDeleteSupervisors(options) },
                { req, res, next, i: 0 });
        } else if (req.body.data.external_supervisors.length > 0) {
            if (req.body.data.external_supervisors[0].id === 'new') {
                return sql.makeSQLOperation(req, res, querySQL, places,
                    (options) => { actionCreateExtSupervisors(options) },
                    { req, res, next, i: 0 });
            } else {
                return sql.makeSQLOperation(req, res, querySQL, places,
                    (options) => { actionUpdateExtSupervisors(options) },
                    { req, res, next, i: 0 });
            }
        } else if (req.body.data.external_supervisors.length === 0
            && req.body.data.deleteExtSupervisors.length > 0) {
            return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionDeleteExtSupervisors(options) },
                { req, res, next, i: 0 });
        } else {
            return sql.makeSQLOperation(req, res, querySQL, places)
        }
    }
};

var actionDeleteSupervisors = function (options) {
    let { req, res, next, i } = options;
    let data = req.body.data.deleteSupervisors;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM degrees_supervisors' 
                        + ' WHERE id = ?;';
    places.push(data[i]);
    if (i + 1 < req.body.data.deleteSupervisors.length) {
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => { actionDeleteSupervisors(options) },
            { req, res, next, i: i + 1 });
    } else if (req.body.data.external_supervisors.length > 0) {
        if (req.body.data.external_supervisors[0].id === 'new') {
            return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionCreateExtSupervisors(options) },
                { req, res, next, i: 0 });
        } else {
            return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionUpdateExtSupervisors(options) },
                { req, res, next, i: 0 });
        }
    } else if (req.body.data.external_supervisors.length === 0
        && req.body.data.deleteExtSupervisors.length > 0) {
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => { actionDeleteExtSupervisors(options) },
            { req, res, next, i: 0 });
    } else {
        return sql.makeSQLOperation(req, res, querySQL, places)
    }
};

var actionUpdateExtSupervisors = function (options) {
    let { req, res, next, i } = options;
    let data = req.body.data.external_supervisors[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE degrees_external_supervisors'
                        + ' SET supervisor_type_id = ?,'
                        + ' colloquial_name = ?,'
                        + ' organization = ?,'
                        + ' valid_from = ?,'
                        + ' valid_until = ?'
                        + ' WHERE id = ?;';
    places.push(data.supervisor_type_id,
        data.colloquial_name,
        data.organization,
        data.valid_from,
        data.valid_until,
        data.id);
    if (i+ 1 < req.body.data.external_supervisors.length) {
        if (req.body.data.external_supervisors[i+1].id === 'new') {
            return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionCreateExtSupervisors(options) },
                { req, res, next, i: i + 1 });
        } else {
            return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionUpdateExtSupervisors(options) },
                { req, res, next, i: i + 1 });
        }
    } else if (req.body.data.deleteExtSupervisors.length > 0) {
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => { actionDeleteExtSupervisors(options) },
            { req, res, next, i: 0 });
    } else {
        return sql.makeSQLOperation(req, res, querySQL, places)
    }
};

var actionCreateExtSupervisors = function (options) {
    let { req, res, next, i } = options;
    let personDegreeID = req.params.degreeID;
    let data = req.body.data.external_supervisors[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO degrees_external_supervisors'
                        + ' (degree_person_id, supervisor_type_id, colloquial_name, organization, valid_from, valid_until)'
                        + ' VALUES (?,?,?,?,?,?);';
    places.push(personDegreeID,
        data.supervisor_type_id,
        data.colloquial_name,
        data.organization,
        data.valid_from,
        data.valid_until);
    if (i + 1 < req.body.data.external_supervisors.length) {
        if (req.body.data.external_supervisors[i + 1].id === 'new') {
            return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionCreateExtSupervisors(options) },
                { req, res, next, i: i + 1 });
        } else {
            return sql.makeSQLOperation(req, res, querySQL, places,
                (options) => { actionUpdateExtSupervisors(options) },
                { req, res, next, i: i + 1 });
        }
    } else if (req.body.data.deleteExtSupervisors.length > 0) {
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => { actionDeleteExtSupervisors(options) },
            { req, res, next, i: 0 });
    } else {
        return sql.makeSQLOperation(req, res, querySQL, places)
    }
};

var actionDeleteExtSupervisors = function (options) {
    let { req, res, next, i } = options;
    let data = req.body.data.deleteExtSupervisors;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM degrees_external_supervisors'
                        + ' WHERE id = ?;';
    places.push(data[i]);
    if (i + 1 < req.body.data.deleteExtSupervisors.length) {
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => { actionDeleteExtSupervisors(options) },
            { req, res, next, i: i + 1 });
    } else {
        return sql.makeSQLOperation(req, res, querySQL, places)
    }
};

module.exports.updateDegrees = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateDegrees(options) },
        { req, res, next }
    );
};

module.exports.deleteDegrees = function (req, res, next) {
    // we start by deleting first supervisors, then external supervisors
    // only then we delete the degree
    permissions.checkPermissions(
        (options) => { actionDeleteDegreesDeleteSupervisors(options) },
        { req, res, next }
    );
};

module.exports.createDegrees = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateDegrees(options) },
        { req, res, next }
    );
};