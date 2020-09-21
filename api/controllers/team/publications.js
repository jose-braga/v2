const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const notifications = require('../utilities/notifications');


var actionGetTeamPublications = function (options) {
    // TODO: eliminate group_id from labs_publications??
    // TODO: create groups_publications??
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT DISTINCT labs_publications.public, labs_publications.selected,'
                        + ' publications.*, journals.name, journals.short_name AS journal_short_name'
                        + ' FROM labs_publications'
                        + ' JOIN publications ON publications.id = labs_publications.publication_id'
                        + ' LEFT JOIN journals ON journals.id = publications.journal_id'
                        + ' WHERE labs_publications.lab_id = ?;';
    places.push(labID);
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
    let labID = req.params.labID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO labs_publications'
                        + ' (lab_id, publication_id)'
                        + ' VALUES (?,?);';
    places.push(labID, data.id);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = {
                entityType: 'publications',
                entityID: data.id
            };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "OK - Associated lab with publication!"
            }
        });
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
    let labID = req.params.labID;
    let publicationID = req.params.publicationID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE labs_publications'
                        + ' SET public = ?,'
                        + ' selected = ?'
                        + ' WHERE lab_id = ? AND publication_id = ?;';
    places.push(data.public, data.selected, labID, publicationID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = {
                entityType: 'publications',
                entityID: publicationID
            };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "OK - Updated lab association with publication!"
            }
        });
};

module.exports.updateTeamPublication = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateTeamPublication(options) },
        { req, res, next }
    );
};

var actionDissociateTeamPublication = function (options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    let publicationID = req.params.publicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM labs_publications WHERE lab_id = ? AND publication_id = ?;';
    places.push(labID, publicationID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = {
                entityType: 'publications',
                entityID: publicationID
            };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "OK - Dissociated lab with publication!"
            }
        });
};


module.exports.dissociateTeamPublication = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDissociateTeamPublication(options) },
        { req, res, next }
    );
};

var getMembersPublications = function (options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT DISTINCT publications.*, journals.name, journals.short_name AS journal_short_name'
                        + ' FROM people_publications'
                        + ' JOIN publications ON publications.id = people_publications.publication_id'
                        + ' JOIN people_labs ON people_labs.person_id = people_publications.person_id'
                        + ' LEFT JOIN journals ON journals.id = publications.journal_id'
                        + ' WHERE people_labs.lab_id = ?;';
    places.push(labID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.getMembersPublications = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { getMembersPublications(options) },
        { req, res, next }
    );
};
