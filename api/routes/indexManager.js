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

const externalAPI = require('../controllers/people/external_api'); //authorization of visibility to external partners
const addMember = require('../controllers/manager/addMember');
const dataExport = require('../controllers/manager/data_export');
const membersAll = require('../controllers/manager/all/members');
const membersUnit = require('../controllers/manager/unit/members');
const membersUnitValidate = require('../controllers/manager/unit/members_validate');
const membersUnitCity = require('../controllers/manager/unit_city/members');
const membersCity = require('../controllers/manager/city/members');
const membersUnknown = require('../controllers/manager/unknown_associations/members');
const manageFCTMCTESmembers = require('../controllers/manager/unit/fct_mctes_management');
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
const costCenters = require('../controllers/people/cost_centers');
const institutionalResponsibles = require('../controllers/people/institutional_responsibles');
const researchIDs = require('../controllers/people/research_IDs');
const academicAffiliations = require('../controllers/people/academic_affiliations');
const professionalSituations = require('../controllers/people/professional_situations');
const publicationsList = require('../controllers/people/publications_list');
const supervising = require('../controllers/people/supervising');
const spaces = require('../controllers/people/spaces');
const labSpaces = require('../controllers/team/spaces');
const labMembers = require('../controllers/team/members');
const addPublications = require('../controllers/people/add_publications');
const addPubORCID = require('../controllers/people/add_pub_ORCID');
const addPubRepository = require('../controllers/people/add_pub_repository');
const projects = require('../controllers/people/projects');
const industryProjects = require('../controllers/people/private_agreements');
const trainingNetworks = require('../controllers/people/training_networks');
const communications = require('../controllers/people/communications');
const patents = require('../controllers/people/patents');
const startups = require('../controllers/people/startups');
const prizes = require('../controllers/people/prizes');
const boards = require('../controllers/people/boards');
const datasets = require('../controllers/people/datasets');
const outreaches = require('../controllers/people/outreaches');
const departmentTeams = require('../controllers/manager/unit/department_teams');
const spaceManagement = require('../controllers/manager/spaces/spaces');

const managePermissionLevels = require('../controllers/manager/unit/manage_permission_levels');
const managePermissionsUnit = require('../controllers/manager/unit/manage_permissions');
const manageAppAreaPermissionsUnit = require('../controllers/manager/unit/manage_app_area_permissions');

//endpoint for retrieving data to export to speadsheet
router.get('/:userID/export-data/people', cors(corsOptions), dataExport.getData);
router.get('/:userID/export-data/productivity', cors(corsOptions), dataExport.getProductivityData);
router.get('/:userID/export-data/spaces', cors(corsOptions), dataExport.getSpacesData);
router.get('/:userID/export-data/supervision', cors(corsOptions), dataExport.getSupervisionData);

//
router.get('/:userID/units/:unitID/cities/:cityID', cors(corsOptions), membersUnitCity.getUnitCityInfo);
router.get('/:userID/cities/:cityID', cors(corsOptions), membersCity.getCityInfo);
router.get('/:userID/units/:unitID/', cors(corsOptions), membersUnit.getUnitInfo);
// when unsegmented there's no additional info to retrieve (no specific city/unit)

// Manager adds new member
router.post('/:userID/units/:unitID/cities/:cityID/members', cors(corsOptions), addMember.addMember);
router.post('/:userID/cities/:cityID/members', cors(corsOptions), addMember.addMember);
router.post('/:userID/units/:unitID/members', cors(corsOptions), addMember.addMember);

// Routes for Undefined associations
router.get('/:userID/unknown-associations', cors(corsOptions), membersUnknown.getMembersList);
router.get('/:userID/members/:personID/users/:username', cors(corsOptions), users.checkUserExistence);
router.get('/:userID/members/:personID/users', cors(corsOptions), users.getUsername);

router.get('/:userID/members/:personID/is-supervisor', cors(corsOptions), nuclearInformation.checkSupervising);
router.put('/:userID/members/:personID/is-supervisor', cors(corsOptions), nuclearInformation.updateSupervising);

router.put('/:userID/members/:personID/users/:userID', cors(corsOptions), users.updateUsername);
router.put('/:userID/members/:personID/password/:userID', cors(corsOptions), users.updatePassword);
router.get('/:userID/members/:personID/nuclear-info', cors(corsOptions), nuclearInformation.getNuclearInfo);
router.put('/:userID/members/:personID/nuclear-info', cors(corsOptions), nuclearInformation.updateNuclearInfo);
router.get('/:userID/members/:personID/nationalities', cors(corsOptions), nuclearInformation.getNationalities);
router.put('/:userID/members/:personID/nationalities', cors(corsOptions), nuclearInformation.changeNationalities);
router.get('/:userID/members/:personID/photos/:imageType', cors(corsOptions), photo.getPhoto);
router.put('/:userID/members/:personID/photos/:imageType', cors(corsOptions), photo.uploadPhoto);
router.get('/:userID/members/:personID/personal-address', cors(corsOptions), personalContacts.getPersonalAddress);
router.post('/:userID/members/:personID/personal-address', cors(corsOptions), personalContacts.createPersonalAddress);
router.put('/:userID/members/:personID/personal-address/:addressID', cors(corsOptions), personalContacts.updatePersonalAddress);
router.get('/:userID/members/:personID/personal-phone', cors(corsOptions), personalContacts.getPersonalPhone);
router.post('/:userID/members/:personID/personal-phone', cors(corsOptions), personalContacts.createPersonalPhone);
router.put('/:userID/members/:personID/personal-phone/:phoneID', cors(corsOptions), personalContacts.updatePersonalPhone);
router.get('/:userID/members/:personID/personal-email', cors(corsOptions), personalContacts.getPersonalEmail);
router.post('/:userID/members/:personID/personal-email', cors(corsOptions), personalContacts.createPersonalEmail);
router.put('/:userID/members/:personID/personal-email/:emailID', cors(corsOptions), personalContacts.updatePersonalEmail);
router.get('/:userID/members/:personID/emergency-contacts', cors(corsOptions), emergencyContacts.getEmergencyContacts);
router.post('/:userID/members/:personID/emergency-contacts', cors(corsOptions), emergencyContacts.createEmergencyContact);
router.put('/:userID/members/:personID/emergency-contacts/:contactID', cors(corsOptions), emergencyContacts.updateEmergencyContact);
router.delete('/:userID/members/:personID/emergency-contacts/:contactID', cors(corsOptions), emergencyContacts.deleteEmergencyContact);
router.get('/:userID/members/:personID/identifications', cors(corsOptions), identifications.getIdentifications);
router.post('/:userID/members/:personID/identifications', cors(corsOptions), identifications.createIdentification);
router.put('/:userID/members/:personID/identifications/:identificationID', cors(corsOptions), identifications.updateIdentification);
router.delete('/:userID/members/:personID/identifications/:identificationID', cors(corsOptions), identifications.deleteIdentification);
router.get('/:userID/members/:personID/cars', cors(corsOptions), cars.getCars);
router.post('/:userID/members/:personID/cars', cors(corsOptions), cars.createCar);
router.put('/:userID/members/:personID/cars/:carID', cors(corsOptions), cars.updateCar);
router.delete('/:userID/members/:personID/cars/:carID', cors(corsOptions), cars.deleteCar);
router.post('/:userID/members/:personID/cars-message', cors(corsOptions), cars.sendChangeMessage);
//Degrees (degreeID is the id on the degrees_people table)
router.get('/:userID/members/:personID/degrees', cors(corsOptions), degrees.getDegrees);
router.put('/:userID/members/:personID/degrees/:degreeID', cors(corsOptions), degrees.updateDegrees);
router.delete('/:userID/members/:personID/degrees/:degreeID', cors(corsOptions), degrees.deleteDegrees);
router.post('/:userID/members/:personID/degrees', cors(corsOptions), degrees.createDegrees);
// Affiliations: user can't change his/hers affiliations, only managers can do that (poleID is the people_institution_city table ID)
router.get('/:userID/members/:personID/cost-centers', cors(corsOptions), costCenters.getCostCenters);
router.post('/:userID/members/:personID/cost-centers', cors(corsOptions), costCenters.createCostCenters);
router.put('/:userID/members/:personID/cost-centers/:costCenterID', cors(corsOptions), costCenters.updateCostCenters);
router.delete('/:userID/members/:personID/cost-centers/:costCenterID', cors(corsOptions), costCenters.deleteCostCenters);

