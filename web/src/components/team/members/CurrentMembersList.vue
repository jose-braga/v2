<template>
    <v-card>
        <v-card-title primary-title>
            <div>
                <h3 class="headline">Current members and positions</h3>
            </div>
        </v-card-title>
        <v-card-text>
            <span v-if="currentGroup">Currently this team  is part of the group <b>{{currentGroup.name}}@{{currentGroup.unit.short_name}}</b>.</span>
            <p v-if="pastGroups"> Previously the team was part of the:
                <ul>
                    <li v-for="group in pastGroups" :key="group.id">
                        {{group.name}} group@{{group.units_history[0].short_name}}
                         (until {{group.valid_until | formatDate}})</li>
                </ul>
            </p>
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
                            <!--
                            {{editedItem.most_recent_data.show_add_more_recent}}
                            {{$v.editedItem.most_recent_data.valid_until}}
                            {{$v.$invalid}}
                            -->
                            <v-form @submit.prevent="submitForm(editedItem)">
                                <v-card-title>
                                    <span class="headline">{{ editedItem.name }}</span>
                                </v-card-title>
                                <v-card-text>
                                    <v-container>
                                        <v-row align="center" justify="center">
                                            <v-col cols="12" sm="3">
                                                <b>Edit current position data:</b>
                                                <v-btn v-if="!editedItem.most_recent_data.to_delete"
                                                        @click="deleteCurrent(editedItem)"
                                                        small color="red"
                                                        class="ml-2 white--text">
                                                    Delete this
                                                </v-btn>
                                                <v-btn v-if="editedItem.most_recent_data.to_delete"
                                                        @click="undeleteCurrent(editedItem)"
                                                        small color="red"
                                                        class="ml-2 white--text">
                                                    Undelete this
                                                </v-btn>
                                            </v-col>
                                            <v-col cols="12" sm="3"
                                                v-if="depTeamId !== undefined"
                                            >
                                                <v-select v-model="editedItem.most_recent_data.lab_id"
                                                    :items="labs" item-value="id" item-text="name"
                                                    disabled
                                                    label="Lab/Group"
                                                ></v-select>
                                            </v-col>
                                            <v-col cols="12" sm="3">
                                                <v-select v-model="editedItem.most_recent_data.lab_position_id"
                                                    :items="labPositions" item-value="id" item-text="name_en"
                                                    :disabled="editedItem.most_recent_data.to_delete"
                                                    label="Position"
                                                ></v-select>
                                            </v-col>
                                            <v-col cols="12" sm="2">
                                                <v-text-field v-model="editedItem.most_recent_data.dedication"
                                                    :disabled="editedItem.most_recent_data.to_delete"
                                                    label="Dedication (%)"
                                                ></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="2">
                                                <v-menu ref="editedItem.most_recent_data.show_valid_from"
                                                    v-model="editedItem.most_recent_data.show_valid_from"
                                                    :close-on-content-click="false"
                                                    :nudge-right="10"
                                                    transition="scale-transition"
                                                    offset-y min-width="290px">
                                                    <template v-slot:activator="{ on }">
                                                        <v-text-field v-model="editedItem.most_recent_data.valid_from"
                                                            :disabled="editedItem.most_recent_data.to_delete"
                                                            label="Started" v-on="on">
                                                        </v-text-field>
                                                    </template>
                                                    <v-date-picker v-model="editedItem.most_recent_data.valid_from"
                                                            @input="editedItem.most_recent_data.show_valid_from = false"
                                                            no-title></v-date-picker>
                                                </v-menu>
                                            </v-col>
                                            <v-col cols="12" sm="2">
                                                <v-menu ref="editedItem.most_recent_data.show_valid_until" v-model="editedItem.most_recent_data.show_valid_until"
                                                    :close-on-content-click="false"
                                                    :nudge-right="10"
                                                    transition="scale-transition"
                                                    offset-y min-width="290px">
                                                    <template v-slot:activator="{ on }">
                                                        <v-text-field v-model="$v.editedItem.most_recent_data.valid_until.$model"
                                                            :error="$v.$invalid"
                                                            :disabled="editedItem.most_recent_data.to_delete"
                                                            label="Ended" v-on="on">
                                                        </v-text-field>
                                                    </template>
                                                    <v-date-picker v-model="$v.editedItem.most_recent_data.valid_until.$model"
                                                            @input="editedItem.most_recent_data.show_valid_until = false"
                                                            no-title></v-date-picker>
                                                </v-menu>
                                            </v-col>
                                        </v-row>
                                        <v-row align="center">
                                            <v-col cols="12" sm="3">
                                                <div v-if="editedItem.most_recent_data.show_add_more_recent">
                                                    <v-btn @click="editedItem.most_recent_data.show_add_more_recent = false"
                                                            small outlined color="red">
                                                        Add newer position
                                                    </v-btn>
                                                </div>
                                                <div v-if="!editedItem.most_recent_data.show_add_more_recent">
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
                                            <v-col cols="12" sm="3" v-if="!editedItem.most_recent_data.show_add_more_recent">
                                                <v-select v-model="editedItem.newer_data.lab_position_id"
                                                    :items="labPositions"
                                                    item-value="id" item-text="name_en"
                                                    label="Position"
                                                ></v-select>
                                            </v-col>
                                            <v-col cols="12" sm="2" v-if="!editedItem.most_recent_data.show_add_more_recent">
                                                <v-text-field v-model="editedItem.newer_data.dedication"
                                                    label="Dedication (%)"
                                                ></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="2" v-if="!editedItem.most_recent_data.show_add_more_recent">
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
                                            <v-col cols="12" sm="2" v-if="!editedItem.most_recent_data.show_add_more_recent">
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
                                                <div v-if="formError">
                                                    <p class="caption red--text">Unable to submit form.</p>
                                                </div>
                                                <v-btn type="submit"
                                                    outlined
                                                    color="blue"
                                                    class="mr-2">Save</v-btn>
                                            </v-row>
                                        </v-col>
                                        <v-col cols="11" sm="2"
                                            v-if="depTeamId !== undefined"
                                        >
                                            <v-row justify="end">
                                                <v-btn
                                                    @click="submitDeleteDepartmentTeam(editedItem)"
                                                    outlined
                                                    color="red"
                                                    class="mr-2">Remove from team</v-btn>
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
import {requiredIf} from 'vuelidate/lib/validators'

