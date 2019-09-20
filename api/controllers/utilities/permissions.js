const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const time = require('../utilities/time');

var processResourceTeamData = function (resQuery) {
    teamData = [];
    let usedLabs = {};
    let usedGroups = [];
 
    for (let indRes in resQuery) {
        let thisAffiliation = resQuery[indRes]
        if (time.overlap(
                thisAffiliation.valid_from,
                thisAffiliation.valid_until,
                thisAffiliation.labs_groups_valid_from,
                thisAffiliation.labs_groups_valid_until)) {
            if (usedGroups.indexOf(thisAffiliation.group_id) === -1) {
                usedGroups.push(thisAffiliation.group_id);
                usedLabs[thisAffiliation.group_id] = [thisAffiliation.lab_id];
                teamData.push({
                    unit_id: thisAffiliation.unit_id,
                    group_id: thisAffiliation.group_id,
                    lab_id: thisAffiliation.lab_id,
                    valid_from: thisAffiliation.valid_from,
                    valid_until: thisAffiliation.valid_until,
                });
            } else {
                if (usedLabs[thisAffiliation.group_id].indexOf(thisAffiliation.lab_id) === -1) {
                    usedLabs[thisAffiliation.group_id].push(thisAffiliation.lab_id);
                    teamData.push({
                        unit_id: thisAffiliation.unit_id,
                        group_id: thisAffiliation.group_id,
                        lab_id: thisAffiliation.lab_id,
                        valid_from: thisAffiliation.valid_from,
                        valid_until: thisAffiliation.valid_until,
                    })                    
                }
            }
        }
    }
    return teamData;
};
/**
 * Get the permissions matrix and associated geographical/unit permissions matrix
 * preliminary step for determining if user has access rights to resource
 * @param {*} resQuery 
 * @param {*} options 
 */
var getPermissionsMatrix = function (resQuery, options) {
    let { resourceType, operationResource, resourceOwnerID, ownerCityID,
        callback, callbackOptions } = options;
    let { req, res, next } = callbackOptions;

    // this processes resource owner data for use afterwards 
    let ownerTeamData = processResourceTeamData(resQuery);
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT permissions.*,'
        + ' permissions_units_cities.unit_id, permissions_units_cities.city_id'
        + ' FROM permissions'
        + ' LEFT JOIN permissions_units_cities ON permissions.id = permissions_units_cities.permission_id;';

    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => { geographicalUnitPermissions(resQuery, options) },
        {
            resourceType, operationResource, resourceOwnerID, ownerCityID, ownerTeamData,
            callback, callbackOptions
        });
}

var geographicalUnitPermissions = function (resQuery, options) {
    let { resourceType, operationResource, resourceOwnerID, 
        ownerCityID, ownerTeamData,
        callback, callbackOptions } = options;
    let { req, res, next } = callbackOptions;

    let permissionsMatrix = resQuery;
    // get requester data
    let requesterID = req.payload.personID;
    let { permissionID } = req.payload;   
    
    let unitsAccess = [];
    for (let ind in ownerTeamData) {
        unitsAccess.push(ownerTeamData[ind].unit_id)
    }
    
    for (let indPerm in permissionID) {
        if ((100 <= permissionID[indPerm] && permissionID[indPerm] < 400)
            || 
            (600 <= permissionID[indPerm] && permissionID[indPerm] < 1000
                && operationResource === 'read')
            ||
            (1000 <= permissionID[indPerm]) 
            ) {
            for (let indMat in permissionsMatrix) {
                if (permissionID[indPerm] === permissionsMatrix[indMat].id) {
                    if (permissionsMatrix[indMat].city_id === ownerCityID
                        && unitsAccess.indexOf(permissionsMatrix[indMat].unit_id) !== -1) {
                        return callback(callbackOptions);
                    }
                }
            }
        }
    }
    return teamManagementPermissions({
            resourceType, operationResource, resourceOwnerID,
            ownerCityID, ownerTeamData,
            requesterID, permissionsMatrix, permissionID,
            callback, callbackOptions
        })
};

