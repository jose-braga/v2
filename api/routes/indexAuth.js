var express = require('express');
var cors = require('cors')
var router = express.Router();

var corsOptions = {
  origin: process.env.CORS_ORIGIN,
}

router.options('*', cors())

var authentication = require('../controllers/authentication/authentication');
// authentication routes
router.post('/login', cors(corsOptions), authentication.login);
router.post('/pre-registration-login', cors(corsOptions), authentication.preRegistrationLogin);
// TODO: (Applications submission) create authentication routes for applicants,
//  recommenders, reviewers and responsibles
router.put('/change-password/:userID', cors(corsOptions), authentication.changePassword);

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
