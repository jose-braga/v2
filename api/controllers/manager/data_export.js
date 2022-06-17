const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

// consider adding facilities,etc
var filterPeople = function (options) {
    let { req, res, next } = options;
    let unitID = null;
    let poleID = null;
    let labID = null;
    let departmentID = null;
    let depTeamID = null;
    let dateFrom = null;
    let dateUntil = null;
    let hasDateFilter = false;
    let joinStatements = ''
    let whereStatements = ' WHERE people.status = 1'
    let places = [];
    if (req.query.dateFrom !== undefined) {
        dateFrom = req.query.dateFrom;
        hasDateFilter = true;
    }
    if (req.query.dateUntil !== undefined) {
        dateUntil = req.query.dateUntil;
        hasDateFilter = true;
    }
    if (dateFrom === null && dateUntil !== null) {
        dateFrom = dateUntil;
    } else if (dateFrom !== null && dateUntil === null) {
        dateUntil = dateFrom;
    }
    if (req.query.people !== undefined) {
        let peopleSet = req.query.people;
        let peopleArray = peopleSet.split(',');
        whereStatements = whereStatements + ' AND people.id IN (';
        let addPlaceholder = ''
        for (let indPeople in peopleArray) {
            addPlaceholder = addPlaceholder + '?,'
        }
        addPlaceholder = addPlaceholder.slice(0, -1);
        whereStatements = whereStatements + addPlaceholder + ')';
        places = places.concat(peopleArray);
    }
    if (req.query.unit !== undefined) {
        unitID = parseInt(req.query.unit, 10);
        joinStatements = joinStatements
            + ' JOIN people_labs ON people_labs.person_id = people.id'
            + ' JOIN labs ON labs.id = people_labs.lab_id'
            + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
            + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
            + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
            ;
        whereStatements = whereStatements
            + ' AND groups_units.unit_id = ?'
            ;
        places.push(unitID);
        if (hasDateFilter) {
            whereStatements = whereStatements
                + ' AND ('
                + ' (people_labs.valid_from IS NULL OR people_labs.valid_from <= ?)'
                + ' AND (people_labs.valid_until IS NULL OR people_labs.valid_until >= ?)'
                + ')'
                ;
            places.push(dateFrom, dateUntil);
        }
    }
    if (req.query.pole !== undefined) {
        poleID = parseInt(req.query.pole, 10);
        joinStatements = joinStatements
            + ' JOIN people_institution_city ON people_institution_city.person_id = people.id'
            ;
        whereStatements = whereStatements
            + ' AND people_institution_city.city_id = ?'
            ;
        places.push(poleID);
        if (hasDateFilter) {
            whereStatements = whereStatements
                + ' AND ('
                + ' (people_institution_city.valid_from IS NULL OR people_institution_city.valid_from <= ?)'
                + ' AND (people_institution_city.valid_until IS NULL OR people_institution_city.valid_until >= ?)'
                + ')'
                ;
            places.push(dateFrom, dateUntil);
        }
    }
    if (req.query.department !== undefined) {
        departmentID = parseInt(req.query.department, 10);
        joinStatements = joinStatements
            + ' JOIN people_departments ON people_departments.person_id = people.id'
            ;
        whereStatements = whereStatements
            + ' AND people_departments.department_id = ?'
            ;
        places.push(departmentID);
        if (hasDateFilter) {
            whereStatements = whereStatements
                + ' AND ('
                + ' (people_departments.valid_from IS NULL OR people_departments.valid_from <= ?)'
                + ' AND (people_departments.valid_until IS NULL OR people_departments.valid_until >= ?)'
                + ')'
                ;
            places.push(dateFrom, dateUntil);
        }
    }
    if (req.query.lab !== undefined) {
        labID = parseInt(req.query.lab, 10);
        joinStatements = joinStatements
            + ' JOIN people_labs ON people_labs.person_id = people.id'
            ;
        whereStatements = whereStatements
            + ' AND people_labs.lab_id = ?'
            ;
        places.push(labID);
        if (hasDateFilter) {
            whereStatements = whereStatements
                + ' AND ('
                + ' (people_labs.valid_from IS NULL OR people_labs.valid_from <= ?)'
                + ' AND (people_labs.valid_until IS NULL OR people_labs.valid_until >= ?)'
                + ')'
                ;
            places.push(dateFrom, dateUntil);
        }
    }
    if (req.query.depTeam !== undefined) {
        depTeamID = parseInt(req.query.depTeam, 10);
        joinStatements = joinStatements
            + ' JOIN people_team_department ON people_team_department.person_id = people.id'
            ;
        whereStatements = whereStatements
            + ' AND people_team_department.team_id = ?'
            ;
        places.push(depTeamID);
        if (hasDateFilter) {
            whereStatements = whereStatements
                + ' AND ('
                + ' (people_team_department.valid_from IS NULL OR people_team_department.valid_from <= ?)'
                + ' AND (people_team_department.valid_until IS NULL OR people_team_department.valid_until >= ?)'
                + ')'
                ;
            places.push(dateFrom, dateUntil);
        }
    }
    var querySQL = '';
    querySQL = querySQL
        + 'SELECT DISTINCT people.*'
        + ' FROM people '
        + joinStatements
        + whereStatements
        + ' ORDER BY id ASC'
        ;
    //console.log(querySQL)
    //console.log(places)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.people = resQuery;
            options.i = 0;
            if (resQuery.length > 0) {
                if (options.exportType === 'people') {
                    return getNationalities(options)
                } else if (options.exportType === 'productivity') {
                    return getPublicationsPerson(options)
                } else if (options.exportType === 'spaces') {
                    return getSpacesPerson(options);
                } else if (options.exportType === 'supervision') {
                    return getSupervisionPerson(options);
                }
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "count": resQuery.length,
                        "result": resQuery
                    }
                });
            }
        },
        options);
};

