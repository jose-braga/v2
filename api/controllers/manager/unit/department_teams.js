const sql = require('../../utilities/sql');
const time = require('../../utilities/time');
const responses = require('../../utilities/responses');
const permissions = require('../../utilities/permissions');

var actionGetPersonDepartmentTeam = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_team_department.*,'
                        + ' teams_department.name AS team_name, teams_department.lab_id'
                        + ' FROM people_team_department'
                        + ' JOIN teams_department ON teams_department.id = people_team_department.team_id'
                        + ' WHERE people_team_department.person_id = ?;';
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getPersonDepartmentTeam = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPersonDepartmentTeam(options) },
        { req, res, next }
    );
};

var actionCreatePersonDepartmentTeam = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO people_team_department'
                        + ' (person_id, team_id)'
                        + ' VALUES (?, ?);'
                        ;
    places.push(personID, data.team_id)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createPersonDepartmentTeam = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreatePersonDepartmentTeam(options) },
        { req, res, next }
    );
};

var actionUpdatePersonDepartmentTeam = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let departmentTeamID = req.params.departmentTeamID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE people_team_department'
                        + ' SET team_id = ?'
                        + ' WHERE id = ?;'
                        ;
    places.push(data.team_id, departmentTeamID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updatePersonDepartmentTeam = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdatePersonDepartmentTeam(options) },
        { req, res, next }
    );
};

var actionDeletePersonDepartmentTeam = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let departmentTeamID = req.params.departmentTeamID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM people_team_department'
                        + ' WHERE id = ?;'
                        ;
    places.push(departmentTeamID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.deletePersonDepartmentTeam = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeletePersonDepartmentTeam(options) },
        { req, res, next }
    );
};