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
var people = require('../controllers/public_API/people');

router.get('/calls/:callSegment', cors(corsOptions), calls.getCallInfo);
router.post('/calls/:callSegment/applications', cors(corsOptions), calls.createApplication);
router.post('/calls/:callSegment/applications/:applicationID/documents', cors(corsOptions), calls.uploadApplicationDocuments);
router.post('/calls/:callSegment/applications/:applicationID/scores', cors(corsOptions), calls.computeScores);
router.put('/calls/:callSegment/applications/:applicationID', cors(corsOptions), calls.updateApplication);
router.delete('/calls/:callSegment/applications/:applicationID/documents', cors(corsOptions), calls.deleteApplicationDocuments); //to delete previous information in DB
router.put('/calls/:callSegment/applications/:applicationID/scores', cors(corsOptions), calls.updateComputeScores);

// Public API requests
router.get('/people', cors(corsOptions), people.searchPeople);
router.get('/people/:personID', cors(corsOptions), people.getPersonInfo);
router.get('/people/:personID/publications', cors(corsOptions), people.getPersonPublications);





// this must be in the end if there are going to be other public routes
router.get('/:listCategory', cors(corsOptions), lists.listItems);

module.exports = router;
