
const sql = require('../utilities/sql');
//const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

var actionGetPersonalAddress = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from personal_addresses WHERE person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.getPersonalAddress = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPersonalAddress(options) },
        { req, res, next }
    );
};

var actionUpdatePersonalAddress = function(options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let addressID = req.params.addressID;
    let data = req.body.data.personal_addresses;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE personal_addresses'
        + ' SET address = ?,'
        + ' postal_code = ?,'
        + ' city = ?'
        + ' WHERE id = ? AND person_id = ?;';
    places.push(
        data.address,
        data.postal_code,
        data.city,
        addressID,
        personID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.updatePersonalAddress = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdatePersonalAddress(options) },
        { req, res, next }
    );
};

var actionCreatePersonalAddress = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data.personal_addresses;
    var querySQL = '';
    var places = [];
    // item already existed, update
    querySQL = querySQL + 'INSERT INTO personal_addresses (person_id, address, postal_code, city)'
        + 'VALUES (?,?,?,?);'
    places.push(
        personID,
        data.address,
        data.postal_code,
        data.city
        );
    return sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.createPersonalAddress = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreatePersonalAddress(options) },
        { req, res, next }
    );
};

var actionGetPersonalPhone = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from personal_phones WHERE person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.getPersonalPhone = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPersonalPhone(options) },
        { req, res, next }
    );
};

var actionUpdatePersonalPhone = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let phoneID = req.params.phoneID;
    let data = req.body.data.personal_phones;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE personal_phones'
        + ' SET phone = ?'
        + ' WHERE id = ? AND person_id = ?;';
    places.push(
        data.phone,
        phoneID,
        personID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.updatePersonalPhone = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdatePersonalPhone(options) },
        { req, res, next }
    );
};

var actionCreatePersonalPhone = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data.personal_phones;
    var querySQL = '';
    var places = [];
    // item already existed, update
    querySQL = querySQL + 'INSERT INTO personal_phones (person_id, phone)'
        + 'VALUES (?,?);'
    places.push(
        personID,
        data.phone
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.createPersonalPhone = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreatePersonalPhone(options) },
        { req, res, next }
    );
};

var actionGetPersonalEmail = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from personal_emails WHERE person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.getPersonalEmail = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPersonalEmail(options) },
        { req, res, next }
    );
};

var actionUpdatePersonalEmail = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let emailID = req.params.emailID;
    let data = req.body.data.personal_emails;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE personal_emails'
        + ' SET email = ?'
        + ' WHERE id = ? AND person_id = ?;';
    places.push(
        data.email,
        emailID,
        personID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.updatePersonalEmail = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdatePersonalEmail(options) },
        { req, res, next }
    );
};

var actionCreatePersonalEmail = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data.personal_emails;
    var querySQL = '';
    var places = [];
    // item already existed, update
    querySQL = querySQL + 'INSERT INTO personal_emails (person_id, email)'
        + 'VALUES (?,?);'
    places.push(
        personID,
        data.email
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.createPersonalEmail = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreatePersonalEmail(options) },
        { req, res, next }
    );
};


