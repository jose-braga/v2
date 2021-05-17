const sql = require('../../utilities/sql');
const time = require('../../utilities/time');
const responses = require('../../utilities/responses');
const permissions = require('../../utilities/permissions');

var actionGetMembersList = function (options) {
    let { req, res, next } = options;
    //let today = time.moment().format('YYYY-MM-DD');
    let unitID = req.params.unitID;
    let cityID = req.params.cityID;
    var querySQL = '';
    var places = [];
    let sortOrder = 'ASC';
    if (unitID !== undefined && cityID !== undefined ) {
        querySQL = querySQL
            + 'SELECT status_fct.*, people.name, people.colloquial_name'
            + ' FROM status_fct'
            + ' JOIN people ON people.id = status_fct.person_id'
            + ' JOIN people_institution_city ON people_institution_city.person_id = status_fct.person_id'
            + ' WHERE people.status = 1'
            + ' AND status_fct.unit_id = ?'
            + ' AND status_fct.must_be_added = 1'
            + ' AND (status_fct.must_be_removed IS NULL OR status_fct.must_be_removed = 0)'
            + ' AND (status_fct.addition_requested IS NULL OR status_fct.addition_requested = 0)'
            + ' AND people_institution_city.city_id = ?'
            + ' ORDER BY `name` ' + sortOrder;
        places.push(unitID, cityID);
    } else if (unitID !== undefined) {
        querySQL = querySQL
            + 'SELECT status_fct.*, people.name, people.colloquial_name'
            + ' FROM status_fct'
            + ' JOIN people ON people.id = status_fct.person_id'
            + ' WHERE people.status = 1'
            + ' AND status_fct.unit_id = ?'
            + ' AND status_fct.must_be_added = 1'
            + ' AND (status_fct.must_be_removed IS NULL OR status_fct.must_be_removed = 0)'
            + ' AND (status_fct.addition_requested IS NULL OR status_fct.addition_requested = 0)'
            + ' ORDER BY `name` ' + sortOrder;
        places.push(unitID);
    } else if (cityID !== undefined) {
        querySQL = querySQL
            + 'SELECT status_fct.*, people.name, people.colloquial_name'
            + ' FROM status_fct'
            + ' JOIN people ON people.id = status_fct.person_id'
            + ' JOIN people_institution_city ON people_institution_city.person_id = status_fct.person_id'
            + ' WHERE people.status = 1'
            + ' AND people_institution_city.city_id = ?'
            + ' AND status_fct.must_be_added = 1'
            + ' AND (status_fct.must_be_removed IS NULL OR status_fct.must_be_removed = 0)'
            + ' AND (status_fct.addition_requested IS NULL OR status_fct.addition_requested = 0)'
            + ' ORDER BY `name` ' + sortOrder;
        places.push(cityID);
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success",
                    "statusCode": 200,
                    "count": resQuery.length,
                    "result": resQuery
                }
            });
            return;
        },
        options);
};
module.exports.getMembersList = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetMembersList(options) },
        { req, res, next }
    );
};

var actionUpdateMember = function (options) {
    let { req, res, next } = options;
    let memberID = req.params.memberID;
    let data = req.body.data;
    console.log(req.body.data)
    //let today = time.moment().format('YYYY-MM-DD');
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE status_fct'
        + ' SET must_be_added = ?,'
        + ' addition_requested = ?'
        + ' WHERE id = ?'
        + ';'
    places.push(
        data.must_be_added,
        data.addition_requested,
        memberID
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success",
                    "statusCode": 200,
                    "count": resQuery.length,
                    "result": resQuery
                }
            });
            return;
        },
        options);
};
module.exports.updateMember = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateMember(options) },
        { req, res, next }
    );
};

