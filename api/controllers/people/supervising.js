const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

var actionGetStudents = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_responsibles.*, people.name, people.colloquial_name'
        + ' FROM people_responsibles'
        + ' JOIN people ON people.id = people_responsibles.person_id'
        + ' WHERE people_responsibles.responsible_id = ?;';
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.getStudents = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetStudents(options) },
        { req, res, next }
    );
};