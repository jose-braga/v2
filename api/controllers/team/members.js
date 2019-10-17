const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

var actionGetMemberDetails = function (members, options) {
    if (members.length > 0) {
        return getMembersLabPositions(members, options, 0);
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
var getMembersLabPositions = function (members, options, i) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_labs.*,'
                        + ' labs.name AS lab_name, labs.short_name AS lab_short_name,'
                        + ' lab_positions.name_en AS lab_position_name_en,'
                        + ' lab_positions.name_pt AS lab_position_name_pt'
                        + ' FROM people_labs'
                        + ' JOIN labs ON labs.id = people_labs.lab_id'
                        + ' LEFT JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
                        + ' WHERE people_labs.lab_id = ? AND people_labs.person_id = ?;';
    places.push(labID, members[i].person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            members[i].history = resQuery;
            getMemberDetails(members, options, i)
        },
        options);    
};
var getMemberDetails = function (members, options, i) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM researchers_info'
                        + ' WHERE person_id = ?;';
    places.push(members[i].person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            members[i].researcher_details = resQuery;
            if (i + 1 < members.length) {
                getMembersLabPositions(members, options, i + 1);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200, 
                        "count": members.length,
                        "result": members
                    }
                });
                return;
            }                
        },
        options);
};
var actionGetLabMembers = function (options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT DISTINCT people.id AS person_id, people.name, people.colloquial_name ' 
                        + ' FROM people'
                        + ' JOIN people_labs ON people_labs.person_id = people.id'
                        + ' WHERE people_labs.lab_id = ?;';
    places.push(labID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => { 
            actionGetMemberDetails(resQuery, options)
        },
        options);
};
module.exports.getLabMembers = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetLabMembers(options) },
        { req, res, next }
    );
};

var actionGetLabInfo = function (options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * '
                        + ' FROM labs'
                        + ' WHERE id = ?;';
    places.push(labID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let labs = resQuery[0]; // there is only one lab
            actionGetLabGroups(labs, options)
        },
        options);
};
var actionGetLabGroups = function (labs, options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT `groups`.*, labs_groups.valid_from, labs_groups.valid_until'
                        + ' FROM labs_groups'
                        + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
                        + ' WHERE labs_groups.lab_id = ?;';
    places.push(labID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            labs.groups_history = resQuery;
            actionGetGroupsUnits(labs, options, 0)
        },
        options);
};
var actionGetGroupsUnits = function (labs, options, i) {
    let { req, res, next } = options;
    let groupID = labs.groups_history[i].id;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT units.*, groups_units.valid_from, groups_units.valid_until'
                        + ' FROM groups_units'
                        + ' JOIN units ON units.id = groups_units.unit_id'
                        + ' WHERE groups_units.group_id = ?;';
    places.push(groupID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            labs.groups_history[i].units_history = resQuery;
            if (i + 1 < labs.groups_history.length) {
                actionGetGroupsUnits(labs, options, i + 1);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 1,
                        "result": labs
                    }
                });
                return;
            }                
        },
        options);
};

module.exports.getLabInfo = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetLabInfo(options) },
        { req, res, next }
    );
};