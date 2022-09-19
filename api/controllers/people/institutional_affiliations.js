// TODO: technical, science and administrative
const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const notifications = require('../utilities/notifications');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;

var actionGetPoles = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_institution_city.*, institution_city.city'
            + ' FROM people_institution_city'
            + ' JOIN institution_city ON institution_city.id = people_institution_city.city_id'
            + ' WHERE people_institution_city.person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getPoles = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPoles(options) },
        { req, res, next }
    );
};
var actionCreatePole = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO people_institution_city'
            + ' (person_id, city_id, valid_from, valid_until)'
            + ' VALUES (?,?,?,?)';
    places.push(personID, data.city_id, data.valid_from, data.valid_until);
    sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createPole = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreatePole(options) },
        { req, res, next }
    );
};
var actionUpdatePole = function (options) {
    let { req, res, next } = options;
    let poleID = req.params.poleID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    if (data.valid_from === '') { data.valid_from = null }
    if (data.valid_until === '') { data.valid_until = null }
    querySQL = querySQL + 'UPDATE people_institution_city'
            + ' SET city_id = ?,'
            + ' valid_from = ?,'
            + ' valid_until = ?'
            + ' WHERE id = ?;'
            ;
    places.push(data.city_id, data.valid_from, data.valid_until, poleID);
    sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updatePole = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdatePole(options) },
        { req, res, next }
    );
};
var actionDeletePole = function (options) {
    let { req, res, next } = options;
    let poleID = req.params.poleID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM people_institution_city'
                        + ' WHERE id = ?;';
    places.push(poleID);
    sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.deletePole = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeletePole(options) },
        { req, res, next }
    );
};



var actionGetRoles = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
        + ' FROM people_roles'
        + ' WHERE person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getRoles = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetRoles(options) },
        { req, res, next }
    );
};
var actionCreateRole = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO people_roles'
            + ' (person_id, role_id)'
            + ' SELECT ?,? FROM DUAL'
            + ' WHERE NOT EXISTS ('
            + 'SELECT * FROM people_roles WHERE person_id = ? AND role_id = ?'
            + ')'
            ;
    if (typeof data === 'number') {
        places.push(personID, data,
                    personID, data);
    } else {
        places.push(personID, data.role_id,
                    personID, data.role_id);
    }
    //places.push(personID, data.role_id);
    sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createRole = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateRole(options) },
        { req, res, next }
    );
};
var actionDeleteRoles = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    // roles are deleted only when the corresponing tables are empty
    querySQL = querySQL + 'DELETE FROM people_roles'
                        + ' WHERE ('
                        + '  (person_id = ? AND role_id = 1 AND (SELECT COUNT(*) AS total_number1 FROM people_labs WHERE person_id = ?) = 0)'
                        + '  OR (person_id = ? AND role_id = 2 AND (SELECT COUNT(*) AS total_number2 FROM technicians WHERE person_id = ?) = 0)'
                        + '  OR (person_id = ? AND role_id = 3 AND (SELECT COUNT(*) AS total_number3 FROM science_managers WHERE person_id = ?) = 0)'
                        + '  OR (person_id = ? AND role_id = 4 AND (SELECT COUNT(*) AS total_number4 FROM people_administrative_offices WHERE person_id = ?) = 0)'
                        + ');'
    places.push(
        personID,personID,
        personID,personID,
        personID,personID,
        personID,personID
    );
    sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.deleteRoles = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteRoles(options) },
        { req, res, next }
    );
};

