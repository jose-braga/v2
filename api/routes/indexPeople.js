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

/**
 * Person Routes
 */
const externalAPI = require('../controllers/people/external_api'); //authorization of visibility to external partners
const informationEditors = require('../controllers/people/information_editors');
const academicAffiliations = require('../controllers/people/academic_affiliations');
const addPublications = require('../controllers/people/add_publications');
const addPubORCID = require('../controllers/people/add_pub_ORCID');
const addPubRepository = require('../controllers/people/add_pub_repository');
const authorNames = require('../controllers/people/author_names');
const cars = require('../controllers/people/cars');
const costCenters = require('../controllers/people/cost_centers');
const degrees = require('../controllers/people/degrees');
const emergencyContacts = require('../controllers/people/emergency_contacts');
const identifications = require('../controllers/people/identifications');
const institutionalContacts = require('../controllers/people/institutional_contacts');
const institutionalAffiliations = require('../controllers/people/institutional_affiliations');
const institutionalResponsibles = require('../controllers/people/institutional_responsibles');
const nuclearInformation = require('../controllers/people/nuclear_information');
const personalContacts = require('../controllers/people/personal_contacts');
const personalURLs = require('../controllers/people/personal_urls');
const photo = require('../controllers/people/photo');
const professionalSituations = require('../controllers/people/professional_situations');
const publicationsList = require('../controllers/people/publications_list');
const researchIDs = require('../controllers/people/research_IDs');
const researchInterests = require('../controllers/people/research_interests');
const store = require('../controllers/store/store');
const spaces = require('../controllers/people/spaces');
const labSpaces = require('../controllers/team/spaces');
const labInfo = require('../controllers/team/members');
const supervising = require('../controllers/people/supervising');
const manageUsers = require('../controllers/store/manage_users');
const manageOrders = require('../controllers/store/manage_orders');
const manageStock = require('../controllers/store/manage_stock');
const manageFinances = require('../controllers/store/manage_finances');
const websiteTexts = require('../controllers/people/website_texts');
const users = require('../controllers/people/users');

const permissions = require('../controllers/manager/unit/manage_permissions');
const preRegister = require('../controllers/team/members');

//remove lines below???
//var routesAPIUserOnBehalf = require('./routes/indexUserOnBehalf');
//router.use('/:personID/users-on-behalf', routesAPIUserOnBehalf)

router.get('/:personID/users/:username', cors(corsOptions), users.checkUserExistence);

router.get('/:personID/external-api-authorization', cors(corsOptions), externalAPI.getAuthorization);
router.put('/:personID/external-api-authorization', cors(corsOptions), externalAPI.updateAuthorization);
//Editors of your data
router.get('/:personID/information-editors', cors(corsOptions), informationEditors.getEditors);
router.post('/:personID/information-editors', cors(corsOptions), informationEditors.createEditor);
router.delete('/:personID/information-editors/:editorUserID', cors(corsOptions), informationEditors.deleteEditor);

