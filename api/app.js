require('dotenv').config()
var express = require('express');

//var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var routesPublicLegacyAPI = require('./routes/indexPublicLegacy');
var routesPublicLegacyAPI_LAQV = require('./routes/indexPublicLegacy_LAQV');
var routesPublicAPI = require('./routes/indexPublic'); //includes Applicant submission
var routesAPIPeople = require('./routes/indexPeople');
var routesAPILabs = require('./routes/indexLabs');
var routesAPIManagers = require('./routes/indexManager');
var routesAPIAdmins = require('./routes/indexAdmins');
var routesAPIAreas = require('./routes/indexUnitAreas');
var routesAPIPreRegister = require('./routes/indexPreRegister');
var routesAPIApplications = require('./routes/indexApplications');
var routesAPIApplicationsLAQV = require('./routes/indexApplicationsLAQV');
var routesAPIPolls = require('./routes/indexPolls');
var routesAPIAuth = require('./routes/indexAuth');

var app = express();


app.use(logger(':date[iso] - :method :url :status :response-time ms - :res[content-length]'));
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Public API routes
app.use('/api/v1', routesPublicLegacyAPI);
app.use('/api/v1.1', routesPublicLegacyAPI_LAQV);
app.use('/api/v2', routesPublicAPI);
// Internal API routes below
app.use('/api/people', routesAPIPeople);
app.use('/api/labs', routesAPILabs);
// TODO: create API routes for facilities, science mngmt offices and administrative
app.use('/api/managers', routesAPIManagers);
app.use('/api/admins', routesAPIAdmins);
app.use('/api/unit-areas', routesAPIAreas);
app.use('/api/pre-register/people', routesAPIPreRegister);
app.use('/api/calls', routesAPIApplications); // for UCIBIO
app.use('/api/polls', routesAPIPolls);
app.use('/api/laqv/calls', routesAPIApplicationsLAQV);
app.use('/api', routesAPIAuth);

module.exports = app;