var actionGetLabAffiliations = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_labs.*,'
        + ' labs.name AS lab_name, labs.short_name AS lab_short_name,'
        + ' lab_positions.name_en AS lab_position_name_en,'
        + ' lab_positions.name_pt AS lab_position_name_pt,'
        + ' lab_positions.sort_order AS lab_position_sort_order'
        + ' FROM people_labs'
        + ' JOIN labs ON people_labs.lab_id = labs.id'
        + ' LEFT JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
        + ' WHERE people_labs.person_id = ?';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                actionGetLabGroups(resQuery, options, 0);
            } else {
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

            }

        },
        options);
};
var actionGetLabGroups = function (positions, options, i) {
    let { req, res, next } = options;
    if (positions[i].valid_from === '') {
        positions[i].valid_from = null;
    }
    if (positions[i].valid_until === '') {
        positions[i].valid_until = null;
    }
    var querySQL = '';
    var places = [];
    // to be selected it suffices having an overlap
    querySQL = querySQL + 'SELECT `groups`.*, labs_groups.valid_from, labs_groups.valid_until'
        + ' FROM labs_groups'
        + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
        + ' WHERE labs_groups.lab_id = ?'
        + ' AND ((labs_groups.valid_from IS NULL AND labs_groups.valid_until IS NULL)'
        +         ' OR (labs_groups.valid_from IS NULL AND labs_groups.valid_until >= ?)'
        +         ' OR (labs_groups.valid_from <= ? AND labs_groups.valid_until IS NULL)'
        +         ' OR (labs_groups.valid_from <= ? AND labs_groups.valid_until >= ?)'
        +         ' OR (labs_groups.valid_from <= ? AND labs_groups.valid_until >= ?)'
        +         ' OR (labs_groups.valid_from >= ? AND labs_groups.valid_until <= ?)'
        +         ' OR (labs_groups.valid_from IS NULL AND ? IS NULL)'
        +         ' OR (? IS NULL AND labs_groups.valid_until IS NULL)'
        +         ' OR (? IS NULL AND ? IS NULL)'
        + ');';
    places.push(positions[i].lab_id,
        positions[i].valid_from,
        positions[i].valid_until,
        positions[i].valid_from, positions[i].valid_from,
        positions[i].valid_until, positions[i].valid_until,
        positions[i].valid_from, positions[i].valid_until,
        positions[i].valid_from,
        positions[i].valid_until,
        positions[i].valid_from, positions[i].valid_until
        );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                positions[i].groups = resQuery;
                actionGetGroupsUnits(positions, options, i, 0);
            } else {
                positions[i].groups = [{units: [{}]}];
                if (i + 1 < positions.length) {
                    actionGetLabGroups(positions, options, i + 1);
                } else {
                    responses.sendJSONResponseOptions({
                        response: res,
                        status: 200,
                        message: {
                            "status": "success", "statusCode": 200,
                            "count": positions.length,
                            "result": positions
                        }
                    });
                    return;
                }
            }
        },
        options);
};
var actionGetGroupsUnits = function (positions, options, i, j) {
    let { req, res, next } = options;
    if (positions[i].groups[j].valid_from === '') {
        positions[i].groups[j].valid_from = null;
    }
    if (positions[i].groups[j].valid_until === '') {
        positions[i].groups[j].valid_until = null;
    }
    var querySQL = '';
    var places = [];
    // to be selected it suffices having an overlap
    querySQL = querySQL + 'SELECT units.*, groups_units.valid_from, groups_units.valid_until'
        + ' FROM groups_units'
        + ' JOIN units ON units.id = groups_units.unit_id'
        + ' WHERE groups_units.group_id = ?'
        + ' AND ((groups_units.valid_from IS NULL AND groups_units.valid_until IS NULL)'
        +      ' OR (groups_units.valid_from IS NULL AND groups_units.valid_until >= ?)'
        +      ' OR (groups_units.valid_from <= ? AND groups_units.valid_until IS NULL)'
        +      ' OR (groups_units.valid_from <= ? AND groups_units.valid_until >= ?)'
        +      ' OR (groups_units.valid_from <= ? AND groups_units.valid_until >= ?)'
        +      ' OR (groups_units.valid_from >= ? AND groups_units.valid_until <= ?)'
        +      ' OR (groups_units.valid_from IS NULL AND ? IS NULL)'
        +      ' OR (? IS NULL AND groups_units.valid_until IS NULL)'
        +      ' OR (? IS NULL AND ? IS NULL)'
        + ');';
    places.push(positions[i].groups[j].id,
        positions[i].groups[j].valid_from,
        positions[i].groups[j].valid_until,
        positions[i].groups[j].valid_from, positions[i].groups[j].valid_from,
        positions[i].groups[j].valid_until, positions[i].groups[j].valid_until,
        positions[i].groups[j].valid_from, positions[i].groups[j].valid_until,
        positions[i].groups[j].valid_from,
        positions[i].groups[j].valid_until,
        positions[i].groups[j].valid_from, positions[i].groups[j].valid_until
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            positions[i].groups[j].units = resQuery;
            if (j + 1 < positions[i].groups.length) {
                actionGetGroupsUnits(positions, options, i, j + 1);
            } else if (i + 1 < positions.length) {
                actionGetLabGroups(positions, options, i + 1);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": positions.length,
                        "result": positions
                    }
                });
                return;
            }
        },
        options);
};
module.exports.getLabAffiliations = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetLabAffiliations(options) },
        { req, res, next }
    );
};
var actionCreateLabAffiliation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    if (data.dedication === '') {
        data.dedication = null;
    }
    querySQL = querySQL + 'INSERT INTO people_labs'
        + ' (person_id, lab_id, lab_position_id, dedication,'
        + ' pluriannual, integrated, nuclearCV, valid_from, valid_until)'
        + ' VALUES (?,?,?,?,?,?,?,?,?);'
        ;
    places.push(personID, data.lab_id, data.lab_position_id, data.dedication,
        data.pluriannual, data.integrated, data.nuclearCV, data.valid_from, data.valid_until);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.peopleLabsId = resQuery.insertId;
            return insertLabAffiliationHistoryOnCreate(options);
        },
        options
    );
};
var insertLabAffiliationHistoryOnCreate = function (options) {
    let { req, res, next, peopleLabsId } = options;
    let personID = req.params.personID;
    let userID = req.payload.userID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    if (data.dedication === '') {
        data.dedication = null;
    }
    querySQL = querySQL + 'INSERT INTO people_labs_history'
        + ' (people_labs_id, person_id, lab_id, lab_position_id, dedication,'
        + ' pluriannual, integrated, nuclearCV, valid_from, valid_until, created, operation, changed_by)'
        + ' VALUES (?,?,?,?,?,?,?,?,?,?,NOW(),?,?);'
        ;
    places.push(peopleLabsId, personID, data.lab_id, data.lab_position_id, data.dedication,
        data.pluriannual, data.integrated, data.nuclearCV, data.valid_from, data.valid_until,
        'C',userID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "Inserted new person affiliation."
            }
        });

};
module.exports.createLabAffiliation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateLabAffiliation(options) },
        { req, res, next }
    );
};
var actionUpdateLabAffiliation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let affiliationID = req.params.affiliationID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    if (data.dedication === '') {
        data.dedication = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE people_labs'
        + ' SET lab_id = ?,'
        + ' lab_position_id = ?,'
        + ' dedication = ?,'
        + ' pluriannual = ?,'
        + ' integrated = ?,'
        + ' nuclearCV = ?,'
        + ' valid_from = ?,'
        + ' valid_until = ?'
        + ' WHERE id = ?'
        ;
    places.push(data.lab_id, data.lab_position_id, data.dedication,
        data.pluriannual, data.integrated, data.nuclearCV, data.valid_from, data.valid_until,
        affiliationID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return insertLabAffiliationHistoryOnUpdate(options)
        },
        options);
};
var insertLabAffiliationHistoryOnUpdate = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let userID = req.payload.userID;
    let affiliationID = req.params.affiliationID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    if (data.dedication === '') {
        data.dedication = null;
    }
    querySQL = querySQL + 'INSERT INTO people_labs_history'
        + ' (people_labs_id, person_id, lab_id, lab_position_id, dedication,'
        + ' pluriannual, integrated, nuclearCV, valid_from, valid_until, updated, operation, changed_by)'
        + ' VALUES (?,?,?,?,?,?,?,?,?,?,NOW(),?,?);'
        ;
    places.push(affiliationID, personID, data.lab_id, data.lab_position_id, data.dedication,
        data.pluriannual, data.integrated, data.nuclearCV, data.valid_from, data.valid_until,
        'U', userID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "Updated person affiliation."
            }
        });

};
module.exports.updateLabAffiliation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateLabAffiliation(options) },
        { req, res, next }
    );
};
var actionDeleteLabAffiliation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let affiliationID = req.params.affiliationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM people_labs WHERE id = ?;';
    places.push(affiliationID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return insertLabAffiliationHistoryOnDelete(options);
        },
        options);
};
var insertLabAffiliationHistoryOnDelete = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let userID = req.payload.userID;
    let affiliationID = req.params.affiliationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO people_labs_history'
        + ' (people_labs_id, person_id,'
        + ' updated, operation, changed_by)'
        + ' VALUES (?,?,NOW(),?,?);'
        ;
    places.push(affiliationID, personID, 'D', userID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "Deleted person affiliation."
            }
        });
};
module.exports.deleteLabAffiliation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteLabAffiliation(options) },
        { req, res, next }
    );
};