// Nuclear information (TODO: improve its RESTfulness (specialluy for nationalities))
router.get('/:personID/nuclear-info', cors(corsOptions), nuclearInformation.getNuclearInfo);
router.put('/:personID/nuclear-info', cors(corsOptions), nuclearInformation.updateNuclearInfo);
router.get('/:personID/nationalities', cors(corsOptions), nuclearInformation.getNationalities);
router.put('/:personID/nationalities', cors(corsOptions), nuclearInformation.changeNationalities);
// Personal Contacts
router.get('/:personID/personal-address', cors(corsOptions), personalContacts.getPersonalAddress);
router.post('/:personID/personal-address', cors(corsOptions), personalContacts.createPersonalAddress);
router.put('/:personID/personal-address/:addressID', cors(corsOptions), personalContacts.updatePersonalAddress);
router.get('/:personID/personal-phone', cors(corsOptions), personalContacts.getPersonalPhone);
router.post('/:personID/personal-phone', cors(corsOptions), personalContacts.createPersonalPhone);
router.put('/:personID/personal-phone/:phoneID', cors(corsOptions), personalContacts.updatePersonalPhone);
router.get('/:personID/personal-email', cors(corsOptions), personalContacts.getPersonalEmail);
router.post('/:personID/personal-email', cors(corsOptions), personalContacts.createPersonalEmail);
router.put('/:personID/personal-email/:emailID', cors(corsOptions), personalContacts.updatePersonalEmail);
router.get('/:personID/emergency-contacts', cors(corsOptions), emergencyContacts.getEmergencyContacts);
router.post('/:personID/emergency-contacts', cors(corsOptions), emergencyContacts.createEmergencyContact);
router.put('/:personID/emergency-contacts/:contactID', cors(corsOptions), emergencyContacts.updateEmergencyContact);
router.delete('/:personID/emergency-contacts/:contactID', cors(corsOptions), emergencyContacts.deleteEmergencyContact);
router.get('/:personID/identifications', cors(corsOptions), identifications.getIdentifications);
router.post('/:personID/identifications', cors(corsOptions), identifications.createIdentification);
router.put('/:personID/identifications/:identificationID', cors(corsOptions), identifications.updateIdentification);
router.delete('/:personID/identifications/:identificationID', cors(corsOptions), identifications.deleteIdentification);
router.get('/:personID/cars', cors(corsOptions), cars.getCars);
router.post('/:personID/cars', cors(corsOptions), cars.createCar);
router.put('/:personID/cars/:carID', cors(corsOptions), cars.updateCar);
router.delete('/:personID/cars/:carID', cors(corsOptions), cars.deleteCar);
router.post('/:personID/cars-message', cors(corsOptions), cars.sendChangeMessage);
// Photo (TODO: improve its RESTfulness)
router.get('/:personID/photos/:imageType', cors(corsOptions), photo.getPhoto);
router.put('/:personID/photos/:imageType', cors(corsOptions), photo.uploadPhoto);
//Degrees (degreeID is the id on the degrees_people table)
router.get('/:personID/degrees', cors(corsOptions), degrees.getDegrees);
router.put('/:personID/degrees/:degreeID', cors(corsOptions), degrees.updateDegrees);
router.delete('/:personID/degrees/:degreeID', cors(corsOptions), degrees.deleteDegrees);
router.post('/:personID/degrees', cors(corsOptions), degrees.createDegrees);
// Institutional information
router.get('/:personID/institutional-phone', cors(corsOptions), institutionalContacts.getInstitutionalPhone);
router.put('/:personID/institutional-phone/:phoneID', cors(corsOptions), institutionalContacts.updateInstitutionalPhone);
router.post('/:personID/institutional-phone', cors(corsOptions), institutionalContacts.createInstitutionalPhone);
router.get('/:personID/institutional-email', cors(corsOptions), institutionalContacts.getInstitutionalEmail);
router.put('/:personID/institutional-email/:emailID', cors(corsOptions), institutionalContacts.updateInstitutionalEmail);
router.post('/:personID/institutional-email', cors(corsOptions), institutionalContacts.createInstitutionalEmail);
router.get('/:personID/researcher-ids', cors(corsOptions), researchIDs.getResearcherIDs);
router.post('/:personID/researcher-ids', cors(corsOptions), researchIDs.createResearcherIDs);
router.put('/:personID/researcher-ids/:researcherInfoID', cors(corsOptions), researchIDs.updateResearcherIDs);

router.get('/:personID/academic-affiliations', cors(corsOptions), academicAffiliations.getAcademicAffiliations);
router.post('/:personID/academic-affiliations', cors(corsOptions), academicAffiliations.createAcademicAffiliations);
router.put('/:personID/academic-affiliations/:affiliationID', cors(corsOptions), academicAffiliations.updateAcademicAffiliations);
router.delete('/:personID/academic-affiliations/:affiliationID', cors(corsOptions), academicAffiliations.deleteAcademicAffiliations);

router.get('/:personID/research-interests', cors(corsOptions), researchInterests.getResearchInterests);
router.post('/:personID/research-interests', cors(corsOptions), researchInterests.createResearchInterests);
router.put('/:personID/research-interests/:interestID', cors(corsOptions), researchInterests.updateResearchInterests);
router.delete('/:personID/research-interests/:interestID', cors(corsOptions), researchInterests.deleteResearchInterests);

