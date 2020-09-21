
const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const notifications = require('../utilities/notifications');

var actionGetNationalities = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_countries.id AS people_countries_id,'
        + ' people_countries.person_id, countries.id, countries.name'
        + ' FROM people_countries'
        + ' LEFT JOIN countries ON countries.id = people_countries.country_id'
        + ' WHERE people_countries.person_id = ?;';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.getNationalities = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetNationalities(options) },
        { req, res, next }
    );
};

var updateNationalities = function (options) {
    let {req, res, next, i} = options;
    let update = req.body.data.update;
    let create = req.body.data.create;
    let trash = req.body.data.trash;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE people_countries'
                        + ' SET country_id = ?'
                        + ' WHERE id = ?;';
    places.push(
        update[i].id,
        update[i].people_countries_id);
    if (i + 1 < update.length) {
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => { updateNationalities(options) },
            {req, res, next, i: i + 1}
        );

    } else if (create.length > 0) {
        let optionsCreate = { req, res, next, i: 0 };
        return createNationalities(optionsCreate);
    } else if (trash.length > 0) {
        let optionsDelete = { req, res, next, i: 0 };
        return deleteNationalities(optionsDelete);
    } else {
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => { responses.sendJSONResponseOptions(options)},
            {
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200, "count": 0,
                    "result": "OK - Update!"
                }
            })
    }
};
var createNationalities = function (options) {
    let { req, res, next, i } = options;
    let personID = req.params.personID;
    let create = req.body.data.create;
    let trash = req.body.data.trash;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO people_countries'
                        +  '(person_id, country_id)'
                        + ' VALUES (?, ?);';
    places.push(
        personID,
        create[i].id);
    if (i + 1 < create.length) {
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => { createNationalities(options) },
            { req, res, next, i: i + 1 }
        );
    } else if (trash.length > 0) {
        let optionsDelete = { req, res, next, i: 0 };
        return deleteNationalities(optionsDelete);
    } else {
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => { responses.sendJSONResponseOptions(options) },
            {
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200, "count": 0,
                    "result": "OK - Create!"
                }
            })
    }
};

var deleteNationalities = function (options) {
    let { req, res, next, i } = options;
    let trash = req.body.data.trash;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM people_countries WHERE id = ?;';
    places.push(trash[i].people_countries_id);
    if (i + 1 < trash.length) {
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => { deleteNationalities(options) },
            { req, res, next, i: i + 1 }
        );
    } else {
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => { responses.sendJSONResponseOptions(options) },
            {
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200, "count": 0,
                    "result": "OK - Delete!"
                }
            })
    }
};

var actionUpdateNationalities = function (options) {
    let { req, res, next } = options;
    let update = req.body.data.update;
    let create = req.body.data.create;
    let trash = req.body.data.trash;
    options.i = 0;
    if (update.length > 0) {
        return updateNationalities(options);
    } else if (create.length > 0) {
        return createNationalities(options);
    } else if (trash.length > 0) {
        return deleteNationalities(options);
    } else {
        responses.sendJSONResponse(res, 200,
            {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "No changes!"
            });
        return;
    }
};

module.exports.changeNationalities = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateNationalities(options) },
        { req, res, next }
    );
};

var actionGetNuclearInfo = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from people WHERE id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.getNuclearInfo = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetNuclearInfo(options) },
        { req, res, next }
    );
};

var actionAddPeopleHistory = function (options) {
    let { req, res, next, data, personID } = options;
    let now = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO people_history'
                        + ' (person_id, name, colloquial_name, birth_date, gender, updated, operation, changed_by)'
                        + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?);';
    places.push(
        personID,
        data.name,
        data.colloquial_name,
        data.birth_date,
        data.gender,
        now,
        'U',
        req.payload.userID
        );
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "OK - Created people history entry!"
            }
        });
};

var actionUpdateNuclearInfo = function(options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    if (data.birth_date === '') {
        data.birth_date = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE people'
        + ' SET name = ?,'
        + ' colloquial_name = ?,'
        + ' birth_date = ?,'
        + ' gender = ?'
        + ' WHERE id = ?;';
    places.push(
        data.name,
        data.colloquial_name,
        data.birth_date,
        data.gender,
        personID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => { actionAddPeopleHistory(options) },
        { req, res, next, data, personID });
};

module.exports.updateNuclearInfo = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateNuclearInfo(options) },
        { req, res, next }
    );
};


/* TODO:
    // when changing to X DevAPI
    pool.getSession()
        .then(session => {
            return session.getSchema(process.env.DB_DB)
                .getTable('people')
                .select()
                .where('name LIKE :name')
                .bind('name', '%Romão%')
                .execute()
                ;
        })
        .then((result) => {
            console.log(result)
            sendJSONResponse(res, 200,
                {
                    "status": "success", "statusCode": 200, "message": "Fixe!"
                });

        })
        .catch((err) => {
            console.log(err)
        });

    return;
*/