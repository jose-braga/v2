const sql = require('../utilities/sql')
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');
const time = require('../utilities/time');
/*
// Commented because reference letter is submiyyed as text
const fs = require('fs-extra');
var path = require('path');
var multer = require('multer');
*/


var actionGetQuestions = function (options) {
    let { req, res, next } = options;
    let callID = req.params.callID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM application_recommender_questions'
                        + ' WHERE call_id = ?;';
    places.push(callID)
    return sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.getQuestions = function (req, res, next) {
    permissions.checkPermissionsRecommendations(
        (options) => { actionGetQuestions(options) },
        { req, res, next }
    );
}

var actionWriteAnswers = function (options) {
    let { req, res, next, i } = options;
    let applicationID = req.params.applicationID;
    let recommenderID = req.params.recommenderID;
    let data = req.body.data;
    if (data.answers !== undefined && data.answers.length > 0) {
        var querySQL = '';
        var places = [];
        if (data.answers[i].answer_type === 'grade') {
            querySQL = querySQL + 'INSERT INTO application_recommender_answers'
                            + '(application_id, recommender_id, question_id, score)'
                            + ' VALUES (?, ?, ?, ?);';
            places.push(applicationID,
                recommenderID,
                data.answers[i].id,
                data.answers[i].answer);
        } else {
            querySQL = querySQL + 'INSERT INTO application_recommender_answers'
                            + '(application_id, recommender_id, question_id, answer)'
                            + ' VALUES (?, ?, ?, ?);';
            places.push(applicationID,
                recommenderID,
                data.answers[i].id,
                data.answers[i].answer);
        }
        return sql.makeSQLOperation(req, res, querySQL, places,
            (options) => {
                if (i + 1 < data.answers.length) {
                    options.i = i + 1;
                    return actionWriteAnswers(options)
                } else {
                    writeReferenceLetter(options)
                }
            },
            options
        );
    } else {
        writeReferenceLetter(options)
    }
};
var writeReferenceLetter = function (options) {
    let { req, res, next } = options;
    let applicationID = req.params.applicationID;
    let recommenderID = req.params.recommenderID;
    let data = req.body.data;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO application_letter_recommendation'
                    + '(application_id, recommender_id, text)'
                    + ' VALUES (?, ?, ?);';
    places.push(applicationID,
        recommenderID,
        data.reference);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            return writeDateRecommender(options);
        },
        options
    );
};
var writeDateRecommender = function (options) {
    let { req, res, next } = options;
    let recommenderID = req.params.recommenderID;
    let now = time.momentToDate(time.moment(), undefined, 'YYYY-MM-DD HH:mm:ss');
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'UPDATE application_recommenders'
                    + ' SET submitted = ?'
                    + ' WHERE id = ?;';
    places.push(now,
        recommenderID);
    return sql.makeSQLOperation(req, res, querySQL, places);
}
module.exports.writeRecommenderAnswers = function (req, res, next) {
    permissions.checkPermissionsRecommendations(
        (options) => {
            options.i = 0;
            return actionWriteAnswers(options) },
        { req, res, next }
    );
}