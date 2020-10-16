const sql = require('../utilities/sql')
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const time = require('../utilities/time');

function checkManualScoreValid (val) {
    if (val === null || val === undefined || val === '') return false;
    if (Number.isNaN(parseFloat(val))) {
        return false;
    }
    if (parseFloat(val) >= 0 && parseFloat(val) <= 5) {
        return true;
    }
    return false;
}

var actionGetCalls = function (options) {
    let { req, res, next } = options;
    let reviewerID = req.params.reviewerID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT call_applications.*, application_call_reviewers.reviewer_id'
                        + ' FROM application_call_reviewers'
                        + ' JOIN call_applications ON call_applications.id = application_call_reviewers.call_id'
                        + ' WHERE application_call_reviewers.reviewer_id = ?;';
    places.push(reviewerID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getCalls = function (req, res, next) {
    permissions.checkPermissionsReviewers(
        (options) => { actionGetCalls(options) },
        { req, res, next }
    );
}

var actionGetCallInfo = function (options) {
    let { req, res, next } = options;
    let callSegment = req.params.callSegment;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM call_applications'
                        + ' WHERE call_url_segment = ?;';
    places.push(callSegment)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.call = resQuery[0];
                if (options.applicationDetails) {
                    return actionGetApplicationInfo(options);
                }
                return actionGetCallApplications(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 0,
                        "result": []
                    }
                });
            }
        },
        options);
};
var actionGetCallApplications = function (options) {
    let { req, res, next, call } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT applications.*,'
                        + ' applicants.name AS applicant_name, application_reviewer_applications.reviewed'
                        + ' FROM applications'
                        + ' JOIN applicants ON applicants.application_id = applications.id'
                        + ' LEFT JOIN application_reviewer_applications ON application_reviewer_applications.application_id = applications.id'
                        + ' WHERE applications.call_id = ?'
                        + ' ORDER BY applicants.name;';
    places.push(call.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications = resQuery;
            return responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "count": options.applications.length,
                    "result": {
                        call: options.call,
                        applications: options.applications,
                    }
                }
            });
        },
        options);
};
module.exports.getCallApplications = function (req, res, next) {
    permissions.checkPermissionsReviewers(
        (options) => { actionGetCallInfo(options) },
        { req, res, next }
    );
}

