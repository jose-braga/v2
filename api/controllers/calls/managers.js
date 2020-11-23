const sql = require('../utilities/sql')
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

var actionGetCalls = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT call_applications.*, call_managers.person_id'
                        + ' FROM call_managers'
                        + ' JOIN call_applications ON call_applications.id = call_managers.call_id'
                        + ' WHERE call_managers.person_id = ?;';
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.getCalls = function (req, res, next) {
    permissions.checkPermissionsCallManagers(
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
                return getApplicationCriteria(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 0,
                        "result": {
                            call: {},
                            applications: [],
                        }
                    }
                });
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
            return actionGetCallApplications(options);
        },
        options);
};
var actionGetCallApplications = function (options) {
    let { req, res, next, call } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT applications.*,'
                        + ' applicants.name AS applicant_name'
                        + ' FROM applications'
                        + ' JOIN applicants ON applicants.application_id = applications.id'
                        + ' WHERE applications.call_id = ?'
                        + ' ORDER BY applicants.name;';
    places.push(call.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications = resQuery;
            options.i = 0;
            if (resQuery.length > 0) {
                return getApplicantData(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": options.applications.length,
                        "result": {
                            call: call,
                            applications: options.applications,
                        }
                    }
                });
            }
        },
        options);
};
var getApplicantData = function (options) {
    let { req, res, next, applications, i } = options;
    let application = applications[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM applicants'
                        + ' WHERE application_id = ?;';
    places.push(application.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].applicant = resQuery[0];
            return getApplicationMotivationLetter(options);
        },
        options);
};
var getApplicationMotivationLetter = function (options) {
    let { req, res, next, applications, i } = options;
    let application = applications[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_motivation_letter'
                        + ' WHERE application_id = ?;';
    places.push(application.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].motivationLetter = resQuery[0];
            return getApplicationAcademicDegrees(options);
        },
        options);
};
var getApplicationAcademicDegrees = function (options) {
    let { req, res, next, applications, i } = options;
    let application = applications[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT application_academic_degrees.*,'
                        + ' application_academic_degree_types.name AS degree_name'
                        + ' FROM application_academic_degrees'
                        + ' JOIN application_academic_degree_types ON application_academic_degree_types.id = application_academic_degrees.academic_degree_id'
                        + ' WHERE application_academic_degrees.application_id = ?;';
    places.push(application.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].academicDegrees = resQuery;
            return getApplicationProjects(options);
        },
        options);
};
var getApplicationProjects = function (options) {
    let { req, res, next, applications, i } = options;
    let application = applications[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_projects'
                        + ' WHERE application_id = ?;';
    places.push(application.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].projects = resQuery;
            return getApplicationMobility(options);
        },
        options);
};
var getApplicationMobility = function (options) {
    let { req, res, next, applications, i } = options;
    let application = applications[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_mobility'
                        + ' WHERE application_id = ?;';
    places.push(application.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].mobility = resQuery;
            return getApplicationPapers(options);
        },
        options);
};
var getApplicationPapers = function (options) {
    let { req, res, next, applications, i } = options;
    let application = applications[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_papers'
                        + ' WHERE application_id = ?;';
    places.push(application.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].papers = resQuery;
            return getApplicationCommunications(options);
        },
        options);

};
var getApplicationCommunications = function (options) {
    let { req, res, next, applications, i } = options;
    let application = applications[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_communications'
                        + ' WHERE application_id = ?;';
    places.push(application.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].communications = resQuery;
            return getApplicationPosters(options);
        },
        options);

};
var getApplicationPosters = function (options) {
    let { req, res, next, applications, i } = options;
    let application = applications[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_posters'
                        + ' WHERE application_id = ?;';
    places.push(application.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].posters = resQuery;
            return getApplicationPatents(options);
        },
        options);

};
var getApplicationPatents = function (options) {
    let { req, res, next, applications, i } = options;
    let application = applications[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_patents'
                        + ' WHERE application_id = ?;';
    places.push(application.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].patents = resQuery;
            return getApplicationPrizes(options);
        },
        options);

};
var getApplicationPrizes = function (options) {
    let { req, res, next, applications, i } = options;
    let application = applications[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_prizes'
                        + ' WHERE application_id = ?;';
    places.push(application.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].prizes = resQuery;
            return getApplicationProfessionalExperience(options);
        },
        options);
};
var getApplicationProfessionalExperience = function (options) {
    let { req, res, next, applications, i } = options;
    let application = applications[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_professional_experience'
                        + ' WHERE application_id = ?;';
    places.push(application.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].professionalExperience = resQuery;
            return getApplicationDocuments(options);
        },
        options);
};
var getApplicationDocuments = function (options) {
    let { req, res, next, applications, i } = options;
    let application = applications[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT application_documents.*,'
                        + ' application_document_types.name AS document_type_name'
                        + ' FROM application_documents'
                        + ' JOIN application_document_types ON application_document_types.id = application_documents.document_type_id'
                        + ' WHERE application_documents.application_id = ?;';
    places.push(application.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].documents = resQuery;
            return getApplicationRecommenders(options);
        },
        options);
};
var getApplicationRecommenders = function (options) {
    let { req, res, next, applications, i } = options;
    let application = applications[i];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT id, name, email, institution, role, submitted'
                        + ' FROM application_recommenders'
                        + ' WHERE application_id = ?;';
    places.push(application.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].recommenders = resQuery;
            if (resQuery.length > 0) {
                options.j = 0;
                return getApplicationReferenceLetters(options);
            } else {
                return getApplicationAutomaticScores(options);
            }
        },
        options);
};
var getApplicationReferenceLetters = function (options) {
    let { req, res, next, applications, i, j } = options;
    let application = applications[i];
    let recommender = application.recommenders[j]
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_letter_recommendation'
                        + ' WHERE application_id = ? AND recommender_id = ?;';
    places.push(application.id, recommender.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.applications[i].recommenders[j].referenceLetter = resQuery[0];
            } else {
                options.applications[i].recommenders[j].referenceLetter = { text: null };
            }
            return getApplicationRecommenderAnswers(options);
        },
        options);
};
var getApplicationRecommenderAnswers = function (options) {
    let { req, res, next, applications, i, j } = options;
    let application = applications[i];
    let recommender = application.recommenders[j]
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT application_recommender_answers.*,'
                        + ' application_recommender_questions.question, application_recommender_questions.answer_type'
                        + ' FROM application_recommender_answers'
                        + ' JOIN application_recommender_questions ON application_recommender_questions.id = application_recommender_answers.question_id'
                        + ' WHERE application_recommender_answers.application_id = ? AND application_recommender_answers.recommender_id = ?;';
    places.push(application.id, recommender.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].recommenders[j].answers = resQuery;
            if (j + 1 < options.applications[i].recommenders.length) {
                options.j = j + 1;
                return getApplicationReferenceLetters(options);
            } else {
                return getApplicationAutomaticScores(options);
            }
        },
        options);
};
var getApplicationAutomaticScores = function (options) {
    let { req, res, next, call, applications, i } = options;
    let application = applications[i];
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
    places.push(application.id, call.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].automaticScores = resQuery;
            return getCallReviewers(options);
        },
        options);
};
var getCallReviewers = function (options) {
    let { req, res, next, call, i} = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT application_call_reviewers.*,'
                        + ' application_reviewers.name'
                        + ' FROM application_call_reviewers'
                        + ' JOIN application_reviewers ON application_reviewers.id = application_call_reviewers.reviewer_id'
                        + ' WHERE application_call_reviewers.call_id = ?;';
    places.push(call.id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].reviewers = resQuery;
            if (resQuery.length > 0) {
                options.j = 0;
                return getApplicationReviewerReviewed(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 1,
                        "result": {
                            call: options.call,
                            applications: options.applications,
                            applicationCriteria: options.applicationCriteria,
                        }
                    }
                });
            }
        },
        options);
};
var getApplicationReviewerReviewed = function (options) {
    let { req, res, next, call, applications, i, j} = options;
    let application = applications[i];
    let reviewer = application.reviewers[j];
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT reviewed, ignore_score'
                        + ' FROM application_reviewer_applications'
                        + ' WHERE application_id = ? AND reviewer_id = ?;';

    places.push(application.id, reviewer.reviewer_id);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.applications[i].reviewers[j].reviewed = resQuery[0].reviewed;
                options.applications[i].reviewers[j].ignore_score = resQuery[0].ignore_score;
            } else if (resQuery.length === 0) {
                options.applications[i].reviewers[j].reviewed = 0;
                if (options.applications[i].reviewers[j].is_surrogate === null
                    || options.applications[i].reviewers[j].is_surrogate === 0) {
                    options.applications[i].reviewers[j].ignore_score = 0;
                } else if (options.applications[i].reviewers[j].is_surrogate === 1) {
                    options.applications[i].reviewers[j].ignore_score = 1;
                }

            } else {
                //should not happen
            }
            return getApplicationReviewerScores(options);
        },
        options);
};
var getApplicationReviewerScores = function (options) {
    let { req, res, next, call, applications, i, j} = options;
    let application = applications[i];
    let reviewer = application.reviewers[j];
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
    places.push(reviewer.reviewer_id, application.id, call.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applications[i].reviewers[j].reviewerScores = resQuery;
            if (j + 1 < options.applications[i].reviewers.length) {
                options.j = j + 1;
                return getApplicationReviewerReviewed(options)
            } else if (i + 1 < options.applications.length) {
                options.j = 0;
                options.i = i + 1;
                return getApplicantData(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 1,
                        "result": {
                            call: options.call,
                            applications: options.applications,
                            applicationCriteria: options.applicationCriteria,
                        }
                    }
                });
            }
        },
        options);

};

