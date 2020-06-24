// TODO: technical, science and administrative

const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const jwtUtil = require('../../config/jwt_utilities')
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;

var make_password = function(n, a) {
    let index = (Math.random() * (a.length - 1)).toFixed(0);
    return n > 0 ? a[index] + make_password(n - 1, a) : '';
};

var actionSearchAllPeople = function (options) {
    let { req, res, next } = options;
    let name;
    let limit = 10;
    if (req.query.limit !== undefined) {
        limit = parseInt(req.query.limit, 10);
    }
    options.pageSize = limit;
    let offset = 0;
    if (req.query.offset !== undefined) {
        offset = parseInt(req.query.offset, 10);
    }
    options.offset = offset;
    if (req.query.hasOwnProperty('q') && req.query.q !== '') {
        name = '%' + req.query.q.replace(/\s/gi,'%') + '%';
    } else {
        name = '';
    }
    options.search = name;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people.id AS person_id, people.name, people.colloquial_name,'
                        + ' lab_positions.name_en AS lab_position_name,'
                        + ' labs.name AS lab_name, people_labs.valid_from, people_labs.valid_until'
                        + ' FROM people'
                        + ' LEFT JOIN people_labs ON people_labs.person_id = people.id'
                        + ' LEFT JOIN labs ON labs.id = people_labs.lab_id'
                        + ' LEFT JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
                        + ' WHERE people.name LIKE ? AND people.status = 1'
                        + ' ORDER BY people.name ASC'
                        + ' LIMIT ?, ?;'
                        ;
    places.push(name, offset, limit)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                actionCountTotal(resQuery, options)
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": -1,
                        "pageSize": options.pageSize,
                        "offset": options.offset,
                        "pageCount": 0,
                        "result": []
                    }
                });
                return;
            }
        },
        options);
};
var actionCountTotal = function (people, options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT COUNT(*) AS total_number'
        + ' FROM (SELECT people.id AS person_id, people.name, people.colloquial_name,'
        + ' lab_positions.name_en AS lab_position_name,'
        + ' labs.name AS lab_name, people_labs.valid_from, people_labs.valid_until'
        + ' FROM people'
        + ' LEFT JOIN people_labs ON people_labs.person_id = people.id'
        + ' LEFT JOIN labs ON labs.id = people_labs.lab_id'
        + ' LEFT JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
        + ' WHERE people.name LIKE ?)'
        + ' AS search_people';
    places.push(options.search);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.totalSearch = resQuery[0].total_number;
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": options.totalSearch,
                        "pageSize": options.pageSize,
                        "offset": options.offset,
                        "pageCount": people.length,
                        "result": people
                    }
                });
                return;
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": -1,
                        "pageSize": options.pageSize,
                        "offset": options.offset,
                        "pageCount": 0,
                        "result": []
                    }
                });
                return;
            }
        },
        options);

}

module.exports.searchAllPeople = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionSearchAllPeople(options) },
        { req, res, next }
    );
};

var actionGetMemberDetails = function (members, options) {
    if (members.length > 0) {
        return getMembersLabPositions(members, options, 0);
    } else {
        responses.sendJSONResponseOptions({
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": []
            }
        });
        return;
    }
};
var getMembersLabPositions = function (members, options, i) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_labs.*,'
                        + ' labs.name AS lab_name, labs.short_name AS lab_short_name,'
                        + ' lab_positions.name_en AS lab_position_name_en,'
                        + ' lab_positions.name_pt AS lab_position_name_pt,'
                        + ' lab_positions.sort_order AS lab_position_sort_order'
                        + ' FROM people_labs'
                        + ' JOIN labs ON labs.id = people_labs.lab_id'
                        + ' LEFT JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
                        + ' WHERE people_labs.lab_id = ? AND people_labs.person_id = ?;';
    places.push(labID, members[i].person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            members[i].history = resQuery;
            getMemberDetails(members, options, i)
        },
        options);
};
var getMemberDetails = function (members, options, i) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM researchers_info'
                        + ' WHERE person_id = ?;';
    places.push(members[i].person_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            members[i].researcher_details = resQuery;
            if (i + 1 < members.length) {
                getMembersLabPositions(members, options, i + 1);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": members.length,
                        "result": members
                    }
                });
                return;
            }
        },
        options);
};
var actionGetLabMembers = function (options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT DISTINCT people.id AS person_id, people.name, people.colloquial_name '
                        + ' FROM people'
                        + ' JOIN people_labs ON people_labs.person_id = people.id'
                        + ' WHERE people_labs.lab_id = ? AND people.status = ?;';
    places.push(labID, 1)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionGetMemberDetails(resQuery, options)
        },
        options);
};
module.exports.getLabMembersAffiliations = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetLabMembers(options) },
        { req, res, next }
    );
};
module.exports.deleteLabMember = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetLabMembers(options) },
        { req, res, next }
    );
};

