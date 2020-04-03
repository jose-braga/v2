const sql = require('../../utilities/sql');
const responses = require('../../utilities/responses');
const permissions = require('../../utilities/permissions');
const _ = require('lodash')

function processPermissions (perm) {
    // group permissions that differ only on request methods
    let permissionsData = [];
    let usedInd = [];
    for (let el = 0;  el < perm.length; el++) {
        let group = [];
        if (usedInd.indexOf(perm[el].id) === -1) {
            usedInd.push(perm[el].id);
            group.push(perm[el]);
            for (let el2 = el + 1;  el2 < perm.length; el2++) {
                if (usedInd.indexOf(perm[el2].id) === -1) {
                    let samePermission = true;
                    for (let key in perm[el]) {
                        if (perm[el][key] !== perm[el2][key]
                            && (key !== 'method_id'
                                && key !== 'method_name'
                                && key !== 'id'
                                && key !== 'endpoint_url'
                                && key !== 'resource1_type_name'
                                && key !== 'resource2_type_name'
                                && key !== 'resource3_type_name'
                                && key !== 'resource4_type_name'
                                )) {
                            samePermission = false;
                            break;
                        }
                    }
                    if (samePermission) {
                        usedInd.push(perm[el2].id);
                        group.push(perm[el2]);
                    }
                }
            }
            methods = [];
            methodsName = [];
            methodsObj = [];
            for (let el2 = 0;  el2 < group.length; el2++) {
                methods.push(group[el2].method_id);
                methodsName.push(group[el2].method_name);
                methodsObj.push({
                    id: group[el2].id,
                    method_id: group[el2].method_id
                });
            }
            perm[el].method_id = methods;
            perm[el].method_name = methodsName;
            perm[el].method_data = methodsObj;
            permissionsData.push(perm[el])
        }
    }
    permissionsData = _.sortBy(permissionsData,
        ['resource1_type_id', 'resource1_id',
        'resource2_type_id', 'resource2_id',
        'resource3_type_id', 'resource3_id',
        'resource4_type_id', 'resource4_id']);
    return permissionsData;
}

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
    let { userID, i} = options;
    let masterAction = options.masterAction;
    let data, methodID, permissionID, action;
    if (masterAction === 'create') {
        data = req.body.data.permission;
        i = req.body.data.method_index;
        action = 'create';
    } else {
        data = req.body.data;
        action = data.method_data[i].action;
    }
    methodID = data.method_data[i].method_id;
    permissionID = data.method_data[i].id;

    var querySQL = '';
    var places = [];
    if (action === 'update' || action === 'create') {
        // checks if the new set of values exists or not
        querySQL = querySQL + 'SELECT * '
            +  ' FROM permissions_endpoints'
            + ' WHERE resource1_type_id <=> ? AND resource1_id <=> ? AND resource1_resource_id_generic <=> ? AND'
            + ' resource2_type_id <=> ? AND resource2_id <=> ? AND resource2_resource_id_generic <=> ? AND'
            + ' resource3_type_id <=> ? AND resource3_id <=> ? AND resource3_resource_id_generic <=> ? AND'
            + ' resource4_type_id <=> ? AND resource4_id <=> ? AND resource4_resource_id_generic <=> ? AND'
            + ' allow_all_subpaths <=> ? AND user_id <=> ? AND method_id <=> ?;';
        places.push(data.resource1_type_id,
            data.resource1_id,
            data.resource1_resource_id_generic,
            data.resource2_type_id,
            data.resource2_id,
            data.resource2_resource_id_generic,
            data.resource3_type_id,
            data.resource3_id,
            data.resource3_resource_id_generic,
            data.resource4_type_id,
            data.resource4_id,
            data.resource4_resource_id_generic,
            data.allow_all_subpaths,
            userID,
            methodID);
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
                        if  (i + 1 < data.method_data.length) {
                            options.i = i + 1;
                            return checkPermissionExists(options)
                        } else {
                            return responses.sendJSONResponseOptions({
                                response: res,
                                status: 200,
                                message: {
                                    "status": "success", "statusCode": 200,
                                    "message": "This permission information was updated!"
                                }
                            });
                        }
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
        // no verification required for deletion (sub-)actions
        if (masterAction === 'update') {
            return actionUpdatePermissions(options);
        } else if (masterAction === 'create') {
            return actionCreatePermissions(options);
        } else {
            // for deletion
            return actionDeletePermissions(options);
        }
    }
};

