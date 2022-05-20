const sql = require('../utilities/sql');
const time = require('../utilities/time');
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
            + 'SELECT DISTINCT organization_meetings.*, meeting_types.name AS meeting_type_name'
            + ' FROM organization_meetings'
            + ' LEFT JOIN people_organization_meetings ON people_organization_meetings.meeting_id = organization_meetings.id'
            + ' LEFT JOIN meeting_types ON meeting_types.id = organization_meetings.meeting_type_id'
            + ' WHERE (organization_meetings.meeting_name LIKE ? OR organization_meetings.description LIKE ?)'
            + ' AND organization_meetings.id NOT IN ('
            +       'SELECT meeting_id FROM people_organization_meetings WHERE person_id = ?'
            + ')'
            + ';'
        places.push(q, q, personID);
    } else {
        querySQL = querySQL
            + 'SELECT *'
            + ' FROM organization_meetings'
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
        + 'SELECT people_organization_meetings.*,'
        + ' organization_meetings.meeting_type_id, meeting_types.name AS meeting_type_name,'
        + ' organization_meetings.meeting_name, organization_meetings.international,'
        + ' organization_meetings.country_id, countries.name AS country_name,'
        + ' organization_meetings.start, organization_meetings.end,'
        + ' organization_meetings.description'
        + ' FROM people_organization_meetings'
        + ' JOIN organization_meetings ON organization_meetings.id = people_organization_meetings.meeting_id'
        + ' LEFT JOIN meeting_types ON meeting_types.id = organization_meetings.meeting_type_id'
        + ' LEFT JOIN countries ON countries.id = organization_meetings.country_id'
        + ' WHERE people_organization_meetings.person_id = ?'
        + ';';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.items = resQuery;
            if (resQuery.length > 0) {
                options.i = 0;
                return getPeopleItemDetails(options);
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
var getPeopleItemDetails = function (options) {
    let { req, res, next, items, i } = options;
    //let personID = req.params.personID;
    let item = items[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_organization_meetings.*,'
        + ' people.name AS name'
        + ' FROM people_organization_meetings'
        + ' JOIN people ON people.id = people_organization_meetings.person_id'
        + ' WHERE people_organization_meetings.meeting_id = ?'
        + ';';
    places.push(item.meeting_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.items[i].person_details = resQuery;
            if (i + 1 < items.length) {
                options.i = i + 1;
                return getPeopleItemDetails(options);
            } else {
                options.i = 0;
                return getLabItemDetails(options);
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
        + 'SELECT labs_organization_meetings.*,'
        + ' labs.name AS lab_name, labs.short_name AS lab_short_name'
        + ' FROM labs_organization_meetings'
        + ' JOIN labs ON labs.id = labs_organization_meetings.lab_id'
        + ' WHERE labs_organization_meetings.meeting_id = ?'
        + ';';
    places.push(item.meeting_id)
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
    let data = req.body.data;
    if (data.start === '') data.start = null;
    if (data.end === '') data.end = null;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO organization_meetings'
        + ' (meeting_type_id, meeting_name, international, country_id, start, end, description)'
        +' VALUES (?,?,?,?,?,?,?);';
    places.push(
        data.meeting_type_id,
        data.meeting_name,
        data.international,
        data.country_id,
        data.start,
        data.end,
        data.description,
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.itemID = resQuery.insertId;
            options.i = 0;
            return addPersonItem(options);
        },
        options);
};
var addPersonItem = function (options) {
    let { req, res, next, itemID, i } = options;
    let data = req.body.data;
    if (data.person_details.length > 0) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL
            + 'INSERT INTO people_organization_meetings'
            + ' (person_id, role, meeting_id)'
            +' VALUES (?,?,?);';
        places.push(
            data.person_details[i].person_id,
            data.person_details[i].role,
            itemID
        );
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                if (i + 1 < data.person_details.length) {
                    options.i = i + 1;
                    return addPersonItem(options);
                } else {
                    options.i = 0;
                    return addLabItem(options);
                }
            },
            options);
    } else {
        options.i = 0;
        return addLabItem(options);
    }
};
var addLabItem = function (options) {
    let { req, res, next, itemID, i } = options;
    let data = req.body.data;
    if (data.labs_details !== undefined &&
        data.labs_details.length > 0) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL
            + 'INSERT INTO labs_organization_meetings'
            + ' (lab_id, meeting_id)'
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
    let data = req.body.data
    if (data.start === '') data.start = null;
    if (data.end === '') data.end = null;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE organization_meetings'
        + ' SET meeting_type_id = ?,'
        + ' meeting_name = ?,'
        + ' international = ?,'
        + ' country_id = ?,'
        + ' start = ?,'
        + ' end = ?,'
        + ' description = ?'
        + ' WHERE id = ?'
        +';';
    places.push(
        data.meeting_type_id,
        data.meeting_name,
        data.international,
        data.country_id,
        data.start,
        data.end,
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
        + 'DELETE FROM people_organization_meetings WHERE person_id = ? AND meeting_id = ?;'
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
            + 'INSERT INTO people_organization_meetings'
            + ' (person_id, role, meeting_id)'
            + ' VALUES (?, ?, ?)'
            +';';
        places.push(
            data.person_id,
            data.role,
            itemID,
        );
    } else {
        querySQL = querySQL
            + 'UPDATE people_organization_meetings'
            + ' SET person_id = ?,'
            + ' role = ?'
            + ' WHERE id = ?'
            +';';
        places.push(
            data.person_id,
            data.role,
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
            } else if (req.body.data.labs_details !== undefined &&
                req.body.data.labs_details.length > 0) {
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
        + 'DELETE FROM labs_organization_meetings WHERE lab_id = ? AND meeting_id = ?;'
    places.push(data.lab_id, itemID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.toDeleteLab.length) {
                options.i = i + 1;
                return deleteItemLab(options);
            } else if (req.body.data.labs_details !== undefined &&
                req.body.data.labs_details.length > 0) {
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
            + 'INSERT INTO labs_organization_meetings'
            + ' (lab_id, meeting_id)'
            + ' VALUES (?, ?)'
            +';';
        places.push(
            data.lab_id,
            itemID
        );
    } else {
        querySQL = querySQL
            + 'UPDATE labs_organization_meetings'
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
        + 'INSERT INTO people_organization_meetings'
        + ' (person_id, meeting_id)'
        + ' SELECT ?, ? FROM DUAL'
        + ' WHERE NOT EXISTS (SELECT *'
        +       ' FROM people_organization_meetings'
        +       ' WHERE person_id = ? AND meeting_id = ?'
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