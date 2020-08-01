const sql = require('../utilities/sql')
const responses = require('../utilities/responses');
const jwtUtil = require('../../config/jwt_utilities')
const time = require('../utilities/time');
const nodemailer = require('../../config/emailer');
let transporter = nodemailer.transporter;
const fs = require('fs-extra');
var path = require('path');
var multer = require('multer');

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, callback) {
        let addDocID = req.docID;
        let applicationID = req.body.application_id;
        let docTypeID = req.body.doc_type_id;
        var tempDirectory;
        tempDirectory = 'applications/' + applicationID
                    + '/doc-type/' + docTypeID
                    + '/' + addDocID;
        fs.ensureDir(tempDirectory)
            .then(() => {
                callback(null, tempDirectory);
            })
            .catch((err) => {
                console.log(err);
                callback(null, tempDirectory);
            });
    },
    filename: function (req, file, callback) {
        var datetimestamp = time.momentToDate(time.moment(), undefined, 'YYYYMMDD_HHmmss');
        var fileInfo = path.parse(req.body.file_name);
        callback(null, fileInfo.name + '-' + datetimestamp + fileInfo.ext);
    }
});

const scoreSum = (obj, sum) => {
    if (sum === undefined) sum = 0;
    const myKeys = Object.keys(obj)
    if (myKeys.includes('children')) {
        const myChildren = Object.values(obj.children);
        myChildren.forEach( (val) => {
            if (val.score_auto && Object.keys(val.children).length === 0 ) {
                sum = sum + val.score_auto * val.weight;
            } else if (Object.keys(val.children).length > 0) {
                sum = sum + scoreSum(val) * val.weight;
            }
        })
    }
    return sum;
};
var make_password = function(n, a) {
    let index = (Math.random() * (a.length - 1)).toFixed(0);
    return n > 0 ? a[index] + make_password(n - 1, a) : '';
};


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
                return actionGetCallTexts(options);
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
var actionGetCallTexts = function (options) {
    let { req, res, next, call } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT call_text_paragraphs.paragraph_type_id, call_text_paragraphs.text,'
                        + ' call_text_paragraphs.order_appearance,'
                        + ' call_paragraph_types.name AS paragraph_type_name'
                        + ' FROM call_text_paragraphs'
                        + ' LEFT JOIN call_paragraph_types ON call_paragraph_types.id = call_text_paragraphs.paragraph_type_id'
                        + ' WHERE call_text_paragraphs.call_id = ?'
                        + ' ORDER BY order_appearance;';
    places.push(call.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            call.texts = resQuery;
            return responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "count": 1,
                    "result": call
                }
            });
        },
        options);

};
module.exports.getCallInfo = function (req, res, next) {
    let options = {
        req,
        res,
        next,
    }
    return actionGetCallInfo(options);
}