var actionCreatePermissions = function (options) {
    let { req, res, next } = options;
    let { userID } = options;
    let data = req.body.data.permission;
    let i = req.body.data.method_index;
    let methodID = data.method_data[i].method_id;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO permissions_endpoints'
                + '(resource1_type_id, resource1_id, resource1_resource_id_generic,'
                + ' resource2_type_id, resource2_id, resource2_resource_id_generic,'
                + ' resource3_type_id, resource3_id, resource3_resource_id_generic,'
                + ' resource4_type_id, resource4_id, resource4_resource_id_generic,'
                + ' allow_all_subpaths, user_id, method_id)'
                + ' SELECT * FROM (SELECT ? AS resource1_type_id, ? AS resource1_id, ? AS resource1_resource_id_generic,'
                + ' ? AS resource2_type_id, ? AS resource2_id, ? AS resource2_resource_id_generic,'
                + ' ? AS resource3_type_id, ? AS resource3_id, ? AS resource3_resource_id_generic,'
                + ' ? AS resource4_type_id, ? AS resource4_id, ? AS resource4_resource_id_generic,'
                +  '? AS allow_all_subpaths, ? AS user_id, ? AS method_id) AS tmp'
                + ' WHERE NOT EXISTS ('
                    + ' SELECT * FROM permissions_endpoints'
                    + ' WHERE resource1_type_id <=> ? AND resource1_id <=> ? AND resource1_resource_id_generic <=> ? AND'
                    + ' resource2_type_id <=> ? AND resource2_id <=> ? AND resource2_resource_id_generic <=> ? AND'
                    + ' resource3_type_id <=> ? AND resource3_id <=> ? AND resource3_resource_id_generic <=> ? AND'
                    + ' resource4_type_id <=> ? AND resource4_id <=> ? AND resource4_resource_id_generic <=> ? AND'
                    + ' allow_all_subpaths <=> ? AND user_id <=> ? AND method_id <=> ?'
                + ');';
        places.push(
            data.resource1_type_id,
            data.resource1_id,
            data.resource1_resource_id_generic,
            data.resource2_type_id,
            data.resource2_id,
            data.resource2_resource_id_generic,
            data.resource3_type_id,
            data.resource3_id,
            data.resource3_resource_id_generic,
            data.resource4_type_id,
            data.resource4_id,
            data.resource4_resource_id_generic,
            data.allow_all_subpaths,
            userID,
            methodID,
            data.resource1_type_id,
            data.resource1_id,
            data.resource1_resource_id_generic,
            data.resource2_type_id,
            data.resource2_id,
            data.resource2_resource_id_generic,
            data.resource3_type_id,
            data.resource3_id,
            data.resource3_resource_id_generic,
            data.resource4_type_id,
            data.resource4_id,
            data.resource4_resource_id_generic,
            data.allow_all_subpaths,
            userID,
            methodID
        );
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.createPermissions = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            options.i = 0;
            options.masterAction = 'create';
            getUserID(options, checkPermissionExists)
        },
        { req, res, next }
    );
};

