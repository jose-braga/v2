const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const notifications = require('../utilities/notifications');

var addUser = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO `users` (`username`,`password`,`status`,`created`) '
        + 'VALUES (?,?,?,?);';
    places.push(personID)
    sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.userID = resQuery.insertId;
            console.log(options.userID)
        },
        {req, res, next}
    );
};

module.exports.addMember = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { addUser(options) },
        { req, res, next }
    );
}