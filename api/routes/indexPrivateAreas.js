var express = require('express');
var { expressjwt: jwt } = require("express-jwt");
var cors = require('cors')
var router = express.Router();

var auth = jwt({
  algorithms: ['HS256'],
  secret: process.env.JWT_SECRET,
  requestProperty: 'payload'
});

router.use(auth);

var corsOptions = {
  origin: process.env.CORS_ORIGIN,
}

router.options('*', cors())

const privateDocs = require('../controllers/private_areas/privateDocs');

router.get('/:personID/permissions', cors(corsOptions), privateDocs.getPermissionsList);
router.get('/:personID/tabs/:tabID/sections',
  cors(corsOptions), privateDocs.getSections);
router.get('/:personID/tabs/:tabID/sections/:sectionID/groups',
  cors(corsOptions), privateDocs.getGroups);
router.get('/:personID/tabs/:tabID/sections/:sectionID/groups/:groupID/documents',
  cors(corsOptions), privateDocs.getDocuments);

router.get('/:personID/tabs/:tabID/sections/:sectionID/groups/:groupID/documents/:docName/download',
  cors(corsOptions), privateDocs.downloadDocument);

router.post('/:personID/tabs/:tabID/sections/:sectionID/groups/:groupID/documents-info/',
  cors(corsOptions), privateDocs.createDocumentsDBEntries);
router.post('/:personID/tabs/:tabID/sections/:sectionID/groups/:groupID/documents/',
  cors(corsOptions), privateDocs.uploadDocuments);

router.put('/:personID/tabs/:tabID/sections/:sectionID/groups/:groupID',
  cors(corsOptions), privateDocs.updateGroup);
router.put('/:personID/tabs/:tabID/sections/:sectionID',
  cors(corsOptions), privateDocs.updateSection);

router.put('/:personID/tabs/:tabID/sections/:sectionID/groups/:groupID/documents/:docID',
  cors(corsOptions), privateDocs.updateDocument);
router.delete('/:personID/tabs/:tabID/sections/:sectionID/groups/:groupID/documents/:docID',
  cors(corsOptions), privateDocs.deleteDocument);

router.get('/:personID/tabs/:tabID/people', cors(corsOptions), privateDocs.getTabPeoplePermissions);
router.post('/:personID/tabs/:tabID/people', cors(corsOptions), privateDocs.addPersonTab);
router.put('/:personID/tabs/:tabID/people/:otherPersonID', cors(corsOptions), privateDocs.updatePersonTab);
router.delete('/:personID/tabs/:tabID/people/:otherPersonID', cors(corsOptions), privateDocs.deletePersonTab);


router.post('/:personID/tabs', cors(corsOptions), privateDocs.addTab);
router.put('/:personID/tabs/:tabID', cors(corsOptions), privateDocs.updateTab);
router.delete('/:personID/tabs/:tabID', cors(corsOptions), privateDocs.deleteTab);


//router.get('/:unitID/documents/tabs/:tabID', cors(corsOptions), unitDocs.getDocs);

//router.put('/:unitID/documents/:docID', cors(corsOptions), unitDocs.updateDoc); //only if has permission
//router.delete('/:unitID/documents/:docID', cors(corsOptions), unitDocs.deleteDoc); //only if has permission

router.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
router.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.json({"message": "Route not found or other problem."});
  });

  module.exports = router;