function processResults(vm, result) {
    let currentMembers = [];
    let today = time.moment();
    for (let ind in result) {
        for (let indHistory in result[ind].history) {
            let validFrom = result[ind].history[indHistory].valid_from;
            let validUntil = result[ind].history[indHistory].valid_until;
            if ((validFrom === null || time.moment(validFrom).isBefore(today))
                && (validUntil === null || time.moment(validUntil).isAfter(today))
                ) {
                result[ind].progress = false;
                result[ind].success = undefined;
                result[ind].error = undefined;
                result[ind].history[indHistory].valid_from = time.momentToDate(result[ind].history[indHistory].valid_from);
                result[ind].history[indHistory].valid_until = time.momentToDate(result[ind].history[indHistory].valid_until);
                result[ind].history[indHistory].show_valid_from = false;
                result[ind].history[indHistory].show_valid_until = false;
                result[ind].history[indHistory].show_add_more_recent = true;
                result[ind].history[indHistory].to_delete = false;
                result[ind].most_recent_data = result[ind].history[indHistory];
                result[ind].newer_data = {}
                currentMembers.push(result[ind]);
                break;
            }
        }
    }
    return currentMembers;
}
function processForSpreadsheet(members) {
    let membersCurated = [];
    for (let ind in members) {
        let thisMember = {};
        thisMember.name = members[ind].name;
        thisMember.colloquial_name = members[ind].colloquial_name;
        thisMember.position = members[ind].most_recent_data.lab_position_name_en;
        thisMember.valid_from = members[ind].most_recent_data.valid_from;
        thisMember.valid_until = members[ind].most_recent_data.valid_until;
        thisMember.valid_from = members[ind].most_recent_data.valid_from;
        thisMember.association_key = members[ind].researcher_details[0].association_key;
        thisMember.ciencia_id = members[ind].researcher_details[0].ciencia_id;
        thisMember.ORCID = members[ind].researcher_details[0].ORCID;

        membersCurated.push(thisMember);
    }
    return membersCurated;
}

