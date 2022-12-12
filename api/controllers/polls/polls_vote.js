const sql = require('../utilities/sql')
const responses = require('../utilities/responses');

var checkPermissions = function (options, callback)  {
    let { req, res, next, action } = options;
    let personID = req.params.personID;
    if (action === 'vote') {
        let data = req.body.data.poll;
        personID = data.personID;
    }
    let pollID = req.params.pollID;
    var querySQL = '';
    var places = [];
    if (pollID === undefined) {
        return callback(options);
    } else {
        querySQL = querySQL
            + 'SELECT *'
            + ' FROM people_polls'
            + ' WHERE person_id = ? AND poll_id = ?;';
        places.push(personID, pollID)
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
    }
};

var actionGetPollsList = function (options) {
    let { req, res, next } = options;
    //let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM polls'
                        + ' WHERE visible = 1;'
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
            return responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "count": 1,
                    "result": options.poll,
                }
            });
        },
        options
    );
};
module.exports.getPollData = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionGetPollData)
};

var checkVoteValid = function (options) {
    let { req, res, next, i } = options;
    let pollID = req.params.pollID;
    let data = req.body.data.poll;
    let personID = data.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'SELECT polls.id, polls.valid_from, polls.valid_until, people_polls.person_id, people_polls.voted, NOW() AS `current_time`'
        + ' FROM polls'
        + ' JOIN people_polls ON people_polls.poll_id = polls.id'
        + ' WHERE polls.id = ? AND people_polls.person_id = ?;';
    places.push(pollID, personID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 0) {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 403,
                    message: {
                        "status": "Not authorized",
                        "statusCode": 403,
                        "message": "You are not authorized to vote in this poll.",
                    }
                });
            } else {
                let data = resQuery[0];
                if ((data.valid_from === null || data.valid_from <= data.current_time)
                    && (data.valid_until === null || data.valid_until >= data.current_time)
                    && data.voted === 0
                ) {
                    return registerUserVote(options);
                } else {
                    return responses.sendJSONResponseOptions({
                        response: res,
                        status: 403,
                        message: {
                            "status": "Not authorized",
                            "statusCode": 403,
                            "message": "Either you have already voted, the poll is closed or is not open yet.",
                        }
                    });
                }
            }
        },
        options);
};
var registerUserVote = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'INSERT INTO polls_votes'
        + ' (poll_id, submitted)'
        + ' VALUES (?, NOW());';
    places.push(pollID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.pollVoteID = resQuery.insertId;
            return markPersonVoted(options)
        },
        options);
};
var markPersonVoted = function (options) {
    let { req, res, next } = options;
    let pollID = req.params.pollID;
    let data = req.body.data.poll;
    let personID = data.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
        + 'UPDATE people_polls'
        + ' SET voted = 1'
        + ' WHERE poll_id = ? AND person_id = ?;';
    places.push(pollID, personID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.i = 0;
            return writeUserChoices(options)
        },
        options);

};
var writeUserChoices = function (options) {
    let { req, res, next, i, pollVoteID } = options;
    let pollID = req.params.pollID;
    var querySQL = '';
    var places = [];
    let data = req.body.data.poll;
    if (data.questions !== undefined && data.questions !== null
            && data.questions.length > 0) {
        let question = data.questions[i];
        let answer = question.answer;
        if (answer !== null) {
            if (typeof answer === 'string') {
                querySQL = querySQL
                    + 'INSERT INTO polls_results'
                    + ' (poll_id, poll_question_id, poll_question_option_text, poll_vote_id)'
                    + ' VALUES (?, ?, ?, ?);';
                places.push(question.poll_id, question.id, answer, pollVoteID);
            } else {
                querySQL = querySQL
                    + 'INSERT INTO polls_results'
                    + ' (poll_id, poll_question_id, poll_question_option_id, poll_question_option_text, poll_vote_id)'
                    + ' VALUES (?, ?, ?, ?, ?);';
                places.push(question.poll_id, question.id, answer.id, answer.option_text, pollVoteID);
            }
            return sql.getSQLOperationResult(req, res, querySQL, places,
                (resQuery, options) => {
                    if (i + 1 < data.questions.length) {
                        options.i = i + 1;
                        return writeUserChoices(options);
                    } else {
                        return responses.sendJSONResponseOptions({
                            response: res,
                            status: 200,
                            message: {
                                "status": "success",
                                "statusCode": 200,
                                "message": "All done!",
                            }
                        });
                    }
                },
                options);
        } else {
            if (i + 1 < data.questions.length) {
                options.i = i + 1;
                return writeUserChoices(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        "message": "All done!",
                    }
                });
            }
        }
    } else {
        return responses.sendJSONResponseOptions({
            response: res,
            status: 403,
            message: {
                "status": "success",
                "statusCode": 403,
                "message": "Data submitted did not contain any answers.",
            }
        });
    }
};
module.exports.writeUserVote = function (req, res, next) {
    let options = { req, res, next };
    options.action = 'vote';
    return checkPermissions(options, checkVoteValid)
};
