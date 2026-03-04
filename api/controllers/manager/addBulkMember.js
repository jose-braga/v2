const jwtUtil = require('../../config/jwt_utilities')
const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;
// there are no notifications to external APIs because the user must agree first with this

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomPin(length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

var addUser = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    let data = req.body.data
    let username = data.username;
    pinLength = randomIntFromInterval(5, 9);
    let password = username + randomPin(pinLength);
    //console.log('Generated password for user ' + username + ': ' + password);
    let hashedPassword = jwtUtil.hashPassword(password);
    querySQL = querySQL
        + 'INSERT INTO `users`'
        + ' (username, password, created, deactivated, permission_level_id)'
        + ' VALUES (?,?, NOW(), ?, ?);';
    places.push(username, hashedPassword, 0, 5);
    sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.userID = resQuery.insertId;
            options.username = username;
            options.password = password;
            return addPerson(options)
        },
        {req, res, next}
    );

};
var addPerson = function (options) {
    let { req, res, next, userID } = options;
    let data = req.body.data;
    let places = [];
    querySQL = 'INSERT INTO people'
        + ' (user_id, `name`, colloquial_name, gender, birth_date, status, visible_public)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?);';
    places.push(
        userID,
        data.name,
        data.colloquial_name,
        data.gender,
        data.birth_date,
        1,
        0
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.personID = resQuery.insertId;
            options.name = data.name;
            options.colloquial_name = data.colloquial_name;
            addPersonHistory(options);
        },
        options);
};
var addPersonHistory = function (options) {
    let { req, res, next, userID, personID } = options;
    let data = req.body.data;
    let places = [];
    querySQL = 'INSERT INTO people_history'
        + ' (person_id, user_id, `name`, colloquial_name, gender, birth_date,'
        + ' status, visible_public, created, operation, changed_by)'
        + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?);';
    places.push(
        personID,
        userID,
        data.name,
        data.colloquial_name,
        data.gender,
        data.birth_date,
        1,
        0,
        'C',
        data.changedBy
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return addWorkEmail(options);
        },
        options);
};
var addWorkEmail = function (options) {
    let { req, res, next, personID } = options;
    let data = req.body.data;
    if (data.email !== undefined) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL
            + 'INSERT INTO emails'
            + ' (person_id, email)'
            + ' VALUES (?,?);';
        places.push(
            personID,
            data.email
        );
        sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                return addScientificIdentifiers(options);
            },
            options);
    } else {
        return addScientificIdentifiers(options);
    }
};
var addScientificIdentifiers = function (options) {
    let { req, res, next, personID } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO researchers_info'
        + ' (person_id, ciencia_id, ORCID)'
        + ' VALUES (?,?,?);';
    places.push(
        personID,
        data.ciencia_id,
        data.ORCID
    );
    sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return addPole(options);
        },
        options);
};
var addPole = function (options) {
    let { req, res, next, personID } = options;
    let data = req.body.data;
    let places = [];
    querySQL = 'INSERT INTO people_institution_city'
        + ' (person_id, city_id)'
        + ' VALUES (?, ?);';
    places.push(
        personID,
        data.pole_id,
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return addRole(options);
        },
        options);
};
var addRole = function (options) {
    let { req, res, next, personID} = options;
    let places = [];
    querySQL = 'INSERT INTO people_roles'
        + ' (person_id, role_id)'
        + ' VALUES (?, 1);';
    places.push(
        personID,
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return addLab(options);
        },
        options);
};
var addLab = function (options) {
    let { req, res, next, personID } = options;
    let data = req.body.data;
    let position = data.current_position;
    if (position.lab_id !== null && position.lab_id !== undefined) {
        let places = [];
        if (position.valid_from === '') {
            position.valid_from = null;
        }
        if (position.dedication === '') {
            position.dedication = null;
        }
        querySQL = 'INSERT INTO people_labs'
            + ' (person_id, lab_id, lab_position_id, dedication, valid_from)'
            + ' VALUES (?, ?, ?, ?, ?);';
        places.push(
            personID,
            position.lab_id,
            position.lab_position_id,
            position.dedication,
            position.valid_from,
        );
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                options.peopleLabsId = resQuery.insertId;
                return addPersonLabHistory(options);
            },
            options);
    } else {
        return addJob(options);
    }
};
var addPersonLabHistory = function (options) {
    let { req, res, next, personID, peopleLabsId } = options;
    let userID = req.payload.userID;
    let data = req.body.data;
    let position = data.current_position;
    let places = [];
    if (position.valid_from === '') {
        position.valid_from = null;
    }
    if (position.dedication === '') {
        position.dedication = null;
    }
    querySQL = 'INSERT INTO people_labs_history'
        + ' (people_labs_id, person_id, lab_id, lab_position_id, dedication,'
        + ' valid_from,'
        + ' created, operation, changed_by)'
        + ' VALUES (?,?,?,?,?,?,NOW(),?,?);';
    places.push(
        peopleLabsId,
        personID,
        position.lab_id,
        position.lab_position_id,
        position.dedication,
        position.valid_from,
        'C',
        userID
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return addJob(options);
        },
        options);
};
var addJob = function (options) {
    let { req, res, next, personID } = options;
    let data = req.body.data;
    let profSituation = data.professional_situation;
    let places = [];
    let querySQL = '';
    if (profSituation.valid_from === '') {
        profSituation.valid_from = null;
    }
    if (profSituation.valid_until === '') {
        profSituation.valid_until = null;
    }
    if (profSituation.situation_id !== null && profSituation.situation_id !== undefined
        && profSituation.category_id !== null && profSituation.category_id !== undefined
    ) {
        querySQL = querySQL + 'INSERT INTO jobs'
            + ' (person_id, organization, dedication, valid_from, valid_until)'
            + ' VALUES (?,?,?,?,?);';
        places.push(personID,
            profSituation.organization,
            100,
            profSituation.valid_from,
            profSituation.valid_until
        );

        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                options.jobID = resQuery.insertId;
                return getCategorySituationID(options);
            },
            options);

    } else {
        return actionSendChangeMessage(options)
            .catch((e) => {
                console.log(e);
                return writeMessageDB(options, e);
            });
    }
};
var getCategorySituationID = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    let profSituation = data.professional_situation;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM categories_situations'
                        + ' WHERE category_id = ? AND situation_id = ?;';
    places.push(profSituation.category_id, profSituation.situation_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.new_category_situation_id = resQuery[0].id;
                return updateJobCategorySituationID(options);
            } else {
                // if no row or if more that 1 row
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 400,
                    message: {
                        "status": "error", "statusCode": 400,
                        "message": "An error occurred: situation and category IDs are not compatible",
                    }
                });
                return;
            }
        },
        options);
};
var updateJobCategorySituationID = function (options) {
    let { req, res, next, jobID, new_category_situation_id } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE jobs'
                        + ' SET category_situation_id = ?'
                        + ' WHERE id = ?;';
    places.push(new_category_situation_id, jobID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return actionSendChangeMessage(options)
            .catch((e) => {
                console.log(e);
                return writeMessageDB(options, e);
            });
        },
        options);
};

