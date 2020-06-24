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
const photo = require('../controllers/people/photo');
const personalContacts = require('../controllers/people/personal_contacts');
const emergencyContacts = require('../controllers/people/emergency_contacts');
const identifications = require('../controllers/people/identifications');
const cars = require('../controllers/people/cars');
const degrees = require('../controllers/people/degrees');
const institutionalContacts = require('../controllers/people/institutional_contacts');
const institutionalAffiliations = require('../controllers/people/institutional_affiliations');
const institutionalResponsibles = require('../controllers/people/institutional_responsibles');
const researchIDs = require('../controllers/people/research_IDs');
const academicAffiliations = require('../controllers/people/academic_affiliations');

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
router.get('/:userID/units/:unitID/members/:personID/photos/:imageType', cors(corsOptions), photo.getPhoto);
router.put('/:userID/units/:unitID/members/:personID/photos/:imageType', cors(corsOptions), photo.uploadPhoto);
    // Personal Contacts
router.get('/:userID/units/:unitID/members/:personID/personal-address', cors(corsOptions), personalContacts.getPersonalAddress);
router.post('/:userID/units/:unitID/members/:personID/personal-address', cors(corsOptions), personalContacts.createPersonalAddress);
router.put('/:userID/units/:unitID/members/:personID/personal-address/:addressID', cors(corsOptions), personalContacts.updatePersonalAddress);
router.get('/:userID/units/:unitID/members/:personID/personal-phone', cors(corsOptions), personalContacts.getPersonalPhone);
router.post('/:userID/units/:unitID/members/:personID/personal-phone', cors(corsOptions), personalContacts.createPersonalPhone);
router.put('/:userID/units/:unitID/members/:personID/personal-phone/:phoneID', cors(corsOptions), personalContacts.updatePersonalPhone);
router.get('/:userID/units/:unitID/members/:personID/personal-email', cors(corsOptions), personalContacts.getPersonalEmail);
router.post('/:userID/units/:unitID/members/:personID/personal-email', cors(corsOptions), personalContacts.createPersonalEmail);
router.put('/:userID/units/:unitID/members/:personID/personal-email/:emailID', cors(corsOptions), personalContacts.updatePersonalEmail);
router.get('/:userID/units/:unitID/members/:personID/emergency-contacts', cors(corsOptions), emergencyContacts.getEmergencyContacts);
router.post('/:userID/units/:unitID/members/:personID/emergency-contacts', cors(corsOptions), emergencyContacts.createEmergencyContact);
router.put('/:userID/units/:unitID/members/:personID/emergency-contacts/:contactID', cors(corsOptions), emergencyContacts.updateEmergencyContact);
router.delete('/:userID/units/:unitID/members/:personID/emergency-contacts/:contactID', cors(corsOptions), emergencyContacts.deleteEmergencyContact);
router.get('/:userID/units/:unitID/members/:personID/identifications', cors(corsOptions), identifications.getIdentifications);
router.post('/:userID/units/:unitID/members/:personID/identifications', cors(corsOptions), identifications.createIdentification);
router.put('/:userID/units/:unitID/members/:personID/identifications/:identificationID', cors(corsOptions), identifications.updateIdentification);
router.delete('/:userID/units/:unitID/members/:personID/identifications/:identificationID', cors(corsOptions), identifications.deleteIdentification);
router.get('/:userID/units/:unitID/members/:personID/cars', cors(corsOptions), cars.getCars);
router.post('/:userID/units/:unitID/members/:personID/cars', cors(corsOptions), cars.createCar);
router.put('/:userID/units/:unitID/members/:personID/cars/:carID', cors(corsOptions), cars.updateCar);
router.delete('/:userID/units/:unitID/members/:personID/cars/:carID', cors(corsOptions), cars.deleteCar);
router.post('/:userID/units/:unitID/members/:personID/cars-message', cors(corsOptions), cars.sendChangeMessage);
//Degrees (degreeID is the id on the degrees_people table)
router.get('/:userID/units/:unitID/members/:personID/degrees', cors(corsOptions), degrees.getDegrees);
router.put('/:userID/units/:unitID/members/:personID/degrees/:degreeID', cors(corsOptions), degrees.updateDegrees);
router.delete('/:userID/units/:unitID/members/:personID/degrees/:degreeID', cors(corsOptions), degrees.deleteDegrees);
router.post('/:userID/units/:unitID/members/:personID/degrees', cors(corsOptions), degrees.createDegrees);
// Affiliations: user can't change his/hers affiliations, only managers can do that (poleID is the people_institution_city table ID)
router.get('/:userID/units/:unitID/members/:personID/poles', cors(corsOptions), institutionalAffiliations.getPoles);
router.post('/:userID/units/:unitID/members/:personID/poles', cors(corsOptions), institutionalAffiliations.createPole);
router.put('/:userID/units/:unitID/members/:personID/poles/:poleID', cors(corsOptions), institutionalAffiliations.updatePole);
router.delete('/:userID/units/:unitID/members/:personID/poles/:poleID', cors(corsOptions), institutionalAffiliations.deletePole);

