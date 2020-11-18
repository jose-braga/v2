const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const time = require('../utilities/time');

var actionGetStockItems = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT items.*,'
        + ' quantity_types.name_plural_en AS unit_plural_en, quantity_types.name_singular_en  AS unit_singular_en,'
        + ' quantity_types.name_plural_pt AS unit_plural_pt, quantity_types.name_singular_pt AS unit_singular_pt,'
        + ' quantity_types.decimal,'
        + ' stock.id AS stock_id, stock.quantity_in_stock_decimal, stock.quantity_in_requests_decimal,'
        + ' stock.quantity_in_stock, stock.quantity_in_requests, stock.status_id,'
        + ' stock_item_statuses.name_en AS status_en, stock_item_statuses.name_pt AS status_pt,'
        + ' stock_item_statuses.description_en AS status_description_en, stock_item_statuses.description_pt AS status_description_pt'
        + ' FROM items'
        + ' LEFT JOIN quantity_types ON quantity_types.id = items.quantity_type_id'
        + ' LEFT JOIN stock ON stock.item_id = items.id'
        + ' LEFT JOIN stock_item_statuses ON stock_item_statuses.id = stock.status_id'
        + ' WHERE stock.deleted = ?;';
    places.push(0)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.inventory = resQuery;
                options.i = 0
                return getItemCategories(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "result": [],
                    }
                });
                return;
            }
        },
        options);
};
var getItemCategories = function (options) {
    let { req, res, next, inventory, i } = options;
    let item = inventory[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT items_categories.id AS items_categories_id, items_categories.category_id AS id,'
        + ' list_categories.name_en, list_categories.name_pt,'
        + ' list_categories.description_en, list_categories.description_pt'
        + ' FROM items_categories'
        + ' JOIN list_categories ON list_categories.id = items_categories.category_id'
        + ' WHERE items_categories.item_id = ?;';
    places.push(item.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.inventory[i].item_categories = resQuery;
            if (i + 1 < options.inventory.length) {
                options.i = i + 1;
                return getItemCategories(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "result": options.inventory,
                    }
                });
                return;
            }
        },
        options);
};

module.exports.getStockItems = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageStock
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

var actionCreateStockItem = function (options) {
    let { req, res, next } = options;
    let item = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO items'
        + ' (name_en, brand, reference, quantity_type_id,'
        + ' current_unit_price, tax, visible)'
        + ' VALUES (?,?,?,?,?,?,?)';
    places.push(
        item.name_en,
        item.brand,
        item.reference,
        item.quantity_type_id,
        item.current_unit_price,
        item.tax,
        item.visible
    )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.operation = 'create';
            options.item_id = resQuery.insertId;
            if (item.item_categories.length > 0) {
                options.i = 0;
                return createStockItemCategories(options);
            } else {
                return createStockItemStock(options);
            }

        },
        options);
};
var createStockItemCategories = function (options) {
    let { req, res, next, item_id, i } = options;
    let item = req.body.data;
    let category = item.item_categories[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO items_categories (item_id, category_id)'
        + ' VALUES (?, ?)';
    places.push(item_id, category.id);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < item.item_categories.length) {
                options.i = i + 1;
                return createStockItemCategories(options);
            } else {
                return createStockItemStock(options);
            }
        },
        options);
};
var createStockItemStock = function (options) {
    let { req, res, next, item_id } = options;
    let item = req.body.data;
    var querySQL = '';
    var places = [];
    if (item.decimal === 1 || item.decimal === true) {
        querySQL = querySQL
            + 'INSERT INTO stock'
            + ' (item_id, quantity_in_stock_decimal,'
            + ' quantity_in_requests_decimal, status_id, deleted)'
            + ' VALUES (?,?,?,?,?)';
        places.push(
            item_id,
            item.quantity_in_stock_decimal,
            0,
            item.status_id,
            0
        );
    } else {
        querySQL = querySQL
            +  'INSERT INTO stock'
            + ' (item_id, quantity_in_stock,'
            + ' quantity_in_requests, status_id, deleted)'
            + ' VALUES (?,?,?,?,?)';
        places.push(
            item_id,
            item.quantity_in_stock,
            0,
            item.status_id,
            0
        );
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.stock_id = resQuery.insertId;
            return createStockItemCostHistory(options);
        },
        options);
};
var createStockItemCostHistory = function (options) {
    let { req, res, next, item_id } = options;
    let item = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO items_unit_prices_history'
        + ' (item_id, price, tax, timestamp)'
        + ' VALUES (?,?,?,NOW());';
    places.push(
        item_id,
        item.current_unit_price,
        item.tax
    )
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return writeStockItemHistory(options);
        },
        options);
};
module.exports.createStockItem = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageStock
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionCreateStockItem(options);
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

