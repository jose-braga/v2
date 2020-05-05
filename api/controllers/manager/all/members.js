const sql = require('../../utilities/sql');
const time = require('../../utilities/time');
const responses = require('../../utilities/responses');
const permissions = require('../../utilities/permissions');


var actionGetMembersList = function (options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT DISTINCT people.id AS person_id, people.name, people.colloquial_name '
        + ' FROM people'
        + ' JOIN people_labs ON people_labs.person_id = people.id'
        + ' WHERE people_labs.lab_id = ? AND people.status = ?;';
    places.push(labID, 1)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionGetMemberDetails(resQuery, options)
        },
        options);
};
module.exports.getMembersList = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetMembersList(options) },
        { req, res, next }
    );
};