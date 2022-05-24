<template>
<v-card>
    <v-form ref="form"
                @submit.prevent="submitForm">
        <v-card-title>
            <span> Edit data for project
                    <b>{{ projectDetails.project_details.title }}</b>
            </span>
        </v-card-title>
        <v-card-text>
        </v-card-text>
        <v-container>
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
            <v-row>
                <v-col cols="12">
                    <v-checkbox
                        v-model="projectDetails.project_details.industry_project"
                        :false-value="0"
                        :true-value="1"
                        label="Project with industry and other private entities"
                    ></v-checkbox>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-text-field v-model="projectDetails.project_details.title"
                        label="Title"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="4" sm="2">
                    <v-text-field v-model="projectDetails.project_details.acronym"
                        label="Acronym"
                    ></v-text-field>
                </v-col>
                <v-col cols="8" sm="3">
                    <v-text-field v-model="projectDetails.project_details.reference"
                        label="Reference"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="3">
                    <v-text-field v-model="projectDetails.project_details.global_amount"
                        label="Global amount (€)"
                    ></v-text-field>
                </v-col>
                <v-col cols="6" sm="2">
                    <v-menu ref="date_menu"
                        v-model="projectDetails.project_details.show_start"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="$v.projectDetails.project_details.start.$model"
                                :error="$v.projectDetails.project_details.start.$error"
                                label="Start date" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="$v.projectDetails.project_details.start.$model"
                            @input="projectDetails.project_details.show_start = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="6" sm="2">
                    <v-menu ref="date_menu"
                        v-model="projectDetails.project_details.show_end"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="$v.projectDetails.project_details.end.$model"
                                :error="$v.projectDetails.project_details.end.$error"
                                label="End date" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="$v.projectDetails.project_details.end.$model"
                            @input="projectDetails.project_details.show_end = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="4" v-if="!otherFundingAgency">
                    <v-select v-model="projectDetails.project_details.funding_agencies"
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
                    <v-select v-model="projectDetails.project_details.funding_agencies"
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
                    <v-text-field v-model="projectDetails.project_details.other_funding_agencies.name"
                        label="Funding Agency"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-select v-model="projectDetails.project_details.management_entities.management_entity_id"
                        :items="managementEntities"
                        item-value="id"
                        item-text="official_name"
                        label="Management Entity">
                    </v-select>
                </v-col>

                <v-col cols="12" sm="3">
                    <v-text-field v-model="projectDetails.project_details.management_entities.amount"
                        label="Mngmt Entity Amount (€)"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-text-field v-model="projectDetails.project_details.website"
                        label="Website"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="4">
                    <v-row>
                        <v-col cols="12">
                            <v-select v-model="projectDetails.project_details.project_type_id"
                                :items="projectTypes"
                                item-value="id"
                                item-text="name"
                                label="Project type">
                            </v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-select v-model="projectDetails.project_details.call_type_id"
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
                        v-model="projectDetails.project_details.notes"
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
                        v-model="projectDetails.project_details.project_areas"
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
                                @click:close="remove(projectDetails.project_details.project_areas, item)"
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
                        <h3>LAQV/UCIBIO people associated with project</h3>
                    </v-row>
                    <v-row v-for="(person,i) in projectDetails.person_details"
                        :key="i"
                        align="center"
                    >
                        <v-col cols="12" sm="4">
                            <div v-if="person.id === 'new'"
                                class="mb-5"
                            >
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
                            </div>
                            <div v-else>
                                {{person.person_colloquial_name}}
                            </div>
                        </v-col>
                        <v-col cols="12" sm="3">
                            <v-select v-model="person.position_id"
                                :items="projectPositions"
                                item-value="id"
                                item-text="name_en"
                                label="Project Position">
                            </v-select>
                        </v-col>
                        <v-col cols="6" sm="2">
                            <v-menu ref="date_menu"
                                v-model="person.show_start"
                                :close-on-content-click="false"
                                :nudge-right="10"
                                transition="scale-transition"
                                offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="person.valid_from"
                                        label="Start date" v-on="on">
                                    </v-text-field>
                                </template>
                                <v-date-picker v-model="person.valid_from"
                                    @input="person.show_start = false"
                                    no-title
                                ></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="6" sm="2">
                            <v-menu ref="date_menu"
                                v-model="person.show_end"
                                :close-on-content-click="false"
                                :nudge-right="10"
                                transition="scale-transition"
                                offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="person.valid_until"
                                        label="End date" v-on="on">
                                    </v-text-field>
                                </template>
                                <v-date-picker v-model="person.valid_until"
                                    @input="person.show_end = false"
                                    no-title
                                ></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="1">
                            <v-btn icon @click="removeItem(projectDetails.person_details, i, 'person')">
                                <v-icon color="red darken">mdi-delete</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col cols="12">
                            <v-divider></v-divider>
                        </v-col>
                    </v-row>
                    <v-row justify="center">
                        <v-btn small outlined class="ml-12"
                            @click="addItem(projectDetails.person_details, 'person')">
                                Add person
                        </v-btn>
                    </v-row>
                </v-col>
                <v-divider vertical></v-divider>
                <v-col cols="12" sm="">
                    <v-row justify="center">
                        <h3>LAQV/UCIBIO teams associated with project</h3>
                    </v-row>
                    <v-row v-for="(lab,i) in projectDetails.labs_details"
                        :key="'labs-' + i"
                        align="center"
                    >
                        <v-col cols="12" sm="7">
                            <div v-if="lab.id === 'new'"
                                class="mb-5"
                            >
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
                            </div>
                            <div v-else>
                                {{lab.lab_name}}
                            </div>
                        </v-col>
                        <v-col cols="6" sm="2">
                            <v-menu ref="date_menu"
                                v-model="lab.show_start"
                                :close-on-content-click="false"
                                :nudge-right="10"
                                transition="scale-transition"
                                offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="lab.valid_from"
                                        label="Start date" v-on="on">
                                    </v-text-field>
                                </template>
                                <v-date-picker v-model="lab.valid_from"
                                    @input="lab.show_start = false"
                                    no-title
                                ></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="6" sm="2">
                            <v-menu ref="date_menu"
                                v-model="lab.show_end"
                                :close-on-content-click="false"
                                :nudge-right="10"
                                transition="scale-transition"
                                offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="lab.valid_until"
                                        label="End date" v-on="on">
                                    </v-text-field>
                                </template>
                                <v-date-picker v-model="lab.valid_until"
                                    @input="lab.show_end = false"
                                    no-title
                                ></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="1">
                            <v-btn icon @click="removeItem(projectDetails.labs_details, i, 'lab')">
                                <v-icon color="red darken">mdi-delete</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col cols="12">
                            <v-divider></v-divider>
                        </v-col>
                    </v-row>
                    <v-row justify="center">
                        <v-btn small outlined class="ml-12"
                            @click="addItem(projectDetails.labs_details, 'lab')">
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
        </v-container>
    </v-form>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

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
        projectData: Object,
        projectId: Number,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            projectDetails: {
                project_details: {
                    title: '',
                    start: null,
                    end: null,
                    management_entities: {},
                    funding_agencies: [],
                },
            },
            searchPeople: [],
            searchLabs: [],
            toDeletePerson: [],
            toDeleteLab: [],
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
    watch: {
        projectData () {
            this.initialize();
        },
    },
    mounted () {
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
    },
    methods: {
        initialize () {
            let personID = this.$store.state.session.personID;
            let urlSubmit = 'api/people/' + personID  + '/projects/' + this.projectId;
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then((result) => {
                if (result.length === 1) {
                    this.projectDetails = result[0];
                    this.projectDetails.project_details.start = time.momentToDate(this.projectDetails.project_details.start);
                    this.projectDetails.project_details.end = time.momentToDate(this.projectDetails.project_details.end);
                    for (let ind in this.projectDetails.person_details) {
                        this.projectDetails.person_details[ind].valid_from = time.momentToDate(this.projectDetails.person_details[ind].valid_from);
                        this.projectDetails.person_details[ind].valid_until = time.momentToDate(this.projectDetails.person_details[ind].valid_until);
                        this.searchPeople.push(null);

                    }
                    for (let ind in this.projectDetails.labs_details) {
                        this.projectDetails.labs_details[ind].valid_from = time.momentToDate(this.projectDetails.labs_details[ind].valid_from);
                        this.projectDetails.labs_details[ind].valid_until = time.momentToDate(this.projectDetails.labs_details[ind].valid_until);
                        this.searchLabs.push(null);

                    }
                    this.otherFundingAgency = false;
                    if ((this.projectDetails.project_details.funding_agencies.length === 0
                        || this.projectDetails.project_details.funding_agencies[0].id === 'other'
                        )
                        && this.projectDetails.project_details.other_funding_agencies.name !== null
                        && this.projectDetails.project_details.other_funding_agencies.name !== undefined
                        && this.projectDetails.project_details.other_funding_agencies.name !== ''
                    ) {
                        this.$set(this.projectDetails.project_details, 'funding_agencies',
                       [{id: 'other', official_name: 'Other'}])
                        this.otherFundingAgency = true;
                    }
                }
            })
        },
        submitForm () {
            if (this.$v.$invalid) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                if (this.$store.state.session.loggedIn) {
                    this.progress = true;
                    let personID = this.$store.state.session.personID;
                    if (this.projectDetails.project_details.funding_agencies.length === 1) {
                        if (this.projectDetails.project_details.funding_agencies[0].id === 'other') {
                            this.projectDetails.project_details.funding_agencies = [];
                            if (this.projectDetails.project_details.other_funding_agencies.name === ''
                                && this.projectDetails.project_details.other_funding_agencies.name === null
                                && this.projectDetails.project_details.other_funding_agencies.name === undefined
                            ) {
                                this.projectDetails.project_details.other_funding_agencies = {}
                            }
                        }
                    } else if (this.projectDetails.project_details.funding_agencies.length > 1) {
                        let fund_ag = [];
                        for (let ind in this.projectDetails.project_details.funding_agencies) {
                            if (this.projectDetails.project_details.funding_agencies[ind].id !== 'other' ) {
                                fund_ag.push(this.projectDetails.project_details.funding_agencies[ind])

                            }
                        }
                        this.projectDetails.project_details.funding_agencies = fund_ag;
                    }
                    this.projectDetails.toDeletePerson = this.toDeletePerson;
                    this.projectDetails.toDeleteLab = this.toDeleteLab;
                    let urlUpdate = [
                        {
                            url: 'api/people/' + personID
                                + '/projects/' + this.projectDetails.project_id,
                            body: this.projectDetails,
                        }
                    ];
                    Promise.all(urlUpdate.map(el =>
                        this.$http.put(el.url,
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
                            this.toDeletePerson = [];
                            this.toDeleteLab = [];
                            this.initialize();
                            this.$root.$emit('updatedProject')
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
            if (this.projectDetails.project_details.funding_agencies.length === 1
                && this.projectDetails.project_details.funding_agencies[0].id === 'other'
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
        removeItem(list, ind, type) {
            if (type === 'person') {
                if (list[ind].id !== 'new') {
                    this.toDeletePerson.push(list[ind]);
                }
            } else if (type === 'lab') {
                if (list[ind].id !== 'new') {
                    this.toDeleteLab.push(list[ind]);
                }
            }
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
    },
    validations: {
        projectDetails: {
            project_details: {
                start: { isValid: time.validate },
                end: { isValid: time.validate },
            }
        },
    },

}
</script>

<style>

</style>