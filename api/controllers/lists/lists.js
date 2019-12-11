const sql = require('../utilities/sql')

// Alphabetically ordered
var getCountries = function(req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from countries;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
}
var getDegrees = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from degrees;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
}
var getPeopleSimple = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT id, colloquial_name FROM people'
                        + ' WHERE status = 1;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
}
var getPoles = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM institution_city';
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
}
var getLabPositions = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM lab_positions ORDER BY sort_order ASC;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
}
var getRoles = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT roles.id AS role_id, roles.name_en, roles.name_pt'
                        + ' FROM roles';
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
}
var getSupervisorTypes = function (req, res, next) {
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from supervisor_types;';
    //places.push()
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
}

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
};

