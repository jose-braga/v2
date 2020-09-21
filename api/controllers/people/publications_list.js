const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const notifications = require('../utilities/notifications');
const addPublication = require('./add_publications');

var actionGetAllPublications = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT publications.authors_raw, publications.title, publications.volume, publications.page_start, publications.page_end,'
                        + ' publications.doi, publications.wos, publications.pubmed_id,'
                        + ' publications.publication_date, publications.year, '
                        + ' publications.journal_id, journals.name AS journal_name, journals.short_name AS journal_short_name,'
                        + ' journals.publisher, journals.publisher_city, journals.issn, journals.eissn'
                        + ' FROM publications'
                        + ' LEFT JOIN journals ON journals.id = publications.journal_id;';
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getAllPublications = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetAllPublications(options) },
        { req, res, next }
    );
};

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
                return module.exports.getPublicationsDescriptions(options, 0);
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
module.exports.getPublicationsDescriptions = function (options, i) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT publication_descriptions.*,'
                        + ' publication_types.name_en'
                        + ' FROM publication_descriptions'
                        + ' JOIN publication_types ON publication_types.id = publication_descriptions.publication_type'
                        + ' WHERE publication_descriptions.publication_id = ?;';
    places.push(options.publications[i].publication_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.publications[i].publication_types = resQuery;
            return getPublicationCitations(options, i)
        },
        options);
};
var getPublicationCitations = function (options, i) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM citations  '
                        + ' WHERE citations.publication_id = ?;';
    places.push(options.publications[i].publication_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.publications[i].citations = resQuery;
            getJournalImpactFactor(options, i)
        },
        options);
};
var getJournalImpactFactor = function (options, i) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM impact_factors'
                        + ' WHERE impact_factors.journal_id = ?;';
    places.push(options.publications[i].journal_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.publications[i].impact_factors = resQuery;
            if (i + 1 < options.publications.length) {
                module.exports.getPublicationsDescriptions(options, i + 1);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200, "count": options.publications.length,
                        "result": options.publications,
                    }
                });
                return;
            }
        },
        options);
};
module.exports.getPublications = function (req, res, next) {
    if (Object.entries(req.query).length === 0) {
        permissions.checkPermissions(
            (options) => {
                actionGetPublications(options);
            },
            { req, res, next }
        );
    } else {
        //search in database available when adding publications
        return addPublication.getPublicationsSearchDatabase(req, res, next)
    }

};

var actionUpdatePersonPublicationAssociation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let publicationID = req.params.publicationID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE people_publications'
                        + ' SET public = ?, selected = ?'
                        + ' WHERE person_id = ? AND publication_id = ?;';
    places.push(data.public, data.selected, personID, publicationID)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = {
                entityType: 'publications',
                entityID: publicationID
            };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "OK - Associated person with publication!"
            }
        });
};
module.exports.updatePersonPublicationAssociation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdatePersonPublicationAssociation(options) },
        { req, res, next }
    );
};

var actionDeletePersonPublicationAssociation = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let publicationID = req.params.publicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM people_publications'
                        + ' WHERE person_id = ? AND publication_id = ?;';
    places.push(personID, publicationID)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = {
                entityType: 'publications',
                entityID: publicationID
            };
            notifications.notifyWebsiteAPI(notificationConfig)
            return responses.sendJSONResponseOptions(options)
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200, "count": 0,
                "result": "OK - Dissociated person with publication!"
            }
        });
};
module.exports.deletePersonPublicationAssociation = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeletePersonPublicationAssociation(options) },
        { req, res, next }
    );
};

var actionUpdatePersonPublication = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let publicationID = req.params.publicationID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE people_publications'
                        + ' SET author_type_id = ?,'
                        + ' position = ?,'
                        + ' selected_rank = ?'
                        + ' WHERE person_id = ? AND publication_id = ?;';
    places.push(
        data.author_type_id,
        data.position,
        data.selected_rank,
        personID,
        publicationID)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => { actionUpdatePublication(options) },
        options);
};
var actionUpdatePublication = function (options) {
    let { req, res, next } = options;
    let publicationID = req.params.publicationID;
    let now = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE publications'
                        + ' SET authors_raw = ?,'
                        + ' number_authors = ?,'
                        + ' title = ?,'
                        + ' journal_id = ?,'
                        + ' volume = ?,'
                        + ' page_start = ?,'
                        + ' page_end = ?,'
                        + ' doi = ?,'
                        + ' publication_source_id = ?,'
                        + ' publication_date = ?,'
                        + ' year = ?,'
                        + ' updated = ?'
                        + ' WHERE id = ?;';
    places.push(
        data.authors_raw,
        data.number_authors,
        data.title,
        data.journal_id,
        data.volume,
        data.page_start,
        data.page_end,
        data.doi,
        data.publication_source_id,
        data.publication_date,
        data.year,
        now,
        publicationID)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => { actionDeletePreviousPublicationDescription(options) },
        options);
};
var actionDeletePreviousPublicationDescription = function (options) {
    let { req, res, next } = options;
    let publicationID = req.params.publicationID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM publication_descriptions'
                        + ' WHERE publication_id = ?;';
    places.push(publicationID)
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (data.publication_types !== null
                    && data.publication_types !== undefined
                    && data.publication_types.length > 0) {
                return actionInsertNewPublicationDescription(options, 0);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200, "message": "Success!",
                    }
                });
                return;
            }
        },
        options);
}
var actionInsertNewPublicationDescription = function (options, i) {
    let { req, res, next } = options;
    let publicationID = req.params.publicationID;
    let data = req.body.data.publication_types[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO publication_descriptions'
                        + ' (publication_id, publication_type)'
                        + ' VALUES (?, ?);';
    if (typeof data === 'number') {
        places.push(publicationID, data);
    } else {
        places.push(publicationID, data.publication_type);
    }
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            if (i + 1 < req.body.data.publication_types.length) {
                return actionInsertNewPublicationDescription(options, i + 1);
            } else {
                let notificationConfig = {
                    entityType: 'publications',
                    entityID: publicationID
                };
                notifications.notifyWebsiteAPI(notificationConfig)
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                    }
                });
                return;
            }
        },
        options);
};
module.exports.updatePublication = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUpdatePersonPublication(options) },
        { req, res, next }
    );
};