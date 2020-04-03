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

const membersAll = require('../controllers/manager/all/members');
const membersUnit = require('../controllers/manager/unit/members');
const membersUnitCity = require('../controllers/manager/unit_city/members');
const membersCity = require('../controllers/manager/city/members');
const nuclearInformation = require('../controllers/people/nuclear_information');
const managePermissionsUnit = require('../controllers/manager/unit/manage_permissions');
const manageAppAreaPermissionsUnit = require('../controllers/manager/unit/manage_app_area_permissions');

//router.get('/:userID/units/:unitID/cities/:cityID', cors(corsOptions), membersUnitCity.getUnitCityInfo);
//router.get('/:userID/cities/:cityID', cors(corsOptions), membersCity.getCityInfo);
router.get('/:userID/units/:unitID/', cors(corsOptions), membersUnit.getUnitInfo);
// when unsegmented there's no additional info to retrieve (no specific city/unit)

router.get('/:userID/units/:unitID/cities/:cityID/current-members', cors(corsOptions), membersUnitCity.getMembersList);
router.get('/:userID/cities/:cityID/current-members', cors(corsOptions), membersCity.getMembersList);

// routes for manager with access to a single whole unit
router.get('/:userID/units/:unitID/current-members', cors(corsOptions), membersUnit.getMembersList);
router.get('/:userID/units/:unitID/past-members', cors(corsOptions), membersUnit.getPastMembersList);
router.get('/:userID/units/:unitID/members/:personID/nuclear-info', cors(corsOptions), nuclearInformation.getNuclearInfo);
router.get('/:userID/units/:unitID/members/:personID/nationalities', cors(corsOptions), nuclearInformation.getNationalities);
router.put('/:userID/units/:unitID/members/:personID/nuclear-info', cors(corsOptions), nuclearInformation.updateNuclearInfo);
router.put('/:userID/units/:unitID/members/:personID/nationalities', cors(corsOptions), nuclearInformation.changeNationalities);

router.get('/:userID/units/:unitID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.getPermissions);
router.post('/:userID/units/:unitID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.createPermissions);
router.put('/:userID/units/:unitID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.updatePermissions);
router.delete('/:userID/units/:unitID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.deletePermissions);

router.get('/:userID/units/:unitID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.getPermissions);
router.post('/:userID/units/:unitID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.createPermissions);
router.put('/:userID/units/:unitID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.updatePermissions);
router.delete('/:userID/units/:unitID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.deletePermissions);


router.get('/:userID/current-members', cors(corsOptions), membersAll.getMembersList);



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