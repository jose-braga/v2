const sql = require('../utilities/sql');
const responses = require('../utilities/responses');
const time = require('../utilities/time');
const permissions = require('../utilities/permissions');
const fs = require('fs-extra');
var path = require('path');
var multer = require('multer');
const checkDiskSpace = require('check-disk-space').default

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


module.exports.getAvailableSpace = function (req, res, next) {
     if (process.env.NODE_ENV === 'production') {
        volumePath = '/app/private-areas/';
    } else {
        volumePath = '/app/';
    }
    checkDiskSpace(volumePath)
    .then((diskspace) =>  {
        let percFree = diskspace.free / diskspace.size * 100
        responses.sendJSONResponse(res, 200,
            {
                "status": "success",
                "statusCode": 200,
                "result": {
                    "free": diskspace.free,
                    "size": diskspace.size,
                    "free_gb": diskspace.free / 1024 ** 3,
                    "size_gb": diskspace.size / 1024 ** 3,
                    "percFree": percFree.toFixed(1),
                }
            }
        )
    })
};

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
                    if (element.tab_path === 'admin' && routeFound === false) {
                        routeFound = true;
                        return callback(callbackOptions);
                    }
                    if (req.method === 'GET'
                        && element.priv_tab_id === tabID
                        && routeFound === false) {
                        routeFound = true;
                        return callback(callbackOptions);
                    }
                    if (req.method !== 'GET'
                        && element.priv_tab_id === tabID
                        && element.management_permission === 1
                         && routeFound === false
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


var actionGetPeopleTab = function (options) {
    let { req, res, next } = options;
    let tabID = req.params.tabID;
    let querySQL = '';
    let places = [];
    querySQL = querySQL
                + 'SELECT private_documents_permissions.*, people.name'
                + ' FROM private_documents_permissions'
                + ' JOIN people ON people.id = private_documents_permissions.person_id'
                + ' WHERE private_documents_permissions.priv_tab_id = ?'
                + ' AND private_documents_permissions.permission_active = 1;';
    places.push(tabID)
    return sql.makeSQLOperation(req, res, querySQL, places);
}

module.exports.getTabPeoplePermissions = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => { actionGetPeopleTab(options) },
        { req, res, next }
    );
};

var actionAddPersonTab = function (options) {
    /*TODO*/
    let { req, res, next } = options;
    let tabID = req.params.tabID;
    let data = req.body.data;
    let querySQL = '';
    let places = [];
    querySQL = querySQL
                + 'INSERT INTO private_documents_permissions'
                + ' (person_id, priv_tab_id, management_permission, permission_active)'
                + ' VALUES (?,?,?,1)';
    places.push(data.person_id, data.tab_id, data.management_permission)
    return sql.makeSQLOperation(req, res, querySQL, places);
}

module.exports.addPersonTab = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => { actionAddPersonTab(options) },
        { req, res, next }
    );
};


var actionUpdatePersonTab = function (options) {
    let { req, res, next } = options;
    let tabID = req.params.tabID;
    let otherPersonID = req.params.otherPersonID;
    let data = req.body.data;
    let querySQL = '';
    let places = [];
    querySQL = querySQL
                + 'UPDATE private_documents_permissions'
                + ' SET permission_active = ?, management_permission = ?'
                + ' WHERE id = ?;';
    places.push(data.tab_permission, data.management_permission, data.id)
    return sql.makeSQLOperation(req, res, querySQL, places);
}

module.exports.updatePersonTab = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => { actionUpdatePersonTab(options) },
        { req, res, next }
    );
};


var actionDeletePersonTab = function (options) {
    /* Probably not necessary */
}

module.exports.deletePersonTab = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => { actionDeletePersonTab(options) },
        { req, res, next }
    );
};

var actionAddTab = function (options) {
    let { req, res, next } = options;
    let data = req.body.data;
    let querySQL = '';
    let places = [];
    querySQL = querySQL
                + 'INSERT INTO private_documents_tabs'
                + ' (unit_id, tab_name, tab_path, visible, sort_order)'
                + ' VALUES (?,?,?,1,?)';
    places.push(data.unit_id, data.tab_name, data.tab_path, data.sort_order)
    return sql.makeSQLOperation(req, res, querySQL, places);
}

