const sql = require('../utilities/sql');
const permissions = require('../utilities/permissions');
const notifications = require('../utilities/notifications');

var actionGetPersonalURLs = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM personal_urls'
                        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getPersonalURLs = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPersonalURLs(options) },
        { req, res, next }
        );
};
var actionCreatePersonalURLs = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO personal_urls'
                        + ' (person_id, url_type_id, url, description)'
                        + ' VALUES (?, ?, ?, ?);';
    places.push(personID, data.url_type_id, data.url, data.description)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "OK - Created personal URL"
            }
        })
};
module.exports.createPersonalURLs = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreatePersonalURLs(options) },
        { req, res, next }
        );
};
var actionUpdatePersonalURLs = function (options) {
    let { req, res, next } = options;
    let urlID = req.params.urlID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE personal_urls'
                        + ' SET url_type_id = ?,'
                        + ' url = ?,'
                        + ' description = ?'
                        + ' WHERE id = ?;';
    places.push(data.url_type_id, data.url, data.description, urlID)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "OK - Updated personal URL"
            }
        })
};
module.exports.updatePersonalURLs = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdatePersonalURLs(options) },
        { req, res, next }
        );
};
var actionDeletePersonalURLs = function (options) {
    let { req, res, next } = options;
    let urlID = req.params.urlID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM personal_urls'
                        + ' WHERE id = ?;';
    places.push(urlID)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "OK - Deleted personal URL"
            }
        })
};
module.exports.deletePersonalURLs = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeletePersonalURLs(options) },
        { req, res, next }
        );
};