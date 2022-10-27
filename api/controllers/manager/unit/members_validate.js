const sql = require('../../utilities/sql');
const time = require('../../utilities/time');
const responses = require('../../utilities/responses');
const permissions = require('../../utilities/permissions');
const nodemailer = require('../../../config/emailer');
const notifications = require('../../utilities/notifications');
let transporter = nodemailer.transporter;

var actionGetMembersValidate = function (options) {
    let { req, res, next } = options;
    let unitID = req.params.unitID;
    let cityID = req.params.cityID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name'
        + ' FROM people'
        + ' LEFT JOIN people_labs ON people_labs.person_id = people.id'
        + ' JOIN labs ON labs.id = people_labs.lab_id'
        + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
        + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
        + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
        + ' JOIN people_institution_city ON people_institution_city.person_id = people.id'
        + ' WHERE people.status = ?';
    places.push(3);
    if (unitID !== undefined) {
        querySQL = querySQL + ' AND groups_units.unit_id = ?';
        places.push(unitID);
    }
    if (cityID !== undefined) {
        querySQL = querySQL + ' AND people_institution_city.city_id = ?';
        places.push(cityID);
    }
    querySQL = querySQL
        + ' UNION'
        + ' SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name'
        + ' FROM people'
        + ' LEFT JOIN technicians ON technicians.person_id = people.id'
        + ' JOIN technicians_units ON technicians_units.technician_id = technicians.id'
        + ' JOIN people_institution_city ON people_institution_city.person_id = people.id'
        + ' WHERE people.status = ?'
    places.push(3);
    if (unitID !== undefined) {
        querySQL = querySQL + ' AND technicians_units.unit_id = ?';
        places.push(unitID);
    }
    if (cityID !== undefined) {
        querySQL = querySQL + ' AND people_institution_city.city_id = ?';
        places.push(cityID);
    }
    querySQL = querySQL
        + ' UNION'
        + ' SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name'
        + ' FROM people'
        + ' LEFT JOIN science_managers ON science_managers.person_id = people.id'
        + ' JOIN science_managers_units ON science_managers_units.science_manager_id = science_managers.id'
        + ' JOIN people_institution_city ON people_institution_city.person_id = people.id'
        + ' WHERE people.status = ?'
    places.push(3);
    if (unitID !== undefined) {
        querySQL = querySQL + ' AND science_managers_units.unit_id = ?';
        places.push(unitID);
    }
    if (cityID !== undefined) {
        querySQL = querySQL + ' AND people_institution_city.city_id = ?';
        places.push(cityID);
    }
    querySQL = querySQL
        + ' UNION'
        + ' SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name'
        + ' FROM people'
        + ' LEFT JOIN people_administrative_offices ON people_administrative_offices.person_id = people.id'
        + ' JOIN people_administrative_units ON people_administrative_units.administrative_id = people_administrative_offices.id'
        + ' JOIN people_institution_city ON people_institution_city.person_id = people.id'
        + ' WHERE people.status = ?'
    places.push(3);
    if (unitID !== undefined) {
        querySQL = querySQL + ' AND people_administrative_units.unit_id = ?';
        places.push(unitID);
    }
    if (cityID !== undefined) {
        querySQL = querySQL + ' AND people_institution_city.city_id = ?';
        places.push(cityID);
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "count": resQuery.length,
                    "result": resQuery
                }
            });
            return;
        },
        options);
};
module.exports.getMembersList = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetMembersValidate(options) },
        { req, res, next }
    );
};

var actionValidate = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + ' UPDATE people'
        + ' SET status = 1'
        + ' WHERE id = ?';
    places.push(personID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { operation: 'create', entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig)
            return addPersonHistory(options);
        },
        options);
};
var addPersonHistory = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + ' INSERT INTO people_history'
        + ' (person_id, status, operation, updated)'
        + ' VALUES (?, ?, ?, NOW());';
    places.push(personID, 1, 'U');
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return getPersonDepartments(options);
        },
        options);
};
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
                } else if (department.name_en === 'Life Sciences') {
                    options.departmentString = 'DCV';
                } else if (department.name_en === 'Conservation and Restoration') {
                    options.departmentString = 'DCR';
                }
                return getPersonCars(options);
            } else {
                return getPersonPersonalEmail(options);
            }
        },
        options);
}

