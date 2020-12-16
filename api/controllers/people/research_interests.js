const sql = require('../utilities/sql');
const permissions = require('../utilities/permissions');
const responses = require('../utilities/responses');
const notifications = require('../utilities/notifications');

var actionGetResearchInterests = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM research_interests'
                        + ' WHERE person_id = ?'
                        + ' ORDER BY sort_order ASC;';
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getResearchInterests = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetResearchInterests(options) },
        { req, res, next }
        );
};
var actionCreateResearchInterests = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO research_interests'
                        + ' (person_id, interests, sort_order)'
                        + ' VALUES (?, ?, ?);';
    places.push(personID, data.interests, data.sort_order)
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
                "result": "OK - Created Research Interest"
            }
        })
};
module.exports.createResearchInterests = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateResearchInterests(options) },
        { req, res, next }
        );
};
var actionUpdateResearchInterests = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let interestID = req.params.interestID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE research_interests'
                        + ' SET interests = ?,'
                        + ' sort_order = ?'
                        + ' WHERE id = ?;';
    places.push(data.interests, data.sort_order, interestID)
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
                "result": "OK - Updated Research Interest"
            }
        })
};
module.exports.updateResearchInterests = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateResearchInterests(options) },
        { req, res, next }
        );
};
var actionDeleteResearchInterests = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let interestID = req.params.interestID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM research_interests'
                        + ' WHERE id = ?;';
    places.push(interestID)
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
                "result": "OK - Deleted Research Interest"
            }
        })
};
module.exports.deleteResearchInterests = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteResearchInterests(options) },
        { req, res, next }
        );
};