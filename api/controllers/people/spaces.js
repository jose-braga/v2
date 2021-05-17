const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
var time = require('../utilities/time');

function checkDatesOverlap(from1, until1, from2, until2) {
    // assume only dates are received in ISO8601 format, or with null value
    // also assume from1 < until1 && from2 < until2 (when not null)
    if (from1 === null && until1 === null) {
        return [from2, until2];
    } else if (from2 === null && until2 === null) {
        return [from1, until1];
    } else if (from1 !== null && until1 === null) {
        if (from2 !== null && until2 === null) {
            if (from1 < from2) {
                return [from2, null];
            } else {
                return [from1, null];
            }
        } else if (from2 === null && until2 !== null) {
            if (until2 > from1) {
                return [from1, until2];
            } else {
                return false;
            }
        } else if (from2 !== null && until2 !== null) {
            if (until2 < from1) {
                return false;
            } else if (from2 < from1) {
                return [from1, until2];
            } else {
                return [from2, until2];
            }
        }
    } else if (from1 === null && until1 !== null) {
        if (from2 !== null && until2 === null) {
            if (from2 > until1) {
                return false;
            } else {
                return [from2, until1];
            }
        } else if (from2 === null && until2 !== null) {
            if (until1 < until2) {
                return [null, until1];
            } else {
                return [null, until2];
            }
        } else if (from2 !== null && until2 !== null) {
            if (from2 > until1) {
                return false;
            } else if (until2 < until1) {
                return [from2, until2];
            } else {
                return [from2, until1];
            }
        }
    } else if (from1 !== null && until1 !== null) {
        if (from2 !== null && until2 === null) {
            if (from2 > until1) {
                return false;
            } else if (from2 > from1) {
                return [from2, until1];
            } else {
                return [from1, until1];
            }
        } else if (from2 === null && until2 !== null) {
            if (until2 < from1) {
                return false;
            } else if (until2 < until1) {
                return [from1, until2]
            } else {
                return [from1, until1]
            }
        } else if (from2 !== null && until2 !== null) {
            if (from2 >= until1 || until2 <= from1)
            {
                return false
            } else if (from2 < from1 && until2 < until1) {
                return [from1, until2];
            } else if (from2 < from1 && until2 >= until1) {
                return [from1, until1];
            } else if (from2 >= from1 && until2 < until1) {
                return [from2, until2];
            } else if (from2 >= from1 && until2 >= until1) {
                return [from2, until1];
            }
        }
    }
}

var combo = function(a, min, max) {
    min = min || 1;
    max = max < a.length ? max : a.length;
    var fn = function(n, src, got, all) {
      if (n == 0) {
        if (got.length > 0) {
          all[all.length] = got;
        }
        return;
      }
      for (var j = 0; j < src.length; j++) {
        fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
      }
      return;
    }
    var all = [];
    for (var i = min; i < a.length; i++) {
      fn(i, a, [], all);
    }
    if(a.length == max) all.push(a);
    return all;
};

/* TODO: Implement actionGetSpaceDataManagers*/
module.exports.getSpaceDataManagers = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetSpaceDataManagers(options) },
        { req, res, next }
    );
};


var actionGetAllSpaces = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT spaces.*,'
        + ' space_types.name_en AS space_type_name_en, space_types.name_pt AS space_type_name_pt'
        + ' FROM spaces'
        + ' LEFT JOIN space_types ON space_types.id = spaces.space_type_id'
        + ' ORDER BY reference ASC'
        ;
    //places.push()
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.getAllSpaces = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetAllSpaces(options) },
        { req, res, next }
    );
};

var actionGetPersonSpaces = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT users_spaces.person_id, users_spaces.space_id,'
        + ' spaces.reference, spaces.short_reference,'
        + ' spaces.name_en AS space_name_en, spaces.name_pt AS space_name_pt,'
        + ' spaces.space_type_id,'
        + ' space_types.name_en AS space_type_name_en, space_types.name_pt AS space_type_name_pt'
        + ' FROM users_spaces'
        + ' LEFT JOIN spaces ON spaces.id = users_spaces.space_id'
        + ' LEFT JOIN space_types ON space_types.id = spaces.space_type_id'
        + ' WHERE users_spaces.person_id = ?'
        + ' ORDER BY reference ASC'
        ;
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.i = 0;
                options.spaces = resQuery;
                return getPersonSpaceRoles(options);
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
        options
    )
};
var getPersonSpaceRoles = function (options) {
    let { req, res, next, spaces, i } = options;
    let personID = req.params.personID;
    let space = spaces[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT users_spaces.*,'
        + ' space_roles.name_en AS space_role_name_en, space_roles.name_pt AS space_role_name_pt'
        + ' FROM users_spaces'
        + ' LEFT JOIN space_roles ON space_roles.id = users_spaces.role_id'
        + ' WHERE users_spaces.person_id = ? AND users_spaces.space_id = ?'
        ;
    places.push(personID, space.space_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.spaces[i].roles = resQuery
            if (i + 1 < options.spaces.length) {
                options.i = i + 1;
                return getPersonSpaceRoles(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": spaces.length,
                        "result": options.spaces
                    }
                });
                return;
            }
        },
        options
    )
};
module.exports.getPersonSpaces = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPersonSpaces(options) },
        { req, res, next }
    );
};

