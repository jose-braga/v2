<template>
<v-card flat>
    <v-container>
        <v-data-table
            item-key="id"
            :headers="headers"
            :footer-props="footerProps"
            :items="data.projects"
            :items-per-page="10"

            :sort-by="['project_details.end_show', 'project_details.start_show', 'project_details.title']"
            :sort-desc="[true, true, false]"
            multi-sort

            class='mt-4'
        >
            <template v-slot:top>
                <v-dialog v-model="dialog" max-width="1600px">
                    <ProjectDetails
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
                        Add new project
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span> New Project data </span>
                    </v-card-title>
                    <v-container>
                        <v-form ref="form"
                            @submit.prevent="submitForm">
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model="$v.data.newProject.title.$model"
                                        :error="$v.data.newProject.title.$error"
                                        label="Title"
                                    ></v-text-field>
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
                                    <v-text-field
                                        v-model="$v.data.newProject.global_amount.$model"
                                        :error="$v.data.newProject.global_amount.$error"
                                        label="Global amount (€)"
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
                                            <v-text-field v-model="$v.data.newProject.start.$model"
                                                :error="$v.data.newProject.start.$error"
                                                label="Start date" v-on="on">
                                            </v-text-field>
                                        </template>
                                        <v-date-picker v-model="$v.data.newProject.start.$model"
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
                                            <v-text-field v-model="$v.data.newProject.end.$model"
                                                :error="$v.data.newProject.end.$error"
                                                label="End date" v-on="on">
                                            </v-text-field>
                                        </template>
                                        <v-date-picker v-model="$v.data.newProject.end.$model"
                                            @input="data.newProject.show_end = false"
                                            no-title
                                        ></v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="4" v-if="!otherFundingAgency">
                                    <v-select v-model="data.newProject.funding_agencies"
                                        return-object
                                        multiple
                                        :items="fundingAgencies"
                                        item-value="id"
                                        item-text="official_name"
                                        @change="checkIfIsOther()"
                                        label="Funding Agencies">
                                    </v-select>
                                </v-col>
                                <v-col cols="12" sm="1" v-if="otherFundingAgency">
                                    <v-select v-model="data.newProject.funding_agencies"
                                        return-object
                                        multiple
                                        :items="fundingAgencies"
                                        item-value="id"
                                        item-text="official_name"
                                        @change="checkIfIsOther()"
                                        label="Funding Agencies">
                                    </v-select>
                                </v-col>
                                <v-col cols="12" sm="3" v-if="otherFundingAgency">
                                    <v-text-field v-model="data.newProject.other_funding_agencies.name"
                                        label="Funding Agency"
                                    ></v-text-field>
                                </v-col>
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

                            </v-row>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="data.newProject.website"
                                        label="Website"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="4">
                                    <v-row>
                                        <v-col cols="12">
                                            <v-select v-model="data.newProject.project_type_id"
                                                :items="projectTypes"
                                                item-value="id"
                                                item-text="name"
                                                label="Project type">
                                            </v-select>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-select v-model="data.newProject.call_type_id"
                                                :items="callTypes"
                                                item-value="id"
                                                item-text="name"
                                                label="Call type">
                                            </v-select>
                                        </v-col>
                                    </v-row>
                                </v-col>
                                <v-col cols="12" sm="8">
                                    <v-textarea
                                        v-model="data.newProject.notes"
                                        rows="4"
                                        counter
                                        label="Notes (500 ca)">
                                    </v-textarea>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12">
                                    <h3>Project areas (press 'return' after each keyword)</h3>
                                </v-col>
                                <v-col cols="12">
                                    <v-combobox
                                        v-model="data.newProject.project_areas"
                                        append-icon
                                        chips
                                        label="Project areas"
                                        multiple
                                        solo
                                    >
                                        <template v-slot:selection="{ attrs, item, select, selected }">
                                            <v-chip
                                                v-bind="attrs"
                                                :input-value="selected"
                                                close
                                                @click="select"
                                                @click:close="remove(data.newProject.project_areas, item)"
                                            >
                                                <strong>{{ item }}</strong>
                                            </v-chip>
                                        </template>
                                    </v-combobox>
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
                                        <h3>Labs associated with project</h3>
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
            <p class="mt-2"> To avoid duplicates, please search below to find if project isn't
                already in the database. This icon <v-icon>mdi-factory</v-icon> tags
                a project with industry (or other private entities). The search will yield
                results for both industry projects and other types of funding.
            </p>
        </v-row>
    </v-container>
</v-card>
</template>

<script>
import { integer, maxLength } from 'vuelidate/lib/validators'
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

