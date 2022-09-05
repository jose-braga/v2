const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
var passport = require('../../config/passport');
var time = require('../utilities/time');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;

var emailTexts = function (options){
    let { req, res, next, peopleListObj, i, todayRecipients } = options;
    let person = peopleListObj[todayRecipients[i]];
    return {
        subjectText: 'A gentle reminder from the platform https://v2.laqv-ucibio.info',
        emailBody: 'Dear ' + person.colloquial_name + ',\n\n'
            + 'This is an automatic annual reminder from the data management platform '
            + ' at https://v2.laqv-ucibio.info and its sole purpose is to remind'
            + ' you to check and update your profile.\n\n'
            + ' Your contribution is essential for writing successful institutional'
            + '  applications, activity reports and many science management tasks.\n\n'
            + 'If currently you are no longer associated with LAQV or UCIBIO,'
            + ' or if you don\'t want to receive more automatic emails like this'
            + ' please let us know by sending an email to José Braga (josebraga@fct.unl.pt).\n\n'
            + 'Best regards,\n'
            + 'José Braga\n'
            + 'Platform developer',
        emailBodyHtml: '<p>' + 'Dear ' + person.colloquial_name + ',</p>'
        + '<p>This is an automatic annual reminder from the data management platform at '
        + '<a href="https://v2.laqv-ucibio.info">https://v2.laqv-ucibio.info</a>'
        + ' and its sole purpose is to remind you to check and update your profile.</p>'
        + '<p>Your contribution is essential for writing successful institutional'
        + ' applications, activity reports and many science management tasks.</p>'
        + '<p>If currently you are no longer associated with LAQV or UCIBIO,'
        + ' or if you don\'t want to receive more automatic emails like this'
        + ' please let us know by sending an email to <a href="mailto:josebraga@fct.unl.pt">José Braga</a>.</p>'
        + '<p>Best regards,<br>'
        + 'José Braga<br>'
        + 'Platform developer</p>'
    };
    /*
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
            + ' more automatic emails like this please let us know by'
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
    */
};

var authenticate = function (options) {
    let { req, res, next } = options;
    if (!req.body.username || !req.body.password) {
        responses.sendJSONResponse(res, 400, {
            "message": "All fields required"
        });
        console.log('Problem in authorization of script for yearly notification of people (1).')
        return;
    }
    if (req.body.username !== 'josebraga') {
        responses.sendJSONResponse(res, 400, {
            "message": "Incorrect username for this operation."
        });
        console.log('Problem in authorization of script for yearly notification of people (2).')
        return;
    }
    passport.authenticate('local-login', function (err, user, info) {
        if (err) {
            responses.sendJSONResponse(res, 404, err);
            return;
        }
        if (user) {
            return getPersonActive(options);

        } else {
            responses.sendJSONResponse(res, 401, info);
        }
    })(req, res);


};


var getPersonActive = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT people_labs.person_id, people.`name`, people.colloquial_name'
        + ' FROM people_labs'
        + ' JOIN people ON people.id = people_labs.person_id'
        + ' WHERE people.status = 1 AND people.receives_automatic_emails = 1'
        + ' AND ((people_labs.valid_from IS NULL AND people_labs.valid_until IS NULL)'
        + ' OR (people_labs.valid_from <= curdate() AND people_labs.valid_until IS NULL)'
        + ' OR (people_labs.valid_from IS NULL AND people_labs.valid_until >= curdate())'
        + ' OR (people_labs.valid_from <= curdate() AND people_labs.valid_until >= curdate()))'
        + ' ORDER BY person_id;'
        ;
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.peopleList = resQuery;
            let peopleListObj = {};
            for (let ind in resQuery) {
                peopleListObj[resQuery[ind].person_id] = resQuery[ind];
            }
            options.peopleListObj = peopleListObj;
            return getPeopleAlreadyReceived(options);
        },
        options);
};
var getPeopleAlreadyReceived = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT person_id'
        + ' FROM yearly_notification_email'
        + ' WHERE year = year(curdate())'
        + ' ORDER BY person_id;'
        ;
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.peopleReceived = resQuery;
            return selectTodayRecipients(options);
        },
        options);
};