var actionAddPersonSpaces = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO users_spaces (person_id, space_id, role_id, valid_from, valid_until)'
        + ' VALUES (?,?,?,?,?);'
        ;
    places.push(personID,
        data.space_id,
        data.role_id,
        data.valid_from,
        data.valid_until
    )
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.addPersonSpaces = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionAddPersonSpaces(options) },
        { req, res, next }
    );
};
var actionAddPersonRoles = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let spaceID = req.params.spaceID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO users_spaces (person_id, space_id, role_id, valid_from, valid_until)'
        + ' VALUES (?,?,?,?,?);'
        ;
    places.push(personID,
        spaceID,
        data.role_id,
        data.valid_from,
        data.valid_until
    )
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.addPersonRoles = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionAddPersonRoles(options) },
        { req, res, next }
    );
};
var actionUpdatePersonRoles = function (options) {
    let { req, res, next } = options;
    let userRoleID = req.params.roleID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE users_spaces'
        + ' SET role_id = ?,'
        + ' valid_from = ?,'
        + ' valid_until = ?'
        + ' WHERE id = ?;'
        ;
    places.push(
        data.role_id,
        data.valid_from,
        data.valid_until,
        userRoleID
    );
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updatePersonRoles = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdatePersonRoles(options) },
        { req, res, next }
    );
};
var actionDeletePersonRoles = function (options) {
    let { req, res, next } = options;
    let userRoleID = req.params.roleID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM users_spaces WHERE id = ?;'
        ;
    places.push(userRoleID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.deletePersonRoles = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeletePersonRoles(options) },
        { req, res, next }
    );
};


var actionGetManagerSpaces = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT supervisors_spaces.*,'
        + ' spaces.area, spaces.reference, spaces.short_reference,'
        + ' spaces.name_en AS space_name_en, spaces.name_pt AS space_name_pt,'
        + ' spaces.space_type_id,'
        + ' space_types.name_en AS space_type_name_en, space_types.name_pt AS space_type_name_pt'
        + ' FROM supervisors_spaces'
        + ' LEFT JOIN spaces ON spaces.id = supervisors_spaces.space_id'
        + ' LEFT JOIN space_types ON space_types.id = spaces.space_type_id'
        + ' WHERE supervisors_spaces.person_id = ?'
        + ' ORDER BY reference ASC'
        ;
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.getManagerSpaces = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetManagerSpaces(options) },
        { req, res, next }
    );
};