module.exports.addTab = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => { actionAddTab(options) },
        { req, res, next }
    );
};

var actionUpdateTab = function (options) {
    let { req, res, next } = options;
    let tabID = req.params.tabID;
    let data = req.body.data;
    let querySQL = '';
    let places = [];
    querySQL = querySQL
                + 'UPDATE private_documents_tabs'
                + ' SET tab_name = ?, tab_path = ?, sort_order = ?'
                + ' WHERE id = ?';
    places.push(data.tab_name, data.tab_path, data.sort_order, tabID)
    return sql.makeSQLOperation(req, res, querySQL, places);
}

module.exports.updateTab = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => { actionUpdateTab(options) },
        { req, res, next }
    );
};

var actionGetTabInfo = function (options) {
    let { req, res, next } = options;
    let tabID = req.params.tabID;
    let data = req.body.data;
    let querySQL = '';
    let places = [];
    querySQL = querySQL
                + 'SELECT private_documents_sections.id AS section_id, private_documents_groups.id AS group_id, private_documents.id AS doc_id'
                + ' FROM private_documents_sections'
                + ' JOIN private_documents_groups ON private_documents_groups.section_id = private_documents_sections.id'
                + ' JOIN private_documents ON private_documents.group_id = private_documents_groups.id'
                + ' WHERE private_documents_sections.priv_tab_id = ?;';
    places.push(tabID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.info = resQuery;
            if (resQuery.length > 0) {
                options.i = 0
                return deleteTabDocs(options);
            } else {
                return deleteTabPermissions(options);
            }


        },
        options);
}

var deleteTabDocs = function (options) {
    let { req, res, next, info, i } = options;
    let tabID = req.params.tabID;
    let querySQL = '';
    let places = [];
    querySQL = querySQL
                + 'DELETE FROM private_documents'
                + ' WHERE id = ?;';
    places.push(info[i].doc_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < info.length) {
                options.i = i + 1;
                return deleteTabDocs(options);
            } else {
                options.i = 0;
                return deleteTabGroups(options);
            }
        },
        options);
}
var deleteTabGroups = function (options) {
    let { req, res, next, info, i } = options;
    let tabID = req.params.tabID;
    let querySQL = '';
    let places = [];
    querySQL = querySQL
                + 'DELETE FROM private_documents_groups'
                + ' WHERE id = ?;';
    places.push(info[i].group_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < info.length) {
                options.i = i + 1;
                return deleteTabGroups(options);
            } else {
                options.i = 0;
                return deleteTabSections(options);
            }
        },
        options);
}
var deleteTabSections = function (options) {
    let { req, res, next, info, i } = options;
    let tabID = req.params.tabID;
    let querySQL = '';
    let places = [];
    querySQL = querySQL
                + 'DELETE FROM private_documents_sections'
                + ' WHERE id = ?;';
    places.push(info[i].section_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (i + 1 < info.length) {
                options.i = i + 1;
                return deleteTabSections(options);
            } else {
                return deleteTabPermissions(options);
            }
        },
        options);
}
var deleteTabPermissions = function (options) {
    let { req, res, next } = options;
    let tabID = req.params.tabID;
    let querySQL = '';
    let places = [];
    querySQL = querySQL
                + 'DELETE FROM private_documents_permissions'
                + ' WHERE priv_tab_id = ?;';
    places.push(tabID)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            return deleteTabFinal(options);
        },
        options);
}
var deleteTabFinal = function (options) {
    let { req, res, next } = options;
    let tabID = req.params.tabID;
    let querySQL = '';
    let places = [];
    querySQL = querySQL
                + 'DELETE FROM private_documents_tabs'
                + ' WHERE id = ?;';
    places.push(tabID)
    return sql.makeSQLOperation(req, res, querySQL, places);
}
module.exports.deleteTab = function (req, res, next) {
    checkPermissionsPrivateDocs(
        (options) => {
            // need to:
            // 1. get the documents, groups and sections related to tab
            // 2. delete documents related to those groups
            // 3. delete groups related to those sections
            // 4. delete sections related to tab
            // 5. delete the permissions related to tab
            // 6. delete tab
            return actionGetTabInfo(options)
        },
        { req, res, next }
    );
};