export default {
    props: {
        labId: Number,
        labData: Object,
        myLabs: Array,
        depTeamId: Number,
        depTeamData: Object,
        myDepTeams: Array,
        labPositions: Array,
    },
    data() {
        return {
            dialog: false,
            formError: false,
            editedIndex: -1,
            editedItem: {
                most_recent_data: {},
                newer_data: {},
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
            },
            labs: [],
        }
    },
    mounted () {
        this.initialize();
        this.$root.$on('updateCurrentTeamMembers', () => {
            // your code goes here
            this.initialize();
        });
        this.getLabs();
    },
    computed: {
        currentGroup () {
            let today = time.moment();
            if (this.labData !== undefined) {
                for (let ind in  this.labData.groups_history) {
                    if ((this.labData.groups_history[ind].valid_from === null ||
                        time.moment(this.labData.groups_history[ind].valid_from).isBefore(today))
                        &&
                        (this.labData.groups_history[ind].valid_until === null ||
                        time.moment(this.labData.groups_history[ind].valid_until).isAfter(today))) {
                        let currentGroup = {
                            name: this.labData.groups_history[ind].name,
                            unit: this.labData.groups_history[ind].units_history[0],
                        };
                        return currentGroup;
                    }
                }
            }
            return false;
        },
        pastGroups () {
            let today = time.moment();
            let pastGroups = [];
            if (this.labData !== undefined) {
                for (let ind in  this.labData.groups_history) {
                    if ((this.labData.groups_history[ind].valid_from === null ||
                        time.moment(this.labData.groups_history[ind].valid_from).isBefore(today))
                        && time.moment(this.labData.groups_history[ind].valid_until).isBefore(today)) {
                        pastGroups.push(this.labData.groups_history[ind]);
                        return pastGroups;
                    }
                }
            }
            return false;
        },
    },
    watch: {
        labId () {
            this.initialize();
        },
        depTeamId () {
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
                    if ((decomposedPath[0] === 'labs'
                        && parseInt(decomposedPath[1], 10) === this.labId
                        && decomposedPath[2] === 'members-affiliation'
                        && this_session.permissionsEndpoints[ind].method_name === 'GET')
                        ||
                        (decomposedPath[0] === 'labs'
                        && parseInt(decomposedPath[1], 10) === this.labId
                        && this_session.permissionsEndpoints[ind].allow_all_subpaths === 1
                        && this_session.permissionsEndpoints[ind].method_name === 'GET')
                    ) {
                        foundEndpoint = true;
                        let urlSubmit = 'api' + '/labs/' + this.labId + '/members-affiliation';
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            let currentMembers = processResults(this, result);
                            this.data.members = currentMembers;
                        });
                    }
                    if ((decomposedPath[0] === 'department-teams'
                        && parseInt(decomposedPath[1], 10) === this.depTeamId
                        && decomposedPath[2] === 'members-affiliation'
                        && this_session.permissionsEndpoints[ind].method_name === 'GET')
                        ||
                        (decomposedPath[0] === 'department-teams'
                        && parseInt(decomposedPath[1], 10) === this.depTeamId
                        && this_session.permissionsEndpoints[ind].allow_all_subpaths === 1
                        && this_session.permissionsEndpoints[ind].method_name === 'GET')
                    ) {
                        foundEndpoint = true;
                        let urlSubmit = 'api' + '/department-teams/' + this.depTeamId + '/members-affiliation';
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            let currentMembers = processResults(this, result);
                            this.data.members = currentMembers;
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
        deleteCurrent (member) {
            alert('Warning: Deletion will only occur after pressing the "Save" button for this member.')
            member.most_recent_data.to_delete = true;
        },
        undeleteCurrent (member) {
            member.most_recent_data.to_delete = false;
        },
        discardNewer (member) {
            member.newer_data = {};
            member.most_recent_data.show_add_more_recent = true;
        },
        submitForm (member) {
            if (this.$v.$invalid) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                let this_session = this.$store.state.session;
                if (this_session.loggedIn) {
                    member.most_recent_data.changed_by = this_session.userID;
                    member.progress = true;
                    let memberID = member.person_id;
                    let reqUpdate, urlUpdate,
                        reqCreate, urlCreate,
                        reqDelete, urlDelete;
                    if (this.labId !== undefined) {
                        reqUpdate = '/labs/' + this.labId
                                + '/members-affiliation/' + memberID
                                + '/position/' + member.most_recent_data.id;
                        urlUpdate = 'api' + reqUpdate;

                        reqCreate = '/labs/' + this.labId
                                    + '/members-affiliation/' + memberID
                                    + '/position';
                        urlCreate = 'api' + reqCreate;
                        reqDelete = '/labs/' + this.labId
                                    + '/members-affiliation/' + memberID
                                    + '/position/' + member.most_recent_data.id;
                        urlDelete = 'api' + reqDelete;
                    }
                    if (this.depTeamId !== undefined) {
                        reqUpdate = '/department-teams/' + this.depTeamId
                                + '/members-affiliation/' + memberID
                                + '/position/' + member.most_recent_data.id;
                        urlUpdate = 'api' + reqUpdate;

                        reqCreate = '/department-teams/' + this.depTeamId
                                    + '/members-affiliation/' + memberID
                                    + '/position';
                        urlCreate = 'api' + reqCreate;
                        reqDelete = '/department-teams/' + this.depTeamId
                                    + '/members-affiliation/' + memberID
                                    + '/position/' + member.most_recent_data.id;
                        urlDelete = 'api' + reqDelete;
                    }
                    let requests = [];
                    let alreadyCreate = false;
                    for (let ind in this_session.permissionsEndpoints) {
                        if (subUtil.checkPermissions(reqUpdate, 'PUT',
                                    this_session.permissionsEndpoints[ind].endpoint_url,
                                    this_session.permissionsEndpoints[ind].method_name,
                                    this_session.permissionsEndpoints[ind].allow_all_subpaths
                                    )
                            && !member.most_recent_data.to_delete ) {
                            requests.push(this.$http.put(urlUpdate,
                                {
                                    data: member.most_recent_data
                                },
                                {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                            ));
                        }
                        if (subUtil.checkPermissions(reqCreate, 'POST',
                                    this_session.permissionsEndpoints[ind].endpoint_url,
                                    this_session.permissionsEndpoints[ind].method_name,
                                    this_session.permissionsEndpoints[ind].allow_all_subpaths)
                            && Object.keys(member.newer_data).length > 0
                            && !alreadyCreate) {
                            alreadyCreate = true;
                            member.newer_data.changed_by = this_session.userID;
                            member.newer_data.lab_id = this.depTeamData.lab_id;
                            requests.push(this.$http.post(urlCreate,
                                {
                                    data: member.newer_data
                                },
                                {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                            ));
                        }
                        if (subUtil.checkPermissions(reqDelete, 'DELETE',
                                    this_session.permissionsEndpoints[ind].endpoint_url,
                                    this_session.permissionsEndpoints[ind].method_name,
                                    this_session.permissionsEndpoints[ind].allow_all_subpaths)
                            && member.most_recent_data.to_delete) {
                            requests.push(this.$http.delete(urlDelete,
                                {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                data: { data: member.most_recent_data },
                                }
                            ));
                        }
                    }
                    Promise.all(requests)
                        .then( () => {
                            member.progress = false;
                            member.success = true;
                            setTimeout(() => {member.success = false;}, 1500)
                            this.$root.$emit('updatePastTeamMembers')
                            this.initialize();
                        })
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
        submitDeleteDepartmentTeam (member) {
            let this_session = this.$store.state.session;
            if (this_session.loggedIn) {
                member.most_recent_data.changed_by = this_session.userID;
                member.progress = true;
                let memberID = member.person_id;
                let reqDelete, urlDelete;
                reqDelete = '/department-teams/' + this.depTeamId
                            + '/members-affiliation/' + memberID;
                urlDelete = 'api' + reqDelete;
                let requests = [];
                for (let ind in this_session.permissionsEndpoints) {
                    if (subUtil.checkPermissions(reqDelete, 'DELETE',
                                this_session.permissionsEndpoints[ind].endpoint_url,
                                this_session.permissionsEndpoints[ind].method_name,
                                this_session.permissionsEndpoints[ind].allow_all_subpaths)
                    ) {
                        requests.push(this.$http.delete(urlDelete,
                            {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                            data: { data: member.most_recent_data },
                            }
                        ));
                    }
                }
                Promise.all(requests)
                    .then( () => {
                        member.progress = false;
                        member.success = true;
                        setTimeout(() => {member.success = false;}, 1500)
                        this.$root.$emit('updatePastTeamMembers')
                        this.initialize();
                    })
                    .catch((error) => {
                        member.progress = false;
                        member.error = true;
                        this.initialize();
                        setTimeout(() => {member.error = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    })
            }

        },
        generateSpreadsheet(members, labData) {
            let today = time.moment();
            let dateFile = time.momentToDate(today, 'Europe/Lisbon', 'YYYY-MM-DDTHHmmss')
            let membersCurated = processForSpreadsheet(members);

            let wb = XLSX.utils.book_new();
            let ws  = XLSX.utils.json_to_sheet(membersCurated);
            XLSX.utils.book_append_sheet(wb, ws, 'Current Team');
            let filename = labData.name.replace(/[^a-z0-9]/gi, '_')
            XLSX.writeFile(wb, filename + '_current-team-members_' + dateFile + '.xlsx');
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
        getLabs() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'labs';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labs');
            }
        },
    },
    //editedItem.most_recent_data.valid_until
    validations: {
        editedItem: {
            most_recent_data: {
                valid_until: {
                    required: requiredIf(
                        function () {
                            return !this.editedItem.most_recent_data.show_add_more_recent;
                        }
                    ),
                }
            }
        }
    }
}
</script>

<style scoped>

</style>