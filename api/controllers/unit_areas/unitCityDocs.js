const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const time = require('../utilities/time');
const permissions = require('../utilities/permissions');
const fs = require('fs-extra');
var path = require('path');
var multer = require('multer');

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, callback) {
        var unitID = req.params.unitID;
        var cityID = req.params.cityID;
        let addDocID = req.docID;
        var tempDirectory;
        if (cityID === undefined) {
            tempDirectory = 'documents/units/' + unitID + '/' + addDocID;
        } else {
            tempDirectory = 'documents/units/' + unitID + '/cities/' + cityID + '/' + addDocID;
        }
        fs.emptyDir(tempDirectory)
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


var actionGetDocs = function (options) {
    let { req, res, next } = options;
    let unitID = req.params.unitID;
    let cityID = req.params.cityID;
    var querySQL = '';
    var places = [];
    if (req.query.status !== 'all') {
        querySQL = querySQL
                + 'SELECT unit_city_documents.*, document_types.name AS doc_type_name'
                + ' FROM unit_city_documents'
                + ' JOIN document_types ON unit_city_documents.doc_type_id = document_types.id'
                + ' WHERE unit_city_documents.unit_id = ? AND unit_city_documents.city_id = ?'
                + ' AND ((unit_city_documents.valid_from <= CURRENT_DATE() OR unit_city_documents.valid_from IS NULL) '
                + ' AND (unit_city_documents.valid_until >= CURRENT_DATE() OR unit_city_documents.valid_until IS NULL))'
                + ' ORDER BY sort_order DESC'
                ;
        places.push(unitID, cityID)
    } else {
        querySQL = querySQL
                + 'SELECT unit_city_documents.*, document_types.name AS doc_type_name'
                + ' FROM unit_city_documents'
                + ' JOIN document_types ON unit_city_documents.doc_type_id = document_types.id'
                + ' WHERE unit_city_documents.unit_id = ? AND unit_city_documents.city_id = ?'
                + ' ORDER BY sort_order DESC'
                ;
        places.push(unitID, cityID)
    }
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.getDocs = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetDocs(options) },
        { req, res, next }
    );
};

var actionCreateDocDBEntry = function (options) {
    let { req, res, next } = options;
    let unitID = req.params.unitID;
    let cityID = req.params.cityID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL + 'INSERT INTO unit_city_documents'
                        + ' (unit_id, city_id)'
                        + ' VALUES (?,?);';
    places.push(unitID, cityID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            req.docID = resQuery.insertId;
            createDocwriteFile(req, res, next);
            /*
            if (req.body.data.file !== null && req.body.data.file !== undefined) {
                return createDocwriteFile(req, res, next);
            } else {
                return createDocAddRemainingDataDB(req, res, next);
            }
            */
        },
        options);
};
var createDocwriteFile = function (req, res, next) {
    var upload = multer({
        storage: storage,
    }).single('file');
    upload(req, res, function (err) {
        if (err) {
            responses.sendJSONResponse(res, 500, { "status": "error", "statusCode": 500, "error": err.stack });
            return;
        }
        return createDocAddRemainingDataDB(req, res, next);
    });
};
var createDocAddRemainingDataDB = function (req, res, next) {
    var docData = req.body;
    let valid_from = null;
    let valid_until = null;
    if (docData.valid_from !== null && docData.valid_from !== undefined && docData.valid_from !== '') {
        valid_from = time.momentToDate(docData.valid_from);
    }
    if (docData.valid_until !== null && docData.valid_until !== undefined && docData.valid_until !== '') {
        valid_until = time.momentToDate(docData.valid_until);
    }

    let url = null;
    if (docData.file_name !== null && docData.file_name !== undefined && docData.file_name !== '') {
        url = process.env.PATH_PREFIX + '/' + req.file.path;
        url = url.replace(/\s/g,'%20');
    } else if (docData.attachment_url !== null && docData.attachment_url !== undefined) {
        url = docData.attachment_url.replace(/\s/g,'%20');
    }
    let querySQL = '';
    let places = [];
    querySQL = 'UPDATE unit_city_documents'
                + ' SET doc_type_id = ?,'
                + ' title = ?,'
                + ' content = ?,'
                + ' attachment_url = ?,'
                + ' valid_from = ?,'
                + ' valid_until = ?,'
                + ' sort_order = ?'
                + ' WHERE id = ?'
    places.push(docData.doc_type_id,
                docData.title,
                docData.content,
                url,
                valid_from,
                valid_until,
                docData.sort_order,
                req.docID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};

module.exports.createDoc = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionCreateDocDBEntry(options) },
        { req, res, next }
    );
};

