const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

var actionGetAuthorization = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM people'
                        + ' WHERE id = ?;';
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.getAuthorization = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetAuthorization(options) },
        { req, res, next }
    );
};

var actionUpdateAuthorization = function (options) {
    let { req, res, next } = options;
    let now = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
    options.now = now;
    let data = req.body.data;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE people'
        + ' SET visible_public = ?'
        + ' WHERE id = ?;';
    places.push(data.visible_public, personID)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => { actionAddPeopleHistory(options) },
        options);
};

var actionAddPeopleHistory = function (options) {
    let { req, res, next, now } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO people_history'
        + ' (person_id, user_id, name, colloquial_name, birth_date, gender, active_from, active_until, status, visible_public, updated, operation, changed_by)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    places.push(
        personID,
        data.user_id,
        data.name,
        data.colloquial_name,
        time.momentToDate(data.birth_date),
        data.gender,
        time.momentToDate(data.valid_from),
        time.momentToDate(data.valid_until),
        data.status,
        data.visible_public,
        now,
        'U',
        req.payload.userID
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => { responses.sendJSONResponseOptions(options) },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "OK - Created people history entry!"
            }
        })

}

module.exports.updateAuthorization = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateAuthorization(options) },
        { req, res, next }
    );
};