var express = require('express');
var cors = require('cors')
var router = express.Router();

var corsOptions = {
  origin: process.env.CORS_ORIGIN,
}

router.options('*', cors())

var lists = require('../controllers/lists/lists');

router.get('/:listCategory', cors(corsOptions), lists.listItems);

module.exports = router;