var teamManagementPermissions = function (options) {
    let { resourceType, operationResource, resourceOwnerID,
        ownerCityID, ownerTeamData,
        requesterID, permissionsMatrix, permissionID,
        callback, callbackOptions } = options;
    let { req, res, next } = callbackOptions;

    let requesterGroupPermissions = req.payload.permission_group_id;
    let requesterLabPermissions = req.payload.permission_lab_id;
    if (resourceType === 'affiliation') {
        let groupsAccess = [];
        for (let ind in ownerTeamData) {
            groupsAccess.push(ownerTeamData[ind].group_id)
        }
        // team managers are only allowed to change affiliation data (lab+position)
        // TODO: others resource types worth considering: "location", "professional"
        if (permissionID.indexOf(400) !== -1) {
            for (let indGrp in requesterGroupPermissions) {
                if (groupsAccess.indexOf(requesterGroupPermissions[indGrp]) !== -1) {
                    return callback(callbackOptions);
                }
            }
        }
        if (permissionID.indexOf(500) !== -1) {
            for (let indLab in requesterLabPermissions) {
                for (let indOwnerLab in ownerTeamData) {
                    if (ownerTeamData[indOwnerLab].group_id === requesterLabPermissions[indLab].group_id
                        &&
                        ownerTeamData[indOwnerLab].lab_id === requesterLabPermissions[indLab].lab_id) {
                        return callback(callbackOptions);
                    }
                }
            }
        }
    }
    // if none of the permissions match any geography/unit or team 
    // then the requester should at least have standard user permissions
    return standardUserPermissions(options);
}

var standardUserPermissions = function (options) {
    let { resourceType, operationResource, resourceOwnerID,
        ownerCityID, ownerTeamData,
        callback, callbackOptions } = options;
    let { req, res, next } = callbackOptions; // should contain always these 3
    // get requester data
    let requesterID = req.payload.personID;
    let { permissionID } = req.payload;

    if (permissionID.indexOf(1) !== -1) {
        // a standard user can only change himself (resourceType must be 'standard')
        if (requesterID === resourceOwnerID && resourceType === 'standard') {
            return callback(callbackOptions);
        } else {
            responses.sendJSONResponse(res, 403, {
                "status": "error",
                "statusCode": 403,
                "error": "User is not authorized to this operation."
            });
            return;
        }
    }
    // if no permission to the resource was found
    responses.sendJSONResponse(res, 403, {
        "status": "error",
        "statusCode": 403,
        "error": "User is not authorized to this operation."
    });
    return;
};


var getResourceOwnership = function (resourceType, operationResource,
    callback, callbackOptions, multipart = false) {
    // there are resources which have no single ownership, 
    // like a whole team (or other bulk operations)
    if (operationResource === 'read' && resourceType === 'affiliation') {
        // in this case what matters is 

        
    } else {
        // resource ownership is found by determining person_id associated with row 
        // (id in people table)
    }
    
    return getInstitutionCity(resourceType, operationResource, callback, callbackOptions, multipart);

}

/**
 * Finds the geographical location associated resource owner
 * @param {*} resourceType 
 * @param {*} operationResource 
 * @param {*} callback 
 * @param {*} callbackOptions 
 * @param {*} multipart 
 */
