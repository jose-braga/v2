const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

var actionGetStudents = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_responsibles.*, people.name, people.colloquial_name'
        + ' FROM people_responsibles'
        + ' JOIN people ON people.id = people_responsibles.person_id'
        + ' WHERE people_responsibles.responsible_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.i = 0;
                options.students = resQuery;
                return getStudentLabAffiliations(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 0,
                        "result": []
                    }
                });
                return;
            }
        },
        options
    )
};
var getStudentLabAffiliations = function (options) {
    let { req, res, next, students, i } = options;
    let student = students[i];
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
    places.push(student.person_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.students[i].lab_data = resQuery;
            if (resQuery.length > 0) {
                options.j = 0;
                return getLabGroupsUnits(options);

            } else {
                return getStudentFacilityAffiliations(options);
            }
        },
        options
    )
};
var getLabGroupsUnits = function (options) {
    let { req, res, next, students, i, j } = options;
    let student = students[i];
    let labData = student.lab_data[j];
    var querySQL = '';
    var places = [];
    if (labData.valid_from !== null && labData.valid_until !== null) {
        querySQL = querySQL
            + 'SELECT `groups`.*, units.id AS unit_id, units.name AS unit_name, units.short_name AS unit_short_name'
            + ' FROM labs'
            + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
            + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
            + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
            + ' JOIN units ON units.id = groups_units.unit_id'
            + ' WHERE labs.id = ?'
            + ' AND ('
            + '  ((labs_groups.valid_from IS NULL OR labs_groups.valid_from <= ?)'
                +  ' AND (labs_groups.valid_until IS NULL OR labs_groups.valid_until >= ?))'
            + ' OR ((labs_groups.valid_from IS NULL OR labs_groups.valid_from <= ?)'
            +  ' AND (labs_groups.valid_until IS NULL OR labs_groups.valid_until >= ?))'
            + ')'
            ;
        places.push(labData.lab_id,
            labData.valid_from, labData.valid_from,
            labData.valid_until, labData.valid_until
        );
    } else if (student.lab_data[j].valid_from !== null) {
        querySQL = querySQL
            + 'SELECT `groups`.*, units.id AS unit_id, units.name AS unit_name, units.short_name AS unit_short_name'
            + ' FROM labs'
            + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
            + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
            + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
            + ' JOIN units ON units.id = groups_units.unit_id'
            + ' WHERE labs.id = ?'
            + ' AND ('
            + '  ((labs_groups.valid_until IS NULL OR labs_groups.valid_until >= ?))'
            + ')'
            ;
        places.push(labData.lab_id,
            labData.valid_from
        );
    } else if (student.lab_data[j].valid_until !== null) {
        querySQL = querySQL
            + 'SELECT `groups`.*, units.id AS unit_id, units.name AS unit_name, units.short_name AS unit_short_name'
            + ' FROM labs'
            + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
            + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
            + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
            + ' JOIN units ON units.id = groups_units.unit_id'
            + ' WHERE labs.id = ?'
            + ' AND ('
            + '  ((labs_groups.valid_from IS NULL OR labs_groups.valid_from <= ?)'
                +  ')'
            + ')'
            ;
        places.push(labData.lab_id,
            labData.valid_until
        );
    } else {
        querySQL = querySQL
            + 'SELECT `groups`.*, units.id AS unit_id, units.name AS unit_name, units.short_name AS unit_short_name'
            + ' FROM labs'
            + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
            + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
            + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
            + ' JOIN units ON units.id = groups_units.unit_id'
            + ' WHERE labs.id = ?'
            ;
        places.push(labData.lab_id);
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.students[i].lab_data[j].groups_units = resQuery;
            if (j + 1 < options.students[i].lab_data.length) {
                options.j = j + 1;
                return getLabGroupsUnits(options);
            } else {
                return getStudentFacilityAffiliations(options);
            }
        },
        options
    )
};
var getStudentFacilityAffiliations = function (options) {
    let { req, res, next, students, i } = options;
    let student = students[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT technicians.*,'
        + ' technician_offices.name_en AS technician_office_name_en,'
        + ' technician_offices.started AS technician_office_started, technician_offices.finished AS technician_office_finished,'
        + ' technician_positions.name_en AS technician_position_name_en, technician_positions.name_pt AS technician_position_name_pt,'
        + ' technicians_units.id AS technician_unit_id,'
        + ' units.id AS unit_id, units.name AS unit_name, units.short_name AS unit_short_name'
        + ' FROM technicians'
        + ' JOIN technician_offices ON technician_offices.id = technicians.technician_office_id'
        + ' LEFT JOIN technician_positions ON technician_positions.id = technicians.technician_position_id'
        + ' LEFT JOIN technicians_units ON technicians_units.technician_id = technicians.id'
        + ' LEFT JOIN units ON units.id = technicians_units.unit_id'
        + ' WHERE technicians.person_id = ?;';
    places.push(student.person_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.students[i].technician_data = resQuery;
            return getStudentScienceManagerAffiliations(options);
        },
        options
    )
};
var getStudentScienceManagerAffiliations = function (options) {
    let { req, res, next, students, i } = options;
    let student = students[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT science_managers.*,'
        + ' science_manager_offices.name_en AS science_manager_office_name_en,'
        + ' science_manager_offices.started AS science_manager_office_started, science_manager_offices.finished AS science_manager_office_finished,'
        + ' science_manager_positions.name_en AS science_manager_position_name_en, science_manager_positions.name_pt AS science_manager_position_name_pt,'
        + ' science_managers_units.id AS science_manager_unit_id,'
        + ' units.id AS unit_id, units.name AS unit_name, units.short_name AS unit_short_name'
        + ' FROM science_managers'
        + ' JOIN science_manager_offices ON science_manager_offices.id = science_managers.science_manager_office_id'
        + ' LEFT JOIN science_manager_positions ON science_manager_positions.id = science_managers.science_manager_position_id'
        + ' LEFT JOIN science_managers_units ON science_managers_units.science_manager_id = science_managers.id'
        + ' LEFT JOIN units ON units.id = science_managers_units.unit_id'
        + ' WHERE science_managers.person_id = ?;';
    places.push(student.person_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.students[i].science_manager_data = resQuery;
            return getStudentAdministrativeAffiliations(options);
        },
        options
    )
};
var getStudentAdministrativeAffiliations = function (options) {
    let { req, res, next, students, i } = options;
    let student = students[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_administrative_offices.*,'
        + ' administrative_offices.name_en AS administrative_office_name_en,'
        + ' administrative_offices.started AS administrative_office_started, administrative_offices.finished AS administrative_office_finished,'
        + ' administrative_positions.name_en AS administrative_position_name_en, administrative_positions.name_pt AS administrative_position_name_pt,'
        + ' people_administrative_units.id AS administrative_unit_id,'
        + ' units.id AS unit_id, units.name AS unit_name, units.short_name AS unit_short_name'
        + ' FROM people_administrative_offices'
        + ' JOIN administrative_offices ON administrative_offices.id = people_administrative_offices.administrative_office_id'
        + ' LEFT JOIN administrative_positions ON administrative_positions.id = people_administrative_offices.administrative_position_id'
        + ' LEFT JOIN people_administrative_units ON people_administrative_units.administrative_id = people_administrative_offices.id'
        + ' LEFT JOIN units ON units.id = people_administrative_units.unit_id'
        + ' WHERE people_administrative_offices.person_id = ?;';
    places.push(student.person_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.students[i].administrative_data = resQuery;
            if (i + 1 < options.students.length) {
                options.i = i + 1;
                return getStudentLabAffiliations(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": options.students.length,
                        "result": options.students
                    }
                });
                return;
            }

        },
        options
    )
};
module.exports.getStudents = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetStudents(options) },
        { req, res, next }
    );
};

