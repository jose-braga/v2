const sql = require('../utilities/sql')
const responses = require('../utilities/responses');
const time = require('../utilities/time');

var checkPermissions = function (options, callback)  {
    let { req, res, next } = options;
    let managerID = req.params.managerID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT *'
        + ' FROM polls_managers'
        + ' WHERE person_id = ?;';
    places.push(managerID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                return callback(options);
            } else {
                return responses.sendJSONResponse(res, 403, {
                    "status": "error",
                    "statusCode": 403,
                    "error": "User is not authorized to this operation."
                });
            }
        },
        options
    );
};

var actionGetPollsList = function (options) {
    let { req, res, next } = options;
    //let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM polls;'
                        ;
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getPollsList = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionGetPollsList)
};
var actionGetPollData = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM polls'
                        + ' WHERE id = ?';
    places.push(pollID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.poll = resQuery[0];
                return getPollQuestions(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 0,
                        "result": {},
                    }
                });
            }
        },
        options
    );
};
var getPollQuestions = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT polls_questions.*, polls_question_types.name_en AS question_type_name_en'
                        + ' FROM polls_questions'
                        + ' JOIN polls_question_types ON polls_question_types.id = polls_questions.question_type_id'
                        + ' WHERE polls_questions.poll_id = ?'
                        + ' ORDER BY polls_questions.sort_order ASC';
    places.push(pollID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.poll.questions = resQuery;
            if (resQuery.length > 0) {
                options.i = 0;
                return getPollQuestionOptions(options);
            } else {
                return getPollTexts(options);
            }
        },
        options
    );
};
var getPollQuestionOptions = function (options) {
    let { req, res, next, i, poll } = options;
    let pollID = req.params.pollID;
    let question = poll.questions[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM polls_question_options'
                        + ' WHERE poll_question_id = ?'
                        + ' ORDER BY sort_order ASC';
    places.push(question.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.poll.questions[i].options = resQuery;
            if (i + 1 < options.poll.questions.length) {
                options.i = i + 1;
                return getPollQuestionOptions(options);
            } else {
                return getPollTexts(options);
            }
        },
        options
    );
};
var getPollTexts = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT polls_texts.*, polls_text_types.name_en AS text_type_name_en'
                        + ' FROM polls_texts'
                        + ' JOIN polls_text_types ON polls_text_types.id = polls_texts.text_type_id'
                        + ' WHERE polls_texts.poll_id = ?'
                        + ' ORDER BY polls_texts.sort_order ASC';
    places.push(pollID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.poll.texts = resQuery;
            if (options.getPollResults) {
                return countRegistered(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 1,
                        "result": options.poll,
                    }
                });
            }
        },
        options
    );
};
module.exports.getPollInfo = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionGetPollData)
};
var actionCreatePoll = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO polls'
        + ' (title, visible)'
        + ' VALUES (?, 0);'
        ;
    places.push('Empty poll');
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.pollID = resQuery.insertId;
            return responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "result": { pollID: options.pollID },
                }
            });
        },
        options);
};
module.exports.createPoll = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionCreatePoll)
};
var actionUpdatePollSettings = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    let data = req.body.data;
    let date_time_from;
    let date_time_until;
    if (data.valid_from !== null && data.valid_from !== undefined && data.valid_from !== '') {
        if (data.time_from !== null && data.time_from !== undefined && data.time_from !== '') {
            date_time_from = data.valid_from + ' ' + data.time_from;
        } else {
            date_time_from = data.valid_from + ' ' + '00:00:00';
        }
    }
    if (data.valid_until !== null && data.valid_until !== undefined && data.valid_until !== '') {
        if (data.time_until !== null && data.time_until !== undefined && data.time_until !== '') {
            date_time_until = data.valid_until + ' ' + data.time_until;
        } else {
            date_time_until = data.valid_until + ' ' + '23:59:59';
        }
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE polls'
        + ' SET title = ?,'
        + ' valid_from = ?,'
        + ' valid_until = ?,'
        + ' visible = ?'
        + ' WHERE id = ?;'
        ;
    places.push(data.title, date_time_from, date_time_until, data.visible, pollID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updatePollSettings = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionUpdatePollSettings)
};

