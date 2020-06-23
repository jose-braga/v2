<template>
    <v-card>
        <v-card-title primary-title>
            <div>
                <h3 class="headline">Current members and positions</h3>
            </div>
        </v-card-title>
        <v-card-text></v-card-text>
        <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
            @input="filterPeople"
            class="px-2 mb-4"
        ></v-text-field>
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
        </v-container>
    </v-card>
</template>

<script>

import time from '@/components/common/date-utils'
import subUtil from '@/components/common/submit-utils'
import MemberDetails from '../member_details/MemberDetails'
import {debounce} from 'lodash'

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

export default {
    components: {
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
            dialog: false,
            currentPage: 1,
            options: {},
            loading: true,
            totalMembers: 0,
            itemsPerPage: 10,
            search: '',
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
                { text: 'Association Key', value:'researcher_details[0].association_key', sortable: false },
                { text: 'ORCID', value:'researcher_details[0].ORCID', sortable: false },
                { text: 'Details', value: 'action', sortable: false },
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
        }
    },
    mounted () {
        this.initialize(1, '');
    },
    computed: {
        currentUnitCity () {
            return this.segmentType + '-' + this.unitId + '-' + this.cityId;
        },
    },
    watch: {
        currentUnitCity () {
            this.search = '';
            this.initialize(1, '');
        },
        options () {
            if (this.itemsPerPage !== this.options.itemsPerPage) {
                this.itemsPerPage = this.options.itemsPerPage;
                this.options.page = 1;
            }
            if (this.userAction) {
                this.initialize(this.options.page, this.search);
            }
            this.userAction = true;
        }
    },
    methods: {
        initialize (page, search) {
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
                        if (search !== undefined && search !== '') {
                            urlSubmit = 'api' + this.endpoint
                                + '/current-members'
                                + '?limit=' + this.itemsPerPage
                                + '&offset=' + (page - 1) * this.itemsPerPage
                                + '&q=' + search;
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
        filterPeople: debounce(function () {
            this.initialize(1, this.search);
        }, 200),
        editItem (item) {
            this.dialog = true;
            this.memberID = item.person_id;
            this.memberName = item.name;
        }
    },

}



</script>

<style scoped>

</style>