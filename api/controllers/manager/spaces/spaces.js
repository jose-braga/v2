const sql = require('../../utilities/sql');
const time = require('../../utilities/time');
const responses = require('../../utilities/responses');
const permissions = require('../../utilities/permissions');

var actionGetSpacesList = function (options) {
    let { req, res, next } = options;
    //let today = time.moment().format('YYYY-MM-DD');

    let q = '%'
    //let limit = 10;
    //let offset = 0;
    let sortOrder = 'ASC';
    if (req.query.q !== undefined) {
        let qraw = req.query.q;
        q = '%' + qraw.replace(/\s/gi,'%') + '%'
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT spaces.*, space_types.name_en AS space_type_name_en'
        + ' FROM spaces'
        + ' LEFT JOIN space_types ON space_types.id = spaces.space_type_id'
        + ' LEFT JOIN teams_spaces ON teams_spaces.space_id = spaces.id'
        + ' LEFT JOIN teams_department ON teams_department.id = teams_spaces.team_id'
        + ' WHERE spaces.reference LIKE ?'
        +    ' OR spaces.short_reference LIKE ?'
        +    ' OR spaces.name_pt LIKE ?'
        +    ' OR spaces.name_en LIKE ?'
        +    ' OR teams_department.name LIKE ?'
        + ' ORDER BY `reference` ' + sortOrder;
    places.push(
        q, q, q, q, q
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.i = 0;
                options.spaces = resQuery;
                actionGetSpaceTeams(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 0,
                        "result": []
                    }
                });
                return;
            }
        },
        options);
};
var actionGetSpaceTeams = function (options) {
    let { req, res, next, spaces, i } = options;
    let space = spaces[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
            + 'SELECT teams_spaces.*, teams_department.name'
            + ' FROM teams_spaces'
            + ' JOIN teams_department ON teams_department.id = teams_spaces.team_id'
            + ' WHERE teams_spaces.space_id = ?';
    places.push(space.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.spaces[i].teams = resQuery;
            if (i + 1 < options.spaces.length) {
                options.i = i + 1;
                actionGetSpaceTeams(options);
            } else {
                options.i = 0;
                actionGetSpacePeople(options);
            }
        },
        options);
};
var actionGetSpacePeople = function (options) {
    let { req, res, next, spaces, i } = options;
    let space = spaces[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
            + 'SELECT users_spaces.*, people.name'
            + ' FROM users_spaces'
            + ' JOIN people ON people.id = users_spaces.person_id'
            + ' WHERE users_spaces.space_id = ?';
    places.push(space.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.spaces[i].people = resQuery;
            if (i + 1 < options.spaces.length) {
                options.i = i + 1;
                actionGetSpacePeople(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": options.spaces.length,
                        "result": options.spaces
                    }
                });
                return;
            }
        },
        options);
};
module.exports.getSpacesList = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetSpacesList(options) },
        { req, res, next }
    );
};

var actionUpdateSpaceData = function (options) {
    let { req, res, next } = options;
    let spaceID = req.params.spaceID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    // don't forget to add fractions if that is important
    querySQL = querySQL
            + 'UPDATE spaces'
            + ' SET space_type_id = ?,'
            + ' reference = ?,'
            + ' short_reference = ?,'
            + ' name_pt = ?,'
            + ' name_en = ?,'
            + ' area = ?,'
            + ' valid_from = ?,'
            + ' valid_until = ?'
            + ' WHERE id = ?';
    places.push(
        data.space_type_id,
        data.reference,
        data.short_reference,
        data.name_pt,
        data.name_en,
        data.area,
        data.valid_from,
        data.valid_until,
        spaceID
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateSpaceData = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateSpaceData(options) },
        { req, res, next }
    );
};

var actionCreateSpaceTeam = function (options) {
    let { req, res, next } = options;
    let spaceID = req.params.spaceID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    // don't forget to add fractions if that is important
    querySQL = querySQL
            + 'INSERT INTO teams_spaces'
            + ' (space_id, team_id, percentage, valid_from, valid_until)'
            + ' VALUES (?, ?, ?, ?, ?)'

    places.push(
        spaceID,
        data.team_id,
        data.percentage,
        data.valid_from,
        data.valid_until
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createSpaceTeam = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateSpaceTeam(options) },
        { req, res, next }
    );
};

var actionUpdateSpaceTeam = function (options) {
    let { req, res, next } = options;
    let spaceTeamID = req.params.spaceTeamID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    // don't forget to add fractions if that is important
    querySQL = querySQL
            + 'UPDATE teams_spaces'
            + ' SET team_id = ?,'
            + ' percentage = ?,'
            + ' valid_from = ?,'
            + ' valid_until = ?'
            + ' WHERE id = ?';
    places.push(
        data.team_id,
        data.percentage,
        data.valid_from,
        data.valid_until,
        spaceTeamID
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateSpaceTeam = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateSpaceTeam(options) },
        { req, res, next }
    );
};

var actionDeleteSpaceTeam = function (options) {
    let { req, res, next } = options;
    let spaceTeamID = req.params.spaceTeamID;
    var querySQL = '';
    var places = [];
    // don't forget to add fractions if that is important
    querySQL = querySQL
            + 'DELETE FROM teams_spaces WHERE id = ?;';
    places.push(spaceTeamID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.deleteSpaceTeam = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteSpaceTeam(options) },
        { req, res, next }
    );
};

var actionCreateSpacePerson = function (options) {
    let { req, res, next } = options;
    let spaceID = req.params.spaceID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    // don't forget to add fractions if that is important
    querySQL = querySQL
            + 'INSERT INTO users_spaces'
            + ' (space_id, person_id, role_id, valid_from, valid_until, comments)'
            + ' VALUES (?,?,?,?,?,?)'

    places.push(
        spaceID,
        data.person_id,
        data.role_id,
        data.valid_from,
        data.valid_until,
        data.comments
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createSpacePerson = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateSpacePerson(options) },
        { req, res, next }
    );
};
var actionUpdateSpacePerson = function (options) {
    let { req, res, next } = options;
    let spacePersonID = req.params.spacePersonID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    // don't forget to add fractions if that is important
    querySQL = querySQL
            + 'UPDATE users_spaces'
            + ' SET person_id = ?,'
            + ' role_id = ?,'
            + ' valid_from = ?,'
            + ' valid_until = ?,'
            + ' comments = ?'
            + ' WHERE id = ?;';
    places.push(
        data.person_id,
        data.role_id,
        data.valid_from,
        data.valid_until,
        data.comments,
        spacePersonID
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateSpacePerson = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateSpacePerson(options) },
        { req, res, next }
    );
};
var actionDeleteSpacePerson = function (options) {
    let { req, res, next } = options;
    let spacePersonID = req.params.spacePersonID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
            + 'DELETE FROM users_spaces WHERE id = ?;';
    places.push(spacePersonID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.deleteSpacePerson = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteSpacePerson(options) },
        { req, res, next }
    );
};