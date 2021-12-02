const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const time = require('../utilities/time');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;

var actionGetOrdersList = function (options) {
    let { req, res, next } = options;

    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT orders.*,'
        + ' people.id AS person_id, people.colloquial_name, emails.email,'
        + ' accounts.id AS account_id, accounts.name_en as account_name_en, accounts.name_pt as account_name_pt,'
        + ' cost_centers_orders.id AS cost_center_id, cost_centers_orders.name_en AS cost_center_name_en, cost_centers_orders.name_pt AS cost_center_name_pt'
        + ' FROM orders'
        + ' LEFT JOIN accounts ON accounts.id = orders.account_id'
        + ' LEFT JOIN cost_centers_orders ON cost_centers_orders.id = accounts.cost_center_id'
        + ' LEFT JOIN users ON users.id = orders.user_ordered_id'
        + ' LEFT JOIN people ON people.user_id = users.id'
        + ' LEFT JOIN emails ON emails.person_id = people.id'
    if (req.query.all !== '1') {
        querySQL = querySQL
        + ' WHERE DATE_SUB(CURDATE(),INTERVAL 90 DAY) <= DATE(orders.datetime);';
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.orders = resQuery;
                options.i = 0
                return getOrderStatus(options);
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
var getOrderStatus = function (options) {
    let { req, res, next, orders, i } = options;
    let order = orders[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT order_status_track.*,'
        + ' order_statuses.name_en, order_statuses.description_en,'
        + ' order_statuses.name_pt, order_statuses.description_pt'
        + ' FROM order_status_track'
        + ' JOIN order_statuses ON order_statuses.id = order_status_track.order_status_id'
        + ' WHERE order_status_track.order_id = ?';
    places.push(order.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let lastStatus = '';
            let indLast = 0;
            for (let el in resQuery) {
                if (lastStatus.length === 0 || resQuery[el].datetime > lastStatus) {
                    lastStatus = resQuery[el].datetime;
                    indLast = el;
                }
            }
            options.orders[i].last_status = resQuery[indLast];
            options.orders[i].statuses = resQuery;
            if (i + 1 < options.orders.length) {
                options.i = i + 1;
                return getOrderStatus(options);
            } else {
                options.i = 0;
                return getOrderDetailsInfo(options);
            }

        },
        options);
};
var getOrderDetailsInfo = function (options) {
    let { req, res, next, orders, i } = options;
    let order = orders[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT items_orders.quantity, items_orders.quantity_decimal,'
        + ' items_orders.delivered, items_orders.delivered_quantity, items_orders.delivered_quantity_decimal,'
        + ' items_orders.cost, items_orders.cost_tax, items_orders.change_reason,'
        + ' items.*,'
        + ' stock.quantity_in_stock, stock.quantity_in_requests,'
        + ' stock.quantity_in_stock_decimal, stock.quantity_in_requests_decimal,'
        + ' quantity_types.name_plural_en AS unit_plural_en, quantity_types.name_singular_en AS unit_singular_en,'
        + ' quantity_types.name_plural_pt AS unit_plural_pt, quantity_types.name_singular_pt AS unit_singular_pt,'
        + ' quantity_types.decimal'
        + ' FROM items_orders'
        + ' JOIN items ON items.id = items_orders.item_id'
        + ' JOIN stock ON stock.item_id = items.id'
        + ' LEFT JOIN quantity_types ON quantity_types.id = items.quantity_type_id'
        + ' WHERE items_orders.order_id = ?';
    places.push(order.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.orders[i].items = resQuery;
            if (i + 1 < options.orders.length) {
                options.i = i + 1;
                return getOrderDetailsInfo(options);
            } else {
                options.i = 0;
                return getOrderFinances(options);
            }
        },
        options);
};
var getOrderFinances = function (options) {
    let { req, res, next, orders, i } = options;
    let order = orders[i];
    let year = parseInt(time.moment(order.datetime).format('YYYY'), 10);
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT *'
        + ' FROM account_finances'
        + ' WHERE account_id = ? AND year = ?;';
    places.push(order.account_id, year)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.orders[i].finances = resQuery;
            if (i + 1 < options.orders.length) {
                options.i = i + 1;
                return getOrderFinances(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "result": options.orders,
                    }
                });
                return;
            }
        },
        options);
};
module.exports.getOrders = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageOrders
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionGetOrdersList(options);
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


