const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const time = require('../utilities/time');
const permissions = require('../utilities/permissions');
const fs = require('fs-extra');
var path = require('path');
var multer = require('multer');

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, callback) {
        var tabID = req.params.tabID;
        var sectionID = req.params.sectionID;
        var groupID = req.params.groupID;
        let tempDirectory = ''
        if (process.env.NODE_ENV === 'production') {
            tempDirectory = 'private-areas/tabs/' + tabID
                    + '/sections/' + sectionID
                    + '/groups/' + groupID
                    + '/documents';
        } else {
            tempDirectory = 'private-areas/tabs/' + tabID
                    + '/sections/' + sectionID
                    + '/groups/' + groupID
                    + '/documents';
        }
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
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
        callback(null, file.originalname);
    }
});

var checkPermissionsPrivateDocs = function (callback, callbackOptions) {
    let { req, res, next } = callbackOptions; // should contain always these 3
    let personID = req.params.personID
    let tabID = parseInt(req.params.tabID)
    var querySQL = '';
    var places = [];
    querySQL = querySQL
                + 'SELECT private_documents_permissions.*,'
                + ' private_documents_tabs.unit_id,'
                + ' private_documents_tabs.tab_name, private_documents_tabs.tab_path'
                + ' FROM private_documents_permissions'
                + ' JOIN private_documents_tabs ON private_documents_tabs.id = private_documents_permissions.priv_tab_id'
                + ' WHERE private_documents_permissions.person_id = ?'
                + ' AND private_documents_permissions.permission_active = 1;';
    places.push(personID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
            (resQuery, callbackOptions) => {
                let routeFound = false;
                resQuery.forEach(element => {
                    if (req.method === 'GET'
                        && element.priv_tab_id === tabID) {
                        routeFound = true;
                        return callback(callbackOptions);
                    }
                    if (req.method !== 'GET'
                        && element.priv_tab_id === tabID
                        && element.management_permission === 1
                    ) {
                        routeFound = true;
                        return callback(callbackOptions);
                    }
                })
                if (!routeFound) {
                    return responses.sendJSONResponseOptions({
                        response: res,
                        status: 403,
                        message: {
                            "status": "error", "statusCode": 403,
                            "message": "You have no permission to this method."
                        }
                    });
                }
            },
            callbackOptions);
}

var actionGetPermissionsList = function (options) {
    let { req, res, next } = options;
    let personID = req.params.personID;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
                + 'SELECT private_documents_permissions.*,'
                + ' private_documents_tabs.unit_id,'
                + ' private_documents_tabs.tab_name, private_documents_tabs.tab_path'
                + ' FROM private_documents_permissions'
                + ' JOIN private_documents_tabs ON private_documents_tabs.id = private_documents_permissions.priv_tab_id'
                + ' WHERE private_documents_permissions.person_id = ?'
                + ' AND private_documents_permissions.permission_active = 1;';
    places.push(personID)
    return sql.makeSQLOperation(req, res, querySQL, places)
};
module.exports.getPermissionsList = function (req, res, next) {
    permissions.checkPermissions(
        (options) => { actionGetPermissionsList(options) },
        { req, res, next }
    );
};

var actionGetSections = function (options) {
    let { req, res, next } = options;
    let tabID = parseInt(req.params.tabID)
    var querySQL = '';
    var places = [];
    querySQL = querySQL
                + 'SELECT *'
                + ' FROM private_documents_sections'
                + ' WHERE priv_tab_id = ?;';
    places.push(tabID)
    return sql.makeSQLOperation(req, res, querySQL, places)
}

module.exports.getSections = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => { actionGetSections(options) },
        { req, res, next }
    );
};

var actionGetGroups = function (options) {
    let { req, res, next } = options;
    let sectionID = parseInt(req.params.sectionID)
    var querySQL = '';
    var places = [];
    querySQL = querySQL
                + 'SELECT *'
                + ' FROM private_documents_groups'
                + ' WHERE section_id = ?;';
    places.push(sectionID)
    return sql.makeSQLOperation(req, res, querySQL, places)
}

module.exports.getGroups = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => { actionGetGroups(options) },
        { req, res, next }
    );
};

var actionGetDocuments = function (options) {
    let { req, res, next } = options;
    let groupID = parseInt(req.params.groupID)
    var querySQL = '';
    var places = [];
    querySQL = querySQL
                + 'SELECT *'
                + ' FROM private_documents'
                + ' WHERE group_id = ?;';
    places.push(groupID)
    return sql.makeSQLOperation(req, res, querySQL, places)
}

module.exports.getDocuments = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => { actionGetDocuments(options) },
        { req, res, next }
    );
};

var actionDownloadDocument = function (options) {
    let { req, res, next } = options;
    let tabID = req.params.tabID;
    let sectionID = req.params.sectionID;
    let groupID = req.params.groupID;
    let docName = req.params.docName;
    let filepath = '/app/private-areas'
        + '/tabs/' + tabID + '/sections/' + sectionID + '/groups/' + groupID
        + '/documents/' + docName;
    res.download(filepath);
}

module.exports.downloadDocument = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => { actionDownloadDocument(options) },
        { req, res, next }
    );
};

