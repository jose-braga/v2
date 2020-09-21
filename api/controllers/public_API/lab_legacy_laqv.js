const sql = require('../utilities/sql');
const time = require('../utilities/time');
const responses = require('../utilities/responses');

module.exports.getLabMembers = function (req, res, next) {
    let groupID = req.params.groupID
    let labID = req.params.labID
    let querySQL;
    let places = [];
    querySQL = 'SELECT DISTINCT people.id, people.name AS full_name, people.colloquial_name AS name,'
             + ' people.active_from, people.active_until,'
             + ' emails.email, phones.phone, phones.extension AS phone_extension,'
             + ' personal_photo.url AS image_path,'
             + ' people_labs.valid_from AS lab_start,people_labs.valid_until AS lab_end,'
             + ' people_labs.lab_position_id,'
             + ' lab_positions.name_en AS lab_position_name_en, lab_positions.name_pt AS lab_position_name_pt,'
             + ' people_labs.sort_order,'
             + ' labs.id AS lab_id, labs.name AS lab_name,'
             + ' labs_groups.valid_from AS labs_groups_valid_from, labs_groups.valid_until AS labs_groups_valid_until,'
             + ' groups.id AS group_id, groups.name AS group_name,'
             + ' units.id AS unit_id, units.name AS unit_name'
             + ' FROM people'
             + ' LEFT JOIN people_labs ON people.id = people_labs.person_id'
             + ' LEFT JOIN labs ON labs.id = people_labs.lab_id'
             + ' LEFT JOIN labs_groups ON labs_groups.lab_id = labs.id'
             + ' LEFT JOIN `groups` ON labs_groups.group_id = `groups`.id'
             + ' LEFT JOIN groups_units ON groups_units.group_id = `groups`.id'
             + ' LEFT JOIN units ON groups_units.unit_id = units.id'
             + ' LEFT JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
             + ' LEFT JOIN emails ON people.id = emails.person_id'
             + ' LEFT JOIN phones ON people.id = phones.person_id'
             + ' LEFT JOIN personal_photo ON people.id = personal_photo.person_id'
             + ' WHERE people.status = ? AND people.visible_public = 1'
             + ' AND ( (people.active_from <= CURDATE() AND people.active_until >= CURDATE()) '
                + ' OR (people.active_from <= CURDATE() AND people.active_until IS NULL)'
                + ' OR (people.active_from IS NULL AND people.active_until >= CURDATE())'
                + ' OR (people.active_from IS NULL AND people.active_until IS NULL) )'
            + ' AND ( (people_labs.valid_from <= CURDATE() AND people_labs.valid_until >= CURDATE()) '
                + ' OR (people_labs.valid_from <= CURDATE() AND people_labs.valid_until IS NULL)'
                + ' OR (people_labs.valid_from IS NULL AND people_labs.valid_until >= CURDATE())'
                + ' OR (people_labs.valid_from IS NULL AND people_labs.valid_until IS NULL) )'
            + ' AND labs.id = ? AND `groups`.id = ?'
    places.push(1, labID, groupID);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data = []
            for (let ind in resQuery) {
                data.push(
                    {
                        id: resQuery[ind].id,
                        full_name: resQuery[ind].full_name,
                        name: resQuery[ind].name,
                        active_from: resQuery[ind].active_from,
                        active_until: resQuery[ind].active_until,
                        email: resQuery[ind].email,
                        phone: resQuery[ind].phone,
                        phone_extension: resQuery[ind].phone_extension,
                        image_path: resQuery[ind].image_path,
                        lab_data: [
                            {
                                lab_start: resQuery[ind].lab_start,
                                lab_end: resQuery[ind].lab_end,
                                lab_position_id: resQuery[ind].lab_position_id,
                                lab_position_name_en: resQuery[ind].lab_position_name_en,
                                lab_position_name_pt: resQuery[ind].lab_position_name_pt,
                                sort_order: resQuery[ind].sort_order,
                                lab_id: resQuery[ind].lab_id,
                                lab_name: resQuery[ind].lab_name,
                                labs_groups_valid_from: resQuery[ind].labs_groups_valid_from,
                                labs_groups_valid_until: resQuery[ind].labs_groups_valid_until,
                                group_id: resQuery[ind].group_id,
                                group_name: resQuery[ind].group_name,
                                unit_id: resQuery[ind].unit_id,
                                unit_name: resQuery[ind].unit_name,

                            }
                        ]

                    }
                )
            }
            responses.sendJSONResponse(res, 200,
                {
                    "status": "success",
                    "statusCode": 200,
                    "count": data.length,
                    "result": data,
                });
            return;
        },
        {req, res, next}
    )
};