var updateOrder = function (options) {
    let { req, res, next } = options;
    let order = req.body.data;
    var querySQL = '';
    var places = [];
    let orderID = req.params.orderID;
    // total cost of order is changed
    // order item quantiy is changed (and its cost)
    // account finances are changed
    // account finances history is changed
    // stock is changed
    // stock history is changed
    
    querySQL = querySQL
        + 'UPDATE orders'
        + ' SET total_cost = ?,'
        + ' total_cost_tax = ?'
        + ' WHERE id = ?;';
    places.push(
        order.order_cost,
        order.order_cost_tax,
        orderID
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (order.items.length > 0) {
                options.i = 0;
                return updateOrderItems(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "count": 0,
                        "message": "Order had no items!"
                    }
                });
            }
        },
        options);
};
var updateOrderItems = function (options) {
    let { req, res, next, i } = options;
    let item = req.body.data.items[i];
    var querySQL = '';
    var places = [];
    let orderID = req.params.orderID;

    if (item.changed_by_manager) {
        querySQL = querySQL
            + 'UPDATE items_orders'
            + ' SET quantity = ?,'
            + ' quantity_decimal = ?,'
            + ' cost = ?,'
            + ' cost_tax = ?,'
            + ' delivered = ?,'
            + ' delivered_quantity = ?,'
            + ' delivered_quantity_decimal = ?,'
            + ' changed_by_manager = ?,'
            + ' change_reason = ?'
            + ' WHERE item_id = ? AND order_id = ?;';
        places.push(
            item.quantity,
            item.quantity_decimal,
            item.cost,
            item.cost_tax,
            item.delivered,
            item.delivered_quantity,
            item.delivered_quantity_decimal,
            item.changed_by_manager,
            item.change_reason,
            item.id,
            orderID
        );
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (i + 1 < req.body.data.items.length) {
                    options.i = i + 1;
                    return updateOrderItems(options);
                } else {
                    return updateOrderAccountFinances(options);
                }
            },
            options);
    } else {
        if (i + 1 < req.body.data.items.length) {
            options.i = i + 1;
            return updateOrderItems(options);
        } else {
            return updateOrderAccountFinances(options);
        }
    }
};
var updateOrderAccountFinances = function (options) {
    let { req, res, next } = options;
    let order = req.body.data;
    let finances = order.finances[0];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE account_finances'
        + ' SET amount_requests = amount_requests + ?,'
        + ' amount_requests_tax = amount_requests_tax + ?'
        + ' WHERE id = ?;';
    places.push(
        order.cost_difference,
        order.cost_difference_tax,
        finances.id
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return updateOrderGetNewAccountFinances(options);
        },
        options);
}
var updateOrderGetNewAccountFinances = function (options) {
    let { req, res, next } = options;
    let order = req.body.data;
    let finances = order.finances[0];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT *'
        + ' FROM account_finances'
        + ' WHERE id = ?;';
    places.push(
        finances.id
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.newFinances = resQuery[0];
            return updateOrderAccountFinancesHistory(options);
        },
        options);
}
var updateOrderAccountFinancesHistory = function (options) {
    let { req, res, next, newFinances } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO account_finances_history'
        + ' (account_finance_id, account_id, initial_amount,'
        + ' current_amount, amount_requests,'
        + ' current_amount_tax, amount_requests_tax, year, datetime)'
        + ' VALUES (?,?,?,?,?,?,?,?, NOW());';
    places.push(
        newFinances.id,
        newFinances.account_id,
        newFinances.initial_amount,
        newFinances.current_amount,
        newFinances.amount_requests,
        newFinances.current_amount_tax,
        newFinances.amount_requests_tax,
        newFinances.year
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.i = 0;
            return updateOrderStock(options);
        },
        options);
}
var updateOrderStock = function (options) {
    let { req, res, next, i } = options;
    let item = req.body.data.items[i];
    var querySQL = '';
    var places = [];
    let orderID = req.params.orderID;
    if (item.changed_by_manager) {
        if (item.decimal === 0) {
            querySQL = querySQL
                + 'UPDATE stock'
                + ' SET quantity_in_requests = quantity_in_requests + ?'
                + ' WHERE item_id = ?;';
            places.push(
                item.quantity - item.original_ordered_amount,
                item.id
            );
        } else {
            querySQL = querySQL
                + 'UPDATE stock'
                + ' SET quantity_in_requests_decimal = quantity_in_requests_decimal + ?'
                + ' WHERE item_id = ?;';
            places.push(
                item.quantity_decimal - item.original_ordered_amount_decimal,
                item.id
            );
        }
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (i + 1 < req.body.data.items.length) {
                    options.i = i + 1;
                    return updateOrderStock(options);
                } else {
                    return updateOrderGetNewStock(options);
                }
            },
            options);
    } else {
        if (i + 1 < req.body.data.items.length) {
            options.i = i + 1;
            return updateOrderStock(options);
        } else {
            options.i = 0;
            return updateOrderGetNewStock(options);
        }
    }
}
var updateOrderGetNewStock = function (options) {
    let { req, res, next, i } = options;
    let item = req.body.data.items[i];
    var querySQL = '';
    var places = [];
    if (item.changed_by_manager) {
        querySQL = querySQL
            + 'SELECT *'
            + ' FROM stock'
            + ' WHERE item_id = ?;';
        places.push(
            item.id
        );
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                options.newStock = resQuery[0];
                return updateOrderStockHistory(options);
            },
            options);
    } else {
        if (i + 1 < req.body.data.items.length) {
            options.i = i + 1;
            return updateOrderGetNewStock(options);
        } else {
            return responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success",
                    "statusCode": 200,
                    "count": 0,
                    "message": "Order was updated."
                }
            });
        }
    }
}
var updateOrderStockHistory = function (options) {
    let { req, res, next, i, newStock } = options;
    let item = req.body.data.items[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO stock_history'
        + ' (stock_id, item_id, quantity_in_stock, quantity_in_requests,'
        + ' quantity_in_stock_decimal, quantity_in_requests_decimal, status_id, operation, timestamp)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())';
    places.push(
        newStock.id,
        newStock.item_id,
        newStock.quantity_in_stock,
        newStock.quantity_in_requests,
        newStock.quantity_in_stock_decimal,
        newStock.quantity_in_requests_decimal,
        newStock.status_id,
        'U',
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < req.body.data.items.length) {
                options.i = i + 1;
                return updateOrderGetNewStock(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "count": 0,
                        "message": "Order was updated."
                    }
                });
            }
        },
        options);
}
var partialDelivery = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    let orderID = req.params.orderID;
    querySQL = querySQL
        + 'INSERT INTO order_status_track (order_id, order_status_id, datetime)'
        + ' VALUES (?, ?, NOW());';
    places.push(orderID, 5);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data = req.body.data;
            if (data.items.length > 0) {
                options.i = 0;
                return partialDeliveryItems(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "count": 0,
                        "message": "Order had no items!"
                    }
                });
            }
        },
        options);
};
var partialDeliveryItems = function (options) {
    let { req, res, next, i } = options;
    let item = req.body.data.items[i];
    var querySQL = '';
    var places = [];
    let orderID = req.params.orderID;
    if (item.decimal === 0
        && item.this_delivery !== null
        && item.this_delivery !== undefined
        && item.this_delivery !== ''
    ) {
        item.this_delivery = parseInt(item.this_delivery, 10)
        item.delivered_quantity = parseInt(item.delivered_quantity, 10)
        item.quantity = parseInt(item.quantity, 10)
        if (item.this_delivery + item.delivered_quantity < item.quantity) {
            querySQL = querySQL
                + 'UPDATE items_orders'
                + ' SET delivered_quantity = delivered_quantity + ?'
                + ' WHERE item_id = ? AND order_id = ?;';
        } else if (item.this_delivery + item.delivered_quantity === item.quantity) {
            querySQL = querySQL
                + 'UPDATE items_orders'
                + ' SET delivered_quantity = delivered_quantity + ?,'
                + ' delivered = 1'
                + ' WHERE item_id = ? AND order_id = ?;';
        }
        places.push(
            item.this_delivery,
            item.id,
            orderID
        );
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (i + 1 < req.body.data.items.length) {
                    options.i = i + 1;
                    return partialDeliveryItems(options);
                } else {
                    return sendEmailUser(options)
                    .catch((e) => {
                        console.log(e);
                        return writeMessageDBUser(options, e);
                    });
                }
            },
            options);
    } else if (item.decimal === 1
        && item.this_delivery_decimal !== null
        && item.this_delivery_decimal !== undefined
        && item.this_delivery_decimal !== ''
    ) {
        item.this_delivery_decimal = parseFloat(item.this_delivery_decimal)
        item.delivered_quantity_decimal = parseFloat(item.delivered_quantity_decimal)
        item.quantity_decimal = parseFloat(item.quantity_decimal)
        if (item.this_delivery_decimal + item.delivered_quantity_decimal < item.quantity_decimal) {
            querySQL = querySQL
                + 'UPDATE items_orders'
                + ' SET delivered_quantity_decimal = delivered_quantity_decimal + ?'
                + ' WHERE item_id = ? AND order_id = ?;';
        } else if (item.this_delivery + item.delivered_quantity_decimal === item.quantity) {
            querySQL = querySQL
                + 'UPDATE items_orders'
                + ' SET delivered_quantity_decimal = delivered_quantity_decimal + ?,'
                + ' delivered = 1'
                + ' WHERE item_id = ? AND order_id = ?;';
        }
        places.push(
            item.this_delivery_decimal,
            item.id,
            orderID
        );
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (i + 1 < req.body.data.items.length) {
                    options.i = i + 1;
                    return partialDeliveryItems(options);
                } else {
                    return sendEmailUser(options)
                    .catch((e) => {
                        console.log(e);
                        return writeMessageDBUser(options, e);
                    });
                }
            },
            options);
    } else if (i + 1 < req.body.data.items.length) {
        options.i = i + 1;
        return partialDeliveryItems(options);
    } else {
        return sendEmailUser(options)
        .catch((e) => {
            console.log(e);
            return writeMessageDBUser(options, e);
        });
    }
};

