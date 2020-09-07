const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');

/*
if (i + 1 < people.length) {
                options.i = i + 1;
                return getEmail(options);
            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": people.length,
                        "result": options.people
                    });
                return;
            }
*/


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
    querySQL = 'SELECT phone, extension from phones WHERE person_id = ?;';
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
}

module.exports.searchPeople = function (req, res, next) {
    let names = [];
    let lab = null;
    if (req.query.hasOwnProperty('name')) {
        names = req.query.name.split(' ');
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
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
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
};

module.exports.getPersonPublications = function (req, res, next) {

};