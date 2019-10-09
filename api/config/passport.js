var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var server = require('./mysql_connection');
var pool = server.pool;
var jwtUtils = require('./jwt_utilities');
var time = require('../controllers/utilities/time');

function processLabsGroupsUnitsData(user, labs) {
    let today = time.moment();
    let current_labs = [];
    let current_groups = [];
    let current_units = [];
    let groups = [];
    let units = [];
    let used_current_labs = [];
    let used_current_groups = [];
    let used_current_units = [];
    let used_groups = [];
    let used_units = [];
    for (let ind in labs) {
        if (time.moment(labs[ind].valid_from).isBefore(today)
            || labs[ind].valid_from === null) {
            if (time.moment(labs[ind].valid_until).isAfter(today)
                || labs[ind].valid_until === null) {
                if (used_current_labs.indexOf(labs[ind].id) === -1) {
                    current_labs.push(labs[ind]);
                    used_current_labs.push(labs[ind].id);
                    for (let indGroup in labs[ind].groups) {
                        // the group must exist now
                        if (time.moment(labs[ind].groups[indGroup].started).isBefore(today)
                            || labs[ind].groups[indGroup].started === null) {
                            if (time.moment(labs[ind].groups[indGroup].finished).isAfter(today)
                                || labs[ind].groups[indGroup].finished === null) {
                                if (used_current_groups.indexOf(labs[ind].groups[indGroup].id) === -1) {
                                    current_groups.push(labs[ind].groups[indGroup]);
                                    used_current_groups.push(labs[ind].groups[indGroup].id);
                                }
                            }
                        }
                        for (let indUnit in labs[ind].groups[indGroup].units) {
                            // the unit must exist now
                            if (time.moment(labs[ind].groups[indGroup].units[indUnit].started).isBefore(today)
                                || labs[ind].groups[indGroup].units[indUnit].started === null) {
                                if (time.moment(labs[ind].groups[indGroup].units[indUnit].finished).isAfter(today)
                                    || labs[ind].groups[indGroup].units[indUnit].finished === null) {
                                    if (used_current_units.indexOf(labs[ind].groups[indGroup].units[indUnit].id) === -1) {
                                        current_units.push(labs[ind].groups[indGroup].units[indUnit]);
                                        used_current_units.push(labs[ind].groups[indGroup].units[indUnit].id);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        for (let indGroup in labs[ind].groups) {
            if (used_groups.indexOf(labs[ind].groups[indGroup].id) === -1) {
                groups.push(labs[ind].groups[indGroup]);
                used_groups.push(labs[ind].groups[indGroup].id);
            }
            for (let indUnit in labs[ind].groups[indGroup].units) {
                if (used_units.indexOf(labs[ind].groups[indGroup].units[indUnit].id) === -1) {
                    units.push(labs[ind].groups[indGroup].units[indUnit]);
                    used_units.push(labs[ind].groups[indGroup].units[indUnit].id);
                }
            }
        }
    }
    user.current_labs = current_labs;
    user.current_groups = current_groups;
    user.current_units = current_units;
    user.labs = labs;
    user.groups = groups;
    user.units = units;
    return user;
}
function processNonResearcherUnitsData(user, offices, type) {
    let today = time.moment();
    let current_offices = [];
    let used_current_offices = [];
    let current_units = [];
    let units = [];
    let used_current_units = [];
    let used_units = [];
    for (let ind in offices) {
        if (time.moment(offices[ind].valid_from).isBefore(today)
            || offices[ind].valid_from === null) {
            if (time.moment(offices[ind].valid_until).isAfter(today)
                || offices[ind].valid_until === null) {
                if (used_current_offices.indexOf(offices[ind].id) === -1) {
                    current_offices.push(offices[ind]);
                    used_current_offices.push(labs[ind].id);
                    for (let indUnit in offices[ind].units) {
                        if (used_current_units.indexOf(offices[ind].units[indUnit].id) === -1) {
                            current_units.push(offices[ind].units[indUnit]);
                            used_current_units.push(offices[ind].units[indUnit].id);
                        }
                    }
                }
            }
        }
        for (let indUnit in offices[ind].units) {
            if (used_units.indexOf(offices[ind].units[indUnit].id) === -1) {
                units.push(offices[ind].units[indUnit]);
                used_units.push(offices[ind].units[indUnit].id);
            }
        }
    }
    // the unlikely case that a user has a simultaneous role as researcher 
    // and non-researcher (user.units holds the units found as a researcher)
    if (user.units !== undefined && user.units.length > 0) {
        for (let indUnit in user.units) {
            if (used_units.indexOf(user.units[indUnit].id) === -1) {
                units.push(user.units[indUnit]);
                used_units.push(user.units[indUnit].id);
            }
        }
    }
    if (user.current_units !== undefined && user.current_units.length > 0) {
        for (let indUnit in user.current_units) {
            if (used_current_units.indexOf(user.current_units[indUnit].id) === -1) {
                current_units.push(user.current_units[indUnit]);
                used_current_units.push(user.units[indUnit].id);
            }
        }
    }
    if (type === 'technician') {
        user.tech_offices = offices;
        user.current_tech_offices = current_offices;
    } else if (type === 'science_manager') {
        user.sc_man_offices = offices;
        user.current_sc_man_offices = current_offices;
    } else if (type === 'administrative') {
        user.administrative_offices = offices;
        user.current_administrative_offices = current_offices;
    }
    user.current_units = current_units;
    user.units = units;
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
            ' users.permission_type_id AS permission_level,' +
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
                        return done(null, false, { message: 'Incorrect username.' });
                    }
                    // if the user is found but the password is wrong
                    if (!jwtUtils.checkPassword(password, rows[0].password)) {
                        return done(null, false, { message: 'Incorrect password.' });
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
                user = processLabsGroupsUnitsData(user,labs);
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
                user = processNonResearcherUnitsData(user, tech_offices, 'technician');
                return getUserScienceManagerOffices(req, done, user);
            }            
        });
    });    
};
var getUserScienceManagerOffices = function (req, done, user) {
    let personID = user.person_id;
    var query =
        'SELECT science_managers.valid_from, science_managers.valid_until, science_managers.id AS science_managers_id, science_manager_offices.*' +
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
                user = processNonResearcherUnitsData(user, sc_man_offices, 'science_manager');
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
                return getUserCities(req, done, user);
            }
        });
    });
};
var getAdministrativeUnitsInfo = function (req, done, user, administrative_offices, i) {
    let this_administrative_office = administrative_offices[i];
    var query =
        'SELECT units.*' +
        ' FROM people_administative_units' +
        ' JOIN units ON units.id = people_administative_units.unit_id' +
        ' WHERE people_administative_units.administrative_id = ?;';
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
                user = processNonResearcherUnitsData(user, administrative_offices, 'administrative');
                return getUserCities(req, done, user);
            }
        });
    });
}
var getUserCities = function (req, done, user) {
    let personID = user.person_id;
    var query =
        'SELECT people_institution_city.valid_from, people_institution_city.valid_until, institution_city.*' +
        ' FROM people_institution_city' +
        ' JOIN institution_city ON institution_city.id = people_institution_city.city_id' +
        ' WHERE people_institution_city.person_id = ?;';
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
            let cities = rows;
            if (cities.length > 0) {
                let today = time.moment();
                let current_cities = [];
                let used_cities = [];
                for (let ind in cities) {
                    if (time.moment(cities[ind].valid_from).isBefore(today)
                            || cities[ind].valid_from === null) {
                        if (time.moment(cities[ind].valid_until).isAfter(today)
                                || cities[ind].valid_until === null) {
                            if (used_cities.indexOf(cities[ind].id) === -1) {
                                current_cities.push(cities[ind]);
                                used_cities.push(cities[ind].id);
                            }
                        }
                    }
                }
                user.current_cities = current_cities;
                user.cities = cities;
                return getUsersOnBehalf(req, done, user);
            } else {
                // actually there shouldn't exist people without a city attributed
                user.cities = [];
                user.current_city = [];
                return getUsersOnBehalf(req, done, user);
            }
        });
    });
};
var getUsersOnBehalf = function (req, done, user) {
    var query =
        'SELECT *' +
        ' FROM permissions_people' +
        ' WHERE user_managing_id = ?;';
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
            user.permission_people = rows;
            return getPermissionLabs(req, done, user);
        });
    });
};
var getPermissionLabs = function (req, done, user) { 
    var query =
        'SELECT *' +
        ' FROM permissions_labs' +
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
            user.permission_labs = rows;
            return getPermissionGroups(req, done, user);
        });
    });
};
var getPermissionGroups = function (req, done, user) {
    var query =
        'SELECT *' +
        ' FROM permissions_groups' +
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
            user.permission_groups = rows;
            return getPermissionUnits(req, done, user);
        });
    });
 };
