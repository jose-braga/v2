const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const time = require('../utilities/time');

var hasAccessEndpoint = function (reqMethod, reqEndpoint, permissionsEndpoints) {
    let access = false;

    return access;
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
    let resourcePersonID = req.params.personID;

    let reqEndpointParts = reqEndpoint.split('/');
    reqEndpointParts.splice(0,1); // the string starts by a '/' (always!!?)

    console.log(reqEndpoint)
    console.log(reqEndpointParts)

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

    } else if (resourceType === 'documents') {
        // for documents permissions

    } else {
        // other permission situations require a more thorough treatment
        // get owner data from resource to be accessed
        if (resourceType.includes('photos')) {
            return getResourceOwnership(resourceType, operationResource, callback, callbackOptions, true);
        } else {
            return getResourceOwnership(resourceType, operationResource, callback, callbackOptions, false);
        }
    }
};