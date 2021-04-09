const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
/*
var actionGetAllItems = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    if (req.query.q !== undefined & req.query.q !== null) {
        let q = '%'
        let qraw = req.query.q;
        q = '%' + qraw.replace(/\s/gi,'%') + '%';
        querySQL = querySQL
            + 'SELECT DISTINCT communications.*'
            + ' FROM communications'
            + ' LEFT JOIN people_communications ON people_communications.communication_id = communications.id'
            + ' WHERE (communications.title LIKE ? OR communications.acronym LIKE ? OR communications.reference LIKE ?)'
            + ' AND communications.id NOT IN ('
            +       'SELECT communication_id FROM people_communications WHERE person_id = ?'
            + ')'
            + ';'
        places.push(q, q, q, personID);
    } else {
        querySQL = querySQL
            + 'SELECT *'
            + ' FROM communications'
            + ';'
    }
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getAllItems = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetAllItems(options) },
        { req, res, next }
    );
};
*/

var actionGetPersonItems = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT *'
        + ' FROM communications'
        + ' WHERE person_id = ?'
        + ';';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.items = resQuery;
            if (resQuery.length > 0) {
                options.i = 0;
                return getLabItemDetails(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 0,
                        "result": [],
                    }
                });
                return;
            }

        },
        options);
};
var getLabItemDetails = function (options) {
    let { req, res, next, items, i } = options;
    //let personID = req.params.personID;
    let item = items[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT labs_communications.*,'
        + ' labs.name AS lab_name, labs.short_name AS lab_short_name'
        + ' FROM labs_communications'
        + ' JOIN labs ON labs.id = labs_communications.lab_id'
        + ' WHERE labs_communications.communication_id = ?'
        + ';';
    places.push(item.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.items[i].labs_details = resQuery;
            if (i + 1 < items.length) {
                options.i = i + 1;
                return getLabItemDetails(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": options.items.length,
                        "result": options.items,
                    }
                });
                return;
            }
        },
        options);
};
module.exports.getPersonItems = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPersonItems(options) },
        { req, res, next }
    );
};

var actionCreateItem = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    if (data.start === '') data.start = null;
    if (data.end === '') data.end = null;
    var querySQL = '';
    var places = [];
    if (data.communication_raw !== null && data.communication_raw !== undefined) {
        querySQL = querySQL
            + 'INSERT INTO communications'
            + ' (person_id, communication_raw)'
            +' VALUES (?,?);';
        places.push(
            personID,
            data.communication_raw
        )
    } else {
        querySQL = querySQL
            + 'INSERT INTO communications'
            + ' (person_id, authors_raw, title, type_id, conference_title, conference_type_id, international, city, country_id, date)'
            +' VALUES (?,?,?,?,?,?,?,?,?,?);';
        places.push(
            personID,
            data.authors_raw,
            data.title,
            data.type_id,
            data.conference_title,
            data.conference_type_id,
            data.international,
            data.city,
            data.country_id,
            data.date
        );
    }

    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.itemID = resQuery.insertId;
            if (data.labs_details.length > 0) {
                options.i = 0;
                return addLabItem(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Item successfully created.'
                    }
                });
            }
        },
        options);
};
var addLabItem = function (options) {
    let { req, res, next, itemID, i } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO labs_communications'
        + ' (lab_id, communication_id)'
        +' VALUES (?,?);';
    places.push(
        data.labs_details[i].lab_id,
        itemID
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < data.labs_details.length) {
                options.i = i + 1;
                return addLabItem(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Item successfully created.'
                    }
                });
                return;
            }
        },
        options)
};
module.exports.createPersonItem = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateItem(options) },
        { req, res, next }
    );
};

var actionUpdateItem = function (options) {
    let { req, res, next } = options;
    //let personID = req.params.personID;
    let itemID = req.params.itemID;
    let data = req.body.data;
    let date = null;
    if (data.date !== null && data.date !== undefined && data.date !== '') {
        date = data.date
    }
    var querySQL = '';
    var places = [];
    if (data.isUnstructured && !data.convertToStructured) {
        querySQL = querySQL
            + 'UPDATE communications'
            + ' SET communication_raw = ?'
            +' WHERE id = ?;';
        places.push(
            data.communication_raw,
            itemID
        )
    } else {
        querySQL = querySQL
            + 'UPDATE communications'
            + ' SET authors_raw = ?,'
            + ' title = ?,'
            + ' type_id = ?,'
            + ' conference_title = ?,'
            + ' conference_type_id = ?,'
            + ' international = ?,'
            + ' city = ?,'
            + ' country_id = ?,'
            + ' date = ?,'
            + ' communication_raw = ?'
            +' WHERE id = ?;';
            +' ';
        places.push(
            data.authors_raw,
            data.title,
            data.type_id,
            data.conference_title,
            data.conference_type_id,
            data.international,
            data.city,
            data.country_id,
            date,
            null,
            itemID
        );
    }
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (req.body.data.toDeleteLab.length > 0) {
                options.i = 0;
                return deleteItemLab(options);
            } else if (req.body.data.labs_details.length > 0) {
                options.i = 0;
                return updateCreateItemLab(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Item successfully updated.'
                    }
                });
                return;
            }
        },
        options);
};
var deleteItemLab = function (options) {
    let { req, res, next, i } = options;
    //let personID = req.params.personID;
    let itemID = req.params.itemID;
    let data = req.body.data.toDeleteLab[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM labs_communications WHERE lab_id = ? AND communication_id = ?;'
    places.push(data.lab_id, itemID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.toDeleteLab.length) {
                options.i = i + 1;
                return deleteItemLab(options);
            } else if (req.body.data.labs_details.length > 0) {
                options.i = 0;
                return updateCreateItemLab(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Item successfully updated.'
                    }
                });
                return;
            }
        },
        options);
};
var updateCreateItemLab = function (options) {
    let { req, res, next, i } = options;
    //let personID = req.params.personID;
    let itemID = req.params.itemID;
    let data = req.body.data.labs_details[i];
    var querySQL = '';
    var places = [];
    if (data.id === 'new') {
        querySQL = querySQL
            + 'INSERT INTO labs_communications'
            + ' (lab_id, communication_id)'
            + ' VALUES (?, ?)'
            +';';
        places.push(
            data.lab_id,
            itemID
        );
    } else {
        querySQL = querySQL
            + 'UPDATE labs_communications'
            + ' SET lab_id = ?'
            + ' WHERE id = ?'
            +';';
        places.push(
            data.lab_id,
            data.id
        );
    }
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.labs_details.length) {
                options.i = i + 1;
                return updateCreateItemLab(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": 'Item successfully updated.'
                    }
                });
                return;
            }
        },
        options);
};
module.exports.updatePersonItem = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateItem(options) },
        { req, res, next }
    );
};

var actionDeleteLabItem = function (options) {
    let { req, res, next, i } = options;
    let itemID = req.params.itemID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM labs_communications WHERE communication_id = ?;';
    places.push(itemID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteItem(options);
        },
        options
    );
};
var deleteItem = function (options) {
    let { req, res, next, i } = options;
    let itemID = req.params.itemID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM communications WHERE id = ?;';
    places.push(itemID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.deletePersonItem = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteLabItem(options) },
        { req, res, next }
    );
};