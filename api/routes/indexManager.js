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

const addMember = require('../controllers/manager/addMember');
const membersAll = require('../controllers/manager/all/members');
const membersUnit = require('../controllers/manager/unit/members');
const membersUnitValidate = require('../controllers/manager/unit/members_validate');
const membersUnitCity = require('../controllers/manager/unit_city/members');
const membersCity = require('../controllers/manager/city/members');
const users = require('../controllers/people/users');
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
const professionalSituations = require('../controllers/people/professional_situations');
const publicationsList = require('../controllers/people/publications_list');
const addPublications = require('../controllers/people/add_publications');
const addPubORCID = require('../controllers/people/add_pub_ORCID');
const addPubRepository = require('../controllers/people/add_pub_repository');


const managePermissionsUnit = require('../controllers/manager/unit/manage_permissions');
const manageAppAreaPermissionsUnit = require('../controllers/manager/unit/manage_app_area_permissions');

router.get('/:userID/units/:unitID/cities/:cityID', cors(corsOptions), membersUnitCity.getUnitCityInfo);
router.get('/:userID/cities/:cityID', cors(corsOptions), membersCity.getCityInfo);
router.get('/:userID/units/:unitID/', cors(corsOptions), membersUnit.getUnitInfo);
// when unsegmented there's no additional info to retrieve (no specific city/unit)

// Manager adds new member
router.post('/:userID/units/:unitID/cities/:cityID/members', cors(corsOptions), addMember.addMember);
router.post('/:userID/cities/:cityID/members', cors(corsOptions), addMember.addMember);
router.post('/:userID/units/:unitID/members', cors(corsOptions), addMember.addMember);