module.exports.getGroupsList = function (req, res, next) {
    var places = []
    var unitID = null;
    if (req.query.hasOwnProperty('unit')) {
        unitID = req.query.unit;
    }
    var querySQL = 'SELECT `groups`.id AS group_id, `groups`.name, `groups`.short_name AS group_short_name, ' +
                ' `groups`.started, `groups`.finished, ' +
                ' units.id AS unit_id, units.short_name AS unit, units.name AS unit_full_name' +
                ' FROM `groups`' +
                ' LEFT JOIN groups_units ON groups_units.group_id = `groups`.id' +
                ' LEFT JOIN units ON groups_units.unit_id = units.id';
    if (unitID !== null) {
        querySQL = querySQL + ' WHERE units.id = ?';
        places.push(unitID);
    }
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            responses.sendJSONResponse(res, 200,
                {
                    "status": "success",
                    "statusCode": 200,
                    "count": resQuery.length,
                    "result": resQuery,
                });
            return;
        },
        {req, res, next}
    )
};
module.exports.getGroupInfo = function (req, res, next) {
    var groupID = req.params.groupID;
    var querySQL = 'SELECT `groups`.id AS group_id, `groups`.name, `groups`.short_name AS group_short_name, ' +
                   ' `groups`.started, `groups`.finished,' +
                   ' units.id AS unit_id, units.short_name AS unit, units.name AS unit_full_name' +
                   ' FROM `groups`' +
                   ' LEFT JOIN groups_units ON groups_units.group_id = `groups`.id' +
                   ' LEFT JOIN units ON groups_units.unit_id = units.id' +
                   ' WHERE `groups`.id = ?;';
    var places = [groupID];
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            responses.sendJSONResponse(res, 200,
                {
                    "status": "success",
                    "statusCode": 200,
                    "count": resQuery.length,
                    "result": resQuery,
                });
            return;
        },
        {req, res, next}
    )
};
var getEmail = function(options) {
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT email from emails WHERE person_id = ?;';
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.people[i].email = resQuery[0].email;
            } else {
                options.people[i].email = '';
            }
            return getPhones(options);
        },
        options
    );
};
var getPhones = function(options) {
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT phone, extension FROM phones WHERE person_id = ?;';
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.people[i].phone = resQuery[0].phone;
                options.people[i].phone_extension = resQuery[0].extension;
            } else {
                options.people[i].phone = '';
                options.people[i].phone_extension = '';
            }
            return getPhoto(options);
        },
        options
    );
};
var getPhoto = function(options) {
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT personal_photo.*, personal_photo_type.name_en AS photo_type_name_en'
             + ' FROM personal_photo'
             + ' JOIN personal_photo_type ON personal_photo_type.id = personal_photo.photo_type_id'
             + ' WHERE personal_photo.person_id = ?;';
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            data = [];
            for (let ind in resQuery){
                data.push({
                    photo_type_id: resQuery[ind].photo_type_id,
                    photo_type_name_en: resQuery[ind].photo_type_name_en,
                    image_path: resQuery[ind].url,
                })
            }
            options.people[i].photo_data = data;
            return getLabs(options);
        },
        options
    );
};
var getLabs = function(options) {
    // Gets current affiliations for current people
    let { req, res, next, people, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT people_labs.*,'
             + ' labs.name AS lab_name, labs.started, labs.finished,'
             + ' lab_positions.name_en AS lab_position_name_en, lab_positions.name_pt AS lab_position_name_pt'
             + ' FROM people_labs'
             + ' LEFT JOIN labs ON labs.id = people_labs.lab_id'
             + ' LEFT JOIN lab_positions ON lab_positions.id = people_labs.lab_position_id'
             + ' WHERE people_labs.person_id = ?'
             + ' AND ('
             + ' (people_labs.valid_from <= CURDATE() AND people_labs.valid_until >= CURDATE())'
             + ' OR (people_labs.valid_from <= CURDATE() AND people_labs.valid_until IS NULL)'
             + ' OR (people_labs.valid_from IS NULL AND people_labs.valid_until >= CURDATE())'
             + ' OR (people_labs.valid_from IS NULL AND people_labs.valid_until IS NULL)'
             + ')'
             + ' AND ('
             + ' (labs.started <= CURDATE() AND labs.finished >= CURDATE())'
             + ' OR (labs.started <= CURDATE() AND labs.finished IS NULL)'
             + ' OR (labs.started IS NULL AND labs.finished >= CURDATE())'
             + ' OR (labs.started IS NULL AND labs.finished IS NULL)'
             + ')'
             ;
    places.push(people[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            // now for each lab gets its current group
            let data = [];
            for (let ind in resQuery) {
                data.push({
                    sort_order: resQuery[ind].sort_order,
                    lab_id: resQuery[ind].lab_id,
                    lab_name: resQuery[ind].lab_name,
                    lab_start: resQuery[ind].valid_from,
                    lab_end: resQuery[ind].valid_until,
                    lab_position_id: resQuery[ind].lab_position_id,
                    lab_position_name_en: resQuery[ind].lab_position_name_en,
                    lab_position_name_pt: resQuery[ind].lab_position_name_pt
                });
            }
            options.people[i].lab_data = data;
            if (resQuery.length > 0) {
                options.j = 0
                return getLabGroup(options);
            } else {
                // it would be strange if this happens
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": people.length,
                        "result": options.people,
                    });
                return;

            }
        },
        options
    );
};
var getLabGroup = function(options) {
    let { req, res, next, people, i, j } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT labs_groups.*,'
             + ' groups.name AS group_name, groups.started, groups.finished'
             + ' FROM labs_groups'
             + ' LEFT JOIN `groups` ON groups.id = labs_groups.group_id'
             + ' WHERE labs_groups.lab_id = ?'
             + ' AND ('
             + ' (labs_groups.valid_from <= CURDATE() AND labs_groups.valid_until >= CURDATE())'
             + ' OR (labs_groups.valid_from <= CURDATE() AND labs_groups.valid_until IS NULL)'
             + ' OR (labs_groups.valid_from IS NULL AND labs_groups.valid_until >= CURDATE())'
             + ' OR (labs_groups.valid_from IS NULL AND labs_groups.valid_until IS NULL)'
             + ')';
    places.push(people[i].lab_data[j].lab_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            // there should be only 1 group per lab at a time
            // also it should always return a result
            options.people[i].lab_data[j].group_id = resQuery[0].group_id;
            options.people[i].lab_data[j].group_name = resQuery[0].group_name;
            options.people[i].lab_data[j].labs_groups_valid_from = resQuery[0].valid_from;
            options.people[i].lab_data[j].labs_groups_valid_until = resQuery[0].valid_until;
            return getGroupUnit(options);
        },
        options
    );
};
var getGroupUnit = function(options) {
    let { req, res, next, people, i, j } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT groups_units.*,'
             + ' units.name AS unit_name, units.started, units.finished'
             + ' FROM groups_units'
             + ' LEFT JOIN units ON units.id = groups_units.unit_id'
             + ' WHERE groups_units.group_id = ?'
             + ' AND ('
             + ' (groups_units.valid_from <= CURDATE() AND groups_units.valid_until >= CURDATE())'
             + ' OR (groups_units.valid_from <= CURDATE() AND groups_units.valid_until IS NULL)'
             + ' OR (groups_units.valid_from IS NULL AND groups_units.valid_until >= CURDATE())'
             + ' OR (groups_units.valid_from IS NULL AND groups_units.valid_until IS NULL)'
             + ')';
    places.push(people[i].lab_data[j].group_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            // there should be only 1 unit per group at a time
            // also it should always return a result
            options.people[i].lab_data[j].unit_id = resQuery[0].unit_id;
            options.people[i].lab_data[j].unit_name = resQuery[0].unit_name;
            if (j + 1 < people[i].lab_data.length) {
                options.j = options.j + 1;
                return getLabGroup(options);

            } if (i + 1 < people.length) {
                options.i = options.i + 1;
                return getEmail(options);

            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": people.length,
                        "result": people,
                    });
                return;

            }
        },
        options
    );
};
module.exports.getGroupMembers = function (req, res, next) {
    var groupID = req.params.groupID;
    var querySQL = 'SELECT DISTINCT people.id, people.name AS full_name, people.colloquial_name AS name,'
                 + ' people.active_from, people.active_until'
                 + ' FROM people'
                 + ' LEFT JOIN people_labs ON people.id = people_labs.person_id'
                 + ' LEFT JOIN labs ON labs.id = people_labs.lab_id'
                 + ' LEFT JOIN labs_groups ON labs_groups.lab_id = labs.id'
                 + ' LEFT JOIN `groups` ON labs_groups.group_id = `groups`.id'
                 + ' WHERE people.status = ?'
                 + ' AND people.visible_public = 1'
                 + ' AND ( (people.active_from <= CURDATE() AND people.active_until >= CURDATE()) '
                    + ' OR (people.active_from <= CURDATE() AND people.active_until IS NULL)'
                    + ' OR (people.active_from IS NULL AND people.active_until >= CURDATE())'
                    + ' OR (people.active_from IS NULL AND people.active_until IS NULL) )'
                 + ' AND ( (people_labs.valid_from <= CURDATE() AND people_labs.valid_until >= CURDATE()) '
                    + ' OR (people_labs.valid_from <= CURDATE() AND people_labs.valid_until IS NULL)'
                    + ' OR (people_labs.valid_from IS NULL AND people_labs.valid_until >= CURDATE())'
                    + ' OR (people_labs.valid_from IS NULL AND people_labs.valid_until IS NULL) )'
                 + ' AND `groups`.id = ?';
    var places = [1, groupID];
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.people = resQuery;
                options.i = 0;
                return getEmail(options);
            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": [],
                        "result": [],
                    });
                return;
            }
        },
        {req, res, next}
    )
};

