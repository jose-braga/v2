const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
var time = require('../utilities/time');

function incrementCounter(obj, key) {
    obj[key] = obj[key] + 1;
    return obj;
}

var getPersonCurrentUnit = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT groups_units.unit_id'
        + ' FROM people_labs'
        + ' JOIN labs ON labs.id = people_labs.lab_id'
        + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
        + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
        + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
        + ' WHERE people_labs.person_id = ?'
        + ' AND ((people_labs.valid_from IS NULL AND people_labs.valid_until IS NULL)'
        + '     OR (people_labs.valid_from <= CURDATE() AND people_labs.valid_until IS NULL)'
        + '     OR (people_labs.valid_from IS NULL AND people_labs.valid_until >= CURDATE())'
        + '     OR (people_labs.valid_from <= CURDATE() AND people_labs.valid_until >= CURDATE()))'
        + ' UNION'
        + ' SELECT DISTINCT technicians_units.unit_id'
        + ' FROM technicians'
        + ' JOIN technician_offices ON technician_offices.id = technicians.technician_office_id'
        + ' JOIN technicians_units ON technicians_units.technician_id = technicians.id'
        + ' WHERE technicians.person_id = ?'
        + ' AND ((technicians.valid_from IS NULL AND technicians.valid_until IS NULL)'
        + '    OR (technicians.valid_from <= CURDATE() AND technicians.valid_until IS NULL)'
        + '    OR (technicians.valid_from IS NULL AND technicians.valid_until >= CURDATE())'
        + '    OR (technicians.valid_from <= CURDATE() AND technicians.valid_until >= CURDATE()))'
        + ' UNION'
        + ' SELECT DISTINCT science_managers_units.unit_id'
        + ' FROM science_managers'
        + ' JOIN science_manager_offices ON science_manager_offices.id = science_managers.science_manager_office_id'
        + ' JOIN science_managers_units ON science_managers_units.science_manager_id = science_managers.id'
        + ' WHERE science_managers.person_id = ?'
        + ' AND ((science_managers.valid_from IS NULL AND science_managers.valid_until IS NULL)'
        + '    OR (science_managers.valid_from <= CURDATE() AND science_managers.valid_until IS NULL)'
        + '    OR (science_managers.valid_from IS NULL AND science_managers.valid_until >= CURDATE())'
        + '    OR (science_managers.valid_from <= CURDATE() AND science_managers.valid_until >= CURDATE()))'
        + ' UNION'
        + ' SELECT DISTINCT people_administrative_units.unit_id'
        + ' FROM people_administrative_offices'
        + ' JOIN administrative_offices ON administrative_offices.id = people_administrative_offices.administrative_office_id'
        + ' JOIN people_administrative_units ON people_administrative_units.administrative_id = people_administrative_offices.id'
        + ' WHERE people_administrative_offices.person_id = ?'
        + ' AND ((people_administrative_offices.valid_from IS NULL AND people_administrative_offices.valid_until IS NULL)'
        + '    OR (people_administrative_offices.valid_from <= CURDATE() AND people_administrative_offices.valid_until IS NULL)'
        + '    OR (people_administrative_offices.valid_from IS NULL AND people_administrative_offices.valid_until >= CURDATE())'
        + '    OR (people_administrative_offices.valid_from <= CURDATE() AND people_administrative_offices.valid_until >= CURDATE()))';
    places.push(personID, personID, personID, personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                let currentUnits = [];
                for (let ind in resQuery) {
                    if (currentUnits.indexOf(resQuery[ind].unit_id) === -1) {
                        currentUnits.push(resQuery[ind].unit_id)
                    }
                }
                options.currentUnits = currentUnits;
                let counter = {}
                options.notFilled = {};
                options.filled = {};
                options.comments = {};
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    counter[unit] = 0;
                    options.notFilled[unit] = [];
                    options.filled[unit] = [];
                    options.comments[unit] = [];
                }
                options.countFilled = counter; // count the fields filled for each unit
                //options.notFilled = [];
                //options.filled = [];
                return getPersonCurrentPoles(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "result": resQuery,
                    }
                });
                return;
            }
        },
        options);
};
var getPersonCurrentPoles = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT city_id'
        + ' FROM people_institution_city'
        + ' WHERE person_id = ?'
        + ' AND ((valid_from IS NULL AND valid_until IS NULL)'
        + '     OR (valid_from <= CURDATE() AND valid_until IS NULL)'
        + '     OR (valid_from IS NULL AND valid_until >= CURDATE())'
        + '     OR (valid_from <= CURDATE() AND valid_until >= CURDATE()))'
        ;
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let currentPoles = [];
            for (let ind in resQuery) {
                if (currentPoles.indexOf(resQuery[ind].city_id) === -1) {
                    currentPoles.push(resQuery[ind].city_id)
                }
            }
            options.currentPoles = currentPoles;
            return getPersonCurrentDepartments(options);
        },
        options);
};
var getPersonCurrentDepartments = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT DISTINCT department_id'
        + ' FROM people_departments'
        + ' WHERE person_id = ?'
        + ' AND ((valid_from IS NULL AND valid_until IS NULL)'
        + '     OR (valid_from <= CURDATE() AND valid_until IS NULL)'
        + '     OR (valid_from IS NULL AND valid_until >= CURDATE())'
        + '     OR (valid_from <= CURDATE() AND valid_until >= CURDATE()))'
        ;
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let currentDepartments = [];
            for (let ind in resQuery) {
                if (currentDepartments.indexOf(resQuery[ind].department_id) === -1) {
                    currentDepartments.push(resQuery[ind].department_id)
                }
            }
            options.currentDepartments = currentDepartments;
            return checkVisibilityGender(options);
        },
        options);
};
var checkVisibilityGender = function (options) {
    let { req, res, next, currentUnits } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM people'
        + ' WHERE id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1 && resQuery[0].visible_public === 1) {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.countFilled = incrementCounter(options.countFilled, unit);
                    options.filled[unit].push('Data visibility authorization')
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('Data visibility authorization')
                }
            }
            if (resQuery.length === 1 &&
                (resQuery[0].gender !== undefined && resQuery[0].gender !== null)) {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.countFilled = incrementCounter(options.countFilled, unit);
                    options.filled[unit].push('Nuclear Information - Gender');
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('Nuclear Information - Gender');
                }
            }
            return checkPhoto(options);
        },
        options);
};
var checkPhoto = function (options) {
    let { req, res, next, currentUnits } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT url FROM personal_photo'
        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length >= 1
                && resQuery[0].url !== undefined && resQuery[0].url !== null) {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.countFilled = incrementCounter(options.countFilled, unit);
                    options.filled[unit].push('Photo')
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('Photo');
                }
            }
            return checkNationalities(options);
        },
        options);
};
var checkNationalities = function (options) {
    let { req, res, next, currentUnits } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT country_id FROM people_countries'
        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length >= 1
                && resQuery[0].country_id !== undefined && resQuery[0].country_id !== null) {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.countFilled = incrementCounter(options.countFilled, unit);
                    options.filled[unit].push('Nationality')
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('Nationality')
                }
            }
            return checkShortCV(options);
        },
        options);
};
var checkShortCV = function (options) {
    let { req, res, next, currentUnits } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT text FROM website_texts'
        + ' WHERE person_id = ? AND text_type_id = 1;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length >= 1
                && resQuery[0].text !== undefined && resQuery[0].text !== null
                && resQuery[0].text !== '') {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.countFilled = incrementCounter(options.countFilled, unit);
                    options.filled[unit].push('Short CV')
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('Short CV')
                }
            }
            return checkPersonalURLs(options);
        },
        options);
};
var checkPersonalURLs = function (options) {
    let { req, res, next, currentUnits } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT url, url_type_id FROM personal_urls'
        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            //console.log(resQuery)
            if (resQuery.length >= 1) {
                let noCV = true;
                let noPersonalPage = true;
                for (let indURL in resQuery) {
                    if (resQuery[indURL].url !== undefined && resQuery[indURL].url !== null
                        && resQuery[indURL].url !== '') {
                        if (resQuery[indURL].url_type_id === 1 && noCV) {
                            noCV = false;
                            for (let ind in currentUnits) {
                                let unit = currentUnits[ind];
                                options.countFilled = incrementCounter(options.countFilled, unit);
                                options.filled[unit].push('Personal URLs - CV');

                            }
                        }
                        if (resQuery[indURL].url_type_id === 2 && noPersonalPage) {
                            noPersonalPage = false
                            for (let ind in currentUnits) {
                                let unit = currentUnits[ind];
                                options.countFilled = incrementCounter(options.countFilled, unit);
                                options.filled[unit].push('Personal URLs - Personal webpage');
                            }
                        }
                    }
                }
                if (noCV) {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.notFilled[unit].push('Personal URLs - CV')
                    }
                }
                if (noPersonalPage) {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.notFilled[unit].push('Personal URLs - Personal webpage')
                    }
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('Personal URLs - CV')
                    options.notFilled[unit].push('Personal URLs - Personal webpage')
                }
            }
            return checkDegrees(options);

        },
        options);
};
var checkDegrees = function (options) {
    let { req, res, next, currentUnits } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT degree_id, start, end, estimate_end FROM degrees_people'
        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length >= 1) {
                let comments = false;
                for (let indItem in resQuery) {
                    if (resQuery[indItem].degree_id !== undefined && resQuery[indItem].degree_id !== null) {
                        if (((resQuery[indItem].end === undefined || resQuery[indItem].end === null)
                            && (resQuery[indItem].estimate_end === undefined || resQuery[indItem].estimate_end === null))
                            && !comments) {
                            comments = true;
                            for (let ind in currentUnits) {
                                let unit = currentUnits[ind];
                                options.comments[unit].push('Missing data in Academic degrees (end date or end estimate).');
                            }
                        }
                    } else {
                        comments = true;
                        for (let ind in currentUnits) {
                            let unit = currentUnits[ind];
                            options.comments[unit].push('Missing data in Academic degrees (end date or end estimate).');
                        }
                    }
                }
                if (!comments) {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.countFilled = incrementCounter(options.countFilled, unit);
                        options.filled[unit].push('Degrees')
                    }
                } else {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.notFilled[unit].push('Degrees')
                    }
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('Degrees')
                }
            }
            return checkProfessionSituations(options);

        },
        options);
};
var checkProfessionSituations = function (options) {
    // must have a current professional situation
    let { req, res, next, currentUnits } = options;
    let personID = req.params.personID;
    let today = time.moment();
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT jobs.*,'
        + ' jobs_fellowships.fellowship_id, fellowships.reference AS fellowship_reference,'
        + ' fellowships_management_entities.management_entity_id AS fellowship_management_entity_id,'
        + ' jobs_contracts.contract_id, contracts.reference AS contract_reference,'
        + ' contracts_management_entities.management_entity_id AS contract_management_entity_id'
        + ' FROM jobs'
        + ' LEFT JOIN jobs_fellowships ON jobs_fellowships.job_id = jobs.id'
        + ' LEFT JOIN fellowships ON fellowships.id = jobs_fellowships.fellowship_id'
        + ' LEFT JOIN fellowships_management_entities ON fellowships_management_entities.fellowship_id = fellowships.id'
        + ' LEFT JOIN jobs_contracts ON jobs_contracts.job_id = jobs.id'
        + ' LEFT JOIN contracts ON contracts.id = jobs_contracts.contract_id'
        + ' LEFT JOIN contracts_management_entities ON contracts_management_entities.contract_id = contracts.id'
        + ' WHERE jobs.person_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length >= 1) {
                // tries to find current job
                let hasCurrentJob = false;
                let indCurrentJob;
                for (let indJob in resQuery) {
                    if (
                        (resQuery[indJob].valid_from === undefined
                            || resQuery[indJob].valid_from === null
                            || time.moment(resQuery[indJob].valid_from).isSameOrBefore(today))
                        &&
                        (resQuery[indJob].valid_until === undefined
                            || resQuery[indJob].valid_until === null
                            || time.moment(resQuery[indJob].valid_until).isAfter(today))
                        ) {

                        hasCurrentJob = true;
                        indCurrentJob = indJob;
                    }
                }
                if (hasCurrentJob) {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.countFilled = incrementCounter(options.countFilled, unit);
                        options.filled[unit].push('Jobs')
                        if (resQuery[indCurrentJob].organization === ''
                            || resQuery[indCurrentJob].organization === undefined
                            || resQuery[indCurrentJob].organization === null
                        ) {
                            options.comments[unit].push('No organization defined in jobs.');
                        }
                    }
                } else {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.notFilled[unit].push('Jobs')
                        options.comments[unit].push('No current jobs defined.');
                    }
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('Jobs')
                }
            }
            return checkAcademicInstitutions(options);
        },
        options);
};
var checkAcademicInstitutions = function (options) {
    let { req, res, next, currentUnits } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM people_departments'
        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length >= 1) {
                if(resQuery[0].department_id !== undefined
                        && resQuery[0].department_id !== null) {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.countFilled = incrementCounter(options.countFilled, unit);
                        options.filled[unit].push('Academic Institutions')
                    }
                } else {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.notFilled[unit].push('Academic Institutions')
                    }
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('Academic Institutions')
                }
            }
            return checkWorkplace(options);

        },
        options);
};
var checkWorkplace = function (options) {
    let { req, res, next, currentUnits } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM workplaces'
        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length >= 1) {
                if(resQuery[0].workplace !== undefined
                        && resQuery[0].workplace !== null
                        && resQuery[0].workplace !== '') {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.countFilled = incrementCounter(options.countFilled, unit);
                        options.filled[unit].push('Workplace')
                    }
                } else {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.notFilled[unit].push('Workplace')
                    }
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('Workplace')
                }
            }
            return checkScientificIdentifications(options);

        },
        options);
};
var checkScientificIdentifications = function (options) {
    let { req, res, next, currentUnits } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM researchers_info'
        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length >= 1) {
                if(resQuery[0].ciencia_id !== undefined
                        && resQuery[0].ciencia_id !== null
                        && resQuery[0].ciencia_id !== ''
                ) {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.countFilled = incrementCounter(options.countFilled, unit);
                        options.filled[unit].push('CiênciaID')
                    }
                } else {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.notFilled[unit].push('CiênciaID')
                    }
                }
                if(resQuery[0].ORCID !== undefined
                        && resQuery[0].ORCID !== null
                        && resQuery[0].ORCID !== ''
                ) {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.countFilled = incrementCounter(options.countFilled, unit);
                        options.filled[unit].push('ORCID')
                    }
                } else {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.notFilled[unit].push('ORCID')
                    }
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('CiênciaID')
                    options.notFilled[unit].push('ORCID')
                }
            }
            return checkResearchInterests(options);
        },
        options);
};
var checkResearchInterests = function (options) {
    let { req, res, next, currentUnits } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM research_interests'
        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length >= 1) {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.countFilled = incrementCounter(options.countFilled, unit);
                    options.filled[unit].push('Research Interests')
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('Research Interests')
                }
            }
            return checkInstitutionalContacts(options);

        },
        options);
};
var checkInstitutionalContacts = function (options) {
    let { req, res, next, currentUnits } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM emails'
        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length >= 1) {
                if(resQuery[0].email !== undefined
                        && resQuery[0].email !== null
                        && resQuery[0].email !== '') {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.countFilled = incrementCounter(options.countFilled, unit);
                        options.filled[unit].push('Institutional Contacts')
                    }
                } else {
                    for (let ind in currentUnits) {
                        let unit = currentUnits[ind];
                        options.notFilled[unit].push('Institutional Contacts')
                    }
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('Institutional Contacts')
                }
            }
            return checkCostCenters(options);

        },
        options);
};
var checkCostCenters = function (options) {
    let { req, res, next, currentUnits } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM people_cost_centers'
        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length >= 1) {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.countFilled = incrementCounter(options.countFilled, unit);
                    options.filled[unit].push('Cost Centers')
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('Cost Centers')
                }
            }
            return checkPublications(options);

        },
        options);
};
var checkPublications = function (options) {
    let { req, res, next, currentUnits } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM people_publications'
        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length >= 1) {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.countFilled = incrementCounter(options.countFilled, unit);
                    options.filled[unit].push('Publications')
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('Publications')
                }
            }
            return checkSpaces(options);
        },
        options);
};
var checkSpaces = function (options) {
    let { req, res, next, currentUnits } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM users_spaces'
        + ' WHERE person_id = ?;';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length >= 1) {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.countFilled = incrementCounter(options.countFilled, unit);
                    options.filled[unit].push('Spaces')
                }
            } else {
                for (let ind in currentUnits) {
                    let unit = currentUnits[ind];
                    options.notFilled[unit].push('Spaces')
                }
            }
            return computeCompleteness(options);
        },
        options);
};

