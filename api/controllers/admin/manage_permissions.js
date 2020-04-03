const sql = require('../../utilities/sql');
const responses = require('../../utilities/responses');
const permissions = require('../../utilities/permissions');

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
                                && key !== 'id')) {
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
            methodsObj = [];
            for (let el2 = 0;  el2 < group.length; el2++) {
                methods.push(group[el2].method_id);
                methodsObj.push({
                    id: group[el2].id,
                    method_id: group[el2].method_id
                });
            }
            perm[el].method_id = methods;
            perm[el].method_data = methodsObj;
            permissionsData.push(perm[el])
        }
    }
    return permissionsData;
}

var getUserID = function (options, callback) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT user_id FROM people'
                        + ' WHERE id = ?;';
    places.push(personID)
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
        querySQL = querySQL + 'SELECT * FROM permissions_endpoints'
                            + ' WHERE user_id = ?;';
        places.push(userID)
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                let permissionsData = processPermissions(resQuery);
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": permissionsData.length,
                        "result": permissionsData
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

var actionCreatePermissions = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO cars'
                        + ' (person_id, license, brand, model, color, plate)'
                        + ' VALUES (?,?,?,?,?,?);';
    places.push(personID, data.license, data.brand,
        data.model, data.color, data.plate)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.createPermissions = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreatePermissions(options) },
        { req, res, next }
    );
};

var actionUpdatePermissions = function (options) {
    let { req, res, next } = options;
    let carID = req.params.carID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE cars'
                        + ' SET license  = ?,'
                        + ' brand = ?,'
                        + ' model = ?,'
                        + ' color = ?,'
                        + ' plate = ?'
                        + ' WHERE id = ?;';
    places.push(data.license, data.brand, data.model,
        data.color, data.plate, carID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updatePermissions = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdatePermissions(options) },
        { req, res, next }
    );
};

var actionDeletePermissions = function (options) {
    let { req, res, next } = options;
    let carID = req.params.carID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM cars'
                        + ' WHERE id = ?;';
    places.push(carID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.deletePermissions = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeletePermissions(options) },
        { req, res, next }
    );
};