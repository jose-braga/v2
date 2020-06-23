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
            <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
                class="px-2 mb-4"
            ></v-text-field>
            <v-data-table
                item-key="person_id"
                :search="search"
                :headers="headers"
                :footer-props="footerProps"
                :items="data.members"
                :items-per-page="10"
                :custom-sort="customSort"
                :sort-by="['most_recent_data.lab_position_name_en', 'name']"
                :sort-desc="[false, false]"
                multi-sort
                class="elevation-1"
            >
                <template v-slot:top>
                    <v-dialog v-model="dialog" max-width="1600px">
                        <v-card>
                            <v-form @submit.prevent="submitForm(editedItem)">
                                <v-card-title>
                                    <span class="headline">{{ editedItem.name }}</span>
                                </v-card-title>
                                <v-card-text>
                                    <v-container>
                                        <v-row v-for="(pos,j) in editedItem.past_history"
                                                :key="j"
                                                align="center" justify="center">
                                            <v-col cols="12" sm="3">
                                                <b>Edit position data:</b>
                                                <v-btn v-if="!pos.to_delete"
                                                        @click="deleteCurrent(editedItem, pos)"
                                                        small color="red"
                                                        class="ml-2 white--text">
                                                    Delete this
                                                </v-btn>
                                                <v-btn v-if="pos.to_delete"
                                                        @click="undeleteCurrent(editedItem, pos)"
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
                                                <v-menu ref="pos.show_valid_until"
                                                    v-model="pos.show_valid_until"
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
                                                <div v-if="editedItem.show_add_more_recent">
                                                    <v-btn @click="editedItem.show_add_more_recent = false"
                                                            small outlined color="red">
                                                        Add newer position
                                                    </v-btn>
                                                </div>
                                                <div v-if="!editedItem.show_add_more_recent">
                                                    <b>Insert newer data:</b>
                                                    <v-btn @click="discardNewer(editedItem)"
                                                            small outlined color="red"
                                                            class="ml-2">
                                                        Discard this
                                                    </v-btn>
                                                    <div class="small-text">
                                                        Please add end date to previous position
                                                    </div>
                                                </div>
                                            </v-col>
                                            <v-col cols="12" sm="3" v-if="!editedItem.show_add_more_recent">
                                                <v-select v-model="editedItem.newer_data.lab_position_id"
                                                    :items="labPositions"
                                                    item-value="id" item-text="name_en"
                                                    label="Position"
                                                ></v-select>
                                            </v-col>
                                            <v-col cols="12" sm="2" v-if="!editedItem.show_add_more_recent">
                                                <v-text-field v-model="editedItem.newer_data.dedication"
                                                    label="Dedication (%)"
                                                ></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="2" v-if="!editedItem.show_add_more_recent">
                                                <v-menu ref="editedItem.newer_data.show_valid_from" v-model="editedItem.newer_data.show_valid_from"
                                                    :close-on-content-click="false"
                                                    :nudge-right="10"
                                                    transition="scale-transition"
                                                    offset-y min-width="290px">
                                                    <template v-slot:activator="{ on }">
                                                        <v-text-field v-model="editedItem.newer_data.valid_from"
                                                            label="Started" v-on="on">
                                                        </v-text-field>
                                                    </template>
                                                    <v-date-picker v-model="editedItem.newer_data.valid_from"
                                                            @input="editedItem.newer_data.show_valid_from = false"
                                                            no-title></v-date-picker>
                                                </v-menu>
                                            </v-col>
                                            <v-col cols="12" sm="2" v-if="!editedItem.show_add_more_recent">
                                                <v-menu ref="editedItem.newer_data.show_valid_until" v-model="editedItem.newer_data.show_valid_until"
                                                    :close-on-content-click="false"
                                                    :nudge-right="10"
                                                    transition="scale-transition"
                                                    offset-y min-width="290px">
                                                    <template v-slot:activator="{ on }">
                                                        <v-text-field v-model="editedItem.newer_data.valid_until"
                                                            label="Ended" v-on="on">
                                                        </v-text-field>
                                                    </template>
                                                    <v-date-picker v-model="editedItem.newer_data.valid_until"
                                                            @input="editedItem.newer_data.show_valid_until = false"
                                                            no-title></v-date-picker>
                                                </v-menu>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </v-card-text>
                                <v-card-actions>
                                    <v-container>
                                        <v-row justify="center" align="center">
                                            <v-col cols="11" sm="2">
                                                <v-row justify="end">
                                                    <v-btn type="submit"
                                                            outlined
                                                            color="blue"
                                                            class="mr-2">Save</v-btn>
                                                </v-row>
                                            </v-col>
                                            <v-col cols="1" sm="2">
                                                <v-progress-circular indeterminate
                                                        v-show="editedItem.progress"
                                                        :size="20" :width="2"
                                                        color="primary"></v-progress-circular>
                                                <v-icon v-show="editedItem.success" color="green">mdi-check</v-icon>
                                                <v-icon v-show="editedItem.error" color="red">mdi-alert-circle-outline</v-icon>
                                            </v-col>

                                    </v-row>
                                    </v-container>
                                </v-card-actions>
                            </v-form>
                        </v-card>
                    </v-dialog>
                </template>
                <template v-slot:item.action="{ item }">
                    <v-icon @click="editItem(item)">mdi-pencil</v-icon>
                </template>
            </v-data-table>
            <v-row justify="center" align="center" class="mt-4">
                <v-col cols="12" align="center">
                    <v-row justify="center" align="center">
                        <span class="mr-4">Export to spreadsheet</span>
                        <v-btn fab color="green" @click="generateSpreadsheet(data.members, labData)">
                            <v-icon color="white" x-large>mdi-file-excel</v-icon>
                        </v-btn>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
