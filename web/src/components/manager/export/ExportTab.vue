<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Export data acording to the following filters</h3>
        </div>
    </v-card-title>
    <v-card-text>
        {{queryString}}
    </v-card-text>
    <v-container>
        <v-row align="center">
            <v-col cols="12" md="2">
                <v-select v-model="filterUnitID"
                    :items="units"
                    item-value="id" item-text="short_name"
                    label="Unit">
                </v-select>
            </v-col>
            <v-col cols="12" md="2">
                <v-select v-model="filterPoleID"
                    :items="poles"
                    item-value="id" item-text="city"
                    label="Pole">
                </v-select>
            </v-col>
            <v-col cols="12" md="3">
                <v-select v-model="filterDepartmentID"
                    :items="departments"
                    item-value="id" item-text="department_name_en"
                    label="Department">
                </v-select>
            </v-col>
            <v-col cols="10" md="3">
                <v-select v-model="filterDepartmentTeamID"
                    :items="departmentTeams"
                    item-value="id" item-text="name"
                    label="Research Team">
                </v-select>
            </v-col>

        </v-row>
        <v-row align="center">
            <v-col cols="10" md="3">
                <v-select v-model="filterLabID"
                    :items="labs"
                    item-value="id" item-text="name"
                    label="Lab">
                </v-select>
            </v-col>
            <v-col cols="10" md="7">
                <v-combobox
                    v-model="filterChosenPeople"
                    :items="people"
                    item-value="id" item-text="name"
                    :search-input.sync="searchPeople"
                    :filter="customSearch"
                    chips
                    clearable
                    label="People chosen"
                    multiple

                >
                    <template v-slot:selection="{ attrs, item, select, selected }">
                    <v-chip
                        v-bind="attrs"
                        :input-value="selected"
                        close
                        @click="select"
                        @click:close="removePerson(item)"
                    >
                        <strong>{{ item.name }}</strong>&nbsp;(id: {{item.id}})
                    </v-chip>
                    </template>
                </v-combobox>

            </v-col>
        </v-row>
        <v-row>
            <v-col cols="5" sm="3">
                <v-menu ref="showDateFrom"
                    v-model="showDateFrom"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="filterDateFrom"
                            label="From" v-on="on">
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="filterDateFrom"
                        @input="showDateFrom = false"
                        no-title
                    ></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="5" sm="3">
                <v-menu ref="showDateUntil"
                    v-model="showDateUntil"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="filterDateUntil"
                            label="Until" v-on="on">
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="filterDateUntil"
                        @input="showDateUntil = false"
                        no-title
                    ></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="2" md="2" >
                <v-row  justify="start">
                    <v-icon @click="resetValues()">mdi-restore</v-icon>
                </v-row>
            </v-col>

        </v-row>
        <v-row justify="center" align="center" class="mt-1">
            <v-col cols="12" align="center">
                <v-row justify="center" align="center">
                    <v-col cols="2" sm="2">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn fab color="green"
                                    @click="getSpreadsheetData()"
                                    v-on="on"
                                >
                                    <v-icon color="white" x-large>mdi-account-multiple</v-icon>
                                </v-btn>
                            </template>
                            <span>People info</span>
                        </v-tooltip>
                    </v-col>
                    <v-col cols="2" sm="2">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn fab color="blue"
                                    @click="getSpreadsheetDataProductivity()"
                                    v-on="on"
                                >
                                    <v-icon color="white" x-large>mdi-file-document-multiple-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>Productivity info</span>
                        </v-tooltip>
                    </v-col>
                    <v-col cols="2" sm="2">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn fab color="grey"
                                    @click="getSpreadsheetDataSpaces()"
                                    v-on="on"
                                >
                                    <v-icon color="white" x-large>mdi-rhombus-split-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>Spaces info</span>
                        </v-tooltip>
                    </v-col>
                    <v-col cols="2" sm="2">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn fab color="red"
                                    @click="getSpreadsheetDataSupervision()"
                                    v-on="on"
                                >
                                    <v-icon color="white" x-large>mdi-account-supervisor</v-icon>
                                </v-btn>
                            </template>
                            <span>Supervision info</span>
                        </v-tooltip>
                    </v-col>
                    <!--
                    <v-col cols="2" sm="2">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn fab color="orange"
                                    @click="getSpreadsheetDataDegrees()"
                                    v-on="on"
                                >
                                    <v-icon color="white" x-large>mdi-school</v-icon>
                                </v-btn>
                            </template>
                            <span>Degrees info</span>
                        </v-tooltip>
                    </v-col>
                    -->
                    <v-col cols="2" sm="2">
                        <v-progress-circular indeterminate
                                v-show="progress"
                                :size="20" :width="2"
                                color="primary"></v-progress-circular>
                        <v-icon v-show="success" color="green">mdi-check</v-icon>
                        <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'
import XLSX from 'xlsx'

