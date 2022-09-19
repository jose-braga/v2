const sql = require('../utilities/sql')
const responses = require('../utilities/responses');


// (was) Alphabetically ordered
var getCountries = function(req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from countries;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getDegrees = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from degrees;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getPeopleSimple = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT id, user_id, name, colloquial_name FROM people'
                        + ' WHERE status = 1'
                        + ' ORDER BY colloquial_name ASC;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getSupervisors = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT id, user_id, name, colloquial_name FROM people'
                        + ' WHERE status = 1 AND can_supervise = 1'
                        + ' ORDER BY colloquial_name ASC;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getPoles = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM institution_city';
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getLabPositions = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM lab_positions ORDER BY sort_order ASC;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getTechnicianPositions = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM technician_positions ORDER BY sort_order ASC;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getScienceManagerPositions = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM science_manager_positions ORDER BY sort_order ASC;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getAdministrativePositions = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM administrative_positions ORDER BY sort_order ASC;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getRoles = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT roles.id AS role_id, roles.name_en, roles.name_pt'
                        + ' FROM roles';
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getSupervisorTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from supervisor_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getResponsibleTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from responsible_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getSituations = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT *'
        + ' FROM situations'
        + ' WHERE visible = 1'
        + ' ORDER BY sort_order ASC;'
        ;
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.situations = resQuery;
            getCategories(options);
        },
        {req, res, next});
};
var getCategories = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT *'
        + ' FROM categories'
        + ' WHERE visible = 1'
        + ' ORDER BY sort_order ASC;'
        ;
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.categories = resQuery;
            getSituationsCategoriesRelationships(options);
        },
        options);
};
var getSituationsCategoriesRelationships = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT categories_situations.id, categories_situations.category_id, categories_situations.situation_id,'
                        + ' categories.name_en AS category_name_en, categories.name_pt AS category_name_pt,'
                        + ' situations.name_en AS situation_name_en, situations.name_pt AS situation_name_pt,'
                        + ' situations.requires_unit_contract, situations.requires_fellowship'
                        + ' FROM categories_situations'
                        + ' JOIN categories ON categories.id = categories_situations.category_id'
                        + ' JOIN situations ON situations.id = categories_situations.situation_id'
                        + ' WHERE categories_situations.visible = 1'
                        + ' ORDER BY categories_situations.sort_order ASC'
                        ;
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.relationships = resQuery;
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "result": {
                        situations: options.situations,
                        categories: options.categories,
                        relationships: options.relationships,
                    }
                }
            });
            return;
        },
        options);
};
var getFellowshipTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from fellowship_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getManagementEntities = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from management_entities;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getFundingAgencies = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from funding_agencies;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getJournalNames = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM journals ORDER BY name;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getAuthorTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM author_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getPublicationSources = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM publication_sources;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getPublicationTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM publication_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getInstitutionalRepositories = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM institutional_repositories;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getCardTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM card_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getDepartments = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT departments.id, departments.name_en AS department_name_en, departments.name_pt AS department_name_pt,'
    + ' schools.name_en AS school_name_en, schools.name_pt AS school_name_pt,'
    + ' schools.shortname_en AS school_shortname_en, schools.shortname_pt AS school_shortname_pt,'
    + ' universities.name_en AS university_name_en, universities.name_pt AS university_name_pt,'
    + ' universities.shortname_en AS university_shortname_en, universities.shortname_pt AS university_shortname_pt'
    + ' FROM departments'
    + ' JOIN schools ON schools.id = departments.school_id'
    + ' JOIN universities ON universities.id = schools.university_id;';
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            for (let ind in resQuery) {
                let department_en = resQuery[ind].department_name_en;
                let department_pt = resQuery[ind].department_name_pt;
                let school_en = resQuery[ind].school_name_en;
                let school_pt = resQuery[ind].school_name_pt;
                let school_short_en = resQuery[ind].school_shortname_en;
                let school_short_pt = resQuery[ind].school_shortname_pt;
                let university_en = resQuery[ind].school_name_en;
                let university_pt = resQuery[ind].school_name_pt;
                let university_short_en = resQuery[ind].university_shortname_en;
                let university_short_pt = resQuery[ind].university_shortname_pt;
                let str_department_en = '';
                let str_department_pt = '';
                let short_str_department_en = '';
                let short_str_department_pt = '';
                if (department_en !== null && department_en !== undefined) {
                    str_department_en = str_department_en + department_en;
                    if (school_en !== null && school_en !== undefined) {
                        str_department_en = str_department_en + ', ' + school_en;
                        if (university_en !== null && university_en !== undefined) {
                            str_department_en = str_department_en + ', ' + university_en;
                        }
                    } else {
                        str_department_en = str_department_en + ', ' + university_en;
                    }
                } else {
                    if (school_en !== null && school_en !== undefined) {
                        str_department_en = str_department_en + school_en;
                        if (university_en !== null && university_en !== undefined) {
                            str_department_en = str_department_en + ', ' + university_en;
                        }
                    } else {
                        str_department_en = str_department_en + university_en;
                    }
                }
                if (department_pt !== null && department_pt !== undefined) {
                    str_department_pt = str_department_pt + department_pt;
                    if (school_pt !== null && school_pt !== undefined) {
                        str_department_pt = str_department_pt + ', ' + school_pt;
                        if (university_pt !== null && university_pt !== undefined) {
                            str_department_pt = str_department_pt + ', ' + university_pt;
                        }
                    } else {
                        str_department_pt = str_department_pt + ', ' + university_pt;
                    }
                } else {
                    if (school_pt !== null && school_pt !== undefined) {
                        str_department_pt = str_department_pt + school_pt;
                        if (university_pt !== null && university_pt !== undefined) {
                            str_department_pt = str_department_pt + ', ' + university_pt;
                        }
                    } else {
                        str_department_pt = str_department_pt + university_pt;
                    }
                }
                if (department_en !== null && department_en !== undefined) {
                    short_str_department_en = short_str_department_en + department_en;
                    if (school_short_en !== null && school_short_en !== undefined) {
                        short_str_department_en = short_str_department_en + ', ' + school_short_en;
                        if (university_short_en !== null && university_short_en !== undefined) {
                            short_str_department_en = short_str_department_en + ', ' + university_short_en;
                        }
                    } else {
                        short_str_department_en = short_str_department_en + ', ' + university_short_en;
                    }
                } else {
                    if (school_short_en !== null && school_short_en !== undefined) {
                        short_str_department_en = short_str_department_en + school_short_en;
                        if (university_short_en !== null && university_short_en !== undefined) {
                            short_str_department_en = short_str_department_en + ', ' + university_short_en;
                        }
                    } else {
                        short_str_department_en = short_str_department_en + university_short_en;
                    }
                }
                if (department_pt !== null && department_pt !== undefined) {
                    short_str_department_pt = short_str_department_pt + department_pt;
                    if (school_short_pt !== null && school_short_pt !== undefined) {
                        short_str_department_pt = short_str_department_pt + ', ' + school_short_pt;
                        if (university_short_pt !== null && university_short_pt !== undefined) {
                            short_str_department_pt = short_str_department_pt + ', ' + university_short_pt;
                        }
                    } else {
                        short_str_department_pt = short_str_department_pt + ', ' + university_short_pt;
                    }
                } else {
                    if (school_short_pt !== null && school_short_pt !== undefined) {
                        short_str_department_pt = short_str_department_pt + school_short_pt;
                        if (university_short_pt !== null && university_short_pt !== undefined) {
                            short_str_department_pt = short_str_department_pt + ', ' + university_short_pt;
                        }
                    } else {
                        short_str_department_pt = short_str_department_pt + university_short_pt;
                    }
                }
                resQuery[ind].str_department_en = str_department_en;
                resQuery[ind].str_department_pt = str_department_pt;
                resQuery[ind].short_str_department_en = short_str_department_en;
                resQuery[ind].short_str_department_pt = short_str_department_pt;
            }
            options.i = 0;
            options.departments = resQuery;
            return getDepartmentLeaders(options);
        },
        options);
};
var getDepartmentLeaders = function (options) {
    let { req, res, next, i } = options;
    let department = options.departments[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT leaders_departments.*, people.name'
    + ' FROM leaders_departments'
    + ' JOIN people ON people.id = leaders_departments.person_id'
    + ' WHERE leaders_departments.department_id = ?;';
    places.push(department.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.departments[i].leaders = resQuery;
            if ( i + 1 < options.departments.length) {
                options.i = i + 1;
                return getDepartmentLeaders(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "result": options.departments,
                    }
                });
                return;
            }
        },
        options);
};
var getPersonalURLTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM personal_url_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getCostCenters = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM cost_centers;';
    sql.makeSQLOperation(req, res, querySQL, places);
    return
};
var getRequestMethods = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM endpoint_methods;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getResourceTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM resource_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getAppAreas = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM web_app_areas;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getDepartmentTeams = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM teams_department'
        + ' ORDER BY name ASC;'
        ;
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getLabs = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM labs;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getGroups = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM `groups`;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getUnits = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM units;';
    //places.push()
    let options = {
        req,
        res,
        next,
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.units = resQuery;
            options.i = 0;
            getUnitsGroups(options);
        },
        options);

};
var getUnitsGroups = function (options) {
    let { req, res, next, i } = options;
    let unit = options.units[i];
    var querySQL = '';
    var places = [];
    //+ ' groups_units.valid_from AS group_unit_valid_from, groups_units.valid_until AS group_unit_valid_until'
    querySQL = querySQL + 'SELECT DISTINCT `groups`.*'
                        + ' FROM groups_units'
                        + ' JOIN `groups` ON `groups`.id = groups_units.group_id'
                        + ' WHERE groups_units.unit_id = ?;';
    places.push(unit.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.units[i].groups = resQuery;
            options.j = 0;
            getUnitsGroupsLabs(options);
        },
        options);
};
var getUnitsGroupsLabs = function (options) {
    let { req, res, next, i, j } = options;
    let group = options.units[i].groups[j];
    var querySQL = '';
    var places = [];
    //+ ' groups_units.valid_from AS group_unit_valid_from, groups_units.valid_until AS group_unit_valid_until'
    querySQL = querySQL + 'SELECT DISTINCT labs.*'
                        + ' FROM labs_groups'
                        + ' JOIN labs ON labs.id = labs_groups.lab_id'
                        + ' WHERE labs_groups.group_id = ?;';
    places.push(group.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.units[i].groups[j].labs = resQuery;
            if (j + 1 < options.units[i].groups.length) {
                options.j = j + 1;
                getUnitsGroupsLabs(options);
            } else if (i + 1 < options.units.length) {
                options.i = i + 1;
                getUnitsGroups(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "result":  options.units,
                    }
                });
                return;
            }
        },
        options);
};
var getFacilities = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM technician_offices;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getScienceManagementOffices = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM science_manager_offices;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getAdministrativeOffices = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM administrative_offices;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getInstitutionCities = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM institution_city;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getDocumentTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM document_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getOpenCalls = function (req, res, next) {
    var querySQL = '';
    var places = [];
    if (req.originalUrl.includes('/laqv/')) {
        querySQL = querySQL + 'SELECT *'
                            + ' FROM call_applications'
                            + ' WHERE ('
                            + ' (valid_from IS NULL AND valid_until IS NULL)'
                            + ' OR (valid_from <= NOW() AND valid_until IS NULL)'
                            + ' OR (valid_from IS NULL AND valid_until >= NOW())'
                            + ' OR (valid_from <= NOW() AND valid_until >= NOW())'
                            + ')'
                            + ' AND is_laqv = 1;'
                            ;
    } else {
        querySQL = querySQL + 'SELECT *'
                            + ' FROM call_applications'
                            + ' WHERE ('
                            + ' (valid_from IS NULL AND valid_until IS NULL)'
                            + ' OR (valid_from <= NOW() AND valid_until IS NULL)'
                            + ' OR (valid_from IS NULL AND valid_until >= NOW())'
                            + ' OR (valid_from <= NOW() AND valid_until >= NOW())'
                            + ')'
                            + ' AND (is_laqv IS NULL OR is_laqv = 0);'
                            ;
    }
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getApplicationDegrees = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from application_academic_degree_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getProductTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from list_categories;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getProductUnits = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from quantity_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getProductStatus = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from stock_item_statuses;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getWarehouseCostCenters = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM cost_centers_orders;';
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.costCenters = resQuery;
            if (resQuery.length > 0) {
                options.i = 0;
                return getCostCenterAccounts(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "result":  [],
                    }
                });
                return;

            }
        },
        { req, res, next }
    );
};
var getCostCenterAccounts = function (options) {
    let { req, res, next, costCenters, i } = options;
    let costCenter = costCenters[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM accounts WHERE cost_center_id = ?;';
    places.push(costCenter.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            //options.req.body.data.posters[i].poster_id = resQuery.insertId;
            options.costCenters[i].accounts = resQuery;
            if (i + 1 < costCenters.length) {
                options.i = i + 1;
                return getCostCenterAccounts(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "result":  options.costCenters,
                    }
                });
                return;
            }
        },
        options);
};
var getWarehouseAccountsOnly = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from accounts;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getWarehouseAccountsRoles = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM account_roles;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getPollsTextTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM polls_text_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getPollsQuestionTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM polls_question_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getSpaceRoles = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM space_roles;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getSpaceTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM space_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getProjectTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM project_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getProjectCallTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM call_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getProjectPersonPositions = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM person_project_positions;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getCommunicationTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM communication_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getConferenceTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM conference_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getMeetingTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM meeting_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getPatentTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM patent_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getPatentStatusTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM patent_status;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getBoardTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM board_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getDatasetTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM data_set_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getContactTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM contact_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getPermissionLevels = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM permission_levels;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
var getEmailTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM email_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};

