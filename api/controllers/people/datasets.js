const sql = require('../utilities/sql');
//const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

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
            + 'SELECT DISTINCT data_sets.*, data_set_types.name AS data_set_type_name'
            + ' FROM data_sets'
            + ' LEFT JOIN people_data_sets ON people_data_sets.data_set_id = data_sets.id'
            + ' LEFT JOIN data_set_types ON data_set_types.id = data_sets.data_set_type_id'
            + ' WHERE (data_sets.database_name LIKE ? OR data_sets.short_description LIKE ?)'
            + ' AND data_sets.id NOT IN ('
            +       'SELECT data_set_id FROM people_data_sets WHERE person_id = ?'
            + ')'
            + ';'
        places.push(q, q, personID);
    } else {
        querySQL = querySQL
            + 'SELECT *'
            + ' FROM data_sets'
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

var actionGetPersonItems = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT people_data_sets.person_id, people_data_sets.data_set_id'
        + ' FROM people_data_sets'
        + ' JOIN data_sets ON data_sets.id = people_data_sets.data_set_id'
        + ' WHERE people_data_sets.person_id = ?'
        + ';';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.items = resQuery;
            if (resQuery.length > 0) {
                options.i = 0;
                return getItemDetails(options);
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
var getItemDetails = function (options) {
    let { req, res, next, items, i } = options;
    let item = items[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT data_sets.*, data_set_types.name AS data_set_type_name'
        + ' FROM data_sets'
        + ' LEFT JOIN data_set_types ON data_set_types.id = data_sets.data_set_type_id'
        + ' WHERE data_sets.id = ?'
        + ';';
    places.push(item.data_set_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.items[i].item_details = resQuery[0];
            } else {
                options.items[i].item_details = {};
            }
            return getLabItemDetails(options);
        },
        options);
};
var getLabItemDetails = function (options) {
    let { req, res, next, items, i } = options;
    let personID = req.params.personID;
    let item = items[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT labs_data_sets.*,'
        + ' labs.name AS lab_name, labs.short_name AS lab_short_name'
        + ' FROM labs_data_sets'
        + ' JOIN labs ON labs.id = labs_data_sets.lab_id'
        + ' WHERE labs_data_sets.data_set_id = ?'
        + ';';
    places.push(item.data_set_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.items[i].labs_details = resQuery;
            return getPersonItemDetails(options);
        },
        options);
};
var getPersonItemDetails = function (options) {
    let { req, res, next, items, i } = options;
    let personID = req.params.personID;
    let item = items[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_data_sets.*,'
        + ' people.name AS person_name, people.colloquial_name AS person_colloquial_name'
        + ' FROM people_data_sets'
        + ' JOIN people ON people.id = people_data_sets.person_id'
        + ' WHERE people_data_sets.data_set_id = ?'
        + ';';
    places.push(item.data_set_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.items[i].person_details = resQuery;
            if (i + 1 < items.length) {
                options.i = i + 1;
                return getItemDetails(options);
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
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO data_sets'
        + ' (database_name, data_set_type_id, number_sets, year, short_description, url)'
        +' VALUES (?,?,?,?,?,?);';
    places.push(
        data.database_name,
        data.data_set_type_id,
        data.number_sets,
        data.year,
        data.short_description,
        data.url
    )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.itemID = resQuery.insertId;
            if (data.person_details.length > 0) {
                options.i = 0;
                return addPersonItem(options);
            } else if (data.labs_details !== undefined
                    && data.labs_details !== null
                    && data.labs_details.length > 0) {
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
                return;
            }
        },
        options);
};
var addPersonItem = function (options) {
    let { req, res, next, itemID, i } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO people_data_sets'
        + ' (person_id, data_set_id)'
        +' VALUES (?,?);';
    places.push(
        data.person_details[i].person_id,
        itemID
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < data.person_details.length) {
                options.i = i + 1;
                return addPersonItem(options);
            } else if (data.labs_details !== undefined
                    && data.labs_details !== null
                    && data.labs_details.length > 0) {
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
                return;
            }
        },
        options)
};
var addLabItem = function (options) {
    let { req, res, next, itemID, i } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO labs_data_sets'
        + ' (lab_id, data_set_id)'
        +' VALUES (?,?);';
    places.push(
        data.labs_details[i].lab_id,
        itemID
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i+ 1 < data.labs_details.length) {
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
    let data = req.body.data.item_details;
    if (data.start_date === '') data.start_date = null;
    if (data.end_date === '') data.end_date = null;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE data_sets'
        + ' SET data_set_type_id = ?,'
        + ' database_name = ?,'
        + ' number_sets = ?,'
        + ' url = ?,'
        + ' year = ?,'
        + ' short_description = ?'
        + ' WHERE id = ?'
        +';';
    places.push(
        data.data_set_type_id,
        data.database_name,
        data.number_sets,
        data.url,
        data.year,
        data.short_description,
        itemID
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (req.body.data.toDeletePerson.length > 0) {
                options.i = 0;
                return deleteItemPerson(options);
            } else if (req.body.data.person_details.length > 0) {
                options.i = 0;
                return updateCreateItemPerson(options);
            } else if (req.body.data.toDeleteLab.length > 0) {
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
var deleteItemPerson = function (options) {
    let { req, res, next, i } = options;
    //let personID = req.params.personID;
    let itemID = req.params.itemID;
    let data = req.body.data.toDeletePerson[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM people_data_sets WHERE person_id = ? AND data_set_id = ?;'
    places.push(data.person_id, itemID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.toDeletePerson.length) {
                options.i = i + 1;
                return deleteItemPerson(options);
            } else if (req.body.data.person_details.length > 0) {
                options.i = 0;
                return updateCreateItemPerson(options);
            } else if (req.body.data.toDeleteLab.length > 0) {
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
var updateCreateItemPerson = function (options) {
    let { req, res, next, i } = options;
    //let personID = req.params.personID;
    let itemID = req.params.itemID;
    let data = req.body.data.person_details[i];
    var querySQL = '';
    var places = [];
    if (data.id === 'new') {
        querySQL = querySQL
            + 'INSERT INTO people_data_sets'
            + ' (person_id, data_set_id)'
            + ' VALUES (?, ?)'
            +';';
        places.push(
            data.person_id,
            itemID,
        );
    } else {
        querySQL = querySQL
            + 'UPDATE people_data_sets'
            + ' SET person_id = ?'
            + ' WHERE id = ?'
            +';';
        places.push(
            data.person_id,
            data.id
        );
    }
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.person_details.length) {
                options.i = i + 1;
                return updateCreateItemPerson(options);
            } else if (req.body.data.toDeleteLab.length > 0) {
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
        + 'DELETE FROM labs_data_sets WHERE lab_id = ? AND data_set_id = ?;'
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
            + 'INSERT INTO labs_data_sets'
            + ' (lab_id, data_set_id)'
            + ' VALUES (?, ?)'
            +';';
        places.push(
            data.lab_id,
            itemID
        );
    } else {
        querySQL = querySQL
            + 'UPDATE labs_data_sets'
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

var actionCreatePersonItemAssociation = function (options) {
    let { req, res, next, i } = options;
    let personID = req.params.personID;
    let itemID = req.params.itemID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO people_data_sets'
        + ' (person_id, data_set_id)'
        + ' SELECT ?, ? FROM DUAL'
        + ' WHERE NOT EXISTS (SELECT *'
        +       ' FROM people_data_sets'
        +       ' WHERE person_id = ? AND data_set_id = ?'
        +   ');';
    places.push(
        personID,
        itemID,
        personID,
        itemID
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createPersonItemAssociation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreatePersonItemAssociation(options) },
        { req, res, next }
    );
};