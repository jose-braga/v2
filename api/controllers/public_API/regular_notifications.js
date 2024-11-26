const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
var passport = require('../../config/passport');
var time = require('../utilities/time');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;

let NUMBER_EMAILS_YEAR = 4;
let MONTH_NUMBER = 12;
let MONTH_INTERVAL = Math.floor(MONTH_NUMBER / NUMBER_EMAILS_YEAR);
let MINIMUM_WAIT_MONTHS = Math.max(1, MONTH_INTERVAL - 1);

var emailTexts = function (options){
    let { req, res, next, peopleListObj, i, todayRecipients } = options;
    let person = peopleListObj[todayRecipients[i]];
    return {
        subjectText: 'A gentle reminder from the platform https://v2.laqv-ucibio.info',
        emailBody: 'Dear ' + person.colloquial_name + ',\n\n'
            + 'This is an automatic periodic reminder from the data management platform '
            + ' at https://v2.laqv-ucibio.info and its sole purpose is to remind'
            + ' you to check and update your profile.\n\n'
            + ' A few thing that are really important to check:\n\n'
            + ' - Professional Situations (tab "Academic & Professional")\n'
            + ' - Academic degrees (tab "Academic & Professional")\n'
            + ' - Ciência ID filled in (tab "Institutional & Scientific")\n'
            + ' - Research Unit Affiliations (tab "Institutional & Scientific")\n\n'
            + ' And the following are also relevant for reports or your Research Unit website:\n\n'
            + ' - Data visibility authorization (tab "Personal")\n'
            + ' - Full name, Gender and Nationalities (tab "Personal")\n'
            + ' - Photo (tab "Personal")\n'
            + ' - Personal URLs (tab "Personal")\n'
            + ' - Short CV (for LAQV) or Research Interests (for UCIBIO)\n'
            + ' - Institutional Contacts\n\n'
            + ' Your contribution is essential for writing successful institutional'
            + '  applications, activity reports and many science management tasks.\n\n'
            + 'If currently you are no longer associated with LAQV or UCIBIO,'
            //+ ' or if you don\'t want to receive more automatic emails like this'
            + ' please let us know by sending an email to José Braga (josebraga@fct.unl.pt).\n\n'
            + 'Best regards,\n'
            + 'José Braga\n'
            + 'Platform developer',
        emailBodyHtml: '<p>' + 'Dear ' + person.colloquial_name + ',</p>'
        + '<p>This is an automatic periodic reminder from the data management platform at '
        + '<a href="https://v2.laqv-ucibio.info">https://v2.laqv-ucibio.info</a>'
        + ' and its sole purpose is to remind you to check and update your profile.</p>'
        + ' <p>A few thing that are really important to check:</p>'
        + '<ol>'
            + '<li>Professional Situations (tab "Academic & Professional")</li>'
            + '<li>Academic degrees (tab "Academic & Professional")</li>'
            + '<li>Ciência ID filled in (tab "Institutional & Scientific")</li>'
            + '<li>Research Unit Affiliations (tab "Institutional & Scientific")</li>'
        + '</ol>'
            + ' <p>And the following are also relevant for reports or your Research Unit website:</p>'
        + '<ol>'
            + '<li>Data visibility authorization (tab "Personal")</li>'
            + '<li>Full name, Gender and Nationalities (tab "Personal")</li>'
            + '<li>Photo (tab "Personal")</li>'
            + '<li>Personal URLs (tab "Personal")</li>'
            + '<li>Short CV (for LAQV) or Research Interests (for UCIBIO)</li>'
            + '<li>Institutional Contacts</li>'
        + '</ol>'
        + '<p>Your contribution is essential for writing successful institutional'
        + ' applications, activity reports and many science management tasks.</p>'
        + '<p>If currently you are no longer associated with LAQV or UCIBIO,'
        //+ ' or if you don\'t want to receive more automatic emails like this'
        + ' please let us know by sending an email to'
        + ' <a href="mailto:josebraga@fct.unl.pt">José Braga</a>.</p>'
        + '<p>Best regards,<br>'
        + 'José Braga<br>'
        + 'Platform developer</p>'
    };
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
            return getAllPeopleRecent(options);

        } else {
            responses.sendJSONResponse(res, 401, info);
        }
    })(req, res);
};