var getPersonCars = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + ' SELECT * FROM cars WHERE person_id = ?;';
    places.push(personID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.cars = resQuery;
                return getRecipientsGroupCar(options, 3, 1);
            } else {
                return getPersonPostRegistrationActions(options);
            }
        },
        options);
}
var getRecipientsGroupCar = function (options, email_type_id, city_id) {
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
        + ' AND recipient_groups.name_en LIKE "FCT car%'+ options.departmentString +'%";'
        ;
    places.push(city_id, email_type_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.recipientGroupCar = resQuery[0].id;
                actionSendCarManagerMessage(options, resQuery)
                .then(() => {
                    getPersonPostRegistrationActions(options)
                })
                .catch((e) => {
                    console.log(e);
                    return getPersonPostRegistrationActions(options);
                });

            } else {
                return getPersonPostRegistrationActions(options);
            }

        },
        options);
};
async function actionSendCarManagerMessage(options, recipientEmails) {
    let { req, res, next } = options;
    let personName = ''
    let cars = options.cars;
    if (req.body.data !== undefined) {
        personName = req.body.data.name;
    }
    let recipients = '';
    for (let el in recipientEmails) {
        recipients = recipients + recipientEmails[el].email + ', ';
    }
    let mailOptions;
    let subjectText = 'LAQV/UCIBIO Data Management - Car access request by ' + personName;
    let emailBody = 'Hi,\n\n'
        + 'The recently added user ' + personName + ' requests access to the FCT campus.\n\n'
        + 'Below follows the relevant data:\n'
        + ' License ID: ' + cars[0].license + '\n'
    for (let ind in cars) {
        emailBody = emailBody + '\nCar ' + (ind + 1) + ':\n';
        emailBody = emailBody + 'Brand: ' + cars[ind].brand + '\n';
        emailBody = emailBody + 'Model: ' + cars[ind].model + '\n';
        emailBody = emailBody + 'Color: ' + cars[ind].color + '\n';
        emailBody = emailBody + 'Plate: ' + cars[ind].plate + '\n';
    }
    emailBody = emailBody + '\nBest regards,\nAdmin';
    let emailBodyHtml = '<p>Hi,</p><br>'
        + '<p>The recently added user ' + personName + ' requests access to the FCT campus.</p>'
        + '<p>Below follows the relevant data:</p><br>'
        + '<p>License ID: ' + cars[0].license + '</p>'
    for (let ind in cars) {
        emailBodyHtml = emailBodyHtml + '<p>Car ' + (ind + 1) + ':</p>';
        emailBodyHtml = emailBodyHtml + '<p>Brand: ' + cars[ind].brand + '</p>';
        emailBodyHtml = emailBodyHtml + '<p>Model: ' + cars[ind].model + '</p>';
        emailBodyHtml = emailBodyHtml + '<p>Color: ' + cars[ind].color + '</p>';
        emailBodyHtml = emailBodyHtml + '<p>Plate: ' + cars[ind].plate + '</p>';
    }

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
        //return writeMessageDB(options);

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
    }
};

