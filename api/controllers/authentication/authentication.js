var passport = require('../../config/passport');
var jwtUtils = require('../../config/jwt_utilities');
const responses = require('../utilities/responses');
const sql = require('../utilities/sql');
const time = require('../utilities/time');

var makeLogin = function (req, res, next) {
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
            if (req.body.changePassword) {
                return actionChangePassword(req, res, next);
            } else {

                responses.sendJSONResponse(res, 200, {
                    "token": token
                });
            }
        } else {
            responses.sendJSONResponse(res, 401, info);
        }
    })(req, res);
};

module.exports.login = function (req, res, next) {
    return makeLogin(req, res, next);
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

module.exports.recommendationLogin = function (req, res, next) {
    if (!req.body.recommenderID || !req.body.password) {
        responses.sendJSONResponse(res, 400, {
            "message": "All fields required"
        });
        return;
    }
    passport.authenticate('local-recommendation', function (err, user, info) {
        if (err) {
            responses.sendJSONResponse(res, 404, err);
            return;
        }
        if (user) {
            var token = jwtUtils.generateJWTRecommendation(user);
            responses.sendJSONResponse(res, 200, {
                "token": token,
                "application_id": user.application_id,
                "name": user.name,
                "email": user.email,
                "application": user.application,
                "call": user.call,
            });
        } else {
            responses.sendJSONResponse(res, 401, info);
        }
    })(req, res);
};

var makeReviewerLogin = function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        responses.sendJSONResponse(res, 400, {
            "message": "All fields required"
        });
        return;
    }
    passport.authenticate('local-reviewer', function (err, user, info) {
        if (err) {
            responses.sendJSONResponse(res, 404, err);
            return;
        }
        if (user) {
            var token = jwtUtils.generateJWTReviewer(user);

            if (req.body.changePassword) {
                return actionReviewerChangePassword(req, res, next);
            } else {
                responses.sendJSONResponse(res, 200, {
                    "token": token,
                    "reviewerID": user.id,
                    "name": user.name,
                    "username": user.username,
                });
            }
        } else {
            responses.sendJSONResponse(res, 401, info);
        }
    })(req, res);

};

module.exports.reviewerLogin = function (req, res, next) {
    return makeReviewerLogin(req, res, next);
};



var actionChangePassword = function (req, res, next) {
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
    return sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.changePassword = function (req, res, next) {
    // Initial verifications
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
    // first makes login with old password
    req.body.changePassword = true;
    return makeLogin(req, res, next);
};

var actionReviewerChangePassword = function (req, res, next) {
    let querySQL = '';
    let places = [];
    let hashedPassword = jwtUtils.hashPassword(req.body.newPassword);
    querySQL = querySQL + 'UPDATE application_reviewers'
                        + ' SET password = ?'
                        + ' WHERE id = ?;';
    places.push(
        hashedPassword,
        req.params.reviewerID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.reviewerChangePassword = function (req, res, next) {
    // Initial verifications
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
    // first makes login with old password
    req.body.changePassword = true;
    return makeReviewerLogin(req, res, next);
};