var actionAddStudents = function (options) {
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
    querySQL = querySQL
        + 'INSERT INTO people_responsibles'
        + ' (person_id, responsible_id, valid_from, valid_until)'
        + ' SELECT * FROM (SELECT ? AS person_id, ? AS responsible_id, ? AS valid_from, ? AS valid_until) AS tmp'
        + ' WHERE NOT EXISTS ('
            + ' SELECT * FROM people_responsibles'
            + ' WHERE person_id <=> ? AND responsible_id <=> ?'
        + ');';
    places.push(
        data.person_id,
        personID,
        data.valid_from,
        data.valid_until,
        data.person_id,
        personID
    )
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.addStudent = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionAddStudents(options) },
        { req, res, next }
    );
};

var actionGetStudentSupervisors = function (options) {
    let { req, res, next } = options;
    let studentID = req.params.studentID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_responsibles.*, people.name, people.colloquial_name'
        + ' FROM people_responsibles'
        + ' JOIN people ON people.id = people_responsibles.responsible_id'
        + ' WHERE people_responsibles.person_id = ?;';
    places.push(studentID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "count": resQuery.length,
                    "result": resQuery
                }
            });
        },
        options
    )
};
module.exports.getStudentDetails = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetStudentSupervisors(options) },
        { req, res, next }
    );
};

var actionUpdateStudentSupervisors = function (options) {
    let { req, res, next } = options;
    let supervisorID = req.params.supervisorID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE people_responsibles'
        + ' SET valid_from = ?,'
        + ' valid_until = ?'
        + ' WHERE id = ?;'
        ;
    places.push(
        data.valid_from,
        data.valid_until,
        supervisorID
    )
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updateStudentSupervisors = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateStudentSupervisors(options) },
        { req, res, next }
    );
};

