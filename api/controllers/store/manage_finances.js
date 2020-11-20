const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const time = require('../utilities/time');

var actionGetCostCenters = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM cost_centers_orders;';
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.costCenters = resQuery;
            if (resQuery.length > 0) {
                options.i = 0;
                return getCostCenterAccounts(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "result":  [],
                    }
                });
                return;
            }
        },
        options
    );
};
var getCostCenterAccounts = function (options) {
    let { req, res, next, costCenters, i } = options;
    let costCenter = costCenters[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT accounts.*, cost_centers_orders.name_en AS cost_center_name_en'
        + ' FROM accounts'
        + ' JOIN cost_centers_orders ON cost_centers_orders.id = accounts.cost_center_id'
        + ' WHERE cost_center_id = ?;';
    places.push(costCenter.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            //options.req.body.data.posters[i].poster_id = resQuery.insertId;
            options.costCenters[i].accounts = resQuery;
            if (resQuery.length > 0) {
                options.j = 0;
                return getCostCenterAccountFinances(options);
            } else if (i + 1 < costCenters.length) {
                options.i = i + 1;
                return getCostCenterAccounts(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "result":  options.costCenters,
                    }
                });
                return;
            }
        },
        options);
};
var getCostCenterAccountFinances = function (options) {
    let { req, res, next, costCenters, i, j } = options;
    let costCenter = costCenters[i];
    let account = costCenter.accounts[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM account_finances WHERE account_id = ?;';
    places.push(account.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            //options.req.body.data.posters[i].poster_id = resQuery.insertId;
            options.costCenters[i].accounts[j].finances = resQuery;
            if (j + 1 < options.costCenters[i].accounts.length) {
                options.j = j + 1;
                return getCostCenterAccountFinances(options);
            } else if (i + 1 < costCenters.length) {
                options.i = i + 1;
                return getCostCenterAccounts(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "result":  options.costCenters,
                    }
                });
                return;
            }
        },
        options);
};
module.exports.getCostCenters = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageFinances
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionGetCostCenters(options);
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

var actionCreateCostCenter = function (options) {
    let { req, res, next } = options;
    let item = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO cost_centers_orders'
        + ' (name_en, name_pt, active)'
        + ' VALUES (?,?,?)';
    places.push(
        item.name_en,
        item.name_en,
        1
    )
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createCostCenter = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageFinances
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionCreateCostCenter(options);
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
var actionUpdateCostCenter = function (options) {
    let { req, res, next } = options;
    let item = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE cost_centers_orders'
        + ' SET name_en = ?,'
        + ' name_pt = ?,'
        + ' active = ?'
        + ' WHERE id = ?;';
    places.push(
        item.name_en,
        item.name_en,
        item.active,
        item.id
    )
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateCostCenter = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageFinances
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionUpdateCostCenter(options);
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
module.exports.deleteCostCenter = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageFinances
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionGetStockItems(options);
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
var actionCreateCostCenterAccount = function (options) {
    let { req, res, next } = options;
    let item = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO accounts'
        + ' (name_en, name_pt, cost_center_id, active)'
        + ' VALUES (?,?,?,?)';
    places.push(
        item.name_en,
        item.name_en,
        item.cost_center_id,
        item.active
    )
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createCostCenterAccount = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageFinances
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionCreateCostCenterAccount(options);
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
var actionUpdateCostCenterAccount = function (options) {
    let { req, res, next } = options;
    let item = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE accounts'
        + ' SET name_en = ?,'
        + ' name_pt = ?,'
        + ' cost_center_id = ?,'
        + ' active = ?'
        + ' WHERE id = ?;';
    places.push(
        item.name_en,
        item.name_en,
        item.cost_center_id,
        item.active,
        item.id
    )
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateCostCenterAccount = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageFinances
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionUpdateCostCenterAccount(options);
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
module.exports.deleteCostCenterAccount = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageFinances
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionGetStockItems(options);
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

var actionCreateCostCenterAccountFinance = function (options) {
    let { req, res, next } = options;
    let item = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO account_finances'
        + ' (account_id, initial_amount, current_amount, amount_requests,'
        + ' current_amount_tax, amount_requests_tax, year)'
        + ' VALUES (?,?,?,?,?,?,?)';
    places.push(
        item.account_id,
        parseFloat(item.initial_amount),
        parseFloat(item.initial_amount),
        parseFloat(item.amount_requests),
        parseFloat(item.initial_amount),
        parseFloat(item.amount_requests_tax),
        item.year
    )
    options.action = 'create';
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.account_finance_id = resQuery.insertId;
            return createAccountFinanceHistory(options);
        },
        options
    );
};
module.exports.createCostCenterAccountFinance = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageFinances
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionCreateCostCenterAccountFinance(options);
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
var actionUpdateCostCenterAccountFinance = function (options) {
    let { req, res, next } = options;
    let item = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE account_finances'
        + ' SET initial_amount = ?,'
        + ' current_amount = ?,'
        + ' amount_requests = ?,'
        + ' current_amount_tax = ?,'
        + ' amount_requests_tax = ?'
        + ' WHERE id = ?;';
    places.push(
        parseFloat(item.initial_amount),
        parseFloat(item.current_amount) + parseFloat(item.initial_amount) - parseFloat(item.old_initial_amount),
        parseFloat(item.amount_requests),
        parseFloat(item.current_amount_tax) + parseFloat(item.initial_amount) - parseFloat(item.old_initial_amount),
        parseFloat(item.amount_requests_tax),
        item.id
    )
    options.action = 'update';
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return createAccountFinanceHistory(options);
        },
        options
    );
};
var createAccountFinanceHistory = function (options) {
    let { req, res, next, action, account_finance_id } = options;
    let item = req.body.data;
    var querySQL = '';
    var places = [];
    let operation;
    if (action === 'create') operation = 'C';
    if (action === 'update') operation = 'U';
    querySQL = querySQL
        + 'INSERT INTO account_finances_history'
        + ' (account_finance_id, account_id, initial_amount, current_amount, amount_requests,'
        + ' current_amount_tax, amount_requests_tax, year, datetime)'
        + ' VALUES (?,?,?,?,?,?,?,?, NOW())';
    if (action === 'create') {
        places.push(
            account_finance_id,
            item.account_id,
            parseFloat(item.initial_amount),
            parseFloat(item.initial_amount),
            parseFloat(item.amount_requests),
            parseFloat(item.initial_amount),
            parseFloat(item.amount_requests_tax),
            item.year
        );
    } else if (action === 'update') {
        places.push(
            item.id,
            item.account_id,
            parseFloat(item.initial_amount),
            parseFloat(item.current_amount) + parseFloat(item.initial_amount) - parseFloat(item.old_initial_amount),
            parseFloat(item.amount_requests),
            parseFloat(item.current_amount_tax) + parseFloat(item.initial_amount) - parseFloat(item.old_initial_amount),
            parseFloat(item.amount_requests_tax),
            item.year
        );
    }
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateCostCenterAccountFinance = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageFinances
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionUpdateCostCenterAccountFinance(options);
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