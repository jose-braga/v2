const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const sockets = require('../../config/sockets');

var actionAdminSendMessageAll = function (options) {
    let { req, res, next } = options;
    var message = req.body.data;
    sockets.adminMessageAll(message);
    responses.sendJSONResponse(res, 200,
        {"status": "success", "statusCode": 200});
};

var actionAdminMessagesClear = function (options) {
    let { req, res, next } = options;
    //var option = req.params.option;
    sockets.adminMessagesClear();
    responses.sendJSONResponse(res, 200,
        {"status": "success", "statusCode": 200});
};

var actionGetServerMessages = function (options) {
    let { req, res, next } = options;
    var history = sockets.getServerMessages();
    return responses.sendJSONResponse(res, 200,
        {"status": "success", "statusCode": 200,  "count": history.length,
         "result" : history});
};

module.exports.adminSendMessageAll = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionAdminSendMessageAll(options) },
        { req, res, next }
    );
};

module.exports.adminMessagesClear = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionAdminMessagesClear(options) },
        { req, res, next }
    );
};

module.exports.getServerMessages = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetServerMessages(options) },
        { req, res, next }
    );
};