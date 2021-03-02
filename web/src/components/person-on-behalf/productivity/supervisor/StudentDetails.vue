<template>
<v-card>
    <v-form @submit.prevent="submitForm(studentDetails)">
        <v-card-title>
            <span> Edit data for
                    <b>{{ studentDetails.name }}</b>
            </span>
        </v-card-title>
        <v-container>
            <v-expansion-panels>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h2>Affiliations to labs, facilities & other offices</h2>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <h3>Affiliations to Research Labs/Groups</h3>
                        <v-row align-content="center" justify="start">
                            <v-col cols="4">
                                <v-row justify="center">
                                    <v-btn
                                        @click.stop="addItem(studentDetails.lab_data,'lab')"
                                        outlined color="black"
                                    >
                                        Add lab position
                                    </v-btn>
                                </v-row>
                            </v-col>
                        </v-row>
                        <v-row v-for="(position, i) in studentDetails.lab_data"
                            :key="i"
                        >
                            <v-col cols="12" sm="3">
                                <v-select v-model="position.lab_id" v-if="position.id !== 'new'"
                                    :items="labs" item-value="id" item-text="name"
                                    disabled
                                    label="Lab/Group">
                                </v-select>
                                <v-select v-model="position.lab_id" v-else
                                    :items="myLabs" item-value="lab_id" item-text="lab_name"
                                    label="Lab/Group">
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="3">
                                <v-select v-model="position.lab_position_id"
                                    :items="labPositions" item-value="id" item-text="name_en"
                                    :disabled="position.can_edit !== true"
                                    label="Position">
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="1">
                                <v-text-field
                                    v-model="position.dedication"
                                    :disabled="position.can_edit !== true"
                                    label="Dedication">
                                </v-text-field>
                            </v-col>
                            <v-col cols="12" sm="2">
                                <v-menu ref="date_menu"
                                    v-model="position.show_valid_from"
                                    :close-on-content-click="false"
                                    :nudge-right="10"
                                    transition="scale-transition"
                                    offset-y min-width="290px">
                                    <template v-slot:activator="{ on }">
                                        <v-text-field v-model="position.valid_from"
                                            :disabled="position.can_edit !== true"
                                            label="Start date" v-on="on">
                                        </v-text-field>
                                    </template>
                                    <v-date-picker v-model="position.valid_from"
                                        @input="position.show_valid_from = false"
                                        no-title
                                    ></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="12" sm="2">
                                <v-menu ref="menu_end_date"
                                    v-model="position.show_valid_until"
                                    :close-on-content-click="false"
                                    :nudge-right="10"
                                    transition="scale-transition"
                                    offset-y min-width="290px">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field v-model="position.valid_until"
                                            :disabled="position.can_edit !== true"
                                            label="End date"
                                            v-on="on"
                                            v-bind="attrs"
                                        >
                                        </v-text-field>
                                    </template>
                                    <v-date-picker v-model="position.valid_until"
                                        @click="position.show_valid_until = false"
                                        no-title
                                    ></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="12" sm="1" v-if="position.can_edit">
                                <v-btn icon @click.stop="removeItem(studentDetails.lab_data, i, 'lab')" class="mt-3">
                                    <v-icon color="red darken">mdi-delete</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                        <h3 class="mt-4">Affiliations to Facilities</h3>
                        <v-row align-content="center" justify="start">
                            <v-col cols="4">
                                <v-row justify="center">
                                    <v-btn
                                        @click.stop="addItem(studentDetails.technician_data,'facility')"
                                        outlined color="black"
                                    >
                                        Add facility position
                                    </v-btn>
                                </v-row>
                            </v-col>
                        </v-row>
                        <v-row v-for="(position, i) in studentDetails.technician_data"
                            :key="'technician' + '-' +  i"
                        >
                            <v-col cols="12" sm="2">
                                <v-select v-model="position.technician_office_id"
                                    :items="facilities" item-value="id" item-text="name_en"
                                    label="Facility">
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="2">
                                <v-select v-model="position.unit_id"
                                    :items="units" item-value="id" item-text="short_name"
                                    label="Unit">
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="2">
                                <v-select v-model="position.technician_position_id"
                                    :items="technicianPositions" item-value="id" item-text="name_en"
                                    label="Position">
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="1">
                                <v-text-field
                                    v-model="position.dedication"
                                    label="Dedication">
                                </v-text-field>
                            </v-col>
                            <v-col cols="12" sm="2">
                                <v-menu ref="date_menu"
                                    v-model="position.show_valid_from"
                                    :close-on-content-click="false"
                                    :nudge-right="10"
                                    transition="scale-transition"
                                    offset-y min-width="290px">
                                    <template v-slot:activator="{ on }">
                                        <v-text-field v-model="position.valid_from"
                                            label="Start date" v-on="on">
                                        </v-text-field>
                                    </template>
                                    <v-date-picker v-model="position.valid_from"
                                        @input="position.show_valid_from = false"
                                        no-title
                                    ></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="12" sm="2">
                                <v-menu ref="menu_end_date"
                                    v-model="position.show_valid_until"
                                    :close-on-content-click="false"
                                    :nudge-right="10"
                                    transition="scale-transition"
                                    offset-y min-width="290px">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field v-model="position.valid_until"
                                            label="End date"
                                            v-on="on"
                                            v-bind="attrs"
                                        >
                                        </v-text-field>
                                    </template>
                                    <v-date-picker v-model="position.valid_until"
                                        @click="position.show_valid_until = false"
                                        no-title
                                    ></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="12" sm="1">
                                <v-btn icon @click.stop="removeItem(studentDetails.technician_data, i, 'facility')" class="mt-3">
                                    <v-icon color="red darken">mdi-delete</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                        <h3 class="mt-4">Affiliations to Science Management Offices</h3>
                        <v-row align-content="center" justify="start">
                            <v-col cols="4">
                                <v-row justify="center">
                                    <v-btn
                                        @click.stop="addItem(studentDetails.science_manager_data,'science-management')"
                                        outlined color="black"
                                    >
                                        Add science management position
                                    </v-btn>
                                </v-row>
                            </v-col>
                        </v-row>
                        <v-row v-for="(position, i) in studentDetails.science_manager_data"
                            :key="'sc-man' + '-' +  i"
                        >
                            <v-col cols="12" sm="2">
                                <v-select v-model="position.science_manager_office_id"
                                    :items="scienceManagerOffices" item-value="id" item-text="name_en"
                                    label="Sc. Man. Office">
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="2">
                                <v-select v-model="position.unit_id"
                                    :items="units" item-value="id" item-text="short_name"
                                    label="Unit">
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="2">
                                <v-select v-model="position.science_manager_position_id"
                                    :items="scienceManagerPositions" item-value="id" item-text="name_en"
                                    label="Position">
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="1">
                                <v-text-field
                                    v-model="position.dedication"
                                    label="Dedication">
                                </v-text-field>
                            </v-col>
                            <v-col cols="12" sm="2">
                                <v-menu ref="date_menu"
                                    v-model="position.show_valid_from"
                                    :close-on-content-click="false"
                                    :nudge-right="10"
                                    transition="scale-transition"
                                    offset-y min-width="290px">
                                    <template v-slot:activator="{ on }">
                                        <v-text-field v-model="position.valid_from"
                                            label="Start date" v-on="on">
                                        </v-text-field>
                                    </template>
                                    <v-date-picker v-model="position.valid_from"
                                        @input="position.show_valid_from = false"
                                        no-title
                                    ></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="12" sm="2">
                                <v-menu ref="menu_end_date"
                                    v-model="position.show_valid_until"
                                    :close-on-content-click="false"
                                    :nudge-right="10"
                                    transition="scale-transition"
                                    offset-y min-width="290px">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field v-model="position.valid_until"
                                            label="End date"
                                            v-on="on"
                                            v-bind="attrs"
                                        >
                                        </v-text-field>
                                    </template>
                                    <v-date-picker v-model="position.valid_until"
                                        @click="position.show_valid_until = false"
                                        no-title
                                    ></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="12" sm="1">
                                <v-btn icon @click.stop="removeItem(studentDetails.science_manager_data, i, 'science-management')" class="mt-3">
                                    <v-icon color="red darken">mdi-delete</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                        <h3 class="mt-4">Affiliations to Administrative Offices </h3>
                        <v-row align-content="center" justify="start">
                            <v-col cols="4">
                                <v-row justify="center">
                                    <v-btn
                                        @click.stop="addItem(studentDetails.administrative_data,'administrative')"
                                        outlined color="black"
                                    >
                                        Add administrative position
                                    </v-btn>
                                </v-row>
                            </v-col>
                        </v-row>
                        <v-row v-for="(position, i) in studentDetails.administrative_data"
                            :key="'administrative' + '-' +  i"
                        >
                            <v-col cols="12" sm="2">
                                <v-select v-model="position.administrative_office_id"
                                    :items="administrativeOffices" item-value="id" item-text="name_en"
                                    label="Office">
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="2">
                                <v-select v-model="position.unit_id"
                                    :items="units" item-value="id" item-text="short_name"
                                    label="Unit">
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="2">
                                <v-select v-model="position.administrative_position_id"
                                    :items="administrativePositions" item-value="id" item-text="name_en"
                                    label="Position">
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="1">
                                <v-text-field
                                    v-model="position.dedication"
                                    label="Dedication">
                                </v-text-field>
                            </v-col>
                            <v-col cols="12" sm="2">
                                <v-menu ref="date_menu"
                                    v-model="position.show_valid_from"
                                    :close-on-content-click="false"
                                    :nudge-right="10"
                                    transition="scale-transition"
                                    offset-y min-width="290px">
                                    <template v-slot:activator="{ on }">
                                        <v-text-field v-model="position.valid_from"
                                            label="Start date" v-on="on">
                                        </v-text-field>
                                    </template>
                                    <v-date-picker v-model="position.valid_from"
                                        @input="position.show_valid_from = false"
                                        no-title
                                    ></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="12" sm="2">
                                <v-menu ref="menu_end_date"
                                    v-model="position.show_valid_until"
                                    :close-on-content-click="false"
                                    :nudge-right="10"
                                    transition="scale-transition"
                                    offset-y min-width="290px">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field v-model="position.valid_until"
                                            label="End date"
                                            v-on="on"
                                            v-bind="attrs"
                                        >
                                        </v-text-field>
                                    </template>
                                    <v-date-picker v-model="position.valid_until"
                                        @click="position.show_valid_until = false"
                                        no-title
                                    ></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="12" sm="1">
                                <v-btn icon @click.stop="removeItem(studentDetails.administrative_data, i, 'administrative')" class="mt-3">
                                    <v-icon color="red darken">mdi-delete</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h2>Supervisors</h2>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <ul v-for="(supervisor, i) in studentDetails.supervisors"
                            :key="'supervisors' + i"
                        >
                            <li v-if="supervisor.can_edit">
                                <v-row align="center">
                                    <v-col cols="12" sm="3">
                                        {{supervisor.colloquial_name}}:
                                    </v-col>
                                    <v-col cols="5" sm="2">
                                        <v-menu ref="date_menu"
                                            v-model="supervisor.show_valid_from"
                                            :close-on-content-click="false"
                                            :nudge-right="10"
                                            transition="scale-transition"
                                            offset-y min-width="290px">
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="supervisor.valid_from"
                                                    label="Start date" v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker v-model="supervisor.valid_from"
                                                @input="supervisor.show_valid_from = false"
                                                no-title
                                            ></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                    <v-col cols="5" sm="2">
                                        <v-menu ref="date_menu"
                                            v-model="supervisor.show_valid_until"
                                            :close-on-content-click="false"
                                            :nudge-right="10"
                                            transition="scale-transition"
                                            offset-y min-width="290px">
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="supervisor.valid_until"
                                                    label="End date" v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker v-model="supervisor.valid_until"
                                                @input="supervisor.show_valid_until = false"
                                                no-title
                                            ></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                    <v-col cols="2" sm="1">
                                        <v-btn icon @click.stop="removeItem(studentDetails.supervisors, i, 'supervisor')">
                                            <v-icon color="red darken">mdi-delete</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </li>
                            <li v-else>
                                {{supervisor.colloquial_name}}: {{supervisor.valid_from_show}} - {{supervisor.valid_until_show}}
                            </li>
                        </ul>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
            <v-row align-content="center" justify="end">
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Update</v-btn>
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
        </v-container>
    </v-form>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

