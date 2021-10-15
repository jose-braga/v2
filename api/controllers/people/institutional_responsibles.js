const sql = require('../utilities/sql');
const permissions = require('../utilities/permissions');

/**
 * For reading responsibles data
 */

var actionGetResponsibles = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_responsibles.*, people.name, people.colloquial_name'
                        + ' FROM people_responsibles'
                        + ' JOIN people ON people.id = people_responsibles.responsible_id'
                        + ' WHERE people_responsibles.person_id = ?;';
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getResponsibles = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetResponsibles(options) },
        { req, res, next }
        );
};


/**
 * For changing responsibles data
 */
// TODO: Add people responsible history????????

var actionCreateResponsibles = function (options) {
    let { req, res, next, i } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    if (data.valid_from === '') data.valid_from = null;
    if (data.valid_until === '') data.valid_until = null;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO people_responsibles'
        + ' (person_id, responsible_id, responsible_type_id, valid_from, valid_until)'
        + ' VALUES (?,?,?,?,?);';
    places.push(personID,
        data.responsible_id,
        data.responsible_type_id,
        data.valid_from,
        data.valid_until
        );
    return sql.makeSQLOperation(req, res, querySQL, places);
};

var actionDeleteResponsibles = function (options) {
    let { req, res, next } = options;
    let peopleResponsibleID = req.params.peopleResponsibleID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM people_responsibles WHERE id = ?;';
    places.push(peopleResponsibleID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};

var actionUpdateResponsibles = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    if (data.valid_from === '') data.valid_from = null;
    if (data.valid_until === '') data.valid_until = null;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE people_responsibles'
                        + ' SET responsible_id = ?,'
                        + ' responsible_type_id = ?,'
                        + ' valid_from = ?,'
                        + ' valid_until = ?'
                        + ' WHERE id = ?;';
    places.push(data.responsible_id,
        data.responsible_type_id,
        data.valid_from,
        data.valid_until,
        data.id)
        return sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.updateResponsibles = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateResponsibles(options) },
        { req, res, next }
    );
};

module.exports.deleteResponsibles = function (req, res, next) {
    // we start by deleting first supervisors, then external supervisors
    // only then we delete the degree
    permissions.checkPermissions(
        (options) => { actionDeleteResponsibles(options) },
        { req, res, next }
    );
};

module.exports.createResponsibles = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateResponsibles(options) },
        { req, res, next }
    );
};