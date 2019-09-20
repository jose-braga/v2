var express = require('express');
var jwt = require('express-jwt');
var cors = require('cors')
var router = express.Router();

 
var auth = jwt({
  secret: process.env.JWT_SECRET,
  requestProperty: 'payload'
}).unless({path: ['/api/login']}); // path must be given relative to root

router.use(auth);

var corsOptions = {
  origin: 'http://localhost:8080',
}

router.options('*', cors())



/**
 * Person Routes
 */

var nuclearInformation = require('../controllers/people/nuclear_information');
var photo = require('../controllers/people/photo');
var degrees = require('../controllers/people/degrees');
var authentication = require('../controllers/authentication/authentication');

// authentication routes
router.post('/login', cors(corsOptions), authentication.login);
router.put('/change-password/:userID', cors(corsOptions), authentication.changePassword);

// Nuclear information
router.get('/people/:personID/nuclear-info', cors(corsOptions), nuclearInformation.getNuclearInfo);
router.put('/people/:personID/nuclear-info', cors(corsOptions), nuclearInformation.updateNuclearInfo);
router.get('/people/:personID/nationalities', cors(corsOptions), nuclearInformation.getNationalities);
router.put('/people/:personID/nationalities', cors(corsOptions), nuclearInformation.changeNationalities);

// Photo
router.post('/people/:personID/photo/:imageType', cors(corsOptions), photo.uploadPhoto);
router.get('/people/:personID/photo/:imageType', cors(corsOptions), photo.getPhoto);

//Degrees (degreeID is the id on the degrees_people table)
router.get('/people/:personID/degrees', cors(corsOptions), degrees.getDegrees);
router.put('/people/:personID/degrees/:degreeID', cors(corsOptions), degrees.updateDegrees);
router.delete('/people/:personID/degrees/:degreeID', cors(corsOptions), degrees.deleteDegrees);
router.post('/people/:personID/degrees', cors(corsOptions), degrees.createDegrees);

/**
 * Team Routes
 */
var members = require('../controllers/team/members');

router.get('/team/:labID', cors(corsOptions), members.getMembers);


module.exports = router;