module.exports.getCallApplications = function (req, res, next) {
    permissions.checkPermissionsCallManagers(
        (options) => { actionGetCallInfo(options) },
        { req, res, next }
    );
}
var actionCheckReviewerExistence = function (options) {
    let { req, res, next } = options;
    let applicationID = req.params.applicationID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_reviewer_applications'
                        + ' WHERE application_id = ?;';
    places.push(applicationID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.reviewers_status = resQuery;
            if (req.body.data.application.reviewers.length > 0) {
                options.i = 0;
                return updateApplicationReviewers(options)
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: "No operation performed."
                });
            }
        },
        options);
};
var updateApplicationReviewers = function (options) {
    let { req, res, next, reviewers_status, i } = options;
    let applicationID = req.params.applicationID;
    let reviewer = req.body.data.application.reviewers[i];
    let found = false;
    for (let ind in reviewers_status) {
        if(reviewers_status[ind].reviewer_id === reviewer.reviewer_id) {
            found = true;
            break;
        }
    }
    let ignore_score = 0;
    if (reviewer.use_score !== null) {
        if (reviewer.use_score === 0 || reviewer.use_score === false) {
            ignore_score = 1
        } else if (reviewer.use_score === 1 || reviewer.use_score === true) {
            ignore_score = 0;
        }
    }
    var querySQL = '';
    var places = [];
    if (found) {
        querySQL = querySQL + 'UPDATE '
                            + ' application_reviewer_applications'
                            + ' SET ignore_score = ?'
                            + ' WHERE application_id = ? AND reviewer_id = ?;';
        places.push(ignore_score, applicationID, reviewer.reviewer_id);
    } else {
        querySQL = querySQL + 'INSERT INTO application_reviewer_applications'
                            + ' (application_id, reviewer_id, ignore_score)'
                            + ' VALUES (?, ?, ?);';
        places.push(applicationID, reviewer.reviewer_id, ignore_score);
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < req.body.data.application.reviewers.length) {
                options.i = i + 1;
                return updateApplicationReviewers(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 0,
                        "message": "All done!"
                    }
                });
            }
        },
        options);
};
module.exports.updateApplicationReviewers = function (req, res, next) {
    permissions.checkPermissionsCallManagers(
        (options) => { actionCheckReviewerExistence(options) },
        { req, res, next }
    );
}