const sql = require('../utilities/sql');
const permissions = require('../utilities/permissions');

var actionGetAcademicAffiliations = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_departments.*,'
                        + ' departments.name_en AS department_name_en, departments.name_pt AS department_name_pt,'
                        + ' schools.name_en AS school_name_en, schools.name_pt AS school_name_pt,'
                        + ' schools.shortname_en AS school_shortname_en, schools.shortname_pt AS school_shortname_pt,'
                        + ' universities.name_en AS university_name_en, universities.name_pt AS university_name_pt,'
                        + ' universities.shortname_en AS university_shortname_en, universities.shortname_pt AS university_shortname_pt'
                        + ' FROM people_departments'
                        + ' JOIN departments ON departments.id = people_departments.department_id'
                        + ' JOIN schools ON schools.id = departments.school_id'
                        + ' JOIN universities ON universities.id = schools.university_id'
                        + ' WHERE people_departments.person_id = ?;';
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getAcademicAffiliations = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetAcademicAffiliations(options) },
        { req, res, next }
        );
};

var actionCreateAcademicAffiliations = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO people_departments'
                        + ' (person_id, department_id, valid_from, valid_until)'
                        + ' VALUES (?, ?, ?, ?);';
    places.push(personID, data.department_id, data.valid_from, data.valid_until)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.createAcademicAffiliations = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateAcademicAffiliations(options) },
        { req, res, next }
    );
};

var actionUpdateAcademicAffiliations = function (options) {
    let { req, res, next } = options;
    let affiliationID = req.params.affiliationID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE people_departments'
                        + ' SET department_id = ?,'
                        + ' valid_from = ?,'
                        + ' valid_until = ?'
                        + ' WHERE id = ?;';
    places.push(data.department_id, data.valid_from, data.valid_until, affiliationID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.updateAcademicAffiliations = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdateAcademicAffiliations(options) },
        { req, res, next }
    );
};

var actionDeleteAcademicAffiliations = function (options) {
    let { req, res, next } = options;
    let affiliationID = req.params.affiliationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM people_departments'
                        + ' WHERE id = ?;';
    places.push(affiliationID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.deleteAcademicAffiliations = function (req, res, next) {
    // we start by deleting first supervisors, then external supervisors
    // only then we delete the degree
    permissions.checkPermissions(
        (options) => { actionDeleteAcademicAffiliations(options) },
        { req, res, next }
    );
};

