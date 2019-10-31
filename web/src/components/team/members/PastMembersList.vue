<template>
    <v-card>
        <v-card-title primary-title>
            <div>
                <h3 class="headline">Past members and positions</h3>
            </div>
        </v-card-title>
        <v-card-text>
        </v-card-text>
        <v-container>

            <!-- {{data.members[0]}} -->
            <!-- {{ labPositions }} -->
            <!-- {{data.pages[pagination.page - 1][0]}} -->
            <v-row justify="center" align="center">
                <v-col cols="12">
                    <v-pagination
                        v-model="pagination.page"
                        :length="pagination.length"
                        :total-visible="pagination.totalVisible"
                    >
                    </v-pagination>
                </v-col>
                <v-col cols="4" sm="2" md="1">
                    <v-text-field
                        v-model="pagination.pageSize"
                        @input="initialize()"
                        label="Items/page">
                    </v-text-field>
                </v-col>
            </v-row>
            <div class="pl-6 pr-12 list-header" v-if="$vuetify.breakpoint.smAndUp">
                <v-row>
                    <v-col cols="12" sm="4">Name</v-col>
                    <v-col cols="12" sm="2">Position</v-col>
                    <v-col cols="12" sm="2">Dedication (%)</v-col>
                    <v-col cols="12" sm="2">Association Key</v-col>
                    <v-col cols="12" sm="2">ORCID</v-col>
                </v-row>
            </div>
            <v-expansion-panels class="members-list">
                <v-expansion-panel
                    v-for="(member,i) in data.pages[pagination.page - 1]"
                    :key="pagination.page.toString() + '-' + i">
                    <v-expansion-panel-header>
                        <v-row>
                            <v-col cols="12" sm="4">
                                <span v-if="$vuetify.breakpoint.xsOnly">Name: </span>{{member.name}}
                            </v-col>
                            <v-col cols="12" sm="2">
                                <span v-if="$vuetify.breakpoint.xsOnly">Position: </span>
                                {{member.most_recent_data.lab_position_name_en}}
                            </v-col>
                            <v-col cols="12" sm="2">
                                <span v-if="$vuetify.breakpoint.xsOnly">Dedication (%): </span>
                                {{member.most_recent_data.dedication}}
                            </v-col>
                            <v-col cols="12" sm="2">
                                <span v-if="$vuetify.breakpoint.xsOnly">Association Key: </span>
                                {{member.researcher_details[0].association_key}}
                            </v-col>
                            <v-col cols="12" sm="2">
                                <span v-if="$vuetify.breakpoint.xsOnly">ORCID: </span>
                                {{member.researcher_details[0].ORCID}}
                            </v-col>
                        </v-row>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-divider></v-divider>
                        <v-form :ref="'memberForm-' + member.person_id.toString()"
                            @submit.prevent="submitForm(member)">
                            <v-row v-for="(pos,j) in member.past_history"
                                    :key="pagination.page.toString() + '-' + i + '-' + j"
                                    align="center" justify="center">
                                <v-col cols="12" sm="3">
                                    <b>Edit position data:</b>
                                    <v-btn v-if="!pos.to_delete"
                                            @click="deleteCurrent(member, pos)"
                                            small color="red"
                                            class="ml-2 white--text">
                                        Delete this
                                    </v-btn>
                                    <v-btn v-if="pos.to_delete"
                                            @click="undeleteCurrent(member, pos)"
                                            small color="red"
                                            class="ml-2 white--text">
                                        Undelete this
                                    </v-btn>
                                </v-col>
                                <v-col cols="12" sm="3">
                                    <v-select v-model="pos.lab_position_id"
                                        :items="labPositions" item-value="id" item-text="name_en"
                                        :disabled="pos.to_delete"
                                        label="Position"
                                    ></v-select>
                                </v-col>
                                <v-col cols="12" sm="2">
                                    <v-text-field v-model="pos.dedication"
                                        :disabled="pos.to_delete"
                                        label="Dedication (%)"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="2">
                                    <v-menu ref="pos.show_valid_from"
                                        v-model="pos.show_valid_from"
                                        :close-on-content-click="false"
                                        :nudge-right="10"
                                        transition="scale-transition"
                                        offset-y min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="pos.valid_from"
                                                :disabled="pos.to_delete"
                                                label="Started" v-on="on">
                                            </v-text-field>
                                        </template>
                                        <v-date-picker v-model="pos.valid_from"
                                                @input="pos.show_valid_from = false"
                                                no-title></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="12" sm="2">
                                    <v-menu ref="pos.show_valid_until" v-model="pos.show_valid_until"
                                        :close-on-content-click="false"
                                        :nudge-right="10"
                                        transition="scale-transition"
                                        offset-y min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="pos.valid_until"
                                                :disabled="pos.to_delete"
                                                label="Ended" v-on="on">
                                            </v-text-field>
                                        </template>
                                        <v-date-picker v-model="pos.valid_until"
                                                @input="pos.show_valid_until = false"
                                                no-title></v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>
                            <v-row align="center">
                                <v-col cols="12" sm="3">
                                    <div v-if="member.show_add_more_recent">
                                        <v-btn @click="member.show_add_more_recent = false"
                                                small outlined color="red">
                                            Add other position
                                        </v-btn>
                                    </div>
                                    <div v-if="!member.show_add_more_recent">
                                        <b>Insert data:</b>
                                        <v-btn @click="discardNewer(member)"
                                                small outlined color="red"
                                                class="ml-2">
                                            Discard this
                                        </v-btn>
                                    </div>
                                </v-col>
                                <v-col cols="12" sm="3" v-if="!member.show_add_more_recent">
                                    <v-select v-model="member.newer_data.lab_position_id"
                                        :items="labPositions"
                                        item-value="id" item-text="name_en"
                                        label="Position"
                                    ></v-select>
                                </v-col>
                                <v-col cols="12" sm="2" v-if="!member.show_add_more_recent">
                                    <v-text-field v-model="member.newer_data.dedication"
                                        label="Dedication (%)"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="2" v-if="!member.show_add_more_recent">
                                    <v-menu ref="member.newer_data.show_valid_from" v-model="member.newer_data.show_valid_from"
                                        :close-on-content-click="false"
                                        :nudge-right="10"
                                        transition="scale-transition"
                                        offset-y min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="member.newer_data.valid_from"
                                                label="Started" v-on="on">
                                            </v-text-field>
                                        </template>
                                        <v-date-picker v-model="member.newer_data.valid_from"
                                                @input="member.newer_data.show_valid_from = false"
                                                no-title></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="12" sm="2" v-if="!member.show_add_more_recent">
                                    <v-menu ref="member.newer_data.show_valid_until" v-model="member.newer_data.show_valid_until"
                                        :close-on-content-click="false"
                                        :nudge-right="10"
                                        transition="scale-transition"
                                        offset-y min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="member.newer_data.valid_until"
                                                label="Ended" v-on="on">
                                            </v-text-field>
                                        </template>
                                        <v-date-picker v-model="member.newer_data.valid_until"
                                                @input="member.newer_data.show_valid_until = false"
                                                no-title></v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>
                            <v-row justify="center">
                                <v-btn type="submit" outlined color="blue">Save</v-btn>
                                <div class="request-status-container">
                                    <v-progress-circular indeterminate
                                            v-show="member.progress"
                                            :size="20" :width="2"
                                            color="primary"></v-progress-circular>
                                    <v-icon v-show="member.success" color="green">mdi-check</v-icon>
                                    <v-icon v-show="member.error" color="red">mdi-alert-circle-outline</v-icon>
                                </div>
                            </v-row>
                        </v-form>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
            <v-row justify="center" align="center" class="mt-4">
                <v-col cols="12">
                    <v-pagination
                        v-model="pagination.page"
                        :length="pagination.length"
                        :total-visible="pagination.totalVisible"
                    >
                    </v-pagination>
                </v-col>
                <v-col cols="4" sm="2" md="1">
                    <v-text-field
                        v-model="pagination.pageSize"
                        @input="initialize()"
                        label="Items/page">
                    </v-text-field>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
