const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const jwtUtils = require('../../config/jwt_utilities');
const time = require('../utilities/time');

var actionCheckUserExistence = function (options) {
    let { req, res, next } = options;
    let username = req.params.username;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM users'
                        + ' WHERE username = ?;';
    places.push(username)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let validUsername;
            if (resQuery.length > 0) {
                validUsername = false;
            } else {
                validUsername = true;
            }
            responses.sendJSONResponse(res, 200, {
                "valid": validUsername
            });
        },
        options);
};
module.exports.checkUserExistence = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCheckUserExistence(options) },
        { req, res, next }
    );
};

var actionGetUsername = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT users.id, users.username'
                        + ' FROM users'
                        + ' JOIN people ON people.user_id = users.id'
                        + ' WHERE people.id = ?;';
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getUsername = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetUsername(options) },
        { req, res, next }
    );
};

var actionUpdateUsername = function (options) {
    let { req, res, next } = options;
    let userID = req.params.userID;
    let data = req.body.data;
    let now = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
    if (data.username !== undefined && data.username !== '') {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'UPDATE users'
                            + ' SET username = ?,'
                            + ' updated = ?'
                            + ' WHERE id = ?;';
        places.push(data.username, now, userID);
        return sql.makeSQLOperation(req, res, querySQL, places);
    } else {
        return responses.sendJSONResponse(res, 200, {
            "message": "No changes!"
        });
    }
};
module.exports.updateUsername = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateUsername(options) },
        { req, res, next }
    );
};
var actionUpdatePassword = function (options) {
    let { req, res, next } = options;
    let userID = req.params.userID;
    let data = req.body.data;
    let now = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
    if (data.password !== undefined && data.password !== '') {
        let hashedPassword = jwtUtils.hashPassword(data.password)
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'UPDATE users'
                            + ' SET password = ?,'
                            + ' updated = ?'
                            + ' WHERE id = ?;';
        places.push(hashedPassword, now, userID)
        return sql.makeSQLOperation(req, res, querySQL, places);
    } else {
        return responses.sendJSONResponse(res, 200, {
            "message": "No changes!"
        });
    }

};
module.exports.updatePassword = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdatePassword(options) },
        { req, res, next }
    );
};