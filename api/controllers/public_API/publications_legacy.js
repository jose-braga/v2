const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');

var getPeopleAssociatedPublication = function(options) {
    let { req, res, next, publications, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT person_id, selected'
             + ' FROM people_publications'
             + ' WHERE publication_id = ? AND public = 1;';
    places.push(publications[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data_people = [];
            let data_selected = [];
            for (let ind in resQuery) {
                data_people.push(resQuery[ind].person_id)
                if (resQuery[ind].selected === 1) {
                    data_selected.push(resQuery[ind].person_id)
                }
            }
            publications[i].person_id = data_people;
            publications[i].person_selected = data_selected;
            return getLabAssociatedPublication(options);
        },
        options
    );
};
var getLabAssociatedPublication = function(options) {
    let { req, res, next, publications, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT labs_publications.lab_id, labs_publications.group_id, groups_units.unit_id,'
             + ' labs_publications.selected'
             + ' FROM labs_publications'
             + ' LEFT JOIN groups_units ON groups_units.group_id = labs_publications.group_id'
             + ' WHERE labs_publications.publication_id = ? AND labs_publications.public = 1;';
    places.push(publications[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data_labs = [];
            let data_selected = [];
            for (let ind in resQuery) {
                data_labs.push({
                    lab_id: resQuery[ind].lab_id,
                    group_id: resQuery[ind].group_id,
                    unit_id: resQuery[ind].unit_id,
                });
                if (resQuery[ind].selected === 1) {
                    data_selected.push({
                        lab_id: resQuery[ind].lab_id,
                        group_id: resQuery[ind].group_id,
                        unit_id: resQuery[ind].unit_id,
                    });
                }
            }
            publications[i].lab_id = data_labs;
            publications[i].lab_selected = data_selected;
            return getUnitAssociatedPublication(options);
        },
        options
    );
};
var getUnitAssociatedPublication = function(options) {
    let { req, res, next, publications, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT unit_id, selected'
             + ' FROM units_publications'
             + ' WHERE publication_id = ? AND public = 1;';
    places.push(publications[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data_units = [];
            let data_selected = [];
            for (let ind in resQuery) {
                data_units.push(resQuery[ind].unit_id);
                if (resQuery[ind].selected === 1) {
                    data_selected.push(resQuery[ind].unit_id);
                }
            }
            publications[i].unit_id = data_units;
            publications[i].unit_selected = data_selected;
            if (i + 1 < publications.length) {
                options.i = i + 1;
                return getPeopleAssociatedPublication(options)
            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": publications.length,
                        "result": publications
                    });
                return;
            }
        },
        options
    );
};
module.exports.getPublicationInfo = function (req, res, next) {
    var pubID = req.params.pubID;
    var querySQL = 'SELECT publications.*,' +
                    ' journals.name AS journal_name, journals.short_name AS journal_short_name, ' +
                    ' journals.publisher, journals.publisher_city, journals.issn, journals.eissn ' +
                    'FROM publications' +
                    ' LEFT JOIN journals ON publications.journal_id = journals.id' +
                    ' WHERE publications.id = ?;';
    var places = [pubID];
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.publications = resQuery;
                options.i = 0;
                options.singlePublication = true;
                return getPeopleAssociatedPublication(options);
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
module.exports.getLabPublications = function (req, res, next) {
    let labID = req.params.labID;
    let groupID = req.params.groupID;
    let querySQL = 'SELECT labs_publications.selected AS selected, publications.*,' +
                    ' journals.name AS journal_name, journals.short_name AS journal_short_name, ' +
                    ' journals.publisher, journals.publisher_city, journals.issn, journals.eissn ' +
                    'FROM labs_publications' +
                    ' LEFT JOIN publications ON labs_publications.publication_id = publications.id' +
                    ' LEFT JOIN journals ON publications.journal_id = journals.id' +
                    ' WHERE labs_publications.group_id = ? AND labs_publications.lab_id = ?' +
                    ' AND  labs_publications.public = 1;';
    let places = [groupID,labID];
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
module.exports.getUnitPublications = function (req, res, next) {
    let unitID = req.params.unitID;
    let querySQL = 'SELECT publications.*,'
                 + ' journals.name AS journal_name, journals.short_name AS journal_short_name,'
                 + ' journals.publisher, journals.publisher_city, journals.issn, journals.eissn'
                 + ' FROM units_publications'
                 + ' JOIN publications ON publications.id = units_publications.publication_id'
                 + ' LEFT JOIN journals ON publications.journal_id = journals.id'
                 + ' WHERE units_publications.unit_id = ?;';
    let places = [unitID];
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.publications = resQuery;
                options.i = 0;
                return getPeopleAssociatedPublication(options);
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
module.exports.getLatestUnitPublications = function (req, res, next) {
    let unitID = req.params.unitID;
    let numberPublications = 20; // the default number of publications to retrieve
    let currentYear = time.moment().year();

    if (req.query.hasOwnProperty('size')) {
        numberPublications = parseInt(req.query.size, 10);
    }

    var querySQL = 'SELECT publications.*, journals.name AS journal_name'
                + ' FROM publications'
                + ' LEFT JOIN journals ON journals.id = publications.journal_id'
                + ' LEFT JOIN units_publications ON units_publications.publication_id = publications.id'
                + ' WHERE (publications.year = ? OR publications.year = ?) AND units_publications.unit_id = ?;';
    var places = [currentYear, currentYear - 1, unitID];
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 0 || resQuery === undefined) {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "No data!",
                        "statusCode": 200,
                        "count": 0,
                        "result": []
                    });
                return;
            } else {
                if (resQuery.length < numberPublications) {
                    responses.sendJSONResponse(res, 200,
                        {
                            "status": "success",
                            "statusCode": 200,
                            "count": resQuery.length,
                            "result": resQuery
                        });
                    return;
                } else {
                    // get all publications in which month (and preferably day) is known
                    // sorts publications according to publication date
                    // and then picks up first numberPublications
                    let publicationsWithDate = [];
                    let idsUsed = [];
                    for (let ind in resQuery) {
                        if (resQuery[ind].publication_date !== null) {
                            let thisDate = resQuery[ind].publication_date;
                            let dateComponents = thisDate.split(' ');
                            let month = null;
                            let day = null;
                            let addToList = false;
                            if (dateComponents.length === 1) {
                                // might be a number (reject)
                                // a string representing only month
                                // a range of months (e.g. 'MAY-JUN') (take only  first)
                                if (!Number.isNaN(parseInt(dateComponents[0], 10))) {
                                    // is a number => do nothing
                                } else if (dateComponents[0].includes('-')) {
                                    let dateRangeSplit = dateComponents[0].split('-');
                                    let initialMonth = dateRangeSplit[0];
                                    if (time.moment(initialMonth, 'MMM').isValid()) {
                                        month = time.moment(initialMonth, 'MMM').month();
                                        day = 1;
                                        addToList = true;
                                    }
                                } else {
                                    // this must be a single month
                                    if (time.moment(dateComponents[0], 'MMM').isValid()) {
                                        month = time.moment(dateComponents[0], 'MMM').month();
                                        day = 1;
                                        addToList = true;
                                    }
                                }
                            } else if (dateComponents.length === 2) {
                                if (time.moment(thisDate, ['MMM DD', 'MMM D']).isValid()) {
                                    month = time.moment(thisDate, ['MMM DD', 'MMM D']).month();
                                    day = time.moment(thisDate, ['MMM DD', 'MMM D']).date();
                                    addToList = true;
                                }
                            }
                            if (addToList) {
                                resQuery[ind].curated_date = time.moment({
                                    year: currentYear,
                                    month: month,
                                    day: day
                                });
                                publicationsWithDate.push(resQuery[ind]);
                                idsUsed.push(resQuery[ind].id);
                            }
                        }
                    }
                    publicationsWithDate.sort((a, b) => {
                        if (a.curated_date.isBefore(b.curated_date)) {
                            return +1;
                        } else {
                            return -1;
                        }
                    });
                    if (publicationsWithDate.length < numberPublications) {
                        // adding random publications from the remaining to fill array
                        while (publicationsWithDate.length < numberPublications
                                && publicationsWithDate.length < resQuery.length) {
                            let indRand = getRandomInt(0, numberPublications);
                            if (idsUsed.indexOf(indRand) === -1) {
                                publicationsWithDate.push(resQuery[indRand]);
                                idsUsed.push(resQuery[indRand].id);
                            }
                        }
                        responses.sendJSONResponse(res, 200,
                            {
                                "status": "success",
                                "statusCode": 200,
                                "count": publicationsWithDate.length,
                                "result": publicationsWithDate
                            });
                        return;
                    } else {
                        responses.sendJSONResponse(res, 200,
                            {
                                "status": "success",
                                "statusCode": 200,
                                "count": numberPublications,
                                "result": publicationsWithDate.slice(0, numberPublications)
                            });
                        return;
                    }
                }
            }
        },
        {req, res, next}
    );


};