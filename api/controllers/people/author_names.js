const sql = require('../utilities/sql');
const permissions = require('../utilities/permissions');

var actionGetAuthorNames = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM author_names'
                        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.getAuthorNames = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetAuthorNames(options) },
        { req, res, next }
    );
};

var actionCreateAuthorName = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO author_names'
                        + ' (person_id, name)'
                        + ' VALUES (?,?);';
    places.push(personID, data.name)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.createAuthorName = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateAuthorName(options) },
        { req, res, next }
    );
};

var actionUpdateAuthorName = function (options) {
    let { req, res, next } = options;
    let authorID = req.params.authorID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE author_names'
                        + ' SET name  = ?'
                        + ' WHERE id = ?;';
    places.push(data.name, authorID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updateAuthorName = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateAuthorName(options) },
        { req, res, next }
    );
};

var actionDeleteAuthorName = function (options) {
    let { req, res, next } = options;
    let authorID = req.params.authorID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM author_names'
                        + ' WHERE id = ?;';
    places.push(authorID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.deleteAuthorName = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteAuthorName(options) },
        { req, res, next }
    );
};