var actionGetRequestedMembersList = function (options) {
    let { req, res, next } = options;
    //let today = time.moment().format('YYYY-MM-DD');
    let unitID = req.params.unitID;
    let cityID = req.params.cityID;
    var querySQL = '';
    var places = [];
    let sortOrder = 'ASC';
    if (unitID !== undefined && cityID !== undefined ) {
        querySQL = querySQL
            + 'SELECT status_fct.*, people.name, people.colloquial_name'
            + ' FROM status_fct'
            + ' JOIN people ON people.id = status_fct.person_id'
            + ' JOIN people_institution_city ON people_institution_city.person_id = status_fct.person_id'
            + ' WHERE people.status = 1'
            + ' AND status_fct.unit_id = ?'
            + ' AND status_fct.must_be_added = 1'
            + ' AND status_fct.addition_requested = 1'
            + ' AND (status_fct.removal_requested IS NULL OR status_fct.removal_requested = 0)'
            + ' AND people_institution_city.city_id = ?'
            + ' ORDER BY `name` ' + sortOrder;
        places.push(unitID, cityID);
    } else if (unitID !== undefined) {
        querySQL = querySQL
            + 'SELECT status_fct.*, people.name, people.colloquial_name'
            + ' FROM status_fct'
            + ' JOIN people ON people.id = status_fct.person_id'
            + ' WHERE people.status = 1'
            + ' AND status_fct.unit_id = ?'
            + ' AND status_fct.must_be_added = 1'
            + ' AND status_fct.addition_requested = 1'
            + ' AND (status_fct.removal_requested IS NULL OR status_fct.removal_requested = 0)'
            + ' ORDER BY `name` ' + sortOrder;
        places.push(unitID);
    } else if (cityID !== undefined) {
        querySQL = querySQL
            + 'SELECT status_fct.*, people.name, people.colloquial_name'
            + ' FROM status_fct'
            + ' JOIN people ON people.id = status_fct.person_id'
            + ' JOIN people_institution_city ON people_institution_city.person_id = status_fct.person_id'
            + ' WHERE people.status = 1'
            + ' AND people_institution_city.city_id = ?'
            + ' AND status_fct.must_be_added = 1'
            + ' AND status_fct.addition_requested = 1'
            + ' AND (status_fct.removal_requested IS NULL OR status_fct.removal_requested = 0)'
            + ' ORDER BY `name` ' + sortOrder;
        places.push(cityID);
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success",
                    "statusCode": 200,
                    "count": resQuery.length,
                    "result": resQuery
                }
            });
            return;
        },
        options);
};
module.exports.getRequestedMembersList = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetRequestedMembersList(options) },
        { req, res, next }
    );
};

var actionUpdateRequestedMember = function (options) {
    let { req, res, next } = options;
    let memberID = req.params.memberID;
    let data = req.body.data;
    console.log(req.body.data)
    //let today = time.moment().format('YYYY-MM-DD');
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE status_fct'
        + ' SET addition_requested = ?,'
        + ' must_be_removed = ?,'
        + ' removal_requested = ?'
        + ' WHERE id = ?'
        + ';'
    places.push(
        data.addition_requested,
        data.must_be_removed,
        data.removal_requested,
        memberID
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success",
                    "statusCode": 200,
                    "count": resQuery.length,
                    "result": resQuery
                }
            });
            return;
        },
        options);
};
module.exports.updateRequestedMember = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateRequestedMember(options) },
        { req, res, next }
    );
};

var actionGetRemovedMembersList = function (options) {
    let { req, res, next } = options;
    //let today = time.moment().format('YYYY-MM-DD');
    let unitID = req.params.unitID;
    let cityID = req.params.cityID;
    var querySQL = '';
    var places = [];
    let sortOrder = 'ASC';
    if (unitID !== undefined && cityID !== undefined ) {
        querySQL = querySQL
            + 'SELECT status_fct.*, people.name, people.colloquial_name'
            + ' FROM status_fct'
            + ' JOIN people ON people.id = status_fct.person_id'
            + ' JOIN people_institution_city ON people_institution_city.person_id = status_fct.person_id'
            + ' WHERE people.status = 1'
            + ' AND status_fct.unit_id = ?'
            + ' AND status_fct.removal_requested = 1'
            + ' AND people_institution_city.city_id = ?'
            + ' ORDER BY `name` ' + sortOrder;
        places.push(unitID, cityID);
    } else if (unitID !== undefined) {
        querySQL = querySQL
            + 'SELECT status_fct.*, people.name, people.colloquial_name'
            + ' FROM status_fct'
            + ' JOIN people ON people.id = status_fct.person_id'
            + ' WHERE people.status = 1'
            + ' AND status_fct.unit_id = ?'
            + ' AND status_fct.removal_requested = 1'
            + ' ORDER BY `name` ' + sortOrder;
        places.push(unitID);
    } else if (cityID !== undefined) {
        querySQL = querySQL
            + 'SELECT status_fct.*, people.name, people.colloquial_name'
            + ' FROM status_fct'
            + ' JOIN people ON people.id = status_fct.person_id'
            + ' JOIN people_institution_city ON people_institution_city.person_id = status_fct.person_id'
            + ' WHERE people.status = 1'
            + ' AND people_institution_city.city_id = ?'
            + ' AND status_fct.removal_requested = 1'
            + ' ORDER BY `name` ' + sortOrder;
        places.push(cityID);
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success",
                    "statusCode": 200,
                    "count": resQuery.length,
                    "result": resQuery
                }
            });
            return;
        },
        options);
};
module.exports.getRemovedMembersList = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetRemovedMembersList(options) },
        { req, res, next }
    );
};

