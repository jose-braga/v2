var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var server = require('./mysql_connection');
var pool = server.pool;
var jwtUtils = require('./jwt_utilities');
var time = require('../controllers/utilities/time');

function makeEndpointURL(data) {
    let permissions = [];
    for (let ind in data) {
        let url = '';
        // resource1 exists always
        if (data[ind].resource1_resource_id_generic === 1) {
            url = '/' + data[ind].resource1_type_name + '/' + '*';
        } else if (data[ind].resource1_resource_id_generic === null
                || data[ind].resource1_resource_id_generic === undefined) {
            url = '/' + data[ind].resource1_type_name;
            data[ind].endpoint_url = url;
            continue
        } else {
            url = '/' + data[ind].resource1_type_name + '/' + data[ind].resource1_id;
        }
        if (data[ind].resource2_type_name !== null && data[ind].resource2_type_name !== undefined)  {
            if (data[ind].resource2_resource_id_generic === 1) {
                url = url + '/' + data[ind].resource2_type_name + '/' + '*';
            } else if (data[ind].resource2_resource_id_generic === null
                || data[ind].resource2_resource_id_generic === undefined) {
                url = url + '/' + data[ind].resource2_type_name;
                data[ind].endpoint_url = url;
                continue
            } else {
                url = url + '/' + data[ind].resource2_type_name + '/' + data[ind].resource2_id;
            }
        } else {
            data[ind].endpoint_url = url;
            continue;
        }
        if (data[ind].resource3_type_name !== null && data[ind].resource3_type_name !== undefined) {
            if (data[ind].resource3_resource_id_generic === 1) {
                url = url + '/' + data[ind].resource3_type_name + '/' + '*';
            } else if (data[ind].resource3_resource_id_generic === null
                || data[ind].resource3_resource_id_generic === undefined) {
                url = url + '/' + data[ind].resource3_type_name;
                data[ind].endpoint_url = url;
                continue
            } else {
                url = url + '/' + data[ind].resource3_type_name + '/' + data[ind].resource3_id;
            }
        } else {
            data[ind].endpoint_url = url;
            continue;
        }
        if (data[ind].resource4_type_name !== null && data[ind].resource4_type_name !== undefined) {
            if (data[ind].resource4_resource_id_generic === 1) {
                url = url + '/' + data[ind].resource4_type_name + '/' + '*';
            } else if (data[ind].resource4_resource_id_generic === null
                || data[ind].resource4_resource_id_generic === undefined) {
                url = url + '/' + data[ind].resource4_type_name;
                data[ind].endpoint_url = url;
                continue
            } else {
                url = url + '/' + data[ind].resource4_type_name + '/' + data[ind].resource4_id;
            }
        } else {
            data[ind].endpoint_url = url;
            continue;
        }
    }
    for (let ind in data) {
        permissions.push(
            {
                method_name: data[ind].method_name,
                endpoint_url: data[ind].endpoint_url,
                allow_all_subpaths: data[ind].allow_all_subpaths,
            }
        )
    }
    return permissions;
}
function processLabsGroupsUnitsData(user, labs) {
    let today = time.moment();
    let current_units = [];
    let used_current_units = [];
    for (let ind in labs) {
        if (time.moment(labs[ind].valid_from).isBefore(today)
            || labs[ind].valid_from === null) {
            if (time.moment(labs[ind].valid_until).isAfter(today)
                    || labs[ind].valid_until === null) {
                for (let indGroup in labs[ind].groups) {
                    for (let indUnit in labs[ind].groups[indGroup].units) {
                        // the unit must exist now
                        if (time.moment(labs[ind].groups[indGroup].units[indUnit].started).isBefore(today)
                            || labs[ind].groups[indGroup].units[indUnit].started === null) {
                            if (time.moment(labs[ind].groups[indGroup].units[indUnit].finished).isAfter(today)
                                || labs[ind].groups[indGroup].units[indUnit].finished === null) {
                                if (used_current_units.indexOf(labs[ind].groups[indGroup].units[indUnit].id) === -1) {
                                    current_units.push(labs[ind].groups[indGroup].units[indUnit].id);
                                    used_current_units.push(labs[ind].groups[indGroup].units[indUnit].id);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    user.current_units = current_units;
    user.labs = labs;
    return user;
}
function processNonResearcherUnitsData(user, offices) {
    let today = time.moment();
    let current_units = [];
    let used_current_units = [];
    for (let ind in offices) {
        if (time.moment(offices[ind].valid_from).isBefore(today)
            || offices[ind].valid_from === null) {
            if (time.moment(offices[ind].valid_until).isAfter(today)
                    || offices[ind].valid_until === null) {
                for (let indUnit in offices[ind].units) {
                    if (used_current_units.indexOf(offices[ind].units[indUnit].id) === -1) {
                        current_units.push(offices[ind].units[indUnit].id);
                        used_current_units.push(offices[ind].units[indUnit].id);
                    }
                }
            }
        }
    }
    // the unlikely case that a user has a simultaneous role as researcher
    // and non-researcher (user.current_units holds the units found as a researcher)
    if (user.current_units !== undefined && user.current_units.length > 0) {
        for (let indUnit in user.current_units) {
            if (used_current_units.indexOf(user.current_units[indUnit]) === -1) {
                current_units.push(user.current_units[indUnit]);
                used_current_units.push(user.current_units[indUnit]);
            }
        }
    }
    user.current_units = current_units;
    return user;
}

passport.use(
    'local-login',
    new LocalStrategy({
        // by default, local strategy uses username and password
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, username, password, done) {
        var query =
            'SELECT users.id AS user_id, users.username, users.password,' +
            ' users.permission_level_id AS permissions_level,' +
            ' people.id as person_id, people.name AS person_name' +
            ' FROM users' +
            ' LEFT JOIN people ON people.user_id = users.id' +
            ' WHERE users.username = ? AND users.deactivated = 0 AND people.status = 1;';
        var places = [username];
        pool.getConnection(function (err, connection) {
            if (err) {
                return done(err);
            }
            connection.query(query, places,
                function (err, rows) {
                    // And done with the connection.
                    connection.release();
                    if (err) {
                        return done(err);
                    }
                    if (rows.length < 1) {
                        return done(null, false, { message: 'Incorrect username or password.' });
                    }
                    // if the user is found but the password is wrong
                    if (!jwtUtils.checkPassword(password, rows[0].password)) {
                        return done(null, false, { message: 'Incorrect username or password.' });
                    }
                    // all is well, return successful user
                    let user = Object.assign({}, rows[0]);
                    return getUserLabs(req, done, user);
                }
            );
        });
    })
);

var getUserLabs = function (req, done, user) {
    let personID = user.person_id;
    var query =
        'SELECT people_labs.valid_from, people_labs.valid_until, labs.*' +
        ' FROM people_labs' +
        ' JOIN labs ON labs.id = people_labs.lab_id' +
        ' WHERE people_labs.person_id = ?;';
    var places = [personID];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            let labs = rows;
            if (labs.length > 0) {
                return getLabGroupHierarchyInfo(req, done, user, labs, 0, 0);
            } else {
                user.labs = [];
                return getUserTechnicianOffices(req, done, user);
            }
        });
    });
};
var getLabGroupHierarchyInfo = function (req, done, user, labs, i) {
    let this_lab = labs[i];
    var query =
        'SELECT `groups`.*, labs_groups.valid_from, labs_groups.valid_until' +
        ' FROM labs_groups' +
        ' JOIN `groups` ON `groups`.id = labs_groups.group_id' +
        ' WHERE labs_groups.lab_id = ?;';
    var places = [this_lab.id];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            let groups = rows;
            labs[i].groups = groups;
            return getGroupUnitHierarchyInfo(req, done, user, labs, groups, i, 0);
        });
    });
};
var getGroupUnitHierarchyInfo = function (req, done, user, labs, groups, i, j) {
    let this_group = groups[j];
    var query =
        'SELECT groups_units.valid_from, groups_units.valid_until, units.*' +
        ' FROM groups_units' +
        ' JOIN units ON units.id = groups_units.unit_id' +
        ' WHERE groups_units.group_id = ?;';
    var places = [this_group.id];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            let units = rows;
            groups[j].units = units;
            labs[i].groups[j].units = units;
            if (j + 1 < groups.length) {
                return getGroupUnitHierarchyInfo(req, done, user, labs, groups, i, j + 1);
            } else if (i + 1 < labs.length) {
                return getLabGroupHierarchyInfo(req, done, user, labs, i + 1);
            } else {
                user = processLabsGroupsUnitsData(user, labs);
                return getUserTechnicianOffices(req, done, user);
            }
        });
    });
};
var getUserTechnicianOffices = function (req, done, user) {
    let personID = user.person_id;
    var query =
        'SELECT technicians.valid_from, technicians.valid_until, technicians.id AS technician_id, technician_offices.*' +
        ' FROM technicians' +
        ' JOIN technician_offices ON technician_offices.id = technicians.technician_office_id' +
        ' WHERE technicians.person_id = ?;';
    var places = [personID];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            let tech_offices = rows;
            if (tech_offices.length > 0) {
                return getTechnicianUnitsInfo(req, done, user, tech_offices, 0);
            } else {
                user.tech_offices = [];
                user.current_tech_offices = [];
                return getUserScienceManagerOffices(req, done, user);
            }
        });
    });
};
var getTechnicianUnitsInfo = function (req, done, user, tech_offices, i) {
    let this_tech_office = tech_offices[i];
    var query =
        'SELECT units.*' +
        ' FROM technicians_units' +
        ' JOIN units ON units.id = technicians_units.unit_id' +
        ' WHERE technicians_units.technician_id = ?;';
    var places = [this_tech_office.technician_id];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            let units = rows;
            tech_offices[i].units = units;
            if (i + 1 < tech_offices.length) {
                return getTechnicianUnitsInfo(req, done, user, tech_offices, i + 1);
            } else {
                user = processNonResearcherUnitsData(user, tech_offices);
                return getUserScienceManagerOffices(req, done, user);
            }
        });
    });
};
var getUserScienceManagerOffices = function (req, done, user) {
    let personID = user.person_id;
    var query =
        'SELECT science_managers.valid_from, science_managers.valid_until, science_managers.id AS science_manager_id, science_manager_offices.*' +
        ' FROM science_managers' +
        ' JOIN science_manager_offices ON science_manager_offices.id = science_managers.science_manager_office_id' +
        ' WHERE science_managers.person_id = ?;';
    var places = [personID];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            let sc_man_offices = rows;
            if (sc_man_offices.length > 0) {
                return getScienceManagerUnitsInfo(req, done, user, sc_man_offices, 0);
            } else {
                user.sc_man_offices = [];
                user.current_sc_man_offices = [];
                return getUserAdministrativeOffices(req, done, user);
            }
        });
    });
};
var getScienceManagerUnitsInfo = function (req, done, user, sc_man_offices, i) {
    let this_sc_man_office = sc_man_offices[i];
    var query =
        'SELECT units.*' +
        ' FROM science_managers_units' +
        ' JOIN units ON units.id = science_managers_units.unit_id' +
        ' WHERE science_managers_units.science_manager_id = ?;';
    var places = [this_sc_man_office.science_manager_id];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            let units = rows;
            sc_man_offices[i].units = units;
            if (i + 1 < sc_man_offices.length) {
                return getScienceManagerUnitsInfo(req, done, user, sc_man_offices, i + 1);
            } else {
                user = processNonResearcherUnitsData(user, sc_man_offices);
                return getUserAdministrativeOffices(req, done, user);
            }
        });
    });
};
var getUserAdministrativeOffices = function (req, done, user) {
    let personID = user.person_id;
    var query =
        'SELECT people_administrative_offices.valid_from, people_administrative_offices.valid_until, people_administrative_offices.id AS administrative_id, administrative_offices.*' +
        ' FROM people_administrative_offices' +
        ' JOIN administrative_offices ON administrative_offices.id = people_administrative_offices.administrative_office_id' +
        ' WHERE people_administrative_offices.person_id = ?;';
    var places = [personID];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            let administrative_offices = rows;
            if (administrative_offices.length > 0) {
                return getAdministrativeUnitsInfo(req, done, user, administrative_offices, 0);
            } else {
                user.administrative_offices = [];
                user.current_administrative_offices = [];
                return getStoreRegularUser(req, done, user);
            }
        });
    });
};
var getAdministrativeUnitsInfo = function (req, done, user, administrative_offices, i) {
    let this_administrative_office = administrative_offices[i];
    var query =
        'SELECT units.*' +
        ' FROM people_administrative_units' +
        ' JOIN units ON units.id = people_administrative_units.unit_id' +
        ' WHERE people_administrative_units.administrative_id = ?;';
    var places = [this_administrative_office.administrative_id];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            let units = rows;
            administrative_offices[i].units = units;
            if (i + 1 < administrative_offices.length) {
                return getAdministrativeUnitsInfo(req, done, user, administrative_offices, i + 1);
            } else {
                user = processNonResearcherUnitsData(user, administrative_offices);
                return getStoreRegularUser(req, done, user);
            }
        });
    });
};
var getStoreRegularUser = function (req, done, user) {
    var query =
        'SELECT *' +
        ' FROM accounts_people' +
        ' WHERE user_id = ?;';
    var places = [user.user_id];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            user.store = {
                accessStore: false,
                manageUsers: false,
                manageOrders: false,
                manageStock: false,
                manageFinances: false,
                accounts: [],
            }
            for (let ind in rows) {
                if (rows[ind].account_id !== null && rows[ind].account_role_id !== null) {
                    user.store.accessStore = true;
                    user.store.accounts.push(rows[ind].account_id);
                }
            }
            return getStoreStockManagers(req, done, user);
        });
    });
};
var getStoreStockManagers = function (req, done, user) {
    var query =
        'SELECT *' +
        ' FROM stock_managers' +
        ' WHERE user_id = ?;';
    var places = [user.user_id];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            if (rows.length === 1) {
                user.store.manageStock = true;
            }
            return getStoreAccountManagers(req, done, user);
        });
    });
};
var getStoreAccountManagers = function (req, done, user) {
    var query =
        'SELECT *' +
        ' FROM account_managers' +
        ' WHERE user_id = ?;';
    var places = [user.user_id];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            if (rows.length === 1) {
                user.store.manageUsers = true;
                user.store.manageOrders = true;
                user.store.manageFinances = true;
            }
            return getCurrentCity(req, done, user);
        });
    });
};
var getCurrentCity = function (req, done, user) {
    // An active user must have a single pole attributed for the current date
    let person_id = user.person_id;
    var query =
        'SELECT people_institution_city.*, institution_city.city'
        + ' FROM people_institution_city'
        + ' JOIN institution_city ON institution_city.id = people_institution_city.city_id'
        + ' WHERE people_institution_city.person_id = ?'
        + ' AND ((people_institution_city.valid_from <= CURDATE() AND CURDATE() <= people_institution_city.valid_until)'
        + '     OR (people_institution_city.valid_from IS NULL AND CURDATE() <= people_institution_city.valid_until)'
        + '     OR (people_institution_city.valid_from <= CURDATE() AND people_institution_city.valid_until IS NULL)'
        + '     OR (people_institution_city.valid_from IS NULL AND people_institution_city.valid_until IS NULL));';
    var places = [person_id];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            if (rows.length > 0) {
                user.current_city = rows[0];
            } else {
                user.current_city = [];
            }
            return getCurrentDepartment(req, done, user);
        });
    });
}

