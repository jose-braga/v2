const sql = require('../../utilities/sql');
const time = require('../../utilities/time');
const responses = require('../../utilities/responses');
const permissions = require('../../utilities/permissions');

var actionGetCurrentMembersList = function (options) {
    let { req, res, next } = options;
    let today = time.moment().format('YYYY-MM-DD');
    let unitID = req.params.unitID;
    let q = '%'
    let limit = 10;
    let offset = 0;
    let sortOrder = 'ASC';
    if (req.query.q !== undefined) {
        let qraw = req.query.q;
        q = '%' + qraw.replace(/\s/gi,'%') + '%'
    }
    if (req.query.limit !== undefined) {
        limit = parseInt(req.query.limit, 10);
    }
    options.pageSize = limit;
    if (req.query.offset !== undefined) {
        offset = parseInt(req.query.offset, 10);
    }
    options.offset = offset;
    if (req.query.sortOrder !== undefined) {
        sortOrder = req.query.sortOrder;
        if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
            sortOrder = 'ASC';
        }
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name'
        + ' FROM people'
        + ' JOIN people_labs ON people_labs.person_id = people.id'
        + ' JOIN labs ON labs.id = people_labs.lab_id'
        + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
        + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
        + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
        + ' WHERE people.status = 1 AND groups_units.unit_id = ? AND people.name LIKE ?'
        + ' AND ((people_labs.valid_from IS NULL AND people_labs.valid_until IS NULL)'
        + '     OR (people_labs.valid_from <= ? AND people_labs.valid_until IS NULL)'
        + '     OR (people_labs.valid_from IS NULL AND people_labs.valid_until >= ?)'
        + '     OR (people_labs.valid_from <= ? AND people_labs.valid_until >= ?))'
        + ' ORDER BY people.name ' + sortOrder
        + ' LIMIT ?, ?;';
    places.push(unitID, q, today, today, today, today, offset, limit);
    options.today = today;
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
    let { req, res, next, today } = options;
    let unitID = req.params.unitID;
    let q = '%';
    if (req.query.q !== undefined) {
        let qraw = req.query.q;
        q = '%' + qraw.replace(/\s/gi, '%') + '%'
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT COUNT(*) AS total_number'
        + ' FROM (SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name'
            + ' FROM people'
            + ' JOIN people_labs ON people_labs.person_id = people.id'
            + ' JOIN labs ON labs.id = people_labs.lab_id'
            + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
            + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
            + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
            + ' WHERE people.status = 1 AND groups_units.unit_id = ? AND people.name LIKE ?'
            + ' AND ((people_labs.valid_from IS NULL AND people_labs.valid_until IS NULL)'
            + '     OR (people_labs.valid_from <= ? AND people_labs.valid_until IS NULL)'
            + '     OR (people_labs.valid_from IS NULL AND people_labs.valid_until >= ?)'
            + '     OR (people_labs.valid_from <= ? AND people_labs.valid_until >= ?))'
        + ') AS unit_people'
        ;
    places.push(unitID, q, today, today, today, today);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.totalSearch = resQuery[0].total_number;
            } else {
                options.totalSearch = -1; // for errors
            }
            actionGetResearcherDetails(people, options, 0)
        },
        options);

}
var actionGetPastMembersList = function (options) {
    let { req, res, next } = options;
    let today = time.moment().format('YYYY-MM-DD');
    let unitID = req.params.unitID;
    let q = '%'
    let limit = 10;
    let offset = 0;
    let sortOrder = 'ASC';
    if (req.query.q !== undefined) {
        let qraw = req.query.q;
        q = '%' + qraw.replace(/\s/gi,'%') + '%'
    }
    if (req.query.limit !== undefined) {
        limit = parseInt(req.query.limit, 10);
    }
    options.pageSize = limit;
    if (req.query.offset !== undefined) {
        offset = parseInt(req.query.offset, 10);
    }
    options.offset = offset;
    if (req.query.sortOrder !== undefined) {
        sortOrder = req.query.sortOrder;
        if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
            sortOrder = 'ASC';
        }
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name'
        + ' FROM people'
        + ' JOIN people_labs ON people_labs.person_id = people.id'
        + ' JOIN labs ON labs.id = people_labs.lab_id'
        + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
        + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
        + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
        + ' WHERE people.status = 1 AND groups_units.unit_id = ? AND people.name LIKE ?'
        + ' AND ((people_labs.valid_from > ? AND people_labs.valid_until IS NULL)'
        + '     OR (people_labs.valid_from > ? AND people_labs.valid_until > ?)'
        + '     OR (people_labs.valid_from IS NULL AND people_labs.valid_until < ?)'
        + '     OR (people_labs.valid_from < ? AND people_labs.valid_until < ?))'
        + ' ORDER BY people.name ' + sortOrder
        + ' LIMIT ?, ?;';
    places.push(unitID, q, today, today, today, today, today, today, offset, limit);
    options.today = today;
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                actionCountPastTotal(resQuery, options)
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
var actionCountPastTotal = function (people, options) {
    let { req, res, next, today } = options;
    let unitID = req.params.unitID;
    let q = '%';
    if (req.query.q !== undefined) {
        let qraw = req.query.q;
        q = '%' + qraw.replace(/\s/gi, '%') + '%'
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT COUNT(*) AS total_number'
        + ' FROM (SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name'
            + ' FROM people'
            + ' JOIN people_labs ON people_labs.person_id = people.id'
            + ' JOIN labs ON labs.id = people_labs.lab_id'
            + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
            + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
            + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
            + ' WHERE people.status = 1 AND groups_units.unit_id = ? AND people.name LIKE ?'
            + ' AND ((people_labs.valid_from > ? AND people_labs.valid_until IS NULL)'
            + '     OR (people_labs.valid_from > ? AND people_labs.valid_until > ?)'
            + '     OR (people_labs.valid_from IS NULL AND people_labs.valid_until < ?)'
            + '     OR (people_labs.valid_from < ? AND people_labs.valid_until < ?))'
            + ') AS unit_people;';
    places.push(unitID, q, today, today, today, today, today, today);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.totalSearch = resQuery[0].total_number;
            } else {
                options.totalSearch = -1; // for errors
            }
            actionGetResearcherDetails(people, options, 0)
        },
        options);

}