// the set of people who didn't receive an email this year yet
// is divided between the remainig days of the year
var selectTodayRecipients = function (options) {
    let { req, res, next, peopleList, peopleReceived } = options;
    let today = time.moment();
    let year = today.year();
    let endYear = time.moment(year + '-12-15'); // to avoid the Christmas season
    let scriptStartDate = time.moment(year + '-01-15'); // to avoid the Christmas season
    if (today.isBefore(scriptStartDate)) {
        return responses.sendJSONResponseOptions({
            response: res,
            status: 200,
            message: {
                "status": "success",
                "statusCode": 200,
                "message": "Script didn't run. Too early in the year.",
            }
        });
    } else if (today.isAfter(endYear)) {
        return responses.sendJSONResponseOptions({
            response: res,
            status: 200,
            message: {
                "status": "success",
                "statusCode": 200,
                "message": "Script didn't run. Last days of the year.",
            }
        });
    } else {
        let numberDays = endYear.diff(today,'days');
        options.year = year;
        //debug:
        /*peopleList = [
            {person_id: 1, name: 'MJR', colloquial_name: 'MJR2'},
            {person_id: 5, name: 'CLE', colloquial_name: 'CLE'},
            {person_id: 7, name: 'PMVB', colloquial_name: 'PMVB'},
            {person_id: 19, name: 'ISN', colloquial_name: 'ISN'},
            {person_id: 202, name: 'Jam D', colloquial_name: 'Jam D'},
        ]
        let peopleListObj = {}
        for (let ind in peopleList) {
            peopleListObj[peopleList[ind].person_id] = peopleList[ind]
        }
        options.peopleListObj = peopleListObj
        peopleReceived = [
            {person_id: 1, },
            {person_id: 5, },
            {person_id: 7, },
            //{person_id: 19,},
            //{person_id: 202,},
        ]
        */
        //easier to do if these lists are converted into a simple array
        let peopleListArray = peopleList.map(el => el.person_id);
        let peopleReceivedArray = new Set(peopleReceived.map(el => el.person_id));
        //construct the list of people that didn't receive emails
        let allRecipients = peopleListArray.filter(el => !peopleReceivedArray.has(el));
        let totalRecipients = allRecipients.length;
        let maxTodayRecipients = Math.ceil((totalRecipients * 1.0)/(numberDays * 1.0));
        if (totalRecipients > 0) {
            if (totalRecipients <= maxTodayRecipients) {
                options.todayRecipients = allRecipients;
            } else {
                // randomly select people to be recipients
                let todayRecipients = [];
                let possibleRecipients = [...allRecipients];
                for (let ind = 0; ind < maxTodayRecipients; ind++) {
                    let randIndex = Math.floor(Math.random()*possibleRecipients.length);
                    todayRecipients.push(possibleRecipients[randIndex]);
                    possibleRecipients.splice(randIndex, 1);
                }
                options.todayRecipients = todayRecipients;
                console.log(todayRecipients)
            }
            options.i = 0;
            return getPersonPersonalEmail(options)
        } else {
            // there are no more people to send the email
            return responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success",
                    "statusCode": 200,
                    "message": "Script completed successfully. There were no more new recipients.",
                }
            });
        }
    }
};
var getPersonPersonalEmail = function (options) {
    let { req, res, next, i, todayRecipients } = options;
    let person_id = todayRecipients[i];

    console.log(i,'----------', person_id)

    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM personal_emails WHERE person_id = ?;';
    places.push(person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.this_personal_email = resQuery[0].email;
            } else {
                options.this_personal_email = undefined;
            }
            return getPersonWorkEmail(options);
        },
        options);
};
var getPersonWorkEmail = function (options) {
    let { req, res, next, i, todayRecipients } = options;
    let person_id = todayRecipients[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM emails WHERE person_id = ?;';
    places.push(person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.this_work_email = resQuery[0].email;
            } else {
                options.this_work_email = undefined;
            }
            sendNotificationMessage(options)
                .catch((e) => {
                    console.log(e);
                    options.sent = false;
                    return writeRecipientDatabase(options);
                });
        },
        options);
};
async function sendNotificationMessage(options) {
    let { req, res, next, this_work_email, this_personal_email } = options;
    let recipients = '';
    if (this_personal_email !== undefined && this_personal_email !== null) {
        recipients = recipients + this_personal_email + ', ';
    }
    if (this_work_email !== undefined && this_work_email !== null) {
        recipients = recipients + this_work_email + ', ';
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
        options.sent = true;
        return writeRecipientDatabase(options);
    } else {
        options.sent = false;
        return writeRecipientDatabase(options);
    }
}
var writeRecipientDatabase = function (options) {
    let { req, res, next, i, todayRecipients, year } = options;
    let person_id = todayRecipients[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO yearly_notification_email (person_id, year, date_sent)'
        + ' VALUES (?,?, NOW());'
        ;
    places.push(person_id, year);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return finalVerification(options);
        },
        options);
};

var finalVerification = function (options) {
    let { req, res, next, i, todayRecipients } = options;
    if (i + 1 < todayRecipients.length) {
        options.i = i + 1;
        return getPersonPersonalEmail(options);
    } else {
        return responses.sendJSONResponseOptions({
            response: res,
            status: 200,
            message: {
                "status": "success",
                "statusCode": 200,
                "message": "Script completed successfully.",
            }
        });
    }
}

module.exports.getActivePeople = function (req, res, next) {
    return authenticate({ req, res, next });
};
