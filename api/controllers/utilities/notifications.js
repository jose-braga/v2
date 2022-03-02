const http = require('./axios-improved')

var notifyWebsiteAPI = function (options) {
    let { entityType, entityID, operation, baseURL} = options;
    if (baseURL === undefined) {
        if (process.env.NODE_ENV === 'production') {
            baseURL = 'https://ucibio.pt/api'
        } else {
            baseURL = 'http://ucibio_website_legacy_web_1/api'
        }
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
        .then((result) => {
            let date = new Date()
            console.log(date.toISOString(),'- Notification to', url,'was successful.')
        })
        .catch(function (error) {
            console.log(error);
        })
    } else {
        // create
        return http.get(url)
        .then((result) => {
            if (result.data.statusCode !== 200) {
                let updateConfig = {
                    entityID,
                    entityType,
                    baseURL,
                    operation: 'update'
                }
                return notifyWebsiteAPI(updateConfig)
            } else {
                let date = new Date()
                console.log(date.toISOString(),'- Notification to', url,'was successful.')
            }
        })
        .catch((err) => {
            console.log('Failed (create or update):', url);
            console.log(err);
        });
    }
};

module.exports.notifyWebsiteAPI = notifyWebsiteAPI;