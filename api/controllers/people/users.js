const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

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
            console.log(resQuery)
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