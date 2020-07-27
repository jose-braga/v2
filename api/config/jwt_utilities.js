var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

module.exports.generateJWT = function (user) {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign({
        userID: user.user_id,
        username: user.username,
        personID: user.person_id,
        personName: user.person_name,
        currentUnits: user.current_units,
        currentCity: user.current_city,
        permissionsLevel: user.permissions_level,
        permissionsEndpoints: user.permissions_endpoints,
        permissionsWebAreas: user.permissions_web_areas,
        base_url: process.env.PATH_PREFIX,
        exp: parseInt(expiry.getTime() / 1000, 10)
    }, process.env.JWT_SECRET);
};

module.exports.generateJWTRecommendation = function (user) {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 1); // pre-registration token is valid only for 1 day
    return jwt.sign({
        recommenderID: user.id,
        applicationID: user.application_id,
        callID: user.call.id,
        exp: parseInt(expiry.getTime() / 1000, 10)
    }, process.env.JWT_SECRET);
};

module.exports.hashPassword = function (password) {
    var hash = bcrypt.hashSync(password, 10);
    return hash;
};

module.exports.checkPassword = function (password, hash) {
    return bcrypt.compareSync(password, hash);
};