const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const time = require('../utilities/time');
const permissions = require('../utilities/permissions');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;

var getPersonDepartments = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + ' SELECT departments.*'
        + ' FROM people_departments'
        + ' JOIN departments ON departments.id = people_departments.department_id'
        + ' WHERE people_departments.person_id = ?;';
    places.push(personID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                let department = resQuery[0];
                options.departmentString = '-----------'
                if (department.name_en === 'Chemistry') {
                    options.departmentString = 'DQ';
                    return getRecipientsGroupAccess(options, 2, 1);
                } else if (department.name_en === 'Life Sciences') {
                    options.departmentString = 'DCV';
                    return getRecipientsGroupAccess(options, 2, 1);
                } else if (department.name_en === 'Conservation and Restoration') {
                    options.departmentString = 'DCR';
                    return getRecipientsGroupAccess(options, 2, 1);
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
                return getPersonCars(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "message": "Done!",
                    }
                });
            }
        },
        options);
}
var getRecipientsGroupAccess = function (options, email_type_id, city_id) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT recipient_groups.*, emails.person_id, emails.email'
        + ' FROM recipient_groups'
        + ' LEFT JOIN people_recipient_groups ON people_recipient_groups.recipient_group_id = recipient_groups.id'
        + ' LEFT JOIN emails ON emails.person_id = people_recipient_groups.person_id'
        + ' WHERE recipient_groups.city_id = ?'
        + ' AND recipient_groups.any_cities = 0'
        + ' AND recipient_groups.email_type_id = ?'
        + ' AND recipient_groups.name_en LIKE "FCT Security%'+ options.departmentString +'%";'
        ;
    places.push(city_id, email_type_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                actionSendMessage(options, resQuery)
                .catch((e) => {
                    console.log(e);
                    return writeMessageDB(options, e);
                });
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "message": "Done!",
                    }
                });
            }
        },
        options);
};
async function actionSendMessage(options, recipientEmails) {
    let { req, res, next } = options;
    let personName = '';
    let message = '';
    if (req.body.data !== undefined) {
        personName = req.body.data.personName;
        message = req.body.data.message;
    }
    let recipients = '';
    for (let el in recipientEmails) {
        recipients = recipients + recipientEmails[el].email + ', ';
    }
    let mailOptions;
    let subjectText = 'LAQV/UCIBIO Data Management - "Departamental" access request by ' + personName;
    let emailBody = 'Hi,\n\n'
        + 'The user ' + personName + ' is requesting a renewal on the access'
        + ' to the "Departamental" building and added the following message:\n\n'
        message
        + '\n\nBest regards,\nAdmin';
    let emailBodyHtml = '<p>Hi,</p><br>'
        + '<p>The user ' + personName + ' is requesting a renewal on the access'
        + ' to the "Departamental" building and added the following message:</p>'
        + '<p>' + message + '</p>'
    emailBodyHtml = emailBodyHtml + '<br><p>Best regards,</p>'
            + '<p>Admin</p>';
    options.subjectText = subjectText;
    options.emailBody = emailBody;
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
        return writeMessageDB(options);

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
        return writeMessageDB(options);
    }
};
var writeMessageDB = function (options, error) {
    let today = time.moment();
    let now = time.momentToDate(today, 'Europe/Lisbon', 'YYYY-MM-DD HH:mm:ss')
    let { req, res, next, recipientGroup, subjectText, emailBody } = options;
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
module.exports.sendMessage = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            getPersonDepartments(options);
        },
        { req, res, next }
    );
};