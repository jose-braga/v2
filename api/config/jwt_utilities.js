var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

module.exports.generateJWT = function (user) {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign({
        userID: user.user_id,
        username: user.username,
        personID: user.person_id,
        currentUnits: user.current_units,
        permissionsLevel: user.permissions_level,
        permissionsEndpoints: user.permissions_endpoints,
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