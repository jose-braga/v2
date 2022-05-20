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

var sorter = function (data, key, inverse) {
    if (inverse === undefined) {
        inverse = true;
    }
    if (inverse) {
        data.sort((a, b) => {
            if (a[key] === null || a[key] === undefined ) {
                a['date_sort'] = moment('1000-01-01');
            } else {
                a['date_sort'] = moment(a[key]);
            }
            if (b[key] === null || b[key] === undefined) {
                b['date_sort'] = moment('1000-01-01');
            } else {
                b['date_sort'] = moment(b[key]);
            }
            if (a['date_sort'].isAfter(b['date_sort'])) {
                return -1;
            } else {
                return 1;
            }
        });
    } else {
        data.sort((a, b) => {
            if (a[key] === null || a[key] === undefined) {
                a['date_sort'] = moment('9999-01-01');
            } else {
                a['date_sort'] = moment(a[key]);
            }
            if (b[key] === null || b[key] === undefined) {
                b['date_sort'] = moment('9999-01-01');
            } else {
                b['date_sort'] = moment(b[key]);
            }
            if (a['date_sort'].isAfter(b['date_sort'])) {
                return 1;
            } else {
                return -1;
            }
        });
    }
    return data;
};

var validate = function(value) {
    if (value === null || value === undefined || value === '') {
        return true;
    } else {
        if (moment(value).isValid()) {
            return true;
        } else {
            return false;
        }
    }
}

export default {
    momentToDate,
    moment,
    processResultsDate,
    sorter,
    validate
}