var actionGetTechnicalAffiliations = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT technicians.*,'
        + ' technicians_units.unit_id, units.name AS unit_name, units.short_name AS unit_short_name,'
        + ' technician_offices.name_en AS technician_office_name_en,'
        + ' technician_offices.name_pt AS technician_office_name_pt,'
        + ' technician_positions.name_en AS technician_position_name_en,'
        + ' technician_positions.name_pt AS technician_position_name_pt'
        + ' FROM technicians'
        + ' LEFT JOIN technician_offices ON technician_offices.id = technicians.technician_office_id'
        + ' LEFT JOIN technician_positions ON technician_positions.id = technicians.technician_position_id'
        + ' LEFT JOIN technicians_units ON technicians_units.technician_id = technicians.id'
        + ' LEFT JOIN units ON units.id = technicians_units.unit_id'
        + ' WHERE technicians.person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
module.exports.getTechnicalAffiliations = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetTechnicalAffiliations(options) },
        { req, res, next }
    );
};
var actionCreateTechnicalAffiliation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    if (data.dedication === '') {
        data.dedication = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO technicians'
        + ' (person_id, technician_office_id, technician_position_id, dedication,'
        + ' valid_from, valid_until)'
        + ' VALUES (?,?,?,?,?,?);'
        ;
    places.push(personID, data.technician_office_id, data.technician_position_id,
        data.dedication,
        data.valid_from, data.valid_until);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.technicianId = resQuery.insertId;
            actionAddTechnicianUnit(options);
        },
        options
    );
};
var actionAddTechnicianUnit = function (options) {
    let { req, res, next, technicianId } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO technicians_units'
        + ' (technician_id, unit_id)'
        + ' VALUES (?,?);'
        ;
    places.push(technicianId, data.unit_id);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "Inserted new person affiliation."
            }
        });
};
module.exports.createTechnicalAffiliation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateTechnicalAffiliation(options) },
        { req, res, next }
    );
};
var actionUpdateTechnicalAffiliation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let affiliationID = req.params.affiliationID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    if (data.dedication === '') {
        data.dedication = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE technicians'
        + ' SET technician_office_id = ?,'
        + ' technician_position_id = ?,'
        + ' dedication = ?,'
        + ' valid_from = ?,'
        + ' valid_until = ?'
        + ' WHERE id = ?'
        ;
    places.push(data.technician_office_id, data.technician_position_id, data.dedication,
         data.valid_from, data.valid_until,
        affiliationID);
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                actionUpdateTechnicianUnit(options);
            },
            options
        );
};
var actionUpdateTechnicianUnit = function (options) {
    let { req, res, next} = options;
    let personID = req.params.personID;
    let affiliationID = req.params.affiliationID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE technicians_units'
        + ' SET unit_id = ?'
        + ' WHERE technician_id = ?;'
        ;
    places.push(data.unit_id, affiliationID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "Updated person affiliation."
            }
        });
};
module.exports.updateTechnicalAffiliation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateTechnicalAffiliation(options) },
        { req, res, next }
    );
};
var actionDeleteTechnicianUnit = function (options) {
    let { req, res, next} = options;
    let affiliationID = req.params.affiliationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM technicians_units WHERE technician_id = ?;';
    places.push(affiliationID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            actionDeleteTechnicalAffiliation(options);
        },
        options);
};
var actionDeleteTechnicalAffiliation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let affiliationID = req.params.affiliationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM technicians WHERE id = ?;';
    places.push(affiliationID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "Deleted person affiliation."
            }
        });
};
module.exports.deleteTechnicalAffiliation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteTechnicianUnit(options) },
        { req, res, next }
    );
};

