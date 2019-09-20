const responses = require('../utilities/responses')
var server = require('../../config/mysql_connection');
var pool = server.pool;
/**
 * Makes SQL query and sends HTTP response
 * @param {*} req 
 * @param {*} res 
 * @param {*} sql 
 * @param {*} places 
 * @param {*} callback 
 * @param {*} callbackOptions 
 */
var makeSQLOperation = function (req, res, sql, places, callback, callbackOptions) {
    pool.getConnection(function (err, connection) {
        if (err) {
            responses.sendJSONResponse(res, 500, { "status": "error", "statusCode": 500, "error": err.stack });
            return;
        }
        connection.query(sql, places,
            function (err, resQuery) {
                // And done with the connection.
                connection.release();
                if (err) {
                    responses.sendJSONResponse(res, 400, { "status": "error", "statusCode": 400, "error": err.stack });
                    return;
                }
                if (callback !== undefined) {
                    return callback(callbackOptions);
                } else {
                    responses.sendJSONResponse(res, 200,
                        {
                            "status": "success", "statusCode": 200, "count": resQuery.length,
                            "result": resQuery
                        });
                    return;
                }
            }
        )
    })
}

/**
 * Makes SQL query and calls subsequent callbacks
 * @param {*} req 
 * @param {*} res 
 * @param {*} sql 
 * @param {*} places 
 * @param {*} callback 
 * @param {*} callbackOptions 
 */
var getSQLOperationResult = function (req, res, sql, places, callback, callbackOptions) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err.stack);
            return;
        }
        connection.query(sql, places,
            function (err, resQuery) {
                // And done with the connection.
                connection.release();
                if (err) {
                    console.log(err.stack);
                    return;
                }
                return callback(resQuery, callbackOptions);                
            }
        )
    })
}

module.exports.makeSQLOperation = makeSQLOperation;
module.exports.getSQLOperationResult = getSQLOperationResult;
