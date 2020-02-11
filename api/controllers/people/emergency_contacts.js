const sql = require('../utilities/sql');
const permissions = require('../utilities/permissions');

var actionGetEmergencyContacts = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM emergency_contacts'
                        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.getEmergencyContacts = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetEmergencyContacts(options) },
        { req, res, next }
    );
};
var actionCreateEmergencyContact = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO emergency_contacts'
                        + ' (person_id, name, phone)'
                        + ' VALUES (?, ?, ?);';
    places.push(personID, data.name, data.phone)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.createEmergencyContact = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateEmergencyContact(options) },
        { req, res, next }
    );
};

var actionUpdateEmergencyContact = function (options) {
    let { req, res, next } = options;
    let contactID = req.params.contactID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE emergency_contacts'
                        + ' SET name  = ?,'
                        + ' phone = ?'
                        + ' WHERE id = ?;';
    places.push(data.name, data.phone, contactID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updateEmergencyContact = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateEmergencyContact(options) },
        { req, res, next }
    );
};

var actionDeleteEmergencyContact = function (options) {
    let { req, res, next } = options;
    let contactID = req.params.contactID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM emergency_contacts'
                        + ' WHERE id = ?;';
    places.push(contactID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.deleteEmergencyContact = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteEmergencyContact(options) },
        { req, res, next }
    );
};