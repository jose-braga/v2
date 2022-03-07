const sql = require('../utilities/sql')
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

var actionGetNews = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM news;';
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getNews = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetNews(options) },
        { req, res, next }
    );
};

var actionCreateNews = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    if (data.visible === undefined || data.visible === null) data.visible = 0;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO news'
        + ' (title, body, published, valid_from, valid_until, visible, sort_order)'
        + ' VALUES (?,?,?,?,?,?,?)'
        ;
    places.push(
        data.title,
        data.body,
        data.published,
        data.valid_from,
        data.valid_until,
        data.visible,
        data.sort_order,
    )
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createNews = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateNews(options) },
        { req, res, next }
    );
};

var actionUpdateNews = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    let newsID = req.params.newsID;
    var querySQL = '';
    var places = [];
    if (data.visible === undefined || data.visible === null) data.visible = 0;
    querySQL = querySQL
        + 'UPDATE news'
        + ' SET title = ?,'
        + ' body = ?,'
        + ' published = ?,'
        + ' valid_from = ?,'
        + ' valid_until = ?,'
        + ' visible = ?,'
        + ' sort_order = ?'
        + ' WHERE id = ?'
        ;
    places.push(
        data.title,
        data.body,
        data.published,
        data.valid_from,
        data.valid_until,
        data.visible,
        data.sort_order,
        newsID
    )
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateNews = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateNews(options) },
        { req, res, next }
    );
};

var actionDeleteNews = function (options) {
    let { req, res, next } = options;
    let newsID = req.params.newsID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM news WHERE id = ?;';
    places.push(newsID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.deleteNews = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteNews(options) },
        { req, res, next }
    );
};