var actionGetScienceManagementAffiliations = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT science_managers.*,'
        + ' science_managers_units.unit_id, units.name AS unit_name, units.short_name AS unit_short_name,'
        + ' science_manager_offices.name_en AS science_manager_office_name_en,'
        + ' science_manager_offices.name_pt AS science_manager_office_name_pt,'
        + ' science_manager_positions.name_en AS science_manager_position_name_en,'
        + ' science_manager_positions.name_pt AS science_manager_position_name_pt'
        + ' FROM science_managers'
        + ' LEFT JOIN science_manager_offices ON science_manager_offices.id = science_managers.science_manager_office_id'
        + ' LEFT JOIN science_manager_positions ON science_manager_positions.id = science_managers.science_manager_position_id'
        + ' LEFT JOIN science_managers_units ON science_managers_units.science_manager_id = science_managers.id'
        + ' LEFT JOIN units ON units.id = science_managers_units.unit_id'
        + ' WHERE science_managers.person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
module.exports.getScienceManagementAffiliations = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetScienceManagementAffiliations(options) },
        { req, res, next }
    );
};
var actionCreateScienceManagementAffiliation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    if (data.dedication === '') {
        data.dedication = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO science_managers'
        + ' (person_id, science_manager_office_id, science_manager_position_id, dedication,'
        + ' valid_from, valid_until)'
        + ' VALUES (?,?,?,?,?,?);'
        ;
    places.push(personID, data.science_manager_office_id, data.science_manager_position_id,
        data.dedication,
        data.valid_from, data.valid_until);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.scienceManagerId = resQuery.insertId;
            actionAddScienceManagementUnit(options);
        },
        options
    );
};
var actionAddScienceManagementUnit = function (options) {
    let { req, res, next, scienceManagerId } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO science_managers_units'
        + ' (science_manager_id, unit_id)'
        + ' VALUES (?,?);'
        ;
    places.push(scienceManagerId, data.unit_id);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "Created new person affiliation."
            }
        });
};
module.exports.createScienceManagementAffiliation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateScienceManagementAffiliation(options) },
        { req, res, next }
    );
};
var actionUpdateScienceManagementAffiliation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let affiliationID = req.params.affiliationID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    if (data.dedication === '') {
        data.dedication = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE science_managers'
        + ' SET science_manager_office_id = ?,'
        + ' science_manager_position_id = ?,'
        + ' dedication = ?,'
        + ' valid_from = ?,'
        + ' valid_until = ?'
        + ' WHERE id = ?'
        ;
    places.push(data.science_manager_office_id, data.science_manager_position_id,
        data.dedication,
        data.valid_from, data.valid_until,
        affiliationID);
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                actionUpdateScienceManagementUnit(options);
            },
            options
        );
};
var actionUpdateScienceManagementUnit = function (options) {
    let { req, res, next} = options;
    let affiliationID = req.params.affiliationID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE science_managers_units'
        + ' SET unit_id = ?'
        + ' WHERE science_manager_id = ?;'
        ;
    places.push(data.unit_id, affiliationID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "Updated person affiliation."
            }
        });
};
module.exports.updateScienceManagementAffiliation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateScienceManagementAffiliation(options) },
        { req, res, next }
    );
};
var actionDeleteScienceManagementUnit = function (options) {
    let { req, res, next} = options;
    let affiliationID = req.params.affiliationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM science_managers_units '
                        + ' WHERE science_manager_id = ?;';
    places.push(affiliationID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            actionDeleteScienceManagementAffiliation(options);
        },
        options);
};
var actionDeleteScienceManagementAffiliation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let affiliationID = req.params.affiliationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM science_managers WHERE id = ?;';
    places.push(affiliationID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "Deleted person affiliation."
            }
        });
};
module.exports.deleteScienceManagementAffiliation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteScienceManagementUnit(options) },
        { req, res, next }
    );
};