var getNationalities = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_countries.*, countries.name AS country_name'
        + ' FROM people_countries'
        + ' JOIN countries ON countries.id = people_countries.country_id'
        + ' WHERE person_id = ?'
        +';';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].countries = resQuery;
            return getWorkPhone(options)
        },
        options);
};
var getWorkPhone = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM phones WHERE person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].phone = resQuery;
            return getWorkEmail(options)
        },
        options);
};
var getWorkEmail = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM emails WHERE person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].email = resQuery;
            return getPersonalEmails(options)
        },
        options);
};
var getPersonalEmails = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM personal_emails WHERE person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].personal_email = resQuery;
            return getResearcherIDs(options)
        },
        options);
};
var getResearcherIDs = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM researchers_info WHERE person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].researchers_info = resQuery;
            return getDegrees(options)
        },
        options);
};
var getDegrees = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT degrees_people.*, degrees.name_en'
        + ' FROM degrees_people'
        + ' JOIN degrees ON degrees.id = degrees_people.degree_id'
        + ' WHERE degrees_people.person_id = ?;';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].degrees = resQuery;
            return getJobs(options)
        },
        options);
};
var getJobs = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT jobs.*, categories_situations.category_id, categories_situations.situation_id,'
        + ' categories.name_en AS category_name_en,'
        + ' situations.name_en AS situation_name_en,'
        + ' situations.requires_unit_contract, situations.requires_fellowship'
        + ' FROM jobs'
        + ' LEFT JOIN categories_situations ON categories_situations.id = jobs.category_situation_id'
        + ' LEFT JOIN categories ON categories.id = categories_situations.category_id'
        + ' LEFT JOIN situations ON situations.id = categories_situations.situation_id'
        + ' WHERE jobs.person_id = ?;';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].jobs = resQuery;
            if (resQuery.length > 0) {
                options.j = 0;
                return getJobsFellowships(options);
            } else {
                return getPoles(options)
            }
        },
        options);
};
var getJobsFellowships = function (options) {
    // first, we get the fellowships associated with job j for person i
    // then we get contracts  associated with job j for person i
    let { req, res, next, people, i, j } = options;
    let person = people[i]
    let job = person.jobs[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT jobs_fellowships.fellowship_id,'
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
    places.push(job.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].jobs[j].fellowships = resQuery;
            if (j + 1 < people[i].jobs.length) {
                options.j = j + 1;
                return getJobsFellowships(options);
            } else {
                options.j = 0;
                return getJobsContracts(options);
            }
        },
        options);
};
var getJobsContracts = function (options) {
    let { req, res, next, people, i, j } = options;
    let person = people[i]
    let job = person.jobs[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT jobs_contracts.contract_id,'
        + ' contracts.reference,'
        + ' contracts.start, contracts.end, contracts.maximum_extension'
        + ' FROM jobs_contracts'
        + ' JOIN contracts ON contracts.id = jobs_contracts.contract_id'
        + ' WHERE jobs_contracts.job_id = ?;';
    places.push(job.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].jobs[j].contracts = resQuery;
            if (j + 1 < people[i].jobs.length) {
                options.j = j + 1;
                return getJobsContracts(options);
            } else {
                return getPoles(options);
            }
        },
        options);
};
var getPoles = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_institution_city.*, institution_city.city'
        + ' FROM people_institution_city'
        + ' LEFT JOIN institution_city ON institution_city.id = people_institution_city.city_id'
        + ' WHERE people_institution_city.person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].pole = resQuery;
            return getCostCenters(options)
        },
        options);
};
var getCostCenters = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_cost_centers.*, cost_centers.short_name'
        + ' FROM people_cost_centers'
        + ' JOIN cost_centers ON cost_centers.id = people_cost_centers.cost_center_id'
        + ' WHERE people_cost_centers.person_id = ?;';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].cost_centers = resQuery;
            return getDepartments(options)
        },
        options);
};
var getDepartments = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_departments.id AS people_departments_id,'
        + ' people_departments.department_id AS department_id, departments.name_en AS department,'
        + ' people_departments.valid_from AS department_start, people_departments.valid_until AS department_end,'
        + ' schools.shortname_en AS school_shortname_en, universities.shortname_en AS university_shortname_en'
        + ' FROM people_departments'
        + ' LEFT JOIN departments ON people_departments.department_id = departments.id'
        + ' LEFT JOIN schools ON schools.id = departments.school_id'
        + ' LEFT JOIN universities ON universities.id = schools.university_id'
        + ' WHERE people_departments.person_id = ?'
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].departments = resQuery;
            return getLabs(options)
        },
        options);
};
var getLabs = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
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
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].history = resQuery;
            if (resQuery.length > 0) {
                options.j = 0;
                return getLabsGroups(options)
            } else {
                return getDepartmentTeams(options);
            }

        },
        options);
};
var getLabsGroups = function (options) {
    let { req, res, next, people, i, j } = options;
    let person = people[i]
    let position = person.history[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT `groups`.*, labs_groups.valid_from, labs_groups.valid_until'
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
    places.push(
        position.lab_id,
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
                options.k = 0;
                return getGroupsUnits(options)
            } else if (j + 1 < person.history.length) {
                options.j = j + 1;
                return getLabsGroups(options);
            } else {
                return getDepartmentTeams(options);
            }
        },
        options);
};
var getGroupsUnits = function (options) {
    let { req, res, next, people, i, j, k } = options;
    let person = people[i];
    let position = person.history[j];
    let group = person.history[j].groups[k];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT units.*, groups_units.valid_from, groups_units.valid_until'
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
    places.push(
        group.id,
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
            if (k + 1 > person.history[j].groups.length) {
                options.k = k + 1;
                return getGroupsUnits(options)
            } else if (j + 1 < person.history.length) {
                options.j = j + 1;
                return getLabsGroups(options);
            } else {
                return getDepartmentTeams(options);
            }
        },
        options);
};
var getDepartmentTeams = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_team_department.*,'
        + ' teams_department.name AS team_name, teams_department.lab_id'
        + ' FROM people_team_department'
        + ' JOIN teams_department ON teams_department.id = people_team_department.team_id'
        + ' WHERE people_team_department.person_id = ?;';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].departmentTeams = resQuery;
            if (i + 1 < people.length) {
                options.i = i + 1;
                return getNationalities(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "count": people.length,
                        "result": people
                    }
                });
            }
        },
        options);
};
module.exports.getData = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            options.exportType = 'people';
            filterPeople(options);
        },
        { req, res, next }
    );
}

