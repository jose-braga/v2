<template>
<v-card>
    <!-- For managing space associations at the lab level -->
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Spaces associated to your team</h3>
        </div>
    </v-card-title>
    <v-container>
        <v-form ref="form" class="my-2 ml-2"
            @submit.prevent="submitForm"
        >
            <v-row>
                <v-col cols="12">
                    <v-btn
                        @click="showNewSpace()"
                        outlined color="blue"
                    >
                        Add a new space
                    </v-btn>

                </v-col>
            </v-row>
            <v-row v-if="addingNewSpace" align-content="center">
                <v-col cols="12" sm="3">
                    <v-autocomplete
                        v-model="data.newSpaces.space_id"
                        :items="spaces" item-value="id" item-text="space_text"
                        :search-input.sync="searchSpaces"
                        :filter="customSearch"
                        cache-items
                        flat
                        hide-no-data
                        hide-details
                        label="Spaces">
                    </v-autocomplete>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-text-field
                        v-model="data.newSpaces.percentage"
                        label="% Occupation">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-menu ref="date_menu"
                        v-model="data.newSpaces.show_valid_from"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="data.newSpaces.valid_from"
                                label="Start date" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="data.newSpaces.valid_from"
                            @input="data.newSpaces.show_valid_from = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-menu ref="menu_end_date"
                        v-model="data.newSpaces.show_valid_until"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="data.newSpaces.valid_until"
                                label="End date"
                                v-on="on"
                                v-bind="attrs"
                            >
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="data.newSpaces.valid_until"
                            @click="data.newSpaces.show_valid_until = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="2" align-self="center">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="red">Add</v-btn>
                    </v-row>
                </v-col>
                <v-col cols="1" align-self="center">
                    <v-progress-circular indeterminate
                            v-show="progress"
                            :size="20" :width="2"
                            color="primary"></v-progress-circular>
                    <v-icon v-show="success" color="green">mdi-check</v-icon>
                    <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                </v-col>
                <v-col cols="12" v-show="error">
                    <v-row>
                        <v-col cols="5" offset="7">
                            <span class="red--text">{{errorMessage}}</span>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-form>
        <v-data-table
            item-key="id"
            :search="search"
            :headers="headers"
            :footer-props="footerProps"
            :items="data.spaces"
            :items-per-page="10"
            :sort-by="['name']"
            :sort-desc="[false]"
        >
             <template v-slot:top>
                <v-dialog v-model="dialog" max-width="1600px">
                    <SpaceDetails
                        :item-id="editedItem.id"
                        :space-id="editedItem.space_id"
                        :supervisor-id="supervisorId"
                        :space-data="editedItem"
                        :endpoint="endpoint"
                    >
                    </SpaceDetails>
                </v-dialog>
            </template>
            <template v-slot:item.action="{ item }">
                <v-icon @click.stop="editItem(item)">mdi-pencil</v-icon>
                <v-icon @click.stop="deleteItem(item)"
                    class="ml-2"
                    color="red">mdi-delete</v-icon>
            </template>
        </v-data-table>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

const SpaceDetails = () => import(/* webpackChunkName: "manager-space-supervisor-details" */ './SpaceSupervisorDetails')

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
    props: {
        supervisorId: Number,
        endpoint: String,
    },
    components: {
        SpaceDetails,
    },
    data() {
        return {
            dialog: false,
            progress: false,
            success: false,
            error: false,
            errorMessage: '',
            editedIndex: -1,
            editedItem: {},
            addingNewSpace: false,
            data: {
                newSpaces: {},
                spaces: [],
            },
            search: '',
            headers: [
                { text: 'Room #', value:'reference' },
                { text: 'Name', value:'space_name_pt' },
                { text: '%', value:'percentage' },
                { text: 'Dates', value:'spaces_dates_show' },
                { text: 'Type', value:'space_type_name_pt' },
                { text: 'Actions', value: 'action', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            spaces: [],
            searchSpaces: '',
        }
    },
    mounted () {
        this.initialize();
        this.getSpaces();
        this.$root.$on('managerUpdateSupervisorSpaceTable',
            () => {
                this.initialize();
            }
        );
    },
    methods: {
        initialize () {
            let urlSubmit = 'api' + this.endpoint
                        + '/members'
                        + '/' + this.supervisorId + '/supervisor-spaces';
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then((result) => {
                for (let ind in result) {
                    let spaces_valid_from = '...'
                    let spaces_valid_until = '...'
                    if (result[ind].valid_from !== null) {
                        result[ind].valid_from = time.momentToDate(result[ind].valid_from);
                        spaces_valid_from = result[ind].valid_from;

                    }
                    if (result[ind].valid_until !== null) {
                        result[ind].valid_until = time.momentToDate(result[ind].valid_until)
                        spaces_valid_until = result[ind].valid_until;
                    }
                    result[ind].spaces_dates_show = spaces_valid_from
                        + ' - ' + spaces_valid_until;

                }
                this.data.spaces = result;
            });
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreate = [];
                urlCreate.push({
                    url: 'api' + this.endpoint
                        + '/members'
                        + '/' + this.supervisorId
                        + '/supervisor-spaces',
                    body: this.data.newSpaces,
                });
                this.$http.all(
                    urlCreate.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                )
                .then(this.$http.spread( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    //this.toDeleteLabPositions = []; // add the others
                    this.data.newSpaces = {}
                    this.addingNewSpace = false;
                    this.initialize();
                }))
                .catch((error) => {
                    if (error.response) {
                        this.errorMessage = error.response.data.message;
                    }
                    this.progress = false;
                    this.error = true;
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }

        },
        getSpaces () {
            let personID = this.$store.state.session.personID;
            const urlSubmit = 'api/people/' + personID + '/all-spaces';
            return subUtil.getInfoPopulate(this, urlSubmit, true)
            .then((result) => {
                for (let ind in result) {
                    let space_text = '';
                    space_text = space_text
                        + 'Room '
                        + result[ind].reference
                        + ', ';
                    space_text = space_text +
                        (result[ind].name_pt !== null ? result[ind].name_pt : '');
                    result[ind].space_text = space_text;
                }
                this.spaces = result
            })
            .catch( (error) => {
                console.log(error);
            })
        },
        showNewSpace () {
            this.addingNewSpace = true;
        },
        editItem (item) {
            this.dialog = true;
            this.editedIndex = this.data.spaces.indexOf(item);
            this.editedItem = item;
        },
        deleteItem (item) {
            let confirmation = confirm('Do you want to delete this association?')
            if (confirmation) {
                let urlDeleteLab = [];
                urlDeleteLab.push({
                    url: 'api' + this.endpoint
                        + '/members'
                        + '/' + this.supervisorId
                        + '/supervisor-spaces/' + item.id,
                });
                Promise.all(
                    urlDeleteLab.map(el =>
                        this.$http.delete(el.url,
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                    )
                .then(() => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.initialize();
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    this.initialize();
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
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
    },
}
</script>

<style>

</style>