var getPermissionUnits = function (req, done, user) {
    var query =
        'SELECT *' +
        ' FROM permissions_units' +
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
            user.permission_units = rows;
            return getPermissionCities(req, done, user);
        });
    });
};
var getPermissionCities = function (req, done, user) {
    var query =
        'SELECT *' +
        ' FROM permissions_cities' +
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
            user.permission_cities = rows;
            return getPermissionUnitsCities(req, done, user);
        });
    });
};
var getPermissionUnitsCities = function (req, done, user) {
    var query =
        'SELECT *' +
        ' FROM permissions_units_cities' +
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
            user.permission_units_cities = rows;
            return getPermissionDocuments(req, done, user);
        });
    });
};
var getPermissionDocuments = function (req, done, user) {
    var query =
        'SELECT *' +
        ' FROM permissions_documents' +
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
            user.permission_documents = rows;
            return getPermissionWebAreas(req, done, user);
        });
    });
};
var getPermissionWebAreas = function (req, done, user) {
    var query =
        'SELECT permissions_web_app_areas.*, web_app_areas.app_area_en, web_app_areas.app_area_pt' +
        ' FROM permissions_web_app_areas' +
        ' JOIN web_app_areas ON web_app_areas.id = permissions_web_app_areas.app_area_id'
        ' WHERE permissions_web_app_areas.user_id = ?;';
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
            user.permission_web_areas = rows;
            return done(null, user);
        });
    });
};

module.exports = passport;