var actionDeleteStudentSupervisors = function (options) {
    let { req, res, next } = options;
    let supervisorID = req.params.supervisorID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM people_responsibles WHERE id = ?;'
        ;
    places.push(supervisorID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.deleteStudentSupervisors = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteStudentSupervisors(options) },
        { req, res, next }
    );
};

var actionAddStudentLabPosition = function (options) {
    let { req, res, next } = options;
    let studentID = req.params.studentID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO people_labs (person_id, lab_position_id, lab_id, dedication, valid_from, valid_until)'
        + ' VALUES (?,?,?,?,?,?);'
        ;
    places.push(studentID,
        data.lab_position_id,
        data.lab_id,
        data.dedication,
        data.valid_from,
        data.valid_until
    )
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.addStudentLabPosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionAddStudentLabPosition(options) },
        { req, res, next }
    );
};

var actionAddStudentFacilityPosition = function (options) {
    let { req, res, next } = options;
    let studentID = req.params.studentID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO technicians'
        + ' (person_id, technician_position_id, technician_office_id, dedication,'
        + ' valid_from, valid_until)'
        + ' VALUES (?,?,?,?,?,?);'
        ;
    places.push(studentID,
        data.technician_position_id,
        data.technician_office_id,
        data.dedication,
        data.valid_from,
        data.valid_until
    )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.technicianID = resQuery.insertId;
            return addTechnicianUnit(options);
        },
        options
    )
};
var addTechnicianUnit = function (options) {
    let { req, res, next, technicianID } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO technicians_units'
        + ' (technician_id, unit_id)'
        + ' VALUES (?,?);'
        ;
    places.push(technicianID,
        data.unit_id
    )
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.addStudentFacilityPosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionAddStudentFacilityPosition(options) },
        { req, res, next }
    );
};

var actionAddStudentScienceManagementPosition = function (options) {
    let { req, res, next } = options;
    let studentID = req.params.studentID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO science_managers'
        + ' (person_id, science_manager_position_id, science_manager_office_id, dedication,'
        + ' valid_from, valid_until)'
        + ' VALUES (?,?,?,?,?,?);'
        ;
    places.push(studentID,
        data.science_manager_position_id,
        data.science_manager_office_id,
        data.dedication,
        data.valid_from,
        data.valid_until
    )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.scienceManagerID = resQuery.insertId;
            return addScienceManagerUnit(options);
        },
        options
    )
};
var addScienceManagerUnit = function (options) {
    let { req, res, next, scienceManagerID } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO science_managers_units'
        + ' (science_manager_id, unit_id)'
        + ' VALUES (?,?);'
        ;
    places.push(scienceManagerID,
        data.unit_id
    )
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.addStudentScienceManagementPosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionAddStudentScienceManagementPosition(options) },
        { req, res, next }
    );
};

var actionAddStudentAdministrativePosition = function (options) {
    let { req, res, next } = options;
    let studentID = req.params.studentID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO people_administrative_offices'
        + ' (person_id, administrative_position_id, administrative_office_id, dedication,'
        + ' valid_from, valid_until)'
        + ' VALUES (?,?,?,?,?,?);'
        ;
    places.push(studentID,
        data.administrative_position_id,
        data.administrative_office_id,
        data.dedication,
        data.valid_from,
        data.valid_until
    )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.administrativeID = resQuery.insertId;
            return addAdministrativeUnit(options);
        },
        options
    )
};
var addAdministrativeUnit = function (options) {
    let { req, res, next, administrativeID } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO people_administrative_units'
        + ' (administrative_id, unit_id)'
        + ' VALUES (?,?);';
    places.push(administrativeID,
        data.unit_id
    )
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.addStudentAdministrativePosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionAddStudentAdministrativePosition(options) },
        { req, res, next }
    );
};

var actionUpdateStudentLabPosition = function (options) {
    let { req, res, next } = options;
    let positionID = req.params.positionID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE people_labs'
        + ' SET lab_position_id = ?,'
        + ' lab_id = ?,'
        + ' dedication = ?,'
        + ' valid_from = ?,'
        + ' valid_until = ?'
        + ' WHERE id = ?;'
        ;
    places.push(
        data.lab_position_id,
        data.lab_id,
        data.dedication,
        data.valid_from,
        data.valid_until,
        positionID
    )
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updateStudentLabPosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateStudentLabPosition(options) },
        { req, res, next }
    );
};

