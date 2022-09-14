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

var getLabHistory = function(options) {
    let { req, res, next, lab } = options;
    let querySQL;
    let places = [];
    querySQL = 'SELECT labs_groups.group_id,'
             + ' `groups`.name AS group_name, `groups`.short_name AS group_short_name,'
             + ' labs_groups.valid_from AS labs_groups_valid_from, labs_groups.valid_until AS labs_groups_valid_until,'
             + ' groups_units.unit_id, units.short_name AS unit, units.name AS unit_full_name'
             + ' FROM labs_groups'
             + ' LEFT JOIN `groups` ON labs_groups.group_id = `groups`.id'
             + ' LEFT JOIN groups_units ON groups_units.group_id = `groups`.id'
             + ' LEFT JOIN units ON groups_units.unit_id = units.id'
             + ' WHERE labs_groups.lab_id = ?;';
    places.push(lab.lab_id)
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            options.lab.lab_history = resQuery;
            responses.sendJSONResponse(res, 200,
                {
                    "status": "success",
                    "statusCode": 200,
                    "count": 1,
                    "result": [options.lab],
                });
            return;

        },
        options
    );
};
module.exports.getLabInfo = function (req, res, next) {
    var labID = req.params.labID;
    var querySQL = 'SELECT id AS lab_id, name AS lab, short_name AS lab_short_name,'
                + ' started AS lab_opened, finished AS lab_closed'
                + ' FROM labs'
                + ' WHERE id = ?;';
    var places = [labID];
    return sql.getSQLOperationResult(req, res, querySQL, places,
        (resQuery, options) => {
            if (resQuery.length === 1) {
                options.lab = resQuery[0];
                return getLabHistory(options);
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
module.exports.getGroupInfo = function (req, res, next) {
    var groupID = req.params.groupID;
    var querySQL = 'SELECT `groups`.id AS group_id, `groups`.name, `groups`.short_name AS group_short_name, '
                 + ' `groups`.started, `groups`.finished,'
                 + ' units.id AS unit_id, units.short_name AS unit, units.name AS unit_full_name'
                 + ' FROM `groups`'
                 + ' LEFT JOIN groups_units ON groups_units.group_id = `groups`.id'
                 + ' LEFT JOIN units ON groups_units.unit_id = units.id'
                 + ' WHERE `groups`.id = ?;';
    var places = [groupID];
    return sql.makeSQLOperation(req, res, querySQL, places);
};
var getTechnicianUnits = function (options) {
    let { req, res, next, technicians, i } = options;
    let technician = technicians[i];
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
                image_path: technician.image_path,
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
            options.technicians[i] = data;
            if (i + 1 < options.technicians.length) {
                options.i = i + 1;
                return getTechnicianUnits(options);
            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": options.technicians.length,
                        "result": options.technicians,
                    });
                return;
            }
        },
        options
    )
};
module.exports.getFacilityMembers = function (req, res, next) {
    let facilityID = req.params.facilityID
    let querySQL;
    let places = [];
    querySQL = 'SELECT DISTINCT people.id, people.name AS full_name, people.colloquial_name AS name,'
             + ' people.active_from, people.active_until,'
             + ' emails.email, phones.phone, phones.extension AS phone_extension,'
             //+ ' technicians.id AS technician_id, technicians.technician_office_id, technician_offices.name_en AS technician_office_name,'
             //+ ' technicians.valid_from AS technician_start, technicians.valid_until AS technician_end,'
             //+ ' technicians.technician_position_id, technician_positions.name_en AS technician_position_name_en, technician_positions.name_pt AS technician_position_name_pt,'
             + ' personal_photo.url AS image_path'
             + ' FROM people'
             + ' LEFT JOIN emails ON people.id = emails.person_id'
             + ' LEFT JOIN phones ON people.id = phones.person_id'
             + ' LEFT JOIN technicians ON technicians.person_id = people.id'
             + ' LEFT JOIN technician_offices ON technician_offices.id = technicians.technician_office_id'
             //+ ' LEFT JOIN technician_positions ON technician_positions.id = technicians.technician_position_id'
             + ' LEFT JOIN personal_photo ON people.id = personal_photo.person_id'
             + ' WHERE people.status = ? AND technician_offices.id = ? AND people.visible_public = 1'
             + ' AND (personal_photo.photo_type_id = ? OR personal_photo.photo_type_id IS NULL)'
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
                options.technicians = resQuery;
                return getTechnicianUnits(options);

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
var getScienceManagerUnits = function (options) {
    let { req, res, next, science_managers, i } = options;
    let science_manager = science_managers[i];
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
                image_path: science_manager.image_path,
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
            options.science_managers[i] = data;
            if (i + 1 < options.science_managers.length) {
                options.i = i + 1;
                return getScienceManagerUnits(options);
            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": options.science_managers.length,
                        "result": options.science_managers,
                    });
                return;
            }
        },
        options
    )
};
module.exports.getScienceManagementMembers = function (req, res, next) {
    let officeID = req.params.officeID
    let querySQL;
    let places = [];
    querySQL = 'SELECT DISTINCT people.id, people.name AS full_name, people.colloquial_name AS name,'
            + ' people.active_from, people.active_until,'
            + ' emails.email, phones.phone, phones.extension AS phone_extension,'
            //+ ' science_managers.id AS science_manager_id, science_managers.science_manager_office_id, science_manager_offices.name_en AS science_manager_office_name,'
            //+ ' science_managers.valid_from AS science_manager_start, science_managers.valid_until AS science_manager_end,'
            //+ ' science_managers.science_manager_position_id, science_manager_positions.name_en AS science_manager_position_name_en, science_manager_positions.name_pt AS science_manager_position_name_pt'
            + ' personal_photo.url AS image_path'
            + ' FROM people'
            + ' LEFT JOIN emails ON people.id = emails.person_id'
            + ' LEFT JOIN phones ON people.id = phones.person_id'
            + ' LEFT JOIN personal_photo ON people.id = personal_photo.person_id'
            + ' LEFT JOIN science_managers ON science_managers.person_id = people.id'
            + ' LEFT JOIN science_manager_offices ON science_manager_offices.id = science_managers.science_manager_office_id'
            //+ ' LEFT JOIN science_manager_positions ON science_manager_positions.id = science_managers.science_manager_position_id'
            + ' WHERE people.status = ? AND science_manager_offices.id = ? AND people.visible_public = 1'
            + ' AND (personal_photo.photo_type_id = ? OR personal_photo.photo_type_id IS NULL)'
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
                options.science_managers = resQuery;
                return getScienceManagerUnits(options);

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
var getAdministrativeUnits = function (options) {
    let { req, res, next, administratives, i } = options;
    let administrative = administratives[i];
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
            options.administratives[i] = data;
            if (i + 1 < options.administratives.length) {
                options.i = i + 1;
                return getAdministrativeUnits(options);
            } else {
                responses.sendJSONResponse(res, 200,
                    {
                        "status": "success",
                        "statusCode": 200,
                        "count": options.administratives.length,
                        "result": options.administratives,
                    });
                return;
            }
        },
        options
    )
};
module.exports.getAdministrativeMembers = function (req, res, next) {
    let officeID = req.params.officeID
    let querySQL;
    let places = [];
    querySQL = 'SELECT DISTINCT people.id, people.name AS full_name, people.colloquial_name AS name,'
            + ' people.active_from, people.active_until,'
            + ' emails.email, phones.phone, phones.extension AS phone_extension,'
            //+ ' people_administrative_offices.id AS administrative_id, people_administrative_offices.administrative_office_id, administrative_offices.name_en AS administrative_office_name,'
            //+ ' people_administrative_offices.valid_from AS administrative_start, people_administrative_offices.valid_until AS administrative_end,'
            //+ ' people_administrative_offices.administrative_position_id, administrative_positions.name_en AS administrative_position_name_en, administrative_positions.name_pt AS administrative_position_name_pt'
            + ' personal_photo.url AS image_path'
            + ' FROM people'
            + ' LEFT JOIN emails ON people.id = emails.person_id'
            + ' LEFT JOIN phones ON people.id = phones.person_id'
            + ' LEFT JOIN personal_photo ON people.id = personal_photo.person_id'
            + ' LEFT JOIN people_administrative_offices ON people_administrative_offices.person_id = people.id'
            + ' LEFT JOIN administrative_offices ON administrative_offices.id = people_administrative_offices.administrative_office_id'
            //+ ' LEFT JOIN administrative_positions ON administrative_positions.id = people_administrative_offices.administrative_position_id'
            + ' WHERE people.status = ? AND administrative_offices.id = ? AND people.visible_public = 1'
            + ' AND (personal_photo.photo_type_id = ? OR personal_photo.photo_type_id IS NULL)'
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
                options.administratives = resQuery;
                return getAdministrativeUnits(options);

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