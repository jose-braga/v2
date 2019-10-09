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

var TARGET_MANAGER_PERMISSION_LEVEL = 3;
var TEAM_MANAGER_PERMISSION_LEVEL = 4;
var STANDARD_USER_PERMISSION_LEVEL = 5;

/**
 * 
 * @param {string} resourceType 
 * @param {string} operationResource 
 * @param {callback} callback 
 * @param {object} callbackOptions 
 * @param {boolean} multipart 
 */
var getResourceOwnership = function (resourceType, operationResource,
                        callback, callbackOptions, multipart = false) {
    let ownerPersonID, 
        ownerLabID, ownerGroupID, ownerUnitID,
        ownerCityID;
    if (resourceType.includes('people')) {
        ownerPersonID = req.params.personID;
    } 
    if (resourceType.includes('labs')) {
        ownerLabID = req.params.labID;
    }
    if (resourceType.includes('groups')) {
        ownerGroupID = req.params.groupID;
    }
    if (resourceType.includes('units')) {
        ownerUnitID = req.params.unitID;
    }
    if (resourceType.includes('cities')) {
        ownerCityID = req.params.cityID;
    }
    callbackOptions.ownerData = {
        ownerPersonID,
        ownerLabID, ownerGroupID, ownerUnitID,
        ownerCityID
    };
    return 
    
    
    
    
    
    
    
    
    
    
    
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
module.exports.checkPermissions = function (resourceType, operationResource, callback, callbackOptions) {
    let { req, res, next } = callbackOptions; // should contain always these 3
    // get requester permission data
    let { 
        personID,
        userID,
        permissionLevel, permissionPeople, permissionLabs, permissionGroups, permissionUnits,
        permissionCities, permissionUnitsCities,
        permissionDocuments, permissionWebAreas
    } = req.payload;
    // get requester situation in labs, groups, units, cities
    let {cities, currentCities,
        labs, currentLabs, 
        groups, currentGroups,
        units, currentUnits,
        technicianOffices, currentTechnicianOffices,
        scienceManagerOffices, currentScienceManagerOffices,
        administrativeOffices, currentAdministrativeOffices,
    } = req.payload;  
    callbackOptions.permissionData = {
        permissionLevel,
        permissionPeople,
        permissionLabs,
        permissionGroups,
        permissionUnits,
        permissionCities,
        permissionUnitsCities,
        permissionDocuments,
        permissionWebAreas,
    };
    callbackOptions.requesterSituationData = {
        cities, currentCities,
        labs, currentLabs,
        groups, currentGroups,
        units, currentUnits,
        technicianOffices, currentTechnicianOffices,
        scienceManagerOffices, currentScienceManagerOffices,
        administrativeOffices, currentAdministrativeOffices,
    };
    callbackOptions.requesterPersonID = personID;
    callbackOptions.requesterUserID = userID;
    if (req.params.personID !== undefined && req.params.personID !== null) {
        callbackOptions.ownerPersonID = parseInt(req.params.personID, 10);
    }
    
    // more powerful user types appear first
    if (permissionLevel === 1) {
        // admin can do whatever he wants, no checking is necessary
        return callback(callbackOptions);
    } else if (permissionLevel === 2) {
        // super-managers are also highly unrestricted (only they don't send messages)
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
    } else if (callbackOptions.requesterPersonID === callbackOptions.ownerPersonID
                && callbackOptions.ownerPersonID !== undefined) {
        // except for affiliation (and messages), a requester can change its own information
        // if request does not contain 'personID' then this situation must me
        // dealt latter
        if (resourceType !== 'message' && !resourceType.includes('affiliation')) {
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