var getPublicationsPerson = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_publications.*,'
        + ' publications.authors_raw, publications.title, journals.name AS journal_name, journals.short_name AS journal_short_name,'
        + ' publications.volume, publications.page_start, publications.page_end,'
        + ' publications.doi, publications.wos, publications.year'
        + ' FROM people_publications'
        + ' JOIN publications ON people_publications.publication_id = publications.id'
        + ' JOIN journals ON journals.id = publications.journal_id'
        + ' WHERE people_publications.person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].publications = resQuery;
            if (resQuery.length > 0) {
                options.j = 0;
                return getPublicationsDescriptions(options);
            } else if (i + 1 < people.length) {
                options.i = i + 1;
                return getPublicationsPerson(options);
            } else {
                options.i = 0;
                return getProjectsPerson(options);
            }
        },
        options);
};
var getPublicationsDescriptions = function (options) {
    let { req, res, next, people, i, j } = options;
    let person = people[i];
    let publication = person.publications[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT publication_types.*'
        + ' FROM publication_descriptions'
        + ' JOIN publication_types ON publication_types.id = publication_descriptions.publication_type'
        + ' WHERE publication_descriptions.publication_id = ?';
    places.push(publication.publication_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].publications[j].descriptions = resQuery;
            if (j + 1 < person.publications.length) {
                options.j = j + 1;
                return getPublicationsDescriptions(options);
            } else {
                options.j = 0;
                return getPublicationTeams(options);
            }
        },
        options);
};