import ProjectDetails from './ProjectDetails'

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
        ProjectDetails,
    },

    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            dialog: false,
            dialogNewProject: false,
            itemID: undefined,
            editedIndex: -1,
            editedItem: {},
            headers: [
                { text: 'Title', value:'project_details.title' },
                { text: 'Start', value:'project_details.start_show' },
                { text: 'End', value:'project_details.end_show' },
                //{ text: 'To add', value: 'associate', sortable: false},
                { text: 'Details', value: 'details', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                newProject: {
                    title: '',
                    amount: null,
                    global_amount: null,
                    notes: null,
                    start: null,
                    end: null,
                    funding_agencies: [],
                    other_funding_agencies: {},
                    management_entities: {},
                    person_details: [{person_id: this.$store.state.session.personID}],
                    labs_details: [],
                },
                projects: [],
            },
            searchPeople: [],
            searchLabs: [],
            otherFundingAgency: false,
            people: [],
            fundingAgencies : [],
            managementEntities : [],
            projectTypes: [],
            callTypes: [],
            projectPositions: [],
            labs: [],
        }
    },
    mounted() {
        this.initialize();
        this.getPeople();
        this.getManagementEntities();
        this.getFundingAgencies()
        .then(() => {
            this.fundingAgencies.unshift({id: 'other', official_name: 'Other'})
        })
        ;
        this.getProjectTypes();
        this.getProjectCallTypes();
        this.getLabs();
        this.getProjectPersonPositions();
        this.$root.$on('updatedProject',
            () => {
                this.initialize();
            }
        );
        this.$root.$on('addedProjectToDB',
            () => {
                this.initialize();
            }
        );
    },
    watch: {
        currentTab () {
            if (this.currentTab === '/person/productivity/projects') {
                this.initialize();
            }
        },
    },
    methods: {
        initialize () {
            let personID = this.$store.state.session.personID;
            let urlSubmit = 'api/people/' + personID  + '/projects';
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
            });

        },
        submitForm () {
            if (this.$v.$invalid) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                if (this.$store.state.session.loggedIn) {
                    this.progress = true;
                    let personID = this.$store.state.session.personID;
                    if (this.data.newProject.funding_agencies.length === 1) {
                        if (this.data.newProject.funding_agencies[0].id === 'other') {
                            this.data.newProject.funding_agencies = [];
                            if (this.data.newProject.other_funding_agencies.name === ''
                                && this.data.newProject.other_funding_agencies.name === null
                                && this.data.newProject.other_funding_agencies.name === undefined
                            ) {
                                this.data.newProject.other_funding_agencies = {}
                            }
                        }
                    } else if (this.data.newProject.funding_agencies.length > 1) {
                        let fund_ag = [];
                        for (let ind in this.data.newProject.funding_agencies) {
                            if (this.data.newProject.funding_agencies[ind].id !== 'other' ) {
                                fund_ag.push(this.data.newProject.funding_agencies[ind]);
                            }
                        }
                        this.data.newProject.funding_agencies = fund_ag;
                    }
                    let urlCreate = [
                        {
                            url: 'api/people/' + personID
                                + '/manual-projects/',
                            body: this.data.newProject,
                        }
                    ];
                    Promise.all(urlCreate.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers: {'Authorization': 'Bearer ' + localStorage['v2-token'] },}
                        )
                    ))
                    .then(() => {
                        this.progress = false;
                        this.success = true;
                        setTimeout(() => {
                            this.success = false;
                            this.otherFundingAgency = false;
                            this.data.newProject = {
                                title: '',
                                amount: null,
                                global_amount: null,
                                notes: null,
                                funding_agencies: [],
                                other_funding_agencies: {},
                                management_entities: {},
                                person_details: [{person_id: this.$store.state.session.personID}],
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
        getPeople () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'people-simple';
            return subUtil.getPublicInfo(vm, urlSubmit, 'people');
        },
        getManagementEntities() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'management-entities';
                return subUtil.getPublicInfo(vm, urlSubmit, 'managementEntities');
            }
        },
        getFundingAgencies() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'funding-agencies';
                return subUtil.getPublicInfo(vm, urlSubmit, 'fundingAgencies');
            }
        },
        getProjectTypes() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'project-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'projectTypes');
            }
        },
        getProjectCallTypes() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'project-call-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'callTypes');
            }
        },
        getProjectPersonPositions() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'project-person-positions';
                return subUtil.getPublicInfo(vm, urlSubmit, 'projectPositions');
            }
        },
        getLabs() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'labs';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labs');
            }
        },
        checkIfIsOther () {
            if (this.data.newProject.funding_agencies.length === 1
                && this.data.newProject.funding_agencies[0].id === 'other'
            ) {
                this.otherFundingAgency = true;
            } else {
                this.otherFundingAgency = false;
            }
        },
        addItem(list, type) {
            if (type === 'person') {
                list.push({
                    id: 'new',
                    position_id: null,
                    valid_from: null,
                    valid_until: null,
                });
                this.searchPeople.push(null);
            } else if (type === 'lab') {
                list.push({
                    id: 'new',
                    valid_from: null,
                    valid_until: null,
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
        editItem (item) {
            this.dialog = true;
            this.editedIndex = this.data.projects.indexOf(item);
            this.editedItem = item;
            this.itemID = item.project_id;
        },
    },
    validations: {
        data: {
            newProject: {
                title: { maxLength: maxLength(200) },
                amount: { integer },
                global_amount: { integer },
                notes: { maxLength: maxLength(500) },
                start: { isValid: time.validate },
                end: { isValid: time.validate },
            },
        },
    },
}
</script>

<style scoped>

</style>