var actionUpdateStockItem = function (options) {
    // update item, then
    // update stock, then
    // update item categories, then
    // update cost history, then
    // insert writeStockItemHistory
    let { req, res, next } = options;
    let stockItemID = req.params.stockItemID;
    let item = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE items'
        + ' SET name_en = ?,'
        + ' brand = ?,'
        + ' reference = ?,'
        + ' quantity_type_id = ?,'
        + ' current_unit_price = ?,'
        + ' tax = ?,'
        + ' visible = ?'
        + ' WHERE id = ?;';
    places.push(
        item.name_en,
        item.brand,
        item.reference,
        item.quantity_type_id,
        item.current_unit_price,
        item.tax,
        item.visible,
        item.id
    )
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            options.operation = 'update';
            return updateStockItemQuantities(options);
        },
        options);
};
var updateStockItemQuantities = function (options) {
    let { req, res, next } = options;
    let stockItemID = req.params.stockItemID;
    let item = req.body.data;
    var querySQL = '';
    var places = [];
    if (item.quantity_in_stock_decimal === '') {
        item.quantity_in_stock_decimal = null;
    }
    if (item.quantity_in_stock === '') {
        item.quantity_in_stock = null;
    }
    querySQL = querySQL
        + 'UPDATE stock'
        + ' SET quantity_in_stock_decimal = ?,'
        + ' quantity_in_stock = ?,'
        + ' quantity_in_requests_decimal = ?,'
        + ' quantity_in_requests = ?,'
        + ' status_id = ?'
        + ' WHERE id = ?;';
    places.push(
        item.quantity_in_stock_decimal,
        item.quantity_in_stock,
        item.quantity_in_requests_decimal,
        item.quantity_in_requests,
        item.status_id,
        item.stock_id
    )
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deletePreviousStockItemCategories(options);
        },
        options);
};
var deletePreviousStockItemCategories = function (options) {
    let { req, res, next } = options;
    let item = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM items_categories WHERE item_id = ?;';
    places.push(item.id)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (item.item_categories.length > 0) {
                options.i = 0;
                return updateStockItemCategories(options);
            } else {
                return updateStockItemCostHistory(options);
            }
        },
        options);
};
var updateStockItemCategories = function (options) {
    let { req, res, next, i } = options;
    let item = req.body.data;
    let category = item.item_categories[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO items_categories (item_id, category_id)'
        + ' VALUES (?, ?)';
    places.push(item.id, category.id);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < item.item_categories.length) {
                options.i = i + 1;
                return updateStockItemCategories(options);
            } else {
                return updateStockItemCostHistory(options);
            }
        },
        options);
};
var updateStockItemCostHistory = function (options) {
    let { req, res, next } = options;
    let stockItemID = req.params.stockItemID;
    let item = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO items_unit_prices_history'
        + ' (item_id, price, tax, timestamp)'
        + ' VALUES (?,?,?,NOW());';
    places.push(
        item.id,
        item.current_unit_price,
        item.tax
    )
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return writeStockItemHistory(options);
        },
        options);
};
module.exports.updateStockItem = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageStock
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

var actionDeleteStockItem = function (options) {
    let { req, res, next } = options;
    let stockItemID = req.params.stockItemID
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE stock SET deleted = 1 WHERE id = ?;';
    places.push(stockItemID)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            options.operation = 'delete';
            return writeStockItemHistory(options);
        },
        options);
};
var writeStockItemHistory = function (options) {
    let { req, res, next, operation } = options;
    let stockItemID = req.params.stockItemID
    var querySQL = '';
    var places = [];
    if (operation === 'delete') {
        querySQL = querySQL
            + 'INSERT INTO stock_history'
            + ' (stock_id, operation, timestamp)'
            + ' VALUES (?,?,NOW());';
        places.push(stockItemID, 'D')
    } else if (operation === 'update') {
        let item = req.body.data;
        querySQL = querySQL
            + 'INSERT INTO stock_history'
            + ' (stock_id, item_id, quantity_in_stock_decimal, quantity_in_requests_decimal,'
            + ' quantity_in_stock, quantity_in_requests, status_id, operation, timestamp)'
            + ' VALUES (?,?,?,?,?,?,?,?, NOW());';
        places.push(
            item.stock_id,
            item.id,
            item.quantity_in_stock_decimal,
            item.quantity_in_requests_decimal,
            item.quantity_in_stock,
            item.quantity_in_requests,
            item.status_id,
            'U'
        );
    } else if (operation === 'create') {
        let item = req.body.data;
        let stock_id = options.stock_id;
        let item_id = options.item_id;
        if (item.decimal === 1 || item.decimal === true) {
            querySQL = querySQL
                + 'INSERT INTO stock_history'
                + ' (stock_id, item_id, quantity_in_stock_decimal, quantity_in_requests_decimal,'
                + ' status_id, operation, timestamp)'
                + ' VALUES (?,?,?,?,?,?, NOW());';
            places.push(
                stock_id,
                item_id,
                item.quantity_in_stock_decimal,
                0,
                item.status_id,
                'C'
            );
        } else {
            querySQL = querySQL
                + 'INSERT INTO stock_history'
                + ' (stock_id, item_id, quantity_in_stock, quantity_in_requests,'
                + ' status_id, operation, timestamp)'
                + ' VALUES (?,?,?,?,?,?, NOW());';
            places.push(
                stock_id,
                item_id,
                item.quantity_in_stock,
                0,
                item.status_id,
                'C'
            );

        }
    }
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (operation === 'delete') {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: "Item deleted successfully."
                });
                return;
            } else if (operation === 'update') {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: "Item updated successfully."
                });
                return;
            } else if (operation === 'create') {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: "Item created successfully."
                });
                return;
            }
        },
        options);
};

module.exports.deleteStockItem = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageStock
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionDeleteStockItem(options);
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