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

var getAssociationPeoplePublication = function (options) {
    let { req, res, next, publication } = options;
    let pubID = publication.id;
    var querySQL = 'SELECT *'
                + ' FROM people_publications'
                + ' WHERE publication_id = ?';
    var places = [pubID];
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let person_selected = [];
            let person_id = [];
            for (let ind in resQuery) {
                person_id.push(resQuery[ind].person_id);
                if (resQuery[ind].selected === 1) {
                    person_selected.push(resQuery[ind].person_id);
                }
            }
            publication.person_id = person_id;
            publication.person_selected = person_selected;
            return getAssociationLabsPublication(options);
        },
        options
    );
}
var getAssociationLabsPublication = function (options) {
    let { req, res, next, publication } = options;
    let pubID = publication.id;
    var querySQL = 'SELECT DISTINCT labs_publications.*, groups_units.unit_id'
                + ' FROM labs_publications'
                + ' LEFT JOIN labs_groups ON labs_groups.lab_id = labs_publications.lab_id'
                + ' LEFT JOIN `groups` ON labs_groups.group_id = `groups`.id'
                + ' LEFT JOIN groups_units ON groups_units.group_id = `groups`.id'
                + ' WHERE labs_publications.publication_id = ?';
    var places = [pubID];
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let lab_selected = [];
            let lab_id = [];
            let group_id = [];
            let groups_used = [];
            for (let ind in resQuery) {
                lab_id.push({
                    lab_id: resQuery[ind].lab_id,
                    group_id: resQuery[ind].group_id,
                    unit_id: resQuery[ind].unit_id,
                });
                if(groups_used.indexOf(resQuery[ind].group_id) === -1) {
                    group_id.push({
                        group_id: resQuery[ind].group_id,
                        unit_id: resQuery[ind].unit_id,
                    })
                    groups_used.push(resQuery[ind].group_id);
                }
                if (resQuery[ind].selected === 1) {
                    lab_selected.push({
                        lab_id: resQuery[ind].lab_id,
                        group_id: resQuery[ind].group_id,
                        unit_id: resQuery[ind].unit_id,
                    });
                }
            }
            publication.lab_id = lab_id;
            publication.lab_selected = lab_selected;
            publication.group_id = group_id;
            return getAssociationUnitsPublication(options);
        },
        options
    );
}
var getAssociationUnitsPublication = function (options) {
    let { req, res, next, publication } = options;
    let pubID = publication.id;
    var querySQL = 'SELECT DISTINCT *'
                + ' FROM units_publications'
                + ' WHERE publication_id = ?';
    var places = [pubID];
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let unit_id = [];
            for (let ind in resQuery) {
                unit_id.push(resQuery[ind].unit_id);
            }
            publication.unit_id = unit_id;
            responses.sendJSONResponse(res, 200,
                {
                    "status": "success",
                    "statusCode": 200,
                    "count": 1,
                    "result": [publication]
                });
            return;
        },
        options
    );
}

module.exports.getPublicationInfo = function (req, res, next) {
    let pubID = req.params.pubID;
    var querySQL = 'SELECT publications.*,' +
                    ' journals.name AS journal_name, journals.short_name AS journal_short_name, ' +
                    ' journals.publisher, journals.publisher_city, journals.issn, journals.eissn ' +
                    'FROM publications' +
                    ' LEFT JOIN journals ON publications.journal_id = journals.id' +
                    ' WHERE publications.id = ?';
    var places = [pubID];
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.publication = resQuery[0];
                return getAssociationPeoplePublication(options);
            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": 0,
                        "result": []
                    });
                return;
            }
        },
        {req, res, next}
    );
};

/*
responses.sendJSONResponse(res, 200,
                {
                    "status": "success",
                    "statusCode": 200,
                    "count": 1,
                    "result": [publication]
                });
            return;
*/