var getNews = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM news'
        + ' WHERE visible = 1'
        + ' AND (valid_from IS NULL OR valid_from <= NOW())'
        + ' AND (valid_until IS NULL OR valid_until >= NOW())'
        + ' ORDER BY published DESC;'
        ;
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};

module.exports.listItems = function (req, res, next) {
    let category = req.params.listCategory;
    if (category === 'countries') {
        getCountries(req, res, next);
    }
    if (category === 'degrees') {
        getDegrees(req, res, next);
    }
    if (category === 'lab-positions') {
        getLabPositions(req, res, next);
    }
    if (category === 'technician-positions') {
        getTechnicianPositions(req, res, next);
    }
    if (category === 'science-manager-positions') {
        getScienceManagerPositions(req, res, next);
    }
    if (category === 'administrative-positions') {
        getAdministrativePositions(req, res, next);
    }
    if (category === 'people-simple') {
        getPeopleSimple(req, res, next);
    }
    if (category === 'supervisors') {
        getSupervisors(req, res, next);
    }
    if (category === 'poles') {
        getPoles(req, res, next);
    }
    if (category === 'supervisor-types') {
        getSupervisorTypes(req, res, next);
    }
    if (category === 'responsible-types') {
        getResponsibleTypes(req, res, next);
    }
    if (category === 'roles') {
        getRoles(req, res, next);
    }
    if (category === 'situations-categories') {
        getSituations(req, res, next);
    }
    if (category === 'fellowship-types') {
        getFellowshipTypes(req, res, next);
    }
    if (category === 'management-entities') {
        getManagementEntities(req, res, next);
    }
    if (category === 'funding-agencies') {
        getFundingAgencies(req, res, next);
    }
    if (category === 'journals') {
        getJournalNames(req, res, next);
    }
    if (category === 'publication-sources') {
        getPublicationSources(req, res, next);
    }
    if (category === 'publication-types') {
        getPublicationTypes(req, res, next);
    }
    if (category === 'author-types') {
        getAuthorTypes(req, res, next);
    }
    if (category === 'institutional-repositories') {
        getInstitutionalRepositories(req, res, next);
    }
    if (category === 'card-types') {
        getCardTypes(req, res, next);
    }
    if (category === 'departments') {
        getDepartments(req, res, next);
    }
    if (category === 'cost-centers') {
        getCostCenters(req, res, next);
    }
    if (category === 'request-methods') {
        getRequestMethods(req, res, next);
    }
    if (category === 'resource-types') {
        getResourceTypes(req, res, next);
    }
    if (category === 'app-areas') {
        getAppAreas(req, res, next);
    }
    if (category === 'department-teams') {
        getDepartmentTeams(req, res, next);
    }
    if (category === 'labs') {
        getLabs(req, res, next);
    }
    if (category === 'groups') {
        getGroups(req, res, next);
    }
    if (category === 'units') {
        getUnits(req, res, next);
    }
    if (category === 'facilities') {
        getFacilities(req, res, next);
    }
    if (category === 'science-management-offices') {
        getScienceManagementOffices(req, res, next);
    }
    if (category === 'administrative-offices') {
        getAdministrativeOffices(req, res, next);
    }
    if (category === 'institution-cities') {
        getInstitutionCities(req, res, next);
    }
    if (category === 'document-types') {
        getDocumentTypes(req, res, next);
    }
    if (category === 'personal-url-types') {
        getPersonalURLTypes(req, res, next);
    }
    if (category === 'open-calls') {
        getOpenCalls(req, res, next);
    }
    if (category === 'application-degrees') {
        getApplicationDegrees(req, res, next);
    }
    if (category === 'warehouse-product-types') {
        getProductTypes(req, res, next);
    }
    if (category === 'warehouse-quantity-units') {
        getProductUnits(req, res, next);
    }
    if (category === 'warehouse-item-status') {
        getProductStatus(req, res, next);
    }
    if (category === 'warehouse-cost-centers') {
        getWarehouseCostCenters(req, res, next);
    }
    if (category === 'warehouse-accounts') {
        getWarehouseAccountsOnly(req, res, next);
    }
    if (category === 'warehouse-accounts-roles') {
        getWarehouseAccountsRoles(req, res, next);
    }
    if (category === 'polls-text-types') {
        getPollsTextTypes(req, res, next);
    }
    if (category === 'polls-question-types') {
        getPollsQuestionTypes(req, res, next);
    }
    if (category === 'space-roles') {
        getSpaceRoles(req, res, next);
    }
    if (category === 'space-types') {
        getSpaceTypes(req, res, next);
    }
    if (category === 'project-types') {
        getProjectTypes(req, res, next);
    }
    if (category === 'project-call-types') {
        getProjectCallTypes(req, res, next);
    }
    if (category === 'project-person-positions') {
        getProjectPersonPositions(req, res, next);
    }
    if (category === 'communication-types') {
        getCommunicationTypes(req, res, next);
    }
    if (category === 'conference-types') {
        getConferenceTypes(req, res, next);
    }
    if (category === 'meeting-types') { // by mistake I created 2 tables with the same data
        getMeetingTypes(req, res, next);
    }
    if (category === 'patent-types') {
        getPatentTypes(req, res, next);
    }
    if (category === 'patent-status-types') {
        getPatentStatusTypes(req, res, next);
    }
    if (category === 'board-types') {
        getBoardTypes(req, res, next);
    }
    if (category === 'dataset-types') {
        getDatasetTypes(req, res, next);
    }
    if (category === 'contact-types') {
        getContactTypes(req, res, next);
    }
    if (category === 'permission-levels') {
        getPermissionLevels(req, res, next);
    }
    if (category === 'email-types') {
        getEmailTypes(req, res, next);
    }
    if (category === 'news') {
        getNews(req, res, next);
    }
};

