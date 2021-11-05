const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const notifications = require('../utilities/notifications');


var actionGetTeamPublications = function (options) {
    // TODO: eliminate group_id from labs_publications??
    // TODO: create groups_publications??
    let { req, res, next } = options;
    let depTeamID = req.params.depTeamID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT DISTINCT department_teams_publications.selected,'
                        + ' publications.*, journals.name, journals.short_name AS journal_short_name'
                        + ' FROM department_teams_publications'
                        + ' JOIN publications ON publications.id = department_teams_publications.publication_id'
                        + ' LEFT JOIN journals ON journals.id = publications.journal_id'
                        + ' WHERE department_teams_publications.department_team_id = ?;';
    places.push(depTeamID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getTeamPublications = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetTeamPublications(options) },
        { req, res, next }
    );
};

var actionAssociateTeamPublication = function (options) {
    let { req, res, next } = options;
    let depTeamID = req.params.depTeamID;
    let data = req.body.data;
    let publication = data.publication;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO department_teams_publications'
                        + ' (department_team_id, publication_id)'
                        + ' VALUES (?,?);';
    places.push(depTeamID, publication.id);
    return sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.associateTeamPublication = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            actionAssociateTeamPublication(options) },
        { req, res, next }
    );
};

var actionUpdateTeamPublication = function (options) {
    let { req, res, next } = options;
    let depTeamID = req.params.depTeamID;
    let publicationID = req.params.publicationID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE department_teams_publications'
                        + ' SET selected = ?'
                        + ' WHERE department_team_id = ? AND publication_id = ?;';
    places.push(data.selected, depTeamID, publicationID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateTeamPublication = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateTeamPublication(options) },
        { req, res, next }
    );
};

var actionDissociateTeamPublication = function (options) {
    let { req, res, next } = options;
    let depTeamID = req.params.depTeamID;
    let publicationID = req.params.publicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM department_teams_publications WHERE department_team_id = ? AND publication_id = ?;';
    places.push(depTeamID, publicationID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.dissociateTeamPublication = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDissociateTeamPublication(options) },
        { req, res, next }
    );
};

var getMembersPublications = function (options) {
    let { req, res, next } = options;
    let depTeamID = req.params.depTeamID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT DISTINCT publications.*, journals.name, journals.short_name AS journal_short_name'
                        + ' FROM people_publications'
                        + ' JOIN publications ON publications.id = people_publications.publication_id'
                        + ' JOIN people_team_department ON people_team_department.person_id = people_publications.person_id'
                        + ' LEFT JOIN journals ON journals.id = publications.journal_id'
                        + ' WHERE people_team_department.team_id = ?;';
    places.push(depTeamID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getMembersPublications = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { getMembersPublications(options) },
        { req, res, next }
    );
};