</template>

<script>
import time from '../../common/date-utils'
import subUtil from '../../common/submit-utils'
import {orderBy} from 'lodash'

function processResults(vm, result) {
    let pastMembers = [];
    let today = time.moment();
    for (let ind in result) {
        let currentMember = false;
        let pastHistory = [];
        let mostRecentStartDate;
        let mostRecentData = {}; // the most recent data from past events
        result[ind].most_recent_data = {};
        for (let indHistory in result[ind].history) {
            result[ind].history[indHistory].valid_from = time.momentToDate(result[ind].history[indHistory].valid_from);
            result[ind].history[indHistory].valid_until = time.momentToDate(result[ind].history[indHistory].valid_until);
            result[ind].history[indHistory].show_valid_from = false;
            result[ind].history[indHistory].show_valid_until = false;
            result[ind].history[indHistory].to_delete = false;
            let validFrom = result[ind].history[indHistory].valid_from;
            let validUntil = result[ind].history[indHistory].valid_until;

            if ((validFrom === null || time.moment(validFrom).isBefore(today))
                && (validUntil === null || time.moment(validUntil).isAfter(today))
                ) {
                currentMember = true;
                result[ind].current_member = currentMember;
            } else {
                if (mostRecentStartDate === undefined) {
                    mostRecentStartDate = validFrom;
                    mostRecentData = result[ind].history[indHistory];
                }
                if (validFrom !== null && mostRecentStartDate !== null
                        && time.moment(validFrom).isAfter(time.moment(mostRecentStartDate))) {
                    mostRecentStartDate = validFrom;
                    mostRecentData = result[ind].history[indHistory];
                } else if (validFrom !== null && mostRecentStartDate === null) {
                    mostRecentStartDate = validFrom;
                    mostRecentData = result[ind].history[indHistory];
                }
                pastHistory.push(result[ind].history[indHistory]);
            }
        }
        if (!currentMember) {
            result[ind].current_member = false;
            if (result[ind].history.length === 1) {
                result[ind].most_recent_data = result[ind].history[0];
            } else {
                result[ind].most_recent_data = mostRecentData;
            }

        } else {
            if (pastHistory.length > 0) {
                result[ind].most_recent_data = mostRecentData;
            }
        }
        if (pastHistory.length > 0) {
            result[ind].progress = false;
            result[ind].success = undefined;
            result[ind].error = undefined;
            result[ind].past_history = pastHistory;
            result[ind].show_add_more_recent = true;
            result[ind].newer_data = {};
            pastMembers.push(result[ind]);
        }
    }
    return pastMembers;
}

