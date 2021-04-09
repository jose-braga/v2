<template>
<v-card flat>

    <v-container>
        <v-data-table
            item-key="id"
            :headers="headers"
            :footer-props="footerProps"
            :items="data.items"
            :items-per-page="10"

            :sort-by="['item_details.event_date']"
            :sort-desc="[true]"
            multi-sort

            class='mt-4'
        >
            <template v-slot:top>
                <v-dialog v-model="dialog" max-width="1600px">
                    <ItemDetails
                        :other-person-id="otherPersonId"
                        :item-data="editedItem"

                        :item-id="itemID"
                    >
                    </ItemDetails>
                </v-dialog>
            </template>
            <template v-slot:item.details="{ item }">
                <v-row class="pr-2">
                    <v-col cols="6">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-icon v-on="on"
                                    @click="editItem(item)">mdi-file-document-multiple
                                </v-icon>
                            </template>
                            <span>View details</span>
                        </v-tooltip>
                    </v-col>
                </v-row>
            </template>
        </v-data-table>
        <v-row>
            <v-dialog
                v-model="dialogNewItem"
                max-width="1600px"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        color="primary"
                        dark
                        v-bind="attrs"
                        outlined
                        v-on="on"
                        >
                        Add new outreach event
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span> New outreach event </span><br>
                    </v-card-title>
                    <v-container>
                        <v-form ref="form"
                            @submit.prevent="submitForm">
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-text-field v-model="data.newItem.name"
                                        label="Event name"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="6" sm="2">
                                    <v-menu ref="date_menu"
                                        v-model="data.newItem.show_start"
                                        :close-on-content-click="false"
                                        :nudge-right="10"
                                        transition="scale-transition"
                                        offset-y min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="data.newItem.event_date"
                                                label="Start date" v-on="on">
                                            </v-text-field>
                                        </template>
                                        <v-date-picker v-model="data.newItem.event_date"
                                            @input="data.newItem.show_start = false"
                                            no-title
                                        ></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col>
                                    <v-switch v-model="data.newItem.international"
                                        :label="'International:' + data.newItem.international"
                                        dense
                                        hide-details
                                    >
                                    </v-switch>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12">
                                    <v-textarea
                                        v-model="data.newItem.short_description"
                                        rows="3"
                                        counter
                                        label="Description (<500 ca)">
                                    </v-textarea>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-row justify="center">
                                        <h3>LAQV/UCIBIO people</h3>
                                    </v-row>
                                    <v-row v-for="(person,i) in data.newItem.person_details"
                                        :key="i"
                                        align="center"
                                    >
                                        <v-col cols="12" sm="9">
                                            <v-autocomplete
                                                v-model="person.person_id"
                                                :items="people" item-value="id" item-text="colloquial_name"
                                                :search-input.sync="searchPeople[i]"
                                                :filter="customSearch"
                                                cache-items
                                                flat
                                                hide-no-data
                                                hide-details
                                                label="People">
                                            </v-autocomplete>
                                        </v-col>

                                        <v-col cols="3">
                                            <v-btn icon @click="removeItem(data.newItem.person_details, i)">
                                                <v-icon color="red darken">mdi-delete</v-icon>
                                            </v-btn>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-divider></v-divider>
                                        </v-col>
                                    </v-row>

                                    <v-row justify="center">
                                        <v-btn small outlined class="ml-8"
                                            @click="addItem(data.newItem.person_details, 'person')">
                                                Add person
                                        </v-btn>
                                    </v-row>
                                </v-col>
                                <v-divider vertical></v-divider>
                                <v-col cols="12" sm="">
                                    <v-row justify="center">
                                        <h3>Labs associated with event</h3>
                                    </v-row>
                                    <v-row v-for="(lab,i) in data.newItem.labs_details"
                                        :key="'labs-' + i"
                                        align="center"
                                    >
                                        <v-col cols="12" sm="9">
                                            <v-autocomplete
                                                v-model="lab.lab_id"
                                                :items="labs" item-value="id" item-text="name"
                                                :search-input.sync="searchLabs[i]"
                                                :filter="customSearch"
                                                cache-items
                                                flat
                                                hide-no-data
                                                hide-details
                                                label="Labs">
                                            </v-autocomplete>
                                        </v-col>
                                        <v-col cols="3">
                                            <v-btn icon @click="removeItem(data.newItem.labs_details, i)">
                                                <v-icon color="red darken">mdi-delete</v-icon>
                                            </v-btn>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-divider></v-divider>
                                        </v-col>
                                    </v-row>
                                    <v-row justify="center">
                                        <v-btn small outlined class="ml-8"
                                            @click="addItem(data.newItem.labs_details, 'lab')">
                                                Add lab
                                        </v-btn>
                                    </v-row>
                                </v-col>
                            </v-row>
                            <v-row align-content="center" justify="center" class="pt-6">
                                <div>
                                    <v-btn type="submit"
                                        outlined color="blue">Save</v-btn>
                                </div>
                                <div class="request-status-container">
                                    <v-progress-circular indeterminate
                                            v-show="progress"
                                            :size="20" :width="2"
                                            color="primary"></v-progress-circular>
                                    <v-icon v-show="success" color="green">mdi-check</v-icon>
                                    <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                                </div>
                            </v-row>
                        </v-form>
                    </v-container>
                </v-card>
            </v-dialog>
        </v-row>
        <v-row>
            <p class="mt-2"> To avoid duplications, please search below to find if event isn't
                already in the database
            </p>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-divider></v-divider>
            </v-col>
        </v-row>
        <v-row>
            <h3> Add from LAQV/UCIBIO database
            </h3>
            <v-col cols="12">
                <v-text-field
                    v-model="search"
                    @input="searchItems(search)"
                    append-icon="mdi-magnify"
                    label="Search outreach events (char > 3)"
                    single-line
                    hide-details
                    class="px-2 mb-4"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-form  ref="fromDB" @submit.prevent="submitNewAssociations">
            <v-data-table
                item-key="id"
                :headers="headersSearch"
                :footer-props="footerPropsSearch"
                :items="data.searchItems"
                :items-per-page="10"
                :sort-by="['event_date']"
                :sort-desc="[true]"
                multi-sort
            >
                <template v-slot:item.associate="{ item }">
                    <v-checkbox
                        v-model="item.to_associate"
                    ></v-checkbox>
                </template>
            </v-data-table>
            <v-row align-content="center" justify="end" class="mt-4">
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Add to your outreach events</v-btn>
                    </v-row>
                </v-col>
                <v-col cols="1">
                    <v-progress-circular indeterminate
                            v-show="progress"
                            :size="20" :width="2"
                            color="primary"></v-progress-circular>
                    <v-icon v-show="success" color="green">mdi-check</v-icon>
                    <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                </v-col>
            </v-row>
        </v-form>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