var getOfficeMemberPhotos = function (options) {
    let { req, res, next, members, office_type, i } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT personal_photo.*, personal_photo_type.name_en AS photo_type_name_en'
             + ' FROM personal_photo'
             + ' JOIN personal_photo_type ON personal_photo_type.id = personal_photo.photo_type_id'
             + ' WHERE personal_photo.person_id = ?;';
    places.push(members[i].id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            data = [];
            for (let ind in resQuery){
                data.push({
                    photo_type_id: resQuery[ind].photo_type_id,
                    photo_type_name_en: resQuery[ind].photo_type_name_en,
                    image_path: resQuery[ind].url,
                })
            }
            options.members[i].photo_data = data;
            if (office_type === 'technician') {
                return getTechnicianUnits(options);
            } else if (office_type === 'science-manager') {
                return getScienceManagerUnits(options);
            } else if (office_type === 'administrative') {
                return getAdministrativeUnits(options);
            }
        },
        options
    );
};

var getTechnicianUnits = function (options) {
    let { req, res, next, members, i } = options;
    let technician = members[i];
    let querySQL;
    let places = [];
    querySQL = 'SELECT technicians_units.unit_id AS technician_unit_id, units.name AS technician_unit_name,'
            + ' technicians.id AS technician_id, technicians.technician_office_id, technician_offices.name_en AS technician_office_name,'
            + ' technicians.valid_from AS technician_start, technicians.valid_until AS technician_end,'
            + ' technicians.technician_position_id, technician_positions.name_en AS technician_position_name_en, technician_positions.name_pt AS technician_position_name_pt'
            + ' FROM technicians'
            + ' LEFT JOIN technicians_units ON technicians_units.technician_id = technicians.id'
            + ' LEFT JOIN technician_offices ON technician_offices.id = technicians.technician_office_id'
            + ' LEFT JOIN technician_positions ON technician_positions.id = technicians.technician_position_id'
            + ' LEFT JOIN units ON technicians_units.unit_id = units.id'
            + ' WHERE technicians.person_id = ?;'
    places.push(technician.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data = {
                id: technician.id,
                full_name: technician.full_name,
                name: technician.name,
                active_from: technician.active_from,
                active_until: technician.active_until,
                email: technician.email,
                phone: technician.phone,
                phone_extension: technician.phone_extension,
                photo_data: technician.photo_data,
                technician_data: [],
            }
            for (let ind in resQuery) {
                data.technician_data.push(
                    {
                        technician_id: resQuery[ind].technician_id,
                        technician_start: resQuery[ind].technician_start,
                        technician_end: resQuery[ind].technician_end,
                        technician_position_id: resQuery[ind].technician_position_id,
                        technician_position_name_en: resQuery[ind].technician_position_name_en,
                        technician_position_name_pt: resQuery[ind].technician_position_name_pt,
                        technician_office_id: resQuery[ind].technician_office_id,
                        technician_office_name: resQuery[ind].technician_office_name,
                        technician_unit_id: resQuery[ind].technician_unit_id,
                        technician_unit_name: resQuery[ind].technician_unit_name,
                    }
                )
            }
            options.members[i] = data;
            if (i + 1 < options.members.length) {
                options.i = i + 1;
                return getOfficeMemberPhotos(options);
            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": options.members.length,
                        "result": options.members,
                    });
                return;
            }
        },
        options
    )
};
module.exports.getFacilityMembers = function (req, res, next) {
    let facilityID = req.params.officeID
    let querySQL;
    let places = [];
    querySQL = 'SELECT DISTINCT people.id, people.name AS full_name, people.colloquial_name AS name,'
             + ' people.active_from, people.active_until,'
             + ' emails.email, phones.phone, phones.extension AS phone_extension'
             //+ ' technicians.id AS technician_id, technicians.technician_office_id, technician_offices.name_en AS technician_office_name,'
             //+ ' technicians.valid_from AS technician_start, technicians.valid_until AS technician_end,'
             //+ ' technicians.technician_position_id, technician_positions.name_en AS technician_position_name_en, technician_positions.name_pt AS technician_position_name_pt,'
             + ' FROM people'
             + ' LEFT JOIN emails ON people.id = emails.person_id'
             + ' LEFT JOIN phones ON people.id = phones.person_id'
             + ' LEFT JOIN technicians ON technicians.person_id = people.id'
             + ' LEFT JOIN technician_offices ON technician_offices.id = technicians.technician_office_id'
             //+ ' LEFT JOIN technician_positions ON technician_positions.id = technicians.technician_position_id'
             + ' WHERE people.status = ? AND technician_offices.id = ? AND people.visible_public = 1'
             + ' AND ( (people.active_from <= CURDATE() AND people.active_until >= CURDATE()) '
                + ' OR (people.active_from <= CURDATE() AND people.active_until IS NULL)'
                + ' OR (people.active_from IS NULL AND people.active_until >= CURDATE())'
                + ' OR (people.active_from IS NULL AND people.active_until IS NULL) )'
            + ' AND ( (technicians.valid_from <= CURDATE() AND technicians.valid_until >= CURDATE()) '
                + ' OR (technicians.valid_from <= CURDATE() AND technicians.valid_until IS NULL)'
                + ' OR (technicians.valid_from IS NULL AND technicians.valid_until >= CURDATE())'
                + ' OR (technicians.valid_from IS NULL AND technicians.valid_until IS NULL) )'
             + ';';
    places.push(1, facilityID, 1);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.i = 0;
                options.office_type = 'technician'
                options.members = resQuery;
                return getOfficeMemberPhotos(options);
            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": 0,
                        "result": [],
                    });
                return;
            }
        },
        {req, res, next}
    )
};
module.exports.getFacilitiesList = function (req, res, next) {
    var places = []
    var querySQL = 'SELECT * FROM technician_offices;';
    sql.makeSQLOperation(req, res, querySQL, places);
};