export default {
    props: {
        itemId: Number,
        studentId: Number,
        studentData: Object,
        otherPersonId: Number,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            studentDetails: {
                name: '',
                lab_data:[],
                technician_data:[],
                science_manager_data:[],
                administrative_data:[],
            },
            toDeleteLabPositions: [],
            toDeleteFacilityPositions: [],
            toDeleteScienceManagementPositions: [],
            toDeleteAdministrativePositions: [],
            toDeleteSupervisors: [],
            units: [],
            labs: [],
            myLabs: [],
            labPositions: [],
            facilities: [],
            technicianPositions: [],
            scienceManagerOffices: [],
            scienceManagerPositions: [],
            administrativeOffices: [],
            administrativePositions: [],
        }
    },
    watch: {
        itemId () {
            this.initialize();
        },
    },
    mounted() {
        this.initialize();
        this.getLabs();
        this.getUnits();
        this.getLabPositions();
        this.getFacilities();
        this.getTechnicianPositions();
        this.getScienceManagerPositions();
        this.getScienceManagerOffices();
        this.getAdministrativePositions();
        this.getAdministrativeOffices();
    },
    methods: {
        initialize () {
            this.$set(this.studentDetails, 'name', this.studentData.name);
            this.studentDetails.lab_data = [];
            for (let ind in this.studentData.lab_data) {
                this.studentDetails.lab_data.push(this.studentData.lab_data[ind])
            }
            this.studentDetails.technician_data = [];
            for (let ind in this.studentData.technician_data) {
                this.studentDetails.technician_data.push(this.studentData.technician_data[ind])
            }
            this.studentDetails.science_manager_data = [];
            for (let ind in this.studentData.science_manager_data) {
                this.studentDetails.science_manager_data.push(this.studentData.science_manager_data[ind])
            }
            this.studentDetails.administrative_data = [];
            for (let ind in this.studentData.administrative_data) {
                this.studentDetails.administrative_data.push(this.studentData.administrative_data[ind])
            }
            let personID = this.otherPersonId;
            let urlSubmit = 'api/people/' + personID + '/students/' + this.studentId;
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then( (result) => {
                for (let ind in result) {
                    result[ind].valid_from_show = '...'
                    result[ind].valid_until_show = '...'
                    result[ind].valid_from = time.momentToDate(result[ind].valid_from);
                    result[ind].valid_until = time.momentToDate(result[ind].valid_until);
                    if (result[ind].valid_from !== null) {
                        result[ind].valid_from_show = result[ind].valid_from
                    }
                    if (result[ind].valid_until !== null) {
                        result[ind].valid_until_show = result[ind].valid_until
                    }
                    if (result[ind].responsible_id === personID) {
                        result[ind].can_edit = true;
                    }
                }
                this.$set(this.studentDetails, 'supervisors', result);
                subUtil.getInfoPopulate(this, 'api/people/' + personID + '/lab-affiliations', true)
                .then( (result2) => {
                    this.myLabs = result2;
                    for (let ind in result2) {
                        for (let indLab in this.studentDetails.lab_data) {
                            if (result2[ind].lab_id === this.studentDetails.lab_data[indLab].lab_id) {
                                this.$set(this.studentDetails.lab_data[indLab], 'can_edit', true);
                            }
                        }
                    }
                })
            })
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreateLab = [];
                let urlDeleteLab = [];
                let urlUpdateLab = [];
                let urlCreateFacility = [];
                let urlDeleteFacility = [];
                let urlUpdateFacility = [];
                let urlCreateScienceManagement = [];
                let urlDeleteScienceManagement = [];
                let urlUpdateScienceManagement = [];
                let urlCreateAdministrative = [];
                let urlDeleteAdministrative = [];
                let urlUpdateAdministrative = [];
                let urlDeleteSupervisor = [];
                let urlUpdateSupervisor = [];
                let personID = this.otherPersonId;
                for (let ind in this.studentDetails.lab_data) {
                    let datum = this.studentDetails.lab_data[ind]
                    if (datum.id === 'new') {
                        urlCreateLab.push({
                            url: 'api/people/' + personID
                                + '/students/' + this.studentId
                                + '/lab-position',
                            body: datum,
                        });
                    } else {
                        urlUpdateLab.push({
                            url: 'api/people/' + personID
                                + '/students/' + this.studentId
                                + '/lab-position/' + datum.id,
                            body: datum,
                        });
                    }
                }
                for (let ind in this.studentDetails.technician_data) {
                    let datum = this.studentDetails.technician_data[ind]
                    if (datum.id === 'new') {
                        urlCreateFacility.push({
                            url: 'api/people/' + personID
                                + '/students/' + this.studentId
                                + '/facility-position',
                            body: datum,
                        });
                    } else {
                        urlUpdateFacility.push({
                            url: 'api/people/' + personID
                                + '/students/' + this.studentId
                                + '/facility-position/' + datum.id,
                            body: datum,
                        });
                    }
                }
                for (let ind in this.studentDetails.science_manager_data) {
                    let datum = this.studentDetails.science_manager_data[ind]
                    if (datum.id === 'new') {
                        urlCreateScienceManagement.push({
                            url: 'api/people/' + personID
                                + '/students/' + this.studentId
                                + '/science-management-position',
                            body: datum,
                        });
                    } else {
                        urlUpdateScienceManagement.push({
                            url: 'api/people/' + personID
                                + '/students/' + this.studentId
                                + '/science-management-position/' + datum.id,
                            body: datum,
                        });
                    }
                }
                for (let ind in this.studentDetails.administrative_data) {
                    let datum = this.studentDetails.administrative_data[ind]
                    if (datum.id === 'new') {
                        urlCreateAdministrative.push({
                            url: 'api/people/' + personID
                                + '/students/' + this.studentId
                                + '/administrative-position',
                            body: datum,
                        });
                    } else {
                        urlUpdateAdministrative.push({
                            url: 'api/people/' + personID
                                + '/students/' + this.studentId
                                + '/administrative-position/' + datum.id,
                            body: datum,
                        });
                    }
                }
                for (let ind in this.toDeleteLabPositions) {
                    let datum = this.toDeleteLabPositions[ind]
                    urlDeleteLab.push('api/people/' + personID
                                + '/students/' + this.studentId
                                + '/lab-position/' + datum.id)
                }
                for (let ind in this.toDeleteFacilityPositions) {
                    let datum = this.toDeleteFacilityPositions[ind]
                    urlDeleteFacility.push('api/people/' + personID
                                + '/students/' + this.studentId
                                + '/facility-position/' + datum.id)
                }
                for (let ind in this.toDeleteScienceManagementPositions) {
                    let datum = this.toDeleteScienceManagementPositions[ind]
                    urlDeleteScienceManagement.push('api/people/' + personID
                                + '/students/' + this.studentId
                                + '/science-management-position/' + datum.id)
                }
                for (let ind in this.toDeleteAdministrativePositions) {
                    let datum = this.toDeleteAdministrativePositions[ind]
                    urlDeleteAdministrative.push('api/people/' + personID
                                + '/students/' + this.studentId
                                + '/administrative-position/' + datum.id)
                }
                for (let ind in this.studentDetails.supervisors) {
                    let datum = this.studentDetails.supervisors[ind];
                    urlUpdateSupervisor.push({
                        url: 'api/people/' + personID
                            + '/students/' + this.studentId
                            + '/supervisors/' + datum.id,
                        body: datum,
                    });
                }
                for (let ind in this.toDeleteSupervisors) {
                    let datum = this.toDeleteSupervisors[ind]
                    urlDeleteSupervisor.push('api/people/' + personID
                                + '/students/' + this.studentId
                                + '/supervisors/' + datum.id)
                }
                Promise.all(
                    urlDeleteLab.map(el =>
                        this.$http.delete(el,
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                    .concat(
                        urlDeleteFacility.map(el =>
                            this.$http.delete(el,
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlDeleteScienceManagement.map(el =>
                            this.$http.delete(el,
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlDeleteAdministrative.map(el =>
                            this.$http.delete(el,
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlCreateLab.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlUpdateLab.map(el =>
                            this.$http.put(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlCreateFacility.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlUpdateFacility.map(el =>
                            this.$http.put(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlCreateScienceManagement.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlUpdateScienceManagement.map(el =>
                            this.$http.put(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlCreateAdministrative.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlUpdateAdministrative.map(el =>
                            this.$http.put(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlUpdateSupervisor.map(el =>
                            this.$http.put(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlDeleteSupervisor.map(el =>
                            this.$http.delete(el,
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                )
                .then(() => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.toDeleteLabPositions = [];
                    this.toDeleteFacilityPositions = [];
                    this.toDeleteScienceManagementPositions = [];
                    this.toDeleteAdministrativePositions = [];
                    this.$root.$emit('otherPersonUpdateSupervisorTable')
                    //this.initialize();
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    this.toDeleteLabPositions = [];
                    this.toDeleteFacilityPositions = [];
                    this.toDeleteScienceManagementPositions = [];
                    this.toDeleteAdministrativePositions = [];
                    this.initialize();
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })



            }

        },
        getLabs() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'labs';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labs');
            }
        },
        getUnits() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'units';
                return subUtil.getPublicInfo(vm, urlSubmit, 'units');
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
        removeItem(list, ind, type) {
            let proceed = true;
            if (type === 'lab' && list[ind].id !== 'new') {
                this.toDeleteLabPositions.push(list[ind])
            } else if (type === 'facility' && list[ind].id !== 'new') {
                this.toDeleteFacilityPositions.push(list[ind])
            } else if (type === 'science-management' && list[ind].id !== 'new') {
                this.toDeleteScienceManagementPositions.push(list[ind])
            } else if (type === 'administrative' && list[ind].id !== 'new') {
                this.toDeleteAdministrativePositions.push(list[ind])
            } else if (type === 'supervisor' && list[ind].id !== 'new') {
                proceed = confirm('After deleting this entry, if you press "Update" you'
                                    +' might no longer appear as a supervisor of this person.')
                if (proceed) {
                    this.toDeleteSupervisors.push(list[ind])
                }
            }
            if (proceed) {
                list.splice(ind, 1);
            }

        },
        addItem(list, type) {
            if (type === 'lab') {
                list.push({
                    id: 'new',
                    lab_id: null,
                    lab_position_id: null,
                    valid_from: null,
                    valid_until: null,
                    can_edit: true,
                })
            } else if (type === 'facility') {
                list.push({
                    id: 'new',
                    technician_office_id: null,
                    technician_position_id: null,
                    valid_from: null,
                    valid_until: null,
                })
            } else if (type === 'science-management') {
                list.push({
                    id: 'new',
                    science_manager_office_id: null,
                    science_manager_position_id: null,
                    valid_from: null,
                    valid_until: null,
                })
            } else if (type === 'administrative') {
                list.push({
                    id: 'new',
                    administrative_office_id: null,
                    administrative_position_id: null,
                    valid_from: null,
                    valid_until: null,
                })
            }

        },

    },
}
</script>

<style scoped>

</style>