async function actionSendChangeMessage(options) {
    let { req, res, next, colloquial_name, username, password } = options;

    let data = req.body.data;
    let unitName = data.unitData.short_name;

    let recipients = data.email;
    let mailOptions;
    let subjectText = 'Profile creation on the LAQV/UCIBIO data management platform';

    let emailBody = `Dear ${colloquial_name},

We have created your profile on the data management platform for the LAQV and UCIBIO research units (https://v2.laqv-ucibio.info) with the following credentials:

Username: ${username}
Password: ${password}

You should change your password when you log in for the first time.`;

    if (unitName === 'UCIBIO') {
        emailBody = emailBody + `

The platform feeds the information displayed on the public UCIBIO website (https://ucibio.pt/). Therefore, I ask that after logging into the platform (https://v2.laqv-ucibio.info), you authorize some of your data to appear on the public website. Specifically, a personal page will be automatically generated (similar to https://ucibio.pt/people/maria-joao-romao) and you will be included in your Research Lab's member list.`;
    } else {
        emailBody = emailBody + `

The platform feeds the information displayed on the LAQV public website (https://laqv.requimte.pt/). Therefore, I ask that, after logging into the platform (https://v2.laqv-ucibio.info), you authorize a portion of your platform data to appear on the public website. Additionally, please add a profile photo. This will automatically generate a personal page and include you in your Group's member list. Access to the MyLAQV area on the website uses the same credentials defined for the platform.`;
    }
    emailBody = emailBody + `

The information contained in the platform is visible to the research units' science managers for internal processes (such as the preparation of activity reports or applications). You may edit all fields except for your Research Lab affiliation; if you wish to change anything in that section, you must contact a science manager from the Unit.

If you have any questions, please do not hesitate to contact the science management team.

Best regards,
The ${unitName} Science Management Team`;

    options.subjectText = subjectText;
    options.emailBody = emailBody;
    if (process.env.NODE_ENV === 'production') {
        mailOptions = {
            from: '"Admin" <admin@laqv-ucibio.info>', // sender address
            to: recipients, // list of receivers (comma-separated)
            cc: [process.env.EMAIL_DEVELOPER,], // list of CC receivers (comma-separated)
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
            cc: [process.env.EMAIL_DEVELOPER,], // list of CC receivers (comma-separated)
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

module.exports.addMember = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { addUser(options) },
        { req, res, next }
    );
}