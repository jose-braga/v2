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

const recommendations = require('../controllers/calls/recommendations');

router.get('/:callID/applications/:applicationID/recommenders/:recommenderID/questions', cors(corsOptions), recommendations.getQuestions);
router.post('/:callID/applications/:applicationID/recommenders/:recommenderID', cors(corsOptions), recommendations.writeRecommenderAnswers);

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