var compareOriginal = function (original, current, key) {
    let create = [];
    let update = [];
    let trash = [];

    for (let el in original) {
        let toDelete = true;
        for (let elCurr in current) {
            if (original[el][key] === current[elCurr][key]) {
                toDelete = false;
                current[elCurr].found = true;
                update.push(current[elCurr]);
                break;
            }
        }
        if (toDelete) {
            trash.push(original[el]);
        }
    }
    for (let elCurr in current) {
        if (current[elCurr].found === undefined || current[elCurr].found === false) {
            create.push(current[elCurr])
        }
    }
    return {
        update: update,
        create: create,
        trash: trash
    }
};

var getInfoPopulate = function (vm, url, all) {
    return vm.$http.get(
        url, {
            headers: { 'Authorization': 'Bearer ' + localStorage['v2-token'] },
        })
        .then((result) => {
            if (all) {
                return result.data.result;
            } else {
                if (result.data.result.length > 0) {
                    return result.data.result[0];
                } else {
                    return undefined;
                }

            }
        })
        .catch((error) => {
            // eslint-disable-next-line
            console.log(error)
        });
};

var getPublicInfo = function (vm, url, data, sortKey) {
    return vm.$http.get(
        url, {})
        .then((result) => {
            let res = result.data.result;
            if (sortKey !== undefined && res !== undefined && res.length > 0) {
                // sniffs content to chekc if it is string,
                // otherwise considered to be number
                if (typeof res[0][sortKey] === 'string' || res[0][sortKey] instanceof String) {
                    res.sort((a, b) => a[sortKey].localeCompare(b[sortKey]))
                } else {
                    res.sort((a, b) => a[sortKey] - b[sortKey])
                }
            }
            vm[data] = res;
            return res;
        })
        .catch((error) => {
            // eslint-disable-next-line
            console.log(error)
        });
};

var checkPermissions = function(reqURL, reqMethod, permURL, permMethod) {
    let endpointPerm = permURL.replace(/\*/g, '\\d+');
    let endpointRegex = new RegExp('^' + endpointPerm + '$');
    if (endpointRegex.test(reqURL)
        && reqMethod === permMethod) {
        return true;
    } else {
        return false;
    }
}

export default {
    compareOriginal,
    getInfoPopulate,
    getPublicInfo,
    checkPermissions,
}