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
var actionGetPermissions = function (options) {
    let { req, res, next } = options;
    let userID = options.userID;
    if (userID !== undefined && userID !== null) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL
            + 'SELECT permissions_web_app_areas.*, web_app_areas.app_area_en, web_app_areas.app_area_pt'
            + ' FROM permissions_web_app_areas'
            + ' JOIN web_app_areas ON web_app_areas.id = permissions_web_app_areas.app_area_id'
            + ' WHERE permissions_web_app_areas.user_id = ?;';
        places.push(userID)
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": resQuery.length,
                        "result": resQuery
                    }
                });
            },
            options);
    } else {
        return responses.sendJSONResponseOptions({
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200,
                "count": 0,
                "result": []
            }
        });
    }
};
module.exports.getPermissions = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { getUserID(options, actionGetPermissions) },
        { req, res, next }
    );
};

var checkPermissionExists = function (options) {
    let { req, res, next } = options;
    let masterAction = options.masterAction;
    let data, permissionID;
    var querySQL = '';
    var places = [];
    if (masterAction === 'update' || masterAction === 'create') {
        data = req.body.data;
        permissionID = data.id;
        // checks if the new set of values exists or not
        querySQL = querySQL + 'SELECT * '
            +  ' FROM permissions_web_app_areas'
            + ' WHERE user_id <=> ? AND app_area_id <=> ?;';
        places.push(options.userID,
            data.app_area_id);
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (masterAction === 'update') {
                    // checks if a row with a different ID
                    // contains the same values
                    let foundAnother = false;
                    for (let ind in resQuery) {
                        if (resQuery[ind].id !== permissionID) {
                            foundAnother = true;
                            break;
                        }
                    }
                    if (foundAnother) {
                        return responses.sendJSONResponseOptions({
                            response: res,
                            status: 200,
                            message: {
                                "status": "success", "statusCode": 200,
                                "message": "This permission information already existed!"
                            }
                        });
                    } else {
                        return actionUpdatePermissions(options);
                    }
                } else {
                    if (resQuery.length > 0) {
                        // a row already exists proceed to next or finish
                        return responses.sendJSONResponseOptions({
                            response: res,
                            status: 200,
                            message: {
                                "status": "success", "statusCode": 200,
                                "message": "This permission information already existed."
                            }
                        });
                    } else {
                        return actionCreatePermissions(options);
                    }
                }
            },
            options);
    } else {
        return actionDeletePermissions(options);
    }
};

var actionCreatePermissions = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO permissions_web_app_areas'
                + ' (user_id, app_area_id)'
                + ' VALUES(?, ?);';
        places.push(options.userID, data.app_area_id);
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.createPermissions = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            options.masterAction = 'create';
            getUserID(options, checkPermissionExists)
        },
        { req, res, next }
    );
};

var actionUpdatePermissions = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    let permissionID = data.id;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE permissions_web_app_areas'
                        + ' SET app_area_id  = ?'
                        + ' WHERE id = ?;';
    places.push(
        data.app_area_id,
        permissionID
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updatePermissions = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            options.masterAction = 'update';
            getUserID(options, checkPermissionExists)
        },
        { req, res, next }
    );
};

var actionDeletePermissions = function (options) {
    let { req, res, next } = options;
    let permissionID = req.params.permissionID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM permissions_web_app_areas'
                        + ' WHERE id = ?;';
    places.push(permissionID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.deletePermissions = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            options.masterAction = 'delete';
            actionDeletePermissions(options)
        },
        { req, res, next }
    );
};