var actionUpdateLabMemberPosition = function (options) {
    let { req, res, next } = options;
    options.operation = 'U';
    let positionID = req.params.positionID;
    let positionData = req.body.data;
    if (positionData.valid_from === '') {
        positionData.valid_from = null;
    }
    if (positionData.valid_until === '') {
        positionData.valid_until = null;
    }
    var places = [];
    querySQL = 'UPDATE people_labs'
            + ' SET lab_position_id = ?,'
            + ' dedication = ?,'
            + ' valid_from = ?,'
            + ' valid_until = ?'
            + ' WHERE id = ?;';
    places.push(positionData.lab_position_id,
        positionData.dedication,
        positionData.valid_from,
        positionData.valid_until,
        positionID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionAddLabMemberPositionHistory(resQuery, options)
        },
        options);
};
var actionAddLabMemberPositionHistory = function (resQuery, options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    let personID = req.params.memberID;
    let positionID = req.params.positionID;
    let positionData = req.body.data;
    var places = [];
    let now = time.moment().tz('Europe/Lisbon').format('YYYY-MM-DD HH:mm:ss');
    let created = null;
    let updated = null;
    if (options.operation === 'U') {
        updated = now;
    } else if (options.operation === 'C') {
        created = now;
        positionID = resQuery.insertId;
    } else if (options.operation === 'D') {
        updated = now;
        //positionData = {};
    }
    if (positionData.valid_from === '') {
        positionData.valid_from = null;
    }
    if (positionData.valid_until === '') {
        positionData.valid_until = null;
    }
    querySQL = 'INSERT INTO people_labs_history'
        + ' (people_labs_id, person_id, lab_id, lab_position_id, dedication, valid_from, valid_until, created, updated, operation, changed_by)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    places.push(positionID,
                personID,
                labID,
                positionData.lab_position_id,
                positionData.dedication,
                positionData.valid_from,
                positionData.valid_until,
                created,
                updated,
                options.operation,
                positionData.changed_by)
    sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updateLabMemberPosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateLabMemberPosition(options) },
        { req, res, next }
    );
};

var actionCreateLabMemberPosition = function (options) {
    let { req, res, next } = options;
    options.operation = 'C';
    let labID = req.params.labID;
    let personID = req.params.memberID;
    let positionData = req.body.data;
    if (positionData.valid_from === '') {
        positionData.valid_from = null;
    }
    if (positionData.valid_until === '') {
        positionData.valid_until = null;
    }
    var places = [];
    querySQL = 'INSERT INTO people_labs'
        + ' (person_id, lab_id, lab_position_id, dedication, valid_from, valid_until)'
        + ' VALUES (?, ?, ?, ?, ?, ?);';
    places.push(personID,
                labID,
                positionData.lab_position_id,
                positionData.dedication,
                positionData.valid_from,
                positionData.valid_until
                )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionAddLabMemberPositionHistory(resQuery, options)
        },
        options);
};
module.exports.createLabMemberPosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateLabMemberPosition(options) },
        { req, res, next }
    );
};

