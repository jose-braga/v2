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

var getPersonLab = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + ' SELECT people_labs.*, labs.name AS lab_name'
        + ' FROM people_labs'
        + ' JOIN labs ON labs.id = people_labs.lab_id'
        + ' WHERE people_labs.person_id = ?'
            + ' AND ((people_labs.valid_from IS NULL OR people_labs.valid_from <= CURDATE())'
            + ' AND (people_labs.valid_until IS NULL OR people_labs.valid_until >= CURDATE())'
        + ');';
    places.push(personID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.labs = resQuery;
                return getPersonSupervisor(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 400,
                    message: {
                        "status": "success",
                        "statusCode": 400,
                        "message": "You are not currently associated with any labs/groups of LAQV or UCIBIO.",
                    }
                });
            }
        },
        options);
}
var getPersonSupervisor = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + ' SELECT people_responsibles.*, people.name AS supervisor_name'
        + ' FROM people_responsibles'
        + ' JOIN people ON people.id = people_responsibles.responsible_id'
        + ' WHERE people_responsibles.person_id = ?'
            + ' AND ((people_responsibles.valid_from IS NULL OR people_responsibles.valid_from <= CURDATE())'
            + ' AND (people_responsibles.valid_until IS NULL OR people_responsibles.valid_until >= CURDATE())'
        + ');';
    places.push(personID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.supervisors = resQuery;
                return getPersonProfessionalSituation(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 400,
                    message: {
                        "status": "success",
                        "statusCode": 400,
                        "message": "You did not define any supervisors/responsibles.",
                    }
                });
            }
        },
        options);
}
var getPersonProfessionalSituation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + ' SELECT jobs.*, categories.name_en AS category_name_en,'
        + ' situations.name_en AS situation_name_en'
        + ' FROM jobs'
        + ' JOIN categories_situations ON categories_situations.id = jobs.category_situation_id'
        + ' JOIN categories ON categories.id = categories_situations.category_id'
        + ' JOIN situations ON situations.id = categories_situations.situation_id'
        + ' WHERE jobs.person_id = ?'
            + ' AND ((jobs.valid_from IS NULL OR jobs.valid_from <= CURDATE())'
            + ' AND (jobs.valid_until IS NULL OR jobs.valid_until >= CURDATE())'
        + ');';
    places.push(personID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.jobs = resQuery;
                return getPersonDepartments(options);
                //return getRecipientsGroups(options, 3, true);

            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 400,
                    message: {
                        "status": "success",
                        "statusCode": 400,
                        "message": "You have no professional situations defined!",
                    }
                });
            }
        },
        options);
}
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
                    return getRecipientsGroups(options, 3, 1);
                } else if (department.name_en === 'Life Sciences') {
                    options.departmentString = 'DCV';
                    return getRecipientsGroups(options, 3, 1);
                } else if (department.name_en === 'Conservation and Restoration') {
                    options.departmentString = 'DCR';
                    return getRecipientsGroups(options, 3, 1);
                } else {
                    return responses.sendJSONResponseOptions({
                        response: res,
                        status: 400,
                        message: {
                            "status": "success",
                            "statusCode": 400,
                            "message": "Your department was not found!",
                        }
                    });
                }
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 400,
                    message: {
                        "status": "success",
                        "statusCode": 400,
                        "message": "You are not associated with any FCT NOVA department.",
                    }
                });
            }
        },
        options);
}
var getRecipientsGroups = function (options, email_type_id, city_id) {
    let { req, res, next } = options;
    //let { currentCity } = req.payload;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT recipient_groups.*, emails.person_id, emails.email'
        + ' FROM recipient_groups'
        + ' LEFT JOIN people_recipient_groups ON people_recipient_groups.recipient_group_id = recipient_groups.id'
        + ' LEFT JOIN emails ON emails.person_id = people_recipient_groups.person_id'
        + ' WHERE recipient_groups.city_id = ?'
        + ' AND recipient_groups.any_cities = 0'
        + ' AND recipient_groups.email_type_id = ?'
        + ' AND recipient_groups.name_en LIKE "FCT car authorization%'+ options.departmentString +'%";'
    places.push(city_id, email_type_id);
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
    let { req, res, next } = options;
    if (recipientEmails.length > 0) {
        options.recipientGroup = recipientEmails[0].id;
    }
    let recipients = '';
    for (let el in recipientEmails) {
        recipients = recipients + recipientEmails[el].email + ', ';
    }
    let cc_recipients = '';
    for (let ind in options.supervisors) {
        cc_recipients = cc_recipients + options.supervisors[ind].email + ', ';
    }
    let labs_text = '';
    for (let ind in options.labs) {
        labs_text = labs_text + options.labs[ind].lab_name + '; ';
    }
    let supervisors_text = '';
    for (let ind in options.supervisors) {
        supervisors_text = supervisors_text + options.supervisors[ind].supervisor_name + '; ';
    }
    let jobs_text = '';
    for (let ind in options.jobs) {
        jobs_text = jobs_text + options.jobs[ind].category_name_en
            + ' - ' + options.jobs[ind].situation_name_en
            + ' (' + time.momentToDate(options.jobs[ind].valid_from, undefined, 'YYYY-MM-DD')
            + ' - ' + time.momentToDate(options.jobs[ind].valid_until, undefined, 'YYYY-MM-DD')
            + ')'
            + '; ';
    }
    let data = req.body.data;
    let cars_text = '';
    let drivers_license = ''
    for (let ind in data.cars) {
        drivers_license = data.cars[ind].license;
        cars_text = cars_text + data.cars[ind].plate
            + ' - ' + data.cars[ind].brand + ' ' + data.cars[ind].model
            + ' (' + data.cars[ind].color + ')'
            + '\n';
    }

    let mailOptions;
    let subjectText = 'LAQV/UCIBIO Data Management - Car alteration: ' + data.personName;
    let emailBody = 'Hi,\n\n'
        + 'The user ' + data.personName + ' is requesting a change in his/hers car entry data:\n\n'
        + data.message + '\n\n'
        + 'Car(s) data:\n\n'
        + cars_text + '\n\n'
        + 'User data:\n\n'
        + ' Driver\'s License:' + drivers_license + '\n'
        + ' Lab(s)/Group(s):' + labs_text + '\n'
        + ' Supervisor(s):' + supervisors_text + '\n'
        + ' Professional Situation(s):' + jobs_text + '\n'
        + '\n\nBest regards,\nAdmin';
    let emailBodyHtml = '<p>Hi,</p><br>'
        + '<p>The user ' + data.personName + ' is requesting a change in his/hers car entry data'
        + ' and added the following message:</p>'
        + '<p>' + data.message + '</p>'
        + '<p>' + '<b>Car(s) data:</b>' + '</p>'
        + '<p>' + cars_text + '</p>'
        + '<p>' + '<b>User data:</b>' + '</p>'
        + '<p>Driver\'s License: ' + drivers_license + '</p>'
        + '<p>Lab(s)/Group(s): ' + labs_text + '</p>'
        + '<p>Supervisor(s): ' + supervisors_text + '</p>'
        + '<p>Professional Situation(s): ' + jobs_text + '</p>';

    emailBodyHtml = emailBodyHtml + '<br><p>Best regards,</p>'
            + '<p>Admin</p>';
    options.subjectText = subjectText;
    options.emailBody = emailBody;
    if (process.env.NODE_ENV === 'production') {
        mailOptions = {
            from: '"Admin" <admin@laqv-ucibio.info>', // sender address
            to: recipients, // list of receivers (comma-separated)
            //cc: cc_recipients,
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
            //cc: cc_recipients,
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
module.exports.sendChangeMessage = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            return getPersonLab(options)
        },
        { req, res, next }
    );
};