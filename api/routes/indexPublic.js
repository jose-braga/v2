var express = require('express');
var jwt = require('express-jwt');
var cors = require('cors')
var router = express.Router();


var auth = jwt({
  secret: process.env.JWT_SECRET,
  requestProperty: 'payload'
});
router.use(auth
    .unless(
        function(req) {
            if (!req.originalUrl.includes('/reviewer/')
                    && !req.originalUrl.includes('/recommender/')) {
                return true;
            } else {
                return false;
            }
        }
    )
);



var corsOptions = {
  origin: '*',
}

router.options('*', cors())

var calls = require('../controllers/calls/calls');
var lists = require('../controllers/lists/lists');

router.get('/calls/:callID', cors(corsOptions), calls.getCallInfo);


// this must be in the end if there are going to be other public routes
router.get('/:listCategory', cors(corsOptions), lists.listItems);

module.exports = router;
