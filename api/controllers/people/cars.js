const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const time = require('../utilities/time');
const permissions = require('../utilities/permissions');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;

var actionGetCars = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM cars'
                        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.getCars = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetCars(options) },
        { req, res, next }
    );
};

var actionCreateCar = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO cars'
                        + ' (person_id, license, brand, model, color, plate)'
                        + ' VALUES (?,?,?,?,?,?);';
    places.push(personID, data.license, data.brand,
        data.model, data.color, data.plate)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.createCar = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateCar(options) },
        { req, res, next }
    );
};

var actionUpdateCar = function (options) {
    let { req, res, next } = options;
    let carID = req.params.carID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE cars'
                        + ' SET license  = ?,'
                        + ' brand = ?,'
                        + ' model = ?,'
                        + ' color = ?,'
                        + ' plate = ?'
                        + ' WHERE id = ?;';
    places.push(data.license, data.brand, data.model,
        data.color, data.plate, carID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updateCar = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateCar(options) },
        { req, res, next }
    );
};

var actionDeleteCar = function (options) {
    let { req, res, next } = options;
    let carID = req.params.carID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM cars'
                        + ' WHERE id = ?;';
    places.push(carID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.deleteCar = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteCar(options) },
        { req, res, next }
    );
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
            actionSendChangeMessage(options, resQuery)
                .catch((e) => {
                    console.log(e);
                    return writeMessageDB(options, e);
                });
        },
        options);
};
async function actionSendChangeMessage(options, recipientEmails) {
    options.recipientGroup = recipientEmails[0].id;
    let recipients = '';
    for (let el in recipientEmails) {
        recipients = recipients + recipientEmails[el].email + ', ';
    }
    let { req, res, next } = options;
    let data = req.body.data;
    let mailOptions;
    let subjectText = 'Car alteration: ' + data.personName;
    let emailBody = 'Hi,\n\n'
        + 'The user ' + data.personName + ' is requesting a change in his/hers car entry data:\n\n'
        + data.message
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
    if (error) {
        responses.sendJSONResponseOptions({
            response: res,
            status: 500,
            message: { "message": "Error sending email", "error": error.message }
        });
        return;
    }
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
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
module.exports.sendChangeMessage = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            getRecipientsGroups(options, 3, true);
        },
        { req, res, next }
    );
};