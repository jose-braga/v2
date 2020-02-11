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

const nuclearInformation = require('../controllers/people/nuclear_information');
const personalContacts = require('../controllers/people/personal_contacts');
const photo = require('../controllers/people/photo');
const degrees = require('../controllers/people/degrees');
const institutionalContacts = require('../controllers/people/institutional_contacts');
const emergencyContacts = require('../controllers/people/emergency_contacts');
const identifications = require('../controllers/people/identifications');
const cars = require('../controllers/people/cars');
const institutionalAffiliations = require('../controllers/people/institutional_affiliations');
const researchIDs = require('../controllers/people/research_IDs');
const institutionalResponsibles = require('../controllers/people/institutional_responsibles');
const professionalSituations = require('../controllers/people/professional_situations');
const publicationsList = require('../controllers/people/publications_list');
const addPublications = require('../controllers/people/add_publications');
const addPubORCID = require('../controllers/people/add_pub_ORCID');
const addPubRepository = require('../controllers/people/add_pub_repository');

router.get('/:personID/external-api-authorization', cors(corsOptions), externalAPI.getAuthorization);
router.put('/:personID/external-api-authorization', cors(corsOptions), externalAPI.updateAuthorization);
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
router.put('/:personID/photos/:imageType', cors(corsOptions), photo.uploadPhoto);
router.get('/:personID/photos/:imageType', cors(corsOptions), photo.getPhoto);
//Degrees (degreeID is the id on the degrees_people table)
router.get('/:personID/degrees', cors(corsOptions), degrees.getDegrees);
router.put('/:personID/degrees/:degreeID', cors(corsOptions), degrees.updateDegrees);
router.delete('/:personID/degrees/:degreeID', cors(corsOptions), degrees.deleteDegrees);
router.post('/:personID/degrees', cors(corsOptions), degrees.createDegrees);
// Institutional settings
router.get('/:personID/institutional-phone', cors(corsOptions), institutionalContacts.getInstitutionalPhone);
router.put('/:personID/institutional-phone/:phoneID', cors(corsOptions), institutionalContacts.updateInstitutionalPhone);
router.post('/:personID/institutional-phone', cors(corsOptions), institutionalContacts.createInstitutionalPhone);
router.get('/:personID/institutional-email', cors(corsOptions), institutionalContacts.getInstitutionalEmail);
router.put('/:personID/institutional-email/:emailID', cors(corsOptions), institutionalContacts.updateInstitutionalEmail);
router.post('/:personID/institutional-email', cors(corsOptions), institutionalContacts.createInstitutionalEmail);
router.get('/:personID/researcher-ids', cors(corsOptions), researchIDs.getResearcherIDs);
router.post('/:personID/researcher-ids', cors(corsOptions), researchIDs.createResearcherIDs);
router.put('/:personID/researcher-ids/:researcherInfoID', cors(corsOptions), researchIDs.updateResearcherIDs);
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
//Publications
router.get('/all-publications', cors(corsOptions), publicationsList.getAllPublications);
router.get('/:personID/publications', cors(corsOptions), publicationsList.getPublications);
router.get('/:personID/pure-publications', cors(corsOptions), addPubRepository.getPUREPublications);
router.post('/:personID/people-publications/:publicationID', cors(corsOptions), addPublications.createPersonPublicationAssociation);
router.put('/:personID/people-publications/:publicationID', cors(corsOptions), publicationsList.updatePersonPublicationAssociation);
router.delete('/:personID/people-publications/:publicationID', cors(corsOptions), publicationsList.deletePersonPublicationAssociation);
router.put('/:personID/publications/:publicationID', cors(corsOptions), publicationsList.updatePublication);

router.post('/:personID/journals', cors(corsOptions), addPubORCID.createJournal);
router.post('/:personID/journals/:journalID/publications', cors(corsOptions), addPubORCID.createPublication);

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
