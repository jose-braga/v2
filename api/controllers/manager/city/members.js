const sql = require('../../utilities/sql');
const time = require('../../utilities/time');
const responses = require('../../utilities/responses');
const permissions = require('../../utilities/permissions');

module.exports.getMembersList = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetLabMembers(options) },
        { req, res, next }
    );
};