var actionGetResearcherDetails = function (people, options, i) {
    let { req, res, next } = options;
    let person = people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM researchers_info'
        + ' WHERE person_id = ?;';
    places.push(person.person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].researcher_details = resQuery;
            actionGetMemberLabs(people, options, i)
        },
        options);
};
var actionGetMemberLabs = function (people, options, i) {
    let { req, res, next } = options;
    let person = people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_labs.*,'
        + ' labs.name AS lab_name, labs.short_name AS lab_short_name,'
        + ' labs.started AS lab_started, labs.finished AS lab_finished,'
        + ' lab_positions.name_en AS lab_position_name_en, lab_positions.name_pt AS lab_position_name_pt'
        + ' FROM people_labs'
        + ' JOIN labs ON labs.id = people_labs.lab_id'
        + ' LEFT JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
        + ' WHERE people_labs.person_id = ?;';
    places.push(person.person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].history = resQuery;
            if (resQuery.length > 0) {
                actionGetLabsGroups(resQuery, people, options, i, 0)
            } else if (i + 1 < people.length) {
                actionGetMemberLabs(people, options, i + 1);
            } else {
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
            }
        },
        options);
};
var actionGetLabsGroups = function (positions, people, options, i, j) {
    let { req, res, next } = options;
    let position = positions[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT `groups`.*, labs_groups.valid_from, labs_groups.valid_until'
        + ' FROM labs_groups'
        + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
        + ' WHERE labs_groups.lab_id = ?'
        + ' AND ((labs_groups.valid_from IS NULL AND labs_groups.valid_until IS NULL)'
        + ' OR (labs_groups.valid_from IS NULL AND labs_groups.valid_until >= ?)'
        + ' OR (labs_groups.valid_from <= ? AND labs_groups.valid_until IS NULL)'
        + ' OR (labs_groups.valid_from <= ? AND labs_groups.valid_until >= ?)'
        + ' OR (labs_groups.valid_from <= ? AND labs_groups.valid_until >= ?)'
        + ' OR (labs_groups.valid_from >= ? AND labs_groups.valid_until <= ?)'
        + ' OR (labs_groups.valid_from IS NULL AND ? IS NULL)'
        + ' OR (? IS NULL AND labs_groups.valid_until IS NULL)'
        + ' OR (? IS NULL AND ? IS NULL)'
        + ');';
    places.push(position.lab_id,
        position.valid_from,
        position.valid_until,
        position.valid_from, position.valid_from,
        position.valid_until, position.valid_until,
        position.valid_from, position.valid_until,
        position.valid_from,
        position.valid_until,
        position.valid_from, position.valid_until
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].history[j].groups = resQuery;
            if (resQuery.length > 0) {
                actionGetGroupsUnits(resQuery, positions, people, options, i, j, 0)
            } else {
                people[i].history[j].groups = [];
                if (j + 1 < positions.length) {
                    actionGetLabsGroups(positions, people, options, i, j + 1);
                } else if (i + 1 < people.length) {
                    actionGetMemberLabs(people, options, i + 1);
                } else {
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
                }
            }
        },
        options);
};
var actionGetGroupsUnits = function (groups, positions, people, options, i, j, k) {
    let { req, res, next } = options;
    let group = groups[k];
    var querySQL = '';
    var places = [];
    // to be selected it suffices having an overlap
    querySQL = querySQL + 'SELECT units.*, groups_units.valid_from, groups_units.valid_until'
        + ' FROM groups_units'
        + ' JOIN units ON units.id = groups_units.unit_id'
        + ' WHERE groups_units.group_id = ?'
        + ' AND ((groups_units.valid_from IS NULL AND groups_units.valid_until IS NULL)'
        + ' OR (groups_units.valid_from IS NULL AND groups_units.valid_until >= ?)'
        + ' OR (groups_units.valid_from <= ? AND groups_units.valid_until IS NULL)'
        + ' OR (groups_units.valid_from <= ? AND groups_units.valid_until >= ?)'
        + ' OR (groups_units.valid_from <= ? AND groups_units.valid_until >= ?)'
        + ' OR (groups_units.valid_from >= ? AND groups_units.valid_until <= ?)'
        + ' OR (groups_units.valid_from IS NULL AND ? IS NULL)'
        + ' OR (? IS NULL AND groups_units.valid_until IS NULL)'
        + ' OR (? IS NULL AND ? IS NULL)'
        + ');';
    places.push(group.id,
        group.valid_from,
        group.valid_until,
        group.valid_from, group.valid_from,
        group.valid_until, group.valid_until,
        group.valid_from, group.valid_until,
        group.valid_from,
        group.valid_until,
        group.valid_from, group.valid_until
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].history[j].groups[k].units = resQuery;
            if (k + 1 < groups.length) {
                actionGetGroupsUnits(groups, positions, people, options, i, j, k + 1);
            } else if (j + 1 < positions.length) {
                actionGetLabsGroups(positions, people, options, i, j + 1);
            } else if (i + 1 < people.length) {
                actionGetResearcherDetails(people, options, i + 1);
            } else {
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
            }
        },
        options);
};
module.exports.getMembersList = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetCurrentMembersList(options) },
        { req, res, next }
    );
};
module.exports.getPastMembersList = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPastMembersList(options) },
        { req, res, next }
    );
};

var actionGetUnitInfo = function (options) {
    let { req, res, next } = options;
    let unitID = req.params.unitID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
        + ' FROM units'
        + ' WHERE id = ?;';
    places.push(unitID)
    sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getUnitInfo = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetUnitInfo(options) },
        { req, res, next }
    );
};