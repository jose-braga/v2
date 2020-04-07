// TODO: technical, science and administrative

const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

var actionSearchAllPeople = function (options) {
    let { req, res, next } = options;
    let name;
    let limit = 10;
    if (req.query.limit !== undefined) {
        limit = parseInt(req.query.limit, 10);
    }
    options.pageSize = limit;
    let offset = 0;
    if (req.query.offset !== undefined) {
        offset = parseInt(req.query.offset, 10);
    }
    options.offset = offset;
    if (req.query.hasOwnProperty('q') && req.query.q !== '') {
        name = '%' + req.query.q.replace(/\s/gi,'%') + '%';
    } else {
        name = '';
    }
    options.search = name;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people.id AS person_id, people.name, people.colloquial_name,'
                        + ' lab_positions.name_en AS lab_position_name,'
                        + ' labs.name AS lab_name, people_labs.valid_from, people_labs.valid_until'
                        + ' FROM people'
                        + ' LEFT JOIN people_labs ON people_labs.person_id = people.id'
                        + ' LEFT JOIN labs ON labs.id = people_labs.lab_id'
                        + ' LEFT JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
                        + ' WHERE people.name LIKE ?'
                        + ' ORDER BY people.name ASC'
                        + ' LIMIT ?, ?;'
                        ;
    places.push(name, offset, limit)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                actionCountTotal(resQuery, options)
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": -1,
                        "pageSize": options.pageSize,
                        "offset": options.offset,
                        "pageCount": 0,
                        "result": []
                    }
                });
                return;
            }
        },
        options);
};
var actionCountTotal = function (people, options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT COUNT(*) AS total_number'
        + ' FROM (SELECT people.id AS person_id, people.name, people.colloquial_name,'
        + ' lab_positions.name_en AS lab_position_name,'
        + ' labs.name AS lab_name, people_labs.valid_from, people_labs.valid_until'
        + ' FROM people'
        + ' LEFT JOIN people_labs ON people_labs.person_id = people.id'
        + ' LEFT JOIN labs ON labs.id = people_labs.lab_id'
        + ' LEFT JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
        + ' WHERE people.name LIKE ?)'
        + ' AS search_people';
    places.push(options.search);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.totalSearch = resQuery[0].total_number;
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": options.totalSearch,
                        "pageSize": options.pageSize,
                        "offset": options.offset,
                        "pageCount": people.length,
                        "result": people
                    }
                });
                return;
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": -1,
                        "pageSize": options.pageSize,
                        "offset": options.offset,
                        "pageCount": 0,
                        "result": []
                    }
                });
                return;
            }
        },
        options);

}

module.exports.searchAllPeople = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionSearchAllPeople(options) },
        { req, res, next }
    );
};

var actionGetMemberDetails = function (members, options) {
    if (members.length > 0) {
        return getMembersLabPositions(members, options, 0);
    } else {
        responses.sendJSONResponseOptions({
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": []
            }
        });
        return;
    }
};
var getMembersLabPositions = function (members, options, i) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_labs.*,'
                        + ' labs.name AS lab_name, labs.short_name AS lab_short_name,'
                        + ' lab_positions.name_en AS lab_position_name_en,'
                        + ' lab_positions.name_pt AS lab_position_name_pt,'
                        + ' lab_positions.sort_order AS lab_position_sort_order'
                        + ' FROM people_labs'
                        + ' JOIN labs ON labs.id = people_labs.lab_id'
                        + ' LEFT JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
                        + ' WHERE people_labs.lab_id = ? AND people_labs.person_id = ?;';
    places.push(labID, members[i].person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            members[i].history = resQuery;
            getMemberDetails(members, options, i)
        },
        options);
};
var getMemberDetails = function (members, options, i) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM researchers_info'
                        + ' WHERE person_id = ?;';
    places.push(members[i].person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            members[i].researcher_details = resQuery;
            if (i + 1 < members.length) {
                getMembersLabPositions(members, options, i + 1);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": members.length,
                        "result": members
                    }
                });
                return;
            }
        },
        options);
};
var actionGetLabMembers = function (options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT DISTINCT people.id AS person_id, people.name, people.colloquial_name '
                        + ' FROM people'
                        + ' JOIN people_labs ON people_labs.person_id = people.id'
                        + ' WHERE people_labs.lab_id = ?;';
    places.push(labID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionGetMemberDetails(resQuery, options)
        },
        options);
};
module.exports.getLabMembersAffiliations = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetLabMembers(options) },
        { req, res, next }
    );
};
module.exports.deleteLabMember = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetLabMembers(options) },
        { req, res, next }
    );
};

