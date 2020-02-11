const sql = require('../utilities/sql');
const permissions = require('../utilities/permissions');

var actionGetIdentifications = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM identifications'
                        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.getIdentifications = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetIdentifications(options) },
        { req, res, next }
    );
};
var actionCreateIdentification = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO identifications'
                        + ' (person_id, card_type_id, card_number, valid_until)'
                        + ' VALUES (?, ?, ?, ?);';
    places.push(personID, data.card_type_id, data.card_number, data.valid_until)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.createIdentification = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateIdentification(options) },
        { req, res, next }
    );
};

var actionUpdateIdentification = function (options) {
    let { req, res, next } = options;
    let identificationID = req.params.identificationID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE identifications'
                        + ' SET card_type_id  = ?,'
                        + ' card_number = ?,'
                        + ' valid_until = ?'
                        + ' WHERE id = ?;';
    places.push(data.card_type_id, data.card_number, data.valid_until, identificationID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updateIdentification = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateIdentification(options) },
        { req, res, next }
    );
};

var actionDeleteIdentification = function (options) {
    let { req, res, next } = options;
    let identificationID = req.params.identificationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM identifications'
                        + ' WHERE id = ?;';
    places.push(identificationID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.deleteIdentification = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteIdentification(options) },
        { req, res, next }
    );
};