var getPublicationTeams = function (options) {
    let { req, res, next, people, i, j } = options;
    let person = people[i];
    let publication = person.publications[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT teams_department.*'
        + ' FROM department_teams_publications'
        + ' JOIN teams_department ON teams_department.id = department_teams_publications.department_team_id'
        + ' WHERE department_teams_publications.publication_id = ?';
    places.push(publication.publication_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].publications[j].teams = resQuery;
            return getPublicationLabs(options)
        },
        options);
};
var getPublicationLabs = function (options) {
    let { req, res, next, people, i, j } = options;
    let person = people[i];
    let publication = person.publications[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT labs.*'
        + ' FROM labs_publications'
        + ' JOIN labs ON labs.id = labs_publications.lab_id'
        + ' WHERE labs_publications.publication_id = ?';
    places.push(publication.publication_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].publications[j].labs = resQuery;
            if (j + 1 < person.publications.length) {
                options.j = j + 1;
                return getPublicationTeams(options);
            } else if (i + 1 < people.length) {
                options.i = i + 1;
                return getPublicationsPerson(options);
            } else {
                options.i = 0;
                return getProjectsPerson(options)
            }
        },
        options);
};

/*
var getPublicationsPersonTeams = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT teams_department.*,'
        + ' FROM people_team_department'
        + ' JOIN teams_department ON teams_department.id = people_team_department.team_id'
        + ' WHERE people_team_department.person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].department_teams = resQuery;
            return getPublicationsPersonLabs(options);
        },
        options);
};
var getPublicationsPersonLabs = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT labs.*,'
        + ' FROM people_labs'
        + ' JOIN labs ON lab.id = people_labs.lab_id'
        + ' WHERE people_labs.person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].labs = resQuery;
            if (i + 1 < people.length) {
                options.i = i + 1;
                return getPublicationsPersonTeams(options);
            } else {
                options.i = 0;
                return getProjectsPerson(options);
            }
        },
        options);
};
*/
var getProjectsPerson = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_projects.*, person_project_positions.name_en AS person_project_position,'
        + ' projects.project_type_id, project_types.name AS project_type_name,'
        + ' projects.call_type_id, call_types.name AS call_type_name,'
        + ' projects.title, projects.acronym, projects.reference,'
        + ' projects.start, projects.end, projects.global_amount,'
        + ' projects.website, projects.notes'
        + ' FROM people_projects'
        + ' JOIN projects ON projects.id = people_projects.project_id'
        + ' LEFT JOIN person_project_positions ON person_project_positions.id = people_projects.position_id'
        + ' LEFT JOIN project_types ON project_types.id = projects.project_type_id'
        + ' LEFT JOIN call_types ON call_types.id = projects.call_type_id'
        + ' WHERE people_projects.person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].projects = resQuery;
            if (resQuery.length > 0) {
                options.j = 0;
                return getProjectAreas(options);
            } else if (i + 1 < people.length) {
                options.i = i + 1;
                return getProjectsPerson(options);
            } else {
                options.i = 0;
                return getIndustryProjectsPerson(options);
            }
        },
        options);
};
var getProjectAreas = function (options) {
    let { req, res, next, people, i, j } = options;
    let person = people[i];
    let project = person.projects[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT *'
        + ' FROM project_areas'
        + ' WHERE project_id = ?';
    places.push(project.project_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].projects[j].areas = resQuery;
            if (j + 1 < person.projects.length) {
                options.j = j + 1;
                return getProjectAreas(options);
            } else {
                options.j = 0;
                return getProjectFundingEntities(options);
            }
        },
        options);
};
var getProjectFundingEntities = function (options) {
    let { req, res, next, people, i, j } = options;
    let person = people[i];
    let project = person.projects[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT funding_agencies.*'
        + ' FROM projects_funding_entities'
        + ' JOIN funding_agencies ON funding_agencies.id = projects_funding_entities.funding_entity_id'
        + ' WHERE projects_funding_entities.project_id = ?';
    places.push(project.project_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].projects[j].funding_entities = resQuery;
            if (j + 1 < person.projects.length) {
                options.j = j + 1;
                return getProjectFundingEntities(options);
            } else {
                options.j = 0;
                return getProjectOtherFundingEntities(options);
            }
        },
        options);
};
var getProjectOtherFundingEntities = function (options) {
    let { req, res, next, people, i, j } = options;
    let person = people[i];
    let project = person.projects[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT *'
        + ' FROM projects_other_funding_entities'
        + ' WHERE project_id = ?;';
    places.push(project.project_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].projects[j].other_funding_entities = resQuery;
            if (j + 1 < person.projects.length) {
                options.j = j + 1;
                return getProjectOtherFundingEntities(options);
            } else {
                options.j = 0;
                return getProjectManagementEntities(options);
            }
        },
        options);
};
var getProjectManagementEntities = function (options) {
    let { req, res, next, people, i, j } = options;
    let person = people[i];
    let project = person.projects[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT management_entities.*,'
        + ' projects_management_entities.amount'
        + ' FROM projects_management_entities'
        + ' JOIN management_entities ON management_entities.id = projects_management_entities.management_entity_id'
        + ' WHERE projects_management_entities.project_id = ?';
    places.push(project.project_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].projects[j].management_entities = resQuery;
            if (j + 1 < person.projects.length) {
                options.j = j + 1;
                return getProjectManagementEntities(options);
            } else if (i + 1 < people.length) {
                options.i = i + 1;
                return getProjectsPerson(options);
            } else {
                options.i = 0;
                return getIndustryProjectsPerson(options);
            }
        },
        options);
};

