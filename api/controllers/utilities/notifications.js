const http = require('./axios-improved')

var notifyWebsiteAPI = function (options) {
    let { entityType, entityID, operation, baseURL} = options;
    if (baseURL === undefined) {
        baseURL = 'https://www.requimte.pt/ucibio/api'
    }
    if (operation === undefined) {
        operation = 'update'
    }
    if (entityType === undefined) {
        entityType = 'people'
    }
    let url = baseURL + '/' + operation  + '/' + entityType + '/' + entityID;
    if (operation === 'update' || operation === 'delete') {
        return http.get(url)
            .catch((err) => {
                console.log('Failed:', url);
                console.log(err);
            });
    } else {
        // create
        return http.get(url)
            .then((result) => {
                if (result.data.statusCode !== 200) {
                    updateConfig = {
                        entityID,
                        entityType,
                        baseURL,
                        operation: 'update'
                    }
                    return notifyWebsiteAPI(updateConfig)
                }
            })
            .catch((err) => {
                console.log('Failed:', url);
                console.log(err);
            });
    }
};

module.exports.notifyWebsiteAPI = notifyWebsiteAPI;