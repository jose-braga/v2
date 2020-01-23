const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');


var actionGetPublications = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT people_publications.*, author_types.name_en AS author_type_name,'
                        + ' publications.authors_raw, publications.number_authors,'
                        + ' publications.title, publications.volume, publications.page_start, publications.page_end,'
                        + ' publications.doi, publications.wos, publications.pubmed_id,'
                        + ' publications.publication_date, publications.year, '
                        + ' publications.journal_id, journals.name AS journal_name, journals.short_name AS journal_short_name,'
                        + ' journals.publisher, journals.publisher_city, journals.issn, journals.eissn,'
                        + ' publications.publication_source_id, publication_sources.name AS publication_source_name,'
                        + ' publications.updated'
                        + ' FROM people_publications'
                        + ' JOIN publications ON publications.id = people_publications.publication_id'
                        + ' LEFT JOIN journals ON journals.id = publications.journal_id'
                        + ' LEFT JOIN author_types ON author_types.id = people_publications.author_type_id'
                        + ' LEFT JOIN publication_sources ON publication_sources.id = publications.publication_source_id'
                        + ' WHERE people_publications.person_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.publications = resQuery;
            if (resQuery.length > 0) {
                return getPublicationsDescriptions(options, 0);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200, "count": 0,
                        "result": [],
                    }
                });
                return;
            }
        },
        options);
};

module.exports.getPublicationsSearchDatabase = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPublications(options) },
        { req, res, next }
    );
};