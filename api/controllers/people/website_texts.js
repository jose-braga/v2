const sql = require('../utilities/sql');
const permissions = require('../utilities/permissions');

var actionGetWebsiteTexts = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let textTypeID = req.params.textTypeID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM website_texts'
                        + ' WHERE person_id = ? AND text_type_id = ?;';
    places.push(personID, textTypeID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getWebsiteTexts = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetWebsiteTexts(options) },
        { req, res, next }
        );
};

var actionCreateWebsiteTexts = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let textTypeID = req.params.textTypeID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO website_texts'
                        + ' (person_id, text_type_id, title, text)'
                        + ' VALUES (?, ?, ?, ?);';
    places.push(personID, textTypeID, data.title, data.text)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.createWebsiteTexts = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateWebsiteTexts(options) },
        { req, res, next }
    );
};

var actionUpdateWebsiteTexts = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let textTypeID = req.params.textTypeID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE website_texts'
                        + ' SET text_type_id = ?,'
                        + ' title = ?,'
                        + ' text = ?'
                        + ' WHERE id = ?;';
    places.push(textTypeID, data.title, data.text, data.id);
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updateWebsiteTexts = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateWebsiteTexts(options) },
        { req, res, next }
    );
};