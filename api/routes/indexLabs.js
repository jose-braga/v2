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
 * Team Routes
 */
const members = require('../controllers/team/members');
const publications = require('../controllers/team/publications');
const spaces = require('../controllers/team/spaces');

router.get('/:labID', cors(corsOptions), members.getLabInfo);
router.get('/:labID/people', cors(corsOptions), members.searchAllPeople);
router.post('/:labID/people', cors(corsOptions), members.preRegister); // pre-register new member
router.get('/:labID/members-affiliation', cors(corsOptions), members.getLabMembersAffiliations); // get team members, regardless of group to belongs now or belonged in the past
router.delete('/:labID/members-affiliation/:memberID', cors(corsOptions), members.deleteLabMember); //remove this member from team
router.post('/:labID/members-affiliation/:memberID/position', cors(corsOptions), members.createLabMemberPosition); // add new position to this member
router.put('/:labID/members-affiliation/:memberID/position/:positionID', cors(corsOptions), members.updateLabMemberPosition); // update this member team position
router.delete('/:labID/members-affiliation/:memberID/position/:positionID', cors(corsOptions), members.deleteLabMemberPosition); // delete this members position

//Publications
router.get('/:labID/publications', cors(corsOptions), publications.getTeamPublications); // these are the team publications
router.post('/:labID/publications', cors(corsOptions), publications.associateTeamPublication); // simply associates publication to lab
router.put('/:labID/publications/:publicationID', cors(corsOptions), publications.updateTeamPublication); // update association state of publication
router.delete('/:labID/publications/:publicationID', cors(corsOptions), publications.dissociateTeamPublication); // simply removes association to lab
router.get('/:labID/members-publications', cors(corsOptions), publications.getMembersPublications); // these are the publications reported by team members

//Spaces
router.get('/:labID/spaces', cors(corsOptions), spaces.getLabSpaces);
router.post('/:labID/spaces', cors(corsOptions), spaces.addLabSpaces);
router.get('/:labID/spaces/:spaceID', cors(corsOptions), spaces.getSpaceInfo);
router.put('/:labID/spaces/:spaceID', cors(corsOptions), spaces.updateLabSpace);
router.delete('/:labID/spaces/:labSpaceID', cors(corsOptions), spaces.deleteLabSpace);



router.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
router.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({"message": err});
    //res.json({"message": "Route not found or other problem."});
});

module.exports = router;
