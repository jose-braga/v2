<template>
<v-card flat>
    <v-container>
        <v-data-table
            item-key="id"
            :headers="headers"
            :footer-props="footerProps"
            :items="data.projects"
            :items-per-page="10"

            :sort-by="['project_details.end_show', 'project_details.start_show', 'project_details.network_name']"
            :sort-desc="[true, true, false]"
            multi-sort

            class='mt-4'
        >
            <template v-slot:top>
                <v-dialog v-model="dialog" max-width="1600px">
                    <ProjectDetails
                        :other-person-id="otherPersonId"
                        :project-data="editedItem"
                        :project-id="itemID"
                    >
                    </ProjectDetails>
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
                v-model="dialogNewProject"
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
                        Add new network
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span> New Training Network data </span>
                    </v-card-title>
                    <v-container>
                        <v-form ref="form"
                            @submit.prevent="submitForm">
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="data.newProject.network_name"
                                        label="Network name"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="data.newProject.title"
                                        label="Title"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field v-model="data.newProject.coordinating_entity"
                                        label="Coordinating Entity"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="3" class="pb-8">
                                    <v-autocomplete
                                        v-model="data.newProject.country_id"
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
                            </v-row>
                            <v-row>
                                <v-col cols="4" sm="2">
                                    <v-text-field v-model="data.newProject.acronym"
                                        label="Acronym"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="8" sm="3">
                                    <v-text-field v-model="data.newProject.reference"
                                        label="Reference"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="3">
                                    <v-text-field v-model="data.newProject.website"
                                        label="Website"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="6" sm="2">
                                    <v-menu ref="date_menu"
                                        v-model="data.newProject.show_start"
                                        :close-on-content-click="false"
                                        :nudge-right="10"
                                        transition="scale-transition"
                                        offset-y min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="data.newProject.start"
                                                label="Start date" v-on="on">
                                            </v-text-field>
                                        </template>
                                        <v-date-picker v-model="data.newProject.start"
                                            @input="data.newProject.show_start = false"
                                            no-title
                                        ></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="6" sm="2">
                                    <v-menu ref="date_menu"
                                        v-model="data.newProject.show_end"
                                        :close-on-content-click="false"
                                        :nudge-right="10"
                                        transition="scale-transition"
                                        offset-y min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="data.newProject.end"
                                                label="End date" v-on="on">
                                            </v-text-field>
                                        </template>
                                        <v-date-picker v-model="data.newProject.end"
                                            @input="data.newProject.show_end = false"
                                            no-title
                                        ></v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="3">
                                    <v-select v-model="data.newProject.management_entity_id"
                                        :items="managementEntities"
                                        item-value="id"
                                        item-text="official_name"
                                        label="Management Entity">
                                    </v-select>
                                </v-col>

                                <v-col cols="12" sm="3">
                                    <v-text-field
                                        v-model="$v.data.newProject.amount.$model"
                                        :error="$v.data.newProject.amount.$error"
                                        label="Mngmt Entity Amount (€)"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="3">
                                    <v-text-field
                                        v-model="$v.data.newProject.global_amount.$model"
                                        :error="$v.data.newProject.global_amount.$error"
                                        label="Global amount (€)"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-row justify="center">
                                        <h3>LAQV/UCIBIO people</h3>
                                    </v-row>
                                    <v-row v-for="(person,i) in data.newProject.person_details"
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
                                            <v-btn icon @click="removeItem(data.newProject.person_details, i)">
                                                <v-icon color="red darken">mdi-delete</v-icon>
                                            </v-btn>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-divider></v-divider>
                                        </v-col>
                                    </v-row>

                                    <v-row justify="center">
                                        <v-btn small outlined class="ml-8"
                                            @click="addItem(data.newProject.person_details, 'person')">
                                                Add person
                                        </v-btn>
                                    </v-row>
                                </v-col>
                                <v-divider vertical></v-divider>
                                <v-col cols="12" sm="">
                                    <v-row justify="center">
                                        <h3>Labs associated with training network</h3>
                                    </v-row>
                                    <v-row v-for="(lab,i) in data.newProject.labs_details"
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
                                            <v-btn icon @click="removeItem(data.newProject.labs_details, i)">
                                                <v-icon color="red darken">mdi-delete</v-icon>
                                            </v-btn>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-divider></v-divider>
                                        </v-col>
                                    </v-row>
                                    <v-row justify="center">
                                        <v-btn small outlined class="ml-8"
                                            @click="addItem(data.newProject.labs_details, 'lab')">
                                                Add lab
                                        </v-btn>
                                    </v-row>
                                </v-col>

                            </v-row>
                            <v-row>
                                <v-col cols="12">
                                    <v-textarea
                                        v-model="$v.data.newProject.notes.$model"
                                        :error="$v.data.newProject.notes.$error"
                                        rows="4"
                                        counter
                                        label="Notes (500 ca)">
                                    </v-textarea>
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
            <p class="mt-2"> To avoid duplications, please search below to find if network isn't
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
                    @input="searchProjects(search)"
                    append-icon="mdi-magnify"
                    label="Search title, acronym or reference (char > 3)"
                    single-line
                    hide-details
                    class="px-2 mb-4"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-form  ref="formDB" @submit.prevent="submitNewAssociations">
            <v-data-table
                item-key="id"
                :headers="headersSearch"
                :footer-props="footerPropsSearch"
                :items="data.searchProjects"
                :items-per-page="10"
                :sort-by="['end_show','start_show','network_name']"
                :sort-desc="[true, true, false]"
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
                        outlined color="blue">Add to your projects</v-btn>
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
import { integer, maxLength } from 'vuelidate/lib/validators'

