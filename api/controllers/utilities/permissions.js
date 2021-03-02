const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const time = require('../utilities/time');

var hasAccessEndpoint = function (reqMethod, reqEndpoint, permissionsEndpoints) {
    reqEndpoint = reqEndpoint.replace('/api','');
    // remove the query part from the request path
    let reqEndpointFinal = reqEndpoint.split('?')[0];
    for (let ind in permissionsEndpoints) {
        let endpointPerm = permissionsEndpoints[ind].endpoint_url;
        let allow_all_subpaths = permissionsEndpoints[ind].allow_all_subpaths;
        endpointPerm = endpointPerm.replace(/\*/g, '\\d+');
        if (!allow_all_subpaths) {
            let endpointRegex = new RegExp('^' + endpointPerm + '$')
            // the request endpoint must match
            // the endpoints in the permissions and its method
            if (endpointRegex.test(reqEndpointFinal)
                && permissionsEndpoints[ind].method_name === reqMethod) {
                return true;
            }
        } else {
            let endpointRegex = new RegExp('^' + endpointPerm)
            // the request endpoint must match
            // the endpoints in the permissions and its method
            if (endpointRegex.test(reqEndpointFinal)
                && permissionsEndpoints[ind].method_name === reqMethod) {
                return true;
            }
        }
    }
    return false;
};

//var TARGET_MANAGER_PERMISSION_LEVEL = 3;
//var TEAM_MANAGER_PERMISSION_LEVEL = 4;
//var STANDARD_USER_PERMISSION_LEVEL = 5;


module.exports.checkResourceLocation = function (callback, callbackOptions) {
    // this works for resources that have personID in endpoint path
    if (callbackOptions !== undefined) {
        let { req, res, next } = callbackOptions;
        let unitID = req.params.unitID;
        let cityID = req.params.cityID;
        let personID = req.params.personID;
        let querySQL = '';
        let places = [];
        if (unitID !== undefined || cityID !== undefined) {
            let joinCity = ' JOIN people_institution_city ON people_institution_city.person_id = people.id'
            let whereCity = ' people_institution_city.city_id = ?';
            let wherePerson = ' AND people.id = ?'
            let preamble = 'SELECT people.id AS person_id, people.user_id, people.name, people.colloquial_name'
                        + ' FROM people'
            querySQL = querySQL + preamble;
            if (unitID !== undefined) {
                querySQL = querySQL
                    + ' JOIN people_labs ON people_labs.person_id = people.id'
                    + ' JOIN labs ON labs.id = people_labs.lab_id'
                    + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
                    + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
                    + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
            }
            if (cityID !== undefined) {
                querySQL = querySQL+ joinCity;
            }
            if (unitID !== undefined) {
                querySQL = querySQL + ' WHERE groups_units.unit_id = ?';
                places.push(unitID);
                if (cityID !== undefined) {
                    querySQL = querySQL + ' AND' + whereCity;
                    places.push(cityID);
                }
            } else if (cityID !== undefined) {
                querySQL = querySQL + ' WHERE' + whereCity;
                places.push(cityID);
            }
            querySQL = querySQL + wherePerson;
            places.push(personID);
            querySQL = querySQL + ' UNION ' + preamble;
            if (unitID !== undefined) {
                querySQL = querySQL
                + ' JOIN technicians ON technicians.person_id = people.id'
                + ' JOIN technicians_units ON technicians_units.technician_id = technicians.id'
            }
            if (cityID !== undefined) {
                querySQL = querySQL+ joinCity;
            }
            if (unitID !== undefined) {
                querySQL = querySQL + ' WHERE technicians_units.unit_id = ?';
                places.push(unitID);
                if (cityID !== undefined) {
                    querySQL = querySQL + ' AND' + whereCity;
                    places.push(cityID);
                }
            } else if (cityID !== undefined) {
                querySQL = querySQL + ' WHERE' + whereCity;
                places.push(cityID);
            }
            querySQL = querySQL + wherePerson;
            places.push(personID);
            querySQL = querySQL + ' UNION ' + preamble;
            if (unitID !== undefined) {
                querySQL = querySQL
                    + ' JOIN science_managers ON science_managers.person_id = people.id'
                    + ' JOIN science_managers_units ON science_managers_units.science_manager_id = science_managers.id'
            }
            if (cityID !== undefined) {
                querySQL = querySQL+ joinCity;
            }
            if (unitID !== undefined) {
                querySQL = querySQL + ' WHERE science_managers_units.unit_id = ?';
                places.push(unitID);
                if (cityID !== undefined) {
                    querySQL = querySQL + ' AND' + whereCity;
                    places.push(cityID);
                }
            } else if (cityID !== undefined) {
                querySQL = querySQL + ' WHERE' + whereCity;
                places.push(cityID);
            }
            querySQL = querySQL + wherePerson;
            places.push(personID);
            querySQL = querySQL + ' UNION ' + preamble;
            if (unitID !== undefined) {
                querySQL = querySQL
                + ' JOIN people_administrative_offices ON people_administrative_offices.person_id = people.id'
                + ' JOIN people_administrative_units ON people_administrative_units.administrative_id = people_administrative_offices.id'
            }
            if (cityID !== undefined) {
                querySQL = querySQL + joinCity;
            }
            if (unitID !== undefined) {
                querySQL = querySQL + ' WHERE people_administrative_units.unit_id = ?';
                places.push(unitID);
                if (cityID !== undefined) {
                    querySQL = querySQL + ' AND' + whereCity;
                    places.push(cityID);
                }
            } else if (cityID !== undefined) {
                querySQL = querySQL + ' WHERE' + whereCity;
                places.push(cityID);
            }
            querySQL = querySQL + wherePerson;
            places.push(personID);

        } else {
            return callback(callbackOptions);
        }
        sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (resQuery.length > 0) {
                    return callback(options);
                } else {
                    responses.sendJSONResponse(res, 403, {
                        "status": "error",
                        "statusCode": 403,
                        "error": "User is not authorized to this operation (4)."
                    });
                    return;
                }
            },
            callbackOptions
        )
    }
}


