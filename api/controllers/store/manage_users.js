const sql = require('../utilities/sql');
const responses = require('../utilities/responses');

var actionGetUsers = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT accounts_people.id AS accounts_people_id,'
        + ' people.id AS person_id, people.user_id, people.colloquial_name, emails.email,'
        + ' account_roles.id AS role_id, account_roles.name_en AS role_name_en,'
        + ' accounts.id AS account_id, accounts.name_en AS account_name_en, accounts.name_pt AS account_name_pt, accounts.active AS account_active,'
        + ' cost_centers_orders.id AS cost_center_id, cost_centers_orders.name_en AS cost_center_name_en, cost_centers_orders.name_pt AS cost_center_name_pt'
        + ' FROM accounts_people'
        + ' LEFT JOIN account_roles ON account_roles.id = accounts_people.account_role_id'
        + ' LEFT JOIN accounts ON accounts.id = accounts_people.account_id'
        + ' LEFT JOIN cost_centers_orders ON cost_centers_orders.id = accounts.cost_center_id'
        + ' LEFT JOIN users ON users.id = accounts_people.user_id'
        + ' LEFT JOIN people ON people.user_id = users.id'
        + ' LEFT JOIN emails ON emails.person_id = people.id;';
    places.push()
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success",
                    "statusCode": 200,
                    "result": resQuery,
                }
            });
            return;
        },
        options);
};
module.exports.getUsers = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageUsers
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionGetUsers(options);
    } else {
        responses.sendJSONResponseOptions({
            response: res,
            status: 403,
            message: {
                "status": "success",
                "statusCode": 403,
                "message": "You do not have the necessary permissions.",
            }
        });
        return;
    }
};

var actionCreateUser = function (options) {
    let { req, res, next } = options;
    let user = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO accounts_people'
        + ' (user_id, account_id, account_role_id)'
        + ' VALUES (?,?,?)';
    places.push(
        user.user_id,
        user.account_id,
        user.role_id
    )
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createUser = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageUsers
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionCreateUser(options);
    } else {
        responses.sendJSONResponseOptions({
            response: res,
            status: 403,
            message: {
                "status": "success",
                "statusCode": 403,
                "message": "You do not have the necessary permissions.",
            }
        });
        return;
    }
};

module.exports.updateUser = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageUsers
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionUpdateStockItem(options);
    } else {
        responses.sendJSONResponseOptions({
            response: res,
            status: 403,
            message: {
                "status": "success",
                "statusCode": 403,
                "message": "You do not have the necessary permissions.",
            }
        });
        return;
    }
};

var actionDeleteUser = function (options) {
    let { req, res, next } = options;
    let accountPeopleID = req.params.accountPeopleID
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM accounts_people WHERE id = ?;';
    places.push(accountPeopleID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.deleteUser = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageUsers
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionDeleteUser(options);
    } else {
        responses.sendJSONResponseOptions({
            response: res,
            status: 403,
            message: {
                "status": "success",
                "statusCode": 403,
                "message": "You do not have the necessary permissions.",
            }
        });
        return;
    }
};