/* Units & Cities*/
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/users/:username', cors(corsOptions), users.checkUserExistence);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/users', cors(corsOptions), users.getUsername);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/users/:userID', cors(corsOptions), users.updateUsername);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/password/:userID', cors(corsOptions), users.updatePassword);
// routes for manager with access to
router.get('/:userID/units/:unitID/cities/:cityID/validate-members', cors(corsOptions), membersUnitValidate.getMembersList);
router.put('/:userID/units/:unitID/cities/:cityID/validate-members/:personID', cors(corsOptions), membersUnitValidate.validateRegistration);
router.get('/:userID/units/:unitID/cities/:cityID/current-members', cors(corsOptions), membersUnitCity.getMembersList);
router.get('/:userID/units/:unitID/cities/:cityID/past-members', cors(corsOptions), membersUnitCity.getPastMembersList);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/nuclear-info', cors(corsOptions), nuclearInformation.getNuclearInfo);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/nuclear-info', cors(corsOptions), nuclearInformation.updateNuclearInfo);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/nationalities', cors(corsOptions), nuclearInformation.getNationalities);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/nationalities', cors(corsOptions), nuclearInformation.changeNationalities);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/photos/:imageType', cors(corsOptions), photo.getPhoto);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/photos/:imageType', cors(corsOptions), photo.uploadPhoto);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/personal-address', cors(corsOptions), personalContacts.getPersonalAddress);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/personal-address', cors(corsOptions), personalContacts.createPersonalAddress);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/personal-address/:addressID', cors(corsOptions), personalContacts.updatePersonalAddress);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/personal-phone', cors(corsOptions), personalContacts.getPersonalPhone);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/personal-phone', cors(corsOptions), personalContacts.createPersonalPhone);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/personal-phone/:phoneID', cors(corsOptions), personalContacts.updatePersonalPhone);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/personal-email', cors(corsOptions), personalContacts.getPersonalEmail);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/personal-email', cors(corsOptions), personalContacts.createPersonalEmail);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/personal-email/:emailID', cors(corsOptions), personalContacts.updatePersonalEmail);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/emergency-contacts', cors(corsOptions), emergencyContacts.getEmergencyContacts);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/emergency-contacts', cors(corsOptions), emergencyContacts.createEmergencyContact);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/emergency-contacts/:contactID', cors(corsOptions), emergencyContacts.updateEmergencyContact);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/emergency-contacts/:contactID', cors(corsOptions), emergencyContacts.deleteEmergencyContact);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/identifications', cors(corsOptions), identifications.getIdentifications);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/identifications', cors(corsOptions), identifications.createIdentification);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/identifications/:identificationID', cors(corsOptions), identifications.updateIdentification);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/identifications/:identificationID', cors(corsOptions), identifications.deleteIdentification);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/cars', cors(corsOptions), cars.getCars);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/cars', cors(corsOptions), cars.createCar);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/cars/:carID', cors(corsOptions), cars.updateCar);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/cars/:carID', cors(corsOptions), cars.deleteCar);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/cars-message', cors(corsOptions), cars.sendChangeMessage);
//Degrees (degreeID is the id on the degrees_people table)
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/degrees', cors(corsOptions), degrees.getDegrees);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/degrees/:degreeID', cors(corsOptions), degrees.updateDegrees);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/degrees/:degreeID', cors(corsOptions), degrees.deleteDegrees);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/degrees', cors(corsOptions), degrees.createDegrees);
// Affiliations: user can't change his/hers affiliations, only managers can do that (poleID is the people_institution_city table ID)
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/poles', cors(corsOptions), institutionalAffiliations.getPoles);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/poles', cors(corsOptions), institutionalAffiliations.createPole);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/poles/:poleID', cors(corsOptions), institutionalAffiliations.updatePole);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/poles/:poleID', cors(corsOptions), institutionalAffiliations.deletePole);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/roles', cors(corsOptions), institutionalAffiliations.getRoles);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/roles', cors(corsOptions), institutionalAffiliations.createRole);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/roles', cors(corsOptions), institutionalAffiliations.deleteRoles); // before changing delete all roles of this person
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/lab-affiliations', cors(corsOptions), institutionalAffiliations.getLabAffiliations);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/lab-affiliations', cors(corsOptions), institutionalAffiliations.createLabAffiliation);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/lab-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateLabAffiliation);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/lab-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteLabAffiliation);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/technical-affiliations', cors(corsOptions), institutionalAffiliations.getTechnicalAffiliations);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/technical-affiliations', cors(corsOptions), institutionalAffiliations.createTechnicalAffiliation);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/technical-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateTechnicalAffiliation);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/technical-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteTechnicalAffiliation);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/science-management-affiliations', cors(corsOptions), institutionalAffiliations.getScienceManagementAffiliations);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/science-management-affiliations', cors(corsOptions), institutionalAffiliations.createScienceManagementAffiliation);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/science-management-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateScienceManagementAffiliation);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/science-management-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteScienceManagementAffiliation);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/administrative-affiliations', cors(corsOptions), institutionalAffiliations.getAdministrativeAffiliations);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/administrative-affiliations', cors(corsOptions), institutionalAffiliations.createAdministrativeAffiliation);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/administrative-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateAdministrativeAffiliation);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/administrative-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteAdministrativeAffiliation);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/responsibles', cors(corsOptions), institutionalResponsibles.getResponsibles);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/responsibles', cors(corsOptions), institutionalResponsibles.createResponsibles);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/responsibles/:peopleResponsibleID', cors(corsOptions), institutionalResponsibles.updateResponsibles);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/responsibles/:peopleResponsibleID', cors(corsOptions), institutionalResponsibles.deleteResponsibles);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/institutional-phone', cors(corsOptions), institutionalContacts.getInstitutionalPhone);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/institutional-phone/:phoneID', cors(corsOptions), institutionalContacts.updateInstitutionalPhone);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/institutional-phone', cors(corsOptions), institutionalContacts.createInstitutionalPhone);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/institutional-email', cors(corsOptions), institutionalContacts.getInstitutionalEmail);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/institutional-email/:emailID', cors(corsOptions), institutionalContacts.updateInstitutionalEmail);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/institutional-email', cors(corsOptions), institutionalContacts.createInstitutionalEmail);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/academic-affiliations', cors(corsOptions), academicAffiliations.getAcademicAffiliations);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/academic-affiliations', cors(corsOptions), academicAffiliations.createAcademicAffiliations);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/academic-affiliations/:affiliationID', cors(corsOptions), academicAffiliations.updateAcademicAffiliations);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/academic-affiliations/:affiliationID', cors(corsOptions), academicAffiliations.deleteAcademicAffiliations);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/researcher-ids', cors(corsOptions), researchIDs.getResearcherIDs);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/researcher-ids', cors(corsOptions), researchIDs.createResearcherIDs);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/researcher-ids/:researcherInfoID', cors(corsOptions), researchIDs.updateResearcherIDs);
// Professional Situations
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/professional-situations', cors(corsOptions), professionalSituations.getProfessionalSituations);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/professional-situations', cors(corsOptions), professionalSituations.createProfessionalSituations);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/professional-situations/:jobID', cors(corsOptions), professionalSituations.updateProfessionalSituations);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/professional-situations/:jobID', cors(corsOptions), professionalSituations.deleteProfessionalSituations);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/professional-situations/:jobID/fellowships', cors(corsOptions), professionalSituations.createProfessionalSituationsFellowships);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/professional-situations/:jobID/fellowships/:fellowshipID', cors(corsOptions), professionalSituations.updateProfessionalSituationsFellowships);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/professional-situations/:jobID/fellowships/:fellowshipID', cors(corsOptions), professionalSituations.deleteProfessionalSituationsFellowships);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/professional-situations/:jobID/contracts', cors(corsOptions), professionalSituations.createProfessionalSituationsContracts);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/professional-situations/:jobID/contracts/:contractID', cors(corsOptions), professionalSituations.updateProfessionalSituationsContracts);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/professional-situations/:jobID/contracts/:contractID', cors(corsOptions), professionalSituations.deleteProfessionalSituationsContracts);
//Publications
router.get('/:userID/units/:unitID/cities/:cityID/members/all-publications', cors(corsOptions), publicationsList.getAllPublications);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/publications', cors(corsOptions), publicationsList.getPublications);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/pure-publications', cors(corsOptions), addPubRepository.getPUREPublications);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/people-publications/:publicationID', cors(corsOptions), addPublications.createPersonPublicationAssociation);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/people-publications/:publicationID', cors(corsOptions), publicationsList.updatePersonPublicationAssociation);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/people-publications/:publicationID', cors(corsOptions), publicationsList.deletePersonPublicationAssociation);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/publications/:publicationID', cors(corsOptions), publicationsList.updatePublication);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/journals', cors(corsOptions), addPubORCID.createJournal);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/journals/:journalID/publications', cors(corsOptions), addPubORCID.createPublication);
//Permissions
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.getPermissions);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.createPermissions);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.updatePermissions);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.deletePermissions);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.getPermissions);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.createPermissions);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.updatePermissions);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.deletePermissions);




