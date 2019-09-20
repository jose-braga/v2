import * as moment from "moment-timezone"

var momentToDate = function (timedate, timezone, timeformat) {
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

var processResultsDate = function (data) {
    data = momentToDate(data);
    return data;
};

export default {
    momentToDate,
    moment,
    processResultsDate,
}