var getScienceManagerUnits = function (options) {
    let { req, res, next, members, i } = options;
    let science_manager = members[i];
    let querySQL;
    let places = [];
    querySQL = 'SELECT science_managers.id AS science_manager_id,'
             + ' science_managers.science_manager_office_id, science_manager_offices.name_en AS science_manager_office_name,'
             + ' science_managers.valid_from AS science_manager_start, science_managers.valid_until AS science_manager_end,'
             + ' science_managers.science_manager_position_id, science_manager_positions.name_en AS science_manager_position_name_en, science_manager_positions.name_pt AS science_manager_position_name_pt,'
             + ' science_managers_units.unit_id AS science_manager_unit_id, units.name AS science_manager_unit_name'
             + ' FROM science_managers'
             + ' LEFT JOIN science_managers_units ON science_managers_units.science_manager_id = science_managers.id'
             + ' LEFT JOIN science_manager_offices ON science_manager_offices.id = science_managers.science_manager_office_id'
             + ' LEFT JOIN science_manager_positions ON science_manager_positions.id = science_managers.science_manager_position_id'
             + ' LEFT JOIN units ON units.id = science_managers_units.unit_id'
             + ' WHERE science_managers.person_id = ?;'
    places.push(science_manager.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data = {
                id: science_manager.id,
                full_name: science_manager.full_name,
                name: science_manager.name,
                active_from: science_manager.active_from,
                active_until: science_manager.active_until,
                email: science_manager.email,
                phone: science_manager.phone,
                phone_extension: science_manager.phone_extension,
                photo_data: science_manager.photo_data,
                science_management_data: [],
            }
            for (let ind in resQuery) {
                data.science_management_data.push(
                    {
                        science_manager_id: resQuery[ind].science_manager_id,
                        science_manager_start: resQuery[ind].science_manager_start,
                        science_manager_end: resQuery[ind].science_manager_end,
                        science_manager_position_id: resQuery[ind].science_manager_position_id,
                        science_manager_position_name_en: resQuery[ind].science_manager_position_name_en,
                        science_manager_position_name_pt: resQuery[ind].science_manager_position_name_pt,
                        science_manager_office_id: resQuery[ind].science_manager_office_id,
                        science_manager_office_name: resQuery[ind].science_manager_office_name,
                        science_manager_unit_id: resQuery[ind].science_manager_unit_id,
                        science_manager_unit_name: resQuery[ind].science_manager_unit_name,
                    }
                )
            }
            options.members[i] = data;
            if (i + 1 < options.members.length) {
                options.i = i + 1;
                return getScienceManagerUnits(options);
            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": options.members.length,
                        "result": options.members,
                    });
                return;
            }
        },
        options
    )
};
module.exports.getScienceManagementOfficeMembers = function (req, res, next) {
    let officeID = req.params.officeID
    let querySQL;
    let places = [];
    querySQL = 'SELECT DISTINCT people.id, people.name AS full_name, people.colloquial_name AS name,'
            + ' people.active_from, people.active_until,'
            + ' emails.email, phones.phone, phones.extension AS phone_extension'
            //+ ' science_managers.id AS science_manager_id, science_managers.science_manager_office_id, science_manager_offices.name_en AS science_manager_office_name,'
            //+ ' science_managers.valid_from AS science_manager_start, science_managers.valid_until AS science_manager_end,'
            //+ ' science_managers.science_manager_position_id, science_manager_positions.name_en AS science_manager_position_name_en, science_manager_positions.name_pt AS science_manager_position_name_pt'
            + ' FROM people'
            + ' LEFT JOIN emails ON people.id = emails.person_id'
            + ' LEFT JOIN phones ON people.id = phones.person_id'
            + ' LEFT JOIN science_managers ON science_managers.person_id = people.id'
            + ' LEFT JOIN science_manager_offices ON science_manager_offices.id = science_managers.science_manager_office_id'
            //+ ' LEFT JOIN science_manager_positions ON science_manager_positions.id = science_managers.science_manager_position_id'
            + ' WHERE people.status = ? AND science_manager_offices.id = ? AND people.visible_public = 1'
            + ' AND ( (people.active_from <= CURDATE() AND people.active_until >= CURDATE()) '
                + ' OR (people.active_from <= CURDATE() AND people.active_until IS NULL)'
                + ' OR (people.active_from IS NULL AND people.active_until >= CURDATE())'
                + ' OR (people.active_from IS NULL AND people.active_until IS NULL) )'
            + ' AND ( (science_managers.valid_from <= CURDATE() AND science_managers.valid_until >= CURDATE()) '
                + ' OR (science_managers.valid_from <= CURDATE() AND science_managers.valid_until IS NULL)'
                + ' OR (science_managers.valid_from IS NULL AND science_managers.valid_until >= CURDATE())'
                + ' OR (science_managers.valid_from IS NULL AND science_managers.valid_until IS NULL) )'
            + ';';
    places.push(1, officeID, 1);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.i = 0;
                options.office_type = 'science-manager'
                options.members = resQuery;
                return getOfficeMemberPhotos(options);

            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": 0,
                        "result": [],
                    });
                return;
            }
        },
        {req, res, next}
    )
};
module.exports.getScienceManagementOfficesList = function (req, res, next) {
    var places = []
    var querySQL = 'SELECT * FROM science_manager_offices;';
    sql.makeSQLOperation(req, res, querySQL, places);
};


