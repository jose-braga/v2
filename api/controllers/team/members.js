const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

var actionGetLabMembers = function (options) {
    let { req, res, next } = options;
    let labID = req.params.labID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * from people_labs'
                        + ' WHERE lab_id = ?;';
    places.push(labID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => { 
            //processDegreesDetails(resQuery, options) 
            //console.log(resQuery)
        },
        options);
};
module.exports.getLabMembers = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetLabMembers(options) },
        { req, res, next }
    );
};