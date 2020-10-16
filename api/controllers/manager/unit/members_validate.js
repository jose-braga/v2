const sql = require('../../utilities/sql');
const time = require('../../utilities/time');
const responses = require('../../utilities/responses');
const permissions = require('../../utilities/permissions');

var actionGetMembersValidate = function (options) {
    let { req, res, next } = options;
    let unitID = req.params.unitID;
    let cityID = req.params.cityID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name'
        + ' FROM people'
        + ' LEFT JOIN people_labs ON people_labs.person_id = people.id'
        + ' JOIN labs ON labs.id = people_labs.lab_id'
        + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
        + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
        + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
        + ' JOIN people_institution_city ON people_institution_city.person_id = people.id'
        + ' WHERE people.status = ?';
    places.push(3);
    if (unitID !== undefined) {
        querySQL = querySQL + ' AND groups_units.unit_id = ?';
        places.push(unitID);
    }
    if (cityID !== undefined) {
        querySQL = querySQL + ' AND people_institution_city.city_id = ?';
        places.push(cityID);
    }
    querySQL = querySQL
        + ' UNION'
        + ' SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name'
        + ' FROM people'
        + ' LEFT JOIN technicians ON technicians.person_id = people.id'
        + ' JOIN technicians_units ON technicians_units.technician_id = technicians.id'
        + ' JOIN people_institution_city ON people_institution_city.person_id = people.id'
        + ' WHERE people.status = ?'
    places.push(3);
    if (unitID !== undefined) {
        querySQL = querySQL + ' AND technicians_units.unit_id = ?';
        places.push(unitID);
    }
    if (cityID !== undefined) {
        querySQL = querySQL + ' AND people_institution_city.city_id = ?';
        places.push(cityID);
    }
    querySQL = querySQL
        + ' UNION'
        + ' SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name'
        + ' FROM people'
        + ' LEFT JOIN science_managers ON science_managers.person_id = people.id'
        + ' JOIN science_managers_units ON science_managers_units.science_manager_id = science_managers.id'
        + ' JOIN people_institution_city ON people_institution_city.person_id = people.id'
        + ' WHERE people.status = ?'
    places.push(3);
    if (unitID !== undefined) {
        querySQL = querySQL + ' AND science_managers_units.unit_id = ?';
        places.push(unitID);
    }
    if (cityID !== undefined) {
        querySQL = querySQL + ' AND people_institution_city.city_id = ?';
        places.push(cityID);
    }
    querySQL = querySQL
        + ' UNION'
        + ' SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name'
        + ' FROM people'
        + ' LEFT JOIN people_administrative_offices ON people_administrative_offices.person_id = people.id'
        + ' JOIN people_administrative_units ON people_administrative_units.administrative_id = people_administrative_offices.id'
        + ' JOIN people_institution_city ON people_institution_city.person_id = people.id'
        + ' WHERE people.status = ?'
    places.push(3);
    if (unitID !== undefined) {
        querySQL = querySQL + ' AND people_administrative_units.unit_id = ?';
        places.push(unitID);
    }
    if (cityID !== undefined) {
        querySQL = querySQL + ' AND people_institution_city.city_id = ?';
        places.push(cityID);
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
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
        (options) => { actionGetMembersValidate(options) },
        { req, res, next }
    );
};

var actionValidate = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + ' UPDATE people'
        + ' SET status = 1'
        + ' WHERE id = ?';
    places.push(personID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return addPersonHistory(options);
        },
        options);
};
var addPersonHistory = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + ' INSERT INTO people_history'
        + ' (person_id, status, operation, updated)'
        + ' VALUES (?, ?, ?, NOW());';
    places.push(personID, 1, 'U');
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.validateRegistration = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionValidate(options) },
        { req, res, next }
    );
};