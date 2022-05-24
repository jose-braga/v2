<template>
<v-card flat>
    <v-card-text>
    </v-card-text>
    <v-container>
        <v-data-table
            item-key="id"
            :headers="headers"
            :footer-props="footerProps"
            :items="data.items"
            :items-per-page="10"

            :sort-by="['item_details.status_date_show', 'item_details.title']"
            :sort-desc="[true, false]"
            multi-sort

            class='mt-4'
        >
            <template v-slot:top>
                <v-dialog v-model="dialog" max-width="1600px">
                    <ItemDetails
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
                        Add new Patent
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span> New Patent data </span><br>
                    </v-card-title>
                    <v-container>
                        <v-form ref="form"
                            @submit.prevent="submitForm">
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model="$v.data.newItem.authors_raw.$model"
                                        :error="$v.data.newItem.authors_raw.$error"
                                        label="Authors"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model="$v.data.newItem.title.$model"
                                        :error="$v.data.newItem.title.$error"
                                        label="Title"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="3">
                                    <v-text-field v-model="data.newItem.reference_number1"
                                        label="Patent Reference"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="4">
                                    <v-select v-model="data.newItem.patent_type_id"
                                        :items="patentTypes"
                                        item-value="id"
                                        item-text="name_en"
                                        label="Patent Type">
                                    </v-select>
                                </v-col>
                                <v-col cols="6" sm="2">
                                    <v-select v-model="data.newItem.patent_status_id"
                                        :items="patentStatusTypes"
                                        item-value="id"
                                        item-text="name_en"
                                        label="Patent Status">
                                    </v-select>
                                </v-col>
                                <v-col cols="6" sm="2">
                                    <v-menu ref="date_menu"
                                        v-model="data.newItem.show_date"
                                        :close-on-content-click="false"
                                        :nudge-right="10"
                                        transition="scale-transition"
                                        offset-y min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="$v.data.newItem.status_date.$model"
                                                :error="$v.data.newItem.status_date.$error"
                                                label="Status date" v-on="on">
                                            </v-text-field>
                                        </template>
                                        <v-date-picker v-model="$v.data.newItem.status_date.$model"
                                            @input="data.newItem.show_date = false"
                                            no-title
                                        ></v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12">
                                    <v-textarea
                                        v-model="$v.data.newItem.description.$model"
                                        :error="$v.data.newItem.description.$error"
                                        rows="3"
                                        counter
                                        label="Description (<1000 ca)">
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
                                        <h3>Labs associated with patent</h3>
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
                                <v-col cols="3" v-if="formError">
                                    <v-row justify="end">
                                        <p class="caption red--text">Unable to submit form.</p>
                                    </v-row>
                                </v-col>
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
            <p class="mt-2"> To avoid duplicates, please search below to find if patent isn't
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
                    label="Search title, authors or reference number (char > 3)"
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
                :sort-by="['status_date', 'title_show']"
                :sort-desc="[true, false]"
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
                        outlined color="blue">Add to your patents</v-btn>
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
import { maxLength } from 'vuelidate/lib/validators'

import ItemDetails from './SubmittedPatentsDetails'

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
    },
    components: {
        ItemDetails,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            search: '',
            searchCountries: '',
            dialog: false,
            dialogNewItem: false,
            itemID: undefined,
            editedIndex: -1,
            editedItem: {},
            headers: [
                { text: 'Authors', value:'item_details.authors_raw' },
                { text: 'Title', value:'item_details.title' },
                { text: 'Reference', value:'item_details.reference_number1' },
                { text: 'Date', value:'item_details.status_date_show' },
                //{ text: 'To add', value: 'associate', sortable: false},
                { text: 'Details', value: 'details', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            headersSearch: [
                { text: 'Authors', value:'authors_raw' },
                { text: 'Title', value:'title_show' },
                { text: 'Reference', value:'reference_number1' },
                { text: 'Date', value:'status_date' },
                { text: 'To add', value: 'associate', sortable: false},
                //{ text: 'Details', value: 'details', sortable: false},
            ],
            footerPropsSearch: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                newItem: {
                    title: '',
                    authors_raw: '',
                    description: '',
                    status_date: null,
                    person_details: [],
                    labs_details: [],
                },
                items: [],
                searchItems: [],
            },
            people: [],
            labs: [],
            patentTypes: [],
            patentStatusTypes: [],
            searchPeople: [],
            searchLabs: [],
        }
    },
    mounted() {
        this.initialize();
        this.getPeople();
        this.getLabs();
        this.getPatentTypes();
        this.getPatentStatusTypes();
        this.$root.$on('updatedPatent',
            () => {
                this.initialize();
            }
        );

    },
    watch: {
        currentTab () {
            if (this.currentTab === '/person/productivity/other') {
                this.initialize();
            }
        },
    },
    methods: {
        initialize () {
            let personID = this.$store.state.session.personID;
            this.data.newItem.person_details = [{person_id: personID}];
            let urlSubmit = 'api/people/' + personID  + '/patents';
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then( (result) => {
                for (let ind in result) {
                    if (result[ind].item_details.status_date) {
                        result[ind].item_details.status_date = time.momentToDate(result[ind].item_details.status_date);
                    }
                    result[ind].item_details.status_date_show = result[ind].item_details.status_date;
                }
                this.data.items = result;
                if (this.dialog && this.editedIndex > -1) {
                    for (let ind in this.data.items) {
                        if (this.data.items[ind].patent_id === this.itemID) {
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
                let personID = this.$store.state.session.personID;
                let urlSubmit = 'api/people/' + personID + '/all-patents'
                                + '?';
                urlSubmit = urlSubmit + 'q=' + search;
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    for (let ind in result) {
                        result[ind].title_show = result[ind].title;
                        if (result[ind].status_date) {
                            result[ind].status_date = time.momentToDate(result[ind].status_date);
                        }
                    }
                    this.data.searchItems = result;
                })
            } else {
                this.data.searchItems = [];
            }
        },
        submitForm () {
            if (this.$v.$invalid) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                if (this.$store.state.session.loggedIn) {
                    this.progress = true;
                    let personID = this.$store.state.session.personID;

                    let urlCreate = [
                        {
                            url: 'api/people/' + personID
                                + '/patents',
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
            }
        },
        submitNewAssociations () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let personID = this.$store.state.session.personID;
                let urlCreate = []; //create person-project association
                let items = this.data.searchItems;
                for (let ind in items) {
                    if (items[ind].to_associate) {
                        urlCreate.push({
                            url: 'api/people/' + personID
                                    + '/patents/' + items[ind].id,
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
        getPatentTypes () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'patent-types';
            return subUtil.getPublicInfo(vm, urlSubmit, 'patentTypes');
        },
        getPatentStatusTypes () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'patent-status-types';
            return subUtil.getPublicInfo(vm, urlSubmit, 'patentStatusTypes');
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
            this.itemID = item.patent_id;
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
    validations: {
        data: {
            newItem: {
                title: { maxLength: maxLength(300) },
                authors_raw: { maxLength: maxLength(500) },
                description: { maxLength: maxLength(1000) },
                status_date: { isValid: time.validate },
            },
        },
    },
}
</script>

<style>

</style>