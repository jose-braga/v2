const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const notifications = require('../utilities/notifications');


var actionGetResearcherIDs = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT researchers_info.*,'
            + ' institutional_repositories.short_name AS repository_short_name'
            + ' FROM researchers_info'
            + ' LEFT JOIN institutional_repositories ON institutional_repositories.id = researchers_info.institutional_repository_id'
            + ' WHERE person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getResearcherIDs = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            actionGetResearcherIDs(options);
        },
        { req, res, next }
    );
};

var actionUpdateResearcherIDs = function(options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let researcherInfoID = req.params.researcherInfoID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE researchers_info'
        + ' SET researcherID = ?,'
        + ' ORCID = ?,'
        + ' scopusID = ?,'
        + ' institutional_repository_id = ?,'
        + ' pure_id = ?,'
        + ' ciencia_id = ?,'
        + ' association_key = ?'
        + ' WHERE id = ?;';
    places.push(
        data.researcherID,
        data.ORCID,
        data.scopusID,
        data.institutional_repository_id,
        data.pure_id,
        data.ciencia_id,
        data.association_key,
        researcherInfoID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            options.researcherInfoID = researcherInfoID;
            options.personID = personID;
            options.operation = 'update'
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig);
            return actionAddResearcherInfoHistory(options)
        },
        options);
};
module.exports.updateResearcherIDs = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            actionUpdateResearcherIDs(options);
        },
        { req, res, next }
    );
};

var actionCreateResearcherIDs = function(options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO researchers_info'
        + '(person_id, researcherID, ORCID, scopusID, institutional_repository_id,'
        + ' pure_id, ciencia_id, association_key)'
        + ' VALUES (?,?,?,?,?,?,?,?);';
    places.push(
        personID,
        data.researcherID,
        data.ORCID,
        data.scopusID,
        data.institutional_repository_id,
        data.pure_id,
        data.ciencia_id,
        data.association_key);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.researcherInfoID = resQuery.insertId;
            options.personID = personID;
            options.operation = 'create'
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return actionAddResearcherInfoHistory(options)
        },
        options);
};
var actionAddResearcherInfoHistory = function(options) {
    let now = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
    let { req, res, next, personID, researcherInfoID } = options;
    let data = req.body.data;
    let created = null, updated = null;
    let operation;
    if (options.operation = 'create') {
        created = now;
        operation = 'C';
    } else {
        updated = now;
        operation = 'U';
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO researchers_info_history'
        + '(researchers_info_id, person_id, researcherID, ORCID, scopusID,'
        + ' institutional_repository_id, pure_id, ciencia_id, association_key,'
        + ' created, updated, operation, changed_by)'
        + ' VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);';
    places.push(
        researcherInfoID,
        personID,
        data.researcherID,
        data.ORCID,
        data.scopusID,
        data.institutional_repository_id,
        data.pure_id,
        data.ciencia_id,
        data.association_key,
        created,
        updated,
        operation,
        data.changed_by
        );
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createResearcherIDs = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            actionCreateResearcherIDs(options);
        },
        { req, res, next }
    );
};