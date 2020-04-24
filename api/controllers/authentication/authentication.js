var passport = require('../../config/passport');
var jwtUtils = require('../../config/jwt_utilities');
const responses = require('../utilities/responses');
const sql = require('../utilities/sql');
const time = require('../utilities/time');

module.exports.login = function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        responses.sendJSONResponse(res, 400, {
            "message": "All fields required"
        });
        return;
    }
    passport.authenticate('local-login', function (err, user, info) {
        if (err) {
            responses.sendJSONResponse(res, 404, err);
            return;
        }
        if (user) {
            var token = jwtUtils.generateJWT(user);
            responses.sendJSONResponse(res, 200, {
                "token": token
            });
        } else {
            responses.sendJSONResponse(res, 401, info);
        }
    })(req, res);
};

module.exports.preRegistrationLogin = function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        responses.sendJSONResponse(res, 400, {
            "message": "All fields required"
        });
        return;
    }
    passport.authenticate('local-prereg', function (err, user, info) {
        if (err) {
            responses.sendJSONResponse(res, 404, err);
            return;
        }
        if (user) {
            var token = jwtUtils.generateJWT(user);
            responses.sendJSONResponse(res, 200, {
                "token": token,
                "person_id": user.person_id,
                "user_id": user.user_id,
            });
        } else {
            responses.sendJSONResponse(res, 401, info);
        }
    })(req, res);
};

module.exports.changePassword = function (req, res, next) {
    if (!req.body.username || !req.body.password
        || !req.body.newPassword || !req.body.newPasswordConfirm) {
        responses.sendJSONResponse(res, 400, {
            "message": "All fields required."
        });
        return;
    }
    if (req.body.newPassword !== req.body.newPasswordConfirm) {
        responses.sendJSONResponse(res, 400, {
            "message": "Passwords do not match."
        });
        return;
    }
    let querySQL = '';
    let places = [];
    let hashedPassword = jwtUtils.hashPassword(req.body.newPassword);
    let now = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
    querySQL = querySQL + 'UPDATE users'
                        + ' SET password = ?,'
                        + ' updated = ?'
                        + ' WHERE id = ?;';
    places.push(
        hashedPassword,
        now,
        req.params.userID);
    if (parseInt(req.params.userID, 10) === parseInt(req.payload.userID, 10)) {
        // the change requester is the user that is changing password
        sql.makeSQLOperation(req, res, querySQL, places);
    } else if (parseInt(req.payload.stat, 10) === 0) {
        // change requester is an admin
        sql.makeSQLOperation(req, res, querySQL, places);
    } else {
        // change requester is another user
        responses.sendJSONResponse(res, 400, {
            "message": "User is not authorized to change others passwords."
        });
        return;
    }
};