var getCurrentDepartment = function (req, done, user) {
    let person_id = user.person_id;
    var query =
        'SELECT people_departments.*, departments.name_en, departments.name_pt'
        + ' FROM people_departments'
        + ' JOIN departments ON departments.id = people_departments.department_id'
        + ' WHERE people_departments.person_id = ?'
        + ' AND ('
        + ' (people_departments.valid_from IS NULL OR people_departments.valid_from <= CURDATE())'
        + ' AND (people_departments.valid_until IS NULL OR people_departments.valid_until >= CURDATE())'
        + ');';
    var places = [person_id];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            user.current_departments = rows;
            return getUserEndpointPermissions(req, done, user);
        });
    });
}

var getUserEndpointPermissions = function (req, done, user) {
    let userID = user.user_id;
    var query =
        'SELECT permissions_endpoints.*, endpoint_methods.name AS method_name,'
        + ' resource1_types.name AS resource1_type_name,'
        + ' resource2_types.name AS resource2_type_name,'
        + ' resource3_types.name AS resource3_type_name,'
        + ' resource4_types.name AS resource4_type_name'
        + ' FROM permissions_endpoints'
        + ' JOIN resource_types AS resource1_types ON resource1_types.id = permissions_endpoints.resource1_type_id'
        + ' LEFT JOIN resource_types AS resource2_types ON resource2_types.id = permissions_endpoints.resource2_type_id'
        + ' LEFT JOIN resource_types AS resource3_types ON resource3_types.id = permissions_endpoints.resource3_type_id'
        + ' LEFT JOIN resource_types AS resource4_types ON resource4_types.id = permissions_endpoints.resource4_type_id'
        + ' JOIN endpoint_methods ON endpoint_methods.id = permissions_endpoints.method_id'
        + ' WHERE permissions_endpoints.user_id = ?;';
    var places = [userID];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            rows = makeEndpointURL(rows);
            user.permissions_endpoints = rows;
            return getPermissionWebAreas(req, done, user);
        });
    });
};
var getPermissionWebAreas = function (req, done, user) {
    var query =
        'SELECT permissions_web_app_areas.app_area_id, web_app_areas.app_area_en, web_app_areas.app_area_pt'
        + ' FROM permissions_web_app_areas'
        + ' JOIN web_app_areas ON web_app_areas.id = permissions_web_app_areas.app_area_id'
        + ' WHERE permissions_web_app_areas.user_id = ?;';
    var places = [user.user_id];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            user.permissions_web_areas = rows;
            return done(null, user);
        });
    });
};
passport.use(
    'local-recovery-login',
    new LocalStrategy({
        // by default, local strategy uses username and password
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, username, password, done) {
        var query =
            'SELECT users.id AS user_id, users.username, users.password_recovery AS password,' +
            ' people.id as person_id' +
            ' FROM users' +
            ' LEFT JOIN people ON people.user_id = users.id' +
            ' WHERE users.username = ? AND users.deactivated = 0 AND people.status = 1;';
        var places = [username];
        pool.getConnection(function (err, connection) {
            if (err) {
                return done(err);
            }
            connection.query(query, places,
                function (err, rows) {
                    // And done with the connection.
                    connection.release();
                    if (err) {
                        return done(err);
                    }
                    if (rows.length < 1) {
                        return done(null, false, { message: 'Incorrect username or password.' });
                    }
                    // if the user is found but the password is wrong
                    if (!jwtUtils.checkPassword(password, rows[0].password)) {
                        return done(null, false, { message: 'Incorrect username or password.' });
                    }
                    // all is well, return successful user
                    let user = Object.assign({}, rows[0]);
                    return done(null, user);
                }
            );
        });
    })
);


