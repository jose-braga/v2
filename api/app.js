require('dotenv').config()
var express = require('express');

//var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var routesPublicAPI = require('./routes/indexPublic');
var routesAPIPeople = require('./routes/indexPeople');
var routesAPILabs = require('./routes/indexLabs');
var routesAPIManagers = require('./routes/indexManager');
var routesAPIAuth = require('./routes/indexAuth');

var app = express();


app.use(logger(':date[iso] - :method :url :status :response-time ms - :res[content-length]'));
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Public API routes
app.use('/api/v2', routesPublicAPI);
// Interal API routes below
app.use('/api/people', routesAPIPeople);
app.use('/api/labs', routesAPILabs);
app.use('/api/managers', routesAPIManagers);

app.use('/api', routesAPIAuth);

module.exports = app;
