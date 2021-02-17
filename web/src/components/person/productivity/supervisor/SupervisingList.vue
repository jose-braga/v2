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
                <v-col cols="12">
                    <v-btn
                        @click="showNewStudent()"
                        outlined color="blue"
                    >
                        Add person supervised
                    </v-btn>

                </v-col>
            </v-row>
            <v-row v-if="addingNewStudent" align-content="center">
                <v-col cols="12" sm="4">
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
                            @click="data.newStudent.show_valid_until = false"
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
            addingNewStudent: false,
            roles: ['Scientific', 'Technical', 'Science Management', 'Administrative'],
            data: {
                newStudent: {},
                students: [],
                pastStudents: [],
            },
            search: '',
            headers: [
                { text: 'Name', value:'name' },
                { text: 'Dates', value:'supervising_dates_show' },
                { text: 'Affiliations', value:'affiliations_show' },
                { text: 'Actions', value: 'action', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            searchPeople: null,
            people: [],
            myLabs: [],
            labs: [],
            labPositions: [],
            facilities: [],
            technicianPositions: [],
            scienceManagerOffices: [],
            scienceManagerPositions: [],
            administrativeOffices: [],
            administrativePositions: [],
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
                    this.addingNewStudent = false;
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
        showNewStudent () {
            this.addingNewStudent = true;
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
}
</script>

<style scoped>

</style>