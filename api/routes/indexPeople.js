var express = require('express');
var jwt = require('express-jwt');
var cors = require('cors')
var router = express.Router();


var auth = jwt({
  secret: process.env.JWT_SECRET,
  requestProperty: 'payload'
});

router.use(auth);

var corsOptions = {
  origin: process.env.CORS_ORIGIN,
}

router.options('*', cors())

/**
 * Person Routes
 */
var externalAPI = require('../controllers/people/external_api');
var nuclearInformation = require('../controllers/people/nuclear_information');
var photo = require('../controllers/people/photo');
var degrees = require('../controllers/people/degrees');

// Nuclear information (TODO: improve its RESTfulness)
router.get('/:personID/external-api-authorization', cors(corsOptions), externalAPI.getAuthorization);
router.put('/:personID/external-api-authorization', cors(corsOptions), externalAPI.updateAuthorization);
router.get('/:personID/nuclear-info', cors(corsOptions), nuclearInformation.getNuclearInfo);
router.put('/:personID/nuclear-info', cors(corsOptions), nuclearInformation.updateNuclearInfo);
router.get('/:personID/nationalities', cors(corsOptions), nuclearInformation.getNationalities);
router.put('/:personID/nationalities', cors(corsOptions), nuclearInformation.changeNationalities);

// Photo
router.put('/:personID/photos/:imageType', cors(corsOptions), photo.uploadPhoto);
router.get('/:personID/photos/:imageType', cors(corsOptions), photo.getPhoto);

//Degrees (degreeID is the id on the degrees_people table)
router.get('/:personID/degrees', cors(corsOptions), degrees.getDegrees);
router.put('/:personID/degrees/:degreeID', cors(corsOptions), degrees.updateDegrees);
router.delete('/:personID/degrees/:degreeID', cors(corsOptions), degrees.deleteDegrees);
router.post('/:personID/degrees', cors(corsOptions), degrees.createDegrees);

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