var getIndustryProjectsPerson = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_private_agreements.*,'
        + ' private_agreements.agreement_type_id, private_agreement_types.name AS private_agreement_type_name,'
        + ' private_agreements.title, private_agreements.acronym, private_agreements.reference,'
        + ' private_agreements.confidential,'
        + ' private_agreements.start, private_agreements.end, private_agreements.global_amount,'
        + ' private_agreements.website, private_agreements.notes'
        + ' FROM people_private_agreements'
        + ' JOIN private_agreements ON private_agreements.id = people_private_agreements.agreement_id'
        + ' LEFT JOIN private_agreement_types ON private_agreement_types.id = private_agreements.agreement_type_id'
        + ' WHERE people_private_agreements.person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].private_agreements = resQuery;
            if (resQuery.length > 0) {
                options.j = 0;
                return getIndustryProjectAreas(options);
            } else if (i + 1 < people.length) {
                options.i = i + 1;
                return getIndustryProjectsPerson(options);
            } else {
                options.i = 0;
                return getTrainingNetworksPerson(options);
            }
        },
        options);
};
var getIndustryProjectAreas = function (options) {
    let { req, res, next, people, i, j } = options;
    let person = people[i];
    let agreement = person.private_agreements[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT *'
        + ' FROM private_agreement_areas'
        + ' WHERE agreement_id = ?';
    places.push(agreement.agreement_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].private_agreements[j].areas = resQuery;
            if (j + 1 < person.private_agreements.length) {
                options.j = j + 1;
                return getIndustryProjectAreas(options);
            } else {
                options.j = 0;
                return getIndustryProjectPartners(options);
            }
        },
        options);
};
var getIndustryProjectPartners = function (options) {
    let { req, res, next, people, i, j } = options;
    let person = people[i];
    let agreement = person.private_agreements[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT *'
        + ' FROM private_agreements_partners'
        + ' WHERE agreement_id = ?';
    places.push(agreement.agreement_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].private_agreements[j].partners = resQuery;
            if (j + 1 < person.private_agreements.length) {
                options.j = j + 1;
                return getIndustryProjectPartners(options);
            } else {
                options.j = 0;
                return getIndustryProjectManagementEntities(options);
            }
        },
        options);
};
var getIndustryProjectManagementEntities = function (options) {
    let { req, res, next, people, i, j } = options;
    let person = people[i];
    let agreement = person.private_agreements[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT management_entities.*,'
        + ' private_agreements_management_entities.amount'
        + ' FROM private_agreements_management_entities'
        + ' JOIN management_entities ON management_entities.id = private_agreements_management_entities.management_entity_id'
        + ' WHERE private_agreements_management_entities.agreement_id = ?';
    places.push(agreement.agreement_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].private_agreements[j].management_entities = resQuery;
            if (j + 1 < person.private_agreements.length) {
                options.j = j + 1;
                return getIndustryProjectManagementEntities(options);
            } else if (i + 1 < people.length) {
                options.i = i + 1;
                return getIndustryProjectsPerson(options);
            } else {
                options.i = 0;
                return getTrainingNetworksPerson(options);
            }
        },
        options);
};

