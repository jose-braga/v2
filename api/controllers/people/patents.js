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
            + 'SELECT DISTINCT patents.*'
            + ' FROM patents'
            + ' LEFT JOIN people_patents ON people_patents.patent_id = patents.id'
            + ' WHERE (patents.authors_raw LIKE ? OR patents.title LIKE ? OR patents.reference_number1 LIKE ?)'
            + ' AND patents.id NOT IN ('
            +       'SELECT patent_id FROM people_patents WHERE person_id = ?'
            + ')'
            + ';'
        places.push(q, q, q, personID);
    } else {
        querySQL = querySQL
            + 'SELECT *'
            + ' FROM patents'
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
        + 'SELECT DISTINCT people_patents.person_id, people_patents.patent_id'
        + ' FROM people_patents'
        + ' JOIN patents ON patents.id = people_patents.patent_id'
        + ' WHERE people_patents.person_id = ?'
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
        + 'SELECT *'
        + ' FROM patents'
        + ' WHERE id = ?'
        + ';';
    places.push(item.patent_id)
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
        + 'SELECT labs_patents.*,'
        + ' labs.name AS lab_name, labs.short_name AS lab_short_name'
        + ' FROM labs_patents'
        + ' JOIN labs ON labs.id = labs_patents.lab_id'
        + ' WHERE labs_patents.patent_id = ?'
        + ';';
    places.push(item.patent_id)
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
        + 'SELECT people_patents.*,'
        + ' people.name AS person_name, people.colloquial_name AS person_colloquial_name'
        + ' FROM people_patents'
        + ' JOIN people ON people.id = people_patents.person_id'
        + ' WHERE people_patents.patent_id = ?'
        + ';';
    places.push(item.patent_id)
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
    if (data.status_date === '') data.status_date = null;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO patents'
        + ' (patent_type_id, authors_raw, title, reference_number1, status_id, status_date, description)'
        +' VALUES (?,?,?,?,?,?,?);';
    places.push(
        data.patent_type_id,
        data.authors_raw,
        data.title,
        data.reference_number1,
        data.patent_status_id,
        data.status_date,
        data.description
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
        + 'INSERT INTO people_patents'
        + ' (person_id, patent_id)'
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
        + 'INSERT INTO labs_patents'
        + ' (lab_id, patent_id)'
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
    let status_date = null;
    if (data.status_date !== null && data.status_date !== undefined && data.status_date !== '') {
        status_date = data.status_date
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE patents'
        + ' SET patent_type_id = ?,'
        + ' authors_raw = ?,'
        + ' title = ?,'
        + ' reference_number1 = ?,'
        + ' status_id = ?,'
        + ' status_date = ?,'
        + ' description = ?'
        + ' WHERE id = ?'
        +';';
    places.push(
        data.patent_type_id,
        data.authors_raw,
        data.title,
        data.reference_number1,
        data.status_id,
        status_date,
        data.description,
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
        + 'DELETE FROM people_patents WHERE person_id = ? AND patent_id = ?;'
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
            + 'INSERT INTO people_patents'
            + ' (person_id, patent_id)'
            + ' VALUES (?, ?)'
            +';';
        places.push(
            data.person_id,
            itemID,
        );
    } else {
        querySQL = querySQL
            + 'UPDATE people_patents'
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
        + 'DELETE FROM labs_patents WHERE lab_id = ? AND patent_id = ?;'
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
            + 'INSERT INTO labs_patents'
            + ' (lab_id, patent_id)'
            + ' VALUES (?, ?)'
            +';';
        places.push(
            data.lab_id,
            itemID
        );
    } else {
        querySQL = querySQL
            + 'UPDATE labs_patents'
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
        + 'INSERT INTO people_patents'
        + ' (person_id, patent_id)'
        + ' SELECT ?, ? FROM DUAL'
        + ' WHERE NOT EXISTS (SELECT *'
        +       ' FROM people_patents'
        +       ' WHERE person_id = ? AND patent_id = ?'
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