/**
 * This gets all people with a current or with a recently finished association
 * @param {*} options
 * @returns
 */
var getAllPeopleRecent = function (options) {
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
        + ' OR (people_labs.valid_from IS NULL AND people_labs.valid_until >= DATE_SUB(curdate(), INTERVAL ? MONTH))'
        + ' OR (people_labs.valid_from <= curdate() AND people_labs.valid_until >= DATE_SUB(curdate(), INTERVAL ? MONTH)))'
        + ' ORDER BY person_id;'
        ;
    places.push(MONTH_INTERVAL, MONTH_INTERVAL);
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

/*
The year will be divided in slots (which I called divisions). Everybody
    should receive an email within a division, but we also try to ensure
    that people who just received an email in a previous division do not receive
    an email right after entering the current division.
*/
var getPeopleAlreadyReceived = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    let currentMonth = time.moment().month() + 1;
    let currentDivision = Math.ceil(currentMonth / MONTH_INTERVAL);
    // Quick algorithm to find the ending month of the "division"
    let endMonthDivision = MONTH_NUMBER;
    for (let i=1; i<=MONTH_NUMBER; i++) {
        if (Math.ceil(i / MONTH_INTERVAL) == currentDivision + 1) {
            endMonthDivision = i - 1;
            break
        }
    }
    // people who received in the current division
    // plus people who received recently an email (from a previous division)
    querySQL = querySQL
        + 'SELECT person_id'
        + ' FROM regular_notification_email'
        + ' WHERE year = year(curdate())'
        + ' AND division = ?'
        + ' OR DATEDIFF(curdate(), date_sent) <= ?'
        + ' ORDER BY person_id;'
        ;
    places.push(currentDivision, MINIMUM_WAIT_MONTHS);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.peopleReceived = resQuery;
            options.currentDivision = currentDivision;
            options.endMonthDivision = endMonthDivision;
            return selectTodayRecipients(options);
        },
        options);
};

// the set of people who didn't receive an email recently
// is divided between the remainig days of the "division"
var selectTodayRecipients = function (options) {
    let { req, res, next, peopleList, peopleReceived,
         currentDivision, endMonthDivision } = options;
    let today = time.moment();
    //debug:
    //let today = time.moment('2024-06-30');
    let year = today.year();
    let endYear = time.moment(year + '-12-15'); // to avoid the Christmas season
    let scriptStartDate = time.moment(year + '-01-06'); // to avoid the Christmas season
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
        let numberDays = 0;
        //console.log(currentDivision == NUMBER_EMAILS_YEAR)
        if (currentDivision == NUMBER_EMAILS_YEAR) {
            numberDays = endYear.diff(today,'days');
        } else {
            let daysInMonth = time.moment([year, endMonthDivision - 1]).daysInMonth();
            let endDateDivision = time.moment([year, endMonthDivision - 1, daysInMonth])
            //console.log('endMonthDivision',endMonthDivision)
            //console.log('daysInMonth',daysInMonth)
            //console.log(endDateDivision.format('YYYY-MM-DD'))
            numberDays = endDateDivision.diff(today,'days');
        }
        //console.log('currentdivision',currentDivision)
        //console.log('number days',numberDays)

        options.year = year;
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
                //Debug
                //console.log('totalRecipients',totalRecipients)
                //console.log('peopleReceivedArray len',peopleReceived.length)
                //console.log('maxTodayRecipients',maxTodayRecipients)
                //console.log('todayRecipients',todayRecipients)
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
    //console.log(i,'----------', person_id)
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
    options.person_id = person_id;
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
    let { req, res, next, this_work_email, this_personal_email, person_id } = options;
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
            //let info = await transporter.sendMail(mailOptions);
            //console.log(recipients, '- Message', info.messageId,'sent:', info.response);
        }
        options.sent = true;
        return writeRecipientDatabase(options);
    } else {
        options.sent = false;
        console.log('Person with ID', person_id, 'has no email registered in the platform.')
        return writeRecipientDatabase(options);
    }
}
var writeRecipientDatabase = function (options) {
    let { req, res, next, i, todayRecipients, year, currentDivision } = options;
    let person_id = todayRecipients[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO regular_notification_email (person_id, year, division, date_sent)'
        + ' VALUES (?,?,?, NOW());'
        ;
    places.push(person_id, year, currentDivision);
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