var actionCreateSection = function (options) {
    let { req, res, next } = options;
    let tabID = req.params.tabID;
    let docData = req.body.data;
    let sectionName = docData.new_section_name;
    let sortOrder = docData.section_sort_order;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
                + 'INSERT INTO private_documents_sections'
                + ' (priv_tab_id, section_name, sort_order)'
                + ' VALUES (?,?,?);';
    places.push(tabID, sectionName, sortOrder)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            req.body.data.section_id = resQuery.insertId;
            return actionCreateGroup(options);
        },
        options);
}
var actionCreateGroup = function (options) {
    let { req, res, next } = options;
    let docData = req.body.data;
    let sectionID = docData.section_id;
    let title = docData.title;
    let content = docData.content;
    let sortOrder = docData.group_sort_order;
    var querySQL = '';
    var places = [];
    querySQL = querySQL
                + 'INSERT INTO private_documents_groups'
                + ' (section_id, title, content, sort_order)'
                + ' VALUES (?,?,?,?);';
    places.push(sectionID, title, content, sortOrder);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            req.body.data.group_id = resQuery.insertId;
            options.i = 0;
            req.body.data.docIDs = [];
            return actionCreateDocDBEntry(options);
        },
        options);
}
var actionCreateDocDBEntry = function (options) {
    let { req, res, next, i } = options;
    let docData = req.body.data;
    let groupID = docData.group_id
    let filename = docData.filenames[i]
    var querySQL = '';
    var places = [];
    querySQL = querySQL
                + 'INSERT INTO private_documents'
                + ' (group_id, display_name, attachment_url, sort_order)'
                + ' VALUES (?,?,?,?);';
    places.push(groupID, filename.display_name, filename.name, filename.sort_order);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            req.body.data.docIDs.push(resQuery.insertId)
            if (i + 1 < docData.filenames.length) {
                options.i = i + 1;
                return actionCreateDocDBEntry(options);
            } else {
                responses.sendJSONResponseOptions({
                    response: res,
                    status: 200,
                    message: {
                        "status": "success",
                        "statusCode": 200,
                        data: req.body.data,
                    }
                });
                return;
            }
        },
        options);
}

module.exports.createDocumentsDBEntries = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => {
            let sectionID = req.params.sectionID;
            let groupID = req.params.groupID;
            // if needed create section (and group) or just a group
            // then: create DB entries, upload files and
            if (sectionID === "new") {
                return actionCreateSection(options);
            } else if (groupID === "new") {
                return actionCreateGroup(options);
            } else {
                options.i = 0;
                req.body.data.docIDs = [];
                return actionCreateDocDBEntry(options);
            }
        },
        { req, res, next }
    );
};

module.exports.uploadDocuments = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => {
            var upload = multer({
                storage: storage,
            }).array('files');
            upload(req, res, function (err) {
                if (err) {
                    responses.sendJSONResponse(res, 500, { "status": "error", "statusCode": 500, "error": err.stack });
                    return;
                }
                responses.sendJSONResponse(res, 200,
                        {"status": "success", "statusCode": 200});
                return;
            });
        },
        { req, res, next }
    );
};

var actionUpdateSection = function (options) {
    let { req, res, next } = options;
    let tabID = req.params.tabID;
    let sectionID = req.params.sectionID;
    let data = req.body.data;
    let querySQL = '';
    let places = [];
    querySQL = querySQL
                + 'UPDATE private_documents_sections'
                + ' SET section_name = ?,'
                + ' sort_order = ?'
                + ' WHERE id = ?;';
    places.push(data.name, data.sort_order, sectionID)
    return sql.makeSQLOperation(req, res, querySQL, places);
}

module.exports.updateSection = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => { actionUpdateSection(options) },
        { req, res, next }
    );
};

var actionUpdateGroup = function (options) {
    let { req, res, next } = options;
    let tabID = req.params.tabID;
    let sectionID = req.params.sectionID;
    let groupID = req.params.groupID;
    let data = req.body.data;
    let querySQL = '';
    let places = [];
    querySQL = querySQL
                + 'UPDATE private_documents_groups'
                + ' SET title = ?,'
                + ' content = ?,'
                + ' sort_order = ?'
                + ' WHERE id = ?;';
    places.push(data.name, data.content, data.sort_order, groupID)
    return sql.makeSQLOperation(req, res, querySQL, places);
}

module.exports.updateGroup = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => { actionUpdateGroup(options) },
        { req, res, next }
    );
};

var actionUpdateDocument = function (options) {
    let { req, res, next } = options;
    let documentID = req.params.docID;
    let data = req.body.data;
    let querySQL = '';
    let places = [];
    querySQL = querySQL
                + 'UPDATE private_documents'
                + ' SET display_name = ?,'
                + ' sort_order = ?'
                + ' WHERE id = ?;';
    places.push(data.display_name, data.sort_order, documentID)
    return sql.makeSQLOperation(req, res, querySQL, places);
}

module.exports.updateDocument = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => { actionUpdateDocument(options) },
        { req, res, next }
    );
};

var actionDeleteDocumentDB = function (options) {
    let { req, res, next } = options;
    let tabID = req.params.tabID;
    let sectionID = req.params.sectionID;
    let groupID = req.params.groupID;
    let docID = req.params.docID;
    let querySQL = '';
    let places = [];
    querySQL = querySQL
                + 'DELETE'
                + ' FROM private_documents'
                + ' WHERE id = ?;';
    places.push(docID)
    return sql.makeSQLOperation(req, res, querySQL, places);
}

var actionDeleteDocument = function (options) {
    /* TODO: If it is necessary to really delete file! */
}

module.exports.deleteDocument = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => { actionDeleteDocumentDB(options) },
        { req, res, next }
    );
};

