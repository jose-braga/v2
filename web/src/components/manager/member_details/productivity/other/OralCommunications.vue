<template>
<v-card flat>
    <v-card-text>
        Insert only publications you presented.
    </v-card-text>
    <v-container>
        <v-data-table
            item-key="id"
            :headers="headers"
            :footer-props="footerProps"
            :items="data.items"
            :items-per-page="10"

            :sort-by="['date']"
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
                <v-row>
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
                    <v-col cols="6">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-icon  v-on="on"
                                    @click="removeItemTable(item)"
                                    color="red darken">
                                    mdi-delete
                                </v-icon>
                            </template>
                            <span>Delete communication
                            </span>
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
                        Add new Communications
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span> New Communications data </span><br>
                    </v-card-title>
                    <v-container>
                        <div class="small-text"> Please insert only communications you presented </div>
                        <v-form ref="form"
                            @submit.prevent="submitForm">
                            <v-switch v-model="isUnstructured"
                                :label="'Insert unstructured data: ' + isUnstructured"
                                dense
                                hide-details
                            >
                            </v-switch>
                            <div v-if="isUnstructured" class="pt-4 pl-4">
                                <v-row>
                                    <p>
                                        Insert communications as text (free format).
                                        Communications must be separated by 1 (or more) newlines e.g.:
                                    </p>
                                    <p class="small-text">
                                        Evans, A. C., Jr., Garbarino, J., Bocanegra, E., Kinscherff, R. T., & Márquez-Greene, N. (2019). Gun violence: An event on the power of community [Conference presentation]. APA 2019 Convention, August 8–11, Chicago, IL, United States.<br>
                                        Evans, A. C., Jr., Diaspro, A, Flaubert, G. (2016). Quantification of Hawking radiation emissions of two black holes systems. [Lecture speech]. Astrophysical Society Conference, Mar 11-14, Port Royal, Vanuatu.

                                    </p>
                                </v-row>
                                <v-row>
                                    <v-col cols="12">
                                        <v-textarea v-model="data.newItem.raw_text"
                                            label="Communications (unstructured data)"
                                            rows="10"
                                        ></v-textarea>
                                    </v-col>
                                </v-row>
                            </div>
                            <div v-else>
                                <v-row>
                                    <v-col cols="12" sm="9">
                                        <v-text-field v-model="data.newItem.title"
                                            label="Title"
                                        ></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="3">
                                        <v-select v-model="data.newItem.type_id"
                                            :items="communicationTypes"
                                            item-value="id"
                                            item-text="name"
                                            label="Communication Type">
                                        </v-select>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field v-model="data.newItem.authors_raw"
                                            label="Authors"
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="6">
                                        <v-text-field v-model="data.newItem.conference_title"
                                            label="Meeting Name"
                                        ></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="3">
                                        <v-select v-model="data.newItem.conference_type_id"
                                            :items="conferenceTypes"
                                            item-value="id"
                                            item-text="name"
                                            label="Meeting Type">
                                        </v-select>
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
                                    <v-col cols="6" sm="4" class="pb-8">
                                        <v-autocomplete
                                            v-model="data.newItem.country_id"
                                            :items="countries" item-value="id" item-text="name"
                                            :search-input.sync="searchCountries"
                                            :filter="customSearch"
                                            cache-items
                                            flat
                                            hide-no-data
                                            hide-details
                                            label="Country">
                                        </v-autocomplete>
                                    </v-col>
                                    <v-col cols="6" sm="4">
                                        <v-text-field v-model="data.newItem.city"
                                            label="City"
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
                                                <v-text-field v-model="data.newItem.date"
                                                    label="Date talk/poster" v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker v-model="data.newItem.date"
                                                @input="data.newItem.show_start = false"
                                                no-title
                                            ></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                </v-row>
                            </div>
                            <v-row>
                                <v-col cols="12">
                                    <v-row justify="center">
                                        <h3>Labs associated with item</h3>
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
    </v-container>
</v-card>

</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

