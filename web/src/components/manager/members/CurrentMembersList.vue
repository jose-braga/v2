<template>
    <v-card>
        <v-card-title primary-title>
            <div>
                <h3 class="headline">Current members and positions</h3>
            </div>
        </v-card-title>
        <v-card-text></v-card-text>
        <v-row justify="center" v-if="unitId || cityId">
            <v-dialog
                v-model="dialogNewMember"
                scrollable
                max-width="600px"
            >
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    color="primary"
                    dark
                    large
                    v-bind="attrs"
                    v-on="on"
                >
                    Add new member
                </v-btn>
            </template>
            <v-card>
                <v-card-title>Fill in new member data</v-card-title>
                <v-divider></v-divider>
                <v-card-text >
                    <AddMember
                        :segment-type="segmentType"
                        :unit-id="unitId"
                        :city-id="cityId"
                        :unit-data="unitData"
                        :city-data="cityData"
                        :manager-id="managerID"
                        :endpoint="endpoint"
                    >
                    </AddMember>
                </v-card-text>
                <v-divider></v-divider>
            </v-card>
            </v-dialog>
        </v-row>
        <v-row>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search by name"
                    single-line
                    hide-details
                    @input="filterData"
                    class="px-2 mb-4"
                ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="searchLab"
                    append-icon="mdi-magnify"
                    label="Search by lab"
                    single-line
                    hide-details
                    @input="filterData"
                    class="px-2 mb-4"
                ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="searchGroup"
                    append-icon="mdi-magnify"
                    label="Search by group"
                    single-line
                    hide-details
                    @input="filterData"
                    class="px-2 mb-4"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-container>
            <v-data-table
                item-key="person_id"
                :headers="headers"
                :options.sync="options"
                :footer-props="footerProps"
                :items="data.members"
                :items-per-page="itemsPerPage"
                :server-items-length="totalMembers"
                :loading="loading"
                class="elevation-1"
            >
                <template v-slot:top>
                    <v-dialog v-model="dialog" max-width="1600px">
                        <MemberDetails
                            :person-id="memberID"
                            :person-name="memberName"
                            :manager-id="managerID"
                            :endpoint="endpoint">
                        </MemberDetails>
                    </v-dialog>
                </template>
                <template v-slot:item.action="{ item }">
                    <v-icon @click="editItem(item)">mdi-account-details</v-icon>
                </template>
            </v-data-table>
            <v-row justify="center" align="center" class="mt-1">
                <v-col cols="12" align="center">
                    <v-row justify="center" align="center">
                        <v-col cols="1" sm="2">
                            <v-btn fab color="green" @click="generateSpreadsheet()">
                                <v-icon color="white" x-large>mdi-file-excel</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col cols="1" sm="2">
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

import time from '@/components/common/date-utils'
import subUtil from '@/components/common/submit-utils'
import MemberDetails from '../member_details/MemberDetails'
import AddMember from './AddMember'
import {debounce} from 'lodash'
import XLSX from 'xlsx'

