const sql = require('../utilities/sql')
const responses = require('../utilities/responses');


var actionGetCallInfo = function (options) {
    let { req, res, next } = options;
    let callID = req.params.callID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT *'
                        + ' FROM call_applications'
                        + ' WHERE id = ?;';
    places.push(callID)
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
    let callID = req.params.callID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT call_text_paragraphs.paragraph_type_id, call_text_paragraphs.text,'
                        + ' call_text_paragraphs.order_appearance,'
                        + ' call_paragraph_types.name AS paragraph_type_name'
                        + ' FROM call_text_paragraphs'
                        + ' LEFT JOIN call_paragraph_types ON call_paragraph_types.id = call_text_paragraphs.paragraph_type_id'
                        + ' WHERE call_text_paragraphs.call_id = ?'
                        + ' ORDER BY order_appearance;';
    places.push(callID)
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