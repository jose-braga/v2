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
const members = require('../controllers/department_team/members');
const publications = require('../controllers/department_team/publications');
const spaces = require('../controllers/department_team/spaces');

router.get('/:depTeamID', cors(corsOptions), members.getDepartmentTeamInfo);
//router.get('/:depTeamID/people', cors(corsOptions), members.searchAllPeople);
//router.post('/:depTeamID/people', cors(corsOptions), members.preRegister); // pre-register new member
router.get('/:depTeamID/members-affiliation', cors(corsOptions), members.getLabMembersAffiliations); // get team members, regardless of group to belongs now or belonged in the past
router.delete('/:depTeamID/members-affiliation/:memberID', cors(corsOptions), members.deleteLabMember); //remove this member from team
router.post('/:depTeamID/members-affiliation/:memberID/position', cors(corsOptions), members.createLabMemberPosition); // add new position to this member
router.put('/:depTeamID/members-affiliation/:memberID/position/:positionID', cors(corsOptions), members.updateLabMemberPosition); // update this member team position
router.delete('/:depTeamID/members-affiliation/:memberID/position/:positionID', cors(corsOptions), members.deleteLabMemberPosition); // delete this members position

//Publications
//router.get('/:depTeamID/publications', cors(corsOptions), publications.getTeamPublications); // these are the team publications
//router.post('/:depTeamID/publications', cors(corsOptions), publications.associateTeamPublication); // simply associates publication to lab
//router.put('/:depTeamID/publications/:publicationID', cors(corsOptions), publications.updateTeamPublication); // update association state of publication
//router.delete('/:depTeamID/publications/:publicationID', cors(corsOptions), publications.dissociateTeamPublication); // simply removes association to lab
//router.get('/:depTeamID/members-publications', cors(corsOptions), publications.getMembersPublications); // these are the publications reported by team members

//Spaces
router.get('/:depTeamID/spaces', cors(corsOptions), spaces.getLabSpaces);
router.post('/:depTeamID/spaces', cors(corsOptions), spaces.addLabSpaces);
router.get('/:depTeamID/spaces/:spaceID', cors(corsOptions), spaces.getSpaceInfo);
router.put('/:depTeamID/spaces/:spaceID', cors(corsOptions), spaces.updateLabSpace);
router.delete('/:depTeamID/spaces/:labSpaceID', cors(corsOptions), spaces.deleteLabSpace);



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