var getAdministrativeUnits = function (options) {
    let { req, res, next, members, i } = options;
    let administrative = members[i];
    let querySQL;
    let places = [];
    querySQL = 'SELECT people_administrative_offices.id AS administrative_id,'
             + ' people_administrative_offices.administrative_office_id, administrative_offices.name_en AS administrative_office_name,'
             + ' people_administrative_offices.valid_from AS administrative_start, people_administrative_offices.valid_until AS administrative_end,'
             + ' people_administrative_offices.administrative_position_id, administrative_positions.name_en AS administrative_position_name_en, administrative_positions.name_pt AS administrative_position_name_pt,'
             + ' people_administrative_units.unit_id AS administrative_unit_id, units.name AS administrative_unit_name'
             + ' FROM people_administrative_offices'
             + ' LEFT JOIN people_administrative_units ON people_administrative_units.administrative_id = people_administrative_offices.id'
             + ' LEFT JOIN administrative_offices ON administrative_offices.id = people_administrative_offices.administrative_office_id'
             + ' LEFT JOIN administrative_positions ON administrative_positions.id = people_administrative_offices.administrative_position_id'
             + ' LEFT JOIN units ON units.id = people_administrative_units.unit_id'
             + ' WHERE people_administrative_offices.person_id = ?;'
    places.push(administrative.id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            let data = {
                id: administrative.id,
                full_name: administrative.full_name,
                name: administrative.name,
                active_from: administrative.active_from,
                active_until: administrative.active_until,
                email: administrative.email,
                phone: administrative.phone,
                phone_extension: administrative.phone_extension,
                image_path: administrative.image_path,
                photo_data: administrative.photo_data,
                administrative_data: [],
            }
            for (let ind in resQuery) {
                data.administrative_data.push(
                    {
                        administrative_id: resQuery[ind].administrative_id,
                        administrative_start: resQuery[ind].administrative_start,
                        administrative_end: resQuery[ind].administrative_end,
                        administrative_position_id: resQuery[ind].administrative_position_id,
                        administrative_position_name_en: resQuery[ind].administrative_position_name_en,
                        administrative_position_name_pt: resQuery[ind].administrative_position_name_pt,
                        administrative_office_id: resQuery[ind].administrative_office_id,
                        administrative_office_name: resQuery[ind].administrative_office_name,
                        administrative_unit_id: resQuery[ind].administrative_unit_id,
                        administrative_unit_name: resQuery[ind].administrative_unit_name,
                    }
                )
            }
            options.members[i] = data;
            if (i + 1 < options.members.length) {
                options.i = i + 1;
                return getOfficeMemberPhotos(options);
            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": options.members.length,
                        "result": options.members,
                    });
                return;
            }
        },
        options
    )
};
module.exports.getAdministrativeOfficeMembers = function (req, res, next) {
    let officeID = req.params.officeID
    let querySQL;
    let places = [];
    querySQL = 'SELECT DISTINCT people.id, people.name AS full_name, people.colloquial_name AS name,'
            + ' people.active_from, people.active_until,'
            + ' emails.email, phones.phone, phones.extension AS phone_extension'
            //+ ' people_administrative_offices.id AS administrative_id, people_administrative_offices.administrative_office_id, administrative_offices.name_en AS administrative_office_name,'
            //+ ' people_administrative_offices.valid_from AS administrative_start, people_administrative_offices.valid_until AS administrative_end,'
            //+ ' people_administrative_offices.administrative_position_id, administrative_positions.name_en AS administrative_position_name_en, administrative_positions.name_pt AS administrative_position_name_pt'
            //+ ' personal_photo.url AS image_path'
            + ' FROM people'
            + ' LEFT JOIN emails ON people.id = emails.person_id'
            + ' LEFT JOIN phones ON people.id = phones.person_id'
            + ' LEFT JOIN people_administrative_offices ON people_administrative_offices.person_id = people.id'
            + ' LEFT JOIN administrative_offices ON administrative_offices.id = people_administrative_offices.administrative_office_id'
            //+ ' LEFT JOIN administrative_positions ON administrative_positions.id = people_administrative_offices.administrative_position_id'
            + ' WHERE people.status = ? AND administrative_offices.id = ? AND people.visible_public = 1'
            + ' AND ( (people.active_from <= CURDATE() AND people.active_until >= CURDATE()) '
                + ' OR (people.active_from <= CURDATE() AND people.active_until IS NULL)'
                + ' OR (people.active_from IS NULL AND people.active_until >= CURDATE())'
                + ' OR (people.active_from IS NULL AND people.active_until IS NULL) )'
            + ' AND ( (people_administrative_offices.valid_from <= CURDATE() AND people_administrative_offices.valid_until >= CURDATE()) '
                + ' OR (people_administrative_offices.valid_from <= CURDATE() AND people_administrative_offices.valid_until IS NULL)'
                + ' OR (people_administrative_offices.valid_from IS NULL AND people_administrative_offices.valid_until >= CURDATE())'
                + ' OR (people_administrative_offices.valid_from IS NULL AND people_administrative_offices.valid_until IS NULL) )'
            + ';';
    places.push(1, officeID, 1);
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length > 0) {
                options.i = 0;
                options.office_type = 'administrative'
                options.members = resQuery;
                return getOfficeMemberPhotos(options);
            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": 0,
                        "result": [],
                    });
                return;
            }
        },
        {req, res, next}
    )
};
module.exports.getAdministrativeOfficesList = function (req, res, next) {
    var places = []
    var querySQL = 'SELECT * FROM administrative_offices;';
    sql.makeSQLOperation(req, res, querySQL, places);
};