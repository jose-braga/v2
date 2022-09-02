var express = require('express');
var jwt = require('express-jwt');
var cors = require('cors')
var router = express.Router();

var corsOptions = {
  origin: '*',
}

router.options('*', cors())

var calls = require('../controllers/calls/calls');
var lists = require('../controllers/lists/lists');
var people = require('../controllers/public_API/people');
const birthdays = require('../controllers/public_API/birthdays');
const yearlyNotifications = require('../controllers/public_API/yearly_notifications');

router.post('/people-todays-birthdays', cors(corsOptions), birthdays.getBirthdayPeople);
router.post('/people-yearly-notifications', cors(corsOptions), yearlyNotifications.getActivePeople);

router.get('/calls/:callSegment', cors(corsOptions), calls.getCallInfo);
router.post('/calls/:callSegment/applications', cors(corsOptions), calls.createApplication);
router.post('/calls/:callSegment/applications/:applicationID/documents', cors(corsOptions), calls.uploadApplicationDocuments);
router.post('/calls/:callSegment/applications/:applicationID/scores', cors(corsOptions), calls.computeScores);
router.post('/calls/:callSegment/applications/:applicationID/email-applicant', cors(corsOptions), calls.emailApplicant);
router.put('/calls/:callSegment/applications/:applicationID', cors(corsOptions), calls.updateApplication);
router.delete('/calls/:callSegment/applications/:applicationID/documents', cors(corsOptions), calls.deleteApplicationDocuments); //to delete previous information in DB
router.put('/calls/:callSegment/applications/:applicationID/scores', cors(corsOptions), calls.updateComputeScores);
router.put('/calls/:callSegment/applications/:applicationID/email-applicant', cors(corsOptions), calls.emailApplicantUpdate);

// Public API requests
router.get('/people', cors(corsOptions), people.searchPeople);
router.get('/people/:personID', cors(corsOptions), people.getPersonInfo);
router.get('/people/:personID/publications', cors(corsOptions), people.getPersonPublications);


// this must be in the end if there are going to be other public routes
router.get('/:listCategory', cors(corsOptions), lists.listItems);
router.get('/laqv/:listCategory', cors(corsOptions), lists.listItems);

module.exports = router;