var getPollQuestionsIDs = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM polls_questions WHERE poll_id = ?;';
    places.push(pollID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.questions = resQuery;
            if (resQuery.length > 0) {
                options.i = 0;
                return actionDeletePollQuestionOptions(options);
            } else {
                return actionDeletePollTexts(options);
            }
        },
        options);
};
var actionDeletePollQuestionOptions = function (options) {
    let { req, res, next, questions, i } = options;
    let pollID = req.params.pollID;
    let question = questions[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM polls_question_options WHERE poll_question_id = ?;';
    places.push(question.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < questions.length) {
                options.i = i + 1;
                return actionDeletePollQuestionOptions(options);
            } else {
                return actionDeletePollQuestions(options);
            }
        },
        options);
}
var actionDeletePollQuestions = function (options) {
    let { req, res, next} = options;
    let pollID = req.params.pollID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM polls_questions WHERE poll_id = ?;';
    places.push(pollID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return actionDeletePollTexts(options);
        },
        options);
}
var actionDeletePollTexts = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM polls_texts WHERE poll_id = ?;';
    places.push(pollID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return actionDeletePollPeople(options);
        },
        options);
}
var actionDeletePollPeople = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM people_polls WHERE poll_id = ?;';
    places.push(pollID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return actionDeletePoll(options);
        },
        options);
}
var actionDeletePoll = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM polls WHERE id = ?;';
    places.push(pollID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": "Poll deleted.",
                    }
                });
        },
        options);
}
module.exports.deletePoll = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, getPollQuestionsIDs)
};

var actionAddNewQuestion = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO polls_questions'
        + ' (poll_id, question, required, question_type_id, sort_order)'
        + ' VALUES (?, ?, ?, ?, ?);'
        ;
    places.push(pollID, data.question, data.required, data.question_type_id, data.sort_order);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.questionID = resQuery.insertId;
            if (data.options.length > 0 && data.question_type_id === 1) {
                options.i = 0;
                return addCorrespondingOption(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": "Question added.",
                    }
                });
            }
        },
        options);
};
var addCorrespondingOption = function (options) {
    let { req, res, next, questionID, i } = options;
    let pollID = req.params.pollID;
    let data = req.body.data;
    let option = data.options[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO polls_question_options'
        + ' (poll_question_id, option_text, sort_order)'
        + ' VALUES (?, ?, ?)'
        ;
    places.push(questionID, option.option_text, option.sort_order);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < data.options.length) {
                options.i = i + 1;
                return addCorrespondingOption(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "message": "Question & options added.",
                    }
                });
            }
        },
        options);
};
module.exports.addNewQuestion = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionAddNewQuestion)
};
var actionUpdateQuestion = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    let questionID = req.params.questionID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE polls_questions'
        + ' SET question = ?,'
        + ' required = ?,'
        + ' question_type_id = ?,'
        + ' sort_order = ?'
        + ' WHERE id = ?;'
        ;
    places.push(data.question,
        data.required,
        data.question_type_id,
        data.sort_order,
        questionID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateQuestion = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionUpdateQuestion)
};
var actionDeleteQuestionOptionsFirst = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    let questionID = req.params.questionID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM polls_question_options WHERE poll_question_id = ?;'
        ;
    places.push(questionID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return deleteQuestion(options);
        },
        options);
};
var deleteQuestion = function (options) {
    let { req, res, next } = options;
    let questionID = req.params.questionID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM polls_questions WHERE id = ?;';
    places.push(questionID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "message": "Question & options deleted.",
                }
            });
        },
        options);
};
module.exports.deleteQuestion = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionDeleteQuestionOptionsFirst)
};

var actionAddNewQuestionOption = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    let questionID = req.params.questionID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO polls_question_options'
        + ' (poll_question_id, option_text, sort_order)'
        + ' VALUES (?, ?, ?)'
        ;
    places.push(questionID, data.option_text, data.sort_order);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.addNewQuestionOption = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionAddNewQuestionOption)
};
var actionUpdateQuestionOption = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    let questionID = req.params.questionID;
    let optionID = req.params.optionID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE polls_question_options'
        + ' SET option_text = ?,'
        + ' sort_order = ?'
        + ' WHERE id = ?;'
        ;
    places.push(data.option_text, data.sort_order, optionID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateQuestionOption = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionUpdateQuestionOption)
};
var actionDeleteQuestionOption = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    let questionID = req.params.questionID;
    let optionID = req.params.optionID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM polls_question_options WHERE id = ?;';
    places.push(optionID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.deleteQuestionOption = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionDeleteQuestionOption)
};

var actionAddNewText = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO polls_texts'
        + ' (poll_id, text, text_type_id, sort_order)'
        + ' VALUES (?, ?, ?, ?);'
        ;
    places.push(pollID, data.text, data.text_type_id, data.sort_order);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.addNewText = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionAddNewText)
};
var actionUpdateText = function (options) {
    let { req, res, next } = options;
    let textID = req.params.textID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE polls_texts'
        + ' SET text = ?,'
        + ' text_type_id = ?,'
        + ' sort_order = ?'
        + ' WHERE id = ?;'
        ;
    places.push(data.text, data.text_type_id, data.sort_order, textID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateText = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionUpdateText)
};
var actionDeleteText = function (options) {
    let { req, res, next } = options;
    let textID = req.params.textID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM polls_texts WHERE id = ?;'
        ;
    places.push(textID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.deleteText = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionDeleteText)
};