var actionGetApplicationInfo = function (options) {
    let { req, res, next } = options;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT applications.*,'
                        + ' applicants.name AS applicant_name, applicants.erasmus_experience,'
                        + ' application_reviewer_applications.reviewed'
                        + ' FROM applications'
                        + ' JOIN applicants ON applicants.application_id = applications.id'
                        + ' LEFT JOIN application_reviewer_applications ON application_reviewer_applications.application_id = applications.id'
                        + ' WHERE applications.id = ?;';
    places.push(applicationID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.application = resQuery[0];
                return getApplicationMotivationLetter(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 0,
                        "result": []
                    }
                });
            }
        },
        options);
};
var getApplicationMotivationLetter = function (options) {
    let { req, res, next } = options;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_motivation_letter'
                        + ' WHERE application_id = ?;';
    places.push(applicationID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.application.motivationLetter = resQuery[0];
            return getApplicationAcademicDegrees(options);
        },
        options);
};
var getApplicationAcademicDegrees = function (options) {
    let { req, res, next } = options;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT application_academic_degrees.*,'
                        + ' application_academic_degree_types.name AS degree_name'
                        + ' FROM application_academic_degrees'
                        + ' JOIN application_academic_degree_types ON application_academic_degree_types.id = application_academic_degrees.academic_degree_id'
                        + ' WHERE application_academic_degrees.application_id = ?;';
    places.push(applicationID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.application.academicDegrees = resQuery;
            return getApplicationProjects(options);
        },
        options);
};
var getApplicationProjects = function (options) {
    let { req, res, next } = options;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_projects'
                        + ' WHERE application_id = ?;';
    places.push(applicationID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.application.projects = resQuery;
            return getApplicationMobility(options);
        },
        options);
};
var getApplicationMobility = function (options) {
    let { req, res, next } = options;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_mobility'
                        + ' WHERE application_id = ?;';
    places.push(applicationID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.application.mobility = resQuery;
            return getApplicationPapers(options);
        },
        options);
};
var getApplicationPapers = function (options) {
    let { req, res, next } = options;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_papers'
                        + ' WHERE application_id = ?;';
    places.push(applicationID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.application.papers = resQuery;
            return getApplicationCommunications(options);
        },
        options);

};
var getApplicationCommunications = function (options) {
    let { req, res, next } = options;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_communications'
                        + ' WHERE application_id = ?;';
    places.push(applicationID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.application.communications = resQuery;
            return getApplicationPosters(options);
        },
        options);

};
var getApplicationPosters = function (options) {
    let { req, res, next } = options;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_posters'
                        + ' WHERE application_id = ?;';
    places.push(applicationID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.application.posters = resQuery;
            return getApplicationPatents(options);
        },
        options);

};
var getApplicationPatents = function (options) {
    let { req, res, next } = options;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_patents'
                        + ' WHERE application_id = ?;';
    places.push(applicationID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.application.patents = resQuery;
            return getApplicationPrizes(options);
        },
        options);

};
var getApplicationPrizes = function (options) {
    let { req, res, next } = options;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_prizes'
                        + ' WHERE application_id = ?;';
    places.push(applicationID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.application.prizes = resQuery;
            return getApplicationProfessionalExperience(options);
        },
        options);
};
var getApplicationProfessionalExperience = function (options) {
    let { req, res, next } = options;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_professional_experience'
                        + ' WHERE application_id = ?;';
    places.push(applicationID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.application.professionalExperience = resQuery;
            return getApplicationDocuments(options);
        },
        options);
};
var getApplicationDocuments = function (options) {
    let { req, res, next } = options;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT application_documents.*,'
                        + ' application_document_types.name AS document_type_name'
                        + ' FROM application_documents'
                        + ' JOIN application_document_types ON application_document_types.id = application_documents.document_type_id'
                        + ' WHERE application_documents.application_id = ?;';
    places.push(applicationID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.application.documents = resQuery;
            return getApplicationRecommenders(options);
        },
        options);
};
var getApplicationRecommenders = function (options) {
    let { req, res, next } = options;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT id, name, email, institution, role, submitted'
                        + ' FROM application_recommenders'
                        + ' WHERE application_id = ?;';
    places.push(applicationID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.application.recommenders = resQuery;
            if (resQuery.length > 0) {
                options.i = 0;
                return getApplicationReferenceLetters(options);
            } else {
                return getApplicationAutomaticScores(options);
            }
        },
        options);
};
var getApplicationReferenceLetters = function (options) {
    let { req, res, next, i } = options;
    let applicationID = req.params.applicationID;
    let recommender = options.application.recommenders[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_letter_recommendation'
                        + ' WHERE application_id = ? AND recommender_id = ?;';
    places.push(applicationID, recommender.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.application.recommenders[i].referenceLetter = resQuery[0];
            } else {
                options.application.recommenders[i].referenceLetter = { text: null };
            }
            return getApplicationRecommenderAnswers(options);
        },
        options);
};
var getApplicationRecommenderAnswers = function (options) {
    let { req, res, next, i } = options;
    let applicationID = req.params.applicationID;
    let recommender = options.application.recommenders[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT application_recommender_answers.*,'
                        + ' application_recommender_questions.question, application_recommender_questions.answer_type'
                        + ' FROM application_recommender_answers'
                        + ' JOIN application_recommender_questions ON application_recommender_questions.id = application_recommender_answers.question_id'
                        + ' WHERE application_recommender_answers.application_id = ? AND application_recommender_answers.recommender_id = ?;';
    places.push(applicationID, recommender.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.application.recommenders[i].answers = resQuery;
            if (i + 1 < options.application.recommenders.length) {
                options.i = i + 1;
                return getApplicationReferenceLetters(options);
            } else {
                return getApplicationCriteria(options);
            }
        },
        options);
};
var getApplicationCriteria = function (options) {
    let { req, res, next, call } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_criteria'
                        + ' WHERE call_id = ?;';
    places.push(call.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applicationCriteria = resQuery;
            /*
            let criteria = {};
            let indTotal;
            for (let ind in resQuery) {
                resQuery[ind].children = {};
                criteria[resQuery[ind].id] = resQuery[ind];
            }
            for (const [key,val] of Object.entries(criteria)) {
                if (val.parent_criteria_id !== null) {
                    criteria[val.parent_criteria_id].children[key] = val;
                }
                if (val.name_en === 'Total') {
                    indTotal = key;
                }
            }
            options.applicationCriteria = criteria[indTotal];
            */
            return getApplicationAutomaticScores(options);
        },
        options);
};
var getApplicationAutomaticScores = function (options) {
    let { req, res, next, call } = options;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT application_automatic_scores.*,'
                        + ' application_criteria.topic_reference,'
                        + ' application_criteria.name_en AS criteria_name,'
                        + ' application_criteria.parent_criteria_id,'
                        + ' application_criteria.weight'
                        + ' FROM application_automatic_scores'
                        + ' JOIN application_criteria ON application_criteria.id = application_automatic_scores.criteria_id'
                        + ' WHERE application_automatic_scores.application_id = ? AND application_criteria.call_id = ?;';
    places.push(applicationID, call.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.application.automaticScores = resQuery;
            return getApplicationReviewerScores(options);
        },
        options);
};
var getApplicationReviewerScores = function (options) {
    let { req, res, next, call } = options;
    let applicationID = req.params.applicationID;
    let reviewerID = req.params.reviewerID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT application_reviewer_scores.*,'
                        + ' application_criteria.topic_reference,'
                        + ' application_criteria.name_en AS criteria_name,'
                        + ' application_criteria.parent_criteria_id,'
                        + ' application_criteria.weight'
                        + ' FROM application_reviewer_scores'
                        + ' JOIN application_criteria ON application_criteria.id = application_reviewer_scores.criteria_id'
                        + ' WHERE application_reviewer_scores.reviewer_id = ?'
                        + ' AND application_reviewer_scores.application_id = ?'
                        + ' AND application_criteria.call_id = ?;';
    places.push(reviewerID, applicationID, call.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.application.reviewerScores = resQuery;
            return responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "count": 1,
                    "result": {
                        call: options.call,
                        application: options.application,
                        applicationCriteria: options.applicationCriteria,
                    }
                }
            });
        },
        options);

};