var getTrainingNetworksPerson = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_training_networks.*,training_network_roles.name AS role_name,'
        + ' training_networks.network_name, training_networks.title,'
        + ' training_networks.acronym, training_networks.reference, training_networks.global_amount,'
        + ' training_networks.coordinating_entity, training_networks.country_id, countries.name AS country_name,'
        + ' training_networks.start, training_networks.end,'
        + ' training_networks.website, training_networks.notes'
        + ' FROM people_training_networks'
        + ' JOIN training_networks ON training_networks.id = people_training_networks.training_id'
        + ' LEFT JOIN training_network_roles ON training_network_roles.id = people_training_networks.role_id'
        + ' LEFT JOIN countries ON countries.id = training_networks.country_id'
        + ' WHERE people_training_networks.person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].training_networks = resQuery;
            if (resQuery.length > 0) {
                options.j = 0;
                return getTrainingNetworkManagementEntities(options);
            } else if (i + 1 < people.length) {
                options.i = i + 1;
                return getTrainingNetworksPerson(options);
            } else {
                options.i = 0;
                return getStartupsPerson(options)
            }
        },
        options);
};
var getTrainingNetworkManagementEntities = function (options) {
    let { req, res, next, people, i, j } = options;
    let person = people[i];
    let network = person.training_networks[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT management_entities.*,'
        + ' training_networks_management_entities.amount'
        + ' FROM training_networks_management_entities'
        + ' JOIN management_entities ON management_entities.id = training_networks_management_entities.management_entity_id'
        + ' WHERE training_networks_management_entities.training_id = ?';
    places.push(network.training_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].training_networks[j].management_entities = resQuery;
            if (j + 1 < person.training_networks.length) {
                options.j = j + 1;
                return getTrainingNetworkManagementEntities(options);
            } else if (i + 1 < people.length) {
                options.i = i + 1;
                return getTrainingNetworksPerson(options);
            } else {
                options.i = 0;
                return getStartupsPerson(options);
            }
        },
        options);
};

