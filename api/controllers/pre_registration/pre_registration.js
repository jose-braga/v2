const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

var actionGetPersonLabs = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_labs.valid_from, people_labs.valid_until, labs.*'
                    + ' FROM people_labs'
                    + ' JOIN labs ON labs.id = people_labs.lab_id'
                    + ' WHERE people_labs.person_id = ?';
    places.push(personID)
    sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.labs = resQuery;
            if (resQuery.length > 0) {
                options.i = 0;
                return getLabGroupHierarchyInfo(options);
            } else {
                // the person does not belong to a lab
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 0,
                        "result": options.labs,
                    }
                });
            }
        },
        options);
};

var getLabGroupHierarchyInfo = function (options) {
    let { req, res, next, labs, i } = options;
    let this_lab = labs[i];
    var querySQL =
        'SELECT `groups`.*, labs_groups.valid_from, labs_groups.valid_until' +
        ' FROM labs_groups' +
        ' JOIN `groups` ON `groups`.id = labs_groups.group_id' +
        ' WHERE labs_groups.lab_id = ?;';
    var places = [this_lab.id];
    sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.labs[i].groups = resQuery;
            options.j = 0;
            return getGroupUnitHierarchyInfo(options);
        },
        options);
};
var getGroupUnitHierarchyInfo = function (options) {
    let { req, res, next, labs, i, j} = options;
    let this_group = labs[i].groups[j];
    console.log(this_group)
    var querySQL =
        'SELECT groups_units.valid_from, groups_units.valid_until, units.*' +
        ' FROM groups_units' +
        ' JOIN units ON units.id = groups_units.unit_id' +
        ' WHERE groups_units.group_id = ?;';
    var places = [this_group.id];
    sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.labs[i].groups[j].units = resQuery;
            if (j + 1 < labs[i].groups.length) {
                options.j = j + 1;
                return getGroupUnitHierarchyInfo(options);
            } else if (i + 1 < labs.length) {
                options.i = i + 1;
                return getLabGroupHierarchyInfo(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": options.labs.length,
                        "result": options.labs,
                    }
                });
            }
        },
        options);
};

module.exports.getPersonLabs = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPersonLabs(options) },
        { req, res, next }
    );
};