function processResults(vm, result) {
    let currentMembers = [];
    let today = time.moment();
    for (let ind in result) {
        if (result[ind].history.length > 0) {
            for (let indHistory in result[ind].history) {
                let validFrom = result[ind].history[indHistory].valid_from;
                let validUntil = result[ind].history[indHistory].valid_until;
                if ((validFrom === null || time.moment(validFrom).isBefore(today))
                    && (validUntil === null || time.moment(validUntil).isAfter(today))
                    ) {
                    //result[ind].progress = false;
                    //result[ind].success = undefined;
                    //result[ind].error = undefined;
                    result[ind].history[indHistory].valid_from = time.momentToDate(result[ind].history[indHistory].valid_from);
                    result[ind].history[indHistory].valid_until = time.momentToDate(result[ind].history[indHistory].valid_until);
                    //result[ind].history[indHistory].show_valid_from = false;
                    //result[ind].history[indHistory].show_valid_until = false;
                    //result[ind].history[indHistory].show_add_more_recent = true;
                    //result[ind].history[indHistory].to_delete = false;
                    result[ind].most_recent_data = result[ind].history[indHistory];
                    //result[ind].newer_data = {}
                    currentMembers.push(result[ind]);
                    break;
                }
            }
        } else {
            result[ind].most_recent_data = {};
            currentMembers.push(result[ind]);
        }

    }
    return currentMembers;
}
function processForSpreadsheet(members) {
    let membersCurated = [];
    let today = time.moment();
    for (let ind in members) {
        let thisMember = {};
        thisMember.Name = members[ind].name;
        thisMember['Colloquial Name'] = members[ind].colloquial_name;
        thisMember.Email = '';
        if (members[ind].personal_email.length > 0) {
            thisMember.Email = members[ind].personal_email[0].email;
        }
        thisMember['Work Email'] = '';
        if (members[ind].email.length > 0) {
            thisMember['Work Email'] = members[ind].email[0].email;
        }
        thisMember['Pole'] = '';
        for (let indPole in members[ind].pole) {
            let validFrom = members[ind].pole[indPole].valid_from;
            let validUntil = members[ind].pole[indPole].valid_until;
            if ((validFrom === null || time.moment(validFrom).isBefore(today))
                    && (validUntil === null || time.moment(validUntil).isAfter(today))
            ) {
                thisMember['Pole'] = members[ind].pole[indPole].city;
            }
        }
        thisMember.Lab = members[ind].most_recent_data.lab_name;
        for (let indGroup in members[ind].most_recent_data.groups) {
            let validFrom = members[ind].most_recent_data.groups[indGroup].valid_from;
            let validUntil = members[ind].most_recent_data.groups[indGroup].valid_until;
            if ((validFrom === null || time.moment(validFrom).isBefore(today))
                    && (validUntil === null || time.moment(validUntil).isAfter(today))
            ) {
                thisMember.Group = members[ind].most_recent_data.groups[indGroup].name;
                thisMember.Unit = members[ind].most_recent_data.groups[indGroup].units[0].short_name;
                break;
            }
        }
        thisMember.Position = members[ind].most_recent_data.lab_position_name_en;
        thisMember.Dedication = members[ind].most_recent_data.dedication;
        thisMember.From = members[ind].most_recent_data.valid_from;
        thisMember.Until = members[ind].most_recent_data.valid_until;
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
                        + members[ind].history[indHistory].lab_name
                        + ' (' + members[ind].history[indHistory].valid_from
                        + ', ' + members[ind].history[indHistory].valid_until
                        + ')\n';
        }

        if (members[ind].researcher_details.length > 0) {
            thisMember['Association Key'] = members[ind].researcher_details[0].association_key;
            thisMember['Ciência ID'] = members[ind].researcher_details[0].ciencia_id;
            thisMember.ORCID = members[ind].researcher_details[0].ORCID;
        } else {
            thisMember['Association Key'] = '';
            thisMember['Ciência ID'] = '';
            thisMember.ORCID = '';
        }
        thisMember['Degrees'] = ''
        let hasPhD = 'N/A';
        let yearPhD = '';
        let maxDegree = 20;
        for (let indDegree in members[ind].degrees) {
            if (members[ind].degrees[indDegree].degree_id !== null) {
                if (members[ind].degrees[indDegree].degree_id < maxDegree) {
                    maxDegree = members[ind].degrees[indDegree].degree_id;
                }
                if (members[ind].degrees[indDegree].degree_id === 1) {
                    hasPhD = 'Yes';
                } else if (members[ind].degrees[indDegree].degree_id === 2
                            && today.isAfter(time.moment(members[ind].degrees[indDegree].end))) {
                    hasPhD = 'Yes';
                    if (members[ind].degrees[indDegree].end !== null) {
                        yearPhD = time.moment(members[ind].degrees[indDegree].end).year()
                    }
                } else if (members[ind].degrees[indDegree].degree_id === 2) {
                    hasPhD = 'No';
                }
            }

            if (members[ind].degrees[indDegree].start !== null) {
                members[ind].degrees[indDegree].start = time.moment(members[ind].degrees[indDegree].start)
                                                                .format('YYYY-MM-DD')
            }
            if (members[ind].degrees[indDegree].end !== null) {
                members[ind].degrees[indDegree].end = time.moment(members[ind].degrees[indDegree].end)
                                                                .format('YYYY-MM-DD')
            }
            thisMember['Degrees'] = thisMember['Degrees']
                        + members[ind].degrees[indDegree].name_en
                        + ' (' + members[ind].degrees[indDegree].start
                        + ', ' + members[ind].degrees[indDegree].end
                        + ')\n';
        }
        if (maxDegree > 2 && maxDegree !== 20) hasPhD = 'No';
        thisMember['Has PhD'] = hasPhD;
        thisMember['PhD Year'] = yearPhD;
        thisMember['Jobs'] = ''
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
            thisMember['Jobs'] = thisMember['Jobs']
                        + members[ind].jobs[indJob].category_name_en
                        + ', ' + members[ind].jobs[indJob].situation_name_en
                        + ' @ ' + members[ind].jobs[indJob].organization
                        + ' (' + members[ind].jobs[indJob].valid_from
                        + ', ' + members[ind].jobs[indJob].valid_until
                        + ') ' + 'Contracts: ' + contracts
                        + ', Fellowships: ' + fellowships
                        +'\n';
        }

        thisMember['Departments'] = ''
        for (let indDep in members[ind].departments) {
            if (members[ind].departments[indDep].department_start !== null) {
                members[ind].departments[indDep].department_start = time.moment(members[ind].departments[indDep].department_start)
                                                                .format('YYYY-MM-DD')
            }
            if (members[ind].departments[indDep].department_end !== null) {
                members[ind].departments[indDep].department_end = time.moment(members[ind].departments[indDep].department_end)
                                                                .format('YYYY-MM-DD')
            }
            thisMember['Departments'] =  thisMember['Departments']
                        + members[ind].departments[indDep].department
                        + ',' + members[ind].departments[indDep].school_shortname_en
                        + ',' + members[ind].departments[indDep].university_shortname_en
                        + ' (' + members[ind].departments[indDep].department_start
                        + ', ' + members[ind].departments[indDep].department_end
                        + ')'
                        + '\n'
        }
        thisMember['Cost Centers'] = ''
        for (let indCenter in members[ind].cost_center) {
            if (members[ind].cost_center[indCenter].valid_from !== null) {
                members[ind].cost_center[indCenter].valid_from = time.moment(members[ind].cost_center[indCenter].valid_from)
                                                                .format('YYYY-MM-DD')
            }
            if (members[ind].cost_center[indCenter].valid_until !== null) {
                members[ind].cost_center[indCenter].valid_until = time.moment(members[ind].cost_center[indCenter].valid_until)
                                                                .format('YYYY-MM-DD')
            }
            thisMember['Cost Centers'] =  thisMember['Cost Centers']
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

export default {
    components: {
        AddMember,
        MemberDetails,
    },
    props: {
        segmentType: String,
        unitId: Number,
        cityId: Number,
        unitData: Object,
        cityData: Object,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            dialog: false,
            dialogNewMember: false,
            currentPage: 1,
            options: {},
            loading: true,
            totalMembers: 0,
            itemsPerPage: 10,
            search: '',
            searchLab: '',
            searchGroup: '',
            userAction: false, //only to avoid duplicate requests on initial loading
            memberID: undefined,
            memberName: undefined,
            managerID: undefined, // Attention: this is a user ID (not a person ID)
            endpoint: '',
            data: {
                members: [],
            },
            headers: [
                { text: 'ID', value: 'person_id', sortable: false},
                { text: 'Name', value: 'name', sortable: false},
                { text: 'Position', value:'most_recent_data.lab_position_name_en', sortable: false },
                { text: 'Started', value:'most_recent_data.valid_from', sortable: false },
                { text: 'Finished', value:'most_recent_data.valid_until', sortable: false },
                { text: 'Dedication', value:'most_recent_data.dedication', sortable: false },
                { text: 'Ciência ID', value:'researcher_details[0].ciencia_id', sortable: false },
                { text: 'ORCID', value:'researcher_details[0].ORCID', sortable: false },
                { text: 'Details', value: 'action', sortable: false },
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
        }
    },
    mounted () {
        this.initialize(1, '', '', '');
    },
    computed: {
        currentUnitCity () {
            return this.segmentType + '-' + this.unitId + '-' + this.cityId;
        },
    },
    watch: {
        currentUnitCity () {
            this.search = '';
            this.searchLab = '';
            this.searchGroup = '';
            this.initialize(1, '', '', '');
        },
        options () {
            if (this.itemsPerPage !== this.options.itemsPerPage) {
                this.itemsPerPage = this.options.itemsPerPage;
                this.options.page = 1;
            }
            if (this.userAction) {
                this.initialize(this.options.page, this.search, this.searchLab, this.searchGroup);
            }
            this.userAction = true;
        }
    },
    methods: {
        initialize (page, search, searchLab, searchGroup) {
            this.options.page = page;
            this.loading = true;
            let this_session = this.$store.state.session;
            let foundEndpoint = false;
            if (this_session.loggedIn) {
                this.managerID = this_session.userID;
                for (let ind in this_session.permissionsEndpoints) {
                    let decomposedPath = this_session.permissionsEndpoints[ind].decomposedPath;
                    if ( this.segmentType === 'unit'
                            && decomposedPath.length === 4
                            && decomposedPath[0] === 'managers'
                            && parseInt(decomposedPath[1], 10) === this_session.userID
                            && decomposedPath[2] === 'units'
                            && parseInt(decomposedPath[3], 10) === this.unitId
                            && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        foundEndpoint = true;
                        let urlSubmit;
                        this.endpoint = this_session.permissionsEndpoints[ind].endpoint_url;
                        if ((search !== undefined && search !== '')
                            || (searchLab !== undefined && searchLab !== '')
                            || (searchGroup !== undefined && searchGroup !== '')
                        ) {
                            urlSubmit = 'api' + this.endpoint
                                + '/current-members'
                                + '?limit=' + this.itemsPerPage
                                + '&offset=' + (page - 1) * this.itemsPerPage
                                + '&q=' + search
                                + '&lab=' + searchLab
                                + '&group=' + searchGroup
                                ;
                        } else {
                            urlSubmit = 'api' + this.endpoint
                                + '/current-members'
                                + '?limit=' + this.itemsPerPage
                                + '&offset=' + (page - 1) * this.itemsPerPage;
                        }
                        subUtil.getInfoPopulate(this, urlSubmit, true, true)
                        .then( (result) => {
                            this.totalMembers = result.count;
                            this.data.members = processResults(this, result.result);
                            this.loading = false;
                        });
                    } else if ( this.segmentType === 'unit-city'
                            && decomposedPath.length === 6
                            && decomposedPath[0] === 'managers'
                            && parseInt(decomposedPath[1], 10) === this_session.userID
                            && decomposedPath[2] === 'units'
                            && parseInt(decomposedPath[3], 10) === this.unitId
                            && decomposedPath[4] === 'cities'
                            && parseInt(decomposedPath[5], 10) === this.unitId
                            && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        foundEndpoint = true;
                        let urlSubmit;
                        this.endpoint = this_session.permissionsEndpoints[ind].endpoint_url;
                        if ((search !== undefined && search !== '')
                            || (searchLab !== undefined && searchLab !== '')
                            || (searchGroup !== undefined && searchGroup !== '')
                        ) {
                            urlSubmit = 'api' + this.endpoint
                                + '/current-members'
                                + '?limit=' + this.itemsPerPage
                                + '&offset=' + (page - 1) * this.itemsPerPage
                                + '&q=' + search
                                + '&lab=' + searchLab
                                + '&group=' + searchGroup
                                ;
                        } else {
                            urlSubmit = 'api' + this.endpoint
                                + '/current-members'
                                + '?limit=' + this.itemsPerPage
                                + '&offset=' + (page - 1) * this.itemsPerPage;
                        }
                        subUtil.getInfoPopulate(this, urlSubmit, true, true)
                        .then( (result) => {
                            this.totalMembers = result.count;
                            this.data.members = processResults(this, result.result);
                            this.loading = false;
                        });
                    } else if ( this.segmentType === 'city'
                            && decomposedPath.length === 4
                            && decomposedPath[0] === 'managers'
                            && parseInt(decomposedPath[1], 10) === this_session.userID
                            && decomposedPath[2] === 'cities'
                            && parseInt(decomposedPath[3], 10) === this.cityId
                            && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        foundEndpoint = true;
                        let urlSubmit;
                        this.endpoint = this_session.permissionsEndpoints[ind].endpoint_url;
                        if ((search !== undefined && search !== '')
                            || (searchLab !== undefined && searchLab !== '')
                            || (searchGroup !== undefined && searchGroup !== '')
                        ) {
                            urlSubmit = 'api' + this.endpoint
                                + '/current-members'
                                + '?limit=' + this.itemsPerPage
                                + '&offset=' + (page - 1) * this.itemsPerPage
                                + '&q=' + search
                                + '&lab=' + searchLab
                                + '&group=' + searchGroup
                                ;
                        } else {
                            urlSubmit = 'api' + this.endpoint
                                + '/current-members'
                                + '?limit=' + this.itemsPerPage
                                + '&offset=' + (page - 1) * this.itemsPerPage;
                        }
                        subUtil.getInfoPopulate(this, urlSubmit, true, true)
                        .then( (result) => {
                            this.totalMembers = result.count;
                            this.data.members = processResults(this, result.result);
                            this.loading = false;
                        });
                    }
                }
                if (!foundEndpoint) {
                    this.data.members = [];
                }
            }
        },
        filterData: debounce(function () {
            this.initialize(1, this.search, this.searchLab, this.searchGroup);
        }, 200),
        editItem (item) {
            this.dialog = true;
            this.memberID = item.person_id;
            this.memberName = item.name;
        },
        generateSpreadsheet() {
            this.progress = true;
            let today = time.moment();
            let dateFile = time.momentToDate(today, 'Europe/Lisbon', 'YYYY-MM-DDTHHmmss');
            let urlSubmit;
            if ((this.search !== undefined && this.search !== '')
                || (this.searchLab !== undefined && this.searchLab !== '')
                || (this.searchGroup !== undefined && this.searchGroup !== '')
            ) {
                 urlSubmit = 'api' + this.endpoint
                        + '/current-members'
                        + '?q=' + this.search
                        + '&lab=' + this.searchLab
                        + '&group=' + this.searchGroup
                        + '&details=' + 1;
            } else {
                urlSubmit = 'api' + this.endpoint
                    + '/current-members'
                    + '?details=' + 1;
            }
            this.$http.get(urlSubmit,
                { headers: {'Authorization': 'Bearer ' + localStorage['v2-token'] } },
            )
            .then((result) => {
                this.progress = false;
                this.success = true;
                let items = result.data.result;
                items = processResults (this, items);
                let itemsCurated = processForSpreadsheet(items);
                let wb = XLSX.utils.book_new();
                let ws  = XLSX.utils.json_to_sheet(itemsCurated);
                XLSX.utils.book_append_sheet(wb, ws, 'Data');
                let filename = 'members_'
                if (this.unitId !== null && this.unitId !== undefined) {
                    filename = filename + 'unit_' + this.unitId;
                }
                if (this.cityId !== null && this.cityId !== undefined) {
                    filename = filename + '_city_' + this.cityId;
                }
                XLSX.writeFile(wb, filename + '_' + dateFile + '.xlsx');
                setTimeout(() => {this.success = false;}, 1500)
            })
            .catch((error) => {
                this.progress = false;
                this.success = false;
                this.error = true;
                setTimeout(() => {this.error = false;}, 6000)
                // eslint-disable-next-line
                console.log(error)
            })

        },
    },

}



</script>

<style scoped>

</style>