import ItemDetails from './ParticipationOutreachDetails'

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
        currentTab: String,
        otherPersonId: Number,
    },
    components: {
        ItemDetails,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            search: '',
            searchCountries: '',
            dialog: false,
            dialogNewItem: false,
            itemID: undefined,
            editedIndex: -1,
            editedItem: {},
            headers: [
                { text: 'Event', value:'item_details.name' },
                { text: 'Date', value:'item_details.event_date' },
                //{ text: 'To add', value: 'associate', sortable: false},
                { text: 'Details', value: 'details', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            headersSearch: [
                { text: 'Event', value:'name' },
                { text: 'Date', value:'event_date' },
                { text: 'To add', value: 'associate', sortable: false},
                //{ text: 'Details', value: 'details', sortable: false},
            ],
            footerPropsSearch: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                newItem: {
                    international: false,
                    person_details: [],
                    labs_details: [],
                },
                items: [],
                searchItems: [],
            },
            people: [],
            labs: [],
            searchPeople: [],
            searchLabs: [],
        }
    },
    mounted() {
        this.initialize();
        this.getPeople();
        this.getLabs();
        this.$root.$on('updatedOutreach',
            () => {
                this.initialize();
            }
        );

    },
    watch: {
        currentTab () {
            if (this.currentTab.includes('/other')) {
                this.initialize();
            }
        },
        otherPersonId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            let personID = this.otherPersonId;
            this.data.newItem.person_details = [{person_id: personID}];
            let urlSubmit = 'api/people/' + personID  + '/outreaches';
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then( (result) => {
                for (let ind in result) {
                    if (result[ind].item_details.international === 1) {
                        result[ind].item_details.international = true;
                    } else {
                        result[ind].item_details.international = false;
                    }
                    if (result[ind].item_details.event_date) {
                        result[ind].item_details.event_date = time.momentToDate(result[ind].item_details.event_date);
                    }
                }
                this.data.items = result;
                if (this.dialog && this.editedIndex > -1) {
                    for (let ind in this.data.items) {
                        if (this.data.items[ind].outreach_id === this.itemID) {
                            this.editItem(this.data.items[ind])
                            break
                        }
                    }
                }
            });
        },
        searchItems (search) {
            let minimumLength = 3;
            if (search.length > minimumLength) {
                this.data.searchItems = [];
                let personID = this.otherPersonId;
                let urlSubmit = 'api/people/' + personID + '/all-outreaches'
                                + '?';
                urlSubmit = urlSubmit + 'q=' + search;
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    for (let ind in result) {
                        if (result[ind].event_date) {
                            result[ind].event_date = time.momentToDate(result[ind].event_date);
                        }
                    }
                    this.data.searchItems = result;
                })
            } else {
                this.data.searchItems = [];
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let personID = this.otherPersonId;

                let urlCreate = [
                    {
                        url: 'api/people/' + personID
                            + '/outreaches',
                        body: this.data.newItem,
                    }
                ];
                Promise.all(urlCreate.map(el =>
                    this.$http.post(el.url,
                        { data: el.body, },
                        { headers:
                            {'Authorization': 'Bearer ' + localStorage['v2-token']
                        },
                    }))
                )
                .then(() => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {
                        this.success = false;
                        this.data.newItem = {
                            international: false,
                            person_details: [],
                            labs_details: [],
                        };
                        this.initialize();
                    }, 1500);
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        submitNewAssociations () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let personID = this.otherPersonId;
                let urlCreate = []; //create person-project association
                let items = this.data.searchItems;
                for (let ind in items) {
                    if (items[ind].to_associate) {
                        urlCreate.push({
                            url: 'api/people/' + personID
                                    + '/outreaches/' + items[ind].id,
                            body: items[ind],
                        });

                    }
                }
                Promise.all(urlCreate.map(el =>
                    this.$http.post(el.url,
                        { data: el.body, },
                        { headers:
                            {'Authorization': 'Bearer ' + localStorage['v2-token']
                        },
                    }))
                )
                .then(() => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {
                        this.success = false;
                        this.searchItems (this.search);
                        this.initialize();
                    }, 1500);
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        getPeople () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'people-simple';
            return subUtil.getPublicInfo(vm, urlSubmit, 'people');
        },
        getLabs() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'labs';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labs');
            }
        },
        addItem(list, type) {
            if (type === 'person') {
                list.push({
                    id: 'new',
                });
                this.searchPeople.push(null);
            } else if (type === 'lab') {
                list.push({
                    id: 'new',
                });
                this.searchLabs.push(null);
            }
        },
        removeItem(list, ind) {
            list.splice(ind, 1);
        },
        editItem (item) {
            this.dialog = true;
            this.editedIndex = this.data.items.indexOf(item);
            this.editedItem = item;
            this.itemID = item.outreach_id;
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