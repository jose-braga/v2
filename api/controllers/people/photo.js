const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');
const notifications = require('../utilities/notifications');
const permissions = require('../utilities/permissions');
const fs = require('fs-extra');
var path = require('path');
var multer = require('multer');

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, callback) {
        var personID = req.params.personID;
        var imageType = req.params.imageType;
        var tempDirectory = 'images/people/' + personID + '/' + imageType;
        fs.ensureDir(tempDirectory)
            .then(() => {
                fs.emptyDir(tempDirectory)
                    .then(() => {
                        callback(null, tempDirectory);
                    })
                    .catch((err) => {
                        console.log('File write error 1 - ', err);
                        callback(null, tempDirectory);
                    });
            })
            .catch((err) => {
                console.log('File write error 2 - ', err);
                callback(null, tempDirectory);
            });
    },
    filename: function (req, file, callback) {
        var datetimestamp = time.momentToDate(time.moment(), undefined, 'YYYYMMDD_HHmmss');
        var fileInfo = path.parse(req.body.file_name);
        callback(null, fileInfo.name + '-' + datetimestamp + fileInfo.ext);
    }
});

var actionGetPhoto = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let imageType = req.params.imageType;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM personal_photo'
                        + ' WHERE person_id = ? AND photo_type_id = ?;';
    places.push(personID, imageType)
    sql.makeSQLOperation(req, res, querySQL, places);
    return;
};

module.exports.getPhoto = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPhoto(options) },
        { req, res, next }
    );
};

var actionCheckPreviousPhotoExists = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    let imageType = req.params.imageType;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'SELECT * FROM personal_photo'
                        + ' WHERE person_id = ? AND photo_type_id = ?;';
    places.push(personID, imageType);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.photoID = resQuery[0].id;
                return updatePhoto(options);
            } else {
                return createPhoto(options);
            }
        },
        options
    );
};

var updatePhoto = function (options) {
    let { req, res, next, personID, imageType } = options;
    var querySQL = '';
    var places = [];
    // TODO: Check if line below holds in production
    let url = process.env.PATH_PREFIX + '/' + req.file.path;
    querySQL = querySQL + 'UPDATE personal_photo'
                        + ' SET url = ?'
                        + ' WHERE id = ?;';
    places.push(
        url,
        options.photoID);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig);
            responses.sendJSONResponseOptions(options);
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200,
                "result": "OK - Photo saved and info updated in DB!"
            }
        });
};

var createPhoto = function (options) {
    let { req, res, next, personID, imageType } = options;
    var querySQL = '';
    var places = [];
    let url = process.env.PATH_PREFIX + '/' + req.file.path;
    querySQL = querySQL + 'INSERT INTO personal_photo'
        + '(person_id, photo_type_id, url)'
        + ' VALUES (?, ?, ?);';
    places.push(
        personID,
        imageType,
        url);
    return sql.makeSQLOperation(req, res, querySQL, places,
        (options) => {
            let notificationConfig = { entityID: personID };
            notifications.notifyWebsiteAPI(notificationConfig);
            responses.sendJSONResponseOptions(options);
        },
        {
            response: res,
            status: 200,
            message: {
                "status": "success", "statusCode": 200,
                "result": "OK - Photo saved and info added to DB!"
            }
        });
};

var actionUploadPhoto = function (options) {
    let { req, res, next } = options;
    // resource data
    let personID = req.params.personID;
    let imageType = req.params.imageType;
    options = { req, res, next, personID, imageType };
    var upload = multer({
        storage: storage,
    }).single('file');
    upload(req, res, function (err) {
        if (err) {
            responses.sendJSONResponse(res, 500, { "status": "error", "statusCode": 500, "error": err.stack });
            return;
        }
        return actionCheckPreviousPhotoExists(options);
    });
};

module.exports.uploadPhoto = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionUploadPhoto(options) },
        { req, res, next }
    );
};