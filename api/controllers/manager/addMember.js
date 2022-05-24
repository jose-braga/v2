const jwtUtil = require('../../config/jwt_utilities')
const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;
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
            if (data.countries !== undefined && data.countries.length > 0) {
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
    if (data.countries !== undefined && data.countries !== null && data.countries.length > 0) {
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
    } else {
        return addPersonalEmail(options);
    }

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
                return addScientificIdentifiers(options);
            },
            options);
    } else {
        return addScientificIdentifiers(options);
    }
};
var addScientificIdentifiers = function (options) {
    let { req, res, next, personID } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO researchers_info'
        + ' (person_id, ciencia_id, ORCID)'
        + ' VALUES (?,?,?);';
    places.push(
        personID,
        data.ciencia_id,
        data.ORCID
    );
    sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return addHighestDegree(options);
        },
        options);
};
var addHighestDegree = function (options) {
    let { req, res, next, personID } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    if (data.degree !== undefined && data.degree !== null) {
        querySQL = querySQL
            + 'INSERT INTO degrees_people'
            + ' (person_id, degree_id)'
            + ' VALUES (?,?);';
        places.push(
            personID,
            data.degree.id
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                options.i = 0;
                return addInstitutionalAffiliations(options);
            },
            options);
    } else {
        options.i = 0;
        return addInstitutionalAffiliations(options);
    }
};
var addInstitutionalAffiliations = function (options) {
    let { req, res, next, personID, i } = options;
    let data = req.body.data;
    if (data.current_institutional_affiliations.length > 0) {
        let position = data.current_institutional_affiliations[i];
        let places = [];
        querySQL = 'INSERT INTO people_departments'
            + ' (person_id, department_id, valid_from, valid_until)'
            + ' VALUES (?, ?, ?, ?);';
        places.push(
            personID,
            position.department_id,
            position.valid_from,
            position.valid_until,
        );
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (i + 1 < data.current_institutional_affiliations.length) {
                    options.i = i + 1;
                    return addInstitutionalAffiliations(options);
                } else {
                    options.i = 0;
                    return addWorkplaces(options);
                }
            },
            options);
    } else {
        options.i = 0;
        return addWorkplaces(options);
    }
};
var addWorkplaces = function (options) {
    let { req, res, next, personID } = options;
    let data = req.body.data;
    if (data.workplace !== null && data.workplace !== null && data.workplace !== '') {
        let places = [];
        querySQL = 'INSERT INTO workplaces'
            + ' (person_id, workplace)'
            + ' VALUES (?, ?);';
        places.push(
            personID,
            data.workplace
        );
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                options.i = 0;
                return addCostCenters(options);
            },
            options);
    } else {
        options.i = 0;
        return addCostCenters(options);
    }
};
var addCostCenters = function (options) {
    let { req, res, next, personID, i } = options;
    let data = req.body.data;
    if (data.costCenters.length > 0) {
        let center = data.costCenters[i];
        let places = [];
        querySQL = 'INSERT INTO people_cost_centers'
            + ' (person_id, cost_center_id, valid_from, valid_until)'
            + ' VALUES (?, ?, ?, ?);';
        places.push(
            personID,
            center.cost_center_id,
            center.valid_from,
            center.valid_until,
        );
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (i + 1 < data.costCenters.length) {
                    options.i = i + 1;
                    return addCostCenters(options);
                } else {
                    return addPole(options);
                }
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
            }  else {
                return addJob(options);
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
                    return addJob(options);
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
    if (position.valid_from === '') {
        position.valid_from = null;
    }
    if (position.valid_until === '') {
        position.valid_until = null;
    }
    if (position.dedication === '') {
        position.dedication = null;
    }
    querySQL = 'INSERT INTO people_labs'
        + ' (person_id, lab_id, lab_position_id, dedication, valid_from, valid_until, pluriannual, integrated, nuclearCV)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);';
    places.push(
        personID,
        position.lab_id,
        position.lab_position_id,
        position.dedication,
        position.valid_from,
        position.valid_until,
        position.plurianual,
        position.integrated,
        position.nuclearCV,
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
                    return addJob(options);
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
    if (position.valid_from === '') {
        position.valid_from = null;
    }
    if (position.valid_until === '') {
        position.valid_until = null;
    }
    if (position.dedication === '') {
        position.dedication = null;
    }
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
                    return addJob(options);
                }
            }
        },
        options);
};
var addScienceManagement = function (options) {
    let { req, res, next, personID, i } = options;
    let data = req.body.data;
    let position = data.scm_current_positions[i];
    let places = [];
    if (position.valid_from === '') {
        position.valid_from = null;
    }
    if (position.valid_until === '') {
        position.valid_until = null;
    }
    if (position.dedication === '') {
        position.dedication = null;
    }
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
                    return addJob(options);
                }
            }
        },
        options);
};
var addAdministrative = function (options) {
    let { req, res, next, personID, i } = options;
    let data = req.body.data;
    let position = data.adm_current_positions[i];
    let places = [];
    if (position.valid_from === '') {
        position.valid_from = null;
    }
    if (position.valid_until === '') {
        position.valid_until = null;
    }
    if (position.dedication === '') {
        position.dedication = null;
    }
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
                return addJob(options);
            }
        },
        options);
};
var addJob = function (options) {
    let { req, res, next, personID } = options;
    let data = req.body.data;
    let profSituation = data.professional_situation;
    let places = [];
    let querySQL = '';
    if (profSituation.valid_from === '') {
        profSituation.valid_from = null;
    }
    if (profSituation.valid_until === '') {
        profSituation.valid_until = null;
    }
    if (profSituation.dedication === '') {
        profSituation.dedication = null;
    }
    if (profSituation.situation_id !== null && profSituation.situation_id !== undefined
        && profSituation.category_id !== null && profSituation.category_id !== undefined
    ) {
        querySQL = querySQL + 'INSERT INTO jobs'
            + ' (person_id, organization, dedication, valid_from, valid_until)'
            + ' VALUES (?,?,?,?,?);';
        places.push(personID,
            profSituation.organization,
            profSituation.dedication,
            profSituation.valid_from,
            profSituation.valid_until
        );

        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                options.jobID = resQuery.insertId;
                return getCategorySituationID(options);
            },
            options);

    } else {
        if (data.add_fct_mctes) {
            // send email to managers with the data necessary
            // for addition to FCT/MCTES team
            return addFCTMCTESstatus(options);
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
};
var getCategorySituationID = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    let profSituation = data.professional_situation;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM categories_situations'
                        + ' WHERE category_id = ? AND situation_id = ?;';
    places.push(profSituation.category_id, profSituation.situation_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.new_category_situation_id = resQuery[0].id;
                return updateJobCategorySituationID(options);
            } else {
                // if no row or if more that 1 row
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 400,
                    message: {
                        "status": "error", "statusCode": 400,
                        "message": "An error occurred: situation and category IDs are not compatible",
                    }
                });
                return;
            }
        },
        options);
};
var updateJobCategorySituationID = function (options) {
    let { req, res, next, jobID, new_category_situation_id } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE jobs'
                        + ' SET category_situation_id = ?'
                        + ' WHERE id = ?;';
    places.push(new_category_situation_id, jobID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return addFellowship(options);
        },
        options);
};

