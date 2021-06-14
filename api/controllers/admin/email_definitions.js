const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

var actionGetRecipientGroups = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT recipient_groups.*, email_types.name_en AS email_type_name_en,'
        + ' institution_city.city'
        + ' FROM recipient_groups'
        + ' JOIN email_types ON email_types.id = recipient_groups.email_type_id'
        + ' LEFT JOIN institution_city ON institution_city.id = recipient_groups.city_id'
        ;
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.recipientGroups = resQuery
            options.i = 0;
            if (resQuery.length > 0) {
                return getRecipientGroupEmails(options)
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 0,
                        "result": []
                    }
                });
            }
        },
        options
    );
};
var getRecipientGroupEmails = function (options) {
    let { req, res, next, i, recipientGroups } = options;
    let recipientGroup = recipientGroups[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_recipient_groups.*, people.colloquial_name,'
        + ' emails.email'
        + ' FROM people_recipient_groups'
        + ' JOIN people ON people.id = people_recipient_groups.person_id'
        + ' LEFT JOIN emails ON emails.person_id = people.id'
        + ' WHERE people_recipient_groups.recipient_group_id = ?'
        ;
    places.push(recipientGroup.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.recipientGroups[i].people = resQuery
            if (i + 1 < recipientGroups.length) {
                options.i = i + 1;
                return getRecipientGroupEmails(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": options.recipientGroups.length,
                        "result": options.recipientGroups
                    }
                });
            }
        },
        options
    );
};
module.exports.getRecipientGroups = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetRecipientGroups(options) },
        { req, res, next }
    );
};

var actionUpdateRecipientGroup = function (options) {
    let { req, res, next } = options;
    let recipientGroupID = req.params.recipientGroupID;
    let data = req.body.data;
    if (data.any_cities === 1) {
        data.city_id = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE recipient_groups'
        + ' SET name_en = ?,'
        + ' name_pt = ?,'
        + ' city_id = ?,'
        + ' any_cities = ?,'
        + ' email_type_id = ?'
        + ' WHERE id = ?;'
        ;
    places.push(
        data.name_en,
        data.name_pt,
        data.city_id,
        data.any_cities,
        data.email_type_id,
        recipientGroupID
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (req.body.data.toDeletePerson.length > 0) {
                options.i = 0;
                return deleteItemPerson(options);
            } else if (req.body.data.people.length > 0) {
                options.i = 0;
                return updateCreateItemPerson(options);
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
        options
    );
};
var deleteItemPerson = function (options) {
    let { req, res, next, i } = options;
    //let personID = req.params.personID;
    let recipientGroupID = req.params.recipientGroupID;
    let data = req.body.data.toDeletePerson[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM people_recipient_groups WHERE person_id = ? AND recipient_group_id = ?;'
    places.push(data.person_id, recipientGroupID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.toDeletePerson.length) {
                options.i = i + 1;
                return deleteItemPerson(options);
            } else if (req.body.data.people.length > 0) {
                options.i = 0;
                return updateCreateItemPerson(options);
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
    let recipientGroupID = req.params.recipientGroupID;
    let data = req.body.data.people[i];
    var querySQL = '';
    var places = [];
    if (data.id === 'new') {
        querySQL = querySQL
            + 'INSERT INTO people_recipient_groups'
            + ' (person_id, recipient_group_id)'
            + ' VALUES (?, ?)'
            +';';
        places.push(
            data.person_id,
            recipientGroupID,
        );
    } else {
        querySQL = querySQL
            + 'UPDATE people_recipient_groups'
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
            if (i + 1 < req.body.data.people.length) {
                options.i = i + 1;
                return updateCreateItemPerson(options);
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
module.exports.updateRecipientGroup = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateRecipientGroup(options) },
        { req, res, next }
    );
};

var actionDeleteRecipientGroupPeople = function (options) {
    let { req, res, next } = options;
    let recipientGroupID = req.params.recipientGroupID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM people_recipient_groups'
        + ' WHERE recipient_group_id = ?;'
        ;
    places.push(
        recipientGroupID
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteRecipientGroup(options);
        },
        options
    );
};
var deleteRecipientGroup = function (options) {
    let { req, res, next } = options;
    let recipientGroupID = req.params.recipientGroupID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM recipient_groups'
        + ' WHERE id = ?;'
        ;
    places.push(
        recipientGroupID
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.deleteRecipientGroup = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteRecipientGroupPeople(options) },
        { req, res, next }
    );
};

var actionCreateRecipientGroup = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    if (data.any_cities === 1) {
        data.city_id = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO recipient_groups'
        + ' (name_en, name_pt, city_id, any_cities, email_type_id)'
        + ' VALUES (?, ?, ?, ?, ?);'
        ;
    places.push(
        data.name_en,
        data.name_pt,
        data.city_id,
        data.any_cities,
        data.email_type_id
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.recipientGroupID = resQuery.insertId;
            if (data.people.length > 0) {
                options.i = 0;
                return createItemPerson(options);
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
        options
    );
};
var createItemPerson = function (options) {
    let { req, res, next, recipientGroupID, i } = options;
    //let personID = req.params.personID;
    let data = req.body.data.people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO people_recipient_groups'
        + ' (person_id, recipient_group_id)'
        + ' VALUES (?, ?)'
        +';';
    places.push(
        data.person_id,
        recipientGroupID,
    );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.people.length) {
                options.i = i + 1;
                return createItemPerson(options);
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
module.exports.createRecipientGroup = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateRecipientGroup(options) },
        { req, res, next }
    );
};