var getPersonPostRegistrationActions = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + ' SELECT * FROM people_post_registration WHERE person_id = ?;';
    places.push(personID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let depAccess = false;
            for (let ind in resQuery) {
                if (resQuery[ind].action_id === 1) {
                    depAccess = true;
                }
            }
            if (depAccess) {
                return getRecipientsGroupAccess(options, 2, 1);
            } else {
                return getPersonPersonalEmail(options);
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
                options.recipientGroupCar = resQuery[0].id;
                actionSendAccessManagerMessage(options, resQuery)
                .then(() => {
                    getPersonPersonalEmail(options)
                })
                .catch((e) => {
                    console.log(e);
                    return getPersonPersonalEmail(options);
                });

            } else {
                return getPersonPersonalEmail(options);
            }

        },
        options);
};
async function actionSendAccessManagerMessage(options, recipientEmails) {
    let { req, res, next } = options;
    let personName = ''
    if (req.body.data !== undefined) {
        personName = req.body.data.name;
    }
    let recipients = '';
    for (let el in recipientEmails) {
        recipients = recipients + recipientEmails[el].email + ', ';
    }
    let mailOptions;
    let subjectText = 'LAQV/UCIBIO Data Management - "Departamental" access request by ' + personName;
    let emailBody = 'Hi,\n\n'
        + 'The recently added user ' + personName + ' requests access to "Departamental"'
        + ' building outside normal working hours.\n\n'
    emailBody = emailBody + '\nBest regards,\nAdmin';
    let emailBodyHtml = '<p>Hi,</p><br>'
        + '<p>The recently added user ' + personName + ' requests access to "Departamental"'
        + ' building outside normal working hours.</p>'
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
        //return writeMessageDB(options);

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
    }
};

var getPersonPersonalEmail = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + ' SELECT * FROM personal_emails WHERE person_id = ?;';
    places.push(personID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.personal_email = resQuery[0].email;
            } else {
                options.personal_email = '';
            }
            return getPersonWorkEmail(options);
        },
        options);
}
var getPersonWorkEmail = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + ' SELECT * FROM emails WHERE person_id = ?;';
    places.push(personID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.work_email = resQuery[0].email;
            } else {
                options.work_email = '';
            }
            return getRecipientsGroupValidation(options, 11);
        },
        options);
}
var getRecipientsGroupValidation = function (options, email_type_id) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT recipient_groups.*, emails.person_id, emails.email'
        + ' FROM recipient_groups'
        + ' LEFT JOIN people_recipient_groups ON people_recipient_groups.recipient_group_id = recipient_groups.id'
        + ' LEFT JOIN emails ON emails.person_id = people_recipient_groups.person_id'
        + ' WHERE recipient_groups.city_id IS NULL'
        + ' AND recipient_groups.any_cities = 1'
        + ' AND recipient_groups.email_type_id = ?;';
    places.push(email_type_id);

    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.recipientGroup = resQuery[0].id;
            actionSendUserMessage(options)
            .then(() => {
                writeMessageDB(options)
            })
            .catch((e) => {
                console.log(e);
                return writeMessageDB(options, e);
            }); // even if the email fails it writes the message to the DB
        },
        options);
};
async function actionSendUserMessage(options) {
    let { req, res, next } = options;
    let recipients = '';
    if (options.personal_email !== '') {
        recipients = recipients + options.personal_email  + ', ';
    }
    if (options.work_email !== '') {
        recipients = recipients + options.work_email  + ', ';
    }
    let mailOptions;
    let subjectText = 'LAQV/UCIBIO Data Management - Registration validated';
    let emailBody = 'Hi,\n\n'
        + 'A data manager validated your registration.\n\n'
        + 'You can now head to ' + process.env.PATH_PREFIX + ' and add more data to your profile.\n\n'
        + 'Best regards,\nAdmin';
    let emailBodyHtml = '<p>Hi,</p><br>'
        + '<p>A data manager validated your registration.</p>'
        + '<p>You can now head to ' + process.env.PATH_PREFIX + ' and add more data to your profile.</p><br>'
        + '<p>Best regards,</p>'
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
        //return writeMessageDB(options);

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
    }
};
var writeMessageDB = function (options, error) {
    let { req, res, next, recipientGroup, subjectText, emailBody } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO email_messages'
        + ' (sender_id, recipient_group_id, subject, message_text, date, solved)'
        + ' VALUES (?,?,?,?,?,?);';
    places.push(options.personID, recipientGroup, subjectText, emailBody, options.now, 1);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (error) {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 500,
                    message: { "message": "Error sending email, but database OK!", "error": error.message }
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
module.exports.validateRegistration = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            options.now = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
            actionValidate(options)
        },
        { req, res, next }
    );
};