/**
 * Middleware to check requester permissions to a resource
 * This function is the entry point for the computation of permissions
 * @param {string} resourceType: 'person','team','group', 'affiliation','message',...
 *                                (define new according to needs)
 * @param {string} operationResource: 'change', 'read'
 * @param callback - function to be called after permission checking
 * @param {object} callbackOptions - options for callback
 */
module.exports.checkPermissions = function (callback, callbackOptions) {
    let { req, res, next } = callbackOptions; // should contain always these 3
    // get requester permission data
    let {
        personID,
        userID,
        currentUnits,
        currentCity,
        permissionsLevel,
        permissionsEndpoints,
    } = req.payload;
    let reqEndpoint = req.originalUrl;
    let reqMethod = req.method;
    let resourcePersonID;
    if (req.params.personID !== undefined && req.params.personID !== null) {
        resourcePersonID = parseInt(req.params.personID, 10);
    }

    let reqEndpointParts = reqEndpoint.split('/');
    if (reqEndpointParts[1] === 'api' && reqEndpointParts[2] === 'pre-register') {
        reqEndpointParts.splice(0,3);
    } else {
        reqEndpointParts.splice(0,2); // the string starts by '/api' (always!!?)
    }
    if (permissionsLevel === 1) {
        // admin can do whatever he wants, no checking is necessary
        return callback(callbackOptions);
    } else if (permissionsLevel === 2) {
        // super-managers are also highly unrestricted (only they don't send messages)
        if (!reqEndpoint.includes('server-messages')) {
            return callback(callbackOptions);
        } else {
            responses.sendJSONResponse(res, 403, {
                "status": "error",
                "statusCode": 403,
                "error": "User is not authorized to this operation (3)."
            });
            return;
        }
    } else if (personID === resourcePersonID && resourcePersonID !== undefined
                && reqEndpointParts[0] === 'people') {
        // any user can read its data
        // any user can change its data except for affiliation
        // Assuming that reqEndpointParts.length > 2
        if (reqEndpointParts.length > 2 && !reqEndpointParts[2].includes('affiliations')) {
            return callback(callbackOptions);
        } else if (reqMethod === 'GET') {
            return callback(callbackOptions);
        } else if (reqEndpoint.includes('pre-register')) {
            return callback(callbackOptions);
        } else {
            responses.sendJSONResponse(res, 403, {
                "status": "error",
                "statusCode": 403,
                "error": "User is not authorized to this operation (2)."
            });
            return;
        }
    } else if (reqEndpointParts[0] === 'unit-areas') {
        // requester current units must include resource unit
        let sameUnit = false;
        for (let ind in currentUnits) {
            if (currentUnits[ind] === parseInt(req.params.unitID, 10)) {
                sameUnit = true;
            }
        }
        if (sameUnit) {
            if (reqEndpointParts[2] === 'cities') {
                if (currentCity.city_id === parseInt(req.params.cityID, 10)) {
                    if (reqMethod === 'GET') {
                        return callback(callbackOptions);
                    } else if (hasAccessEndpoint(reqMethod, reqEndpoint, permissionsEndpoints)) {
                        return callback(callbackOptions);
                    } else {
                        responses.sendJSONResponse(res, 403, {
                            "status": "error",
                            "statusCode": 403,
                            "error": "User is not authorized to this operation (units-cities)."
                        });
                        return;
                    }
                }
            } else {
                if (reqMethod === 'GET') {
                    return callback(callbackOptions);
                } else if (hasAccessEndpoint(reqMethod, reqEndpoint, permissionsEndpoints)) {
                    return callback(callbackOptions);
                } else {
                    responses.sendJSONResponse(res, 403, {
                        "status": "error",
                        "statusCode": 403,
                        "error": "User is not authorized to this operation (units)."
                    });
                    return;
                }
            }
        }
    } else if (hasAccessEndpoint(reqMethod, reqEndpoint, permissionsEndpoints)
                && reqEndpointParts[2] !== 'external-api-authorization') {
        // a user on behalf of another cannot change authorization for that user
        return callback(callbackOptions);
    } else if (personID !== undefined && reqEndpoint.includes('/api/people/all-publications')) {
        return callback(callbackOptions);
    } else {
        responses.sendJSONResponse(res, 403, {
            "status": "error",
            "statusCode": 403,
            "error": "User is not authorized to this operation (1)."
        });
        return;
    }
};