function paginate(items, pageSize, orderArray) {
    let pages = [];
    let funcOrderArray = [];
    let directionArray = [];
    for (let indCategory in orderArray) {
        // TODO: line below to be improved
        directionArray.push('asc');

        if (orderArray[indCategory] === 'position') {
            funcOrderArray.push(
                function (el) {
                    return el.most_recent_data.lab_position_sort_order;
                }
            )
        } else if (orderArray[indCategory] === 'name') {
            funcOrderArray.push(
                function (el) {
                    return el.name;
                }
            )
        }
    }
    items = orderBy(items, funcOrderArray, directionArray);
    let currentPage = [];
    for (let ind in items) {
        currentPage.push(items[ind]);
        if (currentPage.length === pageSize || parseInt(ind, 10) === items.length - 1) {
            pages.push(currentPage);
            currentPage = [];
        }
    }
    return pages;
}

export default {
    props: {
        labId: Number,
        labData: Object,
        labPositions: Array,
    },
    data() {
        return {
            pagination: {
                page: 1,
                pageSize: 10,
                totalVisible: 7,
                length: 1,
            },
            progress: false,
            success: false,
            error: false,
            formError: false,
            date_menu: false,
            data: {
                members: [],
                pages: [],
            },
        }
    },
    mounted () {
        this.initialize();
    },
    computed: {
    },
    watch: {
        labId () {
            this.initialize();
        }
    },
    methods: {
        initialize () {
            let this_session = this.$store.state.session;
            let foundEndpoint = false;
            if (this_session.loggedIn) {
                for (let ind in this_session.permissionsEndpoints) {
                    if (this_session.permissionsEndpoints[ind].resource1_type_name === 'labs'
                        && this_session.permissionsEndpoints[ind].resource1_id === this.labId
                        && this_session.permissionsEndpoints[ind].resource2_type_name === 'members-affiliation'
                        && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        foundEndpoint = true;
                        let urlSubmit = 'api' + this_session.permissionsEndpoints[ind].endpoint_url;
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            this.pagination.page = 1;
                            let pastMembers = processResults(this, result);
                            let pageSize = parseInt(this.pagination.pageSize, 10);
                            let pages = paginate(pastMembers, pageSize, ['position', 'name']);
                            this.data.members = pastMembers;
                            this.pagination.length = pages.length;
                            this.data.pages = pages;
                        });
                    }
                }
                if (!foundEndpoint) {
                    this.data.members = [];
                }
            }
        },
        deleteCurrent (member, pos) {
            alert('Warning: Deletion will only occur after pressing the "Save" button for this member.')
            pos.to_delete = true;
        },
        undeleteCurrent (member, pos) {
            pos.to_delete = false;
        },
        discardNewer (member) {
            member.newer_data = {};
            member.show_add_more_recent = true;
        },
        submitForm (member) {
            let this_session = this.$store.state.session;
            if (this_session.loggedIn) {
                member.progress = true;
                let requests = [];
                let memberID = member.person_id;
                let reqCreate = '/labs/' + this.labId
                                + '/members-affiliation/' + memberID
                                + '/position';
                let urlCreate = 'api' + reqCreate;
                for (let ind in this_session.permissionsEndpoints) {
                    if (subUtil.checkPermissions(reqCreate, 'POST',
                            this_session.permissionsEndpoints[ind].endpoint_url,
                            this_session.permissionsEndpoints[ind].method_name)
                        && Object.keys(member.newer_data).length > 0) {
                        member.newer_data.changed_by = this_session.personID;
                        requests.push(this.$http.post(urlCreate,
                            {
                                data: member.newer_data
                            },
                            {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                            }
                        ));
                        break;
                    }
                }
                for (let ind in member.past_history) {
                    let pos = member.past_history[ind];
                    pos.changed_by = this_session.personID;
                    //console.log(pos)
                    let reqUpdate = '/labs/' + this.labId
                                + '/members-affiliation/' + memberID
                                + '/position/' + pos.id;
                    let urlUpdate = 'api' + reqUpdate;
                    let reqDelete = '/labs/' + this.labId
                                + '/members-affiliation/' + memberID
                                + '/position/' + pos.id;
                    let urlDelete = 'api' + reqDelete;
                    for (let ind in this_session.permissionsEndpoints) {
                        // TODO: It makes sense to add newer data only if previous is closed
                        if (subUtil.checkPermissions(reqUpdate, 'PUT',
                                    this_session.permissionsEndpoints[ind].endpoint_url,
                                    this_session.permissionsEndpoints[ind].method_name)
                            && !pos.to_delete ) {
                            requests.push(this.$http.put(urlUpdate,
                                {
                                    data: pos
                                },
                                {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                            ));
                        }
                        if (subUtil.checkPermissions(reqDelete, 'DELETE',
                                    this_session.permissionsEndpoints[ind].endpoint_url,
                                    this_session.permissionsEndpoints[ind].method_name)
                            && pos.to_delete) {
                            requests.push(this.$http.delete(urlDelete,
                                {
                                    headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                    data: { data: pos },
                                }
                            ));
                        }
                    }
                    this.$http.all(requests)
                        .then(this.$http.spread( () => {
                            member.progress = false;
                            member.success = true;
                            setTimeout(() => {member.success = false;}, 1500)
                            this.initialize();
                        }))
                        .catch((error) => {
                            member.progress = false;
                            member.error = true;
                            this.initialize();
                            setTimeout(() => {member.error = false;}, 6000)
                            // eslint-disable-next-line
                            console.log(error)
                        })
                }
                /*

                */
            }
        }
    }
}
</script>

<style>

.list-header,
.members-list span {
    font-weight: 600;
}


</style>