var actionUpdateStudentFacilityPosition = function (options) {
    let { req, res, next } = options;
    let positionID = req.params.positionID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE technicians'
        + ' SET technician_position_id = ?,'
        + ' technician_office_id = ?,'
        + ' dedication = ?,'
        + ' valid_from = ?,'
        + ' valid_until = ?'
        + ' WHERE id = ?;'
        ;
    places.push(
        data.technician_position_id,
        data.technician_office_id,
        data.dedication,
        data.valid_from,
        data.valid_until,
        positionID
    )
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return updateTechnicianUnit(options);
        },
        options
    )
};
var updateTechnicianUnit = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE technicians_units'
        + ' SET unit_id = ?'
        + ' WHERE id = ?;';
    places.push(data.unit_id, data.technician_unit_id);
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updateStudentFacilityPosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateStudentFacilityPosition(options) },
        { req, res, next }
    );
};

var actionUpdateStudentScienceManagementPosition = function (options) {
    let { req, res, next } = options;
    let positionID = req.params.positionID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE science_managers'
        + ' SET science_manager_position_id = ?,'
        + ' science_manager_office_id = ?,'
        + ' dedication = ?,'
        + ' valid_from = ?,'
        + ' valid_until = ?'
        + ' WHERE id = ?;'
        ;
    places.push(
        data.science_manager_position_id,
        data.science_manager_office_id,
        data.dedication,
        data.valid_from,
        data.valid_until,
        positionID
    )
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return updateScienceManagerUnit(options);
        },
        options
    )
};
var updateScienceManagerUnit = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE science_managers_units'
        + ' SET unit_id = ?'
        + ' WHERE id = ?;';
    places.push(data.unit_id, data.science_manager_unit_id);
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updateStudentScienceManagementPosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateStudentScienceManagementPosition(options) },
        { req, res, next }
    );
};

var actionUpdateStudentAdministrativePosition = function (options) {
    let { req, res, next } = options;
    let positionID = req.params.positionID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE people_administrative_offices'
        + ' SET administrative_position_id = ?,'
        + ' administrative_office_id = ?,'
        + ' dedication = ?,'
        + ' valid_from = ?,'
        + ' valid_until = ?'
        + ' WHERE id = ?;'
        ;
    places.push(
        data.administrative_position_id,
        data.administrative_office_id,
        data.dedication,
        data.valid_from,
        data.valid_until,
        positionID
    )
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return updateAdministrativeUnit(options);
        },
        options
    )
};
var updateAdministrativeUnit = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE people_administrative_units'
        + ' SET unit_id = ?'
        + ' WHERE id = ?;';
    places.push(data.unit_id, data.administrative_unit_id);
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updateStudentAdministrativePosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateStudentAdministrativePosition(options) },
        { req, res, next }
    );
};

var actionDeleteStudentLabPosition = function (options) {
    let { req, res, next } = options;
    let positionID = req.params.positionID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM people_labs WHERE id = ?;';
    places.push(positionID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.deleteStudentLabPosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteStudentLabPosition(options) },
        { req, res, next }
    );
};

var actionDeleteStudentTecnicianUnit = function (options) {
    let { req, res, next } = options;
    let positionID = req.params.positionID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM technicians_units WHERE technician_id = ?;';
    places.push(positionID)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteStudentTecnicianPosition(options);
        },
        options
    )
};
var deleteStudentTecnicianPosition = function (options) {
    let { req, res, next } = options;
    let positionID = req.params.positionID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM technicians WHERE id = ?;';
    places.push(positionID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.deleteStudentFacilityPosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteStudentTecnicianUnit(options) },
        { req, res, next }
    );
};

var actionDeleteStudentScienceManagerUnit = function (options) {
    let { req, res, next } = options;
    let positionID = req.params.positionID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM science_managers_units WHERE science_manager_id = ?;';
    places.push(positionID)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteStudentScienceManagerPosition(options);
        },
        options
    )
};
var deleteStudentScienceManagerPosition = function (options) {
    let { req, res, next } = options;
    let positionID = req.params.positionID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM science_managers WHERE id = ?;';
    places.push(positionID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.deleteStudentScienceManagementPosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteStudentScienceManagerUnit(options) },
        { req, res, next }
    );
};

var actionDeleteStudentAdministrativeUnit = function (options) {
    let { req, res, next } = options;
    let positionID = req.params.positionID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM people_administrative_units WHERE administrative_id = ?;';
    places.push(positionID)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return deleteStudentAdministrativePosition(options);
        },
        options
    )
};
var deleteStudentAdministrativePosition = function (options) {
    let { req, res, next } = options;
    let positionID = req.params.positionID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM people_administrative_offices WHERE id = ?;';
    places.push(positionID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.deleteStudentAdministrativePosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteStudentAdministrativeUnit(options) },
        { req, res, next }
    );
};