var getSpacePercentages = function (options, callback) {
    let { req, res, next } = options;
    let spaceID = req.params.spaceID; // maybe no route will use this
    let data;
    if (spaceID === undefined) {
        data = req.body.data
        spaceID = data.space_id;
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT id AS lab_space_id, NULL AS supervisor_space_id, lab_id, NULL AS person_id, space_id, percentage, valid_from, valid_until'
        + ' FROM labs_spaces'
        + ' WHERE space_id = ?'
        + ' UNION'
        + ' SELECT NULL AS lab_space_id, id AS supervisor_space_id, NULL AS lab_id, person_id, space_id, percentage, valid_from, valid_until'
        + ' FROM supervisors_spaces'
        + ' WHERE space_id = ?'
        ;
    places.push(spaceID, spaceID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.space = resQuery;
            return callback(options);
        },
        options);
};
var actionAddManagerSpaces = function (options) {
    let { req, res, next, space } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    // get all entries from this space that overlap with the dates to be added;
    let combinationsSpace
    let max_sum_percentage = 0;
    if (space.length > 0) {
        combinationsSpace = combo(space);
        max_sum_percentage = 0;
        for (let i = 0; i < combinationsSpace.length; i++) {
            let sum_percentage = parseFloat(data.percentage);
            let valid_from = null;
            let valid_until = null;
            if (combinationsSpace[i][0].valid_from !== null) {
                valid_from = time.momentToDate(combinationsSpace[i][0].valid_from)
            }
            if (combinationsSpace[i][0].valid_until !== null) {
                valid_until = time.momentToDate(combinationsSpace[i][0].valid_until)
            }
            let overlap = checkDatesOverlap(data.valid_from, data.valid_until,
                valid_from, valid_until)
            if (overlap !== false) {
                sum_percentage = sum_percentage + parseFloat(combinationsSpace[i][0].percentage);
                for (let j = 1; j < combinationsSpace[i].length; j++) {
                    valid_from = null;
                    valid_until = null;
                    if (combinationsSpace[i][j].valid_from !== null) {
                        valid_from = time.momentToDate(combinationsSpace[i][j].valid_from)
                    }
                    if (combinationsSpace[i][j].valid_until !== null) {
                        valid_until = time.momentToDate(combinationsSpace[i][j].valid_until)
                    }
                    let new_overlap = checkDatesOverlap(overlap[0], overlap[1],
                        valid_from, valid_until)
                    if (new_overlap !== false) {
                        sum_percentage = sum_percentage + parseFloat(combinationsSpace[i][j].percentage);
                        overlap = new_overlap;
                    }
                }
                if (sum_percentage > max_sum_percentage) {
                    max_sum_percentage = sum_percentage;
                }
            } else {
                if (sum_percentage > max_sum_percentage) {
                    max_sum_percentage = sum_percentage;
                }
            }
        }
    } else {
        max_sum_percentage = data.percentage;
    }
    if (max_sum_percentage <= 100) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL
            + 'INSERT INTO supervisors_spaces'
            + ' (person_id, space_id, percentage, valid_from, valid_until)'
            + ' VALUES (?, ?, ?, ?, ?);'
            ;
        places.push(personID,
            data.space_id,
            data.percentage,
            data.valid_from,
            data.valid_until
        )
        return sql.makeSQLOperation(req, res, querySQL, places);
    } else {
        return responses.sendJSONResponseOptions({
            response: res,
            status: 403,
            message: {
                "status": "error", "statusCode": 403,
                "message": "Not allowed. The sum of occupation percentages for this lab would exceed 100%."
            }
        });
    }

};
module.exports.addManagerSpaces = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { getSpacePercentages(options, actionAddManagerSpaces) },
        { req, res, next }
    );
};

var actionUpdateManagerSpace = function (options) {
    let { req, res, next, space } = options;
    let labID = req.params.labID;
    let data = req.body.data;
    if (data.valid_from === '') {
        data.valid_from = null;
    }
    if (data.valid_until === '') {
        data.valid_until = null;
    }
    // get all entries from this space that overlap with the dates to be added;
    let combinationsSpace
    let max_sum_percentage = 0;
    for (let ind in space) {
        // remove the lab-space row you are going to update
        if (space[ind].lab_space_id === data.id) {
            space.splice(ind, 1);
            break
        }
    }
    if (space.length > 0) {
        combinationsSpace = combo(space);
        max_sum_percentage = 0;
        for (let i = 0; i < combinationsSpace.length; i++) {
            let sum_percentage = parseFloat(data.percentage);
            let valid_from = null;
            let valid_until = null;
            if (combinationsSpace[i][0].valid_from !== null) {
                valid_from = time.momentToDate(combinationsSpace[i][0].valid_from)
            }
            if (combinationsSpace[i][0].valid_until !== null) {
                valid_until = time.momentToDate(combinationsSpace[i][0].valid_until)
            }
            let overlap = checkDatesOverlap(data.valid_from, data.valid_until,
                valid_from, valid_until)
            if (overlap !== false) {
                sum_percentage = sum_percentage + parseFloat(combinationsSpace[i][0].percentage);
                for (let j = 1; j < combinationsSpace[i].length; j++) {
                    valid_from = null;
                    valid_until = null;
                    if (combinationsSpace[i][j].valid_from !== null) {
                        valid_from = time.momentToDate(combinationsSpace[i][j].valid_from)
                    }
                    if (combinationsSpace[i][j].valid_until !== null) {
                        valid_until = time.momentToDate(combinationsSpace[i][j].valid_until)
                    }
                    let new_overlap = checkDatesOverlap(overlap[0], overlap[1],
                        valid_from, valid_until)
                    if (new_overlap !== false) {
                        sum_percentage = sum_percentage + parseFloat(combinationsSpace[i][j].percentage);
                        overlap = new_overlap;
                    }
                }
                if (sum_percentage > max_sum_percentage) {
                    max_sum_percentage = sum_percentage;
                }
            } else {
                if (sum_percentage > max_sum_percentage) {
                    max_sum_percentage = sum_percentage;
                }
            }
        }
    } else {
        max_sum_percentage = data.percentage;
    }
    if (max_sum_percentage <= 100) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL
            + 'UPDATE supervisors_spaces'
            + ' SET percentage = ?,'
            + ' valid_from = ?,'
            + ' valid_until = ?'
            + ' WHERE id = ?'
            ;
        places.push(
            data.percentage,
            data.valid_from,
            data.valid_until,
            data.id
        );
        return sql.makeSQLOperation(req, res, querySQL, places);
    } else {
        return responses.sendJSONResponseOptions({
            response: res,
            status: 403,
            message: {
                "status": "error", "statusCode": 403,
                "message": "Not allowed. The sum of occupation percentages for this lab would exceed 100%."
            }
        });
    }
};
module.exports.updateManagerSpace = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { getSpacePercentages(options, actionUpdateManagerSpace) },
        { req, res, next }
    );
};

