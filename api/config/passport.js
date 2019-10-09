var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var server = require('./mysql_connection');
var pool = server.pool;
var jwtUtils = require('./jwt_utilities');
var time = require('../controllers/utilities/time');

function makeEndpointURL(data) {
    for (let ind in data) {
        let url = '';
        // resource1 exists always
        url = '/' + data[ind].resource1_type_name + '/' + data[ind].resource1_id;
        if (data[ind].resource2_type_name !== null && data[ind].resource2_type_name !== undefined)  {
            url = url + '/' + data[ind].resource2_type_name;
        } else {
            data[ind].endpoint_url = url;
            continue;
        }
        if (data[ind].resource2_id !== null && data[ind].resource2_id !== undefined) {
            url = url + '/' + data[ind].resource2_id;
        } else {
            data[ind].endpoint_url = url;
            continue;
        }
        if (data[ind].resource3_type_name !== null && data[ind].resource3_type_name !== undefined) {
            url = url + '/' + data[ind].resource3_type_name;
        } else {
            data[ind].endpoint_url = url;
            continue;
        }
        if (data[ind].resource3_id !== null && data[ind].resource3_id !== undefined) {
            url = url + '/' + data[ind].resource3_id;
        } else {
            data[ind].endpoint_url = url;
            continue;
        }
        if (data[ind].resource4_type_name !== null && data[ind].resource4_type_name !== undefined) {
            url = url + '/' + data[ind].resource4_type_name;
        } else {
            data[ind].endpoint_url = url;
            continue;
        }
        if (data[ind].resource4_id !== null && data[ind].resource4_id !== undefined) {
            url = url + '/' + data[ind].resource4_id;
        } else {
            data[ind].endpoint_url = url;
            continue;
        }
    }
    return data;
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
                    return getUserEndpointPermissions(req, done, user);
                }
            );
        });
    })
);

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
            user.permissions_web_areas = rows;
            return done(null, user);
        });
    });
};

module.exports = passport;