router.get('/:userID/members/:personID/poles', cors(corsOptions), institutionalAffiliations.getPoles);
router.post('/:userID/members/:personID/poles', cors(corsOptions), institutionalAffiliations.createPole);
router.put('/:userID/members/:personID/poles/:poleID', cors(corsOptions), institutionalAffiliations.updatePole);
router.delete('/:userID/members/:personID/poles/:poleID', cors(corsOptions), institutionalAffiliations.deletePole);
router.get('/:userID/members/:personID/roles', cors(corsOptions), institutionalAffiliations.getRoles);
router.post('/:userID/members/:personID/roles', cors(corsOptions), institutionalAffiliations.createRole);
router.delete('/:userID/members/:personID/roles', cors(corsOptions), institutionalAffiliations.deleteRoles); // before changing delete all roles of this person
router.get('/:userID/members/:personID/lab-affiliations', cors(corsOptions), institutionalAffiliations.getLabAffiliations);
router.post('/:userID/members/:personID/lab-affiliations', cors(corsOptions), institutionalAffiliations.createLabAffiliation);
router.put('/:userID/members/:personID/lab-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateLabAffiliation);
router.delete('/:userID/members/:personID/lab-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteLabAffiliation);
router.get('/:userID/members/:personID/technical-affiliations', cors(corsOptions), institutionalAffiliations.getTechnicalAffiliations);
router.post('/:userID/members/:personID/technical-affiliations', cors(corsOptions), institutionalAffiliations.createTechnicalAffiliation);
router.put('/:userID/members/:personID/technical-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateTechnicalAffiliation);
router.delete('/:userID/members/:personID/technical-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteTechnicalAffiliation);
router.get('/:userID/members/:personID/science-management-affiliations', cors(corsOptions), institutionalAffiliations.getScienceManagementAffiliations);
router.post('/:userID/members/:personID/science-management-affiliations', cors(corsOptions), institutionalAffiliations.createScienceManagementAffiliation);
router.put('/:userID/members/:personID/science-management-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateScienceManagementAffiliation);
router.delete('/:userID/members/:personID/science-management-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteScienceManagementAffiliation);
router.get('/:userID/members/:personID/administrative-affiliations', cors(corsOptions), institutionalAffiliations.getAdministrativeAffiliations);
router.post('/:userID/members/:personID/administrative-affiliations', cors(corsOptions), institutionalAffiliations.createAdministrativeAffiliation);
router.put('/:userID/members/:personID/administrative-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.updateAdministrativeAffiliation);
router.delete('/:userID/members/:personID/administrative-affiliations/:affiliationID', cors(corsOptions), institutionalAffiliations.deleteAdministrativeAffiliation);
router.get('/:userID/members/:personID/responsibles', cors(corsOptions), institutionalResponsibles.getResponsibles);
router.post('/:userID/members/:personID/responsibles', cors(corsOptions), institutionalResponsibles.createResponsibles);
router.put('/:userID/members/:personID/responsibles/:peopleResponsibleID', cors(corsOptions), institutionalResponsibles.updateResponsibles);
router.delete('/:userID/members/:personID/responsibles/:peopleResponsibleID', cors(corsOptions), institutionalResponsibles.deleteResponsibles);
router.get('/:userID/members/:personID/institutional-phone', cors(corsOptions), institutionalContacts.getInstitutionalPhone);
router.put('/:userID/members/:personID/institutional-phone/:phoneID', cors(corsOptions), institutionalContacts.updateInstitutionalPhone);
router.post('/:userID/members/:personID/institutional-phone', cors(corsOptions), institutionalContacts.createInstitutionalPhone);
router.get('/:userID/members/:personID/institutional-email', cors(corsOptions), institutionalContacts.getInstitutionalEmail);
router.put('/:userID/members/:personID/institutional-email/:emailID', cors(corsOptions), institutionalContacts.updateInstitutionalEmail);
router.post('/:userID/members/:personID/institutional-email', cors(corsOptions), institutionalContacts.createInstitutionalEmail);
router.get('/:userID/members/:personID/academic-affiliations', cors(corsOptions), academicAffiliations.getAcademicAffiliations);
router.post('/:userID/members/:personID/academic-affiliations', cors(corsOptions), academicAffiliations.createAcademicAffiliations);
router.put('/:userID/members/:personID/academic-affiliations/:affiliationID', cors(corsOptions), academicAffiliations.updateAcademicAffiliations);
router.delete('/:userID/members/:personID/academic-affiliations/:affiliationID', cors(corsOptions), academicAffiliations.deleteAcademicAffiliations);
router.get('/:userID/members/:personID/researcher-ids', cors(corsOptions), researchIDs.getResearcherIDs);
router.post('/:userID/members/:personID/researcher-ids', cors(corsOptions), researchIDs.createResearcherIDs);
router.put('/:userID/members/:personID/researcher-ids/:researcherInfoID', cors(corsOptions), researchIDs.updateResearcherIDs);
// Professional Situations
router.get('/:userID/members/:personID/professional-situations', cors(corsOptions), professionalSituations.getProfessionalSituations);
router.post('/:userID/members/:personID/professional-situations', cors(corsOptions), professionalSituations.createProfessionalSituations);
router.put('/:userID/members/:personID/professional-situations/:jobID', cors(corsOptions), professionalSituations.updateProfessionalSituations);
router.delete('/:userID/members/:personID/professional-situations/:jobID', cors(corsOptions), professionalSituations.deleteProfessionalSituations);
router.post('/:userID/members/:personID/professional-situations/:jobID/fellowships', cors(corsOptions), professionalSituations.createProfessionalSituationsFellowships);
router.put('/:userID/members/:personID/professional-situations/:jobID/fellowships/:fellowshipID', cors(corsOptions), professionalSituations.updateProfessionalSituationsFellowships);
router.delete('/:userID/members/:personID/professional-situations/:jobID/fellowships/:fellowshipID', cors(corsOptions), professionalSituations.deleteProfessionalSituationsFellowships);
router.post('/:userID/members/:personID/professional-situations/:jobID/contracts', cors(corsOptions), professionalSituations.createProfessionalSituationsContracts);
router.put('/:userID/members/:personID/professional-situations/:jobID/contracts/:contractID', cors(corsOptions), professionalSituations.updateProfessionalSituationsContracts);
router.delete('/:userID/members/:personID/professional-situations/:jobID/contracts/:contractID', cors(corsOptions), professionalSituations.deleteProfessionalSituationsContracts);
//Publications
router.get('/:userID/members/all-publications', cors(corsOptions), publicationsList.getAllPublications);
router.get('/:userID/members/:personID/publications', cors(corsOptions), publicationsList.getPublications);
router.get('/:userID/members/:personID/pure-publications', cors(corsOptions), addPubRepository.getPUREPublications);
router.post('/:userID/members/:personID/people-publications/:publicationID', cors(corsOptions), addPublications.createPersonPublicationAssociation);
router.put('/:userID/members/:personID/people-publications/:publicationID', cors(corsOptions), publicationsList.updatePersonPublicationAssociation);
router.delete('/:userID/members/:personID/people-publications/:publicationID', cors(corsOptions), publicationsList.deletePersonPublicationAssociation);
router.put('/:userID/members/:personID/publications/:publicationID', cors(corsOptions), publicationsList.updatePublication);
router.post('/:userID/members/:personID/journals', cors(corsOptions), addPubORCID.createJournal);
router.post('/:userID/members/:personID/journals/:journalID/publications', cors(corsOptions), addPubORCID.createPublication);
//Permissions
router.get('/:userID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.getPermissions);
router.post('/:userID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.createPermissions);
router.put('/:userID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.updatePermissions);
router.delete('/:userID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.deletePermissions);

router.get('/:userID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.getPermissions);
router.post('/:userID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.createPermissions);
router.put('/:userID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.updatePermissions);
router.delete('/:userID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.deletePermissions);

router.get('/:userID/members/:personID/permission-levels', cors(corsOptions), managePermissionLevels.getPermissionLevel);
router.put('/:userID/members/:personID/permission-levels', cors(corsOptions), managePermissionLevels.updatePermissionLevel);


//Supervisor
router.get('/:userID/members/:personID/students', cors(corsOptions), supervising.getStudents);
router.post('/:userID/members/:personID/students', cors(corsOptions), supervising.addStudent);
router.get('/:userID/members/:personID/students/:studentID', cors(corsOptions), supervising.getStudentDetails);
router.put('/:userID/members/:personID/students/:studentID/supervisors/:supervisorID', cors(corsOptions), supervising.updateStudentSupervisors);
router.delete('/:userID/members/:personID/students/:studentID/supervisors/:supervisorID', cors(corsOptions), supervising.deleteStudentSupervisors);
router.post('/:userID/members/:personID/students/:studentID/lab-position', cors(corsOptions), supervising.addStudentLabPosition);
router.post('/:userID/members/:personID/students/:studentID/facility-position', cors(corsOptions), supervising.addStudentFacilityPosition);
router.post('/:userID/members/:personID/students/:studentID/science-management-position', cors(corsOptions), supervising.addStudentScienceManagementPosition);
router.post('/:userID/members/:personID/students/:studentID/administrative-position', cors(corsOptions), supervising.addStudentAdministrativePosition);
router.put('/:userID/members/:personID/students/:studentID/lab-position/:positionID', cors(corsOptions), supervising.updateStudentLabPosition);
router.put('/:userID/members/:personID/students/:studentID/facility-position/:positionID', cors(corsOptions), supervising.updateStudentFacilityPosition);
router.put('/:userID/members/:personID/students/:studentID/science-management-position/:positionID', cors(corsOptions), supervising.updateStudentScienceManagementPosition);
router.put('/:userID/members/:personID/students/:studentID/administrative-position/:positionID', cors(corsOptions), supervising.updateStudentAdministrativePosition);
router.delete('/:userID/members/:personID/students/:studentID/lab-position/:positionID', cors(corsOptions), supervising.deleteStudentLabPosition);
router.delete('/:userID/members/:personID/students/:studentID/facility-position/:positionID', cors(corsOptions), supervising.deleteStudentFacilityPosition);
router.delete('/:userID/members/:personID/students/:studentID/science-management-position/:positionID', cors(corsOptions), supervising.deleteStudentScienceManagementPosition);
router.delete('/:userID/members/:personID/students/:studentID/administrative-position/:positionID', cors(corsOptions), supervising.deleteStudentAdministrativePosition);
//Spaces
router.get('/:userID/members/:personID/all-spaces', cors(corsOptions), spaces.getAllSpaces);
router.get('/:userID/members/:personID/spaces', cors(corsOptions), spaces.getPersonSpaces);
router.post('/:userID/members/:personID/spaces', cors(corsOptions), spaces.addPersonSpaces);
router.post('/:userID/members/:personID/spaces/:spaceID/roles', cors(corsOptions), spaces.addPersonRoles);
router.put('/:userID/members/:personID/spaces/:spaceID/roles/:roleID', cors(corsOptions), spaces.updatePersonRoles);
router.delete('/:userID/members/:personID/spaces/:spaceID/roles/:roleID', cors(corsOptions), spaces.deletePersonRoles);
router.get('/:userID/members/:personID/supervisor-spaces', cors(corsOptions), spaces.getManagerSpaces);
router.post('/:userID/members/:personID/supervisor-spaces', cors(corsOptions), spaces.addManagerSpaces);
router.get('/:userID/members/:personID/supervisor-spaces/:spaceID', cors(corsOptions), spaces.getSpaceInfo);
router.put('/:userID/members/:personID/supervisor-spaces/:spaceID', cors(corsOptions), spaces.updateManagerSpace);
router.delete('/:userID/members/:personID/supervisor-spaces/:supervisorSpaceID', cors(corsOptions), spaces.deleteManagerSpace);
router.get('/:userID/labs/:labID', cors(corsOptions), labMembers.getLabInfo);
router.get('/:userID/labs/:labID/spaces', cors(corsOptions), labSpaces.getLabSpaces);
router.post('/:userID/labs/:labID/spaces', cors(corsOptions), labSpaces.addLabSpaces);
router.get('/:userID/labs/:labID/spaces/:spaceID', cors(corsOptions), labSpaces.getSpaceInfo);
router.put('/:userID/labs/:labID/spaces/:spaceID', cors(corsOptions), labSpaces.updateLabSpace);
router.delete('/:userID/labs/:labID/spaces/:labSpaceID', cors(corsOptions), labSpaces.deleteLabSpace);
//Private agreements (or industry collaborations)
router.get('/:userID/members/:personID/all-industry-projects', cors(corsOptions), industryProjects.getAllProjects);
router.get('/:userID/members/:personID/industry-projects', cors(corsOptions), industryProjects.getPersonProjects);
router.post('/:userID/members/:personID/industry-projects', cors(corsOptions), industryProjects.createPersonProject);
//router.get('/:userID/members/:personID/industry-projects/:projectID', cors(corsOptions), industryProjects.getProjectInfo);
router.put('/:userID/members/:personID/industry-projects/:projectID', cors(corsOptions), industryProjects.updatePersonProject);
router.post('/:userID/members/:personID/industry-projects/:projectID', cors(corsOptions), industryProjects.createPersonProjectAssociation);
//Training networks
router.get('/:userID/members/:personID/all-training-networks', cors(corsOptions), trainingNetworks.getAllProjects);
router.get('/:userID/members/:personID/training-networks', cors(corsOptions), trainingNetworks.getPersonProjects);
router.post('/:userID/members/:personID/training-networks', cors(corsOptions), trainingNetworks.createPersonProject);
router.put('/:userID/members/:personID/training-networks/:projectID', cors(corsOptions), trainingNetworks.updatePersonProject);
router.post('/:userID/members/:personID/training-networks/:projectID', cors(corsOptions), trainingNetworks.createPersonProjectAssociation);
//Communications
//router.get('/:userID/members/:personID/all-communications', cors(corsOptions), communications.getAllItems);
router.get('/:userID/members/:personID/communications', cors(corsOptions), communications.getPersonItems);
router.post('/:userID/members/:personID/communications', cors(corsOptions), communications.createPersonItem);
router.put('/:userID/members/:personID/communications/:itemID', cors(corsOptions), communications.updatePersonItem);
router.delete('/:userID/members/:personID/communications/:itemID', cors(corsOptions), communications.deletePersonItem);
//Patents
router.get('/:userID/members/:personID/all-patents', cors(corsOptions), patents.getAllItems);
router.get('/:userID/members/:personID/patents', cors(corsOptions), patents.getPersonItems);
router.post('/:userID/members/:personID/patents', cors(corsOptions), patents.createPersonItem);
router.put('/:userID/members/:personID/patents/:itemID', cors(corsOptions), patents.updatePersonItem);
router.post('/:userID/members/:personID/patents/:itemID', cors(corsOptions), patents.createPersonItemAssociation);
//Startups
router.get('/:userID/members/:personID/all-startups', cors(corsOptions), startups.getAllItems);
router.get('/:userID/members/:personID/startups', cors(corsOptions), startups.getPersonItems);
router.post('/:userID/members/:personID/startups', cors(corsOptions), startups.createPersonItem);
router.put('/:userID/members/:personID/startups/:itemID', cors(corsOptions), startups.updatePersonItem);
router.post('/:userID/members/:personID/startups/:itemID', cors(corsOptions), startups.createPersonItemAssociation);
//Prizes
router.get('/:userID/members/:personID/all-prizes', cors(corsOptions), prizes.getAllItems);
router.get('/:userID/members/:personID/prizes', cors(corsOptions), prizes.getPersonItems);
router.post('/:userID/members/:personID/prizes', cors(corsOptions), prizes.createPersonItem);
router.put('/:userID/members/:personID/prizes/:itemID', cors(corsOptions), prizes.updatePersonItem);
router.post('/:userID/members/:personID/prizes/:itemID', cors(corsOptions), prizes.createPersonItemAssociation);
//Boards
router.get('/:userID/members/:personID/all-boards', cors(corsOptions), boards.getAllItems);
router.get('/:userID/members/:personID/boards', cors(corsOptions), boards.getPersonItems);
router.post('/:userID/members/:personID/boards', cors(corsOptions), boards.createPersonItem);
router.put('/:userID/members/:personID/boards/:itemID', cors(corsOptions), boards.updatePersonItem);
router.post('/:userID/members/:personID/boards/:itemID', cors(corsOptions), boards.createPersonItemAssociation);
//Datasets
router.get('/:userID/members/:personID/all-datasets', cors(corsOptions), datasets.getAllItems);
router.get('/:userID/members/:personID/datasets', cors(corsOptions), datasets.getPersonItems);
router.post('/:userID/members/:personID/datasets', cors(corsOptions), datasets.createPersonItem);
router.put('/:userID/members/:personID/datasets/:itemID', cors(corsOptions), datasets.updatePersonItem);
router.post('/:userID/members/:personID/datasets/:itemID', cors(corsOptions), datasets.createPersonItemAssociation);
//Outreaches
router.get('/:userID/members/:personID/all-outreaches', cors(corsOptions), outreaches.getAllItems);
router.get('/:userID/members/:personID/outreaches', cors(corsOptions), outreaches.getPersonItems);
router.post('/:userID/members/:personID/outreaches', cors(corsOptions), outreaches.createPersonItem);
router.put('/:userID/members/:personID/outreaches/:itemID', cors(corsOptions), outreaches.updatePersonItem);
router.post('/:userID/members/:personID/outreaches/:itemID', cors(corsOptions), outreaches.createPersonItemAssociation);



// --------------------------------------------------------------
/* Units & Cities*/
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/comments', cors(corsOptions), nuclearInformation.getPersonComments);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/comments', cors(corsOptions), nuclearInformation.updatePersonComments);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/is-supervisor', cors(corsOptions), nuclearInformation.checkSupervising);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/is-supervisor', cors(corsOptions), nuclearInformation.updateSupervising);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/external-api-authorization', cors(corsOptions), externalAPI.getAuthorization);
//router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/external-api-authorization', cors(corsOptions), externalAPI.updateAuthorization);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/users/:username', cors(corsOptions), users.checkUserExistence);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/users', cors(corsOptions), users.getUsername);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/users/:userID', cors(corsOptions), users.updateUsername);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/password/:userID', cors(corsOptions), users.updatePassword);
// routes for manager with access to
router.get('/:userID/units/:unitID/cities/:cityID/fct-status/:personID', cors(corsOptions), manageFCTMCTESmembers.getPersonStatus);
router.post('/:userID/units/:unitID/cities/:cityID/fct-status/:personID', cors(corsOptions), manageFCTMCTESmembers.createPersonStatus);
router.put('/:userID/units/:unitID/cities/:cityID/fct-status/:personID/status/:statusID', cors(corsOptions), manageFCTMCTESmembers.updatePersonStatus);

router.get('/:userID/units/:unitID/cities/:cityID/to-add-fct-mctes-members', cors(corsOptions), manageFCTMCTESmembers.getMembersList);
router.put('/:userID/units/:unitID/cities/:cityID/to-add-fct-mctes-members/:memberID', cors(corsOptions), manageFCTMCTESmembers.updateMember);
router.get('/:userID/units/:unitID/cities/:cityID/requested-fct-mctes-members', cors(corsOptions), manageFCTMCTESmembers.getRequestedMembersList);
router.put('/:userID/units/:unitID/cities/:cityID/requested-fct-mctes-members/:memberID', cors(corsOptions), manageFCTMCTESmembers.updateRequestedMember);
router.get('/:userID/units/:unitID/cities/:cityID/removed-fct-mctes-members', cors(corsOptions), manageFCTMCTESmembers.getRemovedMembersList);
router.put('/:userID/units/:unitID/cities/:cityID/removed-fct-mctes-members/:memberID', cors(corsOptions), manageFCTMCTESmembers.updateRemovedMember);


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
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/cost-centers', cors(corsOptions), costCenters.getCostCenters);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/cost-centers', cors(corsOptions), costCenters.createCostCenters);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/cost-centers/:costCenterID', cors(corsOptions), costCenters.updateCostCenters);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/cost-centers/:costCenterID', cors(corsOptions), costCenters.deleteCostCenters);


router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/department-teams', cors(corsOptions), departmentTeams.getPersonDepartmentTeam);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/department-teams', cors(corsOptions), departmentTeams.createPersonDepartmentTeam);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/department-teams/:departmentTeamID', cors(corsOptions), departmentTeams.updatePersonDepartmentTeam);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/department-teams/:departmentTeamID', cors(corsOptions), departmentTeams.deletePersonDepartmentTeam);


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
//Projects
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/all-projects', cors(corsOptions), projects.getAllProjects);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/projects', cors(corsOptions), projects.getPersonProjects);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/projects', cors(corsOptions), projects.createPersonProject);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/projects/:projectID', cors(corsOptions), projects.getProjectInfo);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/projects/:projectID', cors(corsOptions), projects.updatePersonProject);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/projects/:projectID', cors(corsOptions), projects.createPersonProjectAssociation);
//Permissions
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.getPermissions);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.createPermissions);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.updatePermissions);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.deletePermissions);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.getPermissions);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.createPermissions);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.updatePermissions);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.deletePermissions);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/permission-levels', cors(corsOptions), managePermissionLevels.getPermissionLevel);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/permission-levels', cors(corsOptions), managePermissionLevels.updatePermissionLevel);

