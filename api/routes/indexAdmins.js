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

const messaging = require('../controllers/admin/messaging');
const contacts = require('../controllers/admin/contacts');
const emailDefinitions = require('../controllers/admin/email_definitions');

router.post('/messages', cors(corsOptions), messaging.adminSendMessageAll);
// get all messages currently in server
router.get('/messages', cors(corsOptions), messaging.getServerMessages);
// clears messages (server or also in the client)
router.delete('/messages', cors(corsOptions), messaging.adminMessagesClear);

router.get('/:personID/bugs', cors(corsOptions), contacts.getBugs);
router.get('/:personID/suggestions', cors(corsOptions), contacts.getSuggestions);
//router.post('/:personID/user-contacts', cors(corsOptions), contacts.createContact);
router.put('/:personID/user-contacts/:contactID', cors(corsOptions), contacts.updateContact);

router.get('/:personID/recipient-groups', cors(corsOptions), emailDefinitions.getRecipientGroups);
router.post('/:personID/recipient-groups', cors(corsOptions), emailDefinitions.createRecipientGroup);
router.put('/:personID/recipient-groups/:recipientGroupID', cors(corsOptions), emailDefinitions.updateRecipientGroup);
router.delete('/:personID/recipient-groups/:recipientGroupID', cors(corsOptions), emailDefinitions.deleteRecipientGroup);



//router.put('/:personID/recipient-groups/:recipientGroupID/recipients/:recipientID', cors(corsOptions), emailDefinitions.getRecipientGroups);
//router.post('/:personID/recipient-groups/:recipientGroupID/recipients', cors(corsOptions), emailDefinitions.getRecipientGroups);
//router.delete('/:personID/recipient-groups/:recipientGroupID/recipients/:recipientID', cors(corsOptions), emailDefinitions.getRecipientGroups);


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