var actionGetAdministrativeAffiliations = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_administrative_offices.*,'
        + ' people_administrative_units.unit_id, units.name AS unit_name, units.short_name AS unit_short_name,'
        + ' administrative_offices.name_en AS administrative_office_name_en,'
        + ' administrative_offices.name_pt AS administrative_office_name_pt,'
        + ' administrative_positions.name_en AS administrative_position_name_en,'
        + ' administrative_positions.name_pt AS administrative_position_name_pt'
        + ' FROM people_administrative_offices'
        + ' LEFT JOIN administrative_offices ON administrative_offices.id = people_administrative_offices.administrative_office_id'
        + ' LEFT JOIN administrative_positions ON administrative_positions.id = people_administrative_offices.administrative_position_id'
        + ' LEFT JOIN people_administrative_units ON people_administrative_units.administrative_id = people_administrative_offices.id'
        + ' LEFT JOIN units ON units.id = people_administrative_units.unit_id'
        + ' WHERE people_administrative_offices.person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
module.exports.getAdministrativeAffiliations = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetAdministrativeAffiliations(options) },
        { req, res, next }
    );
};
var actionCreateAdministrativeAffiliation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    if (data.dedication === '') {
        data.dedication = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO people_administrative_offices'
        + ' (person_id, administrative_office_id, administrative_position_id, dedication,'
        + ' valid_from, valid_until)'
        + ' VALUES (?,?,?,?,?,?);'
        ;
    places.push(personID, data.administrative_office_id, data.administrative_position_id,
        data.dedication,
        data.valid_from, data.valid_until);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.administrativeId = resQuery.insertId;
            actionAddAdministrativeUnit(options);
        },
        options
    );
};
var actionAddAdministrativeUnit = function (options) {
    let { req, res, next, administrativeId } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO people_administrative_units'
        + ' (administrative_id, unit_id)'
        + ' VALUES (?,?);'
        ;
    places.push(administrativeId, data.unit_id);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "Created new person affiliation."
            }
        });
};
module.exports.createAdministrativeAffiliation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateAdministrativeAffiliation(options) },
        { req, res, next }
    );
};
var actionUpdateAdministrativeAffiliation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let affiliationID = req.params.affiliationID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    if (data.dedication === '') {
        data.dedication = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE people_administrative_offices'
        + ' SET administrative_office_id = ?,'
        + ' administrative_position_id = ?,'
        + ' dedication = ?,'
        + ' valid_from = ?,'
        + ' valid_until = ?'
        + ' WHERE id = ?'
        ;
    places.push(data.administrative_office_id, data.administrative_position_id,
        data.dedication,
        data.valid_from, data.valid_until,
        affiliationID);
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                actionUpdateAdministrativeUnit(options);
            },
            options
        );
};
var actionUpdateAdministrativeUnit = function (options) {
    let { req, res, next} = options;
    let personID = req.params.personID;
    let affiliationID = req.params.affiliationID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE people_administrative_units'
        + ' SET unit_id = ?'
        + ' WHERE administrative_id = ?;'
        ;
    places.push(data.unit_id, affiliationID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "Updated person affiliation."
            }
        });
};
module.exports.updateAdministrativeAffiliation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateAdministrativeAffiliation(options) },
        { req, res, next }
    );
};
var actionDeleteAdministrativeUnit = function (options) {
    let { req, res, next} = options;
    let affiliationID = req.params.affiliationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM people_administrative_units '
                        + ' WHERE administrative_id = ?;';
    places.push(affiliationID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            actionDeleteAdministrativeAffiliation(options);
        },
        options);
};
var actionDeleteAdministrativeAffiliation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let affiliationID = req.params.affiliationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM people_administrative_offices WHERE id = ?;';
    places.push(affiliationID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "Deleted person affiliation."
            }
        });
};
module.exports.deleteAdministrativeAffiliation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteAdministrativeUnit(options) },
        { req, res, next }
    );
};