var actionGetCallID = function (options) {
    let { req, res, next } = options;
    let callSegment = req.params.callSegment;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM call_applications'
                        + ' WHERE call_url_segment = ?'
                        + ' AND ('
                        +      ' (valid_from IS NULL AND valid_until IS NULL)'
                        +   ' OR (valid_from <= NOW() AND valid_until IS NULL)'
                        +   ' OR (valid_from IS NULL AND valid_until >= NOW())'
                        +   ' OR (valid_from <= NOW() AND valid_until >= NOW())'
                        + ')'
                        ;
    places.push(callSegment);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.call = resQuery[0];
                return actionCreateApplication(options);
            } else {
                return responses.sendJSONResponseOptions({
                    response: res,
                    status: 403,
                    message: {
                        "status": "error", "statusCode": 403,
                        "message": "The action is forbidden (might indicate that call has already closed)"
                    }
                });
            }
        },
        options);
};
var actionCreateApplication = function (options) {
    let { req, res, next, call } = options;
    var querySQL = '';
    var places = [];
    let now = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
    querySQL = querySQL + 'INSERT INTO applications'
                        + ' (call_id, status_id, submitted)'
                        + ' VALUES (?, ?, ?);';
    // the initial status is 1 until the end of saving of application data do DB
    // TODO: in the end add the generated reference also!!!!!!
    places.push( call.id, 1, now)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.applicationID = resQuery.insertId;
            return actionCreateApplicant(options);
        },
        options);
};
var actionCreateApplicant = function (options) {
    let { req, res, next, applicationID } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    if (data.birth_date === '') {
        data.birth_date = null;
    }
    if (data.identification_valid_until === '') {
        data.identification_valid_until = null;
    }
    // TODO: create url_access for applicant in the end if is successfull
    querySQL = querySQL + 'INSERT INTO applicants'
                        + ' (application_id, name, document_type_id, document_number, document_valid_until,'
                        + ' gender, email, birth_date, address, postal_code, city, id_country, phone)'
                        + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    places.push( applicationID,
        data.name,
        data.identification_type_id,
        data.identification_number,
        data.identification_valid_until,
        data.gender,
        data.email,
        data.birth_date,
        data.address,
        data.postal_code,
        data.city,
        data.id_country,
        data.phone
    )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return createMotivationLetter(options);
        },
        options);
};
// first save data in DB then compute scores
var createMotivationLetter = function (options) {
    let { req, res, next, applicationID } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO application_motivation_letter'
                        + ' (application_id, motivation_letter)'
                        + ' VALUES (?, ?);';
    places.push( applicationID,
        data.motivation
    )
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.i = 0;
            return createAcademicDegrees(options);
        },
        options);

};
var createAcademicDegrees = function (options) {
    let { req, res, next, applicationID, i } = options;
    let data = req.body.data;
    if (data.academicDegrees.length > 0) {
        var querySQL = '';
        var places = [];
        let degree = data.academicDegrees[i];
        if (degree.date_end === '') {
            degree.date_end = null;
        }
        querySQL = querySQL + 'INSERT INTO application_academic_degrees'
                            + ' (application_id, academic_degree_id, date_end, grade,'
                            + ' maximum_grade, institution)'
                            + ' VALUES (?, ?, ?, ?, ?, ?);';
        places.push( applicationID,
            degree.academic_degree_id,
            degree.date_end,
            degree.grade,
            degree.maximum_grade,
            degree.institution,
        )
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (i + 1 < data.academicDegrees.length) {
                    options.i = i + 1;
                    return createAcademicDegrees(options);
                } else {
                    options.i = 0;
                    return createProjects(options);
                }

            },
            options);
    } else {
        options.i = 0;
        return createProjects(options);
    }
};
var createProjects = function (options) {
    let { req, res, next, applicationID, i } = options;
    let data = req.body.data;
    if (data.projects.length > 0) {
        var querySQL = '';
        var places = [];
        let project = data.projects[i];
        querySQL = querySQL + 'INSERT INTO application_projects'
                            + ' (application_id, reference, title, acronym,'
                            + ' principal_investigator, participation,'
                            + ' year_start, year_end, additional_data)'
                            + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);';
        places.push( applicationID,
            project.reference,
            project.title,
            project.acronym,
            project.principal_investigator,
            project.participation,
            project.year_start,
            project.year_end,
            project.additional
        )
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (i + 1 < data.projects.length) {
                    options.i = i + 1;
                    return createProjects(options);
                } else {
                    options.i = 0;
                    return createPapers(options);
                }

            },
            options);
    } else {
        options.i = 0;
        return createPapers(options);
    }
};
var createPapers = function (options) {
    let { req, res, next, applicationID, i } = options;
    let data = req.body.data;
    if (data.papers.length > 0) {
        var querySQL = '';
        var places = [];
        let paper = data.papers[i];
        querySQL = querySQL + 'INSERT INTO application_papers'
                            + ' (application_id, authors_raw, title, journal_name,'
                            + ' volume, pages, year, doi, first_author, journal_quartile)'
                            + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
        places.push( applicationID,
            paper.authors_raw,
            paper.title,
            paper.journal_name,
            paper.volume,
            paper.pages,
            paper.year,
            paper.doi,
            paper.first_author,
            paper.journal_quartile
        )
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (i + 1 < data.papers.length) {
                    options.i = i + 1;
                    return createPapers(options);
                } else {
                    options.i = 0;
                    return createCommunications(options);
                }

            },
            options);
    } else {
        options.i = 0;
        return createCommunications(options);
    }
};
var createCommunications = function (options) {
    let { req, res, next, applicationID, i } = options;
    let data = req.body.data;
    if (data.communications.length > 0) {
        var querySQL = '';
        var places = [];
        let communication = data.communications[i];
        if (communication.date === '') {
            communication.date = null;
        }
        let year = null;
        if (communication.date !== null) {
            year = parseInt(time.momentToDate(communication.date, undefined, 'YYYY'), 10);
        }
        querySQL = querySQL + 'INSERT INTO application_communications'
                            + ' (application_id, authors_raw, title, meeting_name,'
                            + ' date, year, first_author, international)'
                            + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?);';
        places.push( applicationID,
            communication.authors_raw,
            communication.title,
            communication.meeting_name,
            communication.date,
            year,
            communication.first_author,
            communication.international
        )
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (i + 1 < data.communications.length) {
                    options.i = i + 1;
                    return createCommunications(options);
                } else {
                    options.i = 0;
                    return createPosters(options);
                }

            },
            options);
    } else {
        options.i = 0;
        return createPosters(options);
    }
};
var createPosters = function (options) {
    let { req, res, next, applicationID, i } = options;
    let data = req.body.data;
    if (data.posters.length > 0) {
        var querySQL = '';
        var places = [];
        let poster = data.posters[i];
        if (poster.date === '') {
            poster.date = null;
        }
        let year = null;
        if (poster.date !== null) {
            year = parseInt(time.momentToDate(poster.date, undefined, 'YYYY'), 10);
        }
        querySQL = querySQL + 'INSERT INTO application_posters'
                            + ' (application_id, authors_raw, title, meeting_name,'
                            + ' date, year, first_author, international)'
                            + ' VALUES (?, ?, ?, ?, ?, ?, ?, ?);';
        places.push( applicationID,
            poster.authors_raw,
            poster.title,
            poster.meeting_name,
            poster.date,
            year,
            poster.first_author,
            poster.international
        )
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (i + 1 < data.posters.length) {
                    options.i = i + 1;
                    return createPosters(options);
                } else {
                    options.i = 0;
                    return createPrizes(options);
                }

            },
            options);
    } else {
        options.i = 0;
        return createPrizes(options);
    }
};
var createPrizes = function (options) {
    let { req, res, next, applicationID, i } = options;
    let data = req.body.data;
    if (data.prizes.length > 0) {
        var querySQL = '';
        var places = [];
        let prize = data.prizes[i];
        querySQL = querySQL + 'INSERT INTO application_prizes'
                            + ' (application_id, prize_name, year, additional_data)'
                            + ' VALUES (?, ?, ?, ?);';
        places.push( applicationID,
            prize.prize_name,
            prize.year,
            prize.additional
        )
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (i + 1 < data.prizes.length) {
                    options.i = i + 1;
                    return createPrizes(options);
                } else {
                    options.i = 0;
                    return createPatents(options);
                }

            },
            options);
    } else {
        options.i = 0;
        return createPatents(options);
    }
};
var createPatents = function (options) {
    let { req, res, next, applicationID, i } = options;
    let data = req.body.data;
    if (data.patents.length > 0) {
        var querySQL = '';
        var places = [];
        let patent = data.patents[i];
        querySQL = querySQL + 'INSERT INTO application_patents'
                            + ' (application_id, authors_raw, title, reference, status, year)'
                            + ' VALUES (?, ?, ?, ?, ?, ?);';
        places.push( applicationID,
            patent.authors_raw,
            patent.title,
            patent.reference,
            patent.status,
            patent.year
        )
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (i + 1 < data.patents.length) {
                    options.i = i + 1;
                    return createPatents(options);
                } else {
                    options.i = 0;
                    return createProfessional(options);
                }

            },
            options);
    } else {
        options.i = 0;
        return createProfessional(options);
    }
};
var createProfessional = function (options) {
    let { req, res, next, applicationID, i } = options;
    let data = req.body.data;
    if (data.professional.length > 0) {
        var querySQL = '';
        var places = [];
        let professional = data.professional[i];
        querySQL = querySQL + 'INSERT INTO application_professional_experience'
                            + ' (application_id, company, business_areas, date_start, date_end)'
                            + ' VALUES (?, ?, ?, ?, ?);';
        places.push( applicationID,
            professional.company,
            professional.business_areas,
            professional.date_start,
            professional.date_end
        )
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                if (i + 1 < data.professional.length) {
                    options.i = i + 1;
                    return createProfessional(options);
                } else {
                    options.i = 0;
                    return createRecommenders(options);
                }
            },
            options);
    } else {
        options.i = 0;
        return createRecommenders(options);
    }
};
var createRecommenders = function (options) {
    let { req, res, next, applicationID, i } = options;
    let data = req.body.data;
    if (data.recommendations.length > 0) {
        var querySQL = '';
        var places = [];
        let recommendation = data.recommendations[i];
        let password = make_password(50,'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
        let hashedPassword = jwtUtil.hashPassword(password);
        options.req.body.data.recommendations[i].password = password;
        querySQL = querySQL + 'INSERT INTO application_recommenders'
                            + ' (application_id, name, email, institution, role, url_access)'
                            + ' VALUES (?, ?, ?, ?, ?, ?);';
        places.push( applicationID,
            recommendation.name,
            recommendation.email,
            recommendation.institution,
            recommendation.role,
            hashedPassword
        );
        return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, options) => {
                options.req.body.data.recommendations[i].recommenderID = resQuery.insertId;
                if (i + 1 < data.recommendations.length) {
                    options.i = i + 1;
                    return createRecommenders(options);
                } else {
                    options.i = 0;
                    sendRecommenderMessage(options)
                    .catch((e) => {
                        console.log(e);
                        return writeRecommenderMessageDB(options, e);
                    }); // even if the email fails it writes the message to the DB
                    //for (let ind in data.recommendations) {
                    //    console.log(ind)
                    //    options = sendRecommenderMessage(options, ind)
                    //
                    //}
                    //;
                }
            },
            options);
    } else {
        options.i = 0;
        return responses.sendJSONResponseOptions({
            response: res,
            status: 400,
            message: {
                "status": "error", "statusCode": 400,
                "message": "Contacts for recommendations should have been specified."
            }
        });
    }
};
async function sendRecommenderMessage(options) {
    let { req, res, next, call, applicationID, i } = options;
    let data = req.body.data;
    let recommendation = data.recommendations[i];

    let recipients = recommendation.email;
    let mailOptions;
    let subjectText = call.call_name + ': Letter of Recommendation for '
                    + data.name;
    let emailBody = 'Dear ' + recommendation.name + ',\n\n'
        + ' When applying for the ' + call.call_name + ' the applicant ' + data.name
        + ' gave us your contact as someone who could provide references to his/her work.\n\n'

        + ' We kindly ask you to help us analyse the skills, attributes and accomplishments'
        + ' of the applicant by answering a few quick questions and by submitting a letter of reference.'
        + ' Please click on the link below to access the area reserved for this: \n\n'
        + process.env.PATH_PREFIX + '/calls/' + call.call_url_segment
        + '/applications/' + applicationID
        + '/recommendations/' + recommendation.recommenderID + '/' + recommendation.password
        + '\n\n'
        + ' Your answers and the contents of the letter of reference will only'
        + ' be visible to the reviewers of the application.\n\n'
        + ' Best regards,\n'
        + ' The ' + call.call_name + ' Scientific Committee';
    let emailBodyHtml = '<p>' + 'Dear ' + recommendation.name + ',</p>'
        + '<p>When applying for the <b>' + call.call_name
        + '</b> the applicant <b>' + data.name
        + '</b> gave us your contact as someone who could provide references to his/her work.</p>'

        + '<p>We kindly ask you to help us analyse the skills, attributes and accomplishments'
        + ' of the applicant by answering a few quick questions and by submitting a letter of reference.'
        + ' Please click on the link below to access the area reserved for this:</p>'
        + process.env.PATH_PREFIX + '/calls/' + call.call_url_segment
        + '/applications/' + applicationID
        + '/recommendations/' + recommendation.recommenderID + '/' + recommendation.password
        + '<br>'
        + ' <p>Your answers and the contents of the letter of reference will only'
        + ' be visible to the reviewers of the application.</p>'
        + ' <p>Best regards,<br>'
        + ' The ' + call.call_name + ' Scientific Committee</p>';
    options.req.body.data.recommendations[i].subjectText = subjectText;
    options.req.body.data.recommendations[i].emailBody = emailBody;
    if (process.env.NODE_ENV === 'production') {
        mailOptions = {
            from: '"Admin" <admin@laqv-ucibio.info>', // sender address
            to: recipients, // list of receivers (comma-separated)
            subject: subjectText, // Subject line
            text: emailBody,
            html: emailBodyHtml,
        };
        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Message %s sent: %s', info.messageId, info.response);
        options.req.body.data.recommendations[i].sent = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
        return writeRecommenderMessageDB(options);
    } else {
        // just for testing purposes
        mailOptions = {
            from: '"Admin" <admin@laqv-ucibio.info>', // sender address
            to: recipients, // list of receivers (comma-separated)
            subject: 'TESTING: ' + subjectText, // Subject line
            text: emailBody,
            html: emailBodyHtml,
        };
        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Message %s sent: %s', info.messageId, info.response);
        options.req.body.data.recommendations[i].sent = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
        return writeRecommenderMessageDB(options);
    }
};
var writeRecommenderMessageDB = function (options, error) {
    let { req, res, next, call, applicationID, i } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    let recommendation = data.recommendations[i];
    if (error) {
        recommendation.sent = null;
    }
    querySQL = querySQL + 'INSERT INTO application_emails_sent'
                        + ' (`application_id`, `to`, `subject`, `body`, `sent`)'
                        + ' VALUES (?, ?, ?, ?, ?);';
    places.push( applicationID,
        recommendation.email,
        recommendation.subjectText,
        recommendation.emailBody,
        recommendation.sent
    );
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.req.body.data.recommendations[i].recommenderID = resQuery.insertId;
            if (i + 1 < data.recommendations.length) {
                options.i = i + 1;
                return sendRecommenderMessage(options)
                .catch((e) => {
                    console.log(e);
                    return writeRecommenderMessageDB(options, e);
                });
            } else {
                data.applicationID = applicationID;
                data.callID = call.id;
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        data,
                    }
                });
                return;
            }
        },
        options);
};
module.exports.createApplication = function (req, res, next) {
    let options = {
        req,
        res,
        next,
    }
    return actionGetCallID(options);
}