var actionUpdateRemovedMember = function (options) {
    let { req, res, next } = options;
    let memberID = req.params.memberID;
    let data = req.body.data;
    console.log(req.body.data)
    //let today = time.moment().format('YYYY-MM-DD');
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE status_fct'
        + ' SET removal_requested = ?'
        + ' WHERE id = ?'
        + ';'
    places.push(
        data.removal_requested,
        memberID
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success",
                    "statusCode": 200,
                    "count": resQuery.length,
                    "result": resQuery
                }
            });
            return;
        },
        options);
};
module.exports.updateRemovedMember = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateRemovedMember(options) },
        { req, res, next }
    );
};

var actionGetPersonStatus = function (options) {
    let { req, res, next } = options;
    //let today = time.moment().format('YYYY-MM-DD');
    let unitID = req.params.unitID;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    if (unitID !== undefined) {
        querySQL = querySQL
            + 'SELECT *'
            + ' FROM status_fct'
            + ' WHERE unit_id = ?'
            + ' AND person_id = ?;';
        places.push(unitID, personID);
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "count": resQuery.length,
                        "result": resQuery
                    }
                });
                return;
            },
            options);
    } else {
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "count": 0,
                        "result": []
                    }
                });
                return;
            },
            options);
    }
};
module.exports.getPersonStatus = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPersonStatus(options) },
        { req, res, next }
    );
};
var actionCreatePersonStatus = function (options) {
    let { req, res, next } = options;
    //let today = time.moment().format('YYYY-MM-DD');
    let data = req.body.data;
    let unitID = req.params.unitID;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    if (unitID !== undefined) {
        querySQL = querySQL
            + 'INSERT INTO status_fct'
            + ' (person_id, unit_id, must_be_added, addition_requested, must_be_removed, removal_requested)'
            + ' VALUES (?,?,?,?,?,?);'
            ;
        places.push(personID, unitID,
            data.must_be_added,
            data.addition_requested,
            data.must_be_removed,
            data.removal_requested
        );
        return sql.makeSQLOperation(req, res, querySQL, places);
    } else {
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 400,
                    message: {
                        "status": "error",
                        "statusCode": 403,
                        "message": "You are not allowed to make this request.",
                    }
                });
                return;
            },
            options);
    }
};
module.exports.createPersonStatus = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreatePersonStatus(options) },
        { req, res, next }
    );
};
var actionUpdatePersonStatus = function (options) {
    let { req, res, next } = options;
    //let today = time.moment().format('YYYY-MM-DD');
    let data = req.body.data;
    let unitID = req.params.unitID;
    //let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    if (unitID !== undefined) {
        querySQL = querySQL
            + 'UPDATE status_fct'
            + ' SET must_be_added = ?,'
            + ' addition_requested = ?,'
            + ' must_be_removed = ?,'
            + ' removal_requested = ?'
            + ' WHERE id = ?;'
            ;
        places.push(
            data.must_be_added,
            data.addition_requested,
            data.must_be_removed,
            data.removal_requested,
            data.id
        );
        return sql.makeSQLOperation(req, res, querySQL, places);
    } else {
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 400,
                    message: {
                        "status": "error",
                        "statusCode": 403,
                        "message": "You are not allowed to make this request.",
                    }
                });
                return;
            },
            options);
    }
};
module.exports.updatePersonStatus = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdatePersonStatus(options) },
        { req, res, next }
    );
};