var getRecipientsGroups = function (options, email_type_id, is_local) {
    let { req, res, next } = options;
    let { currentCity } = req.payload;
    var querySQL = '';
    var places = [];
    if (is_local) {
        querySQL = querySQL + 'SELECT recipient_groups.*, emails.person_id, emails.email'
            + ' FROM recipient_groups'
            + ' JOIN people_recipient_groups ON people_recipient_groups.recipient_group_id = recipient_groups.id'
            + ' LEFT JOIN emails ON emails.person_id = people_recipient_groups.person_id'
            + ' WHERE recipient_groups.city_id = ?'
            + ' AND recipient_groups.any_cities = 0'
            + ' AND recipient_groups.email_type_id = ?;';
        places.push(currentCity.city_id, email_type_id);
    } else {
        querySQL = querySQL + 'SELECT recipient_groups.*, emails.person_id, emails.email'
            + ' FROM recipient_groups'
            + ' JOIN people_recipient_groups ON people_recipient_groups.recipient_group_id = recipient_groups.id'
            + ' LEFT JOIN emails ON emails.person_id = people_recipient_groups.person_id'
            + ' WHERE recipient_groups.city_id IS NULL'
            + ' AND recipient_groups.any_cities = 1'
            + ' AND recipient_groups.email_type_id = ?;';
        places.push(email_type_id);
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionSendChangeMessage(options, resQuery)
                .catch((e) => {
                    console.log(e);
                    return writeMessageDB(options, e);
                });
        },
        options);
};
async function actionSendChangeMessage(options, recipientEmails) {
    options.recipientGroup = recipientEmails[0].id;
    let recipients = '';
    for (let el in recipientEmails) {
        recipients = recipients + recipientEmails[el].email + ', ';
    }
    let { req, res, next } = options;
    let data = req.body.data;
    let mailOptions;
    let subjectText = 'Affiliation change: ' + data.personName;
    let emailBody = 'Hi,\n\n'
        + 'The user ' + data.personName + ' is requesting a change in his/hers affiliation:\n\n'
        + data.message
        + '\n\nBest regards,\nAdmin';
    options.subjectText = subjectText;
    options.emailBody = emailBody;
    if (process.env.NODE_ENV === 'production') {
        mailOptions = {
            from: '"Admin" <admin@laqv-ucibio.info>', // sender address
            to: recipients, // list of receivers (comma-separated)
            subject: subjectText, // Subject line
            text: emailBody,
        };
        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Message %s sent: %s', info.messageId, info.response);
        return writeMessageDB(options);

    } else {
        // just for testing purposes
        mailOptions = {
            from: '"Admin" <admin@laqv-ucibio.info>', // sender address
            to: recipients, // list of receivers (comma-separated)
            subject: 'TESTING: ' + subjectText, // Subject line
            text: emailBody,
        };
        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Message %s sent: %s', info.messageId, info.response);
        return writeMessageDB(options);
    }
};
var writeMessageDB = function (options, error) {
    let today = time.moment();
    let now = time.momentToDate(today, 'Europe/Lisbon', 'YYYY-MM-DD HH:mm:ss')
    let { req, res, next, recipientGroup, subjectText, emailBody } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO email_messages'
        + ' (sender_id, recipient_group_id, subject, message_text, date, solved)'
        + ' VALUES (?,?,?,?,?,?);';
    places.push(personID, recipientGroup, subjectText, emailBody, now, 0);
    sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (error) {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 500,
                    message: { "message": "Error sending email, but database OK!", "error": error.message }
                });
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "message": "Done!",
                    }
                });
            }
            return;
        },
        options);
    return;
};
module.exports.sendChangeMessage = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            getRecipientsGroups(options, 4, true);
        },
        { req, res, next }
    );
};