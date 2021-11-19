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

const recommendations = require('../controllers/calls/recommendations');
const reviewers = require('../controllers/calls/reviewers');
const managers = require('../controllers/calls/managers');

router.get('/:callID/applications/:applicationID/recommenders/:recommenderID/questions', cors(corsOptions), recommendations.getQuestions);
router.post('/:callID/applications/:applicationID/recommenders/:recommenderID', cors(corsOptions), recommendations.writeRecommenderAnswers);

router.get('/reviewers/:reviewerID', cors(corsOptions), reviewers.getCalls);
router.get('/:callSegment/applications/reviewers/:reviewerID', cors(corsOptions), reviewers.getCallApplications);
router.get('/:callSegment/applications/:applicationID/reviewers/:reviewerID', cors(corsOptions), reviewers.getApplicationInfo);
router.post('/:callSegment/applications/:applicationID/reviewers/:reviewerID/scores', cors(corsOptions), reviewers.createScores);
router.put('/:callSegment/applications/:applicationID/reviewers/:reviewerID/tag-reviewed', cors(corsOptions), reviewers.updateTagReviewed);
router.post('/:callSegment/applications/:applicationID/reviewers/:reviewerID/tag-reviewed', cors(corsOptions), reviewers.createTagReviewed);

router.get('/call-managers/:personID', cors(corsOptions), managers.getCalls);
router.put('/call-managers/:personID'
            + '/applications/:applicationID'
            , cors(corsOptions), managers.updateApplicationReviewers);
router.get('/:callSegment/applications/call-managers/:personID', cors(corsOptions), managers.getCallApplications);


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