var approveOrder = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    let orderID = req.params.orderID;
    querySQL = querySQL
        + 'INSERT INTO order_status_track (order_id, order_status_id, datetime)'
        + ' VALUES (?, ?, NOW());';
    places.push(orderID, 2);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return sendEmailUser(options)
            .catch((e) => {
                console.log(e);
                return writeMessageDBUser(options, e);
            });
        },
        options);
};
var rejectOrder = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    let orderID = req.params.orderID;
    querySQL = querySQL
        + 'INSERT INTO order_status_track (order_id, order_status_id, datetime)'
        + ' VALUES (?, ?, NOW());';
    places.push(orderID, 4);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data = req.body.data;
            if (data.items.length > 0) {
                options.i = 0;
                return moveQuantitiesWithinStock(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "count": 0,
                        "message": "Order had no items!"
                    }
                });
            }
        },
        options);
};
var closeOrder = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    let orderID = req.params.orderID;
    querySQL = querySQL
        + 'INSERT INTO order_status_track (order_id, order_status_id, datetime)'
        + ' VALUES (?, ?, NOW());';
    places.push(orderID, 3);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data = req.body.data;
            if (data.items.length > 0) {
                options.i = 0;
                return moveQuantitiesWithinStock(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "count": 0,
                        "message": "Order had no items!"
                    }
                });
            }
        },
        options);
};
var moveQuantitiesWithinStock = function (options) {
    let { req, res, next, i } = options;
    let data = req.body.data;
    let item = data.items[i];
    var querySQL = '';
    var places = [];
    if (data.rejectOrder) {
        if (item.decimal === 0) {
            querySQL = querySQL
                +  'UPDATE stock'
                + ' SET quantity_in_requests = quantity_in_requests - ?'
                + ' WHERE item_id = ?;';
            places.push(
                item.quantity,
                item.id
            );
        } else {
            querySQL = querySQL
                + 'UPDATE stock'
                + ' SET quantity_in_requests_decimal = quantity_in_requests_decimal - ?'
                + ' WHERE item_id = ?;';
            places.push(
                item.quantity_decimal,
                item.id
            );
        }
    } else if (data.closeOrder) {
        if (item.decimal === 0) {
            querySQL = querySQL
                + 'UPDATE stock'
                + ' SET quantity_in_requests = quantity_in_requests - ?,'
                + ' quantity_in_stock = quantity_in_stock - ?'
                + ' WHERE item_id = ?;';
            places.push(
                item.quantity,
                item.quantity,
                item.id
            );
        } else {
            querySQL = querySQL
                + 'UPDATE stock'
                + ' SET quantity_in_requests_decimal = quantity_in_requests_decimal - ?,'
                + ' quantity_in_stock_decimal = quantity_in_stock_decimal - ?'
                + ' WHERE item_id = ?;';
            places.push(
                item.quantity_decimal,
                item.quantity_decimal,
                item.id
            );
        }
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < data.items.length) {
                options.i = i + 1;
                return moveQuantitiesWithinStock(options);
            } else {
                options.i = 0;
                return getNewQuantitiesStock(options)
            }
        },
        options);
};
var getNewQuantitiesStock = function (options) {
    let { req, res, next, i } = options;
    let data = req.body.data;
    let item = data.items[i];
    let orderID = data.id;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT id AS stock_id, quantity_in_stock, quantity_in_requests,'
        + ' quantity_in_stock_decimal, quantity_in_requests_decimal, status_id'
        + ' FROM stock'
        + ' WHERE item_id = ?;';
    places.push(item.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.req.body.data.items[i].updatedStock = resQuery[0];
            if (i + 1 < data.items.length) {
                options.i = i + 1;
                return getNewQuantitiesStock(options);
            } else {
                options.i = 0;
                return moveQuantitiesWithinStockHistory(options);
            }
        },
        options);
};
var moveQuantitiesWithinStockHistory = function (options) {
    let { req, res, next, i } = options;
    let data = req.body.data;
    let item = data.items[i];
    var querySQL = '';
    var places = [];
    if (item.decimal === 0) {
        querySQL = querySQL
            + 'INSERT INTO stock_history'
            + ' (stock_id, item_id,'
            + ' quantity_in_stock, quantity_in_requests, status_id, operation, timestamp)'
            + ' VALUES (?, ?, ?, ?, ?, ?, NOW())';
        places.push(
            item.updatedStock.stock_id,
            item.id,
            item.updatedStock.quantity_in_stock,
            item.updatedStock.quantity_in_requests,
            item.updatedStock.status_id,
            'U'
        );
    } else {
        querySQL = querySQL
            + 'INSERT INTO stock_history'
            + ' (stock_id, item_id,'
            + ' quantity_in_stock_decimal, quantity_in_requests_decimal, status_id, operation, timestamp)'
            + ' VALUES (?, ?, ?, ?, ?, ?, NOW())';
        places.push(
            item.updatedStock.stock_id,
            item.id,
            item.updatedStock.quantity_in_stock_decimal,
            item.updatedStock.quantity_in_requests_decimal,
            item.updatedStock.status_id,
            'U'
        );
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < data.items.length) {
                options.i = i + 1;
                return moveQuantitiesWithinStockHistory(options);
            } else {
                return moveAmountsWithinFinances(options);
            }
        },
        options);
};
var moveAmountsWithinFinances = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    if (data.rejectOrder) {
        querySQL = querySQL
            + 'UPDATE account_finances'
            + ' SET amount_requests = amount_requests - ?,'
            + ' amount_requests_tax = amount_requests_tax - ?'
            + ' WHERE id = ?;';
        places.push(
            data.total_cost,
            data.total_cost_tax,
            data.finances[0].id
        );
    } else if (data.closeOrder) {
        querySQL = querySQL
            + 'UPDATE account_finances'
            + ' SET amount_requests = amount_requests - ?,'
            + ' current_amount = current_amount - ?,'
            + ' amount_requests_tax = amount_requests_tax - ?,'
            + ' current_amount_tax = current_amount_tax - ?'
            + ' WHERE id = ?;';
        places.push(
            data.total_cost,
            data.total_cost,
            data.total_cost_tax,
            data.total_cost_tax,
            data.finances[0].id
        );
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return moveAmountsWithinFinancesHistory(options);
        },
        options);
};
var moveAmountsWithinFinancesHistory = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    if (data.rejectOrder) {
        querySQL = querySQL
            + 'INSERT INTO account_finances_history'
            + ' (account_finance_id, account_id, initial_amount,'
            + ' current_amount, amount_requests,'
            + ' current_amount_tax, amount_requests_tax, year, datetime)'
            + ' VALUES (?,?,?,?,?,?,?,?, NOW());';
        places.push(
            data.finances[0].id,
            data.finances[0].account_id,
            data.finances[0].initial_amount,
            data.finances[0].current_amount,
            data.finances[0].amount_requests - data.total_cost,
            data.finances[0].current_amount_tax,
            data.finances[0].amount_requests_tax - data.total_cost_tax,
            data.finances[0].year
        );
    } else if (data.closeOrder) {
        querySQL = querySQL
            + 'INSERT INTO account_finances_history'
            + ' (account_finance_id, account_id, initial_amount,'
            + ' current_amount, amount_requests,'
            + ' current_amount_tax, amount_requests_tax, year, datetime)'
            + ' VALUES (?,?,?,?,?,?,?,?, NOW());';
        places.push(
            data.finances[0].id,
            data.finances[0].account_id,
            data.finances[0].initial_amount,
            data.finances[0].current_amount - data.total_cost,
            data.finances[0].amount_requests - data.total_cost,
            data.finances[0].current_amount_tax - data.total_cost_tax,
            data.finances[0].amount_requests_tax - data.total_cost_tax,
            data.finances[0].year
        );
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return sendEmailUser(options)
            .catch((e) => {
                console.log(e);
                return writeMessageDBUser(options, e);
            });
        },
        options);
}
async function sendEmailUser (options) {
    let { req, res, next} = options;
    let data = req.body.data;
    let recipients = data.email;
    let orderID = data.id;
    let mailOptions;
    let subjectText;
    let emailBody;
    let emailBodyHtml;
    if (data.approveOrder) {
        subjectText = 'Order nr.' + orderID + ' was approved';
        emailBody = 'Hi ' + data.colloquial_name + ',\n\n'
            + 'The order was approved by the stock manager.'
            + '\n\nBest regards,\nAdmin';
        emailBodyHtml = '<p>Hi ' + data.colloquial_name + ',</p>'
        + '<p>The order was approved by the stock manager.<p><br>'
        + '<p>Best regards,</p><p>Admin</p>';
        options.subjectTextUser = subjectText;
        options.emailBodyUser = emailBody;
    } else if (data.rejectOrder) {
        subjectText = 'Order nr.' + orderID + ' was rejected!';
        emailBody = 'Hi ' + data.colloquial_name + ',\n\n'
            + 'The order was rejected by the stock manager. Please contact the stock manager to know the reasons for cancelling this order.'
            + '\n\nBest regards,\nAdmin';
        emailBodyHtml = '<p>Hi ' + data.colloquial_name + ',</p>'
        + '<p>The order was rejected by the stock manager. Please contact the stock manager to know the reasons for cancelling this order.<p><br>'
        + '<p>Best regards,</p><p>Admin</p>';
        options.subjectTextUser = subjectText;
        options.emailBodyUser = emailBody;
    } else if (data.closeOrder) {
        subjectText = 'Order nr.' + orderID + ' has been successfully delivered';
        emailBody = 'Hi ' + data.colloquial_name + ',\n\n'
            + 'The order was successfully delivered and tagged as "Closed" by the stock manager.'
            + '\n\nBest regards,\nAdmin';
        emailBodyHtml = '<p>Hi ' + data.colloquial_name + ',</p>'
        + '<p>The order was successfully delivered and tagged as "Closed" by the stock manager.<p><br>'
        + '<p>Best regards,</p><p>Admin</p>';
        options.subjectTextUser = subjectText;
        options.emailBodyUser = emailBody;
    } else if (data.partialDelivery) {
        let listText = ''
        let listHtml = '<ol>'
        let listNum  = 0;
        for (let ind in req.body.data.items) {
            let item = req.body.data.items[ind];
            if (item.decimal === 0
                && item.this_delivery !== null
                && item.this_delivery !== undefined
                && item.this_delivery !== ''
            ) {
                listNum++;
                listText = listText + listNum + ' - '
                        + item.name_en
                        + ' (' + item.brand + ')'
                        + ' Quantity: ' + item.this_delivery + '\n'
                listHtml = listHtml + '<li>'
                        + item.name_en
                        + ' (' + item.brand + ')'
                        + ' Quantity: ' + item.this_delivery + '</li>'

            } else if (item.decimal === 1
                && item.this_delivery_decimal !== null
                && item.this_delivery_decimal !== undefined
                && item.this_delivery_decimal !== ''
            ) {
                listNum++;
                listText = listText + listNum + ' - '
                        + item.name_en
                        + ' (' + item.brand + ')'
                        + ' Quantity: ' + item.this_delivery_decimal + '\n'
                listHtml = listHtml + '<li>'
                        + item.name_en
                        + ' (' + item.brand + ')'
                        + ' Quantity: ' + item.this_delivery_decimal + '</li>'
            }
        }
        listHtml = listHtml + '</ol>'
        subjectText = 'Order nr.' + orderID + ': some items are ready for delivery';
        emailBody = 'Hi ' + data.colloquial_name + ',\n\n'
            + 'The stock manager is ready to deliver the following items:\n'
            + listText
            + '\n\nBest regards,\nAdmin';
        emailBodyHtml = '<p>Hi ' + data.colloquial_name + ',</p>'
            + '<p>The stock manager is ready to deliver the following items:<p><br>'
            + listHtml
            + '<br><p>Best regards,</p><p>Admin</p>';
        options.subjectTextUser = subjectText;
        options.emailBodyUser = emailBody;
    } else if (data.updateOrder) {
        subjectText = 'Order nr.' + orderID + ': changes to order items';
        emailBody = 'Hi ' + data.colloquial_name + ',\n\n'
            + 'The stock manager changed some of the order items. Contact the stock manager for more details.'
            + '\n\nBest regards,\nAdmin';
        emailBodyHtml = '<p>Hi ' + data.colloquial_name + ',</p>'
        + '<p>The stock manager changed some of the order items. Contact the stock manager for more details.<p><br>'
        + '<p>Best regards,</p><p>Admin</p>';
        options.subjectTextUser = subjectText;
        options.emailBodyUser = emailBody;
    }
    if (process.env.NODE_ENV === 'production') {
        mailOptions = {
            from: '"Admin" <admin@laqv-ucibio.info>', // sender address
            to: recipients, // list of receivers (comma-separated)
            subject: subjectText, // Subject line
            text: emailBody,
            html: emailBodyHtml,
        };
        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Message %s sent: %s', info.messageId, info.response);
        options.sentEmailUser = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
        return writeMessageDBUser(options);
    } else {
        // just for testing purposes
        mailOptions = {
            from: '"Admin" <admin@laqv-ucibio.info>', // sender address
            to: recipients, // list of receivers (comma-separated)
            subject: 'TESTING: ' + subjectText, // Subject line
            text: emailBody,
            html: emailBodyHtml,
        };
        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Message %s sent: %s', info.messageId, info.response);
        options.sentEmailUser = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
        return writeMessageDBUser(options);
    }
};
var writeMessageDBUser = function (options, error) {
    let { req, res, next, subjectTextUser, emailBodyUser, sentEmailUser } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO email_messages'
        + ' (sender_id, recipient_group_id, subject, message_text, date, solved)'
        + ' VALUES (?,?,?,?,?,?);';
    places.push(null, null, subjectTextUser, emailBodyUser, sentEmailUser, 0);
    sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (error) {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 500,
                    message: { "message": "Error sending email to user, but database OK!", "error": error.message }
                });
                return;
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 0,
                        "message": "Order successfuly changed!"
                    }
                });
            }
        },
        options);
    return;
};
module.exports.modifyOrder = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.manageOrders
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        let data = req.body.data;
        if (data.approveOrder) {
            return approveOrder(options);
        } else if (data.rejectOrder) {
            return rejectOrder(options);
        } else if (data.closeOrder) {
            return closeOrder(options);
        } else if (data.partialDelivery) {
            return partialDelivery(options);
        } else if (data.updateOrder) {
            return updateOrder(options)
        }
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