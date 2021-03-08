const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');

var getEmail = function(options) {
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT email from emails WHERE person_id = ?;';
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.people[i].email = resQuery[0].email;
            } else {
                options.people[i].email = '';
            }
            return getPhones(options);
        },
        options
    );
};
var getPhones = function(options) {
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT phone, extension FROM phones WHERE person_id = ?;';
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.people[i].phone = resQuery[0].phone;
                options.people[i].phone_extension = resQuery[0].extension;
            } else {
                options.people[i].phone = '';
                options.people[i].phone_extension = '';
            }
            return getResearcherInfo(options);
        },
        options
    );
};
var getResearcherInfo = function(options) {
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT ORCID, researcherID, ciencia_id FROM researchers_info WHERE person_id = ?;';
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.people[i].ORCID = resQuery[0].ORCID;
                options.people[i].researcher_id = resQuery[0].researcherID;
                options.people[i].ciencia_id = resQuery[0].ciencia_id;
            } else {
                options.people[i].ORCID = null;
                options.people[i].researcher_id = null;
                options.people[i].ciencia_id = null;
            }
            return getPhoto(options);
        },
        options
    );
};
var getPhoto = function(options) {
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT url FROM personal_photo WHERE person_id = ?;';
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.people[i].image_path = resQuery[0].url;
            } else {
                options.people[i].image_path = null;
            }
            return getWebsiteTexts(options);
        },
        options
    );
};
var getWebsiteTexts = function(options) {
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT website_texts.*, website_text_types.name_en'
             + ' FROM website_texts'
             + ' LEFT JOIN website_text_types ON website_text_types.id = website_texts.text_type_id'
             + ' WHERE person_id = ?;';
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let texts = [];
            for (let ind in resQuery) {
                texts.push({
                    website_text_title: resQuery[ind].title,
                    website_text: resQuery[ind].text,
                    website_text_type_id: resQuery[ind].text_type_id,
                    website_text_type_name_en: resQuery[ind].name_en
                });
            }
            options.people[i].website_texts = texts;
            return getPersonalURLs(options)
        },
        options
    );
};
var getPersonalURLs = function(options) {
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT personal_urls.*, personal_url_types.type_en'
             + ' FROM personal_urls'
             + ' LEFT JOIN personal_url_types ON personal_url_types.id = personal_urls.url_type_id'
             + ' WHERE person_id = ?;';
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data = [];
            for (let ind in resQuery) {
                data.push({
                    url: resQuery[ind].url,
                    url_type_id: resQuery[ind].url_type_id,
                    url_type: resQuery[ind].type_en,
                    url_description: resQuery[ind].description
                });
            }
            options.people[i].personal_url_data = data;
            return getDegrees(options)
        },
        options
    );
};
var getDegrees = function(options) {
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT degrees_people.*, degrees.name_en'
             + ' FROM degrees_people'
             + ' LEFT JOIN degrees ON degrees.id = degrees_people.degree_id'
             + ' WHERE person_id = ?;';
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data = [];
            for (let ind in resQuery) {
                data.push({
                    degree_start: resQuery[ind].start,
                    degree_end: resQuery[ind].end,
                    degree_type_id: resQuery[ind].degree_id,
                    degree: resQuery[ind].name_en,
                    degree_field: resQuery[ind].area,
                    degree_institution: resQuery[ind].institution
                });
            }
            options.people[i].degrees_data = data;
            return getJobs(options)
        },
        options
    );
};
var getJobs = function(options) {
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT jobs.*, categories_situations.category_id, categories.name_en'
             + ' FROM jobs'
             + ' LEFT JOIN categories_situations ON categories_situations.id = jobs.category_situation_id'
             + ' LEFT JOIN categories ON categories.id = categories_situations.category_id'
             + ' WHERE person_id = ?;';
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data = [];
            for (let ind in resQuery) {
                data.push({
                    job_start: resQuery[ind].valid_from,
                    job_end: resQuery[ind].valid_until,
                    category_id: resQuery[ind].category_id,
                    category: resQuery[ind].name_en,
                    organization: resQuery[ind].organization
                });
            }
            options.people[i].job_data = data;
            return getResearchInterests(options)
        },
        options
    );
};
var getResearchInterests = function(options) {
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT *'
             + ' FROM research_interests'
             + ' WHERE person_id = ?'
             + ' ORDER BY sort_order;';
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data = [];
            for (let ind in resQuery) {
                data.push({
                    interests: resQuery[ind].interests,
                    interests_sort_order: resQuery[ind].sort_order,
                });
            }
            options.people[i].research_interests = data;
            return getLabs(options);
        },
        options
    );
};
var getLabs = function(options) {
    // Gets current affiliations for current people
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT people_labs.*,'
             + ' labs.name AS lab_name, labs.started, labs.finished,'
             + ' lab_positions.name_en AS lab_position_name_en, lab_positions.name_pt AS lab_position_name_pt'
             + ' FROM people_labs'
             + ' LEFT JOIN labs ON labs.id = people_labs.lab_id'
             + ' LEFT JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
             + ' WHERE people_labs.person_id = ?'
             + ' AND ('
             + ' (people_labs.valid_from <= CURDATE() AND people_labs.valid_until >= CURDATE())'
             + ' OR (people_labs.valid_from <= CURDATE() AND people_labs.valid_until IS NULL)'
             + ' OR (people_labs.valid_from IS NULL AND people_labs.valid_until >= CURDATE())'
             + ' OR (people_labs.valid_from IS NULL AND people_labs.valid_until IS NULL)'
             + ')'
             + ' AND ('
             + ' (labs.started <= CURDATE() AND labs.finished >= CURDATE())'
             + ' OR (labs.started <= CURDATE() AND labs.finished IS NULL)'
             + ' OR (labs.started IS NULL AND labs.finished >= CURDATE())'
             + ' OR (labs.started IS NULL AND labs.finished IS NULL)'
             + ')'
             ;
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            // now for each lab gets its current group
            let data = [];
            for (let ind in resQuery) {
                data.push({
                    sort_order: resQuery[ind].sort_order,
                    lab_id: resQuery[ind].lab_id,
                    lab_name: resQuery[ind].lab_name,
                    lab_start: resQuery[ind].valid_from,
                    lab_end: resQuery[ind].valid_until,
                    lab_position_id: resQuery[ind].lab_position_id,
                    lab_position_name_en: resQuery[ind].lab_position_name_en,
                    lab_position_name_pt: resQuery[ind].lab_position_name_pt
                });
            }
            options.people[i].lab_data = data;
            if (resQuery.length > 0) {
                options.j = 0
                return getLabGroup(options);
            } else {
                return getTechnicianData(options);
            }
        },
        options
    );
};
var getLabGroup = function(options) {
    let { req, res, next, people, i, j } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT labs_groups.*,'
             + ' groups.name AS group_name, groups.started, groups.finished'
             + ' FROM labs_groups'
             + ' LEFT JOIN `groups` ON groups.id = labs_groups.group_id'
             + ' WHERE labs_groups.lab_id = ?'
             + ' AND ('
             + ' (labs_groups.valid_from <= CURDATE() AND labs_groups.valid_until >= CURDATE())'
             + ' OR (labs_groups.valid_from <= CURDATE() AND labs_groups.valid_until IS NULL)'
             + ' OR (labs_groups.valid_from IS NULL AND labs_groups.valid_until >= CURDATE())'
             + ' OR (labs_groups.valid_from IS NULL AND labs_groups.valid_until IS NULL)'
             + ')';
    places.push(people[i].lab_data[j].lab_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            // there should be only 1 group per lab at a time
            // also it should always return a result
            options.people[i].lab_data[j].group_id = resQuery[0].group_id;
            options.people[i].lab_data[j].group_name = resQuery[0].group_name;
            options.people[i].lab_data[j].labs_groups_valid_from = resQuery[0].valid_from;
            options.people[i].lab_data[j].labs_groups_valid_until = resQuery[0].valid_until;
            return getGroupUnit(options);
        },
        options
    );
};
var getGroupUnit = function(options) {
    let { req, res, next, people, i, j } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT groups_units.*,'
             + ' units.name AS unit_name, units.started, units.finished'
             + ' FROM groups_units'
             + ' LEFT JOIN units ON units.id = groups_units.unit_id'
             + ' WHERE groups_units.group_id = ?'
             + ' AND ('
             + ' (groups_units.valid_from <= CURDATE() AND groups_units.valid_until >= CURDATE())'
             + ' OR (groups_units.valid_from <= CURDATE() AND groups_units.valid_until IS NULL)'
             + ' OR (groups_units.valid_from IS NULL AND groups_units.valid_until >= CURDATE())'
             + ' OR (groups_units.valid_from IS NULL AND groups_units.valid_until IS NULL)'
             + ')';
    places.push(people[i].lab_data[j].group_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            // there should be only 1 unit per group at a time
            // also it should always return a result
            options.people[i].lab_data[j].unit_id = resQuery[0].unit_id;
            options.people[i].lab_data[j].unit_name = resQuery[0].unit_name;
            if (j + 1 < people[i].lab_data.length) {
                options.j = options.j + 1;
                return getLabGroup(options);

            } else {
                return getTechnicianData(options);
            }
        },
        options
    );
};
var getTechnicianData = function(options) {
    // Gets current affiliations for current people
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT technicians.*,'
             + ' technician_offices.name_en AS technician_office_name, technician_offices.started, technician_offices.finished,'
             + ' technician_positions.name_en AS technician_position_name_en, technician_positions.name_pt AS technician_position_name_pt'
             + ' FROM technicians'
             + ' LEFT JOIN technician_offices ON technician_offices.id = technicians.technician_office_id'
             + ' LEFT JOIN technician_positions ON technician_positions.id = technicians.technician_position_id'
             + ' WHERE technicians.person_id = ?'
             + ' AND ('
             + ' (technicians.valid_from <= CURDATE() AND technicians.valid_until >= CURDATE())'
             + ' OR (technicians.valid_from <= CURDATE() AND technicians.valid_until IS NULL)'
             + ' OR (technicians.valid_from IS NULL AND technicians.valid_until >= CURDATE())'
             + ' OR (technicians.valid_from IS NULL AND technicians.valid_until IS NULL)'
             + ')';
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data = [];
            for (let ind in resQuery) {
                data.push({
                    technician_id: resQuery[ind].id,
                    technician_office_id: resQuery[ind].technician_office_id,
                    technician_office_name: resQuery[ind].technician_office_name,
                    technician_start: resQuery[ind].valid_from,
                    technician_end: resQuery[ind].valid_until,
                    technician_position_id: resQuery[ind].technician_position_id,
                    technician_position_name_en: resQuery[ind].technician_position_name_en,
                    technician_position_name_pt: resQuery[ind].technician_position_name_pt
                });
            }
            options.people[i].technician_data = data;
            if (resQuery.length > 0) {
                options.j = 0
                return getTechnicianUnit(options);
            } else {
                return getScienceManagerData(options);
            }
        },
        options
    );
};
var getTechnicianUnit = function(options) {
    let { req, res, next, people, i, j } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT technicians_units.*,'
             + ' units.name AS unit_name, units.started, units.finished'
             + ' FROM technicians_units'
             + ' LEFT JOIN units ON units.id = technicians_units.unit_id'
             + ' WHERE technicians_units.technician_id = ?;';
    places.push(people[i].technician_data[j].technician_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            // there should be only 1 unit per group at a time
            // also it should always return a result
            options.people[i].technician_data[j].technician_unit_id = resQuery[0].unit_id;
            options.people[i].technician_data[j].technician_unit_name = resQuery[0].unit_name;
            if (j + 1 < people[i].technician_data.length) {
                options.j = options.j + 1;
                return getTechnicianUnit(options);

            } else {
                return getScienceManagerData(options);
            }
        },
        options
    );
};
var getScienceManagerData = function(options) {
    // Gets current affiliations for current people
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT science_managers.*,'
             + ' science_manager_offices.name_en AS science_manager_office_name, science_manager_offices.started, science_manager_offices.finished,'
             + ' science_manager_positions.name_en AS science_manager_position_name_en, science_manager_positions.name_pt AS science_manager_position_name_pt'
             + ' FROM science_managers'
             + ' LEFT JOIN science_manager_offices ON science_manager_offices.id = science_managers.science_manager_office_id'
             + ' LEFT JOIN science_manager_positions ON science_manager_positions.id = science_managers.science_manager_position_id'
             + ' WHERE science_managers.person_id = ?'
             + ' AND ('
             + ' (science_managers.valid_from <= CURDATE() AND science_managers.valid_until >= CURDATE())'
             + ' OR (science_managers.valid_from <= CURDATE() AND science_managers.valid_until IS NULL)'
             + ' OR (science_managers.valid_from IS NULL AND science_managers.valid_until >= CURDATE())'
             + ' OR (science_managers.valid_from IS NULL AND science_managers.valid_until IS NULL)'
             + ')';
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data = [];
            for (let ind in resQuery) {
                data.push({
                    science_manager_id: resQuery[ind].id,
                    science_manager_office_id: resQuery[ind].science_manager_office_id,
                    science_manager_office_name: resQuery[ind].science_manager_office_name,
                    science_manager_start: resQuery[ind].valid_from,
                    science_manager_end: resQuery[ind].valid_until,
                    science_manager_position_id: resQuery[ind].science_manager_position_id,
                    science_manager_position_name_en: resQuery[ind].science_manager_position_name_en,
                    science_manager_position_name_pt: resQuery[ind].science_manager_position_name_pt
                });
            }
            options.people[i].science_management_data = data;
            if (resQuery.length > 0) {
                options.j = 0
                return getScienceManagerUnit(options);
            } else {
                return getAdministrativeData(options);
            }
        },
        options
    );
};
var getScienceManagerUnit = function(options) {
    let { req, res, next, people, i, j } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT science_managers_units.*,'
             + ' units.name AS unit_name, units.started, units.finished'
             + ' FROM science_managers_units'
             + ' LEFT JOIN units ON units.id = science_managers_units.unit_id'
             + ' WHERE science_managers_units.science_manager_id = ?;';
    places.push(people[i].science_management_data[j].science_manager_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            // there should be only 1 unit per group at a time
            // also it should always return a result
            options.people[i].science_management_data[j].science_manager_unit_id = resQuery[0].unit_id;
            options.people[i].science_management_data[j].science_manager_unit_name = resQuery[0].unit_name;
            if (j + 1 < people[i].science_management_data.length) {
                options.j = options.j + 1;
                return getScienceManagerUnit(options);

            } else {
                return getAdministrativeData(options);
            }
        },
        options
    );
};
var getAdministrativeData = function(options) {
    // Gets current affiliations for current people
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT people_administrative_offices.*,'
             + ' administrative_offices.name_en AS administrative_office_name, administrative_offices.started, administrative_offices.finished,'
             + ' administrative_positions.name_en AS administrative_position_name_en, administrative_positions.name_pt AS administrative_position_name_pt'
             + ' FROM people_administrative_offices'
             + ' LEFT JOIN administrative_offices ON administrative_offices.id = people_administrative_offices.administrative_office_id'
             + ' LEFT JOIN administrative_positions ON administrative_positions.id = people_administrative_offices.administrative_position_id'
             + ' WHERE people_administrative_offices.person_id = ?'
             + ' AND ('
             + ' (people_administrative_offices.valid_from <= CURDATE() AND people_administrative_offices.valid_until >= CURDATE())'
             + ' OR (people_administrative_offices.valid_from <= CURDATE() AND people_administrative_offices.valid_until IS NULL)'
             + ' OR (people_administrative_offices.valid_from IS NULL AND people_administrative_offices.valid_until >= CURDATE())'
             + ' OR (people_administrative_offices.valid_from IS NULL AND people_administrative_offices.valid_until IS NULL)'
             + ')';
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data = [];
            for (let ind in resQuery) {
                data.push({
                    administrative_id: resQuery[ind].id,
                    administrative_office_id: resQuery[ind].administrative_office_id,
                    administrative_office_name: resQuery[ind].administrative_office_name,
                    administrative_start: resQuery[ind].valid_from,
                    administrative_end: resQuery[ind].valid_until,
                    administrative_position_id: resQuery[ind].administrative_position_id,
                    administrative_position_name_en: resQuery[ind].administrative_position_name_en,
                    administrative_position_name_pt: resQuery[ind].administrative_position_name_pt
                });
            }
            options.people[i].administrative_data = data;
            if (resQuery.length > 0) {
                options.j = 0
                return getAdministrativeUnit(options);
            } else {
                if (i + 1 < people.length) {
                    options.i = i + 1;
                    return getEmail(options);
                } else {
                    if (options.singlePerson) {
                        responses.sendJSONResponse(res, 200,
                            {
                                "status": "success",
                                "statusCode": 200,
                                "count": 1,
                                "total": 1,
                                "result": options.people,
                            });
                        return;
                    } else {
                        return queryTotal(options);
                    }
                }
            }
        },
        options
    );
};
var getAdministrativeUnit = function(options) {
    let { req, res, next, people, i, j } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT people_administrative_units.*,'
             + ' units.name AS unit_name, units.started, units.finished'
             + ' FROM people_administrative_units'
             + ' LEFT JOIN units ON units.id = people_administrative_units.unit_id'
             + ' WHERE people_administrative_units.administrative_id = ?;';
    places.push(people[i].administrative_data[j].administrative_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            // there should be only 1 unit per group at a time
            // also it should always return a result
            options.people[i].administrative_data[j].administrative_unit_id = resQuery[0].unit_id;
            options.people[i].administrative_data[j].administrative_unit_name = resQuery[0].unit_name;
            if (j + 1 < people[i].administrative_data.length) {
                options.j = options.j + 1;
                return getAdministrativeUnit(options);

            } else {
                if (i + 1 < people.length) {
                    options.i = i + 1;
                    return getEmail(options);
                } else if (options.singlePerson) {
                    responses.sendJSONResponse(res, 200,
                        {
                            "status": "success",
                            "statusCode": 200,
                            "count": 1,
                            "total": 1,
                            "result": options.people,
                        });
                    return;
                } else {
                    return queryTotal(options);
                }
            }
        },
        options
    );
};
var queryTotal = function(options) {
    let { req, res, next, people, querySQLForTotals, placeholdersForTotals } = options;
    return sql.getSQLOperationResult(req, res, querySQLForTotals, placeholdersForTotals,
        (resQuery, options) => {
            let nav = {}
            if (options.offset + options.limit < resQuery.length) {
                nav.next = req.path
                    + '?limit=' + options.limit
                    + '&offset=' + (options.offset + options.limit)
            }
            if (options.offset - options.limit >= 0) {
                nav.previous = req.path
                    + '?limit=' + options.limit
                    + '&offset=' + (options.offset - options.limit)
            }
            responses.sendJSONResponse(res, 200,
                {
                    "status": "success",
                    "statusCode": 200,
                    "count": people.length,
                    "total": resQuery.length,
                    "limit": options.limit,
                    "offset": options.offset,
                    "result": options.people,
                    nav
                });
            return;
        },
        options
    )
};

