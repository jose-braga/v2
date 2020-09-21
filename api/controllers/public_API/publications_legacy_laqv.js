const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');


module.exports.getPersonPublications = function (req, res, next) {
    let personID = req.params.personID;
    let querySQL = 'SELECT people_publications.author_type_id,' +
                    ' people_publications.selected, publications.*,' +
                    ' journals.name AS journal_name, journals.short_name AS journal_short_name, ' +
                    ' journals.publisher, journals.publisher_city, journals.issn, journals.eissn ' +
                    'FROM people_publications' +
                    ' LEFT JOIN author_types ON people_publications.author_type_id = author_types.id' +
                    ' LEFT JOIN publications ON people_publications.publication_id = publications.id' +
                    ' LEFT JOIN journals ON publications.journal_id = journals.id' +
                    ' WHERE people_publications.person_id = ? AND people_publications.public = 1;';
    let places = [personID];
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            for (let ind in resQuery) {
                if (resQuery[ind].selected === null || resQuery[ind].selected === 0) {
                    resQuery[ind].selected = false;
                } else if (resQuery[ind].selected === 1) {
                    resQuery[ind].selected = true;
                }
            }
            responses.sendJSONResponse(res, 200,
                {
                    "status": "success",
                    "statusCode": 200,
                    "count": resQuery.length,
                    "result": resQuery
                });
            return;

        },
        {req, res, next}
    );
};

module.exports.getGroupPublications = function (req, res, next) {
    let groupID = req.params.groupID;
    var querySQL = 'SELECT DISTINCT publications.*,' +
                    ' journals.name AS journal_name, journals.short_name AS journal_short_name, ' +
                    ' journals.publisher, journals.publisher_city, journals.issn, journals.eissn ' +
                    'FROM labs_publications' +
                    ' LEFT JOIN publications ON labs_publications.publication_id = publications.id' +
                    ' LEFT JOIN journals ON publications.journal_id = journals.id' +
                    ' WHERE labs_publications.group_id = ?' +
                    ' AND labs_publications.public = 1;';
    var places = [groupID];
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            responses.sendJSONResponse(res, 200,
                {
                    "status": "success",
                    "statusCode": 200,
                    "count": resQuery.length,
                    "result": resQuery
                });
            return;

        },
        {req, res, next}
    );
};