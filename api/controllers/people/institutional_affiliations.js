// TODO: technical, science and administrative
const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;

var actionGetResearcherIDs = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT researchers_info.*,'
            + ' institutional_repositories.short_name AS repository_short_name'
            + ' FROM researchers_info'
            + ' LEFT JOIN institutional_repositories ON institutional_repositories.id = researchers_info.institutional_repository_id'
            + ' WHERE person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getResearcherIDs = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            actionGetResearcherIDs(options);
        },
        { req, res, next }
    );
};

var actionGetPoles = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_institution_city.*, institution_city.city'
            + ' FROM people_institution_city'
            + ' JOIN institution_city ON institution_city.id = people_institution_city.city_id'
            + ' WHERE people_institution_city.person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getPoles = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPoles(options) },
        { req, res, next }
    );
};

var actionGetRoles = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
        + ' FROM people_roles'
        + ' WHERE person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getRoles = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetRoles(options) },
        { req, res, next }
    );
};

var actionGetLabAffiliations = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_labs.*,'
        + ' labs.name AS lab_name, labs.short_name AS lab_short_name,'
        + ' lab_positions.name_en AS lab_position_name_en,'
        + ' lab_positions.name_pt AS lab_position_name_pt,'
        + ' lab_positions.sort_order AS lab_position_sort_order'
        + ' FROM people_labs'
        + ' JOIN labs ON people_labs.lab_id = labs.id'
        + ' LEFT JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
        + ' WHERE people_labs.person_id = ?';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionGetLabGroups(resQuery, options, 0)
        },
        options);
};
var actionGetLabGroups = function (positions, options, i) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    // to be selected it suffices having an overlap
    querySQL = querySQL + 'SELECT `groups`.*, labs_groups.valid_from, labs_groups.valid_until'
        + ' FROM labs_groups'
        + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
        + ' WHERE labs_groups.lab_id = ?'
        + ' AND ((labs_groups.valid_from IS NULL AND labs_groups.valid_until IS NULL)'
        +         ' OR (labs_groups.valid_from IS NULL AND labs_groups.valid_until >= ?)'
        +         ' OR (labs_groups.valid_from <= ? AND labs_groups.valid_until IS NULL)'
        +         ' OR (labs_groups.valid_from <= ? AND labs_groups.valid_until >= ?)'
        +         ' OR (labs_groups.valid_from <= ? AND labs_groups.valid_until >= ?)'
        +         ' OR (labs_groups.valid_from >= ? AND labs_groups.valid_until <= ?)'
        +         ' OR (labs_groups.valid_from IS NULL AND ? IS NULL)'
        +         ' OR (? IS NULL AND labs_groups.valid_until IS NULL)'
        +         ' OR (? IS NULL AND ? IS NULL)'
        + ');';
    places.push(positions[i].lab_id,
        positions[i].valid_from,
        positions[i].valid_until,
        positions[i].valid_from, positions[i].valid_from,
        positions[i].valid_until, positions[i].valid_until,
        positions[i].valid_from, positions[i].valid_until,
        positions[i].valid_from,
        positions[i].valid_until,
        positions[i].valid_from, positions[i].valid_until
        );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            positions[i].groups = resQuery;
            actionGetGroupsUnits(positions, options, i, 0)
        },
        options);
};
var actionGetGroupsUnits = function (positions, options, i, j) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    // to be selected it suffices having an overlap
    querySQL = querySQL + 'SELECT units.*, groups_units.valid_from, groups_units.valid_until'
        + ' FROM groups_units'
        + ' JOIN units ON units.id = groups_units.unit_id'
        + ' WHERE groups_units.group_id = ?'
        + ' AND ((groups_units.valid_from IS NULL AND groups_units.valid_until IS NULL)'
        +      ' OR (groups_units.valid_from IS NULL AND groups_units.valid_until >= ?)'
        +      ' OR (groups_units.valid_from <= ? AND groups_units.valid_until IS NULL)'
        +      ' OR (groups_units.valid_from <= ? AND groups_units.valid_until >= ?)'
        +      ' OR (groups_units.valid_from <= ? AND groups_units.valid_until >= ?)'
        +      ' OR (groups_units.valid_from >= ? AND groups_units.valid_until <= ?)'
        +      ' OR (groups_units.valid_from IS NULL AND ? IS NULL)'
        +      ' OR (? IS NULL AND groups_units.valid_until IS NULL)'
        +      ' OR (? IS NULL AND ? IS NULL)'
        + ');';
    places.push(positions[i].groups[j].id,
        positions[i].groups[j].valid_from,
        positions[i].groups[j].valid_until,
        positions[i].groups[j].valid_from, positions[i].groups[j].valid_from,
        positions[i].groups[j].valid_until, positions[i].groups[j].valid_until,
        positions[i].groups[j].valid_from, positions[i].groups[j].valid_until,
        positions[i].groups[j].valid_from,
        positions[i].groups[j].valid_until,
        positions[i].groups[j].valid_from, positions[i].groups[j].valid_until
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            positions[i].groups[j].units = resQuery;
            if (j + 1 < positions[i].groups.length) {
                actionGetGroupsUnits(positions, options, i, j + 1);
            } else if (i + 1 < positions.length) {
                actionGetLabGroups(positions, options, i + 1);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": positions.length,
                        "result": positions
                    }
                });
                return;
            }
        },
        options);
};
module.exports.getLabAffiliations = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetLabAffiliations(options) },
        { req, res, next }
    );
};

