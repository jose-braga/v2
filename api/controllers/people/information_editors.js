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
                    // the editor should have access to the following 4 HTTP methods: GET, PUT, POST, DELETE
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

var actionCreateEditor = function (options, method) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    let method_id;
    if (method === 'GET') {
        method_id = 1;
    } else if (method === 'POST') {
        method_id = 2;
    } else if (method === 'PUT') {
        method_id = 3;
    } else if (method === 'DELETE') {
        method_id = 4;
    }
    querySQL = querySQL + 'INSERT INTO permissions_endpoints'
                        + ' (user_id, method_id, resource1_type_id, resource1_id, resource1_resource_id_generic, allow_all_subpaths)'
                        + ' VALUES (?,?,?,?,?,?);';
    places.push(data.user_id, method_id, 1, personID, 0, 1);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (method === 'GET') {
                return actionCreateEditor(options, 'POST')
            } else if (method === 'POST') {
                return actionCreateEditor(options, 'PUT')
            } else if (method === 'PUT') {
                return actionCreateEditor(options, 'DELETE')
            } else if (method === 'DELETE') {
                return createWebAreaPermission(options);
            }
        },
        options )
};
var createWebAreaPermission = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO permissions_web_app_areas'
                        + ' (user_id, app_area_id)'
                        + ' SELECT * FROM (SELECT ? AS user_id, ? AS app_area_id) AS tmp'
                        + ' WHERE NOT EXISTS ('
                          + ' SELECT * FROM permissions_web_app_areas'
                          + ' WHERE user_id <=> ? AND app_area_id <=> ?'
                        + ');';
    // 10 is the ID if the On behalf area
    places.push(data.user_id, 10, data.user_id, 10);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "message": "Creation of information editor was successful.",
                }
            });
            return;
        },
        options )
};
module.exports.createEditor = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateEditor(options, 'GET') },
        { req, res, next }
    );
};

var actionDeleteEditor = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let editorUserID = req.params.editorUserID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM permissions_endpoints'
                        + ' WHERE user_id = ? AND resource1_id = ?'
                        + ' AND resource1_type_id = 1 AND resource1_resource_id_generic = 0'
                        + ' AND allow_all_subpaths = 1 AND resource2_type_id IS NULL;';
    places.push(editorUserID, personID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.deleteEditor = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteEditor(options) },
        { req, res, next }
    );
};