var computeCompleteness = function (options) {
    let { req, res, next, currentUnits,
        currentPoles,
        currentDepartments,
        filled,
        notFilled,
    } = options;
    let score = {};
    let scoreMax = {};
    let normalizedScore = [];
    let fieldsUnit = {
        1: [
            'Data visibility authorization',
            'Nuclear Information - Gender',
            'Photo',
            'Nationality',
            'Personal URLs - Personal webpage',
            'Personal URLs - CV',
            'Degrees',
            'Jobs',
            'Academic Institutions',
            'Workplace',
            'CiênciaID',
            'ORCID',
            'Research Interests',
            'Institutional Contacts',
            'Publications',
            'Spaces',
        ],
        2: [
            'Data visibility authorization',
            'Nuclear Information - Gender',
            'Photo',
            'Short CV',
            'Personal URLs - Personal webpage',
            'Personal URLs - CV',
            'Degrees',
            'Jobs',
            'Academic Institutions',
            'Workplace',
            'CiênciaID',
            'ORCID',
            'Institutional Contacts',
            'Cost Centers',
            'Publications',
            'Spaces',
        ],
    }
    for (let ind in currentUnits) {
        let unit = currentUnits[ind];
        let thisFilled = filled[unit];
        let thisNotFilled = notFilled[unit];
        let thisUnitFilled = fieldsUnit[unit];
        let thisScore = 0;
        let thisMaxScore = 0;
        let unitName = ''
        let toBeFilled = []
        // remove 'Academic Institutions' from not filled if workplace is filled
        if (thisFilled.indexOf('Workplace') !== -1 &&
            thisNotFilled.indexOf('Academic Institutions') !== -1
        ) {
            thisNotFilled.splice(thisNotFilled.indexOf('Academic Institutions'), 1)
        }
        // and vice-versa
        if (thisFilled.indexOf('Academic Institutions') !== -1 &&
            thisNotFilled.indexOf('Workplace') !== -1
        ) {
            thisNotFilled.splice(thisNotFilled.indexOf('Workplace'), 1)
        }
        for (let indFill in thisFilled) {
            if (thisUnitFilled.indexOf(thisFilled[indFill]) !== -1) {
                thisScore++;
            }
            if (unit === 2 && currentPoles[0] !== 2 && thisFilled[indFill] === 'Cost Centers') thisScore--;
        }
        for (let indFill in thisNotFilled) {
            if (thisUnitFilled.indexOf(thisNotFilled[indFill]) !== -1) {
                if (currentPoles[0] === 2 && thisNotFilled[indFill] === 'Cost Centers') {
                    toBeFilled.push(thisNotFilled[indFill])
                } else if (currentPoles[0] === 1 && currentDepartments[0] === 1
                        && thisNotFilled[indFill] === 'Spaces'
                ) {
                    toBeFilled.push(thisNotFilled[indFill])
                } else if (
                    thisNotFilled[indFill] !== 'Cost Centers'
                    && thisNotFilled[indFill] !== 'Spaces'
                ) {
                    toBeFilled.push(thisNotFilled[indFill])
                }
            }
        }
        if (unit === 1) {
            unitName = 'UCIBIO';
            thisMaxScore = 14;
            if (currentDepartments[0] === 1) thisMaxScore = 15;
        } else if (unit === 2) {
            unitName = 'LAQV';
            thisMaxScore = 13;
            if (currentDepartments[0] === 1) thisMaxScore = 14;
            if (currentPoles[0] === 2) thisMaxScore = 14;
        }
        score[unit] = thisScore;
        scoreMax[unit] = thisMaxScore;
        normalizedScore.push({
            unitName,
            score: (thisScore * 100.0) / (thisMaxScore * 1.0),
            notFilled: toBeFilled,
            comments: options.comments[unit],
        })
    }
    responses.sendJSONResponseOptions({
        response: res,
        status: 200,
        message: {
            "status": "success", "statusCode": 200,
            "result": {
                currentUnits,
                currentPoles,
                currentDepartments,
                countFilled: options.countFilled,
                filled,
                notFilled,
                comments: options.comments,
                score,
                scoreMax,
                normalizedScore,
            },
        }
    });
    return;
}

/*

responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "result": {
                        countFilled: options.countFilled,
                        filled: options.filled,
                        notFilled: options.notFilled,
                        comments: options.comments,
                    },
                }
            });
            return;
*/

module.exports.getProfileCompleteness = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { getPersonCurrentUnit(options) },
        { req, res, next }
    );
};