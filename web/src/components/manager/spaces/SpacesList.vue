<template>
<v-card class="px-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">All Spaces</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-row>
        <v-col cols="12">
            <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Search by name"
                single-line
                hide-details
                class="px-2 mb-4"
            ></v-text-field>
        </v-col>
    </v-row>
    <v-data-table
        item-key="id"
        :headers="headers"
        :search="search"
        :footer-props="footerProps"
        :items="data.spaces"
        :items-per-page="itemsPerPage"
        :loading="loading"
        :sort-by="['reference']"
        :sort-desc="[false]"
        class="elevation-1"
    >
        <template v-slot:top>
            <v-dialog v-model="dialog" max-width="1600px">
                <SpaceDetails
                    :space-id="editedItem.id"
                    :space-data="editedItem"
                    :manager-id="managerID"
                >
                </SpaceDetails>
            </v-dialog>
        </template>
        <template v-slot:item.show_teams="{ item }">
                <span v-html="item.show_teams"></span>
            </template>
        <template v-slot:item.action="{ item }">
            <v-icon @click="editItem(item)">mdi-card-text</v-icon>
        </template>
    </v-data-table>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

const SpaceDetails = () => import(/* webpackChunkName: "manager-space-details" */ './SpaceDetails')

export default {
    components: {
        SpaceDetails,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            dialog: false,
            editedIndex: -1,
            editedItem: {},
            //dialogNewMember: false,
            //currentPage: 1,
            options: {},
            loading: true,
            itemsPerPage: 10,
            search: '',
            managerID: null,
            //searchLab: '',
            //searchGroup: '',
            //userAction: false, //only to avoid duplicate requests on initial loading
            //memberID: undefined,
            //memberName: undefined,
            //managerID: undefined, // Attention: this is a user ID (not a person ID)
            //endpoint: '',
            data: {
                spaces: [],
            },
            headers: [
                { text: 'Reference', value: 'reference'},
                { text: 'Type', value: 'space_type_name_en'},
                { text: 'Name', value: 'name_pt'},
                { text: 'Teams', value:'show_teams' },
                { text: 'Details', value: 'action', sortable: false },
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
        }
    },
    mounted() {
        this.initialize();
        this.$root.$on('updateManagerSpace',
            () => {
                this.initialize();
            }
        );
    },
    methods: {
        initialize() {
            this.loading = true;
            let this_session = this.$store.state.session;
            this.managerID = this_session.userID;
            let urlSubmit = 'api/managers/' + this.managerID
                + '/cities/' + 1
                + '/spaces';
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then( (result) => {
                for (let ind in result) {
                    let show_teams = '';
                    if (result[ind].teams.length > 0) show_teams = '<ul>';
                    for (let indTeam in result[ind].teams) {
                        if (result[ind].teams[indTeam].valid_from !== null) {
                            result[ind].teams[indTeam].valid_from = time.momentToDate(result[ind].teams[indTeam].valid_from);
                        }
                        if (result[ind].teams[indTeam].valid_until !== null) {
                            result[ind].teams[indTeam].valid_until = time.momentToDate(result[ind].teams[indTeam].valid_until);
                        }
                        show_teams = show_teams
                                + '<li>'
                                + (result[ind].teams[indTeam].name)
                                + '</li>'
                    }
                    if (result[ind].teams.length > 0) show_teams = show_teams  + '</ul>';
                    //if (show_teams !== '') console.log(show_teams)
                    result[ind].show_teams = show_teams;
                    for (let indPeop in result[ind].people) {
                        if (result[ind].people[indPeop].valid_from !== null) {
                            result[ind].people[indPeop].valid_from = time.momentToDate(result[ind].people[indPeop].valid_from);
                        }
                        if (result[ind].people[indPeop].valid_until !== null) {
                            result[ind].people[indPeop].valid_until = time.momentToDate(result[ind].people[indPeop].valid_until);
                        }
                    }
                }
                this.data.spaces = result;
                this.loading = false;
            })

        },
        editItem (item) {
            this.dialog = true;
            this.editedIndex = this.data.spaces.indexOf(item);
            this.editedItem = item;
        },
    },

}
</script>

<style>

</style>