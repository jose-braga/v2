<template>
<v-container>
    <v-row>
        <v-col cols="12">
            <v-card>
                <v-card-title primary-title>
                    <div>
                        <!-- The list is shown according to the user perm issions -->
                        <h3 class="headline">Members awaiting validation</h3>
                    </div>
                </v-card-title>
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
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
                        :loading="loading"
                        :search="search"
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
        </v-col>
    </v-row>
</v-container>
</template>

<script>
import MemberDetails from '../member_details/MemberValidateDetails'

export default {
    components: {
        MemberDetails,
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
                { text: 'Details', value: 'action', sortable: false },
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
        }
    },
    mounted () {
        this.$root.$on('managerValidateRegistration', () => {
            this.initialize(1);
            this.dialog = false;
        });
        this.initialize(1);
    },
    methods: {
        initialize (page) {
            this.options.page = page;
            this.loading = true;
            let this_session = this.$store.state.session;
            if (this_session.loggedIn) {
                this.managerID = this_session.userID;
                let getFromUnits = [];
                for (let ind in this_session.permissionsEndpoints) {
                    let decomposedPath = this_session.permissionsEndpoints[ind].decomposedPath;
                    if (decomposedPath.length === 4
                        && decomposedPath[0] === 'managers'
                        && parseInt(decomposedPath[1], 10) === this_session.userID
                        && decomposedPath[2] === 'units'
                        && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        getFromUnits.push({
                            url: 'api/managers/' + this.managerID
                                + '/units/' + decomposedPath[3]
                                + '/validate-members',
                            unit: decomposedPath[3],
                        })
                    }
                }
                this.$http.all(
                    getFromUnits.map(el =>
                        this.$http.get(el.url,
                            {
                                headers: { 'Authorization': 'Bearer ' + localStorage['v2-token'] },
                            }
                        )
                    )
                )
                .then( this.$http.spread( (...members) => {
                    let list = []
                    for (let ind in members) {
                        for (let indMember in members[ind].data.result) {
                            members[ind].data.result[indMember].endpoint =
                                '/managers/' + this.managerID
                                + '/units/' + getFromUnits[ind].unit;
                        }
                        list = list.concat(members[ind].data.result);
                    }
                    this.data.members = list;
                    this.loading = false;
                }))
            }
        },
        editItem (item) {
            this.dialog = true;
            this.memberID = item.person_id;
            this.memberName = item.name;
            this.endpoint = item.endpoint
        }
    },
}
</script>

<style>

</style>