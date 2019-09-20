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
    if (category === 'people') {
        getPeopleSimple(req, res, next);
    }
    if (category === 'supervisor-types') {
        getSupervisorTypes(req, res, next);
    }
};

