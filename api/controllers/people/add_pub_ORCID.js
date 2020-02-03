const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const publicationsList = require('./publications_list');

var actionCreateJournal = function (options) {
    let now = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
    let { req, res, next } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO journals'
                        + ' (name, short_name)'
                        + ' VALUES (?, ?);';
    places.push(data.journal_name, data.journal_name);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (resQuery, options) => {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "result": { journalID: resQuery.insertId },
                }
            });
            return;
         },
        options);
};
module.exports.createJournal = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateJournal(options) },
        { req, res, next }
    );
};

var actionCreatePublication = function (options) {
    let now = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
    let { req, res, next } = options;
    let journalID = req.params.journalID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO publications'
                        + ' (authors_raw, number_authors, title, journal_id,'
                        + ' volume, page_start, page_end, doi,'
                        + ' publication_date, year, publication_source_id, updated)'
                        + ' VALUES (?,?,?,?,?,?,?,?,?,?,?,?);';
    places.push(
        data.authors_raw,
        data.number_authors,
        data.title,
        journalID,
        data.volume,
        data.page_start,
        data.page_end,
        data.doi,
        data.publication_date,
        data.year,
        data.publication_source_id,
        now
    )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "result": { publicationID: resQuery.insertId },
                }
            });
            return;
         },
        options);
};

module.exports.createPublication = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreatePublication(options) },
        { req, res, next }
    );
};