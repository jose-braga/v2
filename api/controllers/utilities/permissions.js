const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const time = require('../utilities/time');

var hasAccessEndpoint = function (reqMethod, reqEndpoint, permissionsEndpoints) {
    let reqEndpointParts = reqEndpoint.split('/');
    reqEndpointParts.splice(0, 1); // the string starts by a '/' (always!!?)
    let lastPath = reqEndpointParts[reqEndpointParts.length - 1];
    
    for (let ind in permissionsEndpoints) {
        // we want to compare the request endpoint with the permissions:
        // if lastPath is a number then we are interested in the remaining parts
        // otherwise we are interested in reqEnpoint
        let urlCompare;
        if (Number.isNaN(parseInt(lastPath, 10)) 
            || permissionsEndpoints[ind].include_last_id) {
            urlCompare = reqEndpoint;
        } else {
            // remove last path
            reqEndpointParts.splice(reqEndpointParts.length - 1, 1);
            urlCompare = '/' + reqEndpointParts.join('/');
        }
        if (permissionsEndpoints[ind].endpoint_url === urlCompare
            && permissionsEndpoints[ind].method_name === reqMethod) {
            return true;
        }
    }
    return false;
};

var TARGET_MANAGER_PERMISSION_LEVEL = 3;
var TEAM_MANAGER_PERMISSION_LEVEL = 4;
var STANDARD_USER_PERMISSION_LEVEL = 5;

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
        permissionsLevel, 
        permissionsEndpoints,
    } = req.payload;
    
    let reqEndpoint = req.path;
    let reqMethod = req.method;
    let resourcePersonID;
    if (req.params.personID !== undefined && req.params.personID !== null) {
        resourcePersonID = parseInt(req.params.personID, 10);
    }   

    let reqEndpointParts = reqEndpoint.split('/');
    reqEndpointParts.splice(0,1); // the string starts by a '/' (always!!?)

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
                "error": "User is not authorized to this operation."
            });
            return;
        }
    } else if (personID === resourcePersonID && resourcePersonID !== undefined
                && reqEndpointParts[0] === 'people') {
        // any user can read its data
        // any user can change its data except for affiliation
        // Assuming that reqEndpointParts.length > 2
        if (reqEndpointParts[2] !== 'affiliations') {
            return callback(callbackOptions);
        } else if (reqMethod === 'GET') {
            return callback(callbackOptions);
        } else {
            responses.sendJSONResponse(res, 403, {
                "status": "error",
                "statusCode": 403,
                "error": "User is not authorized to this operation."
            });
            return;
        }
    } else if (reqEndpointParts[0] === 'documents') {
        // TODO: for documents permissions

    } else if (hasAccessEndpoint(reqMethod, reqEndpoint, permissionsEndpoints)){
        return callback(callbackOptions);

        /*
        if (resourceType.includes('photos')) {
            return getResourceOwnership(resourceType, operationResource, callback, callbackOptions, true);
        } else {
            return getResourceOwnership(resourceType, operationResource, callback, callbackOptions, false);
        }
        */
    } else {
        responses.sendJSONResponse(res, 403, {
            "status": "error",
            "statusCode": 403,
            "error": "User is not authorized to this operation."
        });
        return;
    }
};