module.exports.checkPermissionsRecommendations = function (callback, callbackOptions) {
    let { req, res, next } = callbackOptions; // should contain always these 3
    // get requester permission data
    let {
        recommenderID,
        applicationID,
        callID,
    } = req.payload;

    let requestRecommenderID = parseInt(req.params.recommenderID, 10);
    let requestApplicationID = parseInt(req.params.applicationID, 10);
    let requestCallID = parseInt(req.params.callID, 10);

    if (recommenderID === requestRecommenderID
            && applicationID === requestApplicationID
            && callID === requestCallID) {
        return callback(callbackOptions);
    } else {
        responses.sendJSONResponse(res, 403, {
            "status": "error",
            "statusCode": 403,
            "error": "User is not authorized to this operation (1)."
        });
        return;
    }
};

var getCallUnit = function (callback, callbackOptions) {
    let { req, res, next } = callbackOptions;
    let callSegment = req.params.callSegment;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM call_applications'
                        + ' WHERE call_url_segment = ?;';
    places.push(callSegment)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, callbackOptions) => {
            if (resQuery.length === 1) {
                callbackOptions.call = resQuery[0];
                if (callbackOptions.call.is_laqv === 1) {
                    return getReviewerValidity(callback, callbackOptions);
                } else {
                    return callback(callbackOptions);
                }
            } else {
                responses.sendJSONResponse(res, 403, {
                    "status": "error",
                    "statusCode": 403,
                    "error": "User is not authorized to this operation (4)."
                });
                return;
            }
        },
        callbackOptions
    )

}

var getReviewerValidity = function (callback, callbackOptions) {
    //for LAQV only
    let { req, res, next, call } = callbackOptions;
    let reviewerID = req.params.reviewerID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *, NOW() AS `current_time`'
                        + ' FROM application_call_reviewers'
                        + ' WHERE call_id = ? AND reviewer_id = ?;';
    places.push(call.id, reviewerID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, callbackOptions) => {
            if (resQuery.length === 1) {
                let valid_from = resQuery[0].valid_from;
                let valid_until = resQuery[0].valid_until;
                let current_time = resQuery[0].current_time;
                if ((valid_from === null || valid_from <= current_time)
                    && (valid_until === null || current_time <= valid_until )) {
                    return callback(callbackOptions);
                } else {
                    responses.sendJSONResponse(res, 403, {
                        "status": "error",
                        "statusCode": 403,
                        "error": "User is not authorized to this operation (5)."
                    });
                    return;
                }
            } else {
                responses.sendJSONResponse(res, 403, {
                    "status": "error",
                    "statusCode": 403,
                    "error": "User is not authorized to this operation (4a)."
                });
                return;
            }
        },
        callbackOptions
    )
}

module.exports.checkPermissionsReviewers = function (callback, callbackOptions) {
    let { req, res, next } = callbackOptions; // should contain always these 3
    // get requester permission data
    let {
        reviewerID,
    } = req.payload;

    let requestReviewerID = parseInt(req.params.reviewerID, 10);

    if (reviewerID === requestReviewerID) {
        let callSegment = req.params.callSegment;
        if (callSegment === undefined || callSegment === null) {
            return callback(callbackOptions);
        } else {
            return getCallUnit(callback, callbackOptions);
        }
        //return callback(callbackOptions);
    } else {
        responses.sendJSONResponse(res, 403, {
            "status": "error",
            "statusCode": 403,
            "error": "User is not authorized to this operation (1)."
        });
        return;
    }
};

module.exports.checkPermissionsCallManagers = function (callback, callbackOptions) {
    let { req, res, next } = callbackOptions; // should contain always these 3
    // get requester permission data
    let {
        personID,
    } = req.payload;

    let requestPersonID = parseInt(req.params.personID, 10);

    if (personID === requestPersonID) {
        return callback(callbackOptions);
    } else {
        responses.sendJSONResponse(res, 403, {
            "status": "error",
            "statusCode": 403,
            "error": "User is not authorized to this operation (1)."
        });
        return;
    }
};