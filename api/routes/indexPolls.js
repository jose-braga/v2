var express = require('express');
var jwt = require('express-jwt');
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

const polls_manage = require('../controllers/polls/polls_manage');
const polls_vote = require('../controllers/polls/polls_vote');

// to vote
router.get('/people/:personID', cors(corsOptions), polls_vote.getPollsList);
router.get('/:pollID/people/:personID', cors(corsOptions), polls_vote.getPollData);
router.post('/:pollID/people/:personID', cors(corsOptions), polls_vote.writeUserVote);

// specific to vote management
router.get('/managers/:managerID', cors(corsOptions), polls_manage.getPollsList);
router.post('/managers/:managerID', cors(corsOptions), polls_manage.createPoll);
router.get('/:pollID/managers/:managerID', cors(corsOptions), polls_manage.getPollInfo);
router.put('/:pollID/managers/:managerID', cors(corsOptions), polls_manage.updatePollSettings);
router.delete('/:pollID/managers/:managerID', cors(corsOptions), polls_manage.deletePoll);

router.post('/:pollID/managers/:managerID/questions', cors(corsOptions), polls_manage.addNewQuestion);
router.put('/:pollID/managers/:managerID/questions/:questionID', cors(corsOptions), polls_manage.updateQuestion);
router.delete('/:pollID/managers/:managerID/questions/:questionID', cors(corsOptions), polls_manage.deleteQuestion);
router.post('/:pollID/managers/:managerID/questions/:questionID/options', cors(corsOptions), polls_manage.addNewQuestionOption);
router.put('/:pollID/managers/:managerID/questions/:questionID/options/:optionID', cors(corsOptions), polls_manage.updateQuestionOption);
router.delete('/:pollID/managers/:managerID/questions/:questionID/options/:optionID', cors(corsOptions), polls_manage.deleteQuestionOption);


router.post('/:pollID/managers/:managerID/texts', cors(corsOptions), polls_manage.addNewText);
router.put('/:pollID/managers/:managerID/texts/:textID', cors(corsOptions), polls_manage.updateText);
router.delete('/:pollID/managers/:managerID/texts/:textID', cors(corsOptions), polls_manage.deleteText);

router.get('/:pollID/managers/:managerID/people-list', cors(corsOptions), polls_manage.getPeopleList);
router.get('/:pollID/managers/:managerID/people', cors(corsOptions), polls_manage.getPeoplePoll);
router.post('/:pollID/managers/:managerID/people', cors(corsOptions), polls_manage.addUserPoll);
router.delete('/:pollID/managers/:managerID/people/:personID', cors(corsOptions), polls_manage.deleteUserPoll);



router.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
router.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({ "message": "Route not found or other problem." });
});

module.exports = router;