</template>

<script>
import time from '@/components/common/date-utils'
import subUtil from '@/components/common/submit-utils'
import {orderBy} from 'lodash'
import XLSX from 'xlsx'

function processResults(vm, result) {
    // TODO: order past_history chronologically
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

function processForSpreadsheet(members) {
    let membersCurated = [];
    for (let ind in members) {
        for (let indHist in members[ind].past_history) {
            let thisMember = {};
            thisMember.name = members[ind].name;
            thisMember.colloquial_name = members[ind].colloquial_name;
            thisMember.position = members[ind].past_history[indHist].lab_position_name_en;
            thisMember.valid_from = members[ind].past_history[indHist].valid_from;
            thisMember.valid_until = members[ind].past_history[indHist].valid_until;
            thisMember.valid_from = members[ind].past_history[indHist].valid_from;
            thisMember.association_key = members[ind].researcher_details[0].association_key;
            thisMember.ORCID = members[ind].researcher_details[0].ORCID;

            membersCurated.push(thisMember);
        }
    }
    return membersCurated;
}

export default {
    props: {
        labId: Number,
        labData: Object,
        labPositions: Array,
        myLabs: Array,
    },
    data() {
        return {
            dialog: false,
            editedIndex: -1,
            editedItem: {
                most_recent_data: {},
                newer_data: {},
                past_history: [],
            },
            search: '',
            headers: [
                { text: 'Name', value:'name' },
                { text: 'Position', value:'most_recent_data.lab_position_name_en' },
                { text: 'Dedication', value:'most_recent_data.dedication' },
                { text: 'Association Key', value:'researcher_details[0].association_key', sortable: false },
                { text: 'ORCID', value:'researcher_details[0].ORCID', sortable: false },
                { text: 'Actions', value: 'action', sortable: false },
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                members: [],
                pages: [],
            },
        }
    },
    mounted () {
        this.initialize();

        this.$root.$on('updatePastTeamMembers', () => {
            // your code goes here
            this.initialize();
        });
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
                    let decomposedPath = this_session.permissionsEndpoints[ind].decomposedPath;
                    if (decomposedPath[0] === 'labs'
                        && parseInt(decomposedPath[1], 10) === this.labId
                        && decomposedPath[2] === 'members-affiliation'
                        && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        foundEndpoint = true;
                        let urlSubmit = 'api' + this_session.permissionsEndpoints[ind].endpoint_url;
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            let pastMembers = processResults(this, result);
                            this.data.members = pastMembers;
                        });
                    }
                }
                if (!foundEndpoint) {
                    this.data.members = [];
                }
            }
        },
        editItem (member) {
            this.dialog = true;
            this.editedIndex = this.data.members.indexOf(member);
            this.editedItem = Object.assign({}, member);
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
                        member.newer_data.changed_by = this_session.userID;
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
                    pos.changed_by = this_session.userID;
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
                            this.$root.$emit('updateCurrentTeamMembers')
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
            }
        },
        generateSpreadsheet(members, labData) {
            let today = time.moment();
            let dateFile = time.momentToDate(today, 'Europe/Lisbon', 'YYYY-MM-DDTHHmmSS')
            let membersCurated = processForSpreadsheet(members);

            let wb = XLSX.utils.book_new();
            let ws  = XLSX.utils.json_to_sheet(membersCurated);
            XLSX.utils.book_append_sheet(wb, ws, 'Past Members or Positions');
            let filename = labData.name.replace(/[^a-z0-9]/gi, '_')
            XLSX.writeFile(wb, filename + '_past-team-members_' + dateFile + '.xlsx');
        },
        customSort (items, sortBy, sortDesc) {
            let funcOrderArray = [];
            let directionArray = [];
            for (let ind in sortBy) {
                if (sortDesc[ind] === false) {
                    directionArray.push('asc');
                } else {
                    directionArray.push('desc');
                }
                // special cases when a column is sorted based on a different 'hidden' value
                if (sortBy[ind] === 'most_recent_data.lab_position_name_en') {
                    funcOrderArray.push(
                        function (el) {
                            return el.most_recent_data.lab_position_sort_order;
                        }
                    )
                } else {
                    funcOrderArray.push(
                        function (el) {
                            let levels = sortBy[ind].split('.');
                            let thisLevel = el;
                            for (let indLevel in levels) {
                                thisLevel = thisLevel[levels[indLevel]];
                                if (thisLevel === undefined) {
                                    break;
                                }
                            }
                            return thisLevel;
                        }
                    )
                }
            }
            items = orderBy(items, funcOrderArray, directionArray);

            return items
        },
    }
}
</script>

<style scoped>
</style>