var actionGetPeopleList = function (options) {
    let { req, res, next } = options;
    let today = time.moment().format('YYYY-MM-DD');
    let q = '%';
    let unit = '%';
    let city = '%';
    let position = '%';
    let sortOrder = 'ASC';

    if (req.query.q !== undefined) {
        let qraw = req.query.q;
        q = '%' + qraw.replace(/\s/gi,'%') + '%'
    }
    if (req.query.unit !== undefined) {
        let unitraw = req.query.unit;
        unit = '%' + unitraw.replace(/\s/gi,'%') + '%'
    }
    if (req.query.city !== undefined) {
        let cityraw = req.query.city;
        city = '%' + cityraw.replace(/\s/gi,'%') + '%'
    }
    if (req.query.position !== undefined) {
        let positionraw = req.query.position;
        position = '%' + positionraw.replace(/\s/gi,'%') + '%'
    }
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        // for people without affiliations
        + 'SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name,'
        + ' lab_positions.name_en AS position_name, labs.name AS lab_name, units.short_name AS unit, institution_city.city'
        + ' FROM people'
        + ' LEFT JOIN people_labs ON people_labs.person_id = people.id'
        + ' LEFT JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
        + ' LEFT JOIN people_institution_city ON people_institution_city.person_id = people.id'
        + ' LEFT JOIN institution_city ON institution_city.id = people_institution_city.city_id'
        + ' LEFT JOIN labs ON labs.id = people_labs.lab_id'
        + ' LEFT JOIN labs_groups ON labs_groups.lab_id = labs.id'
        + ' LEFT JOIN `groups` ON `groups`.id = labs_groups.group_id'
        + ' LEFT JOIN groups_units ON groups_units.group_id = `groups`.id'
        + ' LEFT JOIN units ON units.id = groups_units.unit_id'
        + ' LEFT JOIN technicians ON technicians.person_id = people.id'
        + ' LEFT JOIN science_managers ON science_managers.person_id = people.id'
        + ' LEFT JOIN people_administrative_offices ON people_administrative_offices.person_id = people.id'
        + ' WHERE people.status = 1'
        + ' AND people.name LIKE ?'
        + ' AND (institution_city.city LIKE ? OR institution_city.city IS NULL)'
        + ' AND (people_labs.lab_id IS NULL'
            + ' AND technicians.technician_office_id IS NULL AND science_managers.science_manager_office_id IS NULL'
            + ' AND people_administrative_offices.administrative_office_id IS NULL)'
        + ' UNION'
        // for people with affiliations
        + ' SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name,'
        + ' lab_positions.name_en AS position_name, labs.name AS lab_name, units.short_name AS unit, institution_city.city'
        + ' FROM people'
        + ' JOIN people_labs ON people_labs.person_id = people.id'
        + ' JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
        + ' JOIN people_institution_city ON people_institution_city.person_id = people.id'
        + ' JOIN institution_city ON institution_city.id = people_institution_city.city_id'
        + ' JOIN labs ON labs.id = people_labs.lab_id'
        + ' JOIN labs_groups ON labs_groups.lab_id = labs.id'
        + ' JOIN `groups` ON `groups`.id = labs_groups.group_id'
        + ' JOIN groups_units ON groups_units.group_id = `groups`.id'
        + ' JOIN units ON units.id = groups_units.unit_id'
        + ' WHERE people.status = 1'
        + ' AND people.name LIKE ?'
        + ' AND (units.name LIKE ? OR units.short_name LIKE ?)'
        + ' AND lab_positions.name_en LIKE ?'
        + ' AND institution_city.city LIKE ?'
        + ' AND ((people_labs.valid_from IS NULL AND people_labs.valid_until IS NULL)'
        + '     OR (people_labs.valid_from <= ? AND people_labs.valid_until IS NULL)'
        + '     OR (people_labs.valid_from IS NULL AND people_labs.valid_until >= ?)'
        + '     OR (people_labs.valid_from <= ? AND people_labs.valid_until >= ?))'
        + ' AND ((people_institution_city.valid_from IS NULL OR people_institution_city.valid_from <= ?)'
        + '    AND (people_institution_city.valid_until IS NULL OR people_institution_city.valid_until >= ?))'
        + ' UNION'
        + ' SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name,'
        + ' technician_positions.name_en AS position_name, technician_offices.name_en AS lab_name, units.short_name AS unit, institution_city.city'
        + ' FROM people'
        + ' JOIN technicians ON technicians.person_id = people.id'
        + ' JOIN technician_positions ON technician_positions.id = technicians.technician_position_id'
        + ' JOIN people_institution_city ON people_institution_city.person_id = people.id'
        + ' JOIN institution_city ON institution_city.id = people_institution_city.city_id'
        + ' JOIN technician_offices ON technician_offices.id = technicians.technician_office_id'
        + ' JOIN technicians_units ON technicians_units.technician_id = technicians.id'
        + ' JOIN units ON units.id = technicians_units.unit_id'
        + ' WHERE people.status = 1'
        + ' AND people.name LIKE ?'
        + ' AND (units.name LIKE ? OR units.short_name LIKE ?)'
        + ' AND technician_positions.name_en LIKE ?'
        + ' AND institution_city.city LIKE ?'
        + ' AND ((technicians.valid_from IS NULL AND technicians.valid_until IS NULL)'
        + '    OR (technicians.valid_from <= ? AND technicians.valid_until IS NULL)'
        + '    OR (technicians.valid_from IS NULL AND technicians.valid_until >= ?)'
        + '    OR (technicians.valid_from <= ? AND technicians.valid_until >= ?))'
        + ' AND ((people_institution_city.valid_from IS NULL OR people_institution_city.valid_from <= ?)'
        + '    AND (people_institution_city.valid_until IS NULL OR people_institution_city.valid_until >= ?))'
        + ' UNION'
        + ' SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name,'
        + ' science_manager_positions.name_en AS position_name, science_manager_offices.name_en AS lab_name, units.short_name AS unit, institution_city.city'
        + ' FROM people'
        + ' JOIN science_managers ON science_managers.person_id = people.id'
        + ' JOIN science_manager_positions ON science_manager_positions.id = science_managers.science_manager_position_id'
        + ' JOIN people_institution_city ON people_institution_city.person_id = people.id'
        + ' JOIN institution_city ON institution_city.id = people_institution_city.city_id'
        + ' JOIN science_manager_offices ON science_manager_offices.id = science_managers.science_manager_office_id'
        + ' JOIN science_managers_units ON science_managers_units.science_manager_id = science_managers.id'
        + ' JOIN units ON units.id = science_managers_units.unit_id'
        + ' WHERE people.status = 1'
        + ' AND people.name LIKE ?'
        + ' AND (units.name LIKE ? OR units.short_name LIKE ?)'
        + ' AND science_manager_positions.name_en LIKE ?'
        + ' AND institution_city.city LIKE ?'
        + ' AND ((science_managers.valid_from IS NULL AND science_managers.valid_until IS NULL)'
        + '    OR (science_managers.valid_from <= ? AND science_managers.valid_until IS NULL)'
        + '    OR (science_managers.valid_from IS NULL AND science_managers.valid_until >= ?)'
        + '    OR (science_managers.valid_from <= ? AND science_managers.valid_until >= ?))'
        + ' AND ((people_institution_city.valid_from IS NULL OR people_institution_city.valid_from <= ?)'
        + '    AND (people_institution_city.valid_until IS NULL OR people_institution_city.valid_until >= ?))'
        + ' UNION'
        + ' SELECT DISTINCT people.id AS person_id, people.user_id, people.name, people.colloquial_name,'
        + ' administrative_positions.name_en AS position_name, administrative_offices.name_en AS lab_name, units.short_name AS unit, institution_city.city'
        + ' FROM people'
        + ' JOIN people_administrative_offices ON people_administrative_offices.person_id = people.id'
        + ' JOIN administrative_positions ON administrative_positions.id = people_administrative_offices.administrative_position_id'
        + ' JOIN people_institution_city ON people_institution_city.person_id = people.id'
        + ' JOIN institution_city ON institution_city.id = people_institution_city.city_id'
        + ' JOIN administrative_offices ON administrative_offices.id = people_administrative_offices.administrative_office_id'
        + ' JOIN people_administrative_units ON people_administrative_units.administrative_id = people_administrative_offices.id'
        + ' JOIN units ON units.id = people_administrative_units.unit_id'
        + ' WHERE people.status = 1'
        + ' AND people.name LIKE ?'
        + ' AND (units.name LIKE ? OR units.short_name LIKE ?)'
        + ' AND administrative_positions.name_en LIKE ?'
        + ' AND institution_city.city LIKE ?'
        + ' AND ((people_administrative_offices.valid_from IS NULL AND people_administrative_offices.valid_until IS NULL)'
        + '    OR (people_administrative_offices.valid_from <= ? AND people_administrative_offices.valid_until IS NULL)'
        + '    OR (people_administrative_offices.valid_from IS NULL AND people_administrative_offices.valid_until >= ?)'
        + '    OR (people_administrative_offices.valid_from <= ? AND people_administrative_offices.valid_until >= ?))'
        + ' AND ((people_institution_city.valid_from IS NULL OR people_institution_city.valid_from <= ?)'
        + '    AND (people_institution_city.valid_until IS NULL OR people_institution_city.valid_until >= ?))'
        + ' ORDER BY `name` ' + sortOrder;
        places.push(
            q, city,
            q, unit, unit, position, city, today, today, today, today, today, today,
            q, unit, unit, position, city, today, today, today, today, today, today,
            q, unit, unit, position, city, today, today, today, today, today, today,
            q, unit, unit, position, city, today, today, today, today, today, today
        );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "count": resQuery.length,
                    "result": resQuery
                }
            });
            return;
        },
        options);
};
module.exports.getPeopleList = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionGetPeopleList)
};
var actionGetPeoplePoll = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT people.id, people.name'
        + ' FROM people_polls'
        + ' JOIN people ON people.id = people_polls.person_id'
        + ' WHERE people_polls.poll_id = ?'
        + ' ORDER BY `name` ASC';
        + ';';
    places.push(pollID);
    return sql.makeSQLOperation(req, res, querySQL, places);
}
module.exports.getPeoplePoll = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionGetPeoplePoll)
};
var actionAddUserPoll = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO people_polls'
        + ' (person_id, poll_id)'
        + ' SELECT ?,?'
        + ' WHERE NOT EXISTS ('
        + '     SELECT person_id FROM people_polls WHERE person_id = ? AND poll_id = ?'
        + ') LIMIT 1;'
        ;
    places.push(data.person_id, pollID, data.person_id, pollID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.addUserPoll = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionAddUserPoll)
};
var actionDeleteUserPoll = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'DELETE FROM people_polls WHERE person_id = ? AND poll_id = ?;';
    places.push(personID, pollID);
    return sql.makeSQLOperation(req, res, querySQL, places);
}