router.get('/:personID/personal-urls', cors(corsOptions), personalURLs.getPersonalURLs);
router.post('/:personID/personal-urls', cors(corsOptions), personalURLs.createPersonalURLs);
router.put('/:personID/personal-urls/:urlID', cors(corsOptions), personalURLs.updatePersonalURLs);
router.delete('/:personID/personal-urls/:urlID', cors(corsOptions), personalURLs.deletePersonalURLs);

router.get('/:personID/cost-centers', cors(corsOptions), costCenters.getCostCenters);
router.post('/:personID/cost-centers', cors(corsOptions), costCenters.createCostCenters);
router.put('/:personID/cost-centers/:costCenterID', cors(corsOptions), costCenters.updateCostCenters);
router.delete('/:personID/cost-centers/:costCenterID', cors(corsOptions), costCenters.deleteCostCenters);

router.get('/:personID/text-types/:textTypeID/website-texts', cors(corsOptions), websiteTexts.getWebsiteTexts);
router.post('/:personID/text-types/:textTypeID/website-texts', cors(corsOptions), websiteTexts.createWebsiteTexts);
router.put('/:personID/text-types/:textTypeID/website-texts/:textID', cors(corsOptions), websiteTexts.updateWebsiteTexts);


// Affiliations: user can't change his/hers affiliations, only managers can do that
router.post('/:personID/affiliation-message', cors(corsOptions), institutionalAffiliations.sendChangeMessage);
router.get('/:personID/poles', cors(corsOptions), institutionalAffiliations.getPoles);
router.get('/:personID/roles', cors(corsOptions), institutionalAffiliations.getRoles);
router.get('/:personID/lab-affiliations', cors(corsOptions), institutionalAffiliations.getLabAffiliations);
router.get('/:personID/technical-affiliations', cors(corsOptions), institutionalAffiliations.getTechnicalAffiliations);
router.get('/:personID/science-management-affiliations', cors(corsOptions), institutionalAffiliations.getScienceManagementAffiliations);
router.get('/:personID/administrative-affiliations', cors(corsOptions), institutionalAffiliations.getAdministrativeAffiliations);
router.get('/:personID/responsibles', cors(corsOptions), institutionalResponsibles.getResponsibles);
router.post('/:personID/responsibles', cors(corsOptions), institutionalResponsibles.createResponsibles);
router.put('/:personID/responsibles/:peopleResponsibleID', cors(corsOptions), institutionalResponsibles.updateResponsibles);
router.delete('/:personID/responsibles/:peopleResponsibleID', cors(corsOptions), institutionalResponsibles.deleteResponsibles);
// Professional Situations
router.get('/:personID/professional-situations', cors(corsOptions), professionalSituations.getProfessionalSituations);
router.post('/:personID/professional-situations', cors(corsOptions), professionalSituations.createProfessionalSituations);
router.put('/:personID/professional-situations/:jobID', cors(corsOptions), professionalSituations.updateProfessionalSituations);
router.delete('/:personID/professional-situations/:jobID', cors(corsOptions), professionalSituations.deleteProfessionalSituations);
router.post('/:personID/professional-situations/:jobID/fellowships', cors(corsOptions), professionalSituations.createProfessionalSituationsFellowships);
router.put('/:personID/professional-situations/:jobID/fellowships/:fellowshipID', cors(corsOptions), professionalSituations.updateProfessionalSituationsFellowships);
router.delete('/:personID/professional-situations/:jobID/fellowships/:fellowshipID', cors(corsOptions), professionalSituations.deleteProfessionalSituationsFellowships);
router.post('/:personID/professional-situations/:jobID/contracts', cors(corsOptions), professionalSituations.createProfessionalSituationsContracts);
router.put('/:personID/professional-situations/:jobID/contracts/:contractID', cors(corsOptions), professionalSituations.updateProfessionalSituationsContracts);
router.delete('/:personID/professional-situations/:jobID/contracts/:contractID', cors(corsOptions), professionalSituations.deleteProfessionalSituationsContracts);
//Supervisor
router.post('/:personID/pre-register-student/:labID', cors(corsOptions), preRegister.preRegister);
router.get('/:personID/students', cors(corsOptions), supervising.getStudents);
router.post('/:personID/students', cors(corsOptions), supervising.addStudent);
router.get('/:personID/students/:studentID', cors(corsOptions), supervising.getStudentDetails);
router.put('/:personID/students/:studentID/supervisors/:supervisorID', cors(corsOptions), supervising.updateStudentSupervisors);
router.delete('/:personID/students/:studentID/supervisors/:supervisorID', cors(corsOptions), supervising.deleteStudentSupervisors);
router.post('/:personID/students/:studentID/lab-position', cors(corsOptions), supervising.addStudentLabPosition);
router.post('/:personID/students/:studentID/facility-position', cors(corsOptions), supervising.addStudentFacilityPosition);
router.post('/:personID/students/:studentID/science-management-position', cors(corsOptions), supervising.addStudentScienceManagementPosition);
router.post('/:personID/students/:studentID/administrative-position', cors(corsOptions), supervising.addStudentAdministrativePosition);
router.put('/:personID/students/:studentID/lab-position/:positionID', cors(corsOptions), supervising.updateStudentLabPosition);
router.put('/:personID/students/:studentID/facility-position/:positionID', cors(corsOptions), supervising.updateStudentFacilityPosition);
router.put('/:personID/students/:studentID/science-management-position/:positionID', cors(corsOptions), supervising.updateStudentScienceManagementPosition);
router.put('/:personID/students/:studentID/administrative-position/:positionID', cors(corsOptions), supervising.updateStudentAdministrativePosition);
router.delete('/:personID/students/:studentID/lab-position/:positionID', cors(corsOptions), supervising.deleteStudentLabPosition);
router.delete('/:personID/students/:studentID/facility-position/:positionID', cors(corsOptions), supervising.deleteStudentFacilityPosition);
router.delete('/:personID/students/:studentID/science-management-position/:positionID', cors(corsOptions), supervising.deleteStudentScienceManagementPosition);
router.delete('/:personID/students/:studentID/administrative-position/:positionID', cors(corsOptions), supervising.deleteStudentAdministrativePosition);