var actionGetTechnicalAffiliations = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT technicians.*,'
        + ' technicians_units.unit_id, units.name AS unit_name, units.short_name AS unit_short_name,'
        + ' technician_offices.name_en AS technician_office_name_en,'
        + ' technician_offices.name_pt AS technician_office_name_pt,'
        + ' technician_positions.name_en AS technician_position_name_en,'
        + ' technician_positions.name_pt AS technician_position_name_pt'
        + ' FROM technicians'
        + ' LEFT JOIN technician_offices ON technician_offices.id = technicians.technician_office_id'
        + ' LEFT JOIN technician_positions ON technician_positions.id = technicians.technician_position_id'
        + ' LEFT JOIN technicians_units ON technicians_units.technician_id = technicians.id'
        + ' LEFT JOIN units ON units.id = technicians_units.unit_id'
        + ' WHERE technicians.person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
module.exports.getTechnicalAffiliations = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetTechnicalAffiliations(options) },
        { req, res, next }
    );
};
var actionGetScienceManagementAffiliations = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT science_managers.*,'
        + ' science_managers_units.unit_id, units.name AS unit_name, units.short_name AS unit_short_name,'
        + ' science_manager_offices.name_en AS science_manager_office_name_en,'
        + ' science_manager_offices.name_pt AS science_manager_office_name_pt,'
        + ' science_manager_positions.name_en AS science_manager_position_name_en,'
        + ' science_manager_positions.name_pt AS science_manager_position_name_pt'
        + ' FROM science_managers'
        + ' LEFT JOIN science_manager_offices ON science_manager_offices.id = science_managers.science_manager_office_id'
        + ' LEFT JOIN science_manager_positions ON science_manager_positions.id = science_managers.science_manager_position_id'
        + ' LEFT JOIN science_managers_units ON science_managers_units.science_manager_id = science_managers.id'
        + ' LEFT JOIN units ON units.id = science_managers_units.unit_id'
        + ' WHERE science_managers.person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
module.exports.getScienceManagementAffiliations = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetScienceManagementAffiliations(options) },
        { req, res, next }
    );
};
var actionGetAdministrativeAffiliations = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_administrative_offices.*,'
        + ' people_administrative_units.unit_id, units.name AS unit_name, units.short_name AS unit_short_name,'
        + ' administrative_offices.name_en AS administrative_office_name_en,'
        + ' administrative_offices.name_pt AS administrative_office_name_pt,'
        + ' administrative_positions.name_en AS administrative_position_name_en,'
        + ' administrative_positions.name_pt AS administrative_position_name_pt'
        + ' FROM people_administrative_offices'
        + ' LEFT JOIN administrative_offices ON administrative_offices.id = people_administrative_offices.administrative_office_id'
        + ' LEFT JOIN administrative_positions ON administrative_positions.id = people_administrative_offices.administrative_position_id'
        + ' LEFT JOIN people_administrative_units ON people_administrative_units.administrative_id = people_administrative_offices.id'
        + ' LEFT JOIN units ON units.id = people_administrative_units.unit_id'
        + ' WHERE people_administrative_offices.person_id = ?';
    places.push(personID)
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};
module.exports.getAdministrativeAffiliations = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetAdministrativeAffiliations(options) },
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
    let subjectText = 'Affiliation change: ' + data.personName;
    let emailBody = 'Hi,\n\n'
        + 'The user ' + data.personName + ' is requesting a change in his/hers affiliation:\n\n'
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
            getRecipientsGroups(options, 4, true);
        },
        { req, res, next }
    );
};