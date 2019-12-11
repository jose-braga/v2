var express = require('express');
var cors = require('cors')
var router = express.Router();

var corsOptions = {
  origin: '*',
}

router.options('*', cors())

var lists = require('../controllers/lists/lists');

// this must be in the end if there are going to be other public routes
router.get('/:listCategory', cors(corsOptions), lists.listItems);

module.exports = router;
