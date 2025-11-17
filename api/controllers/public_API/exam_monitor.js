const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
var time = require('../../controllers/utilities/time');

module.exports.insertStudentConnection = function (req, res, next) {
    let querySQL;
    let places = [];
    let data = req.body;
    //console.log(data)
    querySQL = 'INSERT INTO test_exam_monitor (student_id, time) VALUES (?,?);'
    places.push(data.student_id,data.time);
    //console.log(places)
    return sql.makeSQLOperation(req, res, querySQL, places)
};


module.exports.getCurrentTime = function (req, res, next) {
    let currentTime = time.momentToDate(undefined, undefined, 'YYYY-MM-DD HH:mm:ss');
    return responses.sendJSONResponse( res, 200, { currentTime: currentTime });

};
