const sql = require('../utilities/sql')
const responses = require('../utilities/responses');

var checkPermissions = function (options, callback)  {
    // manager also has access to these routes

    return callback(options);
};

module.exports.getPollsList = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionGetPollsList)
};
module.exports.createPoll = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionCreatePoll)
};
module.exports.deletePoll = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionDeletePoll)
};
module.exports.addNewQuestion = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionAddNewQuestion)
};
module.exports.updateQuestion = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionUpdateQuestion)
};
module.exports.deleteQuestion = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionDeleteQuestion)
};
module.exports.addNewText = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionAddNewText)
};
module.exports.updateText = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionUpdateText)
};
module.exports.deleteText = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionDeleteText)
};
module.exports.addUserPoll = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionAddUserPoll)
};
module.exports.deleteUserPoll = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionDeleteUserPoll)
};