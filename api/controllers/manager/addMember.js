const jwtUtil = require('../../config/jwt_utilities')
const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
// there are no notifications to external APIs because the user must agree first with this

var addUser = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    let data = req.body.data
    let hashedPassword = jwtUtil.hashPassword(data.password);
    querySQL = querySQL
        + 'INSERT INTO `users`'
        + ' (username, password, created, deactivated, permission_level_id)'
        + ' VALUES (?,?, NOW(), ?, ?);';
    places.push(data.username, hashedPassword, 0, 5);
    sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.userID = resQuery.insertId;
            return addPerson(options)
        },
        {req, res, next}
    );
};
var addPerson = function (options) {
    let { req, res, next, userID } = options;
    let data = req.body.data;
    let places = [];
    querySQL = 'INSERT INTO people'
        + ' (user_id, `name`, colloquial_name, gender, birth_date, status, visible_public)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?);';
    places.push(
        userID,
        data.name,
        data.colloquial_name,
        data.gender,
        data.birth_date,
        1,
        0
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.personID = resQuery.insertId;
            addPersonHistory(options);
        },
        options);
};
var addPersonHistory = function (options) {
    let { req, res, next, userID, personID } = options;
    let data = req.body.data;
    let places = [];
    querySQL = 'INSERT INTO people_history'
        + ' (person_id, user_id, `name`, colloquial_name, gender, birth_date,'
        + ' status, visible_public, created, operation, changed_by)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?);';
    places.push(
        personID,
        userID,
        data.name,
        data.colloquial_name,
        data.gender,
        data.birth_date,
        1,
        0,
        'C',
        data.changedBy
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (data.roles.length > 0) {
                options.i = 0
                return addPersonCountry(options);
            } else {
                return addPersonalEmail(options);
            }
        },
        options);
};
var addPersonCountry = function (options) {
    let { req, res, next, personID, i } = options;
    let data = req.body.data;
    let places = [];
    querySQL = 'INSERT INTO people_countries'
            + ' (person_id, country_id)'
            + ' VALUES (?,?);';
    places.push(personID,
        data.countries[i].id);
    sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < data.countries.length) {
                options.i = i + 1;
                return addPersonCountry(options);
            } else {
                return addPersonalEmail(options);
            }
        },
        options);
};
var addPersonalEmail = function (options) {
    let { req, res, next, personID } = options;
    let data = req.body.data;
    if (data.personal_emails !== undefined) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'INSERT INTO personal_emails'
                        + ' (person_id, email)'
                        + ' VALUES (?,?);';
        places.push(
            personID,
            data.personal_emails.email
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                return addPersonalPhone(options);
            },
            options);
    } else {
        return addPersonalPhone(options);
    }
};
var addPersonalPhone = function (options) {
    let { req, res, next, personID } = options;
    let data = req.body.data;
    if (data.personal_phones !== undefined) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL
            + 'INSERT INTO personal_phones'
            + ' (person_id, phone)'
            + ' VALUES (?,?);';
        places.push(
            personID,
            data.personal_phones.phone
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                return addWorkEmail(options);
            },
            options);
    } else {
        return addWorkEmail(options);
    }
};
var addWorkEmail = function (options) {
    let { req, res, next, personID } = options;
    let data = req.body.data;
    if (data.emails !== undefined) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL
            + 'INSERT INTO emails'
            + ' (person_id, email)'
            + ' VALUES (?,?);';
        places.push(
            personID,
            data.emails.email
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                return addWorkPhone(options);
            },
            options);
    } else {
        return addWorkPhone(options);
    }
};
var addWorkPhone = function (options) {
    let { req, res, next, personID } = options;
    let data = req.body.data;
    if (data.phones !== undefined) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL
            + 'INSERT INTO phones'
            + ' (person_id, phone, extension)'
            + ' VALUES (?,?,?);';
        places.push(
            personID,
            data.phones.phone,
            data.phones.extension
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                return addPole(options);
            },
            options);
    } else {
        return addPole(options);
    }
};
var addPole = function (options) {
    let { req, res, next, personID } = options;
    let data = req.body.data;
    let places = [];
    querySQL = 'INSERT INTO people_institution_city'
        + ' (person_id, city_id)'
        + ' VALUES (?, ?);';
    places.push(
        personID,
        data.poles,
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (data.roles.length > 0) {
                options.i = 0;
                return addRole(options);
            } else {
                //finish
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": "Success!"
                    }
                });
                return;
            }
        },
        options);
};
var addRole = function (options) {
    let { req, res, next, personID, i } = options;
    let data = req.body.data;
    let role = data.roles[i];
    let places = [];
    querySQL = 'INSERT INTO people_roles'
        + ' (person_id, role_id)'
        + ' VALUES (?, ?);';
    places.push(
        personID,
        role.role_id
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < data.roles.length) {
                options.i = i + 1;
                return addRole(options);
            } else {
                if (data.current_positions.length > 0) {
                    options.i = 0;
                    return addLab(options);
                } else if (data.tech_current_positions.length > 0) {
                    options.i = 0;
                    return addFacility(options);
                } else if (data.scm_current_positions.length > 0) {
                    options.i = 0;
                    return addScienceManagement(options);
                } else if (data.adm_current_positions.length > 0) {
                    options.i = 0;
                    return addAdministrative(options);
                } else {
                    //finish
                    responses.sendJSONResponseOptions({
                        response: res,
                        status: 200,
                        message: {
                            "status": "success", "statusCode": 200,
                            "message": "Success!"
                        }
                    });
                    return;
                }
            }
        },
        options);
};
var addLab = function (options) {
    let { req, res, next, personID, i } = options;
    let data = req.body.data;
    let position = data.current_positions[i];
    let places = [];
    querySQL = 'INSERT INTO people_labs'
        + ' (person_id, lab_id, lab_position_id, dedication, valid_from, valid_until)'
        + ' VALUES (?, ?, ?, ?, ?, ?);';
    places.push(
        personID,
        position.lab_id,
        position.lab_position_id,
        position.dedication,
        position.valid_from,
        position.valid_until,
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < data.current_positions.length) {
                options.i = i + 1;
                return addLab(options);
            } else {
                if (data.tech_current_positions.length > 0) {
                    options.i = 0;
                    return addFacility(options);
                } else if (data.scm_current_positions.length > 0) {
                    options.i = 0;
                    return addScienceManagement(options);
                } else if (data.adm_current_positions.length > 0) {
                    options.i = 0;
                    return addAdministrative(options);
                } else {
                    //finish
                    responses.sendJSONResponseOptions({
                        response: res,
                        status: 200,
                        message: {
                            "status": "success", "statusCode": 200,
                            "message": "Success!"
                        }
                    });
                    return;
                }
            }
        },
        options);
};
var addFacility = function (options) {
    let { req, res, next, personID, i } = options;
    let data = req.body.data;
    let position = data.tech_current_positions[i];
    let places = [];
    querySQL = 'INSERT INTO technicians'
        + ' (person_id, technician_office_id, technician_position_id, dedication, valid_from, valid_until)'
        + ' VALUES (?, ?, ?, ?, ?, ?);';
    places.push(
        personID,
        position.technician_office_id,
        position.technician_position_id,
        position.dedication,
        position.valid_from,
        position.valid_until,
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.technicianID = resQuery.insertId;
            return addFacilityUnit(options)
        },
        options);
};
var addFacilityUnit = function (options) {
    let { req, res, next, technicianID, i } = options;
    let data = req.body.data;
    let position = data.tech_current_positions[i];
    let places = [];
    querySQL = 'INSERT INTO technicians_units'
        + ' (technician_id, unit_id)'
        + ' VALUES (?, ?);';
    places.push(
        technicianID,
        position.unit_id
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < data.tech_current_positions.length) {
                options.i = i + 1;
                return addFacility(options);
            } else {
                if (data.scm_current_positions.length > 0) {
                    options.i = 0;
                    return addScienceManagement(options);
                } else if (data.adm_current_positions.length > 0) {
                    options.i = 0;
                    return addAdministrative(options);
                } else {
                    //finish
                    responses.sendJSONResponseOptions({
                        response: res,
                        status: 200,
                        message: {
                            "status": "success", "statusCode": 200,
                            "message": "Success!"
                        }
                    });
                    return;
                }
            }
        },
        options);
}
var addScienceManagement = function (options) {
    let { req, res, next, personID, i } = options;
    let data = req.body.data;
    let position = data.scm_current_positions[i];
    let places = [];
    querySQL = 'INSERT INTO science_managers'
        + ' (person_id, science_manager_office_id, science_manager_position_id, dedication, valid_from, valid_until)'
        + ' VALUES (?, ?, ?, ?, ?, ?);';
    places.push(
        personID,
        position.science_manager_office_id,
        position.science_manager_position_id,
        position.dedication,
        position.valid_from,
        position.valid_until,
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.scienceManagerID = resQuery.insertId;
            return addScienceManagementUnit(options)
        },
        options);
};
var addScienceManagementUnit = function (options) {
    let { req, res, next, scienceManagerID, i } = options;
    let data = req.body.data;
    let position = data.scm_current_positions[i];
    let places = [];
    querySQL = 'INSERT INTO science_managers_units'
        + ' (science_manager_id, unit_id)'
        + ' VALUES (?, ?);';
    places.push(
        scienceManagerID,
        position.unit_id
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < data.scm_current_positions.length) {
                options.i = i + 1;
                return addScienceManagement(options);
            } else {
                if (data.adm_current_positions.length > 0) {
                    options.i = 0;
                    return addAdministrative(options);
                } else {
                    //finish
                    responses.sendJSONResponseOptions({
                        response: res,
                        status: 200,
                        message: {
                            "status": "success", "statusCode": 200,
                            "message": "Success!"
                        }
                    });
                    return;
                }
            }
        },
        options);
}
var addAdministrative = function (options) {
    let { req, res, next, personID, i } = options;
    let data = req.body.data;
    let position = data.adm_current_positions[i];
    let places = [];
    querySQL = 'INSERT INTO people_administrative_offices'
        + ' (person_id, administrative_office_id, administrative_position_id, dedication, valid_from, valid_until)'
        + ' VALUES (?, ?, ?, ?, ?, ?);';
    places.push(
        personID,
        position.administrative_office_id,
        position.administrative_position_id,
        position.dedication,
        position.valid_from,
        position.valid_until,
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.administrativeID = resQuery.insertId;
            return addAdministrativeUnit(options)
        },
        options);
};
var addAdministrativeUnit = function (options) {
    let { req, res, next, administrativeID, i } = options;
    let data = req.body.data;
    let position = data.adm_current_positions[i];
    let places = [];
    querySQL = 'INSERT INTO people_administrative_units'
        + ' (administrative_id, unit_id)'
        + ' VALUES (?, ?);';
    places.push(
        administrativeID,
        position.unit_id
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < data.adm_current_positions.length) {
                options.i = i + 1;
                return addAdministrative(options);
            } else {
                //finish
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": "Success!"
                    }
                });
                return;
            }
        },
        options);
}

module.exports.addMember = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { addUser(options) },
        { req, res, next }
    );
}