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

const unitDocs = require('../controllers/unit_areas/unitDocs');
const unitCityDocs = require('../controllers/unit_areas/unitCityDocs');

router.get('/:unitID/documents/tabs/:tabID', cors(corsOptions), unitDocs.getDocs);
router.post('/:unitID/documents', cors(corsOptions), unitDocs.createDoc); //only if has permission
router.put('/:unitID/documents/:docID', cors(corsOptions), unitDocs.updateDoc); //only if has permission
router.delete('/:unitID/documents/:docID', cors(corsOptions), unitDocs.deleteDoc); //only if has permission

router.get('/:unitID/cities/:cityID/documents/tabs/:tabID', cors(corsOptions), unitCityDocs.getDocs);
router.post('/:unitID/cities/:cityID/documents', cors(corsOptions), unitCityDocs.createDoc); //only if has permission
router.put('/:unitID/cities/:cityID/documents/:docID', cors(corsOptions), unitCityDocs.updateDoc); //only if has permission
router.delete('/:unitID/cities/:cityID/documents/:docID', cors(corsOptions), unitCityDocs.deleteDoc); //only if has permission

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
