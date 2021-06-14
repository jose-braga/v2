const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

var actionGetBugs = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    let solved = 0;
    if (req.query.solved !== undefined) {
        solved = parseInt(req.query.solved, 10);
    }
    querySQL = querySQL
        + 'SELECT user_contacts.*, contact_types.name_en AS contact_type_name_en,'
        + ' people.colloquial_name, emails.email'
        + ' FROM user_contacts'
        + ' JOIN contact_types ON contact_types.id = user_contacts.contact_type_id'
        + ' JOIN people ON people.id = user_contacts.person_id'
        + ' LEFT JOIN emails ON emails.person_id = user_contacts.person_id'
        + ' WHERE user_contacts.contact_type_id = ?'
        + ' AND user_contacts.solved = ?';
    places.push(1,
        solved
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getBugs = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetBugs(options) },
        { req, res, next }
    );
};
var actionGetSuggestions = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT user_contacts.*, contact_types.name_en AS contact_type_name_en,'
        + ' people.colloquial_name, emails.email'
        + ' FROM user_contacts'
        + ' JOIN contact_types ON contact_types.id = user_contacts.contact_type_id'
        + ' JOIN people ON people.id = user_contacts.person_id'
        + ' LEFT JOIN emails ON emails.person_id = user_contacts.person_id'
        + ' WHERE user_contacts.contact_type_id = ?';
    places.push(2);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getSuggestions = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetSuggestions(options) },
        { req, res, next }
    );
};

var actionUpdateContact = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let contactID = req.params.contactID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    if (data.solved === 0) {
        querySQL = querySQL
            + 'UPDATE user_contacts'
            + ' SET solved = 0,'
            + ' date_solved = NULL'
            + ' WHERE id = ?;';
        places.push(contactID);
    } else {
        let now = time.momentToDate(time.moment(), 'Europe/Lisbon', 'YYYY-MM-DD HH:mm:ss');
        querySQL = querySQL
            + 'UPDATE user_contacts'
            + ' SET solved = 1,'
            + ' date_solved = ?'
            + ' WHERE id = ?;';
        places.push(now, contactID);
    }
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateContact = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateContact(options) },
        { req, res, next }
    );
};