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

const preRegister = require('../controllers/pre_registration/pre_registration');
const personalContacts = require('../controllers/people/personal_contacts');

// don't forget to add routes for technicians, administrative and science managers
router.get('/:personID/labs', cors(corsOptions), preRegister.getPersonLabs);
router.get('/:personID/personal-email', cors(corsOptions), personalContacts.getPersonalEmail);
router.put('/:personID', cors(corsOptions), preRegister.preRegister);

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