<template>
<div>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">People you currently supervise</h3>
        </div>
    </v-card-title>
    <v-container>
        <v-form ref="form" class="my-2 ml-2"
            @submit.prevent="submitForm">
            <v-row>
                <v-col cols="6">
                    <v-btn
                        @click="showFromDB()"
                        outlined color="blue"
                    >
                        Add person already in DB
                    </v-btn>

                </v-col>
                <v-col cols="6" v-if="isLAQV">
                    <v-btn
                        @click="showPreRegister()"
                        outlined color="red"
                    >
                        Pre-register new member
                    </v-btn>

                </v-col>
            </v-row>
            <v-row v-if="addingFromDB" align-content="center">
                <v-col cols="12" sm="3">
                    <v-autocomplete
                        v-model="data.newStudent.person_id"
                        :items="people" item-value="id" item-text="colloquial_name"
                        :search-input.sync="searchPeople"
                        :filter="customSearch"
                        cache-items
                        flat
                        hide-no-data
                        hide-details
                        label="People">
                    </v-autocomplete>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-select v-model="data.newStudent.responsible_type_id"
                        :items="responsibleTypes" item-value="id" item-text="name_en"
                        label="Type">
                    </v-select>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-menu ref="date_menu"
                        v-model="data.newStudent.show_valid_from"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="data.newStudent.valid_from"
                                label="Start date" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="data.newStudent.valid_from"
                            @input="data.newStudent.show_valid_from = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-menu ref="menu_end_date"
                        v-model="data.newStudent.show_valid_until"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="data.newStudent.valid_until"
                                label="End date"
                                v-on="on"
                                v-bind="attrs"
                            >
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="data.newStudent.valid_until"
                            @input="data.newStudent.show_valid_until = false"
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
            </v-row>
            <v-row v-if="addingPreregistration && isLAQV" align-content="center">
                <v-col cols="12">
                    <v-row align-content="center">
                        <v-col cols="12" sm="2">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                        v-model="$v.data.newStudent.username.$model"
                                        :error="$v.data.newStudent.username.$error"
                                        v-bind="attrs"
                                        v-on="on"
                                        label="Username*"
                                    >
                                    </v-text-field>
                                </template>
                                To be used on credentials, e.g.: <i>johnsmith</i>
                            </v-tooltip>
                            <div v-if="$v.data.newStudent.username.$error">
                                <div v-if="!$v.data.newStudent.username.required">
                                    <p class="caption red--text">Username is required.</p>
                                </div>
                                <div v-if="!$v.data.newStudent.username.isUnique">
                                    <p class="caption red--text">Username already taken.</p>
                                </div>
                            </div>
                        </v-col>
                        <v-col cols="12" sm="2">
                            <v-text-field
                                v-model="$v.data.newStudent.email.$model"
                                :error="$v.data.newStudent.email.$error"
                                label="Email*"
                            >
                            </v-text-field>
                            <div v-if="$v.data.newStudent.email.$error">
                                <div v-if="!$v.data.newStudent.email.required">
                                    <p class="caption red--text">Email is required.</p>
                                </div>
                                <div v-if="!$v.data.newStudent.email.email">
                                    <p class="caption red--text">Not a valid email.</p>
                                </div>
                            </div>
                        </v-col>
                        <v-col cols="12" sm="2">
                            <v-select
                                v-model="$v.data.newStudent.city_id.$model"
                                :items="poles" item-value="id" item-text="city"
                                label="Pole*">
                            </v-select>
                            <div v-if="$v.data.newStudent.city_id.$error">
                                <div v-if="!$v.data.newStudent.city_id.required">
                                    <p class="caption red--text">Pole is required.</p>
                                </div>
                            </div>
                        </v-col>
                        <v-col cols="12" sm="3">
                            <v-select
                                v-model="$v.data.newStudent.lab_id.$model"
                                :items="myLabs" item-value="lab_id" item-text="lab_name"
                                label="Lab/Group*">
                            </v-select>
                            <div v-if="$v.data.newStudent.lab_id.$error">
                                <div v-if="!$v.data.newStudent.lab_id.required">
                                    <p class="caption red--text">Lab is required.</p>
                                </div>
                            </div>
                        </v-col>
                        <v-col cols="12" sm="3">
                            <v-select
                                v-model="$v.data.newStudent.lab_position_id.$model"
                                :items="labPositions" item-value="id" item-text="name_en"
                                label="Position*">
                            </v-select>
                            <div v-if="$v.data.newStudent.lab_position_id.$error">
                                <div v-if="!$v.data.newStudent.lab_position_id.required">
                                    <p class="caption red--text">Position is required.</p>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="2">
                            <v-text-field
                                v-model="$v.data.newStudent.dedication.$model"
                                :error="$v.data.newStudent.dedication.$error"
                                label="Dedication (%)"
                            >
                            </v-text-field>
                            <div v-if="$v.data.newStudent.dedication.$error">
                                <div v-if="!$v.data.newStudent.dedication.integer">
                                    <p class="caption red--text">Must be an integer.</p>
                                </div>
                                <div v-if="!$v.data.newStudent.dedication.between">
                                    <p class="caption red--text">Must be between 0 and 100.</p>
                                </div>
                            </div>
                        </v-col>
                        <v-col cols="12" sm="2">
                            <v-menu ref="date_menu"
                                v-model="data.newStudent.show_valid_from"
                                :close-on-content-click="false"
                                :nudge-right="10"
                                transition="scale-transition"
                                offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field
                                        v-model="$v.data.newStudent.valid_from.$model"
                                        label="Start date*" v-on="on">
                                    </v-text-field>
                                </template>
                                <v-date-picker
                                    v-model="$v.data.newStudent.valid_from.$model"
                                    @input="data.newStudent.show_valid_from = false"
                                    no-title
                                ></v-date-picker>
                            </v-menu>
                            <div v-if="$v.data.newStudent.valid_from.$error">
                                <div v-if="!$v.data.newStudent.valid_from.required">
                                    <p class="caption red--text">Date is required.</p>
                                </div>
                            </div>
                        </v-col>
                        <v-col cols="12" sm="2">
                            <v-menu ref="menu_end_date"
                                v-model="data.newStudent.show_valid_until"
                                :close-on-content-click="false"
                                :nudge-right="10"
                                transition="scale-transition"
                                offset-y min-width="290px">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="data.newStudent.valid_until"
                                        label="End date"
                                        v-on="on"
                                        v-bind="attrs"
                                    >
                                    </v-text-field>
                                </template>
                                <v-date-picker v-model="data.newStudent.valid_until"
                                    @input="data.newStudent.show_valid_until = false"
                                    no-title
                                ></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="3">
                            <v-checkbox
                                v-model="data.newStudent.must_be_added"
                                label="Add to the team reported to FCT/MCTES"
                            ></v-checkbox>
                        </v-col>
                        <v-col cols="2" align-self="center">
                            <v-row justify="end">
                                <v-btn @click="preRegister()"
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
                    </v-row>
                </v-col>
            </v-row>
        </v-form>
        <v-data-table
            item-key="id"
            :search="search"
            :headers="headers"
            :footer-props="footerProps"
            :items="data.students"
            :items-per-page="10"
            :sort-by="['name']"
            :sort-desc="[false]"
        >
            <template v-slot:top>
                <v-dialog v-model="dialog" max-width="1600px">
                    <StudentDetails
                        :item-id="editedItem.id"
                        :student-id="editedItem.person_id"
                        :student-data="editedItem"
                    >
                    </StudentDetails>
                </v-dialog>
            </template>
            <template v-slot:item.affiliations_show="{ item }">
                <span v-html="item.affiliations_show"></span>
            </template>
            <template v-slot:item.action="{ item }">
                <v-icon @click="editItem(item)">mdi-pencil</v-icon>
            </template>
        </v-data-table>
    </v-container>