/* Cities*/
router.get('/:userID/cities/:cityID/members/:personID/users/:username', cors(corsOptions), users.checkUserExistence);
router.get('/:userID/cities/:cityID/members/:personID/users', cors(corsOptions), users.getUsername);
router.put('/:userID/cities/:cityID/members/:personID/users/:userID', cors(corsOptions), users.updateUsername);
router.put('/:userID/cities/:cityID/members/:personID/password/:userID', cors(corsOptions), users.updatePassword);
// routes for manager with access to
router.get('/:userID/cities/:cityID/validate-members', cors(corsOptions), membersUnitValidate.getMembersList);
router.put('/:userID/cities/:cityID/validate-members/:personID', cors(corsOptions), membersUnitValidate.validateRegistration);
router.get('/:userID/cities/:cityID/current-members', cors(corsOptions), membersCity.getMembersList);
router.get('/:userID/cities/:cityID/past-members', cors(corsOptions), membersCity.getPastMembersList);
router.get('/:userID/cities/:cityID/members/:personID/nuclear-info', cors(corsOptions), nuclearInformation.getNuclearInfo);
router.put('/:userID/cities/:cityID/members/:personID/nuclear-info', cors(corsOptions), nuclearInformation.updateNuclearInfo);
router.get('/:userID/cities/:cityID/members/:personID/nationalities', cors(corsOptions), nuclearInformation.getNationalities);
router.put('/:userID/cities/:cityID/members/:personID/nationalities', cors(corsOptions), nuclearInformation.changeNationalities);
router.get('/:userID/cities/:cityID/members/:personID/photos/:imageType', cors(corsOptions), photo.getPhoto);
router.put('/:userID/cities/:cityID/members/:personID/photos/:imageType', cors(corsOptions), photo.uploadPhoto);
router.get('/:userID/cities/:cityID/members/:personID/personal-address', cors(corsOptions), personalContacts.getPersonalAddress);
router.post('/:userID/cities/:cityID/members/:personID/personal-address', cors(corsOptions), personalContacts.createPersonalAddress);
router.put('/:userID/cities/:cityID/members/:personID/personal-address/:addressID', cors(corsOptions), personalContacts.updatePersonalAddress);
router.get('/:userID/cities/:cityID/members/:personID/personal-phone', cors(corsOptions), personalContacts.getPersonalPhone);
router.post('/:userID/cities/:cityID/members/:personID/personal-phone', cors(corsOptions), personalContacts.createPersonalPhone);
router.put('/:userID/cities/:cityID/members/:personID/personal-phone/:phoneID', cors(corsOptions), personalContacts.updatePersonalPhone);
router.get('/:userID/cities/:cityID/members/:personID/personal-email', cors(corsOptions), personalContacts.getPersonalEmail);
router.post('/:userID/cities/:cityID/members/:personID/personal-email', cors(corsOptions), personalContacts.createPersonalEmail);
router.put('/:userID/cities/:cityID/members/:personID/personal-email/:emailID', cors(corsOptions), personalContacts.updatePersonalEmail);
router.get('/:userID/cities/:cityID/members/:personID/emergency-contacts', cors(corsOptions), emergencyContacts.getEmergencyContacts);
router.post('/:userID/cities/:cityID/members/:personID/emergency-contacts', cors(corsOptions), emergencyContacts.createEmergencyContact);
router.put('/:userID/cities/:cityID/members/:personID/emergency-contacts/:contactID', cors(corsOptions), emergencyContacts.updateEmergencyContact);
router.delete('/:userID/cities/:cityID/members/:personID/emergency-contacts/:contactID', cors(corsOptions), emergencyContacts.deleteEmergencyContact);
router.get('/:userID/cities/:cityID/members/:personID/identifications', cors(corsOptions), identifications.getIdentifications);
router.post('/:userID/cities/:cityID/members/:personID/identifications', cors(corsOptions), identifications.createIdentification);
router.put('/:userID/cities/:cityID/members/:personID/identifications/:identificationID', cors(corsOptions), identifications.updateIdentification);
router.delete('/:userID/cities/:cityID/members/:personID/identifications/:identificationID', cors(corsOptions), identifications.deleteIdentification);
router.get('/:userID/cities/:cityID/members/:personID/cars', cors(corsOptions), cars.getCars);
router.post('/:userID/cities/:cityID/members/:personID/cars', cors(corsOptions), cars.createCar);
router.put('/:userID/cities/:cityID/members/:personID/cars/:carID', cors(corsOptions), cars.updateCar);
router.delete('/:userID/cities/:cityID/members/:personID/cars/:carID', cors(corsOptions), cars.deleteCar);
router.post('/:userID/cities/:cityID/members/:personID/cars-message', cors(corsOptions), cars.sendChangeMessage);
//Degrees (degreeID is the id on the degrees_people table)
router.get('/:userID/cities/:cityID/members/:personID/degrees', cors(corsOptions), degrees.getDegrees);
router.put('/:userID/cities/:cityID/members/:personID/degrees/:degreeID', cors(corsOptions), degrees.updateDegrees);
router.delete('/:userID/cities/:cityID/members/:personID/degrees/:degreeID', cors(corsOptions), degrees.deleteDegrees);
router.post('/:userID/cities/:cityID/members/:personID/degrees', cors(corsOptions), degrees.createDegrees);
// Affiliations: user can't change his/hers affiliations, only managers can do that (poleID is the people_institution_city table ID)
router.get('/:userID/cities/:cityID/members/:personID/poles', cors(corsOptions), institutionalAffiliations.getPoles);
router.post('/:userID/cities/:cityID/members/:personID/poles', cors(corsOptions), institutionalAffiliations.createPole);
router.put('/:userID/cities/:cityID/members/:personID/poles/:poleID', cors(corsOptions), institutionalAffiliations.updatePole);
router.delete('/:userID/cities/:cityID/members/:personID/poles/:poleID', cors(corsOptions), institutionalAffiliations.deletePole);
router.get('/:userID/cities/:cityID/members/:personID/roles', cors(corsOptions), institutionalAffiliations.getRoles);
router.post('/:userID/cities/:cityID/members/:personID/roles', cors(corsOptions), institutionalAffiliations.createRole);
router.delete('/:userID/cities/:cityID/members/:personID/roles', cors(corsOptions), institutionalAffiliations.deleteRoles); // before changing delete all roles of this person
router.get('/:userID/cities/:cityID/members/:personID/lab-affiliations', cors(corsOptions), institutionalAffiliations.getLabAffiliations);
router.post('/:userID/cities/:cityID/members/:personID/lab-affiliations', cors(corsOptions), institutionalAffiliations.createLabAffiliation);
router.put('/:userID/cities/:cityID/members/:personID/lab-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateLabAffiliation);
router.delete('/:userID/cities/:cityID/members/:personID/lab-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteLabAffiliation);
router.get('/:userID/cities/:cityID/members/:personID/technical-affiliations', cors(corsOptions), institutionalAffiliations.getTechnicalAffiliations);
router.post('/:userID/cities/:cityID/members/:personID/technical-affiliations', cors(corsOptions), institutionalAffiliations.createTechnicalAffiliation);
router.put('/:userID/cities/:cityID/members/:personID/technical-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateTechnicalAffiliation);
router.delete('/:userID/cities/:cityID/members/:personID/technical-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteTechnicalAffiliation);
router.get('/:userID/cities/:cityID/members/:personID/science-management-affiliations', cors(corsOptions), institutionalAffiliations.getScienceManagementAffiliations);
router.post('/:userID/cities/:cityID/members/:personID/science-management-affiliations', cors(corsOptions), institutionalAffiliations.createScienceManagementAffiliation);
router.put('/:userID/cities/:cityID/members/:personID/science-management-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateScienceManagementAffiliation);
router.delete('/:userID/cities/:cityID/members/:personID/science-management-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteScienceManagementAffiliation);
router.get('/:userID/cities/:cityID/members/:personID/administrative-affiliations', cors(corsOptions), institutionalAffiliations.getAdministrativeAffiliations);
router.post('/:userID/cities/:cityID/members/:personID/administrative-affiliations', cors(corsOptions), institutionalAffiliations.createAdministrativeAffiliation);
router.put('/:userID/cities/:cityID/members/:personID/administrative-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateAdministrativeAffiliation);
router.delete('/:userID/cities/:cityID/members/:personID/administrative-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteAdministrativeAffiliation);
router.get('/:userID/cities/:cityID/members/:personID/responsibles', cors(corsOptions), institutionalResponsibles.getResponsibles);
router.post('/:userID/cities/:cityID/members/:personID/responsibles', cors(corsOptions), institutionalResponsibles.createResponsibles);
router.put('/:userID/cities/:cityID/members/:personID/responsibles/:peopleResponsibleID', cors(corsOptions), institutionalResponsibles.updateResponsibles);
router.delete('/:userID/cities/:cityID/members/:personID/responsibles/:peopleResponsibleID', cors(corsOptions), institutionalResponsibles.deleteResponsibles);
router.get('/:userID/cities/:cityID/members/:personID/institutional-phone', cors(corsOptions), institutionalContacts.getInstitutionalPhone);
router.put('/:userID/cities/:cityID/members/:personID/institutional-phone/:phoneID', cors(corsOptions), institutionalContacts.updateInstitutionalPhone);
router.post('/:userID/cities/:cityID/members/:personID/institutional-phone', cors(corsOptions), institutionalContacts.createInstitutionalPhone);
router.get('/:userID/cities/:cityID/members/:personID/institutional-email', cors(corsOptions), institutionalContacts.getInstitutionalEmail);
router.put('/:userID/cities/:cityID/members/:personID/institutional-email/:emailID', cors(corsOptions), institutionalContacts.updateInstitutionalEmail);
router.post('/:userID/cities/:cityID/members/:personID/institutional-email', cors(corsOptions), institutionalContacts.createInstitutionalEmail);
router.get('/:userID/cities/:cityID/members/:personID/academic-affiliations', cors(corsOptions), academicAffiliations.getAcademicAffiliations);
router.post('/:userID/cities/:cityID/members/:personID/academic-affiliations', cors(corsOptions), academicAffiliations.createAcademicAffiliations);
router.put('/:userID/cities/:cityID/members/:personID/academic-affiliations/:affiliationID', cors(corsOptions), academicAffiliations.updateAcademicAffiliations);
router.delete('/:userID/cities/:cityID/members/:personID/academic-affiliations/:affiliationID', cors(corsOptions), academicAffiliations.deleteAcademicAffiliations);
router.get('/:userID/cities/:cityID/members/:personID/researcher-ids', cors(corsOptions), researchIDs.getResearcherIDs);
router.post('/:userID/cities/:cityID/members/:personID/researcher-ids', cors(corsOptions), researchIDs.createResearcherIDs);
router.put('/:userID/cities/:cityID/members/:personID/researcher-ids/:researcherInfoID', cors(corsOptions), researchIDs.updateResearcherIDs);
// Professional Situations
router.get('/:userID/cities/:cityID/members/:personID/professional-situations', cors(corsOptions), professionalSituations.getProfessionalSituations);
router.post('/:userID/cities/:cityID/members/:personID/professional-situations', cors(corsOptions), professionalSituations.createProfessionalSituations);
router.put('/:userID/cities/:cityID/members/:personID/professional-situations/:jobID', cors(corsOptions), professionalSituations.updateProfessionalSituations);
router.delete('/:userID/cities/:cityID/members/:personID/professional-situations/:jobID', cors(corsOptions), professionalSituations.deleteProfessionalSituations);
router.post('/:userID/cities/:cityID/members/:personID/professional-situations/:jobID/fellowships', cors(corsOptions), professionalSituations.createProfessionalSituationsFellowships);
router.put('/:userID/cities/:cityID/members/:personID/professional-situations/:jobID/fellowships/:fellowshipID', cors(corsOptions), professionalSituations.updateProfessionalSituationsFellowships);
router.delete('/:userID/cities/:cityID/members/:personID/professional-situations/:jobID/fellowships/:fellowshipID', cors(corsOptions), professionalSituations.deleteProfessionalSituationsFellowships);
router.post('/:userID/cities/:cityID/members/:personID/professional-situations/:jobID/contracts', cors(corsOptions), professionalSituations.createProfessionalSituationsContracts);
router.put('/:userID/cities/:cityID/members/:personID/professional-situations/:jobID/contracts/:contractID', cors(corsOptions), professionalSituations.updateProfessionalSituationsContracts);
router.delete('/:userID/cities/:cityID/members/:personID/professional-situations/:jobID/contracts/:contractID', cors(corsOptions), professionalSituations.deleteProfessionalSituationsContracts);
//Publications
router.get('/:userID/cities/:cityID/members/all-publications', cors(corsOptions), publicationsList.getAllPublications);
router.get('/:userID/cities/:cityID/members/:personID/publications', cors(corsOptions), publicationsList.getPublications);
router.get('/:userID/cities/:cityID/members/:personID/pure-publications', cors(corsOptions), addPubRepository.getPUREPublications);
router.post('/:userID/cities/:cityID/members/:personID/people-publications/:publicationID', cors(corsOptions), addPublications.createPersonPublicationAssociation);
router.put('/:userID/cities/:cityID/members/:personID/people-publications/:publicationID', cors(corsOptions), publicationsList.updatePersonPublicationAssociation);
router.delete('/:userID/cities/:cityID/members/:personID/people-publications/:publicationID', cors(corsOptions), publicationsList.deletePersonPublicationAssociation);
router.put('/:userID/cities/:cityID/members/:personID/publications/:publicationID', cors(corsOptions), publicationsList.updatePublication);
router.post('/:userID/cities/:cityID/members/:personID/journals', cors(corsOptions), addPubORCID.createJournal);
router.post('/:userID/cities/:cityID/members/:personID/journals/:journalID/publications', cors(corsOptions), addPubORCID.createPublication);
//Permissions
router.get('/:userID/cities/:cityID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.getPermissions);
router.post('/:userID/cities/:cityID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.createPermissions);
router.put('/:userID/cities/:cityID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.updatePermissions);
router.delete('/:userID/cities/:cityID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.deletePermissions);
router.get('/:userID/cities/:cityID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.getPermissions);
router.post('/:userID/cities/:cityID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.createPermissions);
router.put('/:userID/cities/:cityID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.updatePermissions);
router.delete('/:userID/cities/:cityID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.deletePermissions);






/* Units*/
router.get('/:userID/units/:unitID/members/:personID/users/:username', cors(corsOptions), users.checkUserExistence);
router.get('/:userID/units/:unitID/members/:personID/users', cors(corsOptions), users.getUsername);
router.put('/:userID/units/:unitID/members/:personID/users/:userID', cors(corsOptions), users.updateUsername);
router.put('/:userID/units/:unitID/members/:personID/password/:userID', cors(corsOptions), users.updatePassword);
    // routes for manager with access to a single whole unit
router.get('/:userID/units/:unitID/validate-members', cors(corsOptions), membersUnitValidate.getMembersList);
router.put('/:userID/units/:unitID/validate-members/:personID', cors(corsOptions), membersUnitValidate.validateRegistration);
router.get('/:userID/units/:unitID/current-members', cors(corsOptions), membersUnit.getMembersList);
router.get('/:userID/units/:unitID/past-members', cors(corsOptions), membersUnit.getPastMembersList);
router.get('/:userID/units/:unitID/members/:personID/nuclear-info', cors(corsOptions), nuclearInformation.getNuclearInfo);
router.put('/:userID/units/:unitID/members/:personID/nuclear-info', cors(corsOptions), nuclearInformation.updateNuclearInfo);
router.get('/:userID/units/:unitID/members/:personID/nationalities', cors(corsOptions), nuclearInformation.getNationalities);
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
    // Professional Situations
router.get('/:userID/units/:unitID/members/:personID/professional-situations', cors(corsOptions), professionalSituations.getProfessionalSituations);
router.post('/:userID/units/:unitID/members/:personID/professional-situations', cors(corsOptions), professionalSituations.createProfessionalSituations);
router.put('/:userID/units/:unitID/members/:personID/professional-situations/:jobID', cors(corsOptions), professionalSituations.updateProfessionalSituations);
router.delete('/:userID/units/:unitID/members/:personID/professional-situations/:jobID', cors(corsOptions), professionalSituations.deleteProfessionalSituations);
router.post('/:userID/units/:unitID/members/:personID/professional-situations/:jobID/fellowships', cors(corsOptions), professionalSituations.createProfessionalSituationsFellowships);
router.put('/:userID/units/:unitID/members/:personID/professional-situations/:jobID/fellowships/:fellowshipID', cors(corsOptions), professionalSituations.updateProfessionalSituationsFellowships);
router.delete('/:userID/units/:unitID/members/:personID/professional-situations/:jobID/fellowships/:fellowshipID', cors(corsOptions), professionalSituations.deleteProfessionalSituationsFellowships);
router.post('/:userID/units/:unitID/members/:personID/professional-situations/:jobID/contracts', cors(corsOptions), professionalSituations.createProfessionalSituationsContracts);
router.put('/:userID/units/:unitID/members/:personID/professional-situations/:jobID/contracts/:contractID', cors(corsOptions), professionalSituations.updateProfessionalSituationsContracts);
router.delete('/:userID/units/:unitID/members/:personID/professional-situations/:jobID/contracts/:contractID', cors(corsOptions), professionalSituations.deleteProfessionalSituationsContracts);
    //Publications
router.get('/:userID/units/:unitID/members/all-publications', cors(corsOptions), publicationsList.getAllPublications);
router.get('/:userID/units/:unitID/members/:personID/publications', cors(corsOptions), publicationsList.getPublications);
router.get('/:userID/units/:unitID/members/:personID/pure-publications', cors(corsOptions), addPubRepository.getPUREPublications);
router.post('/:userID/units/:unitID/members/:personID/people-publications/:publicationID', cors(corsOptions), addPublications.createPersonPublicationAssociation);
router.put('/:userID/units/:unitID/members/:personID/people-publications/:publicationID', cors(corsOptions), publicationsList.updatePersonPublicationAssociation);
router.delete('/:userID/units/:unitID/members/:personID/people-publications/:publicationID', cors(corsOptions), publicationsList.deletePersonPublicationAssociation);
router.put('/:userID/units/:unitID/members/:personID/publications/:publicationID', cors(corsOptions), publicationsList.updatePublication);
router.post('/:userID/units/:unitID/members/:personID/journals', cors(corsOptions), addPubORCID.createJournal);
router.post('/:userID/units/:unitID/members/:personID/journals/:journalID/publications', cors(corsOptions), addPubORCID.createPublication);
    //Permissions
router.get('/:userID/units/:unitID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.getPermissions);
router.post('/:userID/units/:unitID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.createPermissions);
router.put('/:userID/units/:unitID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.updatePermissions);
router.delete('/:userID/units/:unitID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.deletePermissions);
router.get('/:userID/units/:unitID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.getPermissions);
router.post('/:userID/units/:unitID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.createPermissions);
router.put('/:userID/units/:unitID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.updatePermissions);
router.delete('/:userID/units/:unitID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.deletePermissions);

/* All units at the same time */
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