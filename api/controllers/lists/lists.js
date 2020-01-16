const sql = require('../utilities/sql')
const responses = require('../utilities/responses');

// Alphabetically ordered
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
    querySQL = querySQL + 'SELECT id, colloquial_name FROM people'
                        + ' WHERE status = 1;';
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
var getSituations = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from situations;';
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
    querySQL = querySQL + 'SELECT * from categories;';
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
    if (category === 'people') {
        getPeopleSimple(req, res, next);
    }
    if (category === 'poles') {
        getPoles(req, res, next);
    }
    if (category === 'supervisor-types') {
        getSupervisorTypes(req, res, next);
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
};