module.exports.searchPeople = function (req, res, next) {
    let offset = 0;
    let limit = 10;
    let names = [];
    let lab = null;
    if (req.query.hasOwnProperty('name')) {
        names = req.query.name.split(' ');
    }
    if (req.query.hasOwnProperty('lab')) {
        lab = req.query.lab.replace(/\s/gi,'%');
    }
    if (req.query.hasOwnProperty('offset')) {
        offset = parseInt(req.query.offset, 10);
    }
    if (req.query.hasOwnProperty('limit')) {
        limit = parseInt(req.query.limit, 10);
    }
    if (req.query.hasOwnProperty('lab')) {
        lab = req.query.lab.replace(/\s/gi,'%');
    }
    let querySQL;
    let places = [];
    querySQL = 'SELECT DISTINCT people.id, people.name AS full_name, people.colloquial_name AS name,'
             + ' people.active_from, people.active_until'
             + ' FROM people'
             + ' LEFT JOIN people_labs ON people.id = people_labs.person_id'
             + ' LEFT JOIN labs ON labs.id = people_labs.lab_id'
             + ' WHERE people.status = ? AND people.visible_public = 1'
             + ' AND ( (people.active_from <= CURDATE() AND people.active_until >= CURDATE()) '
                + ' OR (people.active_from <= CURDATE() AND people.active_until IS NULL)'
                + ' OR (people.active_from IS NULL AND people.active_until >= CURDATE())'
                + ' OR (people.active_from IS NULL AND people.active_until IS NULL) )'
    places.push(1);
    if (names.length > 0) {
        for (let name of names) {
            let searchStr = '%' + name + '%'
            querySQL = querySQL + 'AND people.name LIKE ?';
            places.push(searchStr);
        }
    }
    if(lab) {
        let searchStr = '%' + lab + '%'
        querySQL = querySQL + 'AND labs.name LIKE ?';
        places.push(searchStr);
    }

    let querySQLForTotals = querySQL;
    let placeholdersForTotals = places;
    querySQL = querySQL + ' ORDER BY people.name'
                        + ' LIMIT ?, ?'
    places.push(offset, limit);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.querySQLForTotals = querySQLForTotals;
                options.placeholdersForTotals = placeholdersForTotals;
                options.limit = limit;
                options.offset = offset;
                options.people = resQuery;
                options.i = 0;
                return getEmail(options);
            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": 0,
                        "result": []
                    });
                return;
            }
        },
        {req, res, next}
    );
};
module.exports.getPersonInfo = function (req, res, next) {
    let personID = req.params.personID
    let querySQL;
    let places = [];
    querySQL = 'SELECT DISTINCT people.id, people.name AS full_name, people.colloquial_name AS name,'
             + ' people.active_from, people.active_until'
             + ' FROM people'
             + ' LEFT JOIN people_labs ON people.id = people_labs.person_id'
             + ' LEFT JOIN labs ON labs.id = people_labs.lab_id'
             + ' WHERE people.id = ? AND people.status = ? AND people.visible_public = 1'
             + ' AND ( (people.active_from <= CURDATE() AND people.active_until >= CURDATE()) '
                + ' OR (people.active_from <= CURDATE() AND people.active_until IS NULL)'
                + ' OR (people.active_from IS NULL AND people.active_until >= CURDATE())'
                + ' OR (people.active_from IS NULL AND people.active_until IS NULL) )'
    places.push(personID, 1);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.people = resQuery;
                options.i = 0;
                options.singlePerson = true;
                return getEmail(options);
            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": 0,
                        "result": []
                    });
                return;
            }
        },
        {req, res, next}
    );

};

