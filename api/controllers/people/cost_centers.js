const sql = require('../utilities/sql');
const permissions = require('../utilities/permissions');

var actionGetCostCenters = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM people_cost_centers'
                        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getCostCenters = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetCostCenters(options) },
        { req, res, next }
        );
};
var actionCreateCostCenters = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO people_cost_centers'
                        + ' (person_id, cost_center_id, valid_from, valid_until)'
                        + ' VALUES (?, ?, ?, ?);';
    places.push(personID, data.cost_center_id, data.valid_from, data.valid_until)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.createCostCenters = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateCostCenters(options) },
        { req, res, next }
        );
};
var actionUpdateCostCenters = function (options) {
    let { req, res, next } = options;
    let costCenterID = req.params.costCenterID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE people_cost_centers'
                        + ' SET cost_center_id = ?,'
                        + ' valid_from = ?,'
                        + ' valid_until = ?'
                        + ' WHERE id = ?;';
    places.push(data.cost_center_id,
        data.valid_from,
        data.valid_until,
        costCenterID);
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updateCostCenters = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateCostCenters(options) },
        { req, res, next }
        );
};
var actionDeleteCostCenters = function (options) {
    let { req, res, next } = options;
    let costCenterID = req.params.costCenterID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM people_cost_centers'
                        + ' WHERE id = ?;';
    places.push(costCenterID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.deleteCostCenters = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteCostCenters(options) },
        { req, res, next }
        );
};