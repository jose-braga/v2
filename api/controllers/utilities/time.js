const moment = require("moment-timezone");

const momentToDate = function (timedate, timezone, timeformat) {
    if (timezone === undefined) {
        timezone = 'Europe/Lisbon';
    }
    if (timeformat === undefined) {
        timeformat = 'YYYY-MM-DD';
    }
    if (timedate !== null) {
        return moment.tz(timedate, timezone).format(timeformat);
    } else {
        return null;
    }
};

const overlap = function (tstart1, tend1, tstart2, tend2) {
    if (tstart1 !== null) { tstart1 = moment(tstart1); }
    if (tend1 !== null) { tend1 = moment(tend1); }
    if (tstart2 !== null) { tstart2 = moment(tstart2); }
    if (tend2 !== null) { tend2 = moment(tend2); }
    if (tstart1 !== null) {
        if (tend2 !== null) {
            if (tstart1.isAfter(tend2)) {
                return false;
            }
        }
    } else {
        if (tend1 !== null) {
            if (tstart2 !== null) {
                if (tend1.isBefore(tstart2)) {
                    return false;
                }
            }
        }
    }
    if (tend1 !== null) {
        if (tstart2 !== null) {
            if (tend1.isBefore(tstart2)) {
                return false;
            }
        }
    }
    return true;
};


module.exports.momentToDate = momentToDate;
module.exports.moment = moment;
module.exports.overlap = overlap;