import ItemDetails from './OralCommunicationDetails'

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
        otherPersonId: Number,
        managerId: Number,
        endpoint: String,
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
            isUnstructured: false,
            itemID: undefined,
            editedIndex: -1,
            editedItem: {},
            headers: [
                { text: 'Title', value:'title_show' },
                { text: 'Date', value:'date' },
                //{ text: 'To add', value: 'associate', sortable: false},
                { text: 'Details', value: 'details', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                newItem: {
                    international: false,
                    labs_details: [],
                },
                items: [],
            },
            people: [],
            countries: [],
            labs: [],
            conferenceTypes: [],
            communicationTypes: [],
            searchPeople: [],
            searchLabs: [],
            toDeleteItems: [],
        }
    },
    mounted() {
        this.initialize();
        this.getPeople();
        this.getCountries();
        this.getLabs();
        this.getConferenceTypes();
        this.getCommunicationTypes();
        this.$root.$on('updatedCommunication',
            () => {
                this.initialize();
            }
        );
    },

    methods: {
        initialize () {
            let personID = this.otherPersonId;
            let urlSubmit = 'api' + this.endpoint
                            + '/members'
                            + '/' + personID  + '/communications';
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then( (result) => {
                for (let ind in result) {
                    if (result[ind].date) {
                        result[ind].date = time.momentToDate(result[ind].date);
                    }
                    if (result[ind].communication_raw) {
                        result[ind].title_show = result[ind].communication_raw
                    } else {
                        result[ind].title_show = result[ind].title
                    }
                }
                this.data.items = result;
                if (this.dialog && this.editedIndex > -1) {
                    for (let ind in this.data.items) {
                        if (this.data.items[ind].id === this.itemID) {
                            this.editItem(this.data.items[ind])
                            break
                        }
                    }
                }
            });

        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let personID = this.otherPersonId;
                let urlCreate = [];
                if (this.isUnstructured) {
                    let text = this.data.newItem.raw_text;
                    let communications = text.split(/\n+/g)
                    for (let ind in communications) {
                        urlCreate.push({
                            url: 'api' + this.endpoint
                            + '/members'
                            + '/' + personID
                                + '/communications',
                            body: {
                                communication_raw: communications[ind],
                                labs_details: this.data.newItem.labs_details,
                            },
                        })
                    }
                } else {
                    urlCreate.push({
                            url: 'api' + this.endpoint
                            + '/members'
                            + '/' + personID
                                + '/communications',
                            body: this.data.newItem,
                        })
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
                        this.data.newItem = {
                            international: false,
                            labs_details: [],
                        }
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
        removeItemTable (item) {
            let proceed = confirm('Are you sure you want to delete this item?')
            if (proceed && this.$store.state.session.loggedIn) {
                this.progress = true;
                let personID = this.otherPersonId;
                let urlDelete = [];
                urlDelete.push({
                    url: 'api' + this.endpoint
                            + '/members'
                            + '/' + personID
                        + '/communications/' + item.id,
                })
                Promise.all(urlDelete.map(el =>
                    this.$http.delete(el.url,
                        { headers:
                            {'Authorization': 'Bearer ' + localStorage['v2-token']
                        },
                    }))
                )
                .then(() => {
                    this.data.items = [];
                    this.initialize();
                })
                .catch((error) => {
                    console.log(error)
                })
            }
        },
        getPeople () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'people-simple';
            return subUtil.getPublicInfo(vm, urlSubmit, 'people');
        },
        getCountries() {
            var this_vm = this;
            const urlSubmit = 'api/v2/' + 'countries';
            subUtil.getPublicInfo(this_vm, urlSubmit, 'countries');
        },
        getLabs() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'labs';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labs');
            }
        },
        getConferenceTypes() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'conference-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'conferenceTypes');
            }
        },
        getCommunicationTypes() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'communication-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'communicationTypes');
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
            this.itemID = item.id;
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
    }



}
</script>

<style scoped>

.small-text {
    font-size: 0.8em;
}

</style>