var actionDeleteManagerSpace = function (options) {
    let { req, res, next } = options;
    let supervisorSpaceID = req.params.supervisorSpaceID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM supervisors_spaces WHERE id = ?'
        ;
    places.push(supervisorSpaceID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.deleteManagerSpace = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteManagerSpace(options) },
        { req, res, next }
    );
};

var actionGetSpaceInfo = function (options) {
    let { req, res, next } = options;
    let spaceID = req.params.spaceID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT spaces.area, spaces.reference, spaces.short_reference,'
        + ' spaces.name_en AS space_name_en, spaces.name_pt AS space_name_pt,'
        + ' spaces.space_type_id,'
        + ' space_types.name_en AS space_type_name_en, space_types.name_pt AS space_type_name_pt'
        + ' FROM spaces'
        + ' LEFT JOIN space_types ON space_types.id = spaces.space_type_id'
        + ' WHERE spaces.id = ?'
        ;
    places.push(spaceID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.space = resQuery[0];
                return getLabsAssociatedToSpace(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 403,
                    message: {
                        "status": "error", "statusCode": 403,
                        "message": "There was a problema with your request."
                    }
                });
            }

        },
        options);
};
var getLabsAssociatedToSpace = function (options) {
    let { req, res, next, space } = options;
    let spaceID = req.params.spaceID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT labs_spaces.*, labs.name'
        + ' FROM labs_spaces'
        + ' JOIN labs ON labs.id = labs_spaces.lab_id'
        + ' WHERE labs_spaces.space_id = ?'
        ;
    places.push(spaceID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.space.labs = resQuery;
            if ( resQuery.length > 0) {
                options.i = 0;
                return getLabLeaderFromLabsAssociatedToSpace(options);
            } else {
                return getManagersAssociatedToSpace(options);
            }

        },
        options);
};
var getLabLeaderFromLabsAssociatedToSpace = function (options) {
    let { req, res, next, space, i } = options;
    let lab = space.labs[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_labs.person_id, people.name, people.colloquial_name '
        + ' FROM people_labs'
        + ' JOIN people ON people.id = people_labs.person_id'
        + ' WHERE people_labs.lab_id = ?'
        + ' AND (people_labs.lab_position_id = 2 OR people_labs.lab_position_id = 11)';
        ;
    places.push(lab.lab_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.space.labs[i].leaders = resQuery;
            if (i + 1 < options.space.labs.length) {
                options.i = i + 1;
                return getLabLeaderFromLabsAssociatedToSpace(options);
            } else {
                return getManagersAssociatedToSpace(options);
            }
        },
        options);
};
var getManagersAssociatedToSpace = function (options) {
    let { req, res, next, space } = options;
    let spaceID = req.params.spaceID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT supervisors_spaces.*, people.name, people.colloquial_name'
        + ' FROM supervisors_spaces'
        + ' JOIN people ON people.id = supervisors_spaces.person_id'
        + ' WHERE supervisors_spaces.space_id = ?'
        ;
    places.push(spaceID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.space.supervisors = resQuery;
            if (resQuery.length > 0) {
                options.i = 0;
                return getLabsFromManagersAssociatedToSpace(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "count": 1,
                        "result": options.space,
                    }
                });
            }
        },
        options);
}
var getLabsFromManagersAssociatedToSpace = function (options) {
    let { req, res, next, space, i } = options;
    let supervisor = space.supervisors[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT people_labs.lab_id, labs.name'
        + ' FROM people_labs'
        + ' JOIN labs ON labs.id = people_labs.lab_id'
        + ' WHERE people_labs.person_id = ? AND labs.finished IS NULL';
        ;
    places.push(supervisor.person_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.space.supervisors[i].labs = resQuery;
            if (i + 1 < options.space.supervisors.length) {
                options.i = i + 1;
                return getLabsFromManagersAssociatedToSpace(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "count": 1,
                        "result": options.space,
                    }
                });
            }
        },
        options);
};
module.exports.getSpaceInfo = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetSpaceInfo(options) },
        { req, res, next }
    );
};