passport.use(
    'local-prereg',
    new LocalStrategy({
        // by default, local strategy uses username and password
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, username, password, done) {
        var query =
            'SELECT users.id AS user_id, users.username, users.password,' +
            ' people.id as person_id' +
            ' FROM users' +
            ' LEFT JOIN people ON people.user_id = users.id' +
            ' WHERE users.username = ? AND users.deactivated = 0 AND people.status = 2;';
        var places = [username];
        pool.getConnection(function (err, connection) {
            if (err) {
                return done(err);
            }
            connection.query(query, places,
                function (err, rows) {
                    // And done with the connection.
                    connection.release();
                    if (err) {
                        return done(err);
                    }
                    if (rows.length < 1) {
                        return done(null, false, { message: 'Incorrect username or password.' });
                    }
                    // if the user is found but the password is wrong
                    if (!jwtUtils.checkPassword(password, rows[0].password)) {
                        return done(null, false, { message: 'Incorrect username or password.' });
                    }
                    // all is well, return successful user
                    let user = Object.assign({}, rows[0]);
                    return done(null, user);
                }
            );
        });
    })
);

passport.use(
    'local-recommendation',
    new LocalStrategy({
        // by default, local strategy uses username and password
        usernameField: 'recommenderID',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, username, password, done) {
        var query =
            'SELECT application_recommenders.*' +
            ' FROM application_recommenders' +
            ' WHERE id = ? AND submitted IS NULL;';
        var places = [username];
        pool.getConnection(function (err, connection) {
            if (err) {
                return done(err);
            }
            connection.query(query, places,
                function (err, rows) {
                    // And done with the connection.
                    connection.release();
                    if (err) {
                        return done(err);
                    }
                    if (rows.length < 1) {
                        return done(null, false, { message: 'Incorrect username or password.' });
                    }
                    // if the user is found but the password is wrong
                    if (!jwtUtils.checkPassword(password, rows[0].url_access)) {
                        return done(null, false, { message: 'Incorrect username or password.' });
                    }
                    // all is well, return successful user
                    let user = Object.assign({}, rows[0]);
                    return getApplicationInfo(req, done, user);
                }
            );
        });
    })
);
var getApplicationInfo = function (req, done, user) {
    let applicationID = user.application_id;
    var query = 'SELECT applications.*, applicants.name AS applicant_name'
                + ' FROM applications'
                + ' JOIN applicants ON applicants.application_id = applications.id'
                + ' WHERE applications.id = ?;';
    var places = [applicationID];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            user.application = rows[0];
            return getCallInfo(req, done, user);
        });
    });
};
var getCallInfo = function (req, done, user) {
    var query = 'SELECT *'
                + ' FROM call_applications'
                + ' WHERE id = ?;';
    var places = [user.application.call_id];
    pool.getConnection(function (err, connection) {
        if (err) {
            return done(err);
        }
        connection.query(query, places, function (err, rows) {
            connection.release();
            if (err) {
                return done(err);
            }
            user.call = rows[0];
            return done(null, user);
        });
    });
};

passport.use(
    'local-reviewer',
    new LocalStrategy({
        // by default, local strategy uses username and password
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, username, password, done) {
        var query =
            'SELECT application_reviewers.*' +
            ' FROM application_reviewers' +
            ' WHERE username = ?;';
        var places = [username];
        pool.getConnection(function (err, connection) {
            if (err) {
                return done(err);
            }
            connection.query(query, places,
                function (err, rows) {
                    // And done with the connection.
                    connection.release();
                    if (err) {
                        return done(err);
                    }
                    if (rows.length < 1) {
                        return done(null, false, { message: 'Incorrect username or password.' });
                    }
                    // if the user is found but the password is wrong
                    if (!jwtUtils.checkPassword(password, rows[0].password)) {
                        return done(null, false, { message: 'Incorrect username or password.' });
                    }
                    // all is well, return successful user
                    let user = Object.assign({}, rows[0]);
                    return done(null, user);
                }
            );
        });
    })
);


module.exports = passport;