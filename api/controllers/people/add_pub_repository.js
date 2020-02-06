const http = require('axios');
const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const permissions = require('../utilities/permissions');

var actionGetPUREID = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT pure_id'
            + ' FROM researchers_info'
            + ' WHERE person_id = ?';
    places.push(personID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.pureID = resQuery[0].pure_id;
                options.publications = [];
                actionGetPUREPublications(options, 0);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success", "statusCode": 200,
                        "count": 0,
                        "result": { "publications": [] },
                        "message": "Problem obtaining PURE ID."
                    }
                });
                return;

            }
        },
        options);

};
var actionGetPUREPublications = function (options, i) {
    let { req, res, next } = options;
    let pageSize = 10;
    let entity = 'persons'
    let url = process.env.PURE_BASE_URL
            + '/' + process.env.PURE_VERSION
            + '/' + entity
            + '/' + options.pureID
            + '/' + 'research-outputs';

    http.get(url, {
        params: {
            "offset": i*pageSize,
        },
        headers: {
            "api-key": process.env.PURE_API_KEY,
        },
    })
    .then((result) => {
        options.publications = options.publications.concat(result.data.items)
        if (options.publications.length < result.data.count) {
            actionGetPUREPublications(options, i + 1);
        } else {
            responses.sendJSONResponseOptions({
                response: res,
                status: 200,
                message: {
                    "status": "success", "statusCode": 200,
                    "count": options.publications.length,
                    "result": { "publications": options.publications },
                }
            });
            return;
        }
    })
    .catch((error) => {
        // eslint-disable-next-line
        console.log(error)
    });
};
module.exports.getPUREPublications = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPUREID(options) },
        { req, res, next }
    );
};