var getStartupsPerson = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_startups.*,'
        + ' startups.name AS startup_name,'
        + ' startups.start AS startup_start, startups.start AS startup_end,'
        + ' startups.short_description'
        + ' FROM people_startups'
        + ' JOIN startups ON startups.id = people_startups.startup_id'
        + ' WHERE people_startups.person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].startups = resQuery;
            if (i + 1 < people.length) {
                options.i = i + 1;
                return getStartupsPerson(options);
            } else {
                options.i = 0;
                return getCommunicationsPerson(options);
            }
        },
        options);
};
var getCommunicationsPerson = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT communications.*,'
        + ' communication_types.name AS communication_type_name,'
        + ' conference_types.name AS conference_type_name,'
        + ' countries.name AS country_name'
        + ' FROM communications'
        + ' LEFT JOIN communication_types ON communication_types.id = communications.type_id'
        + ' LEFT JOIN conference_types ON conference_types.id = communications.conference_type_id'
        + ' LEFT JOIN countries ON countries.id = communications.country_id'
        + ' WHERE communications.person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].communications = resQuery;
            if (i + 1 < people.length) {
                options.i = i + 1;
                return getCommunicationsPerson(options);
            } else {
                options.i = 0;
                return getOrganizationMeetingsPerson(options);
            }
        },
        options);
};
var getOrganizationMeetingsPerson = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT organization_meetings.*,'
        + ' people_organization_meetings.role,'
        + ' meeting_types.name AS meeting_type_name,'
        + ' countries.name AS country_name'
        + ' FROM people_organization_meetings'
        + ' JOIN organization_meetings ON organization_meetings.id = people_organization_meetings.meeting_id'
        + ' LEFT JOIN meeting_types ON meeting_types.id = organization_meetings.meeting_type_id'
        + ' LEFT JOIN countries ON countries.id = organization_meetings.country_id'
        + ' WHERE people_organization_meetings.person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].organization_meetings = resQuery;
            if (i + 1 < people.length) {
                options.i = i + 1;
                return getOrganizationMeetingsPerson(options);
            } else {
                options.i = 0;
                return getPrizesPerson(options);
            }
        },
        options);
};
var getPrizesPerson = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT prizes.*'
        + ' FROM people_prizes'
        + ' JOIN prizes ON prizes.id = people_prizes.prize_id'
        + ' WHERE people_prizes.person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].prizes = resQuery;
            if (i + 1 < people.length) {
                options.i = i + 1;
                return getPrizesPerson(options);
            } else {
                options.i = 0;
                return getBoardsPerson(options);
            }
        },
        options);
};
var getBoardsPerson = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT boards.*,'
        + ' board_types.name AS board_type_name'
        + ' FROM people_boards'
        + ' JOIN boards ON boards.id = people_boards.board_id'
        + ' LEFT JOIN board_types ON board_types.id = boards.board_type_id'
        + ' WHERE people_boards.person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].boards = resQuery;
            if (i + 1 < people.length) {
                options.i = i + 1;
                return getBoardsPerson(options);
            } else {
                options.i = 0;
                return getPatentsPerson(options);
            }
        },
        options);
};
var getPatentsPerson = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT patents.*,'
        + ' patent_types.name_en AS patent_type_name,'
        + ' patent_status.name_en AS patent_status_name'
        + ' FROM people_patents'
        + ' JOIN patents ON patents.id = people_patents.patent_id'
        + ' LEFT JOIN patent_types ON patent_types.id = patents.patent_type_id'
        + ' LEFT JOIN patent_status ON patent_status.id = patents.status_id'
        + ' WHERE people_patents.person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].patents = resQuery;
            if (i + 1 < people.length) {
                options.i = i + 1;
                return getPatentsPerson(options);
            } else {
                options.i = 0;
                return getDatasetsPerson(options);
            }
        },
        options);
};
var getDatasetsPerson = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT data_sets.*,'
        + ' data_set_types.name AS data_set_type_name'
        + ' FROM people_data_sets'
        + ' JOIN data_sets ON data_sets.id = people_data_sets.data_set_id'
        + ' LEFT JOIN data_set_types ON data_set_types.id = data_sets.data_set_type_id'
        + ' WHERE people_data_sets.person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].data_sets = resQuery;
            if (i + 1 < people.length) {
                options.i = i + 1;
                return getDatasetsPerson(options);
            } else {
                options.i = 0;
                return getOutreachPerson(options);
            }
        },
        options);
};
var getOutreachPerson = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT outreach.*'
        + ' FROM people_outreach'
        + ' JOIN outreach ON outreach.id = people_outreach.outreach_id'
        + ' WHERE people_outreach.person_id = ?';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].outreach = resQuery;
            if (i + 1 < people.length) {
                options.i = i + 1;
                return getOutreachPerson(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "count": people.length,
                        "result": people
                    }
                });
            }
        },
        options);
};

module.exports.getProductivityData = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            options.exportType = 'productivity';
            filterPeople(options)
        },
        { req, res, next }
    );
}