//Supervisor
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/students', cors(corsOptions), supervising.getStudents);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/students', cors(corsOptions), supervising.addStudent);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/students/:studentID', cors(corsOptions), supervising.getStudentDetails);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/students/:studentID/supervisors/:supervisorID', cors(corsOptions), supervising.updateStudentSupervisors);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/students/:studentID/supervisors/:supervisorID', cors(corsOptions), supervising.deleteStudentSupervisors);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/students/:studentID/lab-position', cors(corsOptions), supervising.addStudentLabPosition);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/students/:studentID/facility-position', cors(corsOptions), supervising.addStudentFacilityPosition);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/students/:studentID/science-management-position', cors(corsOptions), supervising.addStudentScienceManagementPosition);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/students/:studentID/administrative-position', cors(corsOptions), supervising.addStudentAdministrativePosition);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/students/:studentID/lab-position/:positionID', cors(corsOptions), supervising.updateStudentLabPosition);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/students/:studentID/facility-position/:positionID', cors(corsOptions), supervising.updateStudentFacilityPosition);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/students/:studentID/science-management-position/:positionID', cors(corsOptions), supervising.updateStudentScienceManagementPosition);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/students/:studentID/administrative-position/:positionID', cors(corsOptions), supervising.updateStudentAdministrativePosition);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/students/:studentID/lab-position/:positionID', cors(corsOptions), supervising.deleteStudentLabPosition);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/students/:studentID/facility-position/:positionID', cors(corsOptions), supervising.deleteStudentFacilityPosition);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/students/:studentID/science-management-position/:positionID', cors(corsOptions), supervising.deleteStudentScienceManagementPosition);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/students/:studentID/administrative-position/:positionID', cors(corsOptions), supervising.deleteStudentAdministrativePosition);
//Spaces
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/all-spaces', cors(corsOptions), spaces.getAllSpaces);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/spaces', cors(corsOptions), spaces.getPersonSpaces);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/spaces', cors(corsOptions), spaces.addPersonSpaces);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/spaces/:spaceID/roles', cors(corsOptions), spaces.addPersonRoles);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/spaces/:spaceID/roles/:roleID', cors(corsOptions), spaces.updatePersonRoles);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/spaces/:spaceID/roles/:roleID', cors(corsOptions), spaces.deletePersonRoles);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/supervisor-spaces', cors(corsOptions), spaces.getManagerSpaces);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/supervisor-spaces', cors(corsOptions), spaces.addManagerSpaces);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/supervisor-spaces/:spaceID', cors(corsOptions), spaces.getSpaceInfo);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/supervisor-spaces/:spaceID', cors(corsOptions), spaces.updateManagerSpace);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/supervisor-spaces/:supervisorSpaceID', cors(corsOptions), spaces.deleteManagerSpace);
router.get('/:userID/units/:unitID/cities/:cityID/labs/:labID', cors(corsOptions), labMembers.getLabInfo);
router.get('/:userID/units/:unitID/cities/:cityID/labs/:labID/spaces', cors(corsOptions), labSpaces.getLabSpaces);
router.post('/:userID/units/:unitID/cities/:cityID/labs/:labID/spaces', cors(corsOptions), labSpaces.addLabSpaces);
router.get('/:userID/units/:unitID/cities/:cityID/labs/:labID/spaces/:spaceID', cors(corsOptions), labSpaces.getSpaceInfo);
router.put('/:userID/units/:unitID/cities/:cityID/labs/:labID/spaces/:spaceID', cors(corsOptions), labSpaces.updateLabSpace);
router.delete('/:userID/units/:unitID/cities/:cityID/labs/:labID/spaces/:labSpaceID', cors(corsOptions), labSpaces.deleteLabSpace);
//Private agreements (or industry collaborations)
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/all-industry-projects', cors(corsOptions), industryProjects.getAllProjects);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/industry-projects', cors(corsOptions), industryProjects.getPersonProjects);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/industry-projects', cors(corsOptions), industryProjects.createPersonProject);
//router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/industry-projects/:projectID', cors(corsOptions), industryProjects.getProjectInfo);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/industry-projects/:projectID', cors(corsOptions), industryProjects.updatePersonProject);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/industry-projects/:projectID', cors(corsOptions), industryProjects.createPersonProjectAssociation);
//Training networks
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/all-training-networks', cors(corsOptions), trainingNetworks.getAllProjects);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/training-networks', cors(corsOptions), trainingNetworks.getPersonProjects);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/training-networks', cors(corsOptions), trainingNetworks.createPersonProject);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/training-networks/:projectID', cors(corsOptions), trainingNetworks.updatePersonProject);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/training-networks/:projectID', cors(corsOptions), trainingNetworks.createPersonProjectAssociation);
//Communications
//router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/all-communications', cors(corsOptions), communications.getAllItems);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/communications', cors(corsOptions), communications.getPersonItems);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/communications', cors(corsOptions), communications.createPersonItem);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/communications/:itemID', cors(corsOptions), communications.updatePersonItem);
router.delete('/:userID/units/:unitID/cities/:cityID/members/:personID/communications/:itemID', cors(corsOptions), communications.deletePersonItem);
//Patents
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/all-patents', cors(corsOptions), patents.getAllItems);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/patents', cors(corsOptions), patents.getPersonItems);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/patents', cors(corsOptions), patents.createPersonItem);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/patents/:itemID', cors(corsOptions), patents.updatePersonItem);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/patents/:itemID', cors(corsOptions), patents.createPersonItemAssociation);
//Startups
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/all-startups', cors(corsOptions), startups.getAllItems);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/startups', cors(corsOptions), startups.getPersonItems);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/startups', cors(corsOptions), startups.createPersonItem);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/startups/:itemID', cors(corsOptions), startups.updatePersonItem);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/startups/:itemID', cors(corsOptions), startups.createPersonItemAssociation);
//Prizes
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/all-prizes', cors(corsOptions), prizes.getAllItems);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/prizes', cors(corsOptions), prizes.getPersonItems);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/prizes', cors(corsOptions), prizes.createPersonItem);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/prizes/:itemID', cors(corsOptions), prizes.updatePersonItem);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/prizes/:itemID', cors(corsOptions), prizes.createPersonItemAssociation);
//Boards
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/all-boards', cors(corsOptions), boards.getAllItems);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/boards', cors(corsOptions), boards.getPersonItems);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/boards', cors(corsOptions), boards.createPersonItem);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/boards/:itemID', cors(corsOptions), boards.updatePersonItem);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/boards/:itemID', cors(corsOptions), boards.createPersonItemAssociation);
//Datasets
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/all-datasets', cors(corsOptions), datasets.getAllItems);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/datasets', cors(corsOptions), datasets.getPersonItems);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/datasets', cors(corsOptions), datasets.createPersonItem);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/datasets/:itemID', cors(corsOptions), datasets.updatePersonItem);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/datasets/:itemID', cors(corsOptions), datasets.createPersonItemAssociation);
//Outreaches
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/all-outreaches', cors(corsOptions), outreaches.getAllItems);
router.get('/:userID/units/:unitID/cities/:cityID/members/:personID/outreaches', cors(corsOptions), outreaches.getPersonItems);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/outreaches', cors(corsOptions), outreaches.createPersonItem);
router.put('/:userID/units/:unitID/cities/:cityID/members/:personID/outreaches/:itemID', cors(corsOptions), outreaches.updatePersonItem);
router.post('/:userID/units/:unitID/cities/:cityID/members/:personID/outreaches/:itemID', cors(corsOptions), outreaches.createPersonItemAssociation);