</v-card>
<v-card class="mt-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Past supervisions</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container>
        <v-data-table
            item-key="id"
            :search="search"
            :headers="headers"
            :footer-props="footerProps"
            :items="data.pastStudents"
            :items-per-page="10"
            :sort-by="['name']"
            :sort-desc="[false]"
        >
            <template v-slot:top>
                <v-dialog v-model="dialogPast" max-width="1600px">
                    <StudentDetails
                        :item-id="editedItem.id"
                        :student-id="editedItem.person_id"
                        :student-data="editedItem"
                    >
                    </StudentDetails>
                </v-dialog>
            </template>
            <template v-slot:item.affiliations_show="{ item }">
                <span v-html="item.affiliations_show"></span>
            </template>
            <template v-slot:item.action="{ item }">
                <v-icon @click.stop="editItem(item)">mdi-pencil</v-icon>
            </template>
        </v-data-table>
    </v-container>
</v-card>
</div>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'
import { requiredIf, email, integer, between } from 'vuelidate/lib/validators'
const StudentDetails = () => import(/* webpackChunkName: "supervisor-student-details" */ './StudentDetails')

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
    components: {
        StudentDetails,
    },
    data() {
        return {
            dialog: false,
            dialogPast: false,
            editedIndex: -1,
            editedItem: {},
            progress: false,
            success: false,
            error: false,
            formError: false,
            newName: null,
            addingFromDB: false,
            addingPreregistration: false,
            isLAQV: false,
            roles: ['Scientific', 'Technical', 'Science Management', 'Administrative'],
            data: {
                newStudent: {
                    username: '',
                    email: '',
                    lab_id: null,
                    lab_position_id: null,
                    dedication: null,
                    city_id: null,
                    valid_from: null,
                },
                students: [],
                pastStudents: [],
            },
            search: '',
            headers: [
                { text: 'Name', value:'name' },
                { text: 'Type', value:'responsible_type_name_en' },
                { text: 'Dates', value:'supervising_dates_show' },
                { text: 'Affiliations', value:'affiliations_show' },
                { text: 'Actions', value: 'action', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            searchPeople: null,
            people: [],
            poles: [],
            myLabs: [],
            labs: [],
            labPositions: [],
            facilities: [],
            technicianPositions: [],
            scienceManagerOffices: [],
            scienceManagerPositions: [],
            administrativeOffices: [],
            administrativePositions: [],
            responsibleTypes: [],
            toCreate: [],
            toDelete: [],
        }
    },
    watch: {
        currentTab () {
            if (this.currentTab === '/person/productivity/supervisor') {
                this.initialize();
            }
        },
    },
    mounted() {
        this.initialize();
        this.getPoles();
        this.getResponsibleTypes();
        this.getLabs();
        this.getLabPositions();
        this.getFacilities();
        this.getTechnicianPositions();
        this.getScienceManagerPositions();
        this.getScienceManagerOffices();
        this.getAdministrativePositions();
        this.getAdministrativeOffices();
        this.getPeople();
        this.$root.$on('updateSupervisorTable',
            () => {
                this.initialize();
            }
        );
    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                if (this.$store.state.session.currentUnits.length === 1
                    && this.$store.state.session.currentUnits[0] === 2
                ) {
                    this.isLAQV = true;
                }
                this.data.students = [];
                this.data.pastStudents = [];
                let today = time.momentToDate(time.moment())
                let personID = this.$store.state.session.personID;
                let urlSubmit = 'api/people/' + personID + '/students';
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    for (let ind in result) {
                        let sup_valid_from = '...'
                        let sup_valid_until = '...'
                        if (result[ind].valid_from !== null) {
                            result[ind].valid_from = time.momentToDate(result[ind].valid_from);
                            sup_valid_from = result[ind].valid_from;

                        }
                        if (result[ind].valid_until !== null) {
                            result[ind].valid_until = time.momentToDate(result[ind].valid_until)
                            sup_valid_until = result[ind].valid_until;
                        }
                        result[ind].supervising_dates_show = sup_valid_from
                            + ' - ' + sup_valid_until;
                        let affiliations = '<ul>';
                        for (let indPos in result[ind].lab_data) {

                            let valid_from = '...'
                            let valid_until = '...'
                            if (result[ind].lab_data[indPos].valid_from !== null) {
                                valid_from = time.momentToDate(result[ind].lab_data[indPos].valid_from)
                            }
                            if (result[ind].lab_data[indPos].valid_until !== null) {
                                valid_until = time.momentToDate(result[ind].lab_data[indPos].valid_until)
                            }
                            result[ind].lab_data[indPos].valid_from = time.momentToDate(result[ind].lab_data[indPos].valid_from)
                            result[ind].lab_data[indPos].valid_until = time.momentToDate(result[ind].lab_data[indPos].valid_until)
                            affiliations = affiliations
                                + '<li>'
                                + result[ind].lab_data[indPos].lab_position_name_en
                                + ' (' +  valid_from
                                + ', ' + valid_until + '): '
                                + result[ind].lab_data[indPos].lab_name;
                            affiliations = affiliations + '@';
                            let counter = 0;
                            for (let indGroup in result[ind].lab_data[indPos].groups_units) {
                                if (counter > 0) { affiliations = affiliations + '/'; }
                                affiliations = affiliations + result[ind].lab_data[indPos].groups_units[indGroup].name;
                                counter++;
                            }
                            affiliations = affiliations + '@' + result[ind].lab_data[indPos].groups_units[0].unit_short_name;
                            affiliations = affiliations + '</li>'
                        }
                        for (let indPos in result[ind].technician_data) {
                            let valid_from = '...'
                            let valid_until = '...'
                            if (result[ind].technician_data[indPos].valid_from !== null) {
                                valid_from = time.momentToDate(result[ind].technician_data[indPos].valid_from)
                            }
                            if (result[ind].technician_data[indPos].valid_until !== null) {
                                valid_until = time.momentToDate(result[ind].technician_data[indPos].valid_until)
                            }
                            result[ind].technician_data[indPos].valid_from = time.momentToDate(result[ind].technician_data[indPos].valid_from)
                            result[ind].technician_data[indPos].valid_until = time.momentToDate(result[ind].technician_data[indPos].valid_until)
                            affiliations = affiliations
                                + '<li>'
                                + result[ind].technician_data[indPos].technician_position_name_en
                                + ' (' +  valid_from
                                + ', ' + valid_until + '): '
                                + result[ind].technician_data[indPos].technician_office_name_en
                                + '@' + result[ind].technician_data[indPos].unit_short_name
                                + '</li>'
                        }
                        for (let indPos in result[ind].science_manager_data) {
                            let valid_from = '...'
                            let valid_until = '...'
                            if (result[ind].science_manager_data[indPos].valid_from !== null) {
                                valid_from = time.momentToDate(result[ind].science_manager_data[indPos].valid_from)
                            }
                            if (result[ind].science_manager_data[indPos].valid_until !== null) {
                                valid_until = time.momentToDate(result[ind].science_manager_data[indPos].valid_until)
                            }
                            result[ind].science_manager_data[indPos].valid_from = time.momentToDate(result[ind].science_manager_data[indPos].valid_from)
                            result[ind].science_manager_data[indPos].valid_until = time.momentToDate(result[ind].science_manager_data[indPos].valid_until)
                            affiliations = affiliations
                                + '<li>'
                                + result[ind].science_manager_data[indPos].science_manager_position_name_en
                                + ' (' +  valid_from
                                + ', ' + valid_until + '): '
                                + result[ind].science_manager_data[indPos].science_manager_office_name_en
                                + '@' + result[ind].science_manager_data[indPos].unit_short_name
                                + '</li>'
                        }
                        for (let indPos in result[ind].administrative_data) {
                            let valid_from = '...'
                            let valid_until = '...'
                            if (result[ind].administrative_data[indPos].valid_from !== null) {
                                valid_from = time.momentToDate(result[ind].administrative_data[indPos].valid_from)
                            }
                            if (result[ind].administrative_data[indPos].valid_until !== null) {
                                valid_until = time.momentToDate(result[ind].administrative_data[indPos].valid_until)
                            }
                            result[ind].administrative_data[indPos].valid_from = time.momentToDate(result[ind].administrative_data[indPos].valid_from)
                            result[ind].administrative_data[indPos].valid_until = time.momentToDate(result[ind].administrative_data[indPos].valid_until)
                            affiliations = affiliations
                                + '<li>'
                                + result[ind].administrative_data[indPos].administrative_position_name_en
                                + ' (' +  valid_from
                                + ', ' + valid_until + '): '
                                + result[ind].administrative_data[indPos].administrative_office_name_en
                                + '@' + result[ind].administrative_data[indPos].unit_short_name
                                + '</li>'
                        }
                        affiliations = affiliations + '</ul>'
                        result[ind].affiliations_show = affiliations;
                        if (
                            (result[ind].valid_from === null || result[ind].valid_from <= today)
                            && (result[ind].valid_until === null || result[ind].valid_until >= today)
                        ) {
                            this.data.students.push(result[ind]);
                        } else {
                            this.data.pastStudents.push(result[ind]);
                        }
                    }
                })
                subUtil.getInfoPopulate(this, 'api/people/' + personID + '/lab-affiliations', true)
                .then( (result2) => {
                    this.myLabs = result2;
                })
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreate = [];
                let personID = this.$store.state.session.personID;
                urlCreate.push({
                    url: 'api/people/' + personID
                        + '/students',
                    body: this.data.newStudent,
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
                    this.toDeleteLabPositions = []; // add the others
                    this.data.newStudent = {}
                    this.addingFromDB = false;
                    this.initialize();
                }))
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        preRegister () {
            if (this.$v.$invalid) {
                this.$v.$touch()
            } else {
                this.progress = true;
                let urlCreate = [];
                this.data.newStudent.changedBy = this.$store.state.session.userID;
                urlCreate.push({
                    url: 'api/people/' + this.$store.state.session.personID
                            + '/pre-register-student/' + this.data.newStudent.lab_id,
                    body: this.data.newStudent,
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
                        setTimeout(() => {
                            this.success = false;
                            //this.$refs.form.reset();
                        }, 1500);
                        this.data.newStudent = {
                            username: '',
                            email: '',
                            lab_id: null,
                            lab_position_id: null,
                            dedication: null,
                            city_id: null,
                            valid_from: null,
                        };
                    }))
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
        getPoles() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'poles';
                return subUtil.getPublicInfo(vm, urlSubmit, 'poles');
            }
        },
        getResponsibleTypes() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'responsible-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'responsibleTypes');
            }
        },
        getLabs() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'labs';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labs');
            }
        },
        getLabPositions () {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'lab-positions';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labPositions');
            }
        },
        getFacilities() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'facilities';
                return subUtil.getPublicInfo(vm, urlSubmit, 'facilities');
            }
        },
        getTechnicianPositions() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'technician-positions';
                return subUtil.getPublicInfo(vm, urlSubmit, 'technicianPositions');
            }
        },
        getScienceManagerPositions() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'science-manager-positions';
                return subUtil.getPublicInfo(vm, urlSubmit, 'scienceManagerPositions');
            }
        },
        getScienceManagerOffices() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'science-management-offices';
                return subUtil.getPublicInfo(vm, urlSubmit, 'scienceManagerOffices');
            }
        },
        getAdministrativePositions() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'administrative-positions';
                return subUtil.getPublicInfo(vm, urlSubmit, 'administrativePositions');
            }
        },
        getAdministrativeOffices() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'administrative-offices';
                return subUtil.getPublicInfo(vm, urlSubmit, 'administrativeOffices');
            }
        },
        showFromDB () {
            this.addingFromDB = !this.addingFromDB;
            this.addingPreregistration = false;
            this.data.newStudent = {
                    username: '',
                    email: '',
                    lab_id: null,
                    lab_position_id: null,
                    dedication: null,
                    city_id: null,
                    valid_from: null,
                    valid_until: null,
                };
        },
        showPreRegister () {
            this.addingPreregistration = !this.addingPreregistration;
            this.addingFromDB = false;
            this.data.newStudent = {
                    username: '',
                    email: '',
                    lab_id: null,
                    lab_position_id: null,
                    dedication: null,
                    city_id: null,
                    valid_from: null,
                    valid_until: null,
                };
        },
        editItem (item) {
            this.dialog = true;
            this.editedIndex = this.data.students.indexOf(item);
            this.editedItem = item;
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
            newStudent: {
                username: {
                    required:
                        requiredIf(function () { return this.addingPreregistration}),
                        isUnique (value) {
                            if (this.$store.state.session.loggedIn && value !== undefined) {
                                if (value.length > 0) {
                                    let urlSubmit = 'api/people/' + this.$store.state.session.personID
                                        + '/users/' + value;
                                    return subUtil.getInfoPopulate(this, urlSubmit, true, true)
                                    .then( (result) => {
                                        // only works if this.data and result have the same keys
                                        return result.valid;
                                    })
                                    .catch((error) => {
                                        console.log(error)
                                        return false;
                                    });
                                } else {
                                    return true;
                                }
                            } else {
                                return false;
                            }
                        },
                },
                email: {
                    required: requiredIf(function () { return this.addingPreregistration}),
                    email },
                lab_id: { required: requiredIf(function () { return this.addingPreregistration}), },
                lab_position_id: { required: requiredIf(function () { return this.addingPreregistration}), },
                dedication: { integer, between: between(0,100)},
                city_id: { required: requiredIf(function () { return this.addingPreregistration}), },
                valid_from: { required: requiredIf(function () { return this.addingPreregistration}), }
            }
        }
    },
}
</script>

<style scoped>

</style>