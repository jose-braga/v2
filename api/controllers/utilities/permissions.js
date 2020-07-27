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