var actionDeleteLabMemberPosition = function (options) {
    let { req, res, next } = options;
    options.operation = 'D';
    let positionID = req.params.positionID;
    var places = [];
    querySQL = 'DELETE FROM people_labs'
        + ' WHERE id = ?;';
    places.push(positionID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionAddLabMemberPositionHistory(resQuery, options)
        },
        options);
};
module.exports.deleteLabMemberPosition = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteLabMemberPosition(options) },
        { req, res, next }
    );
};



var actionGetLabInfo = function (options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * '
                        + ' FROM labs'
                        + ' WHERE id = ?;';
    places.push(labID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let labs = resQuery[0]; // there is only one lab
            actionGetLabGroups(labs, options)
        },
        options);
};
var actionGetLabGroups = function (labs, options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT `groups`.*, labs_groups.valid_from, labs_groups.valid_until'
                        + ' FROM labs_groups'
                        + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
                        + ' WHERE labs_groups.lab_id = ?;';
    places.push(labID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            labs.groups_history = resQuery;
            actionGetGroupsUnits(labs, options, 0)
        },
        options);
};
var actionGetGroupsUnits = function (labs, options, i) {
    let { req, res, next } = options;
    let groupID = labs.groups_history[i].id;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT units.*, groups_units.valid_from, groups_units.valid_until'
                        + ' FROM groups_units'
                        + ' JOIN units ON units.id = groups_units.unit_id'
                        + ' WHERE groups_units.group_id = ?;';
    places.push(groupID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            labs.groups_history[i].units_history = resQuery;
            if (i + 1 < labs.groups_history.length) {
                actionGetGroupsUnits(labs, options, i + 1);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 1,
                        "result": labs
                    }
                });
                return;
            }
        },
        options);
};

module.exports.getLabInfo = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetLabInfo(options) },
        { req, res, next }
    );
};

var actionAddUser = function (options) {
    let { req, res, next } = options;
    let now = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
    options.now = now;
    let password = make_password(30,'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    let hashedPassword = jwtUtil.hashPassword(password);
    options.password = password;
    let person = req.body.data;
    let places = [];
    querySQL = 'INSERT INTO users'
        + ' (username, password, created, deactivated, permission_level_id)'
        + ' VALUES (?, ?, ?, ?, ?);';
    places.push(
        person.username,
        hashedPassword,
        now,
        0,
        5
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.userID = resQuery.insertId;
            actionAddPerson(options);
        },
        options);
};
var actionAddPerson = function (options) {
    let { req, res, next } = options;
    let person = req.body.data;
    let places = [];
    querySQL = 'INSERT INTO people'
        + ' (user_id, active_from, status, visible_public)'
        + ' VALUES (?, ?, ?, ?);';
    places.push(
        options.userID,
        person.valid_from,
        2,
        0
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.personID = resQuery.insertId;
            actionAddPersonHistory(options);
        },
        options);
};
var actionAddPersonHistory = function (options) {
    let { req, res, next } = options;
    let person = req.body.data;
    let places = [];
    querySQL = 'INSERT INTO people_history'
        + ' (person_id, user_id, active_from, status, visible_public, created, operation, changed_by)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?);';
    places.push(
        options.personID,
        options.userID,
        person.valid_from,
        2,
        0,
        options.now,
        'C',
        person.changedBy
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionAddPersonPole(options);
        },
        options);
};
var actionAddPersonPole = function (options) {
    let { req, res, next } = options;
    let person = req.body.data;
    let places = [];
    querySQL = 'INSERT INTO people_institution_city'
        + ' (person_id, city_id, valid_from)'
        + ' VALUES (?, ?, ?);';
    places.push(
        options.personID,
        person.city_id,
        person.valid_from
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionAddPersonRole(options);
        },
        options);
};
var actionAddPersonRole = function (options) {
    let { req, res, next } = options;
    let places = [];
    querySQL = 'INSERT INTO people_roles'
        + ' (person_id, role_id)'
        + ' VALUES (?, ?);';
    places.push(
        options.personID,
        1
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionAddPersonLab(options);
        },
        options);
};
var actionAddPersonLab = function (options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    let person = req.body.data;
    if (person.valid_from === '') {
        person.valid_from = null;
    }
    if (person.valid_until === '') {
        person.valid_until = null;
    }
    let places = [];
    querySQL = 'INSERT INTO people_labs'
        + ' (person_id, lab_id, lab_position_id, dedication, valid_from, valid_until)'
        + ' VALUES (?, ?, ?, ?, ?, ?);';
    places.push(
        options.personID,
        labID,
        person.lab_position_id,
        person.dedication,
        person.valid_from,
        person.valid_until
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.peopleLabsID = resQuery.insertId;
            actionAddPersonLabHistory(options);
        },
        options);
};
var actionAddPersonLabHistory = function (options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    let person = req.body.data;
    if (person.valid_from === '') {
        person.valid_from = null;
    }
    if (person.valid_until === '') {
        person.valid_until = null;
    }
    let places = [];
    querySQL = 'INSERT INTO people_labs_history'
        + ' (people_labs_id, person_id, lab_id, lab_position_id, dedication, valid_from, valid_until, created, operation, changed_by)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    places.push(
        options.peopleLabsID,
        options.personID,
        labID,
        person.lab_position_id,
        person.dedication,
        person.valid_from,
        person.valid_until,
        options.now,
        'C',
        options.changedBy
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            actionAddPersonEmailAddress(options);
        },
        options);
};
var actionAddPersonEmailAddress = function (options) {
    let { req, res, next } = options;
    let person = req.body.data;
    let places = [];
    querySQL = 'INSERT INTO personal_emails'
        + ' (person_id, email)'
        + ' VALUES (?, ?);';
    places.push(
        options.personID,
        person.email
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            getRecipientsGroupsPreReg(options, 11);
        },
        options);

};
// an email is sent to the user being pre-registered
// and a copy is saved in the database
var getRecipientsGroupsPreReg = function (options, email_type_id) {
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
            actionSendUserMessage(options, resQuery)
            .catch((e) => {
                console.log(e);
                return writeMessageDB(options, e);
            }); // even if the email fails it writes the message to the DB
        },
        options);
};

