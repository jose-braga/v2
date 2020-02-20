const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const time = require('../utilities/time');
const permissions = require('../utilities/permissions');


var actionGetEditors = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    //let userID = req.payload.userID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM permissions_endpoints'
                        + ' WHERE resource1_type_id = 1'
                        + ' AND resource1_id = ?'
                        + ' AND resource1_resource_id_generic = 0'
                        + ' AND resource2_type_id IS NULL'
                        + ' AND allow_all_subpaths = 1;'
                        ;
    places.push(personID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let editors = [];
            let usedUserIDs = [];
            for (let ind in resQuery) {
                if (usedUserIDs.indexOf(resQuery[ind].user_id) === -1) {
                    usedUserIDs.push(resQuery[ind].user_id)
                    let rowsEditor = resQuery.filter( editor => editor.user_id === resQuery[ind].user_id);
                    // the editor should have access to the 4 HTTP methods: GET, PUT, POST, DELETE
                    // (there could be people with just GET method permissions)
                    if (rowsEditor.length === 4) {
                        editors.push({user_id: resQuery[ind].user_id});
                    }
                }
            }
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success",
                    "statusCode": 200,
                    "result": editors,
                }
            });
            return;
        },
        options);
};
module.exports.getEditors = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetEditors(options) },
        { req, res, next }
    );
};

var actionCreateEditor = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO cars'
                        + ' (person_id, license, brand, model, color, plate)'
                        + ' VALUES (?,?,?,?,?,?);';
    places.push(personID, data.license, data.brand,
        data.model, data.color, data.plate)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.createEditor = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateEditor(options) },
        { req, res, next }
    );
};

var actionUpdateEditor = function (options) {
    let { req, res, next } = options;
    let carID = req.params.carID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE cars'
                        + ' SET license  = ?,'
                        + ' brand = ?,'
                        + ' model = ?,'
                        + ' color = ?,'
                        + ' plate = ?'
                        + ' WHERE id = ?;';
    places.push(data.license, data.brand, data.model,
        data.color, data.plate, carID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updateEditor = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateEditor(options) },
        { req, res, next }
    );
};

var actionDeleteEditor = function (options) {
    let { req, res, next } = options;
    let carID = req.params.carID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM cars'
                        + ' WHERE id = ?;';
    places.push(carID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.deleteEditor = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteEditor(options) },
        { req, res, next }
    );
};