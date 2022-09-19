var express = require('express');
var cors = require('cors')
var router = express.Router();

var corsOptions = {
  origin: '*',
}

router.options('*', cors())

var people = require('../controllers/public_API/people_legacy_laqv');
var lab = require('../controllers/public_API/lab_legacy_laqv');
var publication = require('../controllers/public_API/publications_legacy_laqv');

// Public API requests
router.post('/login', cors(corsOptions), people.login);
router.get('/people/:personID', cors(corsOptions), people.getPersonInfo);
router.get('/people', people.searchPeople);

router.get('/groups', lab.getGroupsList);
router.get('/groups/:groupID', lab.getGroupInfo);
router.get('/groups/:groupID/people', lab.getGroupMembers);

router.get('/facilities', lab.getFacilitiesList);
router.get('/facilities/:officeID/people', lab.getFacilityMembers);
router.get('/science-management-offices', lab.getScienceManagementOfficesList);
router.get('/science-management-offices/:officeID/people', lab.getScienceManagementOfficeMembers);
router.get('/administrative-offices', lab.getAdministrativeOfficesList);
router.get('/administrative-offices/:officeID/people', lab.getAdministrativeOfficeMembers);

router.get('/publications/:pubID', cors(corsOptions), publication.getPublicationInfo);
router.get('/people/:personID/publications', cors(corsOptions), publication.getPersonPublications);
router.get('/groups/:groupID/publications', cors(corsOptions), publication.getGroupPublications);

module.exports = router;
