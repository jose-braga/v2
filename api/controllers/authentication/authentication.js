var passport = require('../../config/passport');
var jwtUtils = require('../../config/jwt_utilities');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;
const responses = require('../utilities/responses');
const sql = require('../utilities/sql');
const time = require('../utilities/time');

var make_password = function(n, a) {
    let index = (Math.random() * (a.length - 1)).toFixed(0);
    return n > 0 ? a[index] + make_password(n - 1, a) : '';
};

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

var makeRecoveryLogin = function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        responses.sendJSONResponse(res, 400, {
            "message": "All fields required"
        });
        return;
    }
    passport.authenticate('local-recovery-login', function (err, user, info) {
        if (err) {
            responses.sendJSONResponse(res, 404, err);
            return;
        }
        if (user) {
            var token = jwtUtils.generateJWT(user);
            if (req.body.changePassword) {
                return actionRecoveryChangePassword(req, res, next);
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
module.exports.recoveryLogin = function (req, res, next) {
    return makeRecoveryLogin(req, res, next);
};

var checkUsername = function (req, res, next) {
    let recoveryString = req.body.recoveryString;
    let querySQL= '';
    let places = [];
    querySQL = querySQL + 'SELECT users.*, people.id AS person_id'
                        + ' FROM users'
                        + ' JOIN people ON people.user_id = users.id'
                        + ' WHERE users.username = ?;';
    places.push(recoveryString);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.user = resQuery[0];
                return getMailfromPersonID(options);
            } else {
                return checkPersonalEmail(options);
            }
        },
        {req, res, next}
    );
};
var getMailfromPersonID = function (options) {
    let { req, res, next, user } = options;
    let querySQL= '';
    let places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM personal_emails'
                        + ' WHERE person_id = ?'
                        + ' UNION'
                        + ' SELECT *'
                        + ' FROM emails'
                        + ' WHERE person_id = ?'
                        ;
    places.push(user.person_id, user.person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                let emailRecipients = ''
                for (let ind in resQuery) {
                    if (resQuery[ind].email !== null
                        && resQuery[ind].email !== '') {
                        emailRecipients = emailRecipients + resQuery[ind].email + ',';
                    }
                }
                options.emailRecipients = emailRecipients;
                return changePasswordRecoveryInitial(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 403,
                    message: {
                        "status": "error", "statusCode": 403,
                        "message": 'No email accounts associated with username. Contact Science Management.'
                    }
                });
            }
        },
        options
    );
};
var checkPersonalEmail = function (options) {
    let { req, res, next } = options;
    let recoveryString = req.body.recoveryString;
    let querySQL= '';
    let places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM personal_emails'
                        + ' WHERE email = ?;';
    places.push(recoveryString);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                if (resQuery[0].email !== null && resQuery[0].email !== '') {
                    options.email = resQuery[0];
                    options.emailRecipients = resQuery[0].email;
                    return getUserfromPersonID(options);
                } else {
                    return checkWorkEmail(options);
                }
            } else {
                return checkWorkEmail(options);
            }
        },
        options
    );
};
var checkWorkEmail = function (options) {
    let { req, res, next } = options;
    let recoveryString = req.body.recoveryString;
    let querySQL= '';
    let places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM emails'
                        + ' WHERE email = ?;';
    places.push(recoveryString);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                if (resQuery[0].email !== null && resQuery[0].email !== '') {
                    options.email = resQuery[0];
                    options.emailRecipients = resQuery[0].email;
                    return getUserfromPersonID(options);
                } else {
                    return responses.sendJSONResponseOptions({
                        response: res,
                        status: 403,
                        message: {
                            "status": "error", "statusCode": 403,
                            "message": 'Username or Email not found!'
                        }
                    });
                }
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 403,
                    message: {
                        "status": "error", "statusCode": 403,
                        "message": 'Username or Email not found!'
                    }
                });
            }
        },
        options
    );
};
var getUserfromPersonID = function (options) {
    let { req, res, next, email } = options;
    let querySQL= '';
    let places = [];
    querySQL = querySQL + 'SELECT users.*'
                        + ' FROM people'
                        + ' JOIN users ON users.id = people.user_id'
                        + ' WHERE people.id = ?;';
    places.push(email.person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.user = resQuery[0];
            return changePasswordRecoveryInitial(options);
        },
        options
    );
};
var changePasswordRecoveryInitial = function (options) {
    let { req, res, next, user } = options;
    let password = make_password(50,'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    let hashedPassword = jwtUtils.hashPassword(password);
    options.password = password;
    let querySQL= '';
    let places = [];
    querySQL = querySQL + 'UPDATE users'
                        + ' SET password_recovery = ?'
                        + ' WHERE id = ?;';
    places.push(hashedPassword, user.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            sendRecoveryEmail(options)
            .catch((e) => {
                console.log(e);
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 500,
                    message: {
                        "status": "error", "statusCode": 500,
                        "message": 'Error sending email! Try again...'
                    }
                });
            });
        },
        options
    );
};
async function sendRecoveryEmail(options) {
    let { req, res, next, user, emailRecipients, password } = options;
    let recipients = emailRecipients;
    let mailOptions;
    let subjectText = 'Password Recovery for LAQV/UCIBIO platform';
    let emailBody = 'Dear user,\n\n'
        + ' You requested a password change for your LAQV/UCIBIO account.'
        + ' Please click on the following link to proceed:\n\n'
        + process.env.PATH_PREFIX + '/password-recovery/'
        + user.id + '/' + user.username + '/' + password
        + '\n\n'
        + ' In case you didn\'t request a password change please contact Science Management immediately.\n\n'
        + ' Best regards,\n'
        + ' The Science Management Office';
    let emailBodyHtml = '<p>' + 'Dear user,</p>'
        + '<p>You requested a password change for your LAQV/UCIBIO account.'
        + ' Please click on the following link to proceed:</p>'
        + process.env.PATH_PREFIX + '/password-recovery/'
        + user.id + '/' + user.username + '/' + password
        + '<br>'
        + ' <p>In case you didn\'t request a password change please contact Science Management immediately.</p>'
        + ' <p>Best regards,<br>'
        + ' The Science Management office</p>';
    if (process.env.NODE_ENV === 'production') {
        mailOptions = {
            from: '"Admin" <admin@laqv-ucibio.info>', // sender address
            to: recipients, // list of receivers (comma-separated)
            subject: subjectText, // Subject line
            text: emailBody,
            html: emailBodyHtml,
        };
        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Message %s sent: %s', info.messageId, info.response);
        return responses.sendJSONResponseOptions({
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200,
                "message": 'Success!'
            }
        });
    } else {
        // just for testing purposes
        mailOptions = {
            from: '"Admin" <admin@laqv-ucibio.info>', // sender address
            to: recipients, // list of receivers (comma-separated)
            subject: 'TESTING: ' + subjectText, // Subject line
            text: emailBody,
            html: emailBodyHtml,
        };
        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Message %s sent: %s', info.messageId, info.response);
        return responses.sendJSONResponseOptions({
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200,
                "message": 'Success!'
            }
        });
    }
};

module.exports.generateRecovery = function (req, res, next) {
    return checkUsername(req, res, next);
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

var actionRecoveryChangePassword = function (req, res, next) {
    let querySQL = '';
    let places = [];
    let hashedPassword = jwtUtils.hashPassword(req.body.newPassword);
    let now = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
    querySQL = querySQL + 'UPDATE users'
                        + ' SET password = ?,'
                        + ' password_recovery = NULL,'
                        + ' updated = ?'
                        + ' WHERE id = ?;';
    places.push(
        hashedPassword,
        now,
        req.params.userID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.recoveryChangePassword = function (req, res, next) {
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
    return makeRecoveryLogin(req, res, next);
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