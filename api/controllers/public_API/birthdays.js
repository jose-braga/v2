const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
var passport = require('../../config/passport');
var time = require('../../controllers/utilities/time');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;


var emailTexts = function (options){
    let { req, res, next, i, people } = options;
    let person = people[i];
    //console.log(person)
    if (person.active_unit === undefined && person.inactive_unit === undefined ) {
        // no affiliations defined
        return {
            subjectText: undefined,
            emailBody: undefined,
            emailBodyHtml: undefined
        };
    } else if (person.active_unit === 'UCIBIO') {
        return {
            subjectText: 'Today it\'s your birthday! Congratulations from the UCIBIO Team!',
            emailBody: 'Dear ' + person.colloquial_name + ',\n\n'
                + 'The UCIBIO team wishes you a happy birthday!\n\n'
                + 'We take this opportunity to remind you to complete and update'
                + ' your information in the UCIBIO data management platform'
                + ' (just click here: https://v2.laqv-ucibio.info).'
                + ' Such information is essential for the success of the'
                + ' Research Unit (applications, activity reports and many other).\n\n'
                + 'If currently you are no longer associated with UCIBIO,'
                + ' or if you don\'t want to receive more automatic emails like this'
                + ' please let us know by sending an email to José Braga (josebraga@fct.unl.pt).\n\n'
                + 'Best regards,\n'
                + 'UCIBIO Team',
            emailBodyHtml: '<p>' + 'Dear ' + person.colloquial_name + ',</p>'
            + '<p>The UCIBIO team wishes you a happy birthday!</p>'
            + '<p>We take this opportunity to remind you to complete and update'
            + ' your information in the UCIBIO data management platform'
            + ' (just click here <a href="https://v2.laqv-ucibio.info">https://v2.laqv-ucibio.info</a>).'
            + ' Such information is essential for the success of the Research Unit'
            + ' (to write institutional applications, activity reports and many other).</p>'
            + '<p>If currently you are no longer associated with UCIBIO,'
            + ' or if you don\'t want to receive more automatic emails like this'
            + ' please let us know by sending an email to <a href="mailto:josebraga@fct.unl.pt">José Braga</a>.</p>'
            + '<p>Best regards,<br>'
            + 'UCIBIO Team</p>'
        };
    } else if (person.active_unit === 'LAQV') {
        return {
            subjectText: 'Today it\'s your birthday! Congratulations from the LAQV Team!',
            emailBody: 'Dear ' + person.colloquial_name + ',\n\n'
                + 'The LAQV team wishes you a happy birthday!\n\n'
                + 'We take this opportunity to remind you to complete and update'
                + ' your information in the LAQV data management platform'
                + ' (just click here: https://v2.laqv-ucibio.info).'
                + ' Such information is essential for the success of the'
                + ' Research Unit (applications, activity reports and many other).\n\n'
                + 'If currently you are no longer associated with LAQV,'
                + ' or if you don\'t want to receive more automatic emails like this'
                + ' please let us know by sending an email to José Braga (josebraga@fct.unl.pt).\n\n'
                + 'Best regards,\n'
                + 'LAQV Team',
            emailBodyHtml: '<p>' + 'Dear ' + person.colloquial_name + ',</p>'
            + '<p>The LAQV team wishes you a happy birthday!</p>'
            + '<p>We take this opportunity to remind you to complete and update'
            + ' your information in the LAQV data management platform'
            + ' (just click here <a href="https://v2.laqv-ucibio.info">https://v2.laqv-ucibio.info</a>).'
            + ' Such information is essential for the success of the Research Unit'
            + ' (to write institutional applications, activity reports and many other).</p>'
            + '<p>If currently you are no longer associated with LAQV,'
            + ' or if you don\'t want to receive more automatic emails like this'
            + ' please let us know by sending an email to <a href="mailto:josebraga@fct.unl.pt">José Braga</a>.</p>'
            + '<p>Best regards,<br>'
            + 'LAQV Team</p>'
        };

    } else if (person.inactive_unit === 'UCIBIO') {
        return {
            subjectText: 'Today it\'s your birthday! Congratulations from the UCIBIO Team!',
            emailBody: 'Dear ' + person.colloquial_name + ',\n\n'
                + 'The UCIBIO team wishes you a happy birthday!\n\n'
                + 'We take this opportunity to inform you that according to our'
                + ' records you do not have an ongoing affiliation with UCIBIO.'
                + ' If this information is wrong or if you don\'t want to receive'
                + ' more automatic emails like this please let us know by'
                + ' sending an email to José Braga (josebraga@fct.unl.pt).\n\n'
                + 'Best regards,\n'
                + 'UCIBIO Team',
            emailBodyHtml: '<p>' + 'Dear ' + person.colloquial_name + ',</p>'
            + '<p>The UCIBIO team wishes you a happy birthday!</p>'
            + '<p>We take this opportunity to inform you that according to our'
            + ' records you do not have an ongoing affiliation with UCIBIO.'
            + ' If this information is wrong or if you don\'t want to receive'
            + ' more automatic emails like this please let us know'
            + ' by sending an email to <a href="mailto:josebraga@fct.unl.pt">José Braga</a>.</p>'
            + '<p>Best regards,<br>'
            + 'UCIBIO Team</p>'
        };
    } else if (person.inactive_unit === 'LAQV') {
        return {
            subjectText: 'Today it\'s your birthday! Congratulations from the LAQV Team!',
            emailBody: 'Dear ' + person.colloquial_name + ',\n\n'
                + 'The LAQV team wishes you a happy birthday!\n\n'
                + 'We take this opportunity to inform you that according to our'
                + ' records you do not have an ongoing affiliation with LAQV.'
                + ' If this information is wrong or if you don\'t want to receive'
                + ' more automatic emails like this please let us know by'
                + ' sending an email to José Braga (josebraga@fct.unl.pt).\n\n'
                + 'Best regards,\n'
                + 'LAQV Team',
            emailBodyHtml: '<p>' + 'Dear ' + person.colloquial_name + ',</p>'
            + '<p>The LAQV team wishes you a happy birthday!</p>'
            + '<p>We take this opportunity to inform you that according to our'
            + ' records you do not have an ongoing affiliation with LAQV.'
            + ' If this information is wrong or if you don\'t want to receive'
            + ' more automatic emails like this please let us know by'
            + ' by sending an email to <a href="mailto:josebraga@fct.unl.pt">José Braga</a>.</p>'
            + '<p>Best regards,<br>'
            + 'LAQV Team</p>'
        };

    }
};

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
    //month_day = '-06-07'
    let this_birthday = '%' + month_day;
    querySQL = querySQL
        + 'SELECT * FROM people'
        + ' WHERE birth_date LIKE ?'
        + ' AND people.status = 1'
        + ' AND receives_automatic_emails = 1;'
        ;
    places.push(this_birthday);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.people = resQuery;
                options.i = 0;
                return getPersonStatusActive(options);
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
var getPersonStatusActive = function (options) {
    let { req, res, next, i, people } = options;
    let person = people[i];
    //console.log('////////////////////////////////////////////////////////////')
    //console.log(person.name)
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_labs.*, labs.name AS lab_name,'
        + ' `groups`.name AS group_name, units.short_name AS unit_name'
        + ' FROM people_labs'
        + ' JOIN labs ON labs.id = people_labs.lab_id'
        + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
        + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
        + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
        + ' JOIN units ON units.id = groups_units.unit_id'
        + ' WHERE people_labs.person_id = ?'
        + ' AND ((people_labs.valid_from IS NULL AND people_labs.valid_until IS NULL)'
        + ' OR (people_labs.valid_from <= curdate() AND people_labs.valid_until IS NULL)'
        + ' OR (people_labs.valid_from IS NULL AND people_labs.valid_until >= curdate())'
        + ' OR (people_labs.valid_from <= curdate() AND people_labs.valid_until >= curdate()))'
        ;
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            //console.log(resQuery)
            if (resQuery.length > 0) {
                //console.log('-----------Active--------------')
                //console.log(resQuery)
                options.people[i].active_unit = resQuery[0].unit_name;
                options.people[i].inactive_unit = undefined;
                // if there's an active position it does not matter what are the inactive ones
                return getPersonWorkEmail(options);
            } else {
                //console.log('-----------Inactive--------------')
                options.people[i].active_unit = undefined;
                return getPersonStatusInactive(options);
            }
        },
        options);
};
var getPersonStatusInactive = function (options) {
    let { req, res, next, i, people } = options;
    let person = people[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people_labs.*, labs.name AS lab_name,'
        + ' `groups`.name AS group_name, units.short_name AS unit_name'
        + ' FROM people_labs'
        + ' JOIN labs ON labs.id = people_labs.lab_id'
        + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
        + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
        + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
        + ' JOIN units ON units.id = groups_units.unit_id'
        + ' WHERE people_labs.person_id = ?'
        + ' AND people_labs.valid_until < curdate()'
        ;
    places.push(person.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.people[i].inactive_unit = resQuery[0].unit_name;
            } else {
                options.people[i].inactive_unit = undefined;
            }
            return getPersonWorkEmail(options);
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
            } else {
                options.people[i].work_email = undefined;
            }
            return getPersonPersonalEmail(options);
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
            } else {
                options.people[i].personal_email = undefined;
            }
            sendBirthdayMessage(options)
                .catch((e) => {
                    console.log(e);
                    return finalVerification(options);
                });
        },
        options);
};
async function sendBirthdayMessage(options) {
    let { req, res, next, i, people } = options;
    let person = people[i];
    let recipients = '';
    if (person.work_email !== undefined && person.work_email !== null) {
        recipients = recipients + person.work_email + ', ';
    }
    if (person.personal_email !== undefined && person.personal_email !== null) {
        recipients = recipients + person.personal_email + ', ';
    }
    if (recipients !== '') {
        let mailOptions;
        let texts = emailTexts(options);
        //console.log(texts)
        if (texts.subjectText !== undefined) {
            if (process.env.NODE_ENV === 'production') {
                mailOptions = {
                    from: '"Admin" <admin@laqv-ucibio.info>', // sender address
                    // to: recipients, // list of receivers (comma-separated)
                    to: 'josebraga@fct.unl.pt',
                    subject: texts.subjectText, // Subject line
                    text: texts.emailBody,
                    html: texts.emailBodyHtml,
                };
            } else {
                // just for testing purposes
                mailOptions = {
                    from: '"Admin" <admin@laqv-ucibio.info>', // sender address
                    //to: recipients, // list of receivers (comma-separated)
                    to: 'josebraga@fct.unl.pt',
                    subject: 'TESTING: ' + texts.subjectText, // Subject line
                    text: texts.emailBody,
                    html: texts.emailBodyHtml,
                };
            }
            // send mail with defined transport object
            let info = await transporter.sendMail(mailOptions);
            console.log(recipients, '- Message', info.messageId,'sent:', info.response);
        }
        return finalVerification(options);
    } else {
        return finalVerification(options);
    }
}

var finalVerification = function (options) {
    let { req, res, next, i, people } = options;
    if (i + 1 < people.length) {
        options.i = i + 1;
        return getPersonStatusActive(options);
    } else {
        return responses.sendJSONResponseOptions({
            response: res,
            status: 200,
            message: {
                "status": "success",
                "statusCode": 200,
                "message": "The 'birthday email sending' script has completed successfully!",
            }
        });
    }
}

module.exports.getBirthdayPeople = function (req, res, next) {
    return authenticate({ req, res, next });
};
