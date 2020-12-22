const sql = require('../../utilities/sql');
const responses = require('../../utilities/responses');
const permissions = require('../../utilities/permissions');

var actionGetMembersList = function (options) {
    let { req, res, next } = options;
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
    options.moreDetails = false;
    if (req.query.details !== undefined) {
        if (req.query.details === '1') {
            options.moreDetails = true;
        }
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name'
        + ' FROM people'
        + ' LEFT JOIN people_labs ON people_labs.person_id = people.id'
        + ' LEFT JOIN technicians ON technicians.person_id = people.id'
        + ' LEFT JOIN technicians_units ON technicians_units.technician_id = technicians.id'
        + ' LEFT JOIN science_managers ON science_managers.person_id = people.id'
        + ' LEFT JOIN science_managers_units ON science_managers_units.science_manager_id = science_managers.id'
        + ' LEFT JOIN people_administrative_offices ON people_administrative_offices.person_id = people.id'
        + ' LEFT JOIN people_administrative_units ON people_administrative_units.administrative_id = people_administrative_offices.id'
        + ' LEFT JOIN people_roles ON people_roles.person_id = people.id'
        + ' WHERE people.status = 1'
        + ' AND people.name LIKE ?'
        + ' AND ((people_labs.lab_id IS NULL'
        +       ' AND technicians.technician_office_id IS NULL'
        +       ' AND science_managers.science_manager_office_id IS NULL'
        +       ' AND people_administrative_offices.administrative_office_id IS NULL)'
        +       ' OR (technicians.id IS NOT NULL AND technicians_units.unit_id IS NULL)'
        +       ' OR (science_managers.id IS NOT NULL AND science_managers_units.unit_id IS NULL)'
        +       ' OR (people_administrative_offices.id IS NOT NULL AND people_administrative_units.unit_id IS NULL)'
        +       ' OR people_roles.role_id IS NULL)'
        + ' ORDER BY `name` ' + sortOrder;
    places.push(q);
    if (!options.moreDetails) {
        querySQL = querySQL + ' LIMIT ?, ?';
        places.push(offset, limit);
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                if (!options.moreDetails) {
                    actionCountTotal(resQuery, options);
                } else {
                    actionGetResearcherDetails(resQuery, options, 0);
                }
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
    options.moreDetails = false;
    if (req.query.details !== undefined) {
        if (req.query.details === '1') {
            options.moreDetails = true;
        }
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT COUNT(*) AS total_number'
        + ' FROM ('
        + 'SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name'
        + ' FROM people'
        + ' LEFT JOIN people_labs ON people_labs.person_id = people.id'
        + ' LEFT JOIN technicians ON technicians.person_id = people.id'
        + ' LEFT JOIN technicians_units ON technicians_units.technician_id = technicians.id'
        + ' LEFT JOIN science_managers ON science_managers.person_id = people.id'
        + ' LEFT JOIN science_managers_units ON science_managers_units.science_manager_id = science_managers.id'
        + ' LEFT JOIN people_administrative_offices ON people_administrative_offices.person_id = people.id'
        + ' LEFT JOIN people_administrative_units ON people_administrative_units.administrative_id = people_administrative_offices.id'
        + ' LEFT JOIN people_roles ON people_roles.person_id = people.id'
        + ' WHERE people.status = 1'
        + ' AND people.name LIKE ?'
        + ' AND ((people_labs.lab_id IS NULL'
        +       ' AND technicians.technician_office_id IS NULL'
        +       ' AND science_managers.science_manager_office_id IS NULL'
        +       ' AND people_administrative_offices.administrative_office_id IS NULL)'
        +       ' OR (technicians.id IS NOT NULL AND technicians_units.unit_id IS NULL)'
        +       ' OR (science_managers.id IS NOT NULL AND science_managers_units.unit_id IS NULL)'
        +       ' OR (people_administrative_offices.id IS NOT NULL AND people_administrative_units.unit_id IS NULL)'
        +       ' OR people_roles.role_id IS NULL)'
        + ') AS unit_people'
        ;
    places.push(q);
    if (!options.moreDetails) {
        querySQL = querySQL + ' LIMIT ?, ?';
        places.push(offset, limit);
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.totalSearch = resQuery[0].total_number;
            } else {
                options.totalSearch = -1; // for errors
            }
            actionGetResearcherDetails(people, options, 0);
        },
        options);
};
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
                return actionGetLabsGroups(resQuery, people, options, i, 0)
            } else {
                return actionGetMemberFacilities(people, options, i);
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
            } else if (j + 1 < positions.length) {
                actionGetLabsGroups(positions, people, options, i, j + 1);
            } else {
                // get emails, degrees, jobs, etc
                actionGetMemberFacilities(people, options, i);
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
            } else {
                // get emails, degrees, jobs, etc
                actionGetMemberFacilities(people, options, i);
            }
        },
        options);
};
var actionGetMemberFacilities = function (people, options, i) {
    let { req, res, next } = options;
    let person = people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT technicians.*,'
        + ' technician_offices.name_en AS technician_office_name_en,'
        + ' technician_offices.started AS technician_office_started, technician_offices.finished AS technician_office_finished,'
        + ' technician_positions.name_en AS technician_position_name_en, technician_positions.name_pt AS technician_position_name_pt'
        + ' FROM technicians'
        + ' JOIN technician_offices ON technician_offices.id = technicians.technician_office_id'
        + ' LEFT JOIN technician_positions ON technician_positions.id = technicians.technician_position_id'
        + ' WHERE technicians.person_id = ?;';
    places.push(person.person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].technician_data = resQuery;
            return actionGetMemberScienceManager(people, options, i);
        },
        options);
}
var actionGetMemberScienceManager = function (people, options, i) {
    let { req, res, next } = options;
    let person = people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT science_managers.*,'
        + ' science_manager_offices.name_en AS science_manager_office_name_en,'
        + ' science_manager_offices.started AS science_manager_office_started, science_manager_offices.finished AS science_manager_office_finished,'
        + ' science_manager_positions.name_en AS science_manager_position_name_en, science_manager_positions.name_pt AS science_manager_position_name_pt'
        + ' FROM science_managers'
        + ' JOIN science_manager_offices ON science_manager_offices.id = science_managers.science_manager_office_id'
        + ' LEFT JOIN science_manager_positions ON science_manager_positions.id = science_managers.science_manager_position_id'
        + ' WHERE science_managers.person_id = ?;';
    places.push(person.person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].science_manager_data = resQuery;
            return actionGetMemberAdministative(people, options, i);
        },
        options);
}
var actionGetMemberAdministative = function (people, options, i) {
    let { req, res, next } = options;
    let person = people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_administrative_offices.*,'
        + ' administrative_offices.name_en AS administrative_office_name_en,'
        + ' administrative_offices.started AS administrative_office_started, administrative_offices.finished AS administrative_office_finished,'
        + ' administrative_positions.name_en AS administrative_position_name_en, administrative_positions.name_pt AS administrative_position_name_pt'
        + ' FROM people_administrative_offices'
        + ' JOIN administrative_offices ON administrative_offices.id = people_administrative_offices.administrative_office_id'
        + ' LEFT JOIN administrative_positions ON administrative_positions.id = people_administrative_offices.administrative_position_id'
        + ' WHERE people_administrative_offices.person_id = ?;';
    places.push(person.person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].administrative_data = resQuery;
            if (options.moreDetails) {
                return actionGetDegrees(people, options, i);
            } else {
                if (i + 1 < people.length) {
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
            }
        },
        options);
}
var actionGetDegrees = function (people, options, i) {
    let { req, res, next } = options;
    let person = people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT degrees_people.*, degrees.name_en'
                        + ' FROM degrees_people'
                        + ' JOIN degrees ON degrees.id = degrees_people.degree_id'
                        + ' WHERE degrees_people.person_id = ?;';
    places.push(person.person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].degrees = resQuery;
            return actionGetDepartments(people, options, i)
        },
        options);
};
var actionGetDepartments = function (people, options, i) {
    let { req, res, next } = options;
    let person = people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_departments.id AS people_departments_id,'
                        + ' people_departments.department_id AS department_id, departments.name_en AS department,'
                        + ' people_departments.valid_from AS department_start, people_departments.valid_until AS department_end,'
                        + ' schools.shortname_en AS school_shortname_en, universities.shortname_en AS university_shortname_en'
                        + ' FROM people_departments'
                        + ' LEFT JOIN departments ON people_departments.department_id = departments.id'
                        + ' LEFT JOIN schools ON schools.id = departments.school_id'
                        + ' LEFT JOIN universities ON universities.id = schools.university_id'
                        + ' WHERE people_departments.person_id = ?'
    places.push(person.person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].departments = resQuery;
            return actionGetJobs(people, options, i)
        },
        options);
};
var actionGetJobs = function (people, options, i) {
    let { req, res, next } = options;
    let person = people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT jobs.*, categories_situations.category_id, categories_situations.situation_id,'
                        + ' categories.name_en AS category_name_en,'
                        + ' situations.name_en AS situation_name_en,'
                        + ' situations.requires_unit_contract, situations.requires_fellowship'
                        + ' FROM jobs'
                        + ' LEFT JOIN categories_situations ON categories_situations.id = jobs.category_situation_id'
                        + ' LEFT JOIN categories ON categories.id = categories_situations.category_id'
                        + ' LEFT JOIN situations ON situations.id = categories_situations.situation_id'
                        + ' WHERE jobs.person_id = ?;';
    places.push(person.person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].jobs = resQuery;
            if (resQuery.length > 0) {
                return getJobsFellowships(people, options, i, 0);
            } else {
                return actionGetWorkEmails(people, options, i);
            }
        },
        options);
};
var getJobsFellowships = function (people, options, i, j) {
    let { req, res, next } = options;
    let person = people[i];
    let jobs = person.jobs;
    if (jobs.length > 0) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'SELECT jobs_fellowships.fellowship_id,'
                            + ' fellowships.fellowship_type_id, fellowship_types.name AS fellowship_name, fellowship_types.acronym AS fellowship_acronym,'
                            + ' fellowships.reference,'
                            + ' fellowships.start, fellowships.end, fellowships.maximum_extension,'
                            + ' fellowships_funding_agencies.id AS fellowships_funding_agencies_id, fellowships_funding_agencies.funding_agency_id AS funding_agency_id,'
                            + ' funding_agencies.official_name AS funding_agency_official_name, funding_agencies.short_name AS funding_agency_short_name,'
                            + ' fellowships_management_entities.id AS fellowships_management_entities_id, fellowships_management_entities.management_entity_id AS management_entity_id,'
                            + ' management_entities.official_name AS management_entity_official_name, management_entities.short_name AS management_entity_short_name'
                            + ' FROM jobs_fellowships'
                            + ' JOIN fellowships ON fellowships.id = jobs_fellowships.fellowship_id'
                            + ' LEFT JOIN fellowship_types ON fellowship_types.id = fellowships.fellowship_type_id'
                            + ' LEFT JOIN fellowships_management_entities ON fellowships.id = fellowships_management_entities.fellowship_id'
                            + ' LEFT JOIN management_entities ON fellowships_management_entities.management_entity_id = management_entities.id'
                            + ' LEFT JOIN fellowships_funding_agencies ON fellowships.id = fellowships_funding_agencies.fellowship_id'
                            + ' LEFT JOIN funding_agencies ON fellowships_funding_agencies.funding_agency_id = funding_agencies.id'
                            + ' WHERE jobs_fellowships.job_id = ?;';
        places.push(jobs[j].id)
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                people[i].jobs[j].fellowships = resQuery;
                if (j + 1 < jobs.length) {
                    return getJobsFellowships(people, options, i, j + 1);
                } else {
                    return getJobsContracts(people, options, i, 0);
                }
            },
            options);
    } else {
        return actionGetWorkEmails(people, options, i);
    }
};
var getJobsContracts = function (people, options, i, j) {
    let { req, res, next } = options;
    let person = people[i];
    let jobs = person.jobs;
    if (jobs.length > 0) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'SELECT jobs_contracts.contract_id,'
                            + ' contracts.reference,'
                            + ' contracts.start, contracts.end, contracts.maximum_extension'
                            + ' FROM jobs_contracts'
                            + ' JOIN contracts ON contracts.id = jobs_contracts.contract_id'
                            + ' WHERE jobs_contracts.job_id = ?;';
        places.push(jobs[j].id)
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                people[i].jobs[j].contracts = resQuery;
                if (j + 1 < jobs.length) {
                    return getJobsContracts(people, options, i, j + 1);
                } else {
                    return actionGetWorkEmails(people, options, i);
                }
            },
            options);
    } else {
        return actionGetWorkEmails(people, options, i);
    }

};
var actionGetWorkEmails = function (people, options, i) {
    let { req, res, next } = options;
    let person = people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM emails WHERE person_id = ?';
    places.push(person.person_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].email = resQuery;
            return actionGetPersonalEmails(people, options, i)
        },
        options);
}
var actionGetPersonalEmails = function (people, options, i) {
    let { req, res, next } = options;
    let person = people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM personal_emails WHERE person_id = ?';
    places.push(person.person_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].personal_email = resQuery;
            return actionGetPole(people, options, i)
        },
        options);
}
var actionGetPole = function (people, options, i) {
    let { req, res, next } = options;
    let person = people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_institution_city.*, institution_city.city'
                        + ' FROM people_institution_city'
                        + ' LEFT JOIN institution_city ON institution_city.id = people_institution_city.city_id'
                        + ' WHERE people_institution_city.person_id = ?';
    places.push(person.person_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].pole = resQuery;
            return actionGetCostCenter(people, options, i)
        },
        options);
}
var actionGetCostCenter = function (people, options, i) {
    let { req, res, next } = options;
    let person = people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_cost_centers.*, cost_centers.name, cost_centers.short_name'
                        + ' FROM people_cost_centers'
                        + ' JOIN cost_centers ON cost_centers.id = people_cost_centers.cost_center_id'
                        + ' WHERE people_cost_centers.person_id = ?';
    places.push(person.person_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].cost_center = resQuery;
            if (i + 1 < people.length) {
                actionGetResearcherDetails(people, options, i + 1);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": people.length,
                        "result": people
                    }
                });
                return;
            }
        },
        options);
}

module.exports.getMembersList = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetMembersList(options) },
        { req, res, next }
    );
};