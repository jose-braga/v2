const sql = require('../utilities/sql')
const responses = require('../utilities/responses');

var checkPermissions = function (options, callback)  {
    let { req, res, next } = options;
    let personID = req.params.personID;
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
                        + ' WHERE polls_questions.poll_id = ?';
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
                        + ' WHERE poll_question_id = ?';
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
                        + ' WHERE polls_texts.poll_id = ?';
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
module.exports.writeUserVote = function (req, res, next) {
    let options = { req, res, next };
    return checkPermissions(options, actionWriteUserVote)
};
