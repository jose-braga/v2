const sql = require('../utilities/sql');
const time = require('../utilities/time');
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
    let publication = data.publication;
    let labData = data.labData;
    let currentUnit;
    let currentGroup;
    var querySQL = '';
    var places = [];
    for (let ind in labData.groups_history) {
        let grp_valid_from = time.momentToDate(labData.groups_history[ind].valid_from)
        let grp_valid_until = time.momentToDate(labData.groups_history[ind].valid_until)
        let today = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD');
        if ((grp_valid_from === null || grp_valid_from <= today)
            && (grp_valid_until === null || grp_valid_until >= today)
        ) {
            currentGroup = labData.groups_history[ind].id
            // a unit history has always just a single entry
            currentUnit = labData.groups_history[ind].units_history[0].id
            break
        }
    }
    options.currentUnit = currentUnit;
    querySQL = querySQL + 'INSERT INTO labs_publications'
                        + ' (lab_id, group_id, publication_id)'
                        + ' VALUES (?,?,?);';
    places.push(labID, currentGroup, publication.id);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return actionAssociateUnitPublication(options)
        },
        options);
};
var actionAssociateUnitPublication = function (options) {
    let { req, res, next, currentUnit } = options;
    let data = req.body.data;
    let publication = data.publication;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO units_publications'
                        + ' (unit_id, publication_id, public)'
                        + ' SELECT ?, ?, ? FROM DUAL'
                        + ' WHERE NOT EXISTS (SELECT *'
                        +       ' FROM units_publications'
                        +       ' WHERE unit_id = ? AND publication_id = ?'
                        +    ');';
    places.push(currentUnit, publication.id, 1, currentUnit, publication.id);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (currentUnit === 1) {
                let notificationConfig = {
                    entityType: 'publications',
                    entityID: data.id
                };
                notifications.notifyWebsiteAPI(notificationConfig)
            }
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
