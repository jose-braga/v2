var express = require('express');
var cors = require('cors')
var router = express.Router();

var corsOptions = {
  origin: '*',
}

router.options('*', cors())

var people = require('../controllers/public_API/people_legacy');
var lab = require('../controllers/public_API/lab_legacy');
var publication = require('../controllers/public_API/publications_legacy');

// Public API requests
router.get('/person', cors(corsOptions), people.searchPeople);
router.get('/person/:personID', cors(corsOptions), people.getPersonInfo);

router.get('/group/:groupID', cors(corsOptions), lab.getGroupInfo);
router.get('/lab/:labID', cors(corsOptions), lab.getLabInfo);
router.get('/group/:groupID/lab/:labID/members', cors(corsOptions), lab.getLabMembers);
router.get('/facility/:facilityID/members', cors(corsOptions), lab.getFacilityMembers);
router.get('/science-management/:officeID/members', cors(corsOptions), lab.getScienceManagementMembers);
router.get('/administrative/:officeID/members', cors(corsOptions), lab.getAdministrativeMembers);


router.get('/publication/:pubID', cors(corsOptions), publication.getPublicationInfo);
router.get('/publication/person/:personID', cors(corsOptions), publication.getPersonPublications);
router.get('/publication/group/:groupID/lab/:labID', cors(corsOptions), publication.getLabPublications);
router.get('/publication/group/:groupID', cors(corsOptions), publication.getGroupPublications);
router.get('/publication/unit/:unitID', cors(corsOptions), publication.getUnitPublications);
router.get('/publication/unit/:unitID/latest', cors(corsOptions), publication.getLatestUnitPublications);

module.exports = router;