var actionUpdatePermissions = function (options) {
    let { req, res, next } = options;
    let { userID, i} = options;
    let data = req.body.data;
    let methodID = data.method_data[i].method_id;
    let permissionID = data.method_data[i].id;
    let action = data.method_data[i].action;
    var querySQL = '';
    var places = [];
    if (action === 'update') {
        querySQL = querySQL + 'UPDATE permissions_endpoints'
                        + ' SET method_id  = ?,'
                        + ' resource1_type_id = ?,'
                        + ' resource1_id = ?,'
                        + ' resource1_resource_id_generic = ?,'
                        + ' resource2_type_id = ?,'
                        + ' resource2_id = ?,'
                        + ' resource2_resource_id_generic = ?,'
                        + ' resource3_type_id = ?,'
                        + ' resource3_id = ?,'
                        + ' resource3_resource_id_generic = ?,'
                        + ' resource4_type_id = ?,'
                        + ' resource4_id = ?,'
                        + ' resource4_resource_id_generic = ?,'
                        + ' allow_all_subpaths = ?'
                        + ' WHERE id = ?;';
        places.push(
            methodID,
            data.resource1_type_id,
            data.resource1_id,
            data.resource1_resource_id_generic,
            data.resource2_type_id,
            data.resource2_id,
            data.resource2_resource_id_generic,
            data.resource3_type_id,
            data.resource3_id,
            data.resource3_resource_id_generic,
            data.resource4_type_id,
            data.resource4_id,
            data.resource4_resource_id_generic,
            data.allow_all_subpaths,
            permissionID
        );
    } else if (action === 'create') {
        querySQL = querySQL + 'INSERT INTO permissions_endpoints'
                + '(resource1_type_id, resource1_id, resource1_resource_id_generic,'
                + ' resource2_type_id, resource2_id, resource2_resource_id_generic,'
                + ' resource3_type_id, resource3_id, resource3_resource_id_generic,'
                + ' resource4_type_id, resource4_id, resource4_resource_id_generic,'
                + ' allow_all_subpaths, user_id, method_id)'
                + ' SELECT * FROM (SELECT ? AS resource1_type_id, ? AS resource1_id, ? AS resource1_resource_id_generic,'
                + ' ? AS resource2_type_id, ? AS resource2_id, ? AS resource2_resource_id_generic,'
                + ' ? AS resource3_type_id, ? AS resource3_id, ? AS resource3_resource_id_generic,'
                + ' ? AS resource4_type_id, ? AS resource4_id, ? AS resource4_resource_id_generic,'
                +  '? AS allow_all_subpaths, ? AS user_id, ? AS method_id) AS tmp'
                + ' WHERE NOT EXISTS ('
                    + ' SELECT * FROM permissions_endpoints'
                    + ' WHERE resource1_type_id <=> ? AND resource1_id <=> ? AND resource1_resource_id_generic <=> ? AND'
                    + ' resource2_type_id <=> ? AND resource2_id <=> ? AND resource2_resource_id_generic <=> ? AND'
                    + ' resource3_type_id <=> ? AND resource3_id <=> ? AND resource3_resource_id_generic <=> ? AND'
                    + ' resource4_type_id <=> ? AND resource4_id <=> ? AND resource4_resource_id_generic <=> ? AND'
                    + ' allow_all_subpaths <=> ? AND user_id <=> ? AND method_id <=> ?'
                + ');';
        places.push(
            data.resource1_type_id,
            data.resource1_id,
            data.resource1_resource_id_generic,
            data.resource2_type_id,
            data.resource2_id,
            data.resource2_resource_id_generic,
            data.resource3_type_id,
            data.resource3_id,
            data.resource3_resource_id_generic,
            data.resource4_type_id,
            data.resource4_id,
            data.resource4_resource_id_generic,
            data.allow_all_subpaths,
            userID,
            methodID,
            data.resource1_type_id,
            data.resource1_id,
            data.resource1_resource_id_generic,
            data.resource2_type_id,
            data.resource2_id,
            data.resource2_resource_id_generic,
            data.resource3_type_id,
            data.resource3_id,
            data.resource3_resource_id_generic,
            data.resource4_type_id,
            data.resource4_id,
            data.resource4_resource_id_generic,
            data.allow_all_subpaths,
            userID,
            methodID
        );
    } else if (action === 'delete') {
        querySQL = querySQL + 'DELETE FROM permissions_endpoints'
                        + ' WHERE id = ?;';
        places.push(permissionID);
    }
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if  (i + 1 < data.method_data.length) {
                options.i = i + 1;
                return actionUpdatePermissions(options)
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": "This permission information was updated!"
                    }
                });
            }
        },
        options);
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
    querySQL = querySQL + 'DELETE FROM permissions_endpoints'
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