function processResults(vm, people) {
    let currentMembers = [];
    let today = time.moment();
    for (let ind in people) {
        let current_lab = {};
        let count_current_labs = 0;
        let within_range_lab = {}; // gets the most recent lab within time range
        let count_labs_within_range = 0;
        let filterDateFrom = null;
        let filterDateUntil = null;
        if (vm.filterDateFrom !== null || vm.filterDateUntil !== null) {
            if (vm.filterDateFrom === null) {
                filterDateFrom = time.moment(vm.filterDateUntil);
                filterDateUntil = time.moment(vm.filterDateUntil);
            } else if (vm.filterDateUntil === null) {
                filterDateFrom = time.moment(vm.filterDateFrom);
                filterDateUntil = time.moment(vm.filterDateFrom);
            } else {
                filterDateFrom = time.moment(vm.filterDateFrom);
                filterDateUntil = time.moment(vm.filterDateUntil);
            }
        }
        let current_job = {};
        let within_range_job = {};
        let current_higher_finished_degree = {};
        let minDegreeID1 = 10e6;
        let within_range_higher_finished_degree = {};
        let minDegreeID2 = 10e6;
        let ongoing_degrees = [];
        let finished_degrees = [];
        let current_pole = {};
        let within_range_pole = {};
        let current_department = {};
        let within_range_department = {};
        let current_cost_center = {};
        let within_range_cost_center = {};
        // still missing the code for "department teams"
        if (people[ind].history.length > 0) {
            for (let indHistory in people[ind].history) {
                let validFrom = people[ind].history[indHistory].valid_from;
                let validUntil = people[ind].history[indHistory].valid_until;
                if ((validFrom === null || time.moment(validFrom).isBefore(today))
                    && (validUntil === null || time.moment(validUntil).isAfter(today))
                ) {
                    count_current_labs++;
                    current_lab = people[ind].history[indHistory];
                }
                if (filterDateFrom !== null || filterDateUntil !== null) {
                    if ((validFrom === null || time.moment(validFrom).isBefore(filterDateFrom))
                        && (validUntil === null || time.moment(validUntil).isAfter(filterDateUntil))
                    ) {
                        count_labs_within_range++;
                        within_range_lab = people[ind].history[indHistory];
                    }
                }
                people[ind].history[indHistory].valid_from = time.momentToDate(people[ind].history[indHistory].valid_from);
                people[ind].history[indHistory].valid_until = time.momentToDate(people[ind].history[indHistory].valid_until);
            }
        }
        if (people[ind].jobs.length > 0) {
            for (let indJob in people[ind].jobs) {
                let validFrom = people[ind].jobs[indJob].valid_from;
                let validUntil = people[ind].jobs[indJob].valid_until;
                if ((validFrom === null || time.moment(validFrom).isBefore(today))
                    && (validUntil === null || time.moment(validUntil).isAfter(today))
                ) {
                    current_job = people[ind].jobs[indJob];
                }
                if (filterDateFrom !== null || filterDateUntil !== null) {
                    if ((validFrom === null || time.moment(validFrom).isBefore(filterDateFrom))
                        && (validUntil === null || time.moment(validUntil).isAfter(filterDateUntil))
                    ) {
                        within_range_job = people[ind].jobs[indJob];
                    }
                }
                people[ind].jobs[indJob].valid_from = time.momentToDate(people[ind].jobs[indJob].valid_from);
                people[ind].jobs[indJob].valid_until = time.momentToDate(people[ind].jobs[indJob].valid_until);
            }
        }
        if (people[ind].degrees.length > 0) {
            // we want the highest finished degree => lowest degree ID
            for (let indDeg in people[ind].degrees) {
                //let validFrom = people[ind].degrees[indDeg].start;
                let validUntil = people[ind].degrees[indDeg].end;
                if (time.moment(validUntil).isBefore(today)
                    && ( people[ind].degrees[indDeg].degree_id < minDegreeID1)
                ) {
                    minDegreeID1 = people[ind].degrees[indDeg].degree_id;
                    current_higher_finished_degree = people[ind].degrees[indDeg];
                }
                if (filterDateFrom !== null || filterDateUntil !== null) {
                    if (time.moment(validUntil).isBefore(filterDateUntil)
                        && ( people[ind].degrees[indDeg].degree_id < minDegreeID2)
                    ) {
                        minDegreeID2 = people[ind].degrees[indDeg].degree_id;
                        within_range_higher_finished_degree = people[ind].degrees[indDeg];
                    }
                }
                if (time.moment(validUntil).isBefore(today)) {
                    finished_degrees.push(people[ind].degrees[indDeg])
                }
                if (validUntil === null || time.moment(validUntil).isAfter(today)) {
                    ongoing_degrees.push(people[ind].degrees[indDeg])
                }
                people[ind].degrees[indDeg].start = time.momentToDate(people[ind].degrees[indDeg].start);
                people[ind].degrees[indDeg].end = time.momentToDate(people[ind].degrees[indDeg].end);
            }
        }
        if (people[ind].pole.length > 0) {
            for (let indPole in people[ind].pole) {
                let validFrom = people[ind].pole[indPole].valid_from;
                let validUntil = people[ind].pole[indPole].valid_until;
                if ((validFrom === null || time.moment(validFrom).isBefore(today))
                    && (validUntil === null || time.moment(validUntil).isAfter(today))
                ) {
                    current_pole = people[ind].pole[indPole];
                }
                if (filterDateFrom !== null || filterDateUntil !== null) {
                    if ((validFrom === null || time.moment(validFrom).isBefore(filterDateFrom))
                        && (validUntil === null || time.moment(validUntil).isAfter(filterDateUntil))
                    ) {
                        within_range_pole = people[ind].pole[indPole];
                    }
                }
                people[ind].pole[indPole].valid_from = time.momentToDate(people[ind].pole[indPole].valid_from);
                people[ind].pole[indPole].valid_until = time.momentToDate(people[ind].pole[indPole].valid_until);
            }
        }
        if (people[ind].departments.length > 0) {
            for (let indJob in people[ind].departments) {
                let validFrom = people[ind].departments[indJob].department_start;
                let validUntil = people[ind].departments[indJob].department_end;
                if ((validFrom === null || time.moment(validFrom).isBefore(today))
                    && (validUntil === null || time.moment(validUntil).isAfter(today))
                ) {
                    current_department = people[ind].departments[indJob];
                }
                if (filterDateFrom !== null || filterDateUntil !== null) {
                    if ((validFrom === null || time.moment(validFrom).isBefore(filterDateFrom))
                        && (validUntil === null || time.moment(validUntil).isAfter(filterDateUntil))
                    ) {
                        within_range_department = people[ind].departments[indJob];
                    }
                }
                people[ind].departments[indJob].department_start = time.momentToDate(people[ind].departments[indJob].department_start);
                people[ind].departments[indJob].department_end = time.momentToDate(people[ind].departments[indJob].department_end);
            }
        }
        if (people[ind].departmentTeams.length > 0) {
            for (let indJob in people[ind].departmentTeams) {
                people[ind].departmentTeams[indJob].valid_from = time.momentToDate(people[ind].departmentTeams[indJob].valid_from);
                people[ind].departmentTeams[indJob].valid_until = time.momentToDate(people[ind].departmentTeams[indJob].valid_until);
            }
        }
        if (people[ind].cost_centers.length > 0) {
            for (let indCC in people[ind].cost_centers) {
                let validFrom = people[ind].cost_centers[indCC].valid_from;
                let validUntil = people[ind].cost_centers[indCC].valid_until;
                if ((validFrom === null || time.moment(validFrom).isBefore(today))
                    && (validUntil === null || time.moment(validUntil).isAfter(today))
                ) {
                    current_cost_center = people[ind].cost_centers[indCC];
                }
                if (filterDateFrom !== null || filterDateUntil !== null) {
                    if ((validFrom === null || time.moment(validFrom).isBefore(filterDateFrom))
                        && (validUntil === null || time.moment(validUntil).isAfter(filterDateUntil))
                    ) {
                        within_range_cost_center = people[ind].cost_centers[indCC];
                    }
                }
                people[ind].cost_centers[indCC].valid_from = time.momentToDate(people[ind].cost_centers[indCC].valid_from);
                people[ind].cost_centers[indCC].valid_until = time.momentToDate(people[ind].cost_centers[indCC].valid_until);
            }
        }
        // Note: if there is no time filter then current and within range are the same
        if (filterDateFrom === null && filterDateUntil === null) {
            within_range_pole = current_pole;
            within_range_lab = current_lab;
            within_range_job = current_job;
            within_range_department = current_department;
            within_range_higher_finished_degree = current_higher_finished_degree
            within_range_cost_center = current_cost_center;
        }
        people[ind].current_lab = current_lab;
        if (count_current_labs > 1) people[ind].has_other_current_labs = true;
        people[ind].within_range_lab = within_range_lab;
        if (count_labs_within_range > 1) people[ind].has_other_labs_within_range = true;

        people[ind].current_job = current_job;
        people[ind].within_range_job = within_range_job;
        people[ind].current_department = current_department;
        people[ind].within_range_department = within_range_department;
        people[ind].current_pole = current_pole;
        people[ind].within_range_pole = within_range_pole;
        people[ind].current_cost_center = current_cost_center;
        people[ind].within_range_cost_center = within_range_cost_center;
        people[ind].current_higher_finished_degree = current_higher_finished_degree;
        people[ind].within_range_higher_finished_degree = within_range_higher_finished_degree;
        people[ind].ongoing_degrees = ongoing_degrees;
        people[ind].finished_degrees = finished_degrees;

        currentMembers.push(people[ind]);
    }
    return currentMembers;
}
function processForSpreadsheet(members) {
    let membersCurated = [];
    let today = time.moment();
    //sort by highest degree
    members.sort((a,b) => {
        if (a.current_higher_finished_degree !== undefined && b.current_higher_finished_degree !== undefined) {
            if (a.current_higher_finished_degree.degree_sort_order !== undefined && a.current_higher_finished_degree.degree_sort_order !== null
                && b.current_higher_finished_degree.degree_sort_order !== undefined && b.current_higher_finished_degree.degree_sort_order !== null
            ) {
                return a.current_higher_finished_degree.degree_sort_order - b.current_higher_finished_degree.degree_sort_order;
            } else if (a.current_higher_finished_degree.degree_sort_order !== undefined && a.current_higher_finished_degree.degree_sort_order !== null) {
                return -1;
            } else if (b.current_higher_finished_degree.degree_sort_order !== undefined && b.current_higher_finished_degree.degree_sort_order !== null) {
                return +1;
            } else {
                return 0;
            }
        } else if (a.current_higher_finished_degree !== undefined) {
            return -1;
        } else if (b.current_higher_finished_degree !== undefined) {
            return +1;
        } else {
            return 0;
        }

    })
    for (let ind in members) {
        let thisMember = {};
        thisMember['Pole (Curr.)'] = members[ind].current_pole.city;
        thisMember['Pole (Curr.): From'] = members[ind].current_pole.valid_from;
        thisMember['Pole (Curr.): Until'] = members[ind].current_pole.valid_until;
        thisMember['Pole (Sel. Time)'] = members[ind].within_range_pole.city;
        thisMember['Pole (Sel. Time): From'] = members[ind].within_range_pole.valid_from;
        thisMember['Pole (Sel. Time): Until'] = members[ind].within_range_pole.valid_until;

        thisMember['Unit (Curr.)'] = undefined
        thisMember['Group (Curr.)'] = undefined
        if (members[ind].current_lab.groups !== undefined && members[ind].current_lab.groups.length > 0) {
            thisMember['Unit (Curr.)'] = members[ind].current_lab.groups[0].units[0].short_name;
            thisMember['Group (Curr.)'] = members[ind].current_lab.groups[0].name;
        }
        thisMember['Lab (Curr.)'] = members[ind].current_lab.name;
        thisMember['Lab Position (Curr.)'] = members[ind].current_lab.lab_position_name_en;
        thisMember['Dedication (Curr.)'] = members[ind].current_lab.dedication;
        thisMember['Lab (Curr.): From'] = members[ind].current_lab.valid_from;
        thisMember['Lab (Curr.): Until'] = members[ind].current_lab.valid_until;

        thisMember['Unit (Sel. Time.)'] = undefined
        thisMember['Group (Sel. Time.)'] = undefined
        if (members[ind].within_range_lab.groups !== undefined && members[ind].within_range_lab.groups.length > 0) {
            thisMember['Unit (Sel. Time.)'] = members[ind].within_range_lab.groups[0].units[0].short_name;
            thisMember['Group (Sel. Time.)'] = members[ind].within_range_lab.groups[0].name;
        }
        thisMember['Lab (Sel. Time)'] = members[ind].within_range_lab.lab_name;
        thisMember['Lab Position (Sel.)'] = members[ind].within_range_lab.lab_position_name_en;
        thisMember['Dedication (Sel.)'] = members[ind].within_range_lab.dedication;
        thisMember['Lab (Sel. Time): From'] = members[ind].within_range_lab.valid_from;
        thisMember['Lab (Sel. Time): Until'] = members[ind].within_range_lab.valid_until;

        thisMember['High. Degree (Curr.)'] = members[ind].current_higher_finished_degree.name_en;
        thisMember['High. Degree (Curr.): From'] = members[ind].current_higher_finished_degree.start;
        thisMember['High. Degree (Curr.): Until'] = members[ind].current_higher_finished_degree.end;

        thisMember['High. Degree (Selec.)'] = members[ind].within_range_higher_finished_degree.name_en;
        thisMember['High. Degree (Selec.): From'] = members[ind].within_range_higher_finished_degree.start;
        thisMember['High. Degree (Selec.): Until'] = members[ind].within_range_higher_finished_degree.end;

        thisMember['PhD Year'] = undefined;
        let degrees_history = ''
        for (let indDegree in members[ind].finished_degrees) {
            if (members[ind].finished_degrees[indDegree].name_en === 'PhD') {
                thisMember['PhD Year'] = time.moment(members[ind].finished_degrees[indDegree].end).year()
            }
            degrees_history = degrees_history + members[ind].finished_degrees[indDegree].name_en
                + ', ' + degrees_history + members[ind].finished_degrees[indDegree].start
                + ' to ' + degrees_history + members[ind].finished_degrees[indDegree].end
                + '\n'
        }
        thisMember['Job Situation (Curr.)'] = members[ind].current_job.category_name_en;
        thisMember['Job Category (Curr.)'] = members[ind].current_job.situation_name_en;
        thisMember['Job Organization (Curr.)'] = members[ind].current_job.organization;
        thisMember['Job (Curr.): From'] = members[ind].current_job.valid_from;
        thisMember['Job (Curr.): Until'] = members[ind].current_job.valid_until;
        thisMember['Job Contracts (Curr.)'] = contracts;
        thisMember['Job Fellowships (Curr.)'] = fellowships;

        contracts = '';
        fellowships = '';
        for (let indData in members[ind].within_range_job.contracts) {
            contracts = contracts + members[ind].within_range_job.contracts[indData].reference
        }
        for (let indData in members[ind].within_range_job.fellowships) {
            fellowships = fellowships
                + members[ind].within_range_job.fellowships[indData].fellowship_acronym
                + ' (' + members[ind].within_range_job.fellowships[indData].reference + ')'
                + members[ind].within_range_job.fellowships[indData].funding_agency_official_name
                + ', Mngmt: ' + members[ind].within_range_job.fellowships[indData].management_entity_official_name
        }
        thisMember['Job Situation (Selec.)'] = members[ind].within_range_job.category_name_en;
        thisMember['Job Category (Selec.)'] = members[ind].within_range_job.situation_name_en;
        thisMember['Job Organization (Selec.)'] = members[ind].within_range_job.organization;
        thisMember['Job (Selec.): From'] = members[ind].within_range_job.valid_from;
        thisMember['Job (Selec.): Until'] = members[ind].within_range_job.valid_until;
        thisMember['Job Contracts (Selec.)'] = contracts;
        thisMember['Job Fellowships (Selec.)'] = fellowships;

        thisMember['Jobs History'] = ''
        for (let indJob in members[ind].jobs) {
            if (members[ind].jobs[indJob].valid_from !== null) {
                members[ind].jobs[indJob].valid_from = time.moment(members[ind].jobs[indJob].valid_from)
                                                                .format('YYYY-MM-DD')
            }
            if (members[ind].jobs[indJob].valid_until !== null) {
                members[ind].jobs[indJob].valid_until = time.moment(members[ind].jobs[indJob].valid_until)
                                                                .format('YYYY-MM-DD')
            }
            let contracts = '';
            let fellowships = '';
            for (let indData in members[ind].jobs[indJob].contracts) {
                contracts = contracts + members[ind].jobs[indJob].contracts[indData].reference
            }
            for (let indData in members[ind].jobs[indJob].fellowships) {
                fellowships = fellowships
                    + members[ind].jobs[indJob].fellowships[indData].fellowship_acronym
                    + ' (' + members[ind].jobs[indJob].fellowships[indData].reference + ')'
                    + members[ind].jobs[indJob].fellowships[indData].funding_agency_official_name
                    + ', Mngmt: ' + members[ind].jobs[indJob].fellowships[indData].management_entity_official_name
            }
            thisMember['Jobs History'] = thisMember['Jobs History']
                        + members[ind].jobs[indJob].category_name_en
                        + ', ' + members[ind].jobs[indJob].situation_name_en
                        + ' @ ' + members[ind].jobs[indJob].organization
                        + ' (' + members[ind].jobs[indJob].valid_from
                        + ', ' + members[ind].jobs[indJob].valid_until
                        + ') ' + 'Contracts: ' + contracts
                        + ', Fellowships: ' + fellowships
                        +'\n';
        }

        thisMember['Person ID'] = members[ind].id;
        thisMember.Name = members[ind].name;
        thisMember['Colloquial Name'] = members[ind].colloquial_name;
        thisMember['Birth Date'] = '';
        thisMember['Age'] = '';
        if (members[ind].birth_date !== null && members[ind].birth_date !== undefined) {
            thisMember['Birth Date'] = time.momentToDate(members[ind].birth_date);
            thisMember['Age'] = today.diff(time.moment(members[ind].birth_date),'years');
        }
        thisMember['Gender'] = members[ind].gender;
        thisMember.Email = '';
        if (members[ind].personal_email.length > 0) {
            thisMember.Email = members[ind].personal_email[0].email;
        }
        thisMember['Work Email'] = '';
        if (members[ind].email.length > 0) {
            thisMember['Work Email'] = members[ind].email[0].email;
        }

        thisMember['DQ (FCT NOVA) Team'] = undefined;
        if (members[ind].departmentTeams !== undefined && members[ind].departmentTeams.length > 0) {
            thisMember['DQ (FCT NOVA) Team'] = '';
            for (let indDep in members[ind].departmentTeams) {
                thisMember['DQ (FCT NOVA) Team'] = thisMember['DQ (FCT NOVA) Team']
                    + members[ind].departmentTeams[indDep].team_name + ', ';
            }
        }

        if (members[ind].researchers_info.length > 0) {
            thisMember['Association Key'] = members[ind].researchers_info[0].association_key;
            thisMember['Ciência ID'] = members[ind].researchers_info[0].ciencia_id;
            thisMember.ORCID = members[ind].researchers_info[0].ORCID;
        } else {
            thisMember['Association Key'] = undefined;
            thisMember['Ciência ID'] = undefined;
            thisMember.ORCID = undefined;
        }
        thisMember['Lab History'] = undefined;
        if (members[ind].has_other_current_labs || members[ind].has_other_labs_within_range) {
            thisMember['Lab History'] = ''
            for (let indHistory in members[ind].history) {
                if (members[ind].history[indHistory].valid_from !== null) {
                    members[ind].history[indHistory].valid_from = time.moment(members[ind].history[indHistory].valid_from)
                                                                    .format('YYYY-MM-DD')
                }
                if (members[ind].history[indHistory].valid_until !== null) {
                    members[ind].history[indHistory].valid_until = time.moment(members[ind].history[indHistory].valid_until)
                                                                    .format('YYYY-MM-DD')
                }
                thisMember['Lab History'] = thisMember['Lab History']
                            + members[ind].history[indHistory].lab_position_name_en
                            + ', ' + members[ind].history[indHistory].dedication + '%, '
                            + members[ind].history[indHistory].lab_name
                            + ' (' + members[ind].history[indHistory].valid_from
                            + ', ' + members[ind].history[indHistory].valid_until
                            + ')\n';
            }
        }
        thisMember['Finished Degrees'] = degrees_history;
        degrees_history = ''
        for (let indDegree in members[ind].ongoing_degrees) {
            degrees_history = degrees_history + members[ind].ongoing_degrees[indDegree].name_en
                + ', ' + degrees_history + members[ind].ongoing_degrees[indDegree].start
                + '\n'
        }
        thisMember['Ongoing Degrees'] = degrees_history;

        let contracts = '';
        let fellowships = '';
        for (let indData in members[ind].current_job.contracts) {
            contracts = contracts + members[ind].current_job.contracts[indData].reference
        }
        for (let indData in members[ind].current_job.fellowships) {
            fellowships = fellowships
                + members[ind].current_job.fellowships[indData].fellowship_acronym
                + ' (' + members[ind].current_job.fellowships[indData].reference + ')'
                + members[ind].current_job.fellowships[indData].funding_agency_official_name
                + ', Mngmt: ' + members[ind].current_job.fellowships[indData].management_entity_official_name
        }
        thisMember['Department (Curr.)'] = members[ind].current_department.department;
        thisMember['School (Curr.)'] = members[ind].current_department.school_shortname_en;
        thisMember['University (Curr.)'] = members[ind].current_department.university_shortname_en;
        thisMember['Department (Curr.): From'] = members[ind].current_department.department_start;
        thisMember['Department (Curr.): Until'] = members[ind].current_department.department_end;

        thisMember['Department (Selec.)'] = members[ind].within_range_department.department;
        thisMember['School (Selec.)'] = members[ind].within_range_department.school_shortname_en;
        thisMember['University (Selec.)'] = members[ind].within_range_department.university_shortname_en;
        thisMember['Department (Selec.): From'] = members[ind].within_range_department.department_start;
        thisMember['Department (Selec.): Until'] = members[ind].within_range_department.department_end;

        thisMember['Department History'] = ''
        for (let indDep in members[ind].departments) {
            if (members[ind].departments[indDep].department_start !== null) {
                members[ind].departments[indDep].department_start = time.moment(members[ind].departments[indDep].department_start)
                                                                .format('YYYY-MM-DD')
            }
            if (members[ind].departments[indDep].department_end !== null) {
                members[ind].departments[indDep].department_end = time.moment(members[ind].departments[indDep].department_end)
                                                                .format('YYYY-MM-DD')
            }
            thisMember['Department History'] =  thisMember['Department History']
                        + members[ind].departments[indDep].department
                        + ',' + members[ind].departments[indDep].school_shortname_en
                        + ',' + members[ind].departments[indDep].university_shortname_en
                        + ' (' + members[ind].departments[indDep].department_start
                        + ', ' + members[ind].departments[indDep].department_end
                        + ')'
                        + '\n'
        }

        thisMember['Cost Center (Curr.)'] = members[ind].current_cost_center.short_name;
        thisMember['Cost Center (Curr.): From'] = members[ind].current_cost_center.valid_from;
        thisMember['Cost Center (Curr.): Until'] = members[ind].current_cost_center.valid_until;
        thisMember['Cost Center (Sel. Time)'] = members[ind].within_range_cost_center.short_name;
        thisMember['Cost Center (Sel. Time): From'] = members[ind].within_range_cost_center.valid_from;
        thisMember['Cost Center (Sel. Time): Until'] = members[ind].within_range_cost_center.valid_until;

        thisMember['Cost Centers History'] = ''
        for (let indCenter in members[ind].cost_center) {
            if (members[ind].cost_center[indCenter].valid_from !== null) {
                members[ind].cost_center[indCenter].valid_from = time.moment(members[ind].cost_center[indCenter].valid_from)
                                                                .format('YYYY-MM-DD')
            }
            if (members[ind].cost_center[indCenter].valid_until !== null) {
                members[ind].cost_center[indCenter].valid_until = time.moment(members[ind].cost_center[indCenter].valid_until)
                                                                .format('YYYY-MM-DD')
            }
            thisMember['Cost Centers History'] =  thisMember['Cost Centers History']
                        + members[ind].cost_center[indCenter].short_name
                        + ' (' + members[ind].cost_center[indCenter].valid_from
                        + ', ' + members[ind].cost_center[indCenter].valid_until
                        + ')'
                        + '\n'
        }
        membersCurated.push(thisMember);
    }

    return membersCurated;
}
function processResultsProductivity(vm, people) {
    let peoplePublications = [];
    let usedPubIDs = [];
    let publications = [];
    let publicationsTeams = [];
    for (let indPeople in people) {
        let person = people[indPeople];
        for (let indPub in person.publications) {
            let data = {};
            let dataUnique = {};
            let publication = person.publications[indPub];
            data['Researcher Name'] = person.name;
            data['Year'] = publication.year;
            data['Authors'] = publication.authors_raw;
            data['Title'] = publication.title;
            data['Journal Full'] = publication.journal_name;
            data['Journal Short'] = publication.journal_short_name;
            data['Volume'] = publication.volume;
            data['Start Page'] = publication.page_start;
            data['End Page'] = publication.page_end;
            data['DOI'] = publication.doi;
            data['WOS'] = publication.wos;
            let publicationTypes = ''
            for (let indTypes in publication.descriptions) {
                publicationTypes = publicationTypes
                    + publication.descriptions[indTypes].name_en + ', '
            }
            data['Pub. Type'] = publicationTypes;
            peoplePublications.push(data)
            if (usedPubIDs.indexOf(publication.publication_id) === -1
                && person.can_supervise === 1
            ) {
                dataUnique['Year'] = publication.year;
                dataUnique['Authors'] = publication.authors_raw;
                dataUnique['Title'] = publication.title;
                dataUnique['Journal Full'] = publication.journal_name;
                dataUnique['Journal Short'] = publication.journal_short_name;
                dataUnique['Volume'] = publication.volume;
                dataUnique['Start Page'] = publication.page_start;
                dataUnique['End Page'] = publication.page_end;
                dataUnique['DOI'] = publication.doi;
                dataUnique['WOS'] = publication.wos;
                dataUnique['Pub. Type'] = publicationTypes;
                publications.push(dataUnique);
                publicationsTeams.push({ publication, dataUnique })
                usedPubIDs.push(publication.publication_id);
            }
        }
    }
    let publicationTeamsLabs = [];
    for (let indPub in publicationsTeams) {
        let data = publicationsTeams[indPub].dataUnique;
        let textTeams = '';
        for (let indTeam in publicationsTeams[indPub].publication.teams) {
            textTeams = textTeams + publicationsTeams[indPub].publication.teams[indTeam].name + ',\n';

        }
        let textLabs = '';
        for (let indLab in publicationsTeams[indPub].publication.labs) {
            textLabs = textLabs + publicationsTeams[indPub].publication.labs[indLab].name + ',\n';
        }
        data['Teams'] = textTeams;
        data['Labs'] = textLabs;
        publicationTeamsLabs.push(data)
    }
    let peopleProjects = [];
    let usedIDs = [];
    let projects = [];
    for (let indPeople in people) {
        let person = people[indPeople];
        for (let indItem in person.projects) {
            let data = {};
            let dataUnique = {};
            let item = person.projects[indItem];
            data['Researcher Name'] = person.name;
            data['Person Start'] = time.momentToDate(item.valid_from);
            data['Person End'] = time.momentToDate(item.valid_until);
            data['Person Position'] = item.person_project_position;
            data['Call Type'] = item.call_type_name;
            data['Project Type'] = item.project_type_name;
            data['Proj. DB ID'] = item.project_id;
            data['Project Start'] = time.momentToDate(item.start);
            data['Project End'] = time.momentToDate(item.end);
            data['Acronym'] = item.acronym;
            data['Title'] = item.title;
            data['Ref.'] = item.reference;
            data['Website'] = item.website;
            data['Global amount (€)'] = item.global_amount;

            let textMngEnt = '';
            let textMngEntAmount = '';
            for (let indText in item.management_entities) {
                textMngEnt = textMngEnt
                    + item.management_entities[indText].official_name + '\n';
                textMngEntAmount = textMngEntAmount
                    + item.management_entities[indText].amount + '€\n';
            }
            data['Mngmt. Entities'] = textMngEnt;
            data['Mngmt. Entities Amount (€)'] = textMngEntAmount;
            let text = '';
            for (let indText in item.funding_entities) {
                text = text
                    + item.funding_entities[indText].official_name + '\n';
            }
            for (let indText in item.other_funding_entities) {
                text = text
                    + item.other_funding_entities[indText].name + '\n';
            }
            data['Fund. Agencies'] = text;
            text = '';
            for (let indText in item.areas) {
                text = text
                    + item.areas[indText].research_area + '\n';
            }
            data['Areas'] = text;
            data['Notes'] = item.notes;

            peopleProjects.push(data)
            if (usedIDs.indexOf(item.project_id) === -1) {
                dataUnique['Call Type'] = data['Call Type'];
                dataUnique['Project Type'] = data['Project Type'];
                dataUnique['Project Start'] = data['Project Start'];
                dataUnique['Project End'] = data['Project End'];
                dataUnique['Proj. DB ID'] = data['Proj. DB ID'];
                dataUnique['Acronym'] = data['Acronym'];
                dataUnique['Title'] = data['Title'];
                dataUnique['Ref.'] = data['Ref.'];
                dataUnique['Website'] = data['Website'];
                dataUnique['Global amount (€)'] = data['Global amount (€)'];
                dataUnique['Mngmt. Entities'] = data['Mngmt. Entities'];
                dataUnique['Mngmt. Entities Amount (€)'] = data['Mngmt. Entities Amount (€)'];
                dataUnique['Fund. Agencies'] = data['Fund. Agencies'];
                dataUnique['Areas'] = data['Areas'];
                dataUnique['Notes'] = data['Notes'];
                projects.push(dataUnique);
                usedIDs.push(item.project_id);
            }
        }
    }
    projects.sort((a, b) => {
        if (a['Project Start'] === null || a['Project Start'] === undefined ) {
            a['date_sort'] = time.moment('1000-01-01');
        } else {
            a['date_sort'] = time.moment(a['Project Start']);
        }
        if (b['Project Start'] === null || b['Project Start'] === undefined) {
            b['date_sort'] = time.moment('1000-01-01');
        } else {
            b['date_sort'] = time.moment(b['Project Start']);
        }
        if (a['date_sort'].isAfter(b['date_sort'])) {
            return -1;
        } else {
            return 1;
        }
    });

    usedIDs = [];
    let peopleIndustryProjects = [];
    let industryProjects = [];
    for (let indPeople in people) {
        let person = people[indPeople];
        for (let indItem in person.private_agreements) {
            let data = {};
            let dataUnique = {};
            let item = person.private_agreements[indItem];
            data['Researcher Name'] = person.name;
            data['Agree. Type'] = item.private_agreement_type_name;
            data['Agree. DB ID'] = item.agreement_id;
            data['Start'] = time.momentToDate(item.start);
            data['End'] = time.momentToDate(item.end);
            data['Acronym'] = item.acronym;
            data['Title'] = item.title;
            data['Ref.'] = item.reference;
            data['Website'] = item.website;
            data['Confidential?'] = item.confidential;
            data['Global amount (€)'] = item.global_amount;

            let text = '';
            for (let indText in item.management_entities) {
                text = text
                    + item.management_entities[indText].official_name + ': '
                    + item.management_entities[indText].amount + '€\n';
            }
            data['Mngmt. Entities'] = text;
            text = '';
            for (let indText in item.partners) {
                text = text
                    + item.partners[indText].name + '\n';
            }
            data['Partners'] = text;
            text = '';
            for (let indText in item.areas) {
                text = text
                    + item.areas[indText].research_area + '\n';
            }
            data['Notes'] = item.notes;

            peopleIndustryProjects.push(data)
            if (usedIDs.indexOf(item.agreement_id) === -1) {
                dataUnique['Agree. Type'] = data['Agree. Type'];
                dataUnique['Agree. DB ID'] = data['Agree. DB ID'];
                dataUnique['Start'] = data['Start'];
                dataUnique['End'] = data['End'];
                dataUnique['Proj. DB ID'] = data['Proj. DB ID'];
                dataUnique['Acronym'] = data['Acronym'];
                dataUnique['Title'] = data['Title'];
                dataUnique['Ref.'] = data['Ref.'];
                dataUnique['Website'] = data['Website'];
                dataUnique['Confidential?'] = data['Confidential?'];
                dataUnique['Global amount (€)'] = data['Global amount (€)'];
                dataUnique['Mngmt. Entities'] = data['Mngmt. Entities'];
                dataUnique['Partners'] = data['Partners'];
                dataUnique['Areas'] = data['Areas'];
                dataUnique['Notes'] = data['Notes'];
                industryProjects.push(dataUnique);
                usedIDs.push(item.agreement_id);
            }
        }
    }
    industryProjects.sort((a, b) => {
        if (a['Start'] === null || a['Start'] === undefined ) {
            a['date_sort'] = time.moment('1000-01-01');
        } else {
            a['date_sort'] = time.moment(a['Start']);
        }
        if (b['Start'] === null || b['Start'] === undefined) {
            b['date_sort'] = time.moment('1000-01-01');
        } else {
            b['date_sort'] = time.moment(b['Start']);
        }
        if (a['date_sort'].isAfter(b['date_sort'])) {
            return -1;
        } else {
            return 1;
        }
    });

    usedIDs = [];
    let peopleTrainingNetworks = [];
    let trainingNetworks = [];
    for (let indPeople in people) {
        let person = people[indPeople];
        for (let indItem in person.training_networks) {
            let data = {};
            let dataUnique = {};
            let item = person.training_networks[indItem];
            data['Researcher Name'] = person.name;
            data['Person Role'] = person.role_name;
            data['Net. DB ID'] = item.training_id;
            data['Net. Name'] = item.network_name;
            data['Start'] = time.momentToDate(item.start);
            data['End'] = time.momentToDate(item.end);
            data['Acronym'] = item.acronym;
            data['Title'] = item.title;
            data['Ref.'] = item.reference;
            data['Coordinator'] = item.coordinating_entity;
            data['Country'] = item.country_name;
            data['Website'] = item.website;
            data['Global amount (€)'] = item.global_amount;

            let text = '';
            for (let indText in item.management_entities) {
                text = text
                    + item.management_entities[indText].official_name + ': '
                    + item.management_entities[indText].amount + '€\n';
            }
            data['Mngmt. Entities'] = text;
            data['Notes'] = item.notes;

            peopleTrainingNetworks.push(data)
            if (usedIDs.indexOf(item.training_id) === -1) {
                dataUnique['Net. DB ID'] = data['Net. DB ID'];
                dataUnique['Net. Name'] = data['Net. Name'];
                dataUnique['Start'] = data['Start'];
                dataUnique['End'] = data['End'];
                dataUnique['Acronym'] = data['Acronym'];
                dataUnique['Title'] = data['Title'];
                dataUnique['Ref.'] = data['Ref.'];
                dataUnique['Coordinator'] = data['Coordinator'];
                dataUnique['Country'] = data['Country'];
                dataUnique['Website'] = data['Website'];
                dataUnique['Global amount (€)'] = data['Global amount (€)'];
                dataUnique['Mngmt. Entities'] = data['Mngmt. Entities'];
                dataUnique['Notes'] = data['Notes'];
                trainingNetworks.push(dataUnique);
                usedIDs.push(item.training_id);
            }
        }
    }

    usedIDs = [];
    let peopleStartups = [];
    let startups = [];
    for (let indPeople in people) {
        let person = people[indPeople];
        for (let indItem in person.startups) {
            let data = {};
            let dataUnique = {};
            let item = person.startups[indItem];
            data['Researcher Name'] = person.name;
            data['Person Position'] = person.position_name;
            data['Position Start'] = time.momentToDate(item.valid_from);
            data['Position End'] = time.momentToDate(item.valid_until);
            data['Startup DB ID'] = item.startup_id;
            data['Startup Name'] = item.startup_name;
            data['Startup Start'] = time.momentToDate(item.startup_start);
            data['Startup End'] = time.momentToDate(item.startup_end);
            data['Description'] = item.short_description;

            peopleStartups.push(data)

            if (usedIDs.indexOf(item.startup_id) === -1) {
                dataUnique['Startup DB ID'] = data['Startup DB ID']
                dataUnique['Startup Start'] = data['Startup Start']
                dataUnique['Startup End'] = data['Startup End']
                dataUnique['Description'] = data['Description']
                startups.push(dataUnique);
                usedIDs.push(item.startup_id);
            }
        }
    }

    usedIDs = [];
    let peopleCommunications = [];
    //let communications = [];
    for (let indPeople in people) {
        let person = people[indPeople];
        for (let indItem in person.communications) {
            let data = {};
            //let dataUnique = {};
            let item = person.communications[indItem];
            data['Researcher Name'] = person.name;
            data['Comm. DB ID'] = item.id;
            data['Comm. DOI'] = item.doi;
            data['Comm. Authors'] = item.authors_raw;
            data['Comm. Presenter'] = item.presenter;
            data['Comm. Title'] = item.title;
            data['Comm. Type'] = item.communication_type_name;
            data['Conference Title'] = item.conference_title;
            data['Conference Type'] = item.conference_type_name;
            data['International?'] = item.international;
            data['City'] = item.city;
            data['Country'] = item.country_name;
            data['Comm. Date'] = time.momentToDate(item.date);
            data['Raw Data'] = item.communication_raw;
            peopleCommunications.push(data)
        }
    }

    usedIDs = [];
    let peopleOrganizationMeetings = [];
    let organizationMeetings = [];
    for (let indPeople in people) {
        let person = people[indPeople];
        for (let indItem in person.organization_meetings) {
            let data = {};
            let dataUnique = {};
            let item = person.organization_meetings[indItem];
            data['Researcher Name'] = person.name;
            data['Organizer Role'] = item.role;
            data['Meet. Organization DB ID'] = item.id;
            data['Meeting Name'] = item.meeting_name;
            data['Meeting Type'] = item.meeting_type_name;
            data['International'] = item.international;
            data['Country'] = item.country_name;
            data['Start date'] = time.momentToDate(item.start);
            data['End date'] = time.momentToDate(item.end);
            data['Notes'] = item.description;
            peopleOrganizationMeetings.push(data);
            if (usedIDs.indexOf(item.id) === -1) {
                dataUnique['Meet. Organization DB ID'] = data['Meet. Organization DB ID'];
                dataUnique['Meeting Name'] = data['Meeting Name'];
                dataUnique['Meeting Type'] = data['Meeting Type'];
                dataUnique['International'] = data['International'];
                dataUnique['Country'] = data['Country'];
                dataUnique['Start date'] = data['Start date'];
                dataUnique['End date'] = data['End date'];
                dataUnique['Notes'] = data['Notes'];
                organizationMeetings.push(dataUnique);
                usedIDs.push(item.id);
            }
        }
    }

    usedIDs = [];
    let peoplePrizes = [];
    let prizes = [];
    for (let indPeople in people) {
        let person = people[indPeople];
        for (let indItem in person.prizes) {
            let data = {};
            let dataUnique = {};
            let item = person.prizes[indItem];
            data['Researcher Name'] = person.name;
            data['Prize DB ID'] = item.id;
            data['Recipients'] = item.recipients;
            data['Prize Name'] = item.name;
            data['Organization'] = item.organization;
            data['Year'] = item.year;
            data['Amount (€)'] = item.amount_euro;
            data['Notes'] = item.notes;
            peoplePrizes.push(data)

            if (usedIDs.indexOf(item.id) === -1) {
                dataUnique['Prize DB ID'] = data['Prize DB ID'];
                dataUnique['Recipients'] = data['Recipients'];
                dataUnique['Prize Name'] = data['Prize Name'];
                dataUnique['Organization'] = data['Organization'];
                dataUnique['Year'] = data['Year'];
                dataUnique['Amount (€)'] = data['Amount (€)'];
                dataUnique['Notes'] = data['Notes'];

                prizes.push(dataUnique);
                usedIDs.push(item.id);
            }
        }
    }

    usedIDs = [];
    let peopleBoards = [];
    let boards = [];
    for (let indPeople in people) {
        let person = people[indPeople];
        for (let indItem in person.boards) {
            let data = {};
            let dataUnique = {};
            let item = person.boards[indItem];
            data['Researcher Name'] = person.name;
            data['Role'] = item.role;
            data['Board DB ID'] = item.id;
            data['Board Type'] = item.board_type_name;
            data['Board Name'] = item.board_name;
            data['International'] = item.year;
            data['Start'] = time.momentToDate(item.start_date);
            data['End'] = time.momentToDate(item.end_date);
            data['Notes'] = item.short_description;
            peopleBoards.push(data)

            if (usedIDs.indexOf(item.id) === -1) {
                dataUnique['Board DB ID'] = data['Board DB ID'];
                dataUnique['Board Type'] = data['Board Type'];
                dataUnique['Board Name'] = data['Board Name'];
                dataUnique['International'] = data['International'];
                dataUnique['Start'] = data['Start'];
                dataUnique['End'] = data['End'];
                dataUnique['Notes'] = data['Notes'];
                boards.push(dataUnique);
                usedIDs.push(item.id);
            }
        }
    }

    usedIDs = [];
    let peoplePatents = [];
    let patents = [];
    for (let indPeople in people) {
        let person = people[indPeople];
        for (let indItem in person.patents) {
            let data = {};
            let dataUnique = {};
            let item = person.patents[indItem];
            data['Researcher Name'] = person.name;
            data['Patent DB ID'] = item.id;
            data['Patent Type'] = item.patent_type_name;
            data['Authors'] = item.authors_raw;
            data['Title'] = item.title;
            data['Reference 1'] = item.reference_number_1;
            data['Reference 2'] = item.reference_number_2;
            data['Status'] = item.patent_status_name;
            data['Status Date'] = time.momentToDate(item.status_date);
            data['Notes'] = item.description;

            peoplePatents.push(data)

            if (usedIDs.indexOf(item.id) === -1) {
                dataUnique['Patent DB ID'] = data['Patent DB ID'];
                dataUnique['Patent Type'] = data['Patent Type'];
                dataUnique['Authors'] = data['Authors'];
                dataUnique['Title'] = data['Title'];
                dataUnique['Reference 1'] = data['Reference 1'];
                dataUnique['Reference 2'] = data['Reference 2'];
                dataUnique['Status'] = data['Status'];
                dataUnique['Status Date'] = data['Status Date'];
                dataUnique['Notes'] = data['Notes'];
                patents.push(dataUnique);
                usedIDs.push(item.id);
            }
        }
    }

    usedIDs = [];
    let peopleDatasets = [];
    let datasets = [];
    for (let indPeople in people) {
        let person = people[indPeople];
        for (let indItem in person.data_sets) {
            let data = {};
            let dataUnique = {};
            let item = person.data_sets[indItem];
            data['Researcher Name'] = person.name;
            data['Dataset DB ID'] = item.id;
            data['Dataset Tyoe'] = item.data_set_type_name;
            data['Description'] = item.short_description;
            data['Number of sets'] = item.number_sets;
            data['Database name'] = item.database_name;
            data['URL'] = item.url;
            data['Year'] = item.year;

            peopleDatasets.push(data)

            if (usedIDs.indexOf(item.id) === -1) {
                dataUnique['Dataset DB ID'] = data['Dataset DB ID'];
                dataUnique['Dataset Tyoe'] = data['Dataset Tyoe'];
                dataUnique['Description'] = data['Description'];
                dataUnique['Number of sets'] = data['Number of sets'];
                dataUnique['Database name'] = data['Database name'];
                dataUnique['URL'] = data['URL'];
                dataUnique['Year'] = data['Year'];
                datasets.push(dataUnique);
                usedIDs.push(item.id);
            }
        }
    }

    usedIDs = [];
    let peopleOutreach = [];
    let outreach = [];
    for (let indPeople in people) {
        let person = people[indPeople];
        for (let indItem in person.outreach) {
            let data = {};
            let dataUnique = {};
            let item = person.outreach[indItem];
            data['Researcher Name'] = person.name;
            data['Outreach DB ID'] = item.id;
            data['Name'] = item.outreach_name;
            data['Description'] = item.description;
            data['International'] = item.international;
            data['Event Date'] = time.momentToDate(item.event_date);

            peopleOutreach.push(data)

            if (usedIDs.indexOf(item.id) === -1) {
                dataUnique['Outreach DB ID'] = data['Outreach DB ID'];
                dataUnique['Name'] = data['Name'];
                dataUnique['Description'] = data['Description'];
                dataUnique['International'] = data['International'];
                dataUnique['Event Date'] = data['Event Date'];
                outreach.push(dataUnique);
                usedIDs.push(item.id);
            }
        }
    }

    return {
        peoplePublications,
        publicationTeamsLabs,
        publications,
        peopleProjects,
        projects,
        peopleIndustryProjects,
        industryProjects,
        peopleTrainingNetworks,
        trainingNetworks,
        peopleStartups,
        startups,
        peopleCommunications,
        peopleOrganizationMeetings,
        organizationMeetings,
        peoplePrizes,
        prizes,
        peopleBoards,
        boards,
        peoplePatents,
        patents,
        peopleDatasets,
        datasets,
        peopleOutreach,
        outreach,
    };
}
function processForProductivitySpreadsheet(data) {
    return data
}
function processResultsSpaces(vm, dataSpaces) {
    let peopleSpaces = [];
    //let usedIDs = [];
    //let publications = [];
    for (let indPeople in dataSpaces.people) {
        let person = dataSpaces.people[indPeople];
        for (let indSpace in person.spaces) {
            let data = {};
            let space = person.spaces[indSpace];
            data['User Name'] = person.name;
            data['User Role'] = space.role_name;
            data['User From'] = space.valid_from;
            data['User Until'] = space.valid_until;
            data['Space Type'] = space.space_type_name;
            data['Space Ref.'] = space.reference;
            data['Space Name'] = space.name_pt;
            data['Comments'] = space.comments;
            peopleSpaces.push(data)

        }
    }
    let teamsSpaces = [];
    for (let indTeam in dataSpaces.spacesTeams) {
        let space = dataSpaces.spacesTeams[indTeam];
        let data = {};
        data['Space Ref.'] = space.reference;
        data['Team Name'] = space.team_name;
        data['Percentage'] = space.percentage;
        data['Area (m^2)'] = space.area;
        teamsSpaces.push(data);
    }
    return {
        peopleSpaces,
        teamsSpaces,
    };
}
function processForSpacesSpreadsheet(data) {
    return data
}
function processResultsSupervision(vm, dataSupervisors) {
    let peopleSupervisors = [];
    //let usedIDs = [];
    //let publications = [];
    for (let indPeople in dataSupervisors) {
        let person = dataSupervisors[indPeople];
        for (let indSupervisor in person.supervises) {
            let data = {};
            let supervisor = person.supervises[indSupervisor];
            data['Student Name'] = supervisor.student_name;
            data['Supervisor Name'] = supervisor.supervisor_name;
            data['Supervisor Type'] = supervisor.supervisor_type_name;
            data['Degree'] = supervisor.degree_name;
            data['Degree Start'] = time.momentToDate(supervisor.degree_start);
            data['Degree Estimated End'] = time.momentToDate(supervisor.degree_estimate_end);
            data['Degree End'] = time.momentToDate(supervisor.degree_end);
            data['Degree Program'] = supervisor.degree_program;
            data['Supervision From'] = time.momentToDate(supervisor.valid_from);
            data['Supervision Until'] = time.momentToDate(supervisor.valid_until);
            data['Dep. Team Name'] = supervisor.department_team_name;
            data['From Table'] = 'Responsibles';
            peopleSupervisors.push(data);
        }
        for (let indSupervisor in person.degrees_supervised) {
            let data = {};
            let supervisor = person.degrees_supervised[indSupervisor];
            data['Student Name'] = supervisor.student_name;
            data['Supervisor Name'] = supervisor.supervisor_name;
            data['Supervisor Type'] = supervisor.supervisor_type_name;
            data['Supervision From'] = time.momentToDate(supervisor.valid_from);
            data['Supervision Until'] = time.momentToDate(supervisor.valid_until);
            data['Dep. Team Name'] = supervisor.department_team_name;
            data['Degree'] = supervisor.degree_name;
            data['Degree Start'] = time.momentToDate(supervisor.degree_start);
            data['Degree Estimated End'] = time.momentToDate(supervisor.degree_estimate_end);
            data['Degree End'] = time.momentToDate(supervisor.degree_end);
            data['Degree Program'] = supervisor.degree_program;
            data['From Table'] = 'Degrees';
            peopleSupervisors.push(data);
        }
    }
    return {
        peopleSupervisors,
    };
}
function processForSupervisionSpreadsheet(data) {
    return data
}
function prepareStringComparison(str) {
    if (str === null || str === undefined) {
        return null;
    } else {
        return str.toLocaleLowerCase()
            .replace(/[áàãâä]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[íìîï]/g, 'i')
            .replace(/[óòõôö]/g, 'o')
            .replace(/[úùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[ñ]/g, 'n')
            .replace(/(\.\s)/g, '')
            .replace(/(\.)/g, '')
            .replace(/[-:()]/g, ' ')
            .trim()
            ;
    }
}

export default {
    data () {
        return {
            progress: false,
            success: false,
            error: false,
            filterUnitID: null,
            filterPoleID: null,
            filterDepartmentID: null,
            filterLabID: null,
            filterDepartmentTeamID: null,
            filterChosenPeople: [],
            filterDateFrom: null,
            showDateFrom: false,
            filterDateUntil: null,
            showDateUntil: false,
            searchPeople: '',
            people: [],
            units: [],
            poles: [],
            departments: [],
            labs: [],
            departmentTeams: [],
        }
    },
    props: {
    },
    created () {
        this.getUnits();
        this.getPoles();
        this.getDepartments();
        this.getLabs();
        this.getPeople();
        this.getDepartmentTeams();
    },
    computed: {
        queryString () {
            let query = '';
            let firstOnQuery = true;
            if (this.filterUnitID) {
                if (firstOnQuery) {
                    firstOnQuery = false;
                    query = query + '?unit=' + this.filterUnitID;
                } else {
                    query = query + '&unit=' + this.filterUnitID;
                }
            }
            if (this.filterPoleID) {
                if (firstOnQuery) {
                    firstOnQuery = false;
                    query = query + '?pole=' + this.filterPoleID;
                } else {
                    query = query + '&pole=' + this.filterPoleID;
                }
            }
            if (this.filterChosenPeople !== undefined
                && this.filterChosenPeople.length > 0) {
                let peopleQuery = ''
                for (let indPeople in this.filterChosenPeople) {
                    peopleQuery = peopleQuery + this.filterChosenPeople[indPeople].id + ','
                }
                peopleQuery = peopleQuery.slice(0, -1);
                if (firstOnQuery) {
                    firstOnQuery = false;
                    query = query + '?people=' + peopleQuery;
                } else {
                    query = query + '&people=' + peopleQuery;
                }
            }
            if (this.filterDepartmentID) {
                if (firstOnQuery) {
                    firstOnQuery = false;
                    query = query + '?department=' + this.filterDepartmentID;
                } else {
                    query = query + '&department=' + this.filterDepartmentID;
                }
            }
            if (this.filterLabID) {
                if (firstOnQuery) {
                    firstOnQuery = false;
                    query = query + '?lab=' + this.filterLabID;
                } else {
                    query = query + '&lab=' + this.filterLabID;
                }
            }
            if (this.filterDepartmentTeamID) {
                if (firstOnQuery) {
                    firstOnQuery = false;
                    query = query + '?depTeam=' + this.filterDepartmentTeamID;
                } else {
                    query = query + '&depTeam=' + this.filterDepartmentTeamID;
                }
            }
            if (this.filterDateFrom) {
                if (firstOnQuery) {
                    firstOnQuery = false;
                    query = query + '?dateFrom=' + this.filterDateFrom;
                } else {
                    query = query + '&dateFrom=' + this.filterDateFrom;
                }
            }
            if (this.filterDateUntil) {
                if (firstOnQuery) {
                    firstOnQuery = false;
                    query = query + '?dateUntil=' + this.filterDateUntil;
                } else {
                    query = query + '&dateUntil=' + this.filterDateUntil;
                }
            }
            return query;
        },

    },
    methods: {
        getUnits() {
            var vm = this;
            const urlSubmit = 'api/v2/' + 'units';
            return subUtil.getPublicInfo(vm, urlSubmit, 'units');
        },
        getPoles () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'poles';
            return subUtil.getPublicInfo(vm, urlSubmit, 'poles');
        },
        getDepartments () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'departments';
            return subUtil.getPublicInfo(vm, urlSubmit, 'departments');
        },
        getDepartmentTeams() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'department-teams';
                return subUtil.getPublicInfo(vm, urlSubmit, 'departmentTeams');
            }
        },
        getPeople() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'people-simple';
                return subUtil.getPublicInfo(vm, urlSubmit, 'people', 'name');
            }
        },
        getLabs() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'labs';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labs');
            }
        },
        getSpreadsheetData () {
            this.progress = true;
            let this_session = this.$store.state.session;
            let managerID = this_session.userID;
            let urlSubmit = 'api/managers/' + managerID
                        + '/export-data/people' + this.queryString;
            this.$http.get(urlSubmit,
                { headers:
                    {'Authorization': 'Bearer ' + localStorage['v2-token']},
                }
            )
            .then((result) => {
                //console.log(result)
                this.saveSpreadsheet(result.data.result);
            })
            .catch((error) => {
                this.progress = false;
                this.error = true;
                setTimeout(() => {this.error = false;}, 6000)
                // eslint-disable-next-line
                console.log(error)
            });
        },
        saveSpreadsheet (people) {
            let today = time.moment();
            let dateFile = time.momentToDate(today, 'Europe/Lisbon', 'YYYY-MM-DDTHHmmss');
            let items = processResults(this, people)
            let itemsSpreadsheet = processForSpreadsheet(items);
            //console.log(items)
            //console.log(itemsSpreadsheet)
            //alert('asasa')
            let wb = XLSX.utils.book_new();
            let ws  = XLSX.utils.json_to_sheet(itemsSpreadsheet);
            XLSX.utils.book_append_sheet(wb, ws, 'Data');
            let filename = 'members_'
            if (this.filterUnitID !== null && this.filterUnitID !== undefined) {
                filename = filename + 'unit_' + this.filterUnitID;
            }
            if (this.filterPoleID !== null && this.filterPoleID !== undefined) {
                filename = filename + '_city_' + this.filterPoleID;
            }
            if (this.filterDepartmentID !== null && this.filterDepartmentID !== undefined) {
                filename = filename + '_department_' + this.filterDepartmentID;
            }
            if (this.filterLabID !== null && this.filterLabID !== undefined) {
                filename = filename + '_lab_' + this.filterLabID;
            }
            if (this.filterChosenPeople !== null && this.filterChosenPeople !== undefined
                && this.filterChosenPeople.length > 0) {
                //let peopleQuery = ''
                //for (let indPeople in this.filterChosenPeople) {
                //    peopleQuery = peopleQuery + this.filterChosenPeople[indPeople].id + ','
                //}
                //peopleQuery = peopleQuery.slice(0, -1);
                //filename = filename + '_people_' + peopleQuery;
                filename = filename + '_specific people_';
            }
            if (this.filterDepartmentTeamID !== null && this.filterDepartmentTeamID !== undefined) {
                filename = filename + '_depTeam_' + this.filterDepartmentTeamID;
            }
            if (this.filterDateFrom !== null && this.filterDateFrom !== undefined) {
                filename = filename + '_from_' + this.filterDateFrom;
            }
            if (this.filterDateUntil !== null && this.filterDateUntil !== undefined) {
                filename = filename + '_until_' + this.filterDateUntil;
            }
            XLSX.writeFile(wb, filename + '_' + dateFile + '.xlsx');
            this.progress = false;
            this.success = true;
            setTimeout(() => {this.success = false;}, 1500)

        },
        getSpreadsheetDataProductivity () {
            this.progress = true;
            let this_session = this.$store.state.session;
            let managerID = this_session.userID;
            let urlSubmit = 'api/managers/' + managerID
                        + '/export-data/productivity' + this.queryString;
            this.$http.get(urlSubmit,
                { headers:
                    {'Authorization': 'Bearer ' + localStorage['v2-token']},
                }
            )
            .then((result) => {
                this.saveSpreadsheetProductivity(result.data.result);
            })
            .catch((error) => {
                this.progress = false;
                this.error = true;
                setTimeout(() => {this.error = false;}, 6000)
                // eslint-disable-next-line
                console.log(error)
            });
        },
        saveSpreadsheetProductivity (people) {
            let today = time.moment();
            let dateFile = time.momentToDate(today, 'Europe/Lisbon', 'YYYY-MM-DDTHHmmss');
            let items = processResultsProductivity(this, people)
            let data = processForProductivitySpreadsheet(items);
            //console.log(data)
            //let itemsSpreadsheet = data.peoplePublications

            let wb = XLSX.utils.book_new();
            let ws  = XLSX.utils.json_to_sheet(data.peoplePublications);
            XLSX.utils.book_append_sheet(wb, ws, 'People-Publications');
            ws  = XLSX.utils.json_to_sheet(data.publications);
            XLSX.utils.book_append_sheet(wb, ws, 'Publications');
            ws  = XLSX.utils.json_to_sheet(data.publicationTeamsLabs);
            XLSX.utils.book_append_sheet(wb, ws, 'Teams-Publications');
            ws  = XLSX.utils.json_to_sheet(data.peopleCommunications);
            XLSX.utils.book_append_sheet(wb, ws, 'People-Communications');
            ws  = XLSX.utils.json_to_sheet(data.peopleOrganizationMeetings);
            XLSX.utils.book_append_sheet(wb, ws, 'People-Org.Meetings');
            ws  = XLSX.utils.json_to_sheet(data.organizationMeetings);
            XLSX.utils.book_append_sheet(wb, ws, 'Org.Meetings');
            ws  = XLSX.utils.json_to_sheet(data.peopleProjects);
            XLSX.utils.book_append_sheet(wb, ws, 'People-Projects');
            ws  = XLSX.utils.json_to_sheet(data.projects);
            XLSX.utils.book_append_sheet(wb, ws, 'Projects');
            ws  = XLSX.utils.json_to_sheet(data.peopleIndustryProjects);
            XLSX.utils.book_append_sheet(wb, ws, 'People-Agreements');
            ws  = XLSX.utils.json_to_sheet(data.industryProjects);
            XLSX.utils.book_append_sheet(wb, ws, 'Agreements');
            ws  = XLSX.utils.json_to_sheet(data.peopleTrainingNetworks);
            XLSX.utils.book_append_sheet(wb, ws, 'People-Training Networks');
            ws  = XLSX.utils.json_to_sheet(data.trainingNetworks);
            XLSX.utils.book_append_sheet(wb, ws, 'Training Networks');
            ws  = XLSX.utils.json_to_sheet(data.peopleStartups);
            XLSX.utils.book_append_sheet(wb, ws, 'People-Startups');
            ws  = XLSX.utils.json_to_sheet(data.startups);
            XLSX.utils.book_append_sheet(wb, ws, 'Startups');
            ws  = XLSX.utils.json_to_sheet(data.peoplePrizes);
            XLSX.utils.book_append_sheet(wb, ws, 'People-Prizes');
            ws  = XLSX.utils.json_to_sheet(data.prizes);
            XLSX.utils.book_append_sheet(wb, ws, 'Prizes');
            ws  = XLSX.utils.json_to_sheet(data.peopleBoards);
            XLSX.utils.book_append_sheet(wb, ws, 'People-Boards');
            ws  = XLSX.utils.json_to_sheet(data.boards);
            XLSX.utils.book_append_sheet(wb, ws, 'Boards');
            ws  = XLSX.utils.json_to_sheet(data.peoplePatents);
            XLSX.utils.book_append_sheet(wb, ws, 'People-Patents');
            ws  = XLSX.utils.json_to_sheet(data.patents);
            XLSX.utils.book_append_sheet(wb, ws, 'Patents');
            ws  = XLSX.utils.json_to_sheet(data.peopleDatasets);
            XLSX.utils.book_append_sheet(wb, ws, 'People-Datasets');
            ws  = XLSX.utils.json_to_sheet(data.datasets);
            XLSX.utils.book_append_sheet(wb, ws, 'Datasets');
            ws  = XLSX.utils.json_to_sheet(data.peopleOutreach);
            XLSX.utils.book_append_sheet(wb, ws, 'People-Outreach');
            ws  = XLSX.utils.json_to_sheet(data.outreach);
            XLSX.utils.book_append_sheet(wb, ws, 'Outreach');

            let filename = 'people_productivity_'
            if (this.filterUnitID !== null && this.filterUnitID !== undefined) {
                filename = filename + 'unit_' + this.filterUnitID;
            }
            if (this.filterPoleID !== null && this.filterPoleID !== undefined) {
                filename = filename + '_city_' + this.filterPoleID;
            }
            if (this.filterDepartmentID !== null && this.filterDepartmentID !== undefined) {
                filename = filename + '_department_' + this.filterDepartmentID;
            }
            if (this.filterDepartmentTeamID !== null && this.filterDepartmentTeamID !== undefined) {
                filename = filename + '_depTeam_' + this.filterDepartmentTeamID;
            }
            if (this.filterDateFrom !== null && this.filterDateFrom !== undefined) {
                filename = filename + '_from_' + this.filterDateFrom;
            }
            if (this.filterDateUntil !== null && this.filterDateUntil !== undefined) {
                filename = filename + '_until_' + this.filterDateUntil;
            }
            XLSX.writeFile(wb, filename + '_' + dateFile + '.xlsx');
            this.progress = false;
            this.success = true;
            setTimeout(() => {this.success = false;}, 1500)

        },
        getSpreadsheetDataSpaces () {
            this.progress = true;
            let this_session = this.$store.state.session;
            let managerID = this_session.userID;
            let urlSubmit = 'api/managers/' + managerID
                        + '/export-data/spaces' + this.queryString;
            this.$http.get(urlSubmit,
                { headers:
                    {'Authorization': 'Bearer ' + localStorage['v2-token']},
                }
            )
            .then((result) => {
                this.saveSpreadsheetSpaces(result.data.result);
            })
            .catch((error) => {
                this.progress = false;
                this.error = true;
                setTimeout(() => {this.error = false;}, 6000)
                // eslint-disable-next-line
                console.log(error)
            });
        },
        saveSpreadsheetSpaces (data) {
            let today = time.moment();
            let dateFile = time.momentToDate(today, 'Europe/Lisbon', 'YYYY-MM-DDTHHmmss');
            let items = processResultsSpaces(this, data)
            let spacesData = processForSpacesSpreadsheet(items);


            let wb = XLSX.utils.book_new();
            let ws  = XLSX.utils.json_to_sheet(spacesData.peopleSpaces);
            XLSX.utils.book_append_sheet(wb, ws, 'People-Spaces');
            ws  = XLSX.utils.json_to_sheet(spacesData.teamsSpaces);
            XLSX.utils.book_append_sheet(wb, ws, 'Team-Spaces');


            let filename = 'people_teams_spaces_'
            if (this.filterUnitID !== null && this.filterUnitID !== undefined) {
                filename = filename + 'unit_' + this.filterUnitID;
            }
            if (this.filterPoleID !== null && this.filterPoleID !== undefined) {
                filename = filename + '_city_' + this.filterPoleID;
            }
            if (this.filterDepartmentID !== null && this.filterDepartmentID !== undefined) {
                filename = filename + '_department_' + this.filterDepartmentID;
            }
            if (this.filterDepartmentTeamID !== null && this.filterDepartmentTeamID !== undefined) {
                filename = filename + '_depTeam_' + this.filterDepartmentTeamID;
            }
            if (this.filterDateFrom !== null && this.filterDateFrom !== undefined) {
                filename = filename + '_from_' + this.filterDateFrom;
            }
            if (this.filterDateUntil !== null && this.filterDateUntil !== undefined) {
                filename = filename + '_until_' + this.filterDateUntil;
            }
            XLSX.writeFile(wb, filename + '_' + dateFile + '.xlsx');
            this.progress = false;
            this.success = true;
            setTimeout(() => {this.success = false;}, 1500)

        },
        getSpreadsheetDataSupervision () {
            this.progress = true;
            let this_session = this.$store.state.session;
            let managerID = this_session.userID;
            let urlSubmit = 'api/managers/' + managerID
                        + '/export-data/supervision' + this.queryString;
            this.$http.get(urlSubmit,
                { headers:
                    {'Authorization': 'Bearer ' + localStorage['v2-token']},
                }
            )
            .then((result) => {
                //console.log(result.data.result)
                this.saveSpreadsheetSupervision(result.data.result);
            })
            .catch((error) => {
                this.progress = false;
                this.error = true;
                setTimeout(() => {this.error = false;}, 6000)
                // eslint-disable-next-line
                console.log(error)
            });
        },
        saveSpreadsheetSupervision (data) {
            let today = time.moment();
            let dateFile = time.momentToDate(today, 'Europe/Lisbon', 'YYYY-MM-DDTHHmmss');
            let items = processResultsSupervision(this, data)
            let supervisionData = processForSupervisionSpreadsheet(items);


            let wb = XLSX.utils.book_new();
            let ws  = XLSX.utils.json_to_sheet(supervisionData.peopleSupervisors);
            XLSX.utils.book_append_sheet(wb, ws, 'Supervisions');


            let filename = 'people_supervision_'
            if (this.filterUnitID !== null && this.filterUnitID !== undefined) {
                filename = filename + 'unit_' + this.filterUnitID;
            }
            if (this.filterPoleID !== null && this.filterPoleID !== undefined) {
                filename = filename + '_city_' + this.filterPoleID;
            }
            if (this.filterDepartmentID !== null && this.filterDepartmentID !== undefined) {
                filename = filename + '_department_' + this.filterDepartmentID;
            }
            if (this.filterDepartmentTeamID !== null && this.filterDepartmentTeamID !== undefined) {
                filename = filename + '_depTeam_' + this.filterDepartmentTeamID;
            }
            if (this.filterDateFrom !== null && this.filterDateFrom !== undefined) {
                filename = filename + '_from_' + this.filterDateFrom;
            }
            if (this.filterDateUntil !== null && this.filterDateUntil !== undefined) {
                filename = filename + '_until_' + this.filterDateUntil;
            }
            XLSX.writeFile(wb, filename + '_' + dateFile + '.xlsx');
            this.progress = false;
            this.success = true;
            setTimeout(() => {this.success = false;}, 1500)

        },
        resetValues () {
            this.filterUnitID = null;
            this.filterPoleID = null;
            this.filterDepartmentID = null;
            this.filterDepartmentTeamID = null;
            this.filterLabID = null;
            this.filterDateFrom = null;
            this.filterDateUntil = null;
            this.filterChosenPeople = [];
        },
        customSearch (item, queryText, itemText) {
            let queryPre = prepareStringComparison(queryText);
            let query = queryPre.split(' ');
            let text = prepareStringComparison(itemText);
            for (let ind in query) {
                if (text.indexOf(query[ind]) === -1) {
                    return false;
                }
            }
            return true;
        },
        removePerson (item) {
            this.filterChosenPeople.splice(this.filterChosenPeople.indexOf(item), 1)
            //this.chips = [...this.chips]
        },
    }
}
</script>

<style>

</style>