//Publications
router.get('/all-publications', cors(corsOptions), publicationsList.getAllPublications);
router.get('/:personID/publications', cors(corsOptions), publicationsList.getPublications);
router.get('/:personID/pure-publications', cors(corsOptions), addPubRepository.getPUREPublications);
router.post('/:personID/people-publications/:publicationID', cors(corsOptions), addPublications.createPersonPublicationAssociation);
router.put('/:personID/people-publications/:publicationID', cors(corsOptions), publicationsList.updatePersonPublicationAssociation);
router.delete('/:personID/people-publications/:publicationID', cors(corsOptions), publicationsList.deletePersonPublicationAssociation);
router.put('/:personID/publications/:publicationID', cors(corsOptions), publicationsList.updatePublication);

router.get('/:personID/author-names', cors(corsOptions), authorNames.getAuthorNames);
router.post('/:personID/author-names', cors(corsOptions), authorNames.createAuthorName);
router.put('/:personID/author-names/:authorID', cors(corsOptions), authorNames.updateAuthorName);
router.delete('/:personID/author-names/:authorID', cors(corsOptions), authorNames.deleteAuthorName);


router.post('/:personID/journals', cors(corsOptions), addPubORCID.createJournal);
router.post('/:personID/journals/:journalID/publications', cors(corsOptions), addPubORCID.createPublication);

//Spaces
router.get('/:personID/all-spaces', cors(corsOptions), spaces.getAllSpaces);
router.get('/:personID/spaces', cors(corsOptions), spaces.getPersonSpaces);
router.post('/:personID/spaces', cors(corsOptions), spaces.addPersonSpaces);
router.post('/:personID/spaces/:spaceID/roles', cors(corsOptions), spaces.addPersonRoles);
router.put('/:personID/spaces/:spaceID/roles/:roleID', cors(corsOptions), spaces.updatePersonRoles);
router.delete('/:personID/spaces/:spaceID/roles/:roleID', cors(corsOptions), spaces.deletePersonRoles);