import ProjectDetails from './TrainingNetworkDetails'

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
        ProjectDetails,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            search: '',
            searchCountries: '',
            dialog: false,
            dialogNewProject: false,
            itemID: undefined,
            editedIndex: -1,
            editedItem: {},
            headers: [
                { text: 'Network name', value:'project_details.network_name' },
                { text: 'Title', value:'project_details.title' },
                { text: 'Start', value:'project_details.start_show' },
                { text: 'End', value:'project_details.end_show' },
                //{ text: 'To add', value: 'associate', sortable: false},
                { text: 'Details', value: 'details', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            headersSearch: [
                { text: 'Network name', value:'network_name' },
                { text: 'Title', value:'title' },
                { text: 'Start', value:'start' },
                { text: 'End', value:'end' },
                { text: 'To add', value: 'associate', sortable: false},
                //{ text: 'Details', value: 'details', sortable: false},
            ],
            footerPropsSearch: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                newProject: {
                    amount: '',
                    global_amount: '',
                    notes: '',
                    person_details: [],
                    labs_details: [],
                },
                projects: [],
                searchProjects: [],
            },
            people: [],
            countries: [],
            labs: [],
            managementEntities : [],
            searchPeople: [],
            searchLabs: [],
        }
    },
    mounted() {
        this.initialize();
        this.getPeople();
        this.getCountries();
        this.getLabs();
        this.getManagementEntities();
        this.$root.$on('updatedTrainingNetwork',
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
            this.data.newProject.person_details = [{person_id: personID}];
            let urlSubmit = 'api/people/' + personID  + '/training-networks';
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then( (result) => {
                for (let ind in result) {
                    let startDate = '...';
                    if (result[ind].project_details.start) {
                        startDate = time.momentToDate(result[ind].project_details.start)
                        result[ind].project_details.start = time.momentToDate(result[ind].project_details.start);
                    }
                    result[ind].project_details.start_show = startDate;
                    let endDate = '...';
                    if (result[ind].project_details.end) {
                        endDate = time.momentToDate(result[ind].project_details.end)
                        result[ind].project_details.end = time.momentToDate(result[ind].project_details.end)
                    }
                    result[ind].project_details.end_show = endDate;
                }
                this.data.projects = result;
                if (this.dialog && this.editedIndex > -1) {
                    for (let ind in this.data.projects) {
                        if (this.data.projects[ind].training_id === this.itemID) {
                            this.editItem(this.data.projects[ind])
                            break
                        }
                    }
                }
            });

        },
        searchProjects (search) {
            let minimumLength = 3;
            if (search.length > minimumLength) {
                this.data.searchProjects = [];
                let personID = this.otherPersonId;
                let urlSubmit = 'api/people/' + personID + '/all-training-networks'
                                + '?';
                urlSubmit = urlSubmit + 'q=' + search;
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    for (let ind in result) {
                        result[ind].title_show = result[ind].title;
                        let startDate = '...';
                        if (result[ind].start) {
                            startDate = time.momentToDate(result[ind].start)
                            result[ind].start = time.momentToDate(result[ind].start);
                        }
                        result[ind].start_show = startDate;
                        let endDate = '...';
                        if (result[ind].end) {
                            endDate = time.momentToDate(result[ind].end)
                            result[ind].end = time.momentToDate(result[ind].end)
                        }
                        result[ind].end_show = endDate;
                    }

                    this.data.searchProjects = result;
                })
            } else {
                this.data.searchProjects = [];
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn
                && !this.$v.$invalid
            ) {
                this.progress = true;
                let personID = this.otherPersonId;

                let urlCreate = [
                    {
                        url: 'api/people/' + personID
                            + '/training-networks',
                        body: this.data.newProject,
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
                        this.data.newProject = {
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
                let projects = this.data.searchProjects;
                for (let ind in projects) {
                    if (projects[ind].to_associate) {
                        urlCreate.push({
                            url: 'api/people/' + personID
                                    + '/training-networks/' + projects[ind].id,
                            body: projects[ind],
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
                        this.searchProjects (this.search);
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
        getManagementEntities() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'management-entities';
                return subUtil.getPublicInfo(vm, urlSubmit, 'managementEntities');
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
        remove (list, item) {
            list.splice(list.indexOf(item), 1)
            list = [...list]
        },
        editItem (item) {
            this.dialog = true;
            this.editedIndex = this.data.projects.indexOf(item);
            this.editedItem = item;
            this.itemID = item.project_id;
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
            newProject: {
                amount: { integer },
                global_amount: { integer },
                notes: { maxLength: maxLength(500) }
            },
        },
    },
}
</script>

<style>

</style>