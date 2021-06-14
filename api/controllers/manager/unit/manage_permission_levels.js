const sql = require('../../utilities/sql');
const responses = require('../../utilities/responses');
const permissions = require('../../utilities/permissions');

var getUserID = function (options, callback) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT user_id FROM people'
                        + ' WHERE id = ?;';
    places.push(personID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.userID = resQuery[0].user_id;
            callback(options);
        },
        options);
};
var actionGetPermissionLevel = function (options) {
    let { req, res, next, userID } = options;
    if (userID !== undefined && userID !== null) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL
            + 'SELECT users.id AS user_id, users.permission_level_id, permission_levels.*'
            + ' FROM users'
            + ' JOIN permission_levels ON permission_levels.id = users.permission_level_id'
            + ' WHERE users.id = ?;';
        places.push(userID)
        return sql.makeSQLOperation(req, res, querySQL, places);
    } else {
        return responses.sendJSONResponseOptions({
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200,
                "count": 0,
                "result": [{}]
            }
        });
    }
};
module.exports.getPermissionLevel = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            getUserID(options, actionGetPermissionLevel) },
        { req, res, next }
    );
};

var actionUpdatePermissionLevel = function (options) {
    let { req, res, next, userID } = options;
    if (userID !== undefined && userID !== null) {
        let data = req.body.data;
        var querySQL = '';
        var places = [];
        querySQL = querySQL
            + 'UPDATE users'
            + ' SET permission_level_id = ?'
            + ' WHERE id = ?;';
        places.push(data.permission_level_id, userID)
        return sql.makeSQLOperation(req, res, querySQL, places);
    } else {
        return responses.sendJSONResponseOptions({
            response: res,
            status: 403,
            message: "User is not defined!"
        });
    }
};
module.exports.updatePermissionLevel = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            getUserID(options, actionUpdatePermissionLevel) },
        { req, res, next }
    );
};