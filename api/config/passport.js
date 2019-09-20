var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var server = require('./mysql_connection');
var pool = server.pool;
var jwtUtils = require('./jwt_utilities');

passport.use(
    'local-login',
    new LocalStrategy({
        // by default, local strategy uses username and password
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, username, password, done) { 
        // 'SELECT * from users WHERE users.username=?;'
        // callback with username and password from our form
        var query = 
            'SELECT users.id AS user_id, users.username, users.password,' +
            ' users_permissions.permission_id,' +
            ' people.id as person_id,' +
            ' permissions_groups.group_id,' +
            ' permissions_labs.lab_id, permissions_labs.group_id AS lab_group_id' +
            ' FROM users' +
            ' LEFT JOIN people ON people.user_id = users.id' +
            ' LEFT JOIN users_permissions ON users_permissions.user_id = users.id' +
            ' LEFT JOIN permissions_groups ON permissions_groups.user_id = users.id' +
            ' LEFT JOIN permissions_labs ON permissions_labs.user_id = users.id' +
            ' WHERE users.username = ? AND people.status = 1;';
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
                    var row = Object.assign({}, rows[0]);
                    row['permission_id'] = [];
                    var usedPermissions = [];
                    for (var indRow in rows) {
                        if (usedPermissions.indexOf(rows[indRow]['permission_id']) === -1
                            && rows[indRow]['permission_id'] !== null) {
                            row['permission_id'].push(rows[indRow]['permission_id']);
                            usedPermissions.push(rows[indRow]['permission_id']);
                        }
                    }
                    delete row.lab_id;
                    delete row.lab_group_id;
                    row['permission_lab_id'] = [];
                    var usedLabs = []; // each element is a 2 vector [lab,group]
                    for (let indRow in rows) {
                        if (rows[indRow].lab_id !== null
                            && rows[indRow].lab_group_id !== null) {
                            let found = false;
                            for (let indLab in usedLabs) {
                                if (usedLabs[indLab][0] === rows[indRow].lab_id
                                    && usedLabs[indLab][1] === rows[indRow].lab_group_id) {
                                    found = true;
                                }
                            }
                            if (!found) {
                                row.permission_lab_id.push({
                                    lab_id: rows[indRow].lab_id, 
                                    group_id: rows[indRow].lab_group_id});
                                usedLabs.push([rows[indRow].lab_id, rows[indRow].lab_group_id]);
                            }                        
                        }                        
                    }
                    delete row.group_id;
                    row['permission_group_id'] = [];
                    var usedGroups = [];
                    for (var indRow in rows) {
                        if (usedGroups.indexOf(rows[indRow]['group_id']) === -1
                            && rows[indRow]['group_id'] !== null) {
                            row['permission_group_id'].push(rows[indRow]['group_id']);
                            usedGroups.push(rows[indRow]['group_id']);
                        }
                    }
                    return done(null, row);
                }
            );
        });
    })
);

module.exports = passport;