var updateDocwriteFile = function (options) {
    let { req, res, next } = options;
    let unitID = req.params.unitID;
    let cityID = req.params.cityID;
    let docID = req.params.docID;
    // to keep file system clean the directory is always removed
    let deleteDirectory = 'documents/units/' + unitID
                        + '/cities/'+ cityID
                        + '/' + docID;
    fs.remove(deleteDirectory)
    .then(() => {
        req.docID = docID;
        var upload = multer({
            storage: storage,
        }).single('file');
        upload(req, res, function (err) {
            if (err) {
                responses.sendJSONResponse(res, 500, { "status": "error", "statusCode": 500, "error": err.stack });
                return;
            }
            return updateDocDataDB(req, res, next);
        });
    })
    .catch((err) => {
        console.log(err);
    });
};
var updateDocDataDB = function (req, res, next) {
    var docData = req.body;
    let valid_from = null;
    let valid_until = null;
    if (docData.valid_from !== null && docData.valid_from !== undefined && docData.valid_from !== '') {
        valid_from = time.momentToDate(docData.valid_from);
    }
    if (docData.valid_until !== null && docData.valid_until !== undefined && docData.valid_until !== '') {
        valid_until = time.momentToDate(docData.valid_until);
    }

    let url = null;
    if (docData.file_name !== null && docData.file_name !== undefined && docData.file_name !== '') {
        url = process.env.PATH_PREFIX + '/' + req.file.path;
        url = url.replace(/\s/g,'%20');
    } else if (docData.attachment_url !== null && docData.attachment_url !== undefined) {
        url = docData.attachment_url.replace(/\s/g,'%20');
    }
    let querySQL = '';
    let places = [];
    querySQL = 'UPDATE unit_city_documents'
                + ' SET doc_type_id = ?,'
                + ' title = ?,'
                + ' content = ?,'
                + ' attachment_url = ?,'
                + ' valid_from = ?,'
                + ' valid_until = ?,'
                + ' sort_order = ?'
                + ' WHERE id = ?';
    places.push(docData.doc_type_id,
                docData.title,
                docData.content,
                url,
                valid_from,
                valid_until,
                docData.sort_order,
                req.docID);
    return sql.makeSQLOperation(req, res, querySQL, places);
};
module.exports.updateDoc = function (req, res, next) {
    permissions.checkPermissions(
        (options) => {
            updateDocwriteFile(options) },
        { req, res, next }
    );
};

var actionDeleteDoc = function (options) {
    let { req, res, next } = options;
    let docID = req.params.docID;
    let unitID = req.params.unitID;
    let cityID = req.params.cityID;
    let deleteDirectory = 'documents/units/' + unitID
                        + '/cities/'+ cityID
                        + '/' + docID;
    fs.remove(deleteDirectory)
    .then(() => {
        var querySQL = '';
        var places = [];
        querySQL = querySQL + 'DELETE FROM unit_city_documents'
                            + ' WHERE id = ?;';
        places.push(docID);
        return sql.makeSQLOperation(req, res, querySQL, places);
    })

};
module.exports.deleteDoc = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionDeleteDoc(options) },
        { req, res, next }
    );
};