router.get('/:personID/supervisor-spaces', cors(corsOptions), spaces.getSupervisorSpaces);
router.post('/:personID/supervisor-spaces', cors(corsOptions), spaces.addSupervisorSpaces);
router.get('/:personID/supervisor-spaces/:spaceID', cors(corsOptions), spaces.getSpaceInfo);
router.put('/:personID/supervisor-spaces/:spaceID', cors(corsOptions), spaces.updateSupervisorSpace);
router.delete('/:personID/supervisor-spaces/:supervisorSpaceID', cors(corsOptions), spaces.deleteSupervisorSpace);

// Endpoints for person on behalf
//router.get('/:personID/permissions', cors(corsOptions), permissions.getPermissions);
router.get('/:personID/labs/:labID', cors(corsOptions), labInfo.getLabInfo);
router.get('/:personID/labs/:labID/spaces', cors(corsOptions), labSpaces.getLabSpaces);
router.post('/:personID/labs/:labID/spaces', cors(corsOptions), labSpaces.addLabSpaces);
router.get('/:personID/labs/:labID/spaces/:spaceID', cors(corsOptions), labSpaces.getSpaceInfo);
router.put('/:personID/labs/:labID/spaces/:spaceID', cors(corsOptions), labSpaces.updateLabSpace);
router.delete('/:personID/labs/:labID/spaces/:labSpaceID', cors(corsOptions), labSpaces.deleteLabSpace);



// Warehouse
router.get('/:personID/store', cors(corsOptions), store.getStoreProfile);
router.get('/:personID/store/inventory', cors(corsOptions), store.getStoreInventory);
router.get('/:personID/store/accounts/:accountID/orders', cors(corsOptions), store.getOrdersHistory);
router.get('/:personID/store/accounts/:accountID/finances', cors(corsOptions), store.getFinances);
router.post('/:personID/store/accounts/:accountID', cors(corsOptions), store.createOrder);

router.get('/:personID/order-management/orders', cors(corsOptions), manageOrders.getOrders);
router.put('/:personID/order-management/orders/:orderID', cors(corsOptions), manageOrders.modifyOrder);

router.get('/:personID/stock-management/inventory', cors(corsOptions), manageStock.getStockItems);
router.post('/:personID/stock-management/inventory', cors(corsOptions), manageStock.createStockItem);
router.put('/:personID/stock-management/inventory/:stockItemID', cors(corsOptions), manageStock.updateStockItem);
router.delete('/:personID/stock-management/inventory/:stockItemID', cors(corsOptions), manageStock.deleteStockItem);

router.get('/:personID/users-management/users', cors(corsOptions), manageUsers.getUsers);
router.post('/:personID/users-management/users', cors(corsOptions), manageUsers.createUser);
router.put('/:personID/users-management/users/:accountPeopleID', cors(corsOptions), manageUsers.updateUser);
router.delete('/:personID/users-management/users/:accountPeopleID', cors(corsOptions), manageUsers.deleteUser);

router.get('/:personID/financial-management/cost-centers', cors(corsOptions), manageFinances.getCostCenters);
router.post('/:personID/financial-management/cost-centers', cors(corsOptions), manageFinances.createCostCenter);
router.put('/:personID/financial-management/cost-centers/:costCenterID', cors(corsOptions), manageFinances.updateCostCenter);
router.delete('/:personID/financial-management/cost-centers/:costCenterID', cors(corsOptions), manageFinances.deleteCostCenter);
router.post('/:personID/financial-management/cost-centers/:costCenterID/accounts', cors(corsOptions), manageFinances.createCostCenterAccount);
router.put('/:personID/financial-management/cost-centers/:costCenterID/accounts/:accountID', cors(corsOptions), manageFinances.updateCostCenterAccount);
router.delete('/:personID/financial-management/cost-centers/:costCenterID/accounts/:accountID', cors(corsOptions), manageFinances.deleteCostCenterAccount);
router.post('/:personID/financial-management/cost-centers/:costCenterID/accounts/:accountID/finances', cors(corsOptions), manageFinances.createCostCenterAccountFinance);
router.put('/:personID/financial-management/cost-centers/:costCenterID/accounts/:accountID/finances/:financesID', cors(corsOptions), manageFinances.updateCostCenterAccountFinance);



router.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
router.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({"message": "Route not found or other problem."});
});

module.exports = router;
