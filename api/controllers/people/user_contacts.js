const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;

var actionCreateUserContacts = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    let now = time.momentToDate(time.moment(), 'Europe/Lisbon', 'YYYY-MM-DD HH:mm:ss');
    options.now = now;
    querySQL = querySQL
        + 'INSERT INTO user_contacts'
        + ' (person_id, contact_type_id, subject, email_text, date_sent, solved)'
        + ' VALUES (?,?,?,?,?,?);';
    places.push(personID,
        data.contact_type_id,
        data.subject,
        data.email_text,
        now,
        0
    )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.contactID = resQuery.insertId;
            return getRecipientsGroups(options, 12, false)
        },
        options
    )
};
var getRecipientsGroups = function (options, email_type_id, is_local) {
    let { req, res, next } = options;
    let { currentCity } = req.payload;
    var querySQL = '';
    var places = [];
    if (is_local) {
        querySQL = querySQL + 'SELECT recipient_groups.*, emails.person_id, emails.email'
            + ' FROM recipient_groups'
            + ' JOIN people_recipient_groups ON people_recipient_groups.recipient_group_id = recipient_groups.id'
            + ' LEFT JOIN emails ON emails.person_id = people_recipient_groups.person_id'
            + ' WHERE recipient_groups.city_id = ?'
            + ' AND recipient_groups.any_cities = 0'
            + ' AND recipient_groups.email_type_id = ?;';
        places.push(currentCity.city_id, email_type_id);
    } else {
        querySQL = querySQL + 'SELECT recipient_groups.*, emails.person_id, emails.email'
            + ' FROM recipient_groups'
            + ' JOIN people_recipient_groups ON people_recipient_groups.recipient_group_id = recipient_groups.id'
            + ' LEFT JOIN emails ON emails.person_id = people_recipient_groups.person_id'
            + ' WHERE recipient_groups.city_id IS NULL'
            + ' AND recipient_groups.any_cities = 1'
            + ' AND recipient_groups.email_type_id = ?;';
        places.push(email_type_id);
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionWarnDeveloper(options, resQuery)
                .catch((e) => {
                    console.log(e);
                    return writeMessageDB(options, e);
                });
        },
        options);
};
async function actionWarnDeveloper(options, recipientEmails) {
    if (recipientEmails.length > 0) {
        options.recipientGroup = recipientEmails[0].id;
    }
    let recipients = '';
    for (let el in recipientEmails) {
        recipients = recipients + recipientEmails[el].email + ', ';
    }
    let { req, res, next, contactID } = options;
    let data = req.body.data;
    let contactType = 'Bug';
    if (data.contact_type_id === 2) {
        contactType = 'Suggestion';
    }
    let mailOptions;
    let subjectText = 'User contact - ' + contactType
                    + ' - ID: ' + contactID
                    + '. Subject: ' + data.subject;
    let emailBody = 'Dear developer,\n\n'
        + 'The user ' + data.personName + ' sent you a message:\n\n'
        + data.email_text
        + '\n\nBest regards,\nAdmin';
    options.subjectText = subjectText;
    options.emailBody = emailBody;
    if (process.env.NODE_ENV === 'production') {
        mailOptions = {
            from: '"Admin" <admin@laqv-ucibio.info>', // sender address
            to: recipients, // list of receivers (comma-separated)
            subject: subjectText, // Subject line
            text: emailBody,
        };
        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Message %s sent: %s', info.messageId, info.response);
        return writeMessageDB(options);

    } else {
        // just for testing purposes
        mailOptions = {
            from: '"Admin" <admin@laqv-ucibio.info>', // sender address
            to: recipients, // list of receivers (comma-separated)
            subject: 'TESTING: ' + subjectText, // Subject line
            text: emailBody,
        };
        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Message %s sent: %s', info.messageId, info.response);
        return writeMessageDB(options);
    }
};
var writeMessageDB = function (options, error) {
    let { req, res, next, recipientGroup, subjectText, emailBody, now } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO email_messages'
        + ' (sender_id, recipient_group_id, subject, message_text, date, solved)'
        + ' VALUES (?,?,?,?,?,?);';
    places.push(personID, recipientGroup, subjectText, emailBody, now, 0);
    sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (error) {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 500,
                    message: { "message": "Error sending email, but database OK!", "error": error.message }
                });
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "message": "Done!",
                    }
                });
            }
            return;
        },
        options);
    return;
};
module.exports.createUserContact = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateUserContacts(options) },
        { req, res, next }
    );
};