module.exports.deleteUserPoll = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionDeleteUserPoll)
};

var countRegistered = function (options) {
    let { req, res, next, poll } = options;
    let pollID = req.params.pollID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM people_polls WHERE poll_id = ?;';
    places.push(pollID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let totalPossibleVoters = resQuery.length;
            let whoVoted = resQuery.filter(el => el.voted === 1)
            let numberVoted = whoVoted.length
            options.poll.voterCount = {totalPossibleVoters, numberVoted}
            return actionGetResults(options);
        },
        options
    );
}
var actionGetResults = function (options) {
    let { req, res, next, poll } = options;
    let pollID = req.params.pollID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT * FROM polls_results WHERE poll_id = ?;';
    places.push(pollID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            for (let indQuestion in poll.questions) {
                // beware of the type of question
                // if line input or multiline input, just collect answers
                let nonBlankVotes = 0;
                let questionID = poll.questions[indQuestion].id;
                if (poll.questions[indQuestion].question_type_name_en === 'Multiple choice') {
                    for (let indOption in poll.questions[indQuestion].options) {
                        let optionID = poll.questions[indQuestion].options[indOption].id;
                        let votedThis = resQuery.filter(el =>
                            el.poll_question_option_id === optionID && el.poll_question_id === questionID);
                        poll.questions[indQuestion].options[indOption].votes = votedThis.length;
                        nonBlankVotes = nonBlankVotes + votedThis.length;
                    }
                } else {
                    let answers = [];
                    for (let ind in resQuery) {
                        if (resQuery[ind].poll_question_id === questionID
                            && resQuery[ind].poll_question_option_text !== null
                            && resQuery[ind].poll_question_option_text !== ''
                        ) {
                            answers.push(resQuery[ind].poll_question_option_text);
                            nonBlankVotes = nonBlankVotes + 1;
                        }
                    }
                    poll.questions[indQuestion].answers = answers;
                }
                poll.questions[indQuestion].totalNonBlank = nonBlankVotes;
                poll.questions[indQuestion].totalBlank = poll.voterCount.numberVoted - nonBlankVotes;
            }
            return responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "count": 1,
                    "result": poll,
                }
            });
        },
        options
    );
}

module.exports.getResults = function (req, res, next) {
    let options = { req, res, next };
    options.getPollResults = true;
    return checkPermissions(options, actionGetPollData)
};

module.exports.peopleGetResults = function (options) {
    return actionGetPollData(options);
}