module.exports.getApplicationInfo = function (req, res, next) {
    permissions.checkPermissionsReviewers(
        (options) => {
            options.applicationDetails = true;
            actionGetCallInfo(options);
        },
        { req, res, next }
    );
};

var actionDeletePreviousScores = function (options) {
    let { req, res, next } = options;
    let reviewerID = req.params.reviewerID;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'DELETE FROM application_reviewer_scores'
                        + ' WHERE application_id = ? AND reviewer_id = ?;';
    places.push(applicationID,
        reviewerID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            options.i = 0;
            return actionCreateScore(options);
        },
        options)
};
var actionCreateScore = function (options) {
    let { req, res, next, i } = options;
    let reviewerID = req.params.reviewerID;
    let applicationID = req.params.applicationID;
    let score = req.body.data.scores[i];
    if (checkManualScoreValid(score.score_manual)) {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'INSERT INTO application_reviewer_scores'
                            + ' (application_id, reviewer_id, criteria_id, score, comments)'
                            + ' VALUES (?, ?, ?, ?, ?);';
        places.push(applicationID,
            reviewerID,
            score.criteria_id,
            score.score_manual,
            score.comments);
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                if (i + 1 < req.body.data.scores.length) {
                    options.i = i + 1;
                    return actionCreateScore(options);
                } else {
                    return responses.sendJSONResponseOptions({
                        response: res,
                        status: 200,
                        message: {
                            "status": "success", "statusCode": 200,
                            "message": "Success!",
                        }
                    });
                }
            },
            options);
    } else {
        if (i + 1 < req.body.data.scores.length) {
            options.i = i + 1;
            return actionCreateScore(options);
        } else {
            return responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "message": "Success!",
                }
            });
        }
    }
};
module.exports.createScores = function (req, res, next) {
    permissions.checkPermissionsReviewers(
        (options) => {
            return actionDeletePreviousScores(options);
        },
        { req, res, next }
    );
}

var actionCreateTagReviewed = function (options) {
    let { req, res, next } = options;
    let reviewerID = req.params.reviewerID;
    let applicationID = req.params.applicationID;
    let reviewed = req.body.data.reviewed;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO application_reviewer_applications'
                        + ' (application_id, reviewer_id, reviewed)'
                        + ' VALUES (?, ?, ?);';
    places.push(applicationID, reviewerID, reviewed)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.createTagReviewed = function (req, res, next) {
    permissions.checkPermissionsReviewers(
        (options) => {
            actionCreateTagReviewed(options);
        },
        { req, res, next }
    );
}
var actionUpdateTagReviewed = function (options) {
    let { req, res, next } = options;
    let reviewerID = req.params.reviewerID;
    let applicationID = req.params.applicationID;
    let reviewed = req.body.data.reviewed;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE application_reviewer_applications'
                        + ' SET reviewed = ?'
                        + ' WHERE application_id = ? AND reviewer_id = ?;';
    places.push(reviewed, applicationID, reviewerID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateTagReviewed = function (req, res, next) {
    permissions.checkPermissionsReviewers(
        (options) => {
            actionUpdateTagReviewed(options);
        },
        { req, res, next }
    );
}