var getInstitutionCity = function (resourceType, operationResource, 
                callback, callbackOptions, multipart = false) {
    let { req, res, next } = callbackOptions;
    let resourceOwnerID;
    // TODO: change the way resource ownership is computed
    // the way it is now is easily hackable
    if (req.method === 'GET' || req.method === 'DELETE' || multipart) {
        resourceOwnerID = parseInt(req.params.personID, 10);
    } else {
        resourceOwnerID = req.body.data.person_id;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from people_institution_city WHERE person_id = ?'
    places.push(resourceOwnerID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => { getTeamData(resQuery, options) },
        { resourceType, operationResource, resourceOwnerID, 
            callback, callbackOptions });
};
/**
 * Determines the team associated with resource owner
 * @param {*} resQuery 
 * @param {*} options 
 */
var getTeamData = function (resQuery, options) {
    let { resourceType, operationResource, resourceOwnerID,
        callback, callbackOptions } = options;
    let { req, res, next } = callbackOptions;
    let ownerCityID = resQuery[0].city_id;

    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_labs.valid_from, people_labs.valid_until,'
                        + ' people_labs.lab_id, labs.name AS lab_name, labs.short_name AS lab_short_name,'
                        + ' labs.started AS lab_started, labs.finished AS lab_finished,'
                        + ' labs_groups.valid_from AS labs_groups_valid_from,'
                        + ' labs_groups.valid_until AS labs_groups_valid_until,'
                        + ' groups.id AS group_id, groups.name AS group_name, groups.short_name AS group_short_name,'
                        + ' groups.started AS group_started, groups.finished AS group_finished,'
                        + ' groups_units.valid_from AS groups_units_valid_from,'
                        + ' groups_units.valid_until AS groups_units_valid_until,'
                        + ' units.id AS unit_id, units.name AS unit_name, units.short_name AS unit_short_name'
                        + ' FROM people_labs' 
                        + ' LEFT JOIN labs ON labs.id = people_labs.lab_id'
                        + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
                        + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
                        + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
                        + ' JOIN units ON units.id = groups_units.unit_id'
                        + ' WHERE people_labs.person_id = ?;';
    places.push(resourceOwnerID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => { getPermissionsMatrix(resQuery, options) },
        {
            resourceType, operationResource, resourceOwnerID, ownerCityID,
            callback, callbackOptions
        });
};

/**
 * Middleware to check requester permissions to a resource
 * @param {string} resourceType: 'standard', 'affiliation', 'message',...
 * @param {string} operationResource: 'change', 'read'
 * @param callback - function to be called after permission checking
 * @param {object} callbackOptions - options for callback
 */
module.exports.checkPermissions = function (resourceType, operationResource, callback, callbackOptions) {
    let { req, res, next } = callbackOptions; // should contain always these 3
    // get requester data
    let { permissionID } = req.payload;

    // more powerful user types appear first
    if (permissionID.indexOf(0) !== -1) {
        // admin can do whatever he wants, no checking is necessary
        return callback(callbackOptions);
    }
    // super-managers are also highly unrestricted (only they don't send messages)
    if (permissionID.indexOf(2) !== -1) {
        if (resourceType !== 'message') {
            return callback(callbackOptions);
        } else {
            responses.sendJSONResponse(res, 403, {
                "status": "error",
                "statusCode": 403,
                "error": "User is not authorized to this operation."
            });
            return;
        }
    }
    // get owner data from resource to be accessed
    return getResourceOwnership(resourceType, operationResource, callback, callbackOptions, false);
};

/**
 * Middleware for multipart requests to check requester permissions to a resource 
 * @param {string} resourceType: 'standard', 'affiliation', 'message',...
 * @param {string} operationResource: 'change', 'read'
 * @param callback - function to be called after permission checking
 * @param {object} callbackOptions - options for callback
 */
module.exports.checkPermissionsMultipart = function (resourceType, operationResource, callback, callbackOptions) {
    let { req, res, next } = callbackOptions; // should contain always these 3
    // get requester data
    let { permissionID } = req.payload;
    
    // more powerful user types appear first
    if (permissionID.indexOf(0) !== -1) {
        // admin can do whatever he wants, no checking is necessary
        return callback(callbackOptions);
    }
    // super-managers are also highly unrestricted (only they don't send messages)
    if (permissionID.indexOf(2) !== -1) {
        if (resourceType !== 'message') {
            return callback(callbackOptions);
        } else {
            responses.sendJSONResponse(res, 403, {
                "status": "error",
                "statusCode": 403,
                "error": "User is not authorized to this operation."
            });
            return;
        }
    }
    // get owner data from resource to be accessed
    return getResourceOwnership(resourceType, operationResource, callback, callbackOptions,true);
};
