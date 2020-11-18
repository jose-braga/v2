const sql = require('../utilities/sql');
//const permissions = require('../utilities/permissions');
const responses = require('../utilities/responses');
const time = require('../utilities/time');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;

var actionGetStoreProfile = function (options) {
    let { req, res, next } = options;
    let userID = req.payload.userID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT accounts_people.*, accounts.name_en AS account_name,'
                        + ' accounts.cost_center_id, cost_centers_orders.name_en AS cost_center_name'
                        + ' FROM accounts_people'
                        + ' JOIN accounts ON accounts.id = accounts_people.account_id'
                        + ' JOIN cost_centers_orders ON cost_centers_orders.id = accounts.cost_center_id'
                        + ' WHERE user_id = ?;';
    places.push(userID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getStoreProfile = function (req, res, next) {
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.accessStore
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionGetStoreProfile(options);
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
var actionGetStoreInventoryItems = function (options) {
    let { req, res, next } = options;
    let userID = req.payload.userID;
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
        +   ' LEFT JOIN quantity_types ON quantity_types.id = items.quantity_type_id'
        +   ' LEFT JOIN stock ON stock.item_id = items.id'
        +   ' LEFT JOIN stock_item_statuses ON stock_item_statuses.id = stock.status_id'
        + ' WHERE items.visible = ? AND stock.deleted = ?;';
    places.push(1, 0)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (options.checkInventoryForOrder) {
                options.inventory = resQuery;
                return checkInventory(options);
            } else {
                if (resQuery.length > 0) {
                    options.i = 0;
                    options.inventory = resQuery;
                    return actionGetStoreInventoryDetails(options);
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
            }
        },
        options);
};
var actionGetStoreInventoryDetails = function (options) {
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
    places.push(item.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.inventory[i].item_categories = resQuery;
            if (i + 1 < options.inventory.length) {
                options.i = i + 1;
                return actionGetStoreInventoryDetails(options);
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
module.exports.getStoreInventory = function (req, res, next) {
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.accessStore
    ) {
        let options = { req, res, next };
        return actionGetStoreInventoryItems(options);
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

var actionGetUserOrders = function (options) {
    let { req, res, next } = options;
    let accountID = req.params.accountID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT orders.id AS order_id, orders.datetime, orders.user_ordered_id,'
        + ' orders.account_id, orders.total_cost, orders.total_cost_tax,'
        + ' people.colloquial_name AS user_ordered_name'
        + ' FROM orders'
        + ' JOIN users ON users.id = orders.user_ordered_id'
        + ' JOIN people ON people.user_id = users.id'
        + ' WHERE orders.account_id = ?;';
    places.push(accountID)
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
    places.push(order.order_id)
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
        + ' items_orders.cost, items_orders.cost_tax,'
        + ' items.*,'
        + ' quantity_types.name_plural_en AS unit_plural_en, quantity_types.name_singular_en AS unit_singular_en,'
        + ' quantity_types.name_plural_pt AS unit_plural_pt, quantity_types.name_singular_pt AS unit_singular_pt,'
        + ' quantity_types.decimal'
        + ' FROM items_orders'
        + ' JOIN items ON items.id = items_orders.item_id'
        + ' LEFT JOIN quantity_types ON quantity_types.id = items.quantity_type_id'
        + ' WHERE items_orders.order_id = ?';
    places.push(order.order_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.orders[i].items = resQuery;
            if (i + 1 < options.orders.length) {
                options.i = i + 1;
                return getOrderDetailsInfo(options);
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
module.exports.getOrdersHistory = function (req, res, next) {
    let accountID = parseInt(req.params.accountID, 10);
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.accessStore
        && req.payload.storeAccess.accounts.indexOf(accountID) !== -1
        &&  req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionGetUserOrders(options);
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

var actionAccountFinances = function (options) {
    let { req, res, next } = options;
    let accountID = req.params.accountID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT *'
        + ' FROM account_finances'
        + ' WHERE account_id = ?;';
    places.push(accountID)
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
module.exports.getFinances = function (req, res, next) {
    let accountID = parseInt(req.params.accountID, 10);
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.accessStore
        && req.payload.storeAccess.accounts.indexOf(accountID) !== -1
        &&  req.payload.personID === personID
    ) {
        let options = { req, res, next };
        return actionAccountFinances(options);
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

var checkInventory = function (options) {
    let { req, res, next, inventory } = options;
    let cart = req.body.data;
    let inventoryOK = true;
    for (let ind in cart) {
        for (let indInv in inventory) {
            if (cart[ind].id === inventory[indInv].id) {
                if (cart[ind].decimal === 0) {
                    cart[ind].amount_to_order = parseInt(cart[ind].amount_to_order, 10);
                } else {
                    cart[ind].amount_to_order = parseFloat(cart[ind].amount_to_order);
                }

                cart[ind].db_current_unit_price = inventory[indInv].current_unit_price;
                cart[ind].db_tax = inventory[indInv].tax;
                cart[ind].db_cost = Number.parseFloat(
                    Number.parseFloat(inventory[indInv].current_unit_price * cart[ind].amount_to_order)
                    .toFixed(2)
                );
                cart[ind].db_cost_tax = Number.parseFloat(
                    Number.parseFloat(cart[ind].db_cost * (1.0 + inventory[indInv].tax/100.0))
                    .toFixed(2)
                );
                if (cart[ind].decimal === 0
                    && cart[ind].amount_to_order >
                        inventory[indInv].quantity_in_stock - inventory[indInv].quantity_in_requests
                ) {
                    inventoryOK = false;
                } else if (cart[ind].decimal === 1
                    && cart[ind].amount_to_order >
                        inventory[indInv].quantity_in_stock_decimal - inventory[indInv].quantity_in_requests_decimal
                ) {
                    inventoryOK = false;
                }
            }
        }
    }
    if (inventoryOK) {
        options.cart = cart;
        return initiateOrder(options);

    } else {
        responses.sendJSONResponseOptions({
            response: res,
            status: 403,
            message: {
                "status": "success",
                "statusCode": 403,
                "message": "Current inventory levels not compatible with order!\n"
                            + " None of the order items were ordered.",
            }
        });
        return;
    }
};
var initiateOrder = function (options) {
    let { req, res, next, cart } = options;
    let accountID = req.params.accountID;
    let userID = req.payload.userID;
    var querySQL = '';
    var places = [];
    let total_cost = 0;
    let total_cost_tax = 0;
    for (let ind in cart) {
        total_cost = total_cost + cart[ind].db_cost;
        total_cost_tax = total_cost_tax + cart[ind].db_cost_tax;
    }
    options.total_cost = total_cost;
    options.total_cost_tax = total_cost_tax;
    querySQL = querySQL
        + 'INSERT INTO orders'
        + ' (datetime, account_id, user_ordered_id, total_cost, total_cost_tax)'
        + ' VALUES (NOW(), ?, ?, ?, ?)';
    places.push(accountID, userID, total_cost, total_cost_tax)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.orderID = resQuery.insertId;
            options.i = 0;
            return createOrderItems(options);
        },
        options);
};
var createOrderItems = function (options) {
    let { req, res, next, cart, orderID, i } = options;
    var querySQL = '';
    var places = [];
    if (cart[i].decimal === 0) {
        querySQL = querySQL
            + 'INSERT INTO items_orders'
            + ' (item_id, order_id, quantity, cost, cost_tax, delivered, delivered_quantity)'
            + ' VALUES (?,?,?,?,?,?,?)';
    } else {
        querySQL = querySQL
            + 'INSERT INTO items_orders'
            + ' (item_id, order_id, quantity_decimal, cost, cost_tax, delivered, delivered_quantity_decimal)'
            + ' VALUES (?,?,?,?,?,?,?)';
    }
    places.push(
        cart[i].id,
        orderID,
        cart[i].amount_to_order,
        cart[i].db_cost,
        cart[i].db_cost_tax,
        0, 0)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < cart.length) {
                options.i = i + 1;
                return createOrderItems(options);
            } else {
                options.i = 0;
                return updateStockRequestsLevels(options)
            }
        },
        options);
};
var updateStockRequestsLevels = function (options) {
    let { req, res, next, cart, i } = options;
    var querySQL = '';
    var places = [];
    if (cart[i].decimal === 0) {
        querySQL = querySQL
            + 'UPDATE stock'
            + ' SET quantity_in_requests = quantity_in_requests + ?'
            + ' WHERE id = ?;';
    } else {
        querySQL = querySQL
            + 'UPDATE stock'
            + ' SET quantity_in_requests_decimal = quantity_in_requests_decimal + ?'
            + ' WHERE id = ?;';
    }
    places.push(
        cart[i].amount_to_order,
        cart[i].stock_id,
    )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < cart.length) {
                options.i = i + 1;
                return updateStockRequestsLevels(options);
            } else {
                options.i = 0;
                return createStockHistoryEntry(options)
            }
        },
        options);
};
var createStockHistoryEntry = function (options) {
    let { req, res, next, cart, i } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO stock_history'
        + ' (stock_id, item_id, quantity_in_stock_decimal, quantity_in_requests_decimal,'
        + ' quantity_in_stock, quantity_in_requests, status_id, operation, timestamp)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())';
    if (cart[i].decimal === 0) {
        places.push(
            cart[i].stock_id,
            cart[i].id,
            cart[i].quantity_in_stock_decimal,
            cart[i].quantity_in_requests_decimal,
            cart[i].quantity_in_stock,
            cart[i].quantity_in_requests + cart[i].amount_to_order,
            cart[i].status_id,
            'U'
        );
    } else {
        places.push(
            cart[i].stock_id,
            cart[i].id,
            cart[i].quantity_in_stock_decimal,
            cart[i].quantity_in_requests_decimal + cart[i].amount_to_order,
            cart[i].quantity_in_stock,
            cart[i].quantity_in_requests,
            cart[i].status_id,
            'U'
        );
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < cart.length) {
                options.i = i + 1;
                return createStockHistoryEntry(options);
            } else {
                return updateAccountFinances(options)
            }
        },
        options);
};
var updateAccountFinances = function (options) {
    let { req, res, next, total_cost, total_cost_tax} = options;
    let accountID = req.params.accountID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE account_finances'
        + ' SET amount_requests = amount_requests + ?,'
        + ' amount_requests_tax = amount_requests_tax + ?'
        + ' WHERE account_id = ? AND year = YEAR(NOW());';
    places.push(
        total_cost,
        total_cost_tax,
        accountID
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return getAccountFinancesUpdatedValue(options);
        },
        options);
};
var getAccountFinancesUpdatedValue = function (options) {
    let { req, res, next} = options;
    let accountID = req.params.accountID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM account_finances'
        + ' WHERE account_id = ? AND year = YEAR(NOW());';
    places.push(accountID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.accountFinanceCurrent = resQuery[0];
            return createAccountFinancesHistoryEntry(options);
        },
        options);
};
var createAccountFinancesHistoryEntry = function (options) {
    let { req, res, next, accountFinanceCurrent } = options;
    let accountID = req.params.accountID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO account_finances_history'
        + ' (account_finance_id, account_id, initial_amount,'
        + ' current_amount, amount_requests,'
        + ' current_amount_tax, amount_requests_tax, year, datetime)'
        + ' VALUES (?,?,?,?,?,?,?,?, NOW());';
    places.push(
        accountFinanceCurrent.id,
        accountFinanceCurrent.account_id,
        accountFinanceCurrent.initial_amount,
        accountFinanceCurrent.current_amount,
        accountFinanceCurrent.amount_requests,
        accountFinanceCurrent.current_amount_tax,
        accountFinanceCurrent.amount_requests_tax,
        accountFinanceCurrent.year,
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return createOrderStatus(options);
        },
        options);
};
var createOrderStatus = function (options) {
    let { req, res, next, orderID } = options;
    let accountID = req.params.accountID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO order_status_track'
        + ' (order_id, order_status_id, datetime)'
        + ' VALUES (?, ?, NOW())';
    places.push(
        orderID,
        1
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return getRecipientsGroupsStockManager(options, 8, 1)
        },
        options);
};
var getRecipientsGroupsStockManager = function (options, email_type_id, city_id) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT recipient_groups.*, emails.person_id, emails.email'
        + ' FROM recipient_groups'
        + ' JOIN people_recipient_groups ON people_recipient_groups.recipient_group_id = recipient_groups.id'
        + ' LEFT JOIN emails ON emails.person_id = people_recipient_groups.person_id'
        + ' WHERE recipient_groups.city_id = ?'
        + ' AND recipient_groups.any_cities = 0'
        + ' AND recipient_groups.email_type_id = ?;';
    places.push(city_id, email_type_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            sendEmailStockManager(options, resQuery)
                .catch((e) => {
                    console.log(e);
                    return writeMessageDBStockManager(options, e);
                });
        },
        options);
};
async function sendEmailStockManager (options, recipientEmails) {
    if (recipientEmails.length > 0) {
        options.recipientGroup = recipientEmails[0].id;
    }
    let recipients = '';
    for (let el in recipientEmails) {
        recipients = recipients + recipientEmails[el].email + ', ';
    }
    let { req, res, next, orderID } = options;
    let mailOptions;
    let subjectText = 'A user placed order n: ' + orderID;
    let emailBody = 'Hi,\n\n'
        + 'The user ' + req.payload.personName + ' made an order.\n\n'
        + 'The order awaits your validation.'
        + '\n\nBest regards,\nAdmin';
    let emailBodyHtml = '<p>Hi,</p>'
    + '<p>The user <b>' + req.payload.personName + '</b> made an order.<p>'
    + '<p>The order awaits your validation.</p><br>'
    + '<p>Best regards,</p><p>Admin</p>';
    options.subjectText = subjectText;
    options.emailBody = emailBody;
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
        options.sentEmailStockManager = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
        return writeMessageDBStockManager(options);
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
        options.sentEmailStockManager = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
        return writeMessageDBStockManager(options);
    }
};
var writeMessageDBStockManager = function (options, error) {
    let { req, res, next, recipientGroup, subjectText, emailBody, sentEmailStockManager } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO email_messages'
        + ' (sender_id, recipient_group_id, subject, message_text, date, solved)'
        + ' VALUES (?,?,?,?,?,?);';
    places.push(null, recipientGroup, subjectText, emailBody, sentEmailStockManager, 0);
    sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (error) {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 500,
                    message: { "message": "Error sending email, but database OK!", "error": error.message }
                });
                return;
            } else {
                return getEmailUser(options);
            }
        },
        options);
    return;
};
var getEmailUser = function (options) {
    let { req, res, next} = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM emails'
        + ' WHERE person_id = ?;';
    places.push(personID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.ordererEmail = resQuery[0];
            sendEmailUser(options)
                .catch((e) => {
                    console.log(e);
                    return writeMessageDBUser(options, e);
                });
        },
        options);
};
async function sendEmailUser (options) {
    let { req, res, next, orderID, ordererEmail } = options;
    let recipients = ordererEmail.email;
    let mailOptions;
    let subjectText = 'Successfully placed order nr: ' + orderID;
    let emailBody = 'Hi ' + req.payload.personName + ',\n\n'
        + 'The order was successfully sent and awaits validation by the stock manager.'
        + '\n\nBest regards,\nAdmin';
    let emailBodyHtml = '<p>Hi ' + req.payload.personName + ',</p>'
    + '<p>The order was successfully sent and awaits validation by the stock manager.<p><br>'
    + '<p>Best regards,</p><p>Admin</p>';
    options.subjectTextUser = subjectText;
    options.emailBodyUser = emailBody;
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
                        "message": "Order successfuly finished!"
                    }
                });
            }
        },
        options);
    return;
};
module.exports.createOrder = function (req, res, next) {
    let accountID = parseInt(req.params.accountID, 10);
    let personID = parseInt(req.params.personID, 10);
    if (req.payload.storeAccess !== undefined
        && req.payload.storeAccess instanceof Object
        && req.payload.storeAccess.accessStore
        && req.payload.storeAccess.accounts.indexOf(accountID) !== -1
        && req.payload.personID === personID
    ) {
        let options = { req, res, next };
        options.checkInventoryForOrder = true;
        return actionGetStoreInventoryItems(options);
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