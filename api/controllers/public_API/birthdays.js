const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
var passport = require('../../config/passport');
var time = require('../../controllers/utilities/time');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;


var authenticate = function (options) {
    let { req, res, next } = options;
    if (!req.body.username || !req.body.password) {
        responses.sendJSONResponse(res, 400, {
            "message": "All fields required"
        });
        console.log('Problem in authorization of birthday script (1).')
        return;
    }
    if (req.body.username !== 'josebraga') {
        responses.sendJSONResponse(res, 400, {
            "message": "Incorrect username for this operation."
        });
        console.log('Problem in authorization of birthday script (2).')
        return;
    }
    passport.authenticate('local-login', function (err, user, info) {
        if (err) {
            responses.sendJSONResponse(res, 404, err);
            return;
        }
        if (user) {
            return actionGetBirthdays(options);

        } else {
            responses.sendJSONResponse(res, 401, info);
        }
    })(req, res);


};
var actionGetBirthdays = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    let month_day = time.momentToDate(time.moment(),
                                     undefined, '-MM-DD');
    let this_birthday = '%' + month_day;
    querySQL = querySQL
        + 'SELECT * FROM people'
        + ' WHERE birth_date LIKE ?'
        + ' AND receives_automatic_emails = 1;'
        ;
    places.push(this_birthday);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.people = resQuery;
                options.i = 0;
                return getPersonWorkEmail(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "result": resQuery,
                    }
                });
            }
        },
        options);
};
var getPersonWorkEmail = function (options) {
    let { req, res, next, i, people } = options;
    let person = people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM emails WHERE person_id = ?;';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.people[i].work_email = resQuery[0].email;
                return getPersonPersonalEmail(options);
            } else {
                options.people[i].work_email = undefined;
                return getPersonPersonalEmail(options);
            }
        },
        options);
};
var getPersonPersonalEmail = function (options) {
    let { req, res, next, i, people } = options;
    let person = people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM personal_emails WHERE person_id = ?;';
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.people[i].personal_email = resQuery[0].email;
                sendBirthdayMessage(options)
                .catch((e) => {
                    console.log(e);
                    return finalVerification(options);
                });
            } else {
                options.people[i].personal_email = undefined;
                sendBirthdayMessage(options)
                .catch((e) => {
                    console.log(e);
                    return finalVerification(options);
                });
            }
        },
        options);
};
async function sendBirthdayMessage(options) {
    let { req, res, next, i, people } = options;
    let person = people[i];
    let subjectText = 'Today it\'s your birthday! Congratulations from the LAQV/UCIBIO platform!';
    let recipients = '';
    if (person.work_email !== undefined && person.work_email !== null) {
        recipients = recipients + person.work_email + ', ';
    }
    if (person.personal_email !== undefined && person.personal_email !== null) {
        recipients = recipients + person.personal_email + ', ';
    }
    if (recipients !== '') {
        let emailBody = 'Dear ' + person.colloquial_name + ',\n\n'
                    + 'The LAQV/UCIBIO data management platform (https://v2.laqv-ucibio.info)'
                    + ' wishes you a happy birthday.\n\n'
                    + 'We take this opportunity to remind you that we are just 1-click away'
                    + ' and that accurate, complete and updated data from you is essential'
                    + ' for the success of the Research Units (applications, activity reports and many other).\n\n'
                    + 'If currently you are no longer associated with LAQV or UCIBIO,'
                    + ' or if you don\'t want to receive more automatic emails like this'
                    + ' please let us know by sending an email to josebraga@fct.unl.pt.\n\n'
                    + 'Best regards,\n'
                    + 'LAQV/UCIBIO data management platform'
        ;
        let emailBodyHtml = '<p>' + 'Dear ' + person.colloquial_name + ',</p>'
                    + '<p>The LAQV/UCIBIO data management platform'
                    + ' (<a href="https://v2.laqv-ucibio.info">https://v2.laqv-ucibio.info</a>) wishes you a happy birthday!</p>'
                    + '<p>We take this opportunity to remind you that we are just 1-click away'
                    + ' and that accurate, complete and updated data from you is essential'
                    + ' for the success of the Research Units (applications, activity reports and many other).</p>'
                    + '<p>If currently you are no longer associated with LAQV or UCIBIO,'
                    + ' or if you don\'t want to receive more automatic emails like this'
                    + ' please let us know by sending an email to <a href="mailto:josebraga@fct.unl.pt">José Braga</a>.</p>'
                    + '<p>Best regards,<br>'
                    + 'LAQV/UCIBIO data management platform</p>'
        ;
        if (process.env.NODE_ENV === 'production') {
            mailOptions = {
                from: '"Admin" <admin@laqv-ucibio.info>', // sender address
                // to: recipients, // list of receivers (comma-separated)
                to: 'josebraga@fct.unl.pt',
                subject: subjectText, // Subject line
                text: emailBody,
                html: emailBodyHtml,
            };
            // send mail with defined transport object
            let info = await transporter.sendMail(mailOptions);
            console.log(recipients, '- Message', info.messageId,'sent:', info.response);
            return finalVerification(options);
        } else {
            // just for testing purposes
            mailOptions = {
                from: '"Admin" <admin@laqv-ucibio.info>', // sender address
                //to: recipients, // list of receivers (comma-separated)
                to: 'josebraga@fct.unl.pt',
                subject: 'TESTING: ' + subjectText, // Subject line
                text: emailBody,
                html: emailBodyHtml,
            };
            // send mail with defined transport object
            let info = await transporter.sendMail(mailOptions);
            console.log(recipients, '- Message', info.messageId,'sent:', info.response);
            return finalVerification(options);
        }
    } else {
        return finalVerification(options);
    }
}

var finalVerification = function (options) {
    let { req, res, next, i, people } = options;
    if (i + 1 < people.length) {
        options.i = i + 1;
        return getPersonWorkEmail(options);
    } else {
        return responses.sendJSONResponseOptions({
            response: res,
            status: 200,
            message: {
                "status": "success",
                "statusCode": 200,
                "message": "The operation was completed successfully!",
            }
        });
    }
}

module.exports.getBirthdayPeople = function (req, res, next) {
    return authenticate({ req, res, next });
};
