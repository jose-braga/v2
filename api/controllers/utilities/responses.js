module.exports.sendJSONResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.sendJSONResponseOptions = function (options) {
    let {response, status, message} = options;
    response.status(status);
    response.json(message);
};