var actionCreateApplicantDocDBEntry = function (options) {
    let { req, res, next } = options;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO application_documents'
                        + ' (application_id, document_type_id)'
                        + ' VALUES (?, ?);';
    places.push(null, null);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            req.docID = resQuery.insertId;
            createApplicantDocwriteFile(req, res, next);
        },
        options);
};
var createApplicantDocwriteFile = function (req, res, next) {
    var upload = multer({
        storage: storage,
    }).single('file');
    upload(req, res, function (err) {
        if (err) {
            responses.sendJSONResponse(res, 500, { "status": "error", "statusCode": 500, "error": err.stack });
            return;
        }
        return createApplicantDocAddRemainingDataDB(req, res, next);
    });
};
var createApplicantDocAddRemainingDataDB = function (req, res, next) {
    let docData = req.body;
    let url = process.env.PATH_PREFIX + '/' + req.file.path;
    url = url.replace(/\s/g,'%20');
    let querySQL = '';
    let places = [];
    querySQL = 'UPDATE application_documents'
                + ' SET application_id = ?,'
                + ' document_type_id = ?,'
                + ' url = ? '
                + ' WHERE id = ?';
    places.push(
        docData.application_id,
        docData.doc_type_id,
        url,
        req.docID
    );
    return sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.uploadApplicationDocuments = function (req, res, next) {
    let options = {
        req,
        res,
        next,
    }
    return actionCreateApplicantDocDBEntry(options);
}

var actionGetApplicationCriteria = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_criteria'
                        + ' WHERE call_id = ?;';
    places.push(data.callID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.criteria = resQuery;
            return computeScoreDegrees(options);
        },
        options);
};
var computeScoreDegrees = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    // the algorithm is dependent on specific names in the criteria, change???
    let indCriteria;
    for (let ind in options.criteria) {
        if (options.criteria[ind].name_en === 'Academic Path') {
            indCriteria = ind;
            break;
        }
    }
    if (indCriteria === undefined) {
        console.log(' Error in scores computation - Degrees.',
            'Call Id:', data.callID ,
            'Application ID:', data.applicationID)
    } else {
        if (data.academicDegrees.length === 1) {
            if (data.academicDegrees[0].academic_degree_id === 1) {
                // Integrated Master
                if (Math.round(data.academicDegrees[0].grade) >= 18) {
                    options.criteria[indCriteria].score_auto = 5.0;
                } else if (Math.round(data.academicDegrees[0].grade) >= 17) {
                    options.criteria[indCriteria].score_auto = 4.5;
                } else if (Math.round(data.academicDegrees[0].grade) >= 16) {
                    options.criteria[indCriteria].score_auto = 4.0;
                } else if (Math.round(data.academicDegrees[0].grade) >= 15) {
                    options.criteria[indCriteria].score_auto = 3.5;
                } else if (Math.round(data.academicDegrees[0].grade) >= 14) {
                    options.criteria[indCriteria].score_auto = 3.0;
                } else if (Math.round(data.academicDegrees[0].grade) < 14) {
                    options.criteria[indCriteria].score_auto = 2.5;
                }
            } else if (data.academicDegrees[0].academic_degree_id === 2) {
                // Master
                if (Math.round(data.academicDegrees[0].grade) >= 17) {
                    options.criteria[indCriteria].score_auto = 3.0;
                } else if (Math.round(data.academicDegrees[0].grade) >= 16) {
                    options.criteria[indCriteria].score_auto = 2.5;
                } else if (Math.round(data.academicDegrees[0].grade) >= 15) {
                    options.criteria[indCriteria].score_auto = 2.0;
                } else if (Math.round(data.academicDegrees[0].grade) >= 14) {
                    options.criteria[indCriteria].score_auto = 1.5;
                } else if (Math.round(data.academicDegrees[0].grade) < 14) {
                    options.criteria[indCriteria].score_auto = 1.0;
                }
            } else if (data.academicDegrees[0].academic_degree_id === 3) {
                // Bachelor
                if (Math.round(data.academicDegrees[0].grade) >= 17) {
                    options.criteria[indCriteria].score_auto = 3.5;
                } else if (Math.round(data.academicDegrees[0].grade) >= 16) {
                    options.criteria[indCriteria].score_auto = 3.0;
                } else if (Math.round(data.academicDegrees[0].grade) >= 15) {
                    options.criteria[indCriteria].score_auto = 2.5;
                } else if (Math.round(data.academicDegrees[0].grade) >= 14) {
                    options.criteria[indCriteria].score_auto = 2.0;
                } else if (Math.round(data.academicDegrees[0].grade) < 14) {
                    options.criteria[indCriteria].score_auto = 1.5;
                }
            }
        } else if (data.academicDegrees.length === 2) {
            if (data.academicDegrees[0].academic_degree_id === 1
                    || data.academicDegrees[1].academic_degree_id === 1) {
                console.log(' Error (2) in scores computation - Degrees.',
                        'Call Id:', data.callID ,
                        'Application ID:', data.applicationID)
            } else if (data.academicDegrees[0].academic_degree_id ===
            data.academicDegrees[1].academic_degree_id) {
                console.log(' Error (3) in scores computation - Degrees.',
                    'Call Id:', data.callID ,
                    'Application ID:', data.applicationID)
            } else {
                let average = (data.academicDegrees[0].grade * 1.0
                             + data.academicDegrees[1].grade * 1.0) / 2.0;
                if (Math.round(average) >= 18) {
                    options.criteria[indCriteria].score_auto = 5.0;
                } else if (Math.round(average) >= 17) {
                    options.criteria[indCriteria].score_auto = 4.5;
                } else if (Math.round(average) >= 16) {
                    options.criteria[indCriteria].score_auto = 4.0;
                } else if (Math.round(average) >= 15) {
                    options.criteria[indCriteria].score_auto = 3.5;
                } else if (Math.round(average) >= 14) {
                    options.criteria[indCriteria].score_auto = 3.0;
                } else if (Math.round(average) < 14) {
                    options.criteria[indCriteria].score_auto = 2.5;
                }
            }
        } else {
            console.log(' Error (4) in scores computation - Degrees.',
                        'Call Id:', data.callID ,
                        'Application ID:', data.applicationID)
        }
    }
    return computeScoreProjects(options);

};
var computeScoreProjects = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    let pointsProject = 5;
    // the algorithm is dependent on specific names in the criteria, change???
    let indCriteria;
    for (let ind in options.criteria) {
        if (options.criteria[ind].name_en === 'Projects') {
            indCriteria = ind;
            break;
        }
    }
    if (indCriteria === undefined) {
        console.log(' Error in scores computation - Projects.',
            'Call Id:', data.callID ,
            'Application ID:', data.applicationID)
    } else {
        // it suffices to have a single project
        if (data.projects.length > 0) {
            for (let ind in data.projects) {
                if (data.projects[ind].title && data.projects[ind].participation) {
                    // the user participated in project
                    options.criteria[indCriteria].score_auto = pointsProject;
                    break;
                }
            }
        }
    }
    return computeScorePapers(options);
};
var computeScorePapers = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    let q1Points = 1.667;
    let q2Points = 1.333;
    let q3Points = 1;
    let q4Points = 1;
    let firstAuthorPoints = 0.333;
    let maxPoints = 5.0;

    let indCriteria;
    for (let ind in options.criteria) {
        if (options.criteria[ind].name_en === 'Papers') {
            indCriteria = ind;
            break;
        }
    }
    if (indCriteria === undefined) {
        console.log(' Error in scores computation - Papers.',
            'Call Id:', data.callID ,
            'Application ID:', data.applicationID)
    } else {
        if (data.papers.length > 0) {
            let sum = 0.0;
            for (let ind in data.papers) {
                if (data.papers[ind].journal_quartile === 1) {
                    sum = sum + q1Points;
                } else if (data.papers[ind].journal_quartile === 2) {
                    sum = sum + q2Points;
                } else if (data.papers[ind].journal_quartile === 3) {
                    sum = sum + q3Points;
                } else if (data.papers[ind].journal_quartile === 4) {
                    sum = sum + q4Points;
                }
                if (data.papers[ind].first_author) {
                    sum = sum + firstAuthorPoints;
                }
            }
            options.criteria[indCriteria].score_auto = Math.min(sum, maxPoints);
        }
    }
    return computeScoreCommunications(options);
};
var computeScoreCommunications = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    let nationalPoints = 2;
    let internationalPoints = 2.5;
    let firstAuthorPoints = 0.5;
    let maxPoints = 5;

    let indCriteria;
    for (let ind in options.criteria) {
        if (options.criteria[ind].name_en === 'Communications') {
            indCriteria = ind;
            break;
        }
    }
    if (indCriteria === undefined) {
        console.log(' Error in scores computation - Communications.',
            'Call Id:', data.callID ,
            'Application ID:', data.applicationID)
    } else {
        if (data.communications.length > 0) {
            let sum = 0.0;
            for (let ind in data.communications) {
                if (data.communications[ind].international) {
                    sum = sum + internationalPoints;
                } else {
                    sum = sum + nationalPoints;
                }
                if (data.communications[ind].first_author) {
                    sum = sum + firstAuthorPoints;
                }
            }
            options.criteria[indCriteria].score_auto = Math.min(sum, maxPoints);
        }
    }
    return computeScorePosters(options);
};
var computeScorePosters = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    let nationalPoints = 1.667;
    let internationalPoints = 2.5;
    let firstAuthorPoints = 0.833;
    let maxPoints = 5;

    let indCriteria;
    for (let ind in options.criteria) {
        if (options.criteria[ind].name_en === 'Posters') {
            indCriteria = ind;
            break;
        }
    }
    if (indCriteria === undefined) {
        console.log(' Error in scores computation - Posters.',
            'Call Id:', data.callID ,
            'Application ID:', data.applicationID)
    } else {
        if (data.posters.length > 0) {
            let sum = 0.0;
            for (let ind in data.posters) {
                if (data.posters[ind].international) {
                    sum = sum + internationalPoints;
                } else {
                    sum = sum + nationalPoints;
                }
                if (data.posters[ind].first_author) {
                    sum = sum + firstAuthorPoints;
                }
            }
            options.criteria[indCriteria].score_auto = Math.min(sum, maxPoints);
        }
    }
    return computeScorePatentsPrizesProfessional(options);
};
var computeScorePatentsPrizesProfessional = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    let patentsEtcPoints = 5;

    let indCriteria;
    for (let ind in options.criteria) {
        if (options.criteria[ind].name_en === 'Patents/Prizes/Professional Experience') {
            indCriteria = ind;
            break;
        }
    }
    if (indCriteria === undefined) {
        console.log(' Error in scores computation - Patents/etc.',
            'Call Id:', data.callID ,
            'Application ID:', data.applicationID)
    } else {
        if (data.prizes.length > 0) {
            for (let ind in data.prizes) {
                if (data.prizes[ind].prize_name) {
                    options.criteria[indCriteria].score_auto = patentsEtcPoints;
                    break;
                }
            }
        }
        if (data.patents.length > 0) {
            for (let ind in data.patents) {
                if (data.patents[ind].title) {
                    options.criteria[indCriteria].score_auto = patentsEtcPoints;
                    break;
                }
            }
        }
        if (data.professional.length > 0) {
            for (let ind in data.professional) {
                if (data.professional[ind].company) {
                    options.criteria[indCriteria].score_auto = patentsEtcPoints;
                    break;
                }
            }
        }
    }
    options.i = 0;
    return computeGlobalAutomaticScores(options);
};
var computeGlobalAutomaticScores = function (options) {
    // transform to an object
    let score = {};
    for (let ind in options.criteria) {
        options.criteria[ind].children = {};
        score[options.criteria[ind].id] = options.criteria[ind];
    }
    // create the hierarchy tree
    for (const [key,val] of Object.entries(score)) {
        if (val.parent_criteria_id !== null) {
            score[val.parent_criteria_id].children[key] = val;
        }
    }
    // computes the score on the several levels
    for (const [key,val] of Object.entries(score)) {
        if (val.score_auto === undefined) {
            val.score_auto = scoreSum(val);
        }
    }
    options.criteria = Object.values(score);
    options.i = 0;
    return writeAutomaticScoresDB(options);
}
var writeAutomaticScoresDB = function (options) {
    let { req, res, next, i } = options;
    let data = req.body.data;
    if (options.criteria.length > 0) {
        let score = options.criteria[i];
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'INSERT INTO application_automatic_scores'
                            + ' (application_id, criteria_id, score)'
                            + ' VALUES (?, ?, ?);';
        // scores from criteria with children are always the result of computationns
        if (Object.keys(score.children).length === 0) {
            places.push( data.applicationID,
                score.id,
                score.score_auto
            );
        } else {
            places.push( data.applicationID,
                score.id,
                null
            );
        }
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                if (i + 1 < options.criteria.length) {
                    options.i = i + 1;
                    return writeAutomaticScoresDB(options);
                } else {
                    return responses.sendJSONResponseOptions({
                        response: res,
                        status: 200,
                        message: {
                            "status": "success",
                            "statusCode": 200,
                            "message": "Done!",
                        }
                    });
                }
            },
            options);

    } else {
        //error no criteria defined yet
        return responses.sendJSONResponseOptions({
            response: res,
            status: 403,
            message: {
                "status": "error", "statusCode": 403,
                "message": "No criteria defined yet!"
            }
        });
    }
}

module.exports.computeScores = function (req, res, next) {
    let options = {
        req,
        res,
        next,
    }
    return actionGetApplicationCriteria(options);
}