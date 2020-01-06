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
const externalAPI = require('../controllers/people/external_api'); //authorization of visibility to external partners

const nuclearInformation = require('../controllers/people/nuclear_information');
const personalContacts = require('../controllers/people/personal_contacts');
const photo = require('../controllers/people/photo');
const degrees = require('../controllers/people/degrees');
const institutionalContacts = require('../controllers/people/institutional_contacts');
const institutionalAffiliations = require('../controllers/people/institutional_affiliations');

router.get('/:personID/external-api-authorization', cors(corsOptions), externalAPI.getAuthorization);
router.put('/:personID/external-api-authorization', cors(corsOptions), externalAPI.updateAuthorization);
// Nuclear information (TODO: improve its RESTfulness (specialluy for nationalities))
router.get('/:personID/nuclear-info', cors(corsOptions), nuclearInformation.getNuclearInfo);
router.put('/:personID/nuclear-info', cors(corsOptions), nuclearInformation.updateNuclearInfo);
router.get('/:personID/nationalities', cors(corsOptions), nuclearInformation.getNationalities);
// Personal Contacts
router.get('/:personID/personal-address', cors(corsOptions), personalContacts.getPersonalAddress);
router.post('/:personID/personal-address', cors(corsOptions), personalContacts.createPersonalAddress);
router.put('/:personID/personal-address/:addressID', cors(corsOptions), personalContacts.updatePersonalAddress);
router.get('/:personID/personal-phone', cors(corsOptions), personalContacts.getPersonalPhone);
router.post('/:personID/personal-phone', cors(corsOptions), personalContacts.createPersonalPhone);
router.put('/:personID/personal-phone/:phoneID', cors(corsOptions), personalContacts.updatePersonalPhone);
router.get('/:personID/personal-email', cors(corsOptions), personalContacts.getPersonalEmail);
router.post('/:personID/personal-email', cors(corsOptions), personalContacts.createPersonalEmail);
router.put('/:personID/personal-email/:emailID', cors(corsOptions), personalContacts.updatePersonalEmail);

// Photo (TODO: improve its RESTfulness)
router.put('/:personID/photos/:imageType', cors(corsOptions), photo.uploadPhoto);
router.get('/:personID/photos/:imageType', cors(corsOptions), photo.getPhoto);

//Degrees (degreeID is the id on the degrees_people table)
router.get('/:personID/degrees', cors(corsOptions), degrees.getDegrees);
router.put('/:personID/degrees/:degreeID', cors(corsOptions), degrees.updateDegrees);
router.delete('/:personID/degrees/:degreeID', cors(corsOptions), degrees.deleteDegrees);
router.post('/:personID/degrees', cors(corsOptions), degrees.createDegrees);

// Institutional settings
router.get('/:personID/institutional-phone', cors(corsOptions), institutionalContacts.getInstitutionalPhone);
router.put('/:personID/institutional-phone/:phoneID', cors(corsOptions), institutionalContacts.updateInstitutionalPhone);
router.post('/:personID/institutional-phone', cors(corsOptions), institutionalContacts.createInstitutionalPhone);
router.get('/:personID/institutional-email', cors(corsOptions), institutionalContacts.getInstitutionalEmail);
router.put('/:personID/institutional-email/:emailID', cors(corsOptions), institutionalContacts.updateInstitutionalEmail);
router.post('/:personID/institutional-email', cors(corsOptions), institutionalContacts.createInstitutionalEmail);
// user can't change his/hers affiliations, only managers can do that
router.post('/:personID/affiliation-message', cors(corsOptions), institutionalAffiliations.sendChangeMessage);
router.get('/:personID/poles', cors(corsOptions), institutionalAffiliations.getPoles);
router.get('/:personID/roles', cors(corsOptions), institutionalAffiliations.getRoles);
router.get('/:personID/lab-affiliations', cors(corsOptions), institutionalAffiliations.getLabAffiliations);
router.get('/:personID/technical-affiliations', cors(corsOptions), institutionalAffiliations.getTechnicalAffiliations);
router.get('/:personID/science-management-affiliations', cors(corsOptions), institutionalAffiliations.getScienceManagementAffiliations);
router.get('/:personID/administrative-affiliations', cors(corsOptions), institutionalAffiliations.getAdministrativeAffiliations);


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
