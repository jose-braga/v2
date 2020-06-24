const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const time = require('../utilities/time');
const jwtUtils = require('../../config/jwt_utilities');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;

var actionGetPersonLabs = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_labs.lab_position_id, lab_positions.name_en AS  lab_position_name_en,'
                    + ' people_labs.dedication, people_labs.valid_from, people_labs.valid_until,'
                    + ' labs.*'
                    + ' FROM people_labs'
                    + ' JOIN labs ON labs.id = people_labs.lab_id'
                    + ' LEFT JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
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

var actionUpdateUser = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let person = req.body.data;
    let hashedPassword = jwtUtils.hashPassword(person.password)
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE users'
                    + ' SET password = ? '
                    + ' WHERE id = ?;';
    places.push(hashedPassword, person.userID);
    sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return actionUpdatePersonInitial(options);
        },
        options);
};
var actionUpdatePersonInitial = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let person = req.body.data;
    if (person.birth_date === '') {
        person.birth_date = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE people'
                    + ' SET `name` = ?, '
                    + ' colloquial_name = ?,'
                    + ' gender = ?,'
                    + ' birth_date = ?,'
                    + ' visible_public = ?'
                    + ' WHERE id = ?;';
    places.push(
        person.name,
        person.colloquial_name,
        person.gender,
        person.birth_date,
        person.visible_public,
        personID);
    sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return actionUpdatePersonInitialHistory(options);
        },
        options);
};
var actionUpdatePersonInitialHistory = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let person = req.body.data;
    if (person.birth_date === '') {
        person.birth_date = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO people_history'
            + ' (person_id, user_id, name, colloquial_name, gender, birth_date, visible_public, updated, operation, changed_by)'
            + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    places.push(
        personID,
        person.userID,
        person.name,
        person.colloquial_name,
        person.gender,
        person.birth_date,
        person.visible_public,
        options.now,
        'U',
        person.userID
    );
    sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            options.i = 0;
            return actionCreateNationalities(options);
        },
        options);
};
var actionCreateNationalities = function (options) {
    let { req, res, next, i } = options;
    let personID = req.params.personID;
    let person = req.body.data;
    if (person.countries !== undefined && person.countries.length > 0) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'INSERT INTO people_countries'
                        + ' (person_id, country_id)'
                        + ' VALUES (?,?);';
        places.push(
            personID,
            person.countries[i].id
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                if (i + 1 < person.countries.length) {
                    options.i = i + 1;
                    return actionCreateNationalities(options);
                } else {
                    return actionCreateResearcherInfo(options);
                }
            },
            options);
    } else {
        return actionCreateResearcherInfo(options);
    }
};
var actionCreateResearcherInfo = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let person = req.body.data;
    if (person.researcherIDs !== undefined) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'INSERT INTO researchers_info'
                        + ' (person_id, researcherID, ORCID, scopusID, institutional_repository_id,'
                        + ' pure_id, ciencia_id, association_key)'
                        + ' VALUES (?,?,?,?,?,?,?,?);';
        places.push(
            personID,
            person.researcherIDs.researcherID,
            person.researcherIDs.ORCID,
            person.researcherIDs.scopusID,
            person.researcherIDs.institutional_repository_id,
            person.researcherIDs.pure_id,
            person.researcherIDs.ciencia_id,
            person.researcherIDs.association_key
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                return actionCreateInstitutionalContactsEmails(options);
            },
            options);
    } else {
        return actionCreateInstitutionalContactsEmails(options);
    }
};
var actionCreateInstitutionalContactsEmails = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let person = req.body.data;
    if (person.emails !== undefined) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'INSERT INTO emails'
                        + ' (person_id, email)'
                        + ' VALUES (?,?);';
        places.push(
            personID,
            person.emails.email
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                return actionCreateInstitutionalContactsPhones(options);
            },
            options);
    } else {
        return actionCreateInstitutionalContactsPhones(options);
    }
};
var actionCreateInstitutionalContactsPhones = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let person = req.body.data;
    if (person.phones !== undefined) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'INSERT INTO phones'
                        + ' (person_id, phone, extension)'
                        + ' VALUES (?,?,?);';
        places.push(
            personID,
            person.phones.phone,
            person.phones.extension
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                options.i = 0;
                return actionCreateResponsibles(options);
            },
            options);
    } else {
        options.i = 0;
        return actionCreateResponsibles(options);
    }
};
var actionCreateResponsibles = function (options) {
    let { req, res, next, i } = options;
    let personID = req.params.personID;
    let person = req.body.data;
    if (person.responsibles !== undefined && person.responsibles.length > 0) {
        if (person.responsibles[i].valid_from === '') person.responsibles[i].valid_from = null;
        if (person.responsibles[i].valid_until === '') person.responsibles[i].valid_until = null;
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'INSERT INTO people_responsibles'
                        + ' (person_id, responsible_id, valid_from, valid_until)'
                        + ' VALUES (?,?,?,?);';
        places.push(
            personID,
            person.responsibles[i].responsible_id,
            person.responsibles[i].valid_from,
            person.responsibles[i].valid_until
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                if (i + 1 < person.responsibles.length) {
                    options.i = i + 1;
                    return actionCreateResponsibles(options);
                } else {
                    options.i = 0;
                    return actionCreateAcademicAffiliations(options);
                }
            },
            options);
    } else {
        options.i = 0;
        return actionCreateAcademicAffiliations(options);
    }
};
var actionCreateAcademicAffiliations = function (options) {
    let { req, res, next, i } = options;
    let personID = req.params.personID;
    let person = req.body.data;
    if (person.academicAffiliations !== undefined && person.academicAffiliations.length > 0) {
        if (person.academicAffiliations[i].valid_from === '') person.academicAffiliations[i].valid_from = null;
        if (person.academicAffiliations[i].valid_until === '') person.academicAffiliations[i].valid_until = null;
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'INSERT INTO people_departments'
                        + ' (person_id, department_id, valid_from, valid_until)'
                        + ' VALUES (?,?,?,?);';
        places.push(
            personID,
            person.academicAffiliations[i].department_id,
            person.academicAffiliations[i].valid_from,
            person.academicAffiliations[i].valid_until
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                if (i + 1 < person.responsibles.length) {
                    options.i = i + 1;
                    return actionCreateAcademicAffiliations(options);
                } else {
                    return actionCreatePersonalContactsAddress(options);
                }
            },
            options);
    } else {
        return actionCreatePersonalContactsAddress(options);
    }
};
var actionCreatePersonalContactsAddress = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let person = req.body.data;
    if (person.personal_addresses !== undefined) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'INSERT INTO personal_addresses'
                        + ' (person_id, address, postal_code, city)'
                        + ' VALUES (?,?,?,?);';
        places.push(
            personID,
            person.personal_addresses.address,
            person.personal_addresses.postal_code,
            person.personal_addresses.city
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                return actionCreatePersonalContactsEmail(options);
            },
            options);
    } else {
        return actionCreatePersonalContactsEmail(options);
    }
};
var actionCreatePersonalContactsEmail = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let person = req.body.data;
    if (person.personal_emails !== undefined) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'INSERT INTO personal_emails'
                        + ' (person_id, email)'
                        + ' VALUES (?,?);';
        places.push(
            personID,
            person.personal_emails.email
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                return actionCreatePersonalContactsPhone(options);
            },
            options);
    } else {
        return actionCreatePersonalContactsPhone(options);
    }
};
var actionCreatePersonalContactsPhone = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let person = req.body.data;
    if (person.personal_phones !== undefined) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'INSERT INTO personal_phones'
                        + ' (person_id, phone)'
                        + ' VALUES (?,?);';
        places.push(
            personID,
            person.personal_phones.phone
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                options.i = 0;
                return actionCreatePersonalIdentifications(options);
            },
            options);
    } else {
        options.i = 0;
        return actionCreatePersonalIdentifications(options);
    }
};
var actionCreatePersonalIdentifications = function (options) {
    let { req, res, next, i } = options;
    let personID = req.params.personID;
    let person = req.body.data;
    if (person.identifications !== undefined && person.identifications.length > 0) {
        if (person.identifications[i].valid_until === '') person.identifications[i].valid_until = null;
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'INSERT INTO identifications'
                        + ' (person_id, card_type_id, card_number, valid_until)'
                        + ' VALUES (?,?,?,?);';
        places.push(
            personID,
            person.identifications[i].card_type_id,
            person.identifications[i].card_number,
            person.identifications[i].valid_until
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                if (i + 1 < person.identifications.length) {
                    options.i = i + 1;
                    return actionCreatePersonalIdentifications(options);
                } else {
                    options.i = 0;
                    return getJobCategorySituationID(options);
                }
            },
            options);
    } else {
        options.i = 0;
        return getJobCategorySituationID(options);
    }
};
var getJobCategorySituationID = function (options) {
    let { req, res, next, i } = options;
    let person = req.body.data;
    if (person.situations !== undefined && person.situations.length > 0) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'SELECT * FROM categories_situations'
                            + ' WHERE category_id = ? AND situation_id = ?;';
        places.push(person.situations[i].category_id, person.situations[i].situation_id)
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (resQuery.length === 1) {
                    options.this_category_situation_id = resQuery[0].id;
                    return actionCreateJob(options);
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
    } else {
        return actionUpdatePersonFinal(options);
    }
};
var actionCreateJob = function (options) {
    let { req, res, next, i } = options;
    let personID = req.params.personID;
    let person = req.body.data;
    if (person.situations[i].valid_from === '') person.situations[i].valid_from = null;
    if (person.situations[i].valid_until === '') person.situations[i].valid_until = null;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO jobs'
                    + ' (person_id, category_situation_id, organization, dedication, valid_from, valid_until)'
                    + ' VALUES (?,?,?,?,?,?);';
    places.push(
        personID,
        options.this_category_situation_id,
        person.situations[i].organization,
        person.situations[i].dedication,
        person.situations[i].valid_from,
        person.situations[i].valid_until
    );
    sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.this_job_id = resQuery.insertId;
            if (person.situations[i].fellowships !== undefined
                && person.situations[i].fellowships.length > 0) {
                options.j = 0;
                return actionCreateFellowship(options);
            } else if (person.situations[i].contracts !== undefined
                && person.situations[i].contracts.length > 0) {
                options.j = 0;
                return actionCreateContracts(options);
            } else if (i + 1 < person.situations.length) {
                options.i = i + 1;
                return getJobCategorySituationID(options);
            } else {
                return actionUpdatePersonFinal(options);
            }
        },
        options);
};
var actionCreateFellowship = function (options) {
    let { req, res, next, i, j } = options;
    let person = req.body.data;
    if (person.situations[i].fellowships[j].start === '') person.situations[i].fellowships[j].start = null;
    if (person.situations[i].fellowships[j].end === '') person.situations[i].fellowships[j].end = null;
    if (person.situations[i].fellowships[j].maximum_extension === '') person.situations[i].fellowships[j].maximum_extension = null;

    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO fellowships'
                    + ' (fellowship_type_id, reference, start, end, maximum_extension)'
                    + ' VALUES (?,?,?,?,?);';
    places.push(
        person.situations[i].fellowships[j].fellowship_type_id,
        person.situations[i].fellowships[j].reference,
        person.situations[i].fellowships[j].start,
        person.situations[i].fellowships[j].end,
        person.situations[i].fellowships[j].maximum_extension
    );
    sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.this_fellowship_id = resQuery.insertId;
            if ( person.situations[i].fellowships[j].funding_agencies !== undefined
                && person.situations[i].fellowships[j].funding_agencies.length > 0) {
                options.k = 0;
                return actionCreateFellowshipFundingAgencyRelationship(options);
            } else if ( person.situations[i].fellowships[j].management_entities !== undefined
                && person.situations[i].fellowships[j].management_entities.length > 0) {
                options.k = 0;
                return actionCreateFellowshipManagementEntityRelationship(options);
            } else {
                actionCreateJobFellowshipRelationship(options);
            }
        },
        options);
};
var actionCreateFellowshipFundingAgencyRelationship = function (options) {
    let { req, res, next, i, j, k } = options;
    let person = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO fellowships_funding_agencies'
                    + ' (fellowship_id, funding_agency_id)'
                    + ' VALUES (?,?);';
    places.push(
        options.this_fellowship_id,
        person.situations[i].fellowships[j].funding_agencies[k]
    );
    sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (k + 1 < person.situations[i].fellowships[j].funding_agencies.length) {
                options.k = k + 1;
                return actionCreateFellowshipFundingAgencyRelationship(options);
            } else if ( person.situations[i].fellowships[j].management_entities !== undefined
                && person.situations[i].fellowships[j].management_entities.length > 0) {
                options.k = 0;
                return actionCreateFellowshipManagementEntityRelationship(options);
            } else {
                actionCreateJobFellowshipRelationship(options);
            }
        },
        options);
};
var actionCreateFellowshipManagementEntityRelationship = function (options) {
    let { req, res, next, i, j, k } = options;
    let person = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO fellowships_management_entities'
                    + ' (fellowship_id, management_entity_id)'
                    + ' VALUES (?,?);';
    places.push(
        options.this_fellowship_id,
        person.situations[i].fellowships[j].management_entities[k]
    );
    sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (k + 1 < person.situations[i].fellowships[j].management_entities.length) {
                options.k = k + 1;
                return actionCreateFellowshipManagementEntityRelationship(options);
            } else {
                actionCreateJobFellowshipRelationship(options);
            }
        },
        options);
};
var actionCreateJobFellowshipRelationship = function (options) {
    let { req, res, next, i, j } = options;
    let person = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO jobs_fellowships'
                    + ' (job_id, fellowship_id)'
                    + ' VALUES (?,?);';
    places.push(
        options.this_job_id,
        options.this_fellowship_id
    );
    sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (j + 1 < person.situations[i].fellowships.length) {
                options.j = j + 1;
                return actionCreateFellowship(options);
            } else if (person.situations[i].contracts !== undefined
                && person.situations[i].contracts.length > 0) {
                options.j = 0;
                return actionCreateContract(options);
            } else if (i + 1 < person.situations.length) {
                options.i = i + 1;
                return getJobCategorySituationID(options);
            } else {
                return actionUpdatePersonFinal(options);
            }
        },
        options);
};
var actionCreateContract = function (options) {
    let { req, res, next, i, j } = options;
    let person = req.body.data;
    if (person.situations[i].contracts[j].start === '') person.situations[i].contracts[j].start = null;
    if (person.situations[i].contracts[j].end === '') person.situations[i].contracts[j].end = null;
    if (person.situations[i].contracts[j].maximum_extension === '') person.situations[i].contracts[j].maximum_extension = null;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO contracts'
                    + ' (reference, start, end, maximum_extension)'
                    + ' VALUES (?,?,?,?);';
    places.push(
        person.situations[i].contracts[j].reference,
        person.situations[i].contracts[j].start,
        person.situations[i].contracts[j].end,
        person.situations[i].contracts[j].maximum_extension
    );
    sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.this_contract_id = resQuery.insertId;
            if ( person.situations[i].contracts[j].funding_agencies !== undefined
                && person.situations[i].contracts[j].funding_agencies.length > 0) {
                options.k = 0;
                return actionCreateContractFundingAgencyRelationship(options);
            } else if ( person.situations[i].contracts[j].management_entities !== undefined
                && person.situations[i].contracts[j].management_entities.length > 0) {
                options.k = 0;
                return actionCreateContractManagementEntityRelationship(options);
            } else {
                actionCreateJobContractRelationship(options);
            }
        },
        options);
};
var actionCreateContractFundingAgencyRelationship = function (options) {
    let { req, res, next, i, j, k } = options;
    let person = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO contracts_funding_agencies'
                    + ' (contract_id, funding_agency_id)'
                    + ' VALUES (?,?);';
    places.push(
        options.this_contract_id,
        person.situations[i].contracts[j].funding_agencies[k]
    );
    sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (k + 1 < person.situations[i].contracts[j].funding_agencies.length) {
                options.k = k + 1;
                return actionCreateContractFundingAgencyRelationship(options);
            } else if ( person.situations[i].contracts[j].management_entities !== undefined
                && person.situations[i].contracts[j].management_entities.length > 0) {
                options.k = 0;
                return actionCreateContractManagementEntityRelationship(options);
            } else {
                actionCreateJobContractRelationship(options);
            }
        },
        options);
};
var actionCreateContractManagementEntityRelationship = function (options) {
    let { req, res, next, i, j, k } = options;
    let person = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO contracts_management_entities'
                    + ' (contract_id, management_entity_id)'
                    + ' VALUES (?,?);';
    places.push(
        options.this_contract_id,
        person.situations[i].contracts[j].management_entities[k]
    );
    sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (k + 1 < person.situations[i].contracts[j].management_entities.length) {
                options.k = k + 1;
                return actionCreateContractManagementEntityRelationship(options);
            } else {
                actionCreateJobContractRelationship(options);
            }
        },
        options);
};
var actionCreateJobContractRelationship = function (options) {
    let { req, res, next, i, j } = options;
    let person = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO jobs_contracts'
                    + ' (job_id, contract_id)'
                    + ' VALUES (?,?);';
    places.push(
        options.this_job_id,
        options.this_contract_id
    );
    sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (j + 1 < person.situations[i].contracts.length) {
                options.j = j + 1;
                return actionCreateContract(options);
            } else if (i + 1 < person.situations.length) {
                options.i = i + 1;
                return getJobCategorySituationID(options);
            } else {
                return actionUpdatePersonFinal(options);
            }
        },
        options);
};
var actionUpdatePersonFinal = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE people'
                    + ' SET `status` = ? '
                    + ' WHERE id = ?;';
    places.push(
        3,
        personID);
    sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return actionUpdatePersonFinalHistory(options);
        },
        options);
};
var actionUpdatePersonFinalHistory = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let person = req.body.data;
    if (person.birth_date === '') person.birth_date = null;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO people_history'
            + ' (person_id, user_id, name, colloquial_name, gender, birth_date, visible_public, status, updated, operation, changed_by)'
            + ' VALUES (?,?,?,?,?,?,?,?,?,?,?);';
    places.push(
        personID,
        person.userID,
        person.name,
        person.colloquial_name,
        person.gender,
        person.birth_date,
        person.visible_public,
        3,
        options.now,
        'U',
        person.userID
    );
    sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return getRecipientsGroupsPreReg(options, 11);
        },
        options);
};
var getRecipientsGroupsPreReg = function (options, email_type_id) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT recipient_groups.*, emails.person_id, emails.email'
        + ' FROM recipient_groups'
        + ' LEFT JOIN people_recipient_groups ON people_recipient_groups.recipient_group_id = recipient_groups.id'
        + ' LEFT JOIN emails ON emails.person_id = people_recipient_groups.person_id'
        + ' WHERE recipient_groups.city_id IS NULL'
        + ' AND recipient_groups.any_cities = 1'
        + ' AND recipient_groups.email_type_id = ?;';
    places.push(email_type_id);

    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.recipientGroup = resQuery[0].id;
            actionSendUserMessage(options, resQuery)
            .then(() => actionSendManagersMessage(options, resQuery))
            .then(() => writeMessageDB(options))
            .catch((e) => {
                console.log(e);
                return writeMessageDB(options, e);
            }); // even if the email fails it writes the message to the DB
        },
        options);
};
async function actionSendUserMessage(options, recipientEmails) {
    let { req, res, next } = options;
    let person = req.body.data;
    let recipients = '';
    recipients = recipients + person.personal_emails.email;
    let mailOptions;
    let subjectText = 'LAQV/UCIBIO Data Management - Registration Form submitted';
    let emailBody = 'Hi,\n\n'
        + 'Your registration on ' + process.env.PATH_PREFIX  + ' was submitted.\n\n'
        + 'Wait for validation of data by a science manager before you can use the full platform features.\n\n'
        + 'Best regards,\nAdmin';
    let emailBodyHtml = '<p>Hi,</p><br>'
        + '<p>Your registration on ' + process.env.PATH_PREFIX + ' was submitted.</p>'
        + '<p>Wait for validation of data by a science manager before you can use the full platform features.</p><br>'
        + '<p>Best regards,</p>'
        + '<p>Admin</p>';
    if (process.env.NODE_ENV === 'production') {
        mailOptions = {
            from: '"Admin" <admin@laqv-ucibio.info>', // sender address
            to: recipients, // list of receivers (comma-separated)
            subject: subjectText, // Subject line
            text: emailBody,
            html: emailBodyHtml,
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
            html: emailBodyHtml,
        };
        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Message %s sent: %s', info.messageId, info.response);
    }
};
async function actionSendManagersMessage(options, recipientEmails) {
    let { req, res, next } = options;
    let person = req.body.data;
    let recipients = '';
    if (recipientEmails.length === 0) {
        recipients = process.env.EMAIL_DEVELOPER;
    } else {
        for (let ind in recipientEmails) {
            recipients = recipients + recipientEmails[ind].email;
            if (ind + 1 < recipientEmails.length ) { recipients = recipients + ','; }
        }
    }

    let mailOptions;
    let subjectText = 'LAQV/UCIBIO Data Management - User Registration: ' + person.name;
    let emailBody = 'Hi,\n\n'
        + 'Name: ' + person.name  + '\n'
        + 'Email: ' + person.personal_emails.email  + '\n'
        + 'Comments: \n' + person.comments  + '\n\n'
        + 'Best regards,\nAdmin';
    let emailBodyHtml = '<p>Hi,</p><br>'
        + '<p>Name: ' + person.name + '.</p>'
        + '<p>Email: ' + person.personal_emails.email + '.</p>'
        + '<p>Comments:<br>' + person.comments.replace(/(?:\r\n|\r|\n)/g,'<br>') + '.</p><br>'
        + '<p>Best regards,</p>'
        + '<p>Admin</p>';
    options.subjectText = subjectText;
    options.emailBody = emailBody;
    if (process.env.NODE_ENV === 'production') {
        mailOptions = {
            from: '"Admin" <admin@laqv-ucibio.info>', // sender address
            to: recipients, // list of receivers (comma-separated)
            subject: subjectText, // Subject line
            text: emailBody,
            html: emailBodyHtml,
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
            html: emailBodyHtml,
        };
        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Message %s sent: %s', info.messageId, info.response);
    }
};
var writeMessageDB = function (options, error) {
    let { req, res, next, recipientGroup, subjectText, emailBody } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO email_messages'
        + ' (sender_id, recipient_group_id, subject, message_text, date, solved)'
        + ' VALUES (?,?,?,?,?,?);';
    places.push(options.personID, recipientGroup, subjectText, emailBody, options.now, 0);
    sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (error) {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 500,
                    message: { "message": "Error sending email, but database OK!", "error": error.message }
                });
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "message": "Done!",
                    }
                });
            }
        },
        options);
    return;
};
module.exports.preRegister = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            options.now = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
            actionUpdateUser(options);
        },
        { req, res, next }
    );
};