var getSpacesPerson = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT spaces.*,'
        + ' space_types.name_en AS space_type_name,'
        + ' users_spaces.role_id, space_roles.name_en AS role_name,'
        + ' users_spaces.valid_from, users_spaces.valid_until, users_spaces.comments'
        + ' FROM users_spaces'
        + ' JOIN spaces ON spaces.id = users_spaces.space_id'
        + ' LEFT JOIN space_types ON space_types.id = spaces.space_type_id'
        + ' LEFT JOIN space_roles ON space_roles.id = users_spaces.role_id'
        + ' WHERE users_spaces.person_id = ?'
        ;
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].spaces = resQuery;
            if (i + 1 < people.length) {
                options.i = i + 1;
                return getSpacesPerson(options);
            } else {
                return getSpacesTeams(options);
            }
        },
        options);
};
var getSpacesTeams = function (options) {
    let { req, res, next, people } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT spaces.*,'
        + ' teams_spaces.percentage, teams_spaces.valid_from, teams_spaces.valid_until,'
        + ' teams_department.name AS team_name'
        + ' FROM teams_spaces'
        + ' JOIN spaces ON spaces.id = teams_spaces.space_id'
        + ' JOIN teams_department ON teams_department.id = teams_spaces.team_id'
        + ' LEFT JOIN space_types ON space_types.id = spaces.space_type_id'
        ;
    //places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let spacesTeams = resQuery;
            return responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success",
                    "statusCode": 200,
                    "result": {
                        people,
                        spacesTeams,
                    }
                }
            });

        },
        options);

};
module.exports.getSpacesData = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            options.exportType = 'spaces';
            filterPeople(options)
        },
        { req, res, next }
    );
}

var getSupervisionPerson = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    //console.log(person)
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_responsibles.*,'
        + ' people.name AS student_name,'
        + ' responsibles.name AS supervisor_name,'
        + ' responsible_types.name_en AS supervisor_type_name,'
        + ' teams_department.name AS department_team_name'
        + ' FROM people_responsibles'
        + ' JOIN people ON people.id = people_responsibles.person_id'
        + ' JOIN people AS responsibles ON responsibles.id = people_responsibles.responsible_id'
        + ' LEFT JOIN responsible_types ON responsible_types.id = people_responsibles.responsible_type_id'
        + ' LEFT JOIN people_team_department ON people_team_department.person_id = responsibles.id'
        + ' LEFT JOIN teams_department ON teams_department.id = people_team_department.team_id'
        + ' WHERE people_responsibles.responsible_id = ?'
        ;
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].supervises = resQuery;
            return getSupervisionDegreesPerson(options)
        },
        options);
};

var getSupervisionDegreesPerson = function (options) {
    let { req, res, next, people, i } = options;
    let person = people[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT degrees_supervisors.*,'
        + ' people.name AS student_name,'
        + ' responsibles.name AS supervisor_name,'
        + ' supervisor_types.name_en AS supervisor_type_name,'
        + ' teams_department.name AS department_team_name,'
        + ' degrees_people.start AS degree_start, degrees_people.end AS degree_end, degrees_people.estimate_end AS degree_estimate_end,'
        + ' degrees_people.program AS degree_program, degrees.name_en AS degree_name'
        + ' FROM degrees_supervisors'
        + ' JOIN degrees_people ON degrees_people.id = degrees_supervisors.degree_person_id'
        + ' LEFT JOIN degrees ON degrees_people.degree_id = degrees.id'
        + ' LEFT JOIN supervisor_types ON supervisor_types.id = degrees_supervisors.supervisor_type_id'
        + ' LEFT JOIN people ON people.id = degrees_people.person_id'
        + ' LEFT JOIN people AS responsibles ON responsibles.id = degrees_supervisors.supervisor_id'
        + ' LEFT JOIN people_team_department ON people_team_department.person_id = responsibles.id'
        + ' LEFT JOIN teams_department ON teams_department.id = people_team_department.team_id'
        + ' WHERE degrees_supervisors.supervisor_id = ?;'
        ;
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            people[i].degrees_supervised = resQuery;
            if (i + 1 < people.length) {
                options.i = i + 1;
                return getSupervisionPerson(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "result": people,
                    }
                });
            }
        },
        options);
};
module.exports.getSupervisionData = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            options.exportType = 'supervision';
            filterPeople(options)
        },
        { req, res, next }
    );
}