var addFellowship = function (options) {
    let { req, res, next, jobID } = options;
    let data = req.body.data;
    let profSituation = data.professional_situation;
    let fellowship = profSituation.fellowship;
    if ((fellowship.reference !== null && fellowship.reference !== undefined && fellowship.reference !== '')
        || (fellowship.fellowship_type_id !== null && fellowship.fellowship_type_id !== undefined)
    ) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'INSERT INTO fellowships'
                            + ' (fellowship_type_id, reference)'
                            + ' VALUES (?, ?);';
        places.push(fellowship.fellowship_type_id, fellowship.reference);
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                options.fellowshipID = resQuery.insertId;
                return addJobFellowshipRelation(options);
            },
            options);

    } else {
        return addContract(options);
    }
};
var addJobFellowshipRelation = function (options) {
    let { req, res, next, jobID, fellowshipID } = options;
    let data = req.body.data;
    let profSituation = data.professional_situation;
    let fellowship = profSituation.fellowship;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO jobs_fellowships'
                        + ' (job_id, fellowship_id)'
                        + ' VALUES (?, ?);';
    places.push(jobID, fellowshipID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return addFellowshipFundingAgency(options);
        },
        options);
};
var addFellowshipFundingAgency = function (options) {
    let { req, res, next, fellowshipID } = options;
    let data = req.body.data;
    let profSituation = data.professional_situation;
    let fellowship = profSituation.fellowship;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO fellowships_funding_agencies'
                        + ' (fellowship_id, funding_agency_id)'
                        + ' VALUES (?, ?);';
    places.push(fellowshipID, fellowship.funding_agency_id);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return addFellowshipManagementEntity(options);
        },
        options);
};
var addFellowshipManagementEntity = function (options) {
    let { req, res, next, fellowshipID } = options;
    let data = req.body.data;
    let profSituation = data.professional_situation;
    let fellowship = profSituation.fellowship;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO fellowships_management_entities'
                        + ' (fellowship_id, management_entity_id)'
                        + ' VALUES (?, ?);';
    places.push(fellowshipID, fellowship.management_entity_id);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            // in principle it should only have fellowship related to the job
            // so it ends here
            if (data.add_fct_mctes) {
                // send email to managers with the data necessary
                // for addition to FCT/MCTES team
                return addFCTMCTESstatus(options);
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

var addContract = function (options) {
    let { req, res, next, jobID } = options;
    let data = req.body.data;
    let profSituation = data.professional_situation;
    let contract = profSituation.contract;
    if ((contract.reference !== null && contract.reference !== undefined && contract.reference !== '')
        || (contract.management_entity_id !== null && contract.management_entity_id !== undefined)
        || (contract.funding_agency_id !== null && contract.funding_agency_id !== undefined)
    ) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'INSERT INTO contracts'
                            + ' (reference)'
                            + ' VALUES (?);';
        places.push(contract.reference);
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                options.contractID = resQuery.insertId;
                return addJobContractRelation(options);
            },
            options);
    } else {
        if (data.add_fct_mctes) {
            return addFCTMCTESstatus(options);
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
};
var addJobContractRelation = function (options) {
    let { req, res, next, jobID, contractID } = options;
    let data = req.body.data;
    let profSituation = data.professional_situation;
    let contract = profSituation.contract;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO jobs_contracts'
                        + ' (job_id, contract_id)'
                        + ' VALUES (?, ?);';
    places.push(jobID, contractID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return addContractFundingAgency(options);
        },
        options);
};
var addContractFundingAgency = function (options) {
    let { req, res, next, contractID } = options;
    let data = req.body.data;
    let profSituation = data.professional_situation;
    let contract = profSituation.contract;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO contracts_funding_agencies'
                        + ' (contract_id, funding_agency_id)'
                        + ' VALUES (?, ?);';
    places.push(contractID, contract.funding_agency_id);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return addContractManagementEntity(options);
        },
        options);
};
var addContractManagementEntity = function (options) {
    let { req, res, next, contractID } = options;
    let data = req.body.data;
    let profSituation = data.professional_situation;
    let contract = profSituation.contract;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO contracts_management_entities'
                        + ' (contract_id, management_entity_id)'
                        + ' VALUES (?, ?);';
    places.push(contractID, contract.management_entity_id);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            // in principle it should only have fellowship related to the job
            // so it ends here
            if (data.add_fct_mctes) {
                // send email to managers with the data necessary
                // for addition to FCT/MCTES team
                return addFCTMCTESstatus(options);
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

var addFCTMCTESstatus = function(options) {
    let { req, res, next, personID } = options;
    let data = req.body.data;
    let unitID;
    if (data.current_positions.length > 0) {
        if (data.current_positions[0].groups.length > 0) {
            if (data.current_positions[0].groups[0].units.length > 0) {
                unitID = data.current_positions[0].groups[0].units[0].id;
            }
        }
    }
    if (data.tech_current_positions.length > 0) {
        unitID = data.tech_current_positions[0].unit_id;
    }
    if (data.scm_current_positions.length > 0) {
        unitID = data.scm_current_positions[0].unit_id;
    }
    if (data.adm_current_positions.length > 0) {
        unitID = data.adm_current_positions[0].unit_id;
    }
    var querySQL = '';
    var places = [];
    querySQL = 'INSERT INTO status_fct'
        + ' (person_id, unit_id, must_be_added)'
        + ' VALUES (?, ?, ?);';
    places.push(
        personID,
        unitID,
        1
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return getRecipientsGroups(options, 10, false)
        },
        options)



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
    let { req, res, next } = options;
    options.recipientGroup = recipientEmails[0].id;
    let recipients = '';
    for (let el in recipientEmails) {
        recipients = recipients + recipientEmails[el].email + ', ';
    }

    let data = req.body.data;
    let unitName = ''
    let dedication, startDate;
    if (data.current_positions.length > 0) {
        if (data.current_positions[0].groups.length > 0) {
            if (data.current_positions[0].groups[0].units.length > 0) {
                unitName = data.current_positions[0].groups[0].units[0].short_name;
            }
        }
        dedication = data.current_positions[0].dedication;
        startDate = data.current_positions[0].valid_from;
    }
    if (data.tech_current_positions.length > 0) {
        if (data.tech_current_positions[0].unit_id === 1) {
            unitName = 'UCIBIO';
        } else if (data.tech_current_positions[0].unit_id === 2) {
            unitName = 'LAQV';
        }
        dedication = data.tech_current_positions[0].dedication;
        startDate = data.tech_current_positions[0].valid_from;
    }
    if (data.scm_current_positions.length > 0) {
        if (data.scm_current_positions[0].unit_id === 1) {
            unitName = 'UCIBIO';
        } else if (data.scm_current_positions[0].unit_id === 2) {
            unitName = 'LAQV';
        }
        dedication = data.scm_current_positions[0].dedication;
        startDate = data.scm_current_positions[0].valid_from;
    }
    if (data.adm_current_positions.length > 0) {
        if (data.adm_current_positions[0].unit_id === 1) {
            unitName = 'UCIBIO';
        } else if (data.adm_current_positions[0].unit_id === 2) {
            unitName = 'LAQV';
        }
        dedication = data.adm_current_positions[0].dedication;
        startDate = data.adm_current_positions[0].valid_from;
    }
    let mailOptions;
    let subjectText = unitName + ' - Addition to FCT/MCTES team data: ' + data.name;
    /*
    *tipo: inv, bolseiro, contrato ou outro,
    *tipo de bolsa, se aplicável,
    */
    let emailBody = 'Hi,\n\n'
        + 'A new person must be added to the ' + unitName + ' team reported to FCT/MCTES:\n\n'
        + 'CIÊNCIA ID: ' + data.ciencia_id + '\n'
        + 'Name: ' + data.name + '\n'
        + 'Email: ' + data.emails.email + '\n'
        //+ 'Contract:' + data.name + '\n'
        //+ 'Fellowship type:' + data.name + '\n'
        + 'Research Unit: ' + unitName + '\n'
        + 'Degree: ' + (data.degree ? data.degree.name_en : '') + '\n'
        + 'Dedication: ' + dedication + '\n'
        + 'Start Date: ' + startDate + '\n'
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

module.exports.addMember = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { addUser(options) },
        { req, res, next }
    );
}