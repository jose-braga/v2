var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

module.exports.generateJWT = function (user) {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign({
        userID: user.user_id,
        username: user.username,
        personID: user.person_id,
        cities: user.cities,
        currentCities: user.current_cities,
        labs: user.labs,
        currentLabs: user.current_labs,
        groups: user.groups,
        currentGroups: user.current_groups,
        units: user.units,
        currentUnits: user.current_units,
        technicianOffices: user.tech_offices,
        currentTechnicianOffices: user.current_tech_offices,
        scienceManagerOffices: user.sc_man_offices,
        currentScienceManagerOffices: user.current_sc_man_offices,
        administrativeOffices: user.administrative_offices,
        currentAdministrativeOffices: user.current_administrative_offices,
        permissionLevel: user.permission_level,
        permissionPeople: user.permission_people,
        permissionLabs: user.permission_labs,
        permissionLabsGroups: user.permission_labs_groups,
        permissionGroups: user.permission_groups,
        permissionUnits: user.permission_units,
        permissionCities: user.permission_cities,
        permissionUnitsCities: user.permission_units_cities,
        permissionDocuments: user.permission_documents,
        permissionsWebAreas: user.permissions_web_areas,
        base_url: process.env.PATH_PREFIX,
        exp: parseInt(expiry.getTime() / 1000, 10)
    }, process.env.JWT_SECRET);
};
/*
module.exports.generateJWTPreReg = function (userID, personID, stat, username, cityID) {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 1); // pre-registration token is valid only for 1 day
    return jwt.sign({
        userID: userID,
        personID: personID,
        stat: stat,
        username: username,
        cityID: cityID,
        base_url: process.env.PATH_PREFIX,
        exp: parseInt(expiry.getTime() / 1000, 10)
    }, process.env.JWT_SECRET);
};
*/
module.exports.hashPassword = function (password) {
    var hash = bcrypt.hashSync(password, 10);
    return hash;
};

module.exports.checkPassword = function (password, hash) {
    return bcrypt.compareSync(password, hash);
};