var actionUpdateLabMemberPosition = function (options) {
    let { req, res, next } = options;
    options.operation = 'U';
    let positionID = req.params.positionID;
    let positionData = req.body.data;
    if (positionData.valid_from === '') {
        positionData.valid_from = null;
    }
    if (positionData.valid_until === '') {
        positionData.valid_until = null;
    }
    var places = [];
    querySQL = 'UPDATE people_labs'
            + ' SET lab_position_id = ?,'
            + ' dedication = ?,'
            + ' valid_from = ?,'
            + ' valid_until = ?'
            + ' WHERE id = ?;';
    places.push(positionData.lab_position_id,
        positionData.dedication,
        positionData.valid_from,
        positionData.valid_until,
        positionID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionAddLabMemberPositionHistory(resQuery, options)
        },
        options);
};
var actionAddLabMemberPositionHistory = function (resQuery, options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    let personID = req.params.memberID;
    let positionID = req.params.positionID;
    let positionData = req.body.data;
    var places = [];
    let now = time.moment().tz('Europe/Lisbon').format('YYYY-MM-DD HH:mm:ss');
    let created = null;
    let updated = null;
    if (options.operation === 'U') {
        updated = now;
    } else if (options.operation === 'C') {
        created = now;
        positionID = resQuery.insertId;
    } else if (options.operation === 'D') {
        updated = now;
        //positionData = {};
    }
    if (positionData.valid_from === '') {
        positionData.valid_from = null;
    }
    if (positionData.valid_until === '') {
        positionData.valid_until = null;
    }
    querySQL = 'INSERT INTO people_labs_history'
        + ' (people_labs_id, person_id, lab_id, lab_position_id, dedication, valid_from, valid_until, created, updated, operation, changed_by)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    places.push(positionID,
                personID,
                labID,
                positionData.lab_position_id,
                positionData.dedication,
                positionData.valid_from,
                positionData.valid_until,
                created,
                updated,
                options.operation,
                positionData.changed_by)
    sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updateLabMemberPosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateLabMemberPosition(options) },
        { req, res, next }
    );
};

var actionCreateLabMemberPosition = function (options) {
    let { req, res, next } = options;
    options.operation = 'C';
    let labID = req.params.labID;
    let personID = req.params.memberID;
    let positionData = req.body.data;
    if (positionData.valid_from === '') {
        positionData.valid_from = null;
    }
    if (positionData.valid_until === '') {
        positionData.valid_until = null;
    }
    var places = [];
    querySQL = 'INSERT INTO people_labs'
        + ' (person_id, lab_id, lab_position_id, dedication, valid_from, valid_until)'
        + ' VALUES (?, ?, ?, ?, ?, ?);';
    places.push(personID,
                labID,
                positionData.lab_position_id,
                positionData.dedication,
                positionData.valid_from,
                positionData.valid_until
                )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionAddLabMemberPositionHistory(resQuery, options)
        },
        options);
};
module.exports.createLabMemberPosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateLabMemberPosition(options) },
        { req, res, next }
    );
};

var actionDeleteLabMemberPosition = function (options) {
    let { req, res, next } = options;
    options.operation = 'D';
    let positionID = req.params.positionID;
    var places = [];
    querySQL = 'DELETE FROM people_labs'
        + ' WHERE id = ?;';
    places.push(positionID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionAddLabMemberPositionHistory(resQuery, options)
        },
        options);
};
module.exports.deleteLabMemberPosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteLabMemberPosition(options) },
        { req, res, next }
    );
};



var actionGetLabInfo = function (options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * '
                        + ' FROM labs'
                        + ' WHERE id = ?;';
    places.push(labID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let labs = resQuery[0]; // there is only one lab
            actionGetLabGroups(labs, options)
        },
        options);
};
var actionGetLabGroups = function (labs, options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT `groups`.*, labs_groups.valid_from, labs_groups.valid_until'
                        + ' FROM labs_groups'
                        + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
                        + ' WHERE labs_groups.lab_id = ?;';
    places.push(labID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            labs.groups_history = resQuery;
            actionGetGroupsUnits(labs, options, 0)
        },
        options);
};
var actionGetGroupsUnits = function (labs, options, i) {
    let { req, res, next } = options;
    let groupID = labs.groups_history[i].id;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT units.*, groups_units.valid_from, groups_units.valid_until'
                        + ' FROM groups_units'
                        + ' JOIN units ON units.id = groups_units.unit_id'
                        + ' WHERE groups_units.group_id = ?;';
    places.push(groupID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            labs.groups_history[i].units_history = resQuery;
            if (i + 1 < labs.groups_history.length) {
                actionGetGroupsUnits(labs, options, i + 1);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 1,
                        "result": labs
                    }
                });
                return;
            }
        },
        options);
};

module.exports.getLabInfo = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetLabInfo(options) },
        { req, res, next }
    );
};