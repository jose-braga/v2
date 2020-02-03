const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const publicationsList = require('./publications_list');

function processQuery(query, prop) {
    let regExact = /".+?"/g
    let qraw = query[prop];
    let exactMatches = qraw.match(regExact);
    let remainingStr = qraw;
    if (exactMatches !== null) {
        for (let ind in exactMatches) {
            remainingStr = remainingStr.replace(exactMatches[ind], '')
            remainingStr = remainingStr.trim()
            exactMatches[ind] = exactMatches[ind].replace(/\"/g,'');
        }
    } else {
        exactMatches = [];
    }
    return {
        exactMatches,
        remainingStr,
    }
}
var actionGetPublications = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let queryAuthors, queryTitle;
    if (req.query.authors !== undefined) {
        queryAuthors = processQuery(req.query, 'authors')
    }
    if (req.query.title !== undefined) {
        queryTitle = processQuery(req.query, 'title')
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT DISTINCT publications.id AS publication_id, publications.authors_raw, publications.number_authors,'
                        + ' publications.title, publications.volume, publications.page_start, publications.page_end,'
                        + ' publications.doi, publications.wos, publications.pubmed_id,'
                        + ' publications.publication_date, publications.year, '
                        + ' publications.journal_id, journals.name AS journal_name, journals.short_name AS journal_short_name,'
                        + ' journals.publisher, journals.publisher_city, journals.issn, journals.eissn,'
                        + ' publications.publication_source_id, publication_sources.name AS publication_source_name,'
                        + ' publications.updated'
                        + ' FROM publications'
                        + ' LEFT JOIN journals ON journals.id = publications.journal_id'
                        + ' LEFT JOIN publication_sources ON publication_sources.id = publications.publication_source_id'
                        + ' LEFT JOIN people_publications ON people_publications.publication_id = publications.id'
                        + ' WHERE (people_publications.publication_id IS NULL'
                        + ' OR publications.id NOT IN '
                        +     ' (SELECT people_publications.publication_id '
                        +      ' FROM people_publications'
                        +      ' WHERE people_publications.person_id = ?))';
    places.push(personID)
    // now add the search conditions
    let conditions = '';
    if (queryAuthors !== undefined) {
        for (let ind in queryAuthors.exactMatches) {
            conditions = conditions + ' AND REGEXP_LIKE(publications.authors_raw, ?, "c")';
            places.push(queryAuthors.exactMatches[ind])
        }
        if (queryAuthors.remainingStr !== '') {
            conditions = conditions + ' AND publications.authors_raw LIKE ?';
            places.push('%' + queryAuthors.remainingStr.replace(/\s/gi,'%') + '%');
        }
    }
    if (queryTitle !== undefined) {
        for (let ind in queryTitle.exactMatches) {
            conditions = conditions + ' AND REGEXP_LIKE(publications.title, ?, "c")';
            places.push(queryTitle.exactMatches[ind])
        }
        if (queryTitle.remainingStr !== '') {
            conditions = conditions + ' AND publications.title LIKE ?';
            places.push('%' + queryTitle.remainingStr.replace(/\s/gi,'%') + '%');
        }
    }
    querySQL = querySQL + conditions + ';';
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.publications = resQuery;
            if (resQuery.length > 0) {
                return publicationsList.getPublicationsDescriptions(options, 0);
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

var actionCreatePersonPublicationAssociation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let publicationID = req.params.publicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO people_publications'
                        + ' (person_id, publication_id)'
                        + ' VALUES (?, ?);';
    places.push(personID, publicationID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createPersonPublicationAssociation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreatePersonPublicationAssociation(options) },
        { req, res, next }
    );
};