const http = require('./axios-improved')

var notifyWebsiteAPI = function (options) {
    let { entityType, entityID, operation, baseURL, startedWith, errorStart } = options;
    if (baseURL === undefined) {
        if (process.env.NODE_ENV === 'production') {
            baseURL = 'https://ucibio.pt/api'
        } else {
            baseURL = 'https://ucibio.pt/api'
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
            let date = new Date();
            if (result.data.statusCode === 200) {
                console.log(date.toISOString(),'- (1) Notification to', url,'was successful.')
            } else {
                if (startedWith !== undefined ) {
                    console.log(date.toISOString(),'- Notification to', url,
                        'had a problem:', result.data.statusCode,
                        '- Notification started with a "' + startedWith + '" operation',
                        '(initial error code: ' + errorStart + ')')
                } else {
                    console.log(date.toISOString(),'- Notification to', url,
                        'had a problem:', result.data.statusCode)
                }
            }
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
                    operation: 'update',
                    startedWith: 'create',
                    errorStart: result.data.statusCode
                }
                return notifyWebsiteAPI(updateConfig)
            } else {
                let date = new Date()
                console.log(date.toISOString(),'- (2) Notification to', url,'was successful.')
            }
        })
        .catch((err) => {
            console.log('Failed (create or update):', url);
            console.log(err);
        });
    }
};

module.exports.notifyWebsiteAPI = notifyWebsiteAPI;