/* Cities*/
router.get('/:userID/cities/:cityID/members/:personID/comments', cors(corsOptions), nuclearInformation.getPersonComments);
router.put('/:userID/cities/:cityID/members/:personID/comments', cors(corsOptions), nuclearInformation.updatePersonComments);
router.get('/:userID/cities/:cityID/members/:personID/is-supervisor', cors(corsOptions), nuclearInformation.checkSupervising);
router.put('/:userID/cities/:cityID/members/:personID/is-supervisor', cors(corsOptions), nuclearInformation.updateSupervising);

router.get('/:userID/cities/:cityID/members/:personID/external-api-authorization', cors(corsOptions), externalAPI.getAuthorization);
//router.put('/:userID/cities/:cityID/members/:personID/external-api-authorization', cors(corsOptions), externalAPI.updateAuthorization);
router.get('/:userID/cities/:cityID/members/:personID/users/:username', cors(corsOptions), users.checkUserExistence);
router.get('/:userID/cities/:cityID/members/:personID/users', cors(corsOptions), users.getUsername);
router.put('/:userID/cities/:cityID/members/:personID/users/:userID', cors(corsOptions), users.updateUsername);
router.put('/:userID/cities/:cityID/members/:personID/password/:userID', cors(corsOptions), users.updatePassword);
// routes for manager with access to
router.get('/:userID/cities/:cityID/to-add-fct-mctes-members', cors(corsOptions), manageFCTMCTESmembers.getMembersList);
router.put('/:userID/cities/:cityID/to-add-fct-mctes-members/:memberID', cors(corsOptions), manageFCTMCTESmembers.updateMember);
router.get('/:userID/cities/:cityID/requested-fct-mctes-members', cors(corsOptions), manageFCTMCTESmembers.getRequestedMembersList);
router.put('/:userID/cities/:cityID/requested-fct-mctes-members/:memberID', cors(corsOptions), manageFCTMCTESmembers.updateRequestedMember);
router.get('/:userID/cities/:cityID/removed-fct-mctes-members', cors(corsOptions), manageFCTMCTESmembers.getRemovedMembersList);
router.put('/:userID/cities/:cityID/removed-fct-mctes-members/:memberID', cors(corsOptions), manageFCTMCTESmembers.updateRemovedMember);

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
router.get('/:userID/cities/:cityID/members/:personID/cost-centers', cors(corsOptions), costCenters.getCostCenters);
router.post('/:userID/cities/:cityID/members/:personID/cost-centers', cors(corsOptions), costCenters.createCostCenters);
router.put('/:userID/cities/:cityID/members/:personID/cost-centers/:costCenterID', cors(corsOptions), costCenters.updateCostCenters);
router.delete('/:userID/cities/:cityID/members/:personID/cost-centers/:costCenterID', cors(corsOptions), costCenters.deleteCostCenters);

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
//Projects
router.get('/:userID/cities/:cityID/members/:personID/all-projects', cors(corsOptions), projects.getAllProjects);
router.get('/:userID/cities/:cityID/members/:personID/projects', cors(corsOptions), projects.getPersonProjects);
router.post('/:userID/cities/:cityID/members/:personID/projects', cors(corsOptions), projects.createPersonProject);
router.get('/:userID/cities/:cityID/members/:personID/projects/:projectID', cors(corsOptions), projects.getProjectInfo);
router.put('/:userID/cities/:cityID/members/:personID/projects/:projectID', cors(corsOptions), projects.updatePersonProject);
router.post('/:userID/cities/:cityID/members/:personID/projects/:projectID', cors(corsOptions), projects.createPersonProjectAssociation);
//Permissions
router.get('/:userID/cities/:cityID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.getPermissions);
router.post('/:userID/cities/:cityID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.createPermissions);
router.put('/:userID/cities/:cityID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.updatePermissions);
router.delete('/:userID/cities/:cityID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.deletePermissions);
router.get('/:userID/cities/:cityID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.getPermissions);
router.post('/:userID/cities/:cityID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.createPermissions);
router.put('/:userID/cities/:cityID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.updatePermissions);
router.delete('/:userID/cities/:cityID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.deletePermissions);
router.get('/:userID/cities/:cityID/members/:personID/permission-levels', cors(corsOptions), managePermissionLevels.getPermissionLevel);
router.put('/:userID/cities/:cityID/members/:personID/permission-levels', cors(corsOptions), managePermissionLevels.updatePermissionLevel);

//Supervisor
router.get('/:userID/cities/:cityID/members/:personID/students', cors(corsOptions), supervising.getStudents);
router.post('/:userID/cities/:cityID/members/:personID/students', cors(corsOptions), supervising.addStudent);
router.get('/:userID/cities/:cityID/members/:personID/students/:studentID', cors(corsOptions), supervising.getStudentDetails);
router.put('/:userID/cities/:cityID/members/:personID/students/:studentID/supervisors/:supervisorID', cors(corsOptions), supervising.updateStudentSupervisors);
router.delete('/:userID/cities/:cityID/members/:personID/students/:studentID/supervisors/:supervisorID', cors(corsOptions), supervising.deleteStudentSupervisors);
router.post('/:userID/cities/:cityID/members/:personID/students/:studentID/lab-position', cors(corsOptions), supervising.addStudentLabPosition);
router.post('/:userID/cities/:cityID/members/:personID/students/:studentID/facility-position', cors(corsOptions), supervising.addStudentFacilityPosition);
router.post('/:userID/cities/:cityID/members/:personID/students/:studentID/science-management-position', cors(corsOptions), supervising.addStudentScienceManagementPosition);
router.post('/:userID/cities/:cityID/members/:personID/students/:studentID/administrative-position', cors(corsOptions), supervising.addStudentAdministrativePosition);
router.put('/:userID/cities/:cityID/members/:personID/students/:studentID/lab-position/:positionID', cors(corsOptions), supervising.updateStudentLabPosition);
router.put('/:userID/cities/:cityID/members/:personID/students/:studentID/facility-position/:positionID', cors(corsOptions), supervising.updateStudentFacilityPosition);
router.put('/:userID/cities/:cityID/members/:personID/students/:studentID/science-management-position/:positionID', cors(corsOptions), supervising.updateStudentScienceManagementPosition);
router.put('/:userID/cities/:cityID/members/:personID/students/:studentID/administrative-position/:positionID', cors(corsOptions), supervising.updateStudentAdministrativePosition);
router.delete('/:userID/cities/:cityID/members/:personID/students/:studentID/lab-position/:positionID', cors(corsOptions), supervising.deleteStudentLabPosition);
router.delete('/:userID/cities/:cityID/members/:personID/students/:studentID/facility-position/:positionID', cors(corsOptions), supervising.deleteStudentFacilityPosition);
router.delete('/:userID/cities/:cityID/members/:personID/students/:studentID/science-management-position/:positionID', cors(corsOptions), supervising.deleteStudentScienceManagementPosition);
router.delete('/:userID/cities/:cityID/members/:personID/students/:studentID/administrative-position/:positionID', cors(corsOptions), supervising.deleteStudentAdministrativePosition);
//Spaces
router.get('/:userID/cities/:cityID/members/:personID/all-spaces', cors(corsOptions), spaces.getAllSpaces);
router.get('/:userID/cities/:cityID/members/:personID/spaces', cors(corsOptions), spaces.getPersonSpaces);
router.post('/:userID/cities/:cityID/members/:personID/spaces', cors(corsOptions), spaces.addPersonSpaces);
router.post('/:userID/cities/:cityID/members/:personID/spaces/:spaceID/roles', cors(corsOptions), spaces.addPersonRoles);
router.put('/:userID/cities/:cityID/members/:personID/spaces/:spaceID/roles/:roleID', cors(corsOptions), spaces.updatePersonRoles);
router.delete('/:userID/cities/:cityID/members/:personID/spaces/:spaceID/roles/:roleID', cors(corsOptions), spaces.deletePersonRoles);
router.get('/:userID/cities/:cityID/members/:personID/supervisor-spaces', cors(corsOptions), spaces.getManagerSpaces);
router.post('/:userID/cities/:cityID/members/:personID/supervisor-spaces', cors(corsOptions), spaces.addManagerSpaces);
router.get('/:userID/cities/:cityID/members/:personID/supervisor-spaces/:spaceID', cors(corsOptions), spaces.getSpaceInfo);
router.put('/:userID/cities/:cityID/members/:personID/supervisor-spaces/:spaceID', cors(corsOptions), spaces.updateManagerSpace);
router.delete('/:userID/cities/:cityID/members/:personID/supervisor-spaces/:supervisorSpaceID', cors(corsOptions), spaces.deleteManagerSpace);
router.get('/:userID/cities/:cityID/labs/:labID', cors(corsOptions), labMembers.getLabInfo);
router.get('/:userID/cities/:cityID/labs/:labID/spaces', cors(corsOptions), labSpaces.getLabSpaces);
router.post('/:userID/cities/:cityID/labs/:labID/spaces', cors(corsOptions), labSpaces.addLabSpaces);
router.get('/:userID/cities/:cityID/labs/:labID/spaces/:spaceID', cors(corsOptions), labSpaces.getSpaceInfo);
router.put('/:userID/cities/:cityID/labs/:labID/spaces/:spaceID', cors(corsOptions), labSpaces.updateLabSpace);
router.delete('/:userID/cities/:cityID/labs/:labID/spaces/:labSpaceID', cors(corsOptions), labSpaces.deleteLabSpace);
//Private agreements (or industry collaborations)
router.get('/:userID/cities/:cityID/members/:personID/all-industry-projects', cors(corsOptions), industryProjects.getAllProjects);
router.get('/:userID/cities/:cityID/members/:personID/industry-projects', cors(corsOptions), industryProjects.getPersonProjects);
router.post('/:userID/cities/:cityID/members/:personID/industry-projects', cors(corsOptions), industryProjects.createPersonProject);
//router.get('/:userID/cities/:cityID/members/:personID/industry-projects/:projectID', cors(corsOptions), industryProjects.getProjectInfo);
router.put('/:userID/cities/:cityID/members/:personID/industry-projects/:projectID', cors(corsOptions), industryProjects.updatePersonProject);
router.post('/:userID/cities/:cityID/members/:personID/industry-projects/:projectID', cors(corsOptions), industryProjects.createPersonProjectAssociation);
//Training networks
router.get('/:userID/cities/:cityID/members/:personID/all-training-networks', cors(corsOptions), trainingNetworks.getAllProjects);
router.get('/:userID/cities/:cityID/members/:personID/training-networks', cors(corsOptions), trainingNetworks.getPersonProjects);
router.post('/:userID/cities/:cityID/members/:personID/training-networks', cors(corsOptions), trainingNetworks.createPersonProject);
router.put('/:userID/cities/:cityID/members/:personID/training-networks/:projectID', cors(corsOptions), trainingNetworks.updatePersonProject);
router.post('/:userID/cities/:cityID/members/:personID/training-networks/:projectID', cors(corsOptions), trainingNetworks.createPersonProjectAssociation);
//Communications
//router.get('/:userID/cities/:cityID/members/:personID/all-communications', cors(corsOptions), communications.getAllItems);
router.get('/:userID/cities/:cityID/members/:personID/communications', cors(corsOptions), communications.getPersonItems);
router.post('/:userID/cities/:cityID/members/:personID/communications', cors(corsOptions), communications.createPersonItem);
router.put('/:userID/cities/:cityID/members/:personID/communications/:itemID', cors(corsOptions), communications.updatePersonItem);
router.delete('/:userID/cities/:cityID/members/:personID/communications/:itemID', cors(corsOptions), communications.deletePersonItem);
//Patents
router.get('/:userID/cities/:cityID/members/:personID/all-patents', cors(corsOptions), patents.getAllItems);
router.get('/:userID/cities/:cityID/members/:personID/patents', cors(corsOptions), patents.getPersonItems);
router.post('/:userID/cities/:cityID/members/:personID/patents', cors(corsOptions), patents.createPersonItem);
router.put('/:userID/cities/:cityID/members/:personID/patents/:itemID', cors(corsOptions), patents.updatePersonItem);
router.post('/:userID/cities/:cityID/members/:personID/patents/:itemID', cors(corsOptions), patents.createPersonItemAssociation);
//Startups
router.get('/:userID/cities/:cityID/members/:personID/all-startups', cors(corsOptions), startups.getAllItems);
router.get('/:userID/cities/:cityID/members/:personID/startups', cors(corsOptions), startups.getPersonItems);
router.post('/:userID/cities/:cityID/members/:personID/startups', cors(corsOptions), startups.createPersonItem);
router.put('/:userID/cities/:cityID/members/:personID/startups/:itemID', cors(corsOptions), startups.updatePersonItem);
router.post('/:userID/cities/:cityID/members/:personID/startups/:itemID', cors(corsOptions), startups.createPersonItemAssociation);
//Prizes
router.get('/:userID/cities/:cityID/members/:personID/all-prizes', cors(corsOptions), prizes.getAllItems);
router.get('/:userID/cities/:cityID/members/:personID/prizes', cors(corsOptions), prizes.getPersonItems);
router.post('/:userID/cities/:cityID/members/:personID/prizes', cors(corsOptions), prizes.createPersonItem);
router.put('/:userID/cities/:cityID/members/:personID/prizes/:itemID', cors(corsOptions), prizes.updatePersonItem);
router.post('/:userID/cities/:cityID/members/:personID/prizes/:itemID', cors(corsOptions), prizes.createPersonItemAssociation);
//Boards
router.get('/:userID/cities/:cityID/members/:personID/all-boards', cors(corsOptions), boards.getAllItems);
router.get('/:userID/cities/:cityID/members/:personID/boards', cors(corsOptions), boards.getPersonItems);
router.post('/:userID/cities/:cityID/members/:personID/boards', cors(corsOptions), boards.createPersonItem);
router.put('/:userID/cities/:cityID/members/:personID/boards/:itemID', cors(corsOptions), boards.updatePersonItem);
router.post('/:userID/cities/:cityID/members/:personID/boards/:itemID', cors(corsOptions), boards.createPersonItemAssociation);
//Datasets
router.get('/:userID/cities/:cityID/members/:personID/all-datasets', cors(corsOptions), datasets.getAllItems);
router.get('/:userID/cities/:cityID/members/:personID/datasets', cors(corsOptions), datasets.getPersonItems);
router.post('/:userID/cities/:cityID/members/:personID/datasets', cors(corsOptions), datasets.createPersonItem);
router.put('/:userID/cities/:cityID/members/:personID/datasets/:itemID', cors(corsOptions), datasets.updatePersonItem);
router.post('/:userID/cities/:cityID/members/:personID/datasets/:itemID', cors(corsOptions), datasets.createPersonItemAssociation);
//Outreaches
router.get('/:userID/cities/:cityID/members/:personID/all-outreaches', cors(corsOptions), outreaches.getAllItems);
router.get('/:userID/cities/:cityID/members/:personID/outreaches', cors(corsOptions), outreaches.getPersonItems);
router.post('/:userID/cities/:cityID/members/:personID/outreaches', cors(corsOptions), outreaches.createPersonItem);
router.put('/:userID/cities/:cityID/members/:personID/outreaches/:itemID', cors(corsOptions), outreaches.updatePersonItem);
router.post('/:userID/cities/:cityID/members/:personID/outreaches/:itemID', cors(corsOptions), outreaches.createPersonItemAssociation);

router.get('/:userID/cities/:cityID/members/:personID/department-teams', cors(corsOptions), departmentTeams.getPersonDepartmentTeam);
router.post('/:userID/cities/:cityID/members/:personID/department-teams', cors(corsOptions), departmentTeams.createPersonDepartmentTeam);
router.put('/:userID/cities/:cityID/members/:personID/department-teams/:departmentTeamID', cors(corsOptions), departmentTeams.updatePersonDepartmentTeam);
router.delete('/:userID/cities/:cityID/members/:personID/department-teams/:departmentTeamID', cors(corsOptions), departmentTeams.deletePersonDepartmentTeam);


/* Units*/
router.get('/:userID/units/:unitID/members/:personID/comments', cors(corsOptions), nuclearInformation.getPersonComments);
router.put('/:userID/units/:unitID/members/:personID/comments', cors(corsOptions), nuclearInformation.updatePersonComments);
router.get('/:userID/units/:unitID/members/:personID/is-supervisor', cors(corsOptions), nuclearInformation.checkSupervising);
router.put('/:userID/units/:unitID/members/:personID/is-supervisor', cors(corsOptions), nuclearInformation.updateSupervising);
router.get('/:userID/units/:unitID/members/:personID/external-api-authorization', cors(corsOptions), externalAPI.getAuthorization);
router.get('/:userID/units/:unitID/members/:personID/users/:username', cors(corsOptions), users.checkUserExistence);
router.get('/:userID/units/:unitID/members/:personID/users', cors(corsOptions), users.getUsername);
router.put('/:userID/units/:unitID/members/:personID/users/:userID', cors(corsOptions), users.updateUsername);
router.put('/:userID/units/:unitID/members/:personID/password/:userID', cors(corsOptions), users.updatePassword);
// routes for manager with access to a single whole unit
router.get('/:userID/units/:unitID/fct-status/:personID', cors(corsOptions), manageFCTMCTESmembers.getPersonStatus);
router.post('/:userID/units/:unitID/fct-status/:personID', cors(corsOptions), manageFCTMCTESmembers.createPersonStatus);
router.put('/:userID/units/:unitID/fct-status/:personID/status/:statusID', cors(corsOptions), manageFCTMCTESmembers.updatePersonStatus);

router.get('/:userID/units/:unitID/to-add-fct-mctes-members', cors(corsOptions), manageFCTMCTESmembers.getMembersList);
router.put('/:userID/units/:unitID/to-add-fct-mctes-members/:memberID', cors(corsOptions), manageFCTMCTESmembers.updateMember);
router.get('/:userID/units/:unitID/requested-fct-mctes-members', cors(corsOptions), manageFCTMCTESmembers.getRequestedMembersList);
router.put('/:userID/units/:unitID/requested-fct-mctes-members/:memberID', cors(corsOptions), manageFCTMCTESmembers.updateRequestedMember);
router.get('/:userID/units/:unitID/removed-fct-mctes-members', cors(corsOptions), manageFCTMCTESmembers.getRemovedMembersList);
router.put('/:userID/units/:unitID/removed-fct-mctes-members/:memberID', cors(corsOptions), manageFCTMCTESmembers.updateRemovedMember);

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
router.get('/:userID/units/:unitID/members/:personID/cost-centers', cors(corsOptions), costCenters.getCostCenters);
router.post('/:userID/units/:unitID/members/:personID/cost-centers', cors(corsOptions), costCenters.createCostCenters);
router.put('/:userID/units/:unitID/members/:personID/cost-centers/:costCenterID', cors(corsOptions), costCenters.updateCostCenters);
router.delete('/:userID/units/:unitID/members/:personID/cost-centers/:costCenterID', cors(corsOptions), costCenters.deleteCostCenters);

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
//Projects
router.get('/:userID/units/:unitID/members/:personID/all-projects', cors(corsOptions), projects.getAllProjects);
router.get('/:userID/units/:unitID/members/:personID/projects', cors(corsOptions), projects.getPersonProjects);
router.post('/:userID/units/:unitID/members/:personID/projects', cors(corsOptions), projects.createPersonProject);
router.get('/:userID/units/:unitID/members/:personID/projects/:projectID', cors(corsOptions), projects.getProjectInfo);
router.put('/:userID/units/:unitID/members/:personID/projects/:projectID', cors(corsOptions), projects.updatePersonProject);
router.post('/:userID/units/:unitID/members/:personID/projects/:projectID', cors(corsOptions), projects.createPersonProjectAssociation);
//Permissions
router.get('/:userID/units/:unitID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.getPermissions);
router.post('/:userID/units/:unitID/members/:personID/app-area-permissions', cors(corsOptions), manageAppAreaPermissionsUnit.createPermissions);
router.put('/:userID/units/:unitID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.updatePermissions);
router.delete('/:userID/units/:unitID/members/:personID/app-area-permissions/:permissionID', cors(corsOptions), manageAppAreaPermissionsUnit.deletePermissions);
router.get('/:userID/units/:unitID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.getPermissions);
router.post('/:userID/units/:unitID/members/:personID/permissions', cors(corsOptions), managePermissionsUnit.createPermissions);
router.put('/:userID/units/:unitID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.updatePermissions);
router.delete('/:userID/units/:unitID/members/:personID/permissions/:permissionID', cors(corsOptions), managePermissionsUnit.deletePermissions);

router.get('/:userID/units/:unitID/members/:personID/permission-levels', cors(corsOptions), managePermissionLevels.getPermissionLevel);
router.put('/:userID/units/:unitID/members/:personID/permission-levels', cors(corsOptions), managePermissionLevels.updatePermissionLevel);

//Supervisor
router.get('/:userID/units/:unitID/members/:personID/students', cors(corsOptions), supervising.getStudents);
router.post('/:userID/units/:unitID/members/:personID/students', cors(corsOptions), supervising.addStudent);
router.get('/:userID/units/:unitID/members/:personID/students/:studentID', cors(corsOptions), supervising.getStudentDetails);
router.put('/:userID/units/:unitID/members/:personID/students/:studentID/supervisors/:supervisorID', cors(corsOptions), supervising.updateStudentSupervisors);
router.delete('/:userID/units/:unitID/members/:personID/students/:studentID/supervisors/:supervisorID', cors(corsOptions), supervising.deleteStudentSupervisors);
router.post('/:userID/units/:unitID/members/:personID/students/:studentID/lab-position', cors(corsOptions), supervising.addStudentLabPosition);
router.post('/:userID/units/:unitID/members/:personID/students/:studentID/facility-position', cors(corsOptions), supervising.addStudentFacilityPosition);
router.post('/:userID/units/:unitID/members/:personID/students/:studentID/science-management-position', cors(corsOptions), supervising.addStudentScienceManagementPosition);
router.post('/:userID/units/:unitID/members/:personID/students/:studentID/administrative-position', cors(corsOptions), supervising.addStudentAdministrativePosition);
router.put('/:userID/units/:unitID/members/:personID/students/:studentID/lab-position/:positionID', cors(corsOptions), supervising.updateStudentLabPosition);
router.put('/:userID/units/:unitID/members/:personID/students/:studentID/facility-position/:positionID', cors(corsOptions), supervising.updateStudentFacilityPosition);
router.put('/:userID/units/:unitID/members/:personID/students/:studentID/science-management-position/:positionID', cors(corsOptions), supervising.updateStudentScienceManagementPosition);
router.put('/:userID/units/:unitID/members/:personID/students/:studentID/administrative-position/:positionID', cors(corsOptions), supervising.updateStudentAdministrativePosition);
router.delete('/:userID/units/:unitID/members/:personID/students/:studentID/lab-position/:positionID', cors(corsOptions), supervising.deleteStudentLabPosition);
router.delete('/:userID/units/:unitID/members/:personID/students/:studentID/facility-position/:positionID', cors(corsOptions), supervising.deleteStudentFacilityPosition);
router.delete('/:userID/units/:unitID/members/:personID/students/:studentID/science-management-position/:positionID', cors(corsOptions), supervising.deleteStudentScienceManagementPosition);
router.delete('/:userID/units/:unitID/members/:personID/students/:studentID/administrative-position/:positionID', cors(corsOptions), supervising.deleteStudentAdministrativePosition);
//Spaces
router.get('/:userID/units/:unitID/members/:personID/all-spaces', cors(corsOptions), spaces.getAllSpaces);
router.get('/:userID/units/:unitID/members/:personID/spaces', cors(corsOptions), spaces.getPersonSpaces);
router.post('/:userID/units/:unitID/members/:personID/spaces', cors(corsOptions), spaces.addPersonSpaces);
router.post('/:userID/units/:unitID/members/:personID/spaces/:spaceID/roles', cors(corsOptions), spaces.addPersonRoles);
router.put('/:userID/units/:unitID/members/:personID/spaces/:spaceID/roles/:roleID', cors(corsOptions), spaces.updatePersonRoles);
router.delete('/:userID/units/:unitID/members/:personID/spaces/:spaceID/roles/:roleID', cors(corsOptions), spaces.deletePersonRoles);
router.get('/:userID/units/:unitID/members/:personID/supervisor-spaces', cors(corsOptions), spaces.getManagerSpaces);
router.post('/:userID/units/:unitID/members/:personID/supervisor-spaces', cors(corsOptions), spaces.addManagerSpaces);
router.get('/:userID/units/:unitID/members/:personID/supervisor-spaces/:spaceID', cors(corsOptions), spaces.getSpaceInfo);
router.put('/:userID/units/:unitID/members/:personID/supervisor-spaces/:spaceID', cors(corsOptions), spaces.updateManagerSpace);
router.delete('/:userID/units/:unitID/members/:personID/supervisor-spaces/:supervisorSpaceID', cors(corsOptions), spaces.deleteManagerSpace);
router.get('/:userID/units/:unitID/labs/:labID', cors(corsOptions), labMembers.getLabInfo);
router.get('/:userID/units/:unitID/labs/:labID/spaces', cors(corsOptions), labSpaces.getLabSpaces);
router.post('/:userID/units/:unitID/labs/:labID/spaces', cors(corsOptions), labSpaces.addLabSpaces);
router.get('/:userID/units/:unitID/labs/:labID/spaces/:spaceID', cors(corsOptions), labSpaces.getSpaceInfo);
router.put('/:userID/units/:unitID/labs/:labID/spaces/:spaceID', cors(corsOptions), labSpaces.updateLabSpace);
router.delete('/:userID/units/:unitID/labs/:labID/spaces/:labSpaceID', cors(corsOptions), labSpaces.deleteLabSpace);
//Private agreements (or industry collaborations)
router.get('/:userID/units/:unitID/members/:personID/all-industry-projects', cors(corsOptions), industryProjects.getAllProjects);
router.get('/:userID/units/:unitID/members/:personID/industry-projects', cors(corsOptions), industryProjects.getPersonProjects);
router.post('/:userID/units/:unitID/members/:personID/industry-projects', cors(corsOptions), industryProjects.createPersonProject);
//router.get('/:userID/units/:unitID/members/:personID/industry-projects/:projectID', cors(corsOptions), industryProjects.getProjectInfo);
router.put('/:userID/units/:unitID/members/:personID/industry-projects/:projectID', cors(corsOptions), industryProjects.updatePersonProject);
router.post('/:userID/units/:unitID/members/:personID/industry-projects/:projectID', cors(corsOptions), industryProjects.createPersonProjectAssociation);
//Training networks
router.get('/:userID/units/:unitID/members/:personID/all-training-networks', cors(corsOptions), trainingNetworks.getAllProjects);
router.get('/:userID/units/:unitID/members/:personID/training-networks', cors(corsOptions), trainingNetworks.getPersonProjects);
router.post('/:userID/units/:unitID/members/:personID/training-networks', cors(corsOptions), trainingNetworks.createPersonProject);
router.put('/:userID/units/:unitID/members/:personID/training-networks/:projectID', cors(corsOptions), trainingNetworks.updatePersonProject);
router.post('/:userID/units/:unitID/members/:personID/training-networks/:projectID', cors(corsOptions), trainingNetworks.createPersonProjectAssociation);
//Communications
//router.get('/:userID/units/:unitID/members/:personID/all-communications', cors(corsOptions), communications.getAllItems);
router.get('/:userID/units/:unitID/members/:personID/communications', cors(corsOptions), communications.getPersonItems);
router.post('/:userID/units/:unitID/members/:personID/communications', cors(corsOptions), communications.createPersonItem);
router.put('/:userID/units/:unitID/members/:personID/communications/:itemID', cors(corsOptions), communications.updatePersonItem);
router.delete('/:userID/units/:unitID/members/:personID/communications/:itemID', cors(corsOptions), communications.deletePersonItem);
//Patents
router.get('/:userID/units/:unitID/members/:personID/all-patents', cors(corsOptions), patents.getAllItems);
router.get('/:userID/units/:unitID/members/:personID/patents', cors(corsOptions), patents.getPersonItems);
router.post('/:userID/units/:unitID/members/:personID/patents', cors(corsOptions), patents.createPersonItem);
router.put('/:userID/units/:unitID/members/:personID/patents/:itemID', cors(corsOptions), patents.updatePersonItem);
router.post('/:userID/units/:unitID/members/:personID/patents/:itemID', cors(corsOptions), patents.createPersonItemAssociation);
//Startups
router.get('/:userID/units/:unitID/members/:personID/all-startups', cors(corsOptions), startups.getAllItems);
router.get('/:userID/units/:unitID/members/:personID/startups', cors(corsOptions), startups.getPersonItems);
router.post('/:userID/units/:unitID/members/:personID/startups', cors(corsOptions), startups.createPersonItem);
router.put('/:userID/units/:unitID/members/:personID/startups/:itemID', cors(corsOptions), startups.updatePersonItem);
router.post('/:userID/units/:unitID/members/:personID/startups/:itemID', cors(corsOptions), startups.createPersonItemAssociation);
//Prizes
router.get('/:userID/units/:unitID/members/:personID/all-prizes', cors(corsOptions), prizes.getAllItems);
router.get('/:userID/units/:unitID/members/:personID/prizes', cors(corsOptions), prizes.getPersonItems);
router.post('/:userID/units/:unitID/members/:personID/prizes', cors(corsOptions), prizes.createPersonItem);
router.put('/:userID/units/:unitID/members/:personID/prizes/:itemID', cors(corsOptions), prizes.updatePersonItem);
router.post('/:userID/units/:unitID/members/:personID/prizes/:itemID', cors(corsOptions), prizes.createPersonItemAssociation);
//Boards
router.get('/:userID/units/:unitID/members/:personID/all-boards', cors(corsOptions), boards.getAllItems);
router.get('/:userID/units/:unitID/members/:personID/boards', cors(corsOptions), boards.getPersonItems);
router.post('/:userID/units/:unitID/members/:personID/boards', cors(corsOptions), boards.createPersonItem);
router.put('/:userID/units/:unitID/members/:personID/boards/:itemID', cors(corsOptions), boards.updatePersonItem);
router.post('/:userID/units/:unitID/members/:personID/boards/:itemID', cors(corsOptions), boards.createPersonItemAssociation);
//Datasets
router.get('/:userID/units/:unitID/members/:personID/all-datasets', cors(corsOptions), datasets.getAllItems);
router.get('/:userID/units/:unitID/members/:personID/datasets', cors(corsOptions), datasets.getPersonItems);
router.post('/:userID/units/:unitID/members/:personID/datasets', cors(corsOptions), datasets.createPersonItem);
router.put('/:userID/units/:unitID/members/:personID/datasets/:itemID', cors(corsOptions), datasets.updatePersonItem);
router.post('/:userID/units/:unitID/members/:personID/datasets/:itemID', cors(corsOptions), datasets.createPersonItemAssociation);
//Outreaches
router.get('/:userID/units/:unitID/members/:personID/all-outreaches', cors(corsOptions), outreaches.getAllItems);
router.get('/:userID/units/:unitID/members/:personID/outreaches', cors(corsOptions), outreaches.getPersonItems);
router.post('/:userID/units/:unitID/members/:personID/outreaches', cors(corsOptions), outreaches.createPersonItem);
router.put('/:userID/units/:unitID/members/:personID/outreaches/:itemID', cors(corsOptions), outreaches.updatePersonItem);
router.post('/:userID/units/:unitID/members/:personID/outreaches/:itemID', cors(corsOptions), outreaches.createPersonItemAssociation);

router.get('/:userID/units/:unitID/members/:personID/department-teams', cors(corsOptions), departmentTeams.getPersonDepartmentTeam);
router.post('/:userID/units/:unitID/members/:personID/department-teams', cors(corsOptions), departmentTeams.createPersonDepartmentTeam);
router.put('/:userID/units/:unitID/members/:personID/department-teams/:departmentTeamID', cors(corsOptions), departmentTeams.updatePersonDepartmentTeam);
router.delete('/:userID/units/:unitID/members/:personID/department-teams/:departmentTeamID', cors(corsOptions), departmentTeams.deletePersonDepartmentTeam);

/* All units at the same time */
router.get('/:userID/current-members', cors(corsOptions), membersAll.getMembersList);

// Spaces management
router.get('/:userID/cities/:cityID/spaces', cors(corsOptions), spaceManagement.getSpacesList);
router.put('/:userID/cities/:cityID/spaces/:spaceID', cors(corsOptions), spaceManagement.updateSpaceData);
router.post('/:userID/cities/:cityID/spaces/:spaceID/teams', cors(corsOptions), spaceManagement.createSpaceTeam);
router.put('/:userID/cities/:cityID/spaces/:spaceID/teams/:spaceTeamID', cors(corsOptions), spaceManagement.updateSpaceTeam);
router.delete('/:userID/cities/:cityID/spaces/:spaceID/teams/:spaceTeamID', cors(corsOptions), spaceManagement.deleteSpaceTeam);
router.post('/:userID/cities/:cityID/spaces/:spaceID/people', cors(corsOptions), spaceManagement.createSpacePerson);
router.put('/:userID/cities/:cityID/spaces/:spaceID/people/:spacePersonID', cors(corsOptions), spaceManagement.updateSpacePerson);
router.delete('/:userID/cities/:cityID/spaces/:spaceID/people/:spacePersonID', cors(corsOptions), spaceManagement.deleteSpacePerson);



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