async function actionSendUserMessage(options, recipientEmails) {
    let { req, res, next } = options;
    let person = req.body.data;
    let username = person.username.replace(' ','%20');
    options.recipientGroup = recipientEmails[0].id;
    let recipients = '';
    recipients = recipients + person.email;
    let mailOptions;
    let subjectText = 'LAQV/UCIBIO Data Management - User Registration: ' + person.username;
    let emailBody = 'Hi,\n\n'
        + 'You were pre-registered on ' + process.env.PATH_PREFIX  + '.\n\n'
        + 'Please click on the following link to continue pre-registration:\n\n'
        +  process.env.PATH_PREFIX +'/pre-register/'
        +  username + '/'
        +  options.password + '\n\n'
        + 'Follow instructions and after filling all required information,'
        + ' press "Submit" button and wait for validation by a manager.\n'
        + 'Upon validation you will be notified, and then you can login to:\n\n'
        +  process.env.PATH_PREFIX + '\n\n'
        + 'Best regards,\nAdmin';
    let emailBodyHtml = '<p>Hi,</p><br>'
        + '<p>You were pre-registered on ' + process.env.PATH_PREFIX + '.</p>'
        + '<p>Please click on the following link to continue pre-registration:</p><br>'
        +  '<p>' + process.env.PATH_PREFIX +'/pre-register/'
        +  username + '/'
        +  options.password + '</p><br>'
        + '<p>Follow instructions and after filling all required information,'
        + ' press "Submit" button and wait for validation by a manager.</p>'
        + '<p>Upon validation you will be notified, and then you can login to:</p>'
        +  '<p>' + process.env.PATH_PREFIX + '</p>'
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
    let { req, res, next, recipientGroup, subjectText, emailBody } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO email_messages'
        + ' (sender_id, recipient_group_id, subject, message_text, date, solved)'
        + ' VALUES (?,?,?,?,?,?);';
    places.push(options.personID, recipientGroup, subjectText, emailBody, options.now, 0);
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

module.exports.preRegister = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionAddUser(options) },
        { req, res, next }
    );
};