router.get('/:userID/units/:unitID/members/:personID/roles', cors(corsOptions), institutionalAffiliations.getRoles);
router.post('/:userID/units/:unitID/members/:personID/roles', cors(corsOptions), institutionalAffiliations.createRole);
router.delete('/:userID/units/:unitID/members/:personID/roles', cors(corsOptions), institutionalAffiliations.deleteRoles); // before changing delete all roles of this person

router.get('/:userID/units/:unitID/members/:personID/lab-affiliations', cors(corsOptions), institutionalAffiliations.getLabAffiliations);
router.post('/:userID/units/:unitID/members/:personID/lab-affiliations', cors(corsOptions), institutionalAffiliations.createLabAffiliation);
router.put('/:userID/units/:unitID/members/:personID/lab-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateLabAffiliation);
router.delete('/:userID/units/:unitID/members/:personID/lab-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteLabAffiliation);

router.get('/:userID/units/:unitID/members/:personID/technical-affiliations', cors(corsOptions), institutionalAffiliations.getTechnicalAffiliations);
router.post('/:userID/units/:unitID/members/:personID/technical-affiliations', cors(corsOptions), institutionalAffiliations.createTechnicalAffiliation);
router.put('/:userID/units/:unitID/members/:personID/technical-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateTechnicalAffiliation);
router.delete('/:userID/units/:unitID/members/:personID/technical-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteTechnicalAffiliation);

router.get('/:userID/units/:unitID/members/:personID/science-management-affiliations', cors(corsOptions), institutionalAffiliations.getScienceManagementAffiliations);
router.post('/:userID/units/:unitID/members/:personID/science-management-affiliations', cors(corsOptions), institutionalAffiliations.createScienceManagementAffiliation);
router.put('/:userID/units/:unitID/members/:personID/science-management-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateScienceManagementAffiliation);
router.delete('/:userID/units/:unitID/members/:personID/science-management-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteScienceManagementAffiliation);

router.get('/:userID/units/:unitID/members/:personID/administrative-affiliations', cors(corsOptions), institutionalAffiliations.getAdministrativeAffiliations);
router.post('/:userID/units/:unitID/members/:personID/administrative-affiliations', cors(corsOptions), institutionalAffiliations.createAdministrativeAffiliation);
router.put('/:userID/units/:unitID/members/:personID/administrative-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateAdministrativeAffiliation);
router.delete('/:userID/units/:unitID/members/:personID/administrative-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteAdministrativeAffiliation);

router.get('/:userID/units/:unitID/members/:personID/responsibles', cors(corsOptions), institutionalResponsibles.getResponsibles);
router.post('/:userID/units/:unitID/members/:personID/responsibles', cors(corsOptions), institutionalResponsibles.createResponsibles);
router.put('/:userID/units/:unitID/members/:personID/responsibles/:peopleResponsibleID', cors(corsOptions), institutionalResponsibles.updateResponsibles);
router.delete('/:userID/units/:unitID/members/:personID/responsibles/:peopleResponsibleID', cors(corsOptions), institutionalResponsibles.deleteResponsibles);

router.get('/:userID/units/:unitID/members/:personID/institutional-phone', cors(corsOptions), institutionalContacts.getInstitutionalPhone);
router.put('/:userID/units/:unitID/members/:personID/institutional-phone/:phoneID', cors(corsOptions), institutionalContacts.updateInstitutionalPhone);
router.post('/:userID/units/:unitID/members/:personID/institutional-phone', cors(corsOptions), institutionalContacts.createInstitutionalPhone);
router.get('/:userID/units/:unitID/members/:personID/institutional-email', cors(corsOptions), institutionalContacts.getInstitutionalEmail);
router.put('/:userID/units/:unitID/members/:personID/institutional-email/:emailID', cors(corsOptions), institutionalContacts.updateInstitutionalEmail);
router.post('/:userID/units/:unitID/members/:personID/institutional-email', cors(corsOptions), institutionalContacts.createInstitutionalEmail);
router.get('/:userID/units/:unitID/members/:personID/academic-affiliations', cors(corsOptions), academicAffiliations.getAcademicAffiliations);
router.post('/:userID/units/:unitID/members/:personID/academic-affiliations', cors(corsOptions), academicAffiliations.createAcademicAffiliations);
router.put('/:userID/units/:unitID/members/:personID/academic-affiliations/:affiliationID', cors(corsOptions), academicAffiliations.updateAcademicAffiliations);
router.delete('/:userID/units/:unitID/members/:personID/academic-affiliations/:affiliationID', cors(corsOptions), academicAffiliations.deleteAcademicAffiliations);

router.get('/:userID/units/:unitID/members/:personID/researcher-ids', cors(corsOptions), researchIDs.getResearcherIDs);
router.post('/:userID/units/:unitID/members/:personID/researcher-ids', cors(corsOptions), researchIDs.createResearcherIDs);
router.put('/:userID/units/:unitID/members/:personID/researcher-ids/:researcherInfoID', cors(corsOptions), researchIDs.updateResearcherIDs);



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