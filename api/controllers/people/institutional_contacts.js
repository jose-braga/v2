const sql = require('../utilities/sql');
const permissions = require('../utilities/permissions');

var actionGetInstitutionalPhone = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from phones WHERE person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getInstitutionalPhone = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetInstitutionalPhone(options) },
        { req, res, next }
    );
};

var actionUpdateInstitutionalPhone = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let phoneID = req.params.phoneID;
    let data = req.body.data.phones;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE phones'
        + ' SET phone = ?, extension = ?'
        + ' WHERE id = ? AND person_id = ?;';
    places.push(
        data.phone,
        data.extension,
        phoneID,
        personID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateInstitutionalPhone = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateInstitutionalPhone(options) },
        { req, res, next }
    );
};

var actionCreateInstitutionalPhone = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data.phones;
    var querySQL = '';
    var places = [];
    // item already existed, update
    querySQL = querySQL + 'INSERT INTO phones (person_id, phone, extension)'
        + 'VALUES (?,?,?);'
    places.push(
        personID,
        data.phone,
        data.extension
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createInstitutionalPhone = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateInstitutionalPhone(options) },
        { req, res, next }
    );
};

var actionGetInstitutionalEmail = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from emails WHERE person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getInstitutionalEmail = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetInstitutionalEmail(options) },
        { req, res, next }
    );
};

var actionUpdateInstitutionalEmail = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let emailID = req.params.emailID;
    let data = req.body.data.emails;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE emails'
        + ' SET email = ?'
        + ' WHERE id = ? AND person_id = ?;';
    places.push(
        data.email,
        emailID,
        personID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateInstitutionalEmail = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateInstitutionalEmail(options) },
        { req, res, next }
    );
};

var actionCreateInstitutionalEmail = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data.emails;
    var querySQL = '';
    var places = [];
    // item already existed, update
    querySQL = querySQL + 'INSERT INTO emails (person_id, email)'
        + 'VALUES (?,?);'
    places.push(
        personID,
        data.email
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createInstitutionalEmail = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateInstitutionalEmail(options) },
        { req, res, next }
    );
};