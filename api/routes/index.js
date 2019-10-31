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
  origin: process.env.CORS_ORIGIN,
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

// Nuclear information (TODO: improve its RESTfulness)
router.get('/people/:personID/nuclear-info', cors(corsOptions), nuclearInformation.getNuclearInfo);
router.put('/people/:personID/nuclear-info', cors(corsOptions), nuclearInformation.updateNuclearInfo);
router.get('/people/:personID/nationalities', cors(corsOptions), nuclearInformation.getNationalities);
router.put('/people/:personID/nationalities', cors(corsOptions), nuclearInformation.changeNationalities);

// Photo
router.put('/people/:personID/photos/:imageType', cors(corsOptions), photo.uploadPhoto);
router.get('/people/:personID/photos/:imageType', cors(corsOptions), photo.getPhoto);

//Degrees (degreeID is the id on the degrees_people table)
router.get('/people/:personID/degrees', cors(corsOptions), degrees.getDegrees);
router.put('/people/:personID/degrees/:degreeID', cors(corsOptions), degrees.updateDegrees);
router.delete('/people/:personID/degrees/:degreeID', cors(corsOptions), degrees.deleteDegrees);
router.post('/people/:personID/degrees', cors(corsOptions), degrees.createDegrees);

/**
 * Team Routes
 */
var members = require('../controllers/team/members');
router.get('/labs/:labID', cors(corsOptions), members.getLabInfo);
router.get('/labs/:labID/members-affiliation', cors(corsOptions), members.getLabMembersAffiliations); // get team members, regardless of group to belongs now or belonged in the past
router.delete('/labs/:labID/members-affiliation/:memberID', cors(corsOptions), members.deleteLabMember); //remove this member from team
router.post('/labs/:labID/members-affiliation/:memberID/position', cors(corsOptions), members.createLabMemberPosition); // add new position to this member
router.put('/labs/:labID/members-affiliation/:memberID/position/:positionID', cors(corsOptions), members.updateLabMemberPosition); // update this member team position
router.delete('/labs/:labID/members-affiliation/:memberID/position/:positionID', cors(corsOptions), members.deleteLabMemberPosition); // delete this members position

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
