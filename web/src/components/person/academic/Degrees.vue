<template>
    <!-- TODO: Separate finished and ongoing degrees -->
    <v-row class="pa-4">
        <v-col cols="12" md="6" v-if="degrees && supervisorTypes">
            <v-card>
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline">Finished Degrees</h3>
                    </div>
                </v-card-title>
                <v-card-text v-if="$v.data.finished.$each.$iter">
                    <div v-if="$v.data.finished.$model.length === 0">
                        No finished degrees
                    </div>
                    <v-form ref="form"
                        @submit.prevent="submitForm">
                        <v-expansion-panels>
                            <v-expansion-panel
                                    v-for="(v,i) in $v.data.finished.$each.$iter"
                                    :key="i"
                                    v-model="degreesPanel">
                                <v-expansion-panel-header>
                                    <div>
                                        <b>{{v.$model.degree_name}}</b>, {{v.$model.area}},
                                            from {{v.$model.start}} to {{v.$model.end}}
                                    </div>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <v-card class="pa-4">
                                        <v-card-text></v-card-text>
                                        <v-container>
                                            <v-row justify="end">
                                                <v-btn @click="removeItem(data.finished, i, 'degree')"
                                                     small outlined color="red">Remove degree</v-btn>
                                            </v-row>
                                            <v-row>
                                                <v-col>
                                                    <v-row>
                                                        <v-col cols="12" sm="6">
                                                            <v-select v-model="v.$model.degree_id"
                                                                @change="updateSelect(v.$model, 'degree_id', 'degree_name', degrees,'id','name_en')"
                                                                :items="degrees" item-value="id" item-text="name_en"
                                                                label="Degree">
                                                            </v-select>
                                                        </v-col>
                                                        <v-col cols="12" sm="6">
                                                            <v-text-field
                                                                v-model="v.$model.program"
                                                                label="Degree Program">
                                                            </v-text-field>
                                                            <div v-if="!v.program.maxLength">
                                                                <p class="caption red--text">Maximum characters: 100</p>
                                                            </div>
                                                        </v-col>
                                                    </v-row>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col>
                                                    <v-row>
                                                        <v-col cols="12" sm="6">
                                                            <v-text-field
                                                                v-model="v.$model.institution"
                                                                label="Institution">
                                                            </v-text-field>
                                                            <div v-if="!v.institution.maxLength">
                                                                <p class="caption red--text">Maximum characters: 100</p>
                                                            </div>
                                                        </v-col>
                                                        <v-col cols="12" sm="6">
                                                            <v-text-field
                                                                v-model="v.$model.area"
                                                                label="Field">
                                                            </v-text-field>
                                                            <div v-if="!v.area.maxLength">
                                                                <p class="caption red--text">Maximum characters: 100</p>
                                                            </div>
                                                        </v-col>
                                                    </v-row>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col>
                                                    <v-text-field
                                                        v-model="v.$model.title"
                                                        label="Thesis title">
                                                    </v-text-field>
                                                    <div v-if="!v.title.maxLength">
                                                        <p class="caption red--text">Maximum characters: 300</p>
                                                    </div>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col>
                                                    <v-row>
                                                        <v-col cols="12" sm="6">
                                                            <v-menu ref="v.$model.show_date_start" v-model="v.$model.show_date_start"
                                                                :close-on-content-click="false"
                                                                :nudge-right="10"
                                                                transition="scale-transition"
                                                                offset-y min-width="290px">
                                                                <template v-slot:activator="{ on }">
                                                                    <v-text-field v-model="v.$model.start"
                                                                        label="Started" v-on="on">
                                                                    </v-text-field>
                                                                </template>
                                                                <v-date-picker v-model="v.$model.start"
                                                                        @input="v.$model.show_date_start = false"
                                                                        no-title></v-date-picker>
                                                            </v-menu>
                                                        </v-col>
                                                        <v-col cols="12" sm="6">
                                                            <v-menu ref="v.$model.show_date_end" v-model="v.$model.show_date_end"
                                                                :close-on-content-click="false"
                                                                :nudge-right="10"
                                                                transition="scale-transition"
                                                                offset-y min-width="290px">
                                                                <template v-slot:activator="{ on }">
                                                                    <v-text-field v-model="v.$model.end"
                                                                        label="Ended" v-on="on">
                                                                    </v-text-field>
                                                                </template>
                                                                <v-date-picker v-model="v.$model.end"
                                                                        @input="v.$model.show_date_end = false"
                                                                        no-title></v-date-picker>
                                                            </v-menu>
                                                        </v-col>
                                                    </v-row>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col>
                                                    <h5>LAQV/UCIBIO supervisors</h5>
                                                    <v-row>
                                                        <v-expansion-panels>
                                                            <v-expansion-panel v-model="v.$model.supervisors_panel"
                                                                v-for="(vsup,j) in v.$model.supervisors"
                                                                :key="i.toString() + '-' + j.toString()">
                                                                <v-expansion-panel-header>
                                                                    <div><b>{{vsup.colloquial_name}}</b></div>
                                                                </v-expansion-panel-header>
                                                                <v-expansion-panel-content>
                                                                    <v-col>
                                                                        <v-row align="center" justify="end">
                                                                            <v-btn @click="removeItem(v.$model.supervisors, j, 'supervisor', data.finished, i, 'deleteSupervisors')"
                                                                                    small outlined color="red">Remove</v-btn>
                                                                        </v-row>
                                                                        <v-row>
                                                                            <v-col>
                                                                                <v-autocomplete
                                                                                    v-model="vsup.supervisor_id"
                                                                                    @change="updateSelect(vsup, 'supervisor_id', 'colloquial_name', people,'id','colloquial_name')"
                                                                                    :loading="loadingPeople"
                                                                                    :items="people" item-value="id" item-text="colloquial_name"
                                                                                    :search-input.sync="vsup.supervisor_search"
                                                                                    cache-items
                                                                                    flat
                                                                                    hide-no-data
                                                                                    hide-details
                                                                                    label="Supervisor">
                                                                                </v-autocomplete>
                                                                            </v-col>
                                                                        </v-row>
                                                                        <v-row>
                                                                            <v-col cols="12" sm="6">
                                                                                <v-select v-model="vsup.supervisor_type_id"
                                                                                    :items="supervisorTypes" item-value="id" item-text="name_en"
                                                                                    label="Supervisor type">
                                                                                </v-select>
                                                                            </v-col>
                                                                            <v-col cols="12" sm="3">
                                                                                <v-menu ref="vsup.show_date_start" v-model="vsup.show_date_start"
                                                                                    :close-on-content-click="false"
                                                                                    :nudge-right="10"
                                                                                    transition="scale-transition"
                                                                                    offset-y min-width="290px">
                                                                                    <template v-slot:activator="{ on }">
                                                                                        <v-text-field v-model="vsup.valid_from"
                                                                                            label="Started" v-on="on">
                                                                                        </v-text-field>
                                                                                    </template>
                                                                                    <v-date-picker v-model="vsup.valid_from"
                                                                                            @input="vsup.show_date_start = false"
                                                                                            no-title></v-date-picker>
                                                                                </v-menu>
                                                                            </v-col>
                                                                            <v-col cols="12" sm="3">
                                                                                <v-menu ref="vsup.show_date_end" v-model="vsup.show_date_end"
                                                                                    :close-on-content-click="false"
                                                                                    :nudge-right="10"
                                                                                    transition="scale-transition"
                                                                                    offset-y min-width="290px">
                                                                                    <template v-slot:activator="{ on }">
                                                                                        <v-text-field v-model="vsup.valid_until"
                                                                                            label="Ended" v-on="on">
                                                                                        </v-text-field>
                                                                                    </template>
                                                                                    <v-date-picker v-model="vsup.valid_until"
                                                                                            @input="vsup.show_date_end = false"
                                                                                            no-title></v-date-picker>
                                                                                </v-menu>
                                                                            </v-col>
                                                                        </v-row>
                                                                    </v-col>
                                                                </v-expansion-panel-content>
                                                            </v-expansion-panel>
                                                        </v-expansion-panels>
                                                        <v-col>
                                                            <v-btn small outlined
                                                                @click="addItem(v.$model.supervisors,'supervisor',v.$model)">
                                                                Add supervisor</v-btn>
                                                        </v-col>
                                                    </v-row>
                                                    <v-col>
                                                        <v-divider></v-divider>
                                                    </v-col>
                                                    <h5>Supervisors, other institutions</h5>
                                                    <v-row>
                                                        <v-expansion-panels>
                                                            <v-expansion-panel
                                                                v-model="v.$model.ext_supervisors_panel"
                                                                v-for="(vsup,j) in v.external_supervisors.$each.$iter"
                                                                :key="i.toString() + '-' + j.toString() + '-ext'">
                                                                <v-expansion-panel-header>
                                                                    <div><b>{{vsup.$model.colloquial_name}}</b>,
                                                                            {{vsup.$model.organization}}
                                                                    </div>
                                                                </v-expansion-panel-header>
                                                                <v-expansion-panel-content>
                                                                    <v-col>
                                                                        <v-row align="center" justify="end">
                                                                            <v-btn @click="removeItem(v.$model.external_supervisors, j, 'extSupervisor', data.finished, i, 'deleteExtSupervisors')"
                                                                                    small outlined color="red">Remove</v-btn>
                                                                        </v-row>
                                                                        <v-row>
                                                                            <v-col cols="12" sm="6">
                                                                                <v-text-field light
                                                                                    v-model="vsup.$model.colloquial_name"
                                                                                    label="Name">
                                                                                </v-text-field>
                                                                                <div v-if="!vsup.colloquial_name.maxLength">
                                                                                    <p class="caption red--text">Maximum characters: 100</p>
                                                                                </div>
                                                                            </v-col>
                                                                            <v-col cols="12" sm="6">
                                                                                <v-text-field
                                                                                    v-model="vsup.$model.organization"
                                                                                    label="Organization">
                                                                                </v-text-field>
                                                                                <div v-if="!vsup.organization.maxLength">
                                                                                    <p class="caption red--text">Maximum characters: 100</p>
                                                                                </div>
                                                                            </v-col>
                                                                        </v-row>
                                                                        <v-row>
                                                                            <v-col cols="12" sm="6">
                                                                                <v-select v-model="vsup.$model.supervisor_type_id"
                                                                                    :items="supervisorTypes" item-value="id" item-text="name_en"
                                                                                    label="Supervisor type">
                                                                                </v-select>
                                                                            </v-col>
                                                                            <v-col cols="12" sm="3">
                                                                                <v-menu ref="vsup.show_date_start" v-model="vsup.$model.show_date_start"
                                                                                    :close-on-content-click="false"
                                                                                    :nudge-right="10"
                                                                                    transition="scale-transition"
                                                                                    offset-y min-width="290px">
                                                                                    <template v-slot:activator="{ on }">
                                                                                        <v-text-field v-model="vsup.$model.valid_from"
                                                                                            label="Started" v-on="on">
                                                                                        </v-text-field>
                                                                                    </template>
                                                                                    <v-date-picker v-model="vsup.$model.valid_from"
                                                                                            @input="vsup.$model.show_date_start = false"
                                                                                            no-title></v-date-picker>
                                                                                </v-menu>
                                                                            </v-col>
                                                                            <v-col cols="12" sm="3">
                                                                                <v-menu ref="vsup.show_date_end" v-model="vsup.$model.show_date_end"
                                                                                    :close-on-content-click="false"
                                                                                    :nudge-right="10"
                                                                                    transition="scale-transition"
                                                                                    offset-y min-width="290px">
                                                                                    <template v-slot:activator="{ on }">
                                                                                        <v-text-field v-model="vsup.$model.valid_until"
                                                                                            label="Ended" v-on="on">
                                                                                        </v-text-field>
                                                                                    </template>
                                                                                    <v-date-picker v-model="vsup.$model.valid_until"
                                                                                            @input="vsup.$model.show_date_end = false"
                                                                                            no-title></v-date-picker>
                                                                                </v-menu>
                                                                            </v-col>
                                                                        </v-row>
                                                                    </v-col>
                                                                </v-expansion-panel-content>
                                                            </v-expansion-panel>
                                                        </v-expansion-panels>
                                                        <v-col>
                                                            <v-btn small outlined
                                                                @click="addItem(v.$model.external_supervisors,'external_supervisor',v.$model)">
                                                                Add external supervisor
                                                            </v-btn>
                                                        </v-col>
                                                    </v-row>
                                                </v-col>
                                            </v-row>
                                        </v-container>
                                    </v-card>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                        <v-col class="mt-4">
                            <v-btn outlined
                                @click="addItem(data.finished, 'degree', 'degreesPanel')"
                            >
                                Add a degree
                            </v-btn>
                        </v-col>
                        <v-row align-content="center" justify="end">
                            <v-col cols="3" v-if="formError">
                                <v-row justify="end">
                                    <p class="caption red--text">Unable to submit form.</p>
                                </v-row>
                            </v-col>
                            <v-col cols="2" align-self="end">
                                <v-row justify="end">
                                    <v-btn type="submit"
                                    outlined color="blue">Save</v-btn>
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
                        <v-row v-if="$v.$invalid">
                            <p class="caption red--text">At least one field is invalid.</p>
                        </v-row>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="12" md="6" v-if="degrees && supervisorTypes">
            <v-card>
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline">Ongoing Degrees</h3>
                    </div>
                </v-card-title>
                <v-card-text>
                    <div v-if="$v.data.ongoing.$model.length === 0">
                        No ongoing degrees
                    </div>
                    <v-form ref="formOngoing"
                        @submit.prevent="submitFormOngoing">
                        <v-expansion-panels>
                            <v-expansion-panel
                                v-model="ongoingDegreesPanel"
                                v-for="(v,i) in $v.data.ongoing.$each.$iter"
                                :key="i.toString() + '-ongoing'">
                                <v-expansion-panel-header>
                                    <div><b>{{v.$model.degree_name}}</b>, {{v.$model.area}},
                                            from {{v.$model.start}} to {{v.$model.end}}
                                    </div>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <v-card class="pa-4">
                                        <v-card-text></v-card-text>
                                        <v-container>
                                            <v-row justify="end">
                                                <v-btn @click="removeItem(data.ongoing, i, 'degree')"
                                                            small outlined color="red">Remove degree</v-btn>
                                            </v-row>
                                            <v-row>
                                                <v-col>
                                                    <v-row>
                                                        <v-col cols="12" sm="6">
                                                            <v-select v-model="v.$model.degree_id"
                                                                @change="updateSelect(v.$model, 'degree_id', 'degree_name', degrees,'id','name_en')"
                                                                :items="degrees" item-value="id" item-text="name_en"
                                                                label="Degree">
                                                            </v-select>
                                                        </v-col>
                                                        <v-col cols="12" sm="6">
                                                            <v-text-field
                                                                v-model="v.$model.program"
                                                                label="Degree Program">
                                                            </v-text-field>
                                                            <div v-if="!v.program.maxLength">
                                                                <p class="caption red--text">Maximum characters: 100</p>
                                                            </div>
                                                        </v-col>
                                                    </v-row>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col>
                                                    <v-row>
                                                        <v-col cols="12" sm="6">
                                                            <v-text-field
                                                                v-model="v.$model.institution"
                                                                label="Institution">
                                                            </v-text-field>
                                                            <div v-if="!v.institution.maxLength">
                                                                <p class="caption red--text">Maximum characters: 100</p>
                                                            </div>
                                                        </v-col>
                                                        <v-col cols="12" sm="6">
                                                            <v-text-field
                                                                v-model="v.$model.area"
                                                                label="Field">
                                                            </v-text-field>
                                                            <div v-if="!v.area.maxLength">
                                                                <p class="caption red--text">Maximum characters: 100</p>
                                                            </div>
                                                        </v-col>
                                                    </v-row>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col>
                                                    <v-text-field
                                                        v-model="v.$model.title"
                                                        label="Thesis title">
                                                    </v-text-field>
                                                    <div v-if="!v.title.maxLength">
                                                        <p class="caption red--text">Maximum characters: 300</p>
                                                    </div>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col>
                                                    <v-row>
                                                        <v-col cols="12" sm="4">
                                                            <v-menu ref="v.$model.show_date_start" v-model="v.$model.show_date_start"
                                                                :close-on-content-click="false"
                                                                :nudge-right="10"
                                                                transition="scale-transition"
                                                                offset-y min-width="290px">
                                                                <template v-slot:activator="{ on }">
                                                                    <v-text-field v-model="v.$model.start"
                                                                        label="Started" v-on="on">
                                                                    </v-text-field>
                                                                </template>
                                                                <v-date-picker v-model="v.$model.start"
                                                                        @input="v.$model.show_date_start = false"
                                                                        no-title></v-date-picker>
                                                            </v-menu>
                                                        </v-col>
                                                        <v-col cols="12" sm="4">
                                                            <v-menu ref="v.$model.show_date_end" v-model="v.$model.show_date_end"
                                                                :close-on-content-click="false"
                                                                :nudge-right="10"
                                                                transition="scale-transition"
                                                                offset-y min-width="290px">
                                                                <template v-slot:activator="{ on }">
                                                                    <v-text-field v-model="v.$model.end"
                                                                        label="Ended" v-on="on">
                                                                    </v-text-field>
                                                                </template>
                                                                <v-date-picker v-model="v.$model.end"
                                                                        @input="v.$model.show_date_end = false"
                                                                        no-title></v-date-picker>
                                                            </v-menu>
                                                        </v-col>
                                                        <v-col cols="12" sm="4">
                                                            <v-menu ref="v.$model.show_date_estimate_end" v-model="v.$model.show_date_estimate_end"
                                                                :close-on-content-click="false"
                                                                :nudge-right="10"
                                                                transition="scale-transition"
                                                                offset-y min-width="290px">
                                                                <template v-slot:activator="{ on }">
                                                                    <v-text-field v-model="v.$model.estimate_end"
                                                                        label="Estimated end" v-on="on">
                                                                    </v-text-field>
                                                                </template>
                                                                <v-date-picker v-model="v.$model.estimate_end"
                                                                        @input="v.$model.show_date_estimate_end = false"
                                                                        no-title></v-date-picker>
                                                            </v-menu>
                                                        </v-col>
                                                    </v-row>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col>
                                                    <h5>LAQV/UCIBIO supervisors</h5>
                                                    <v-row>
                                                        <v-expansion-panels>
                                                            <v-expansion-panel v-model="v.$model.supervisors_panel"
                                                                v-for="(vsup,j) in v.$model.supervisors"
                                                                :key="i.toString() + '-' + j.toString() + '-ongoing'">
                                                                <v-expansion-panel-header>
                                                                    <div><b>{{vsup.colloquial_name}}</b></div>
                                                                </v-expansion-panel-header>
                                                                <v-expansion-panel-content>
                                                                    <v-col>
                                                                        <v-row align="center" justify="end">
                                                                            <v-btn @click="removeItem(v.$model.supervisors, j, 'supervisor', data.ongoing, i, 'deleteSupervisors')"
                                                                                    small outlined color="red">Remove</v-btn>
                                                                        </v-row>
                                                                        <v-row>
                                                                            <v-col>
                                                                                <v-autocomplete
                                                                                    v-model="vsup.supervisor_id"
                                                                                    @change="updateSelect(vsup, 'supervisor_id', 'colloquial_name', people,'id','colloquial_name')"
                                                                                    :loading="loadingPeople"
                                                                                    :items="people" item-value="id" item-text="colloquial_name"
                                                                                    :search-input.sync="vsup.supervisor_search"
                                                                                    cache-items
                                                                                    flat
                                                                                    hide-no-data
                                                                                    hide-details
                                                                                    label="Supervisor">
                                                                                </v-autocomplete>
                                                                            </v-col>
                                                                        </v-row>
                                                                        <v-row>
                                                                            <v-col cols="12" sm="6">
                                                                                <v-select v-model="vsup.supervisor_type_id"
                                                                                    :items="supervisorTypes" item-value="id" item-text="name_en"
                                                                                    label="Supervisor type">
                                                                                </v-select>
                                                                            </v-col>
                                                                            <v-col cols="12" sm="3">
                                                                                <v-menu ref="vsup.show_date_start" v-model="vsup.show_date_start"
                                                                                    :close-on-content-click="false"
                                                                                    :nudge-right="10"
                                                                                    transition="scale-transition"
                                                                                    offset-y min-width="290px">
                                                                                    <template v-slot:activator="{ on }">
                                                                                        <v-text-field v-model="vsup.valid_from"
                                                                                            label="Started" v-on="on">
                                                                                        </v-text-field>
                                                                                    </template>
                                                                                    <v-date-picker v-model="vsup.valid_from"
                                                                                            @input="vsup.show_date_start = false"
                                                                                            no-title></v-date-picker>
                                                                                </v-menu>
                                                                            </v-col>
                                                                            <v-col cols="12" sm="3">
                                                                                <v-menu ref="vsup.show_date_end" v-model="vsup.show_date_end"
                                                                                    :close-on-content-click="false"
                                                                                    :nudge-right="10"
                                                                                    transition="scale-transition"
                                                                                    offset-y min-width="290px">
                                                                                    <template v-slot:activator="{ on }">
                                                                                        <v-text-field v-model="vsup.valid_until"
                                                                                            label="Ended" v-on="on">
                                                                                        </v-text-field>
                                                                                    </template>
                                                                                    <v-date-picker v-model="vsup.valid_until"
                                                                                            @input="vsup.show_date_end = false"
                                                                                            no-title></v-date-picker>
                                                                                </v-menu>
                                                                            </v-col>
                                                                        </v-row>
                                                                    </v-col>
                                                                </v-expansion-panel-content>
                                                            </v-expansion-panel>
                                                        </v-expansion-panels>
                                                        <v-col>
                                                            <v-btn small outlined
                                                                @click="addItem(v.$model.supervisors,'supervisor',v.$model)">
                                                                Add supervisor</v-btn>
                                                        </v-col>
                                                    </v-row>
                                                    <v-col>
                                                        <v-divider></v-divider>
                                                    </v-col>
                                                    <h5>Supervisors, other institutions</h5>
                                                    <v-row>
                                                        <v-expansion-panels>
                                                            <v-expansion-panel v-model="v.$model.ext_supervisors_panel"
                                                                v-for="(vsup,j) in v.external_supervisors.$each.$iter"
                                                                :key="i.toString() + '-' + j.toString() + '-ongoing-ext'">
                                                                <v-expansion-panel-header>
                                                                    <div><b>{{vsup.$model.colloquial_name}}</b>, {{vsup.$model.organization}}
                                                                        </div>
                                                                </v-expansion-panel-header>
                                                                <v-expansion-panel-content>
                                                                    <v-col>
                                                                        <v-row align="center" justify="end">
                                                                            <v-btn @click="removeItem(v.$model.external_supervisors, j, 'extSupervisor', data.ongoing, i, 'deleteExtSupervisors')"
                                                                                    small outlined color="red">Remove</v-btn>
                                                                        </v-row>
                                                                        <v-row>
                                                                            <v-col cols="12" sm="6">
                                                                                <v-text-field light
                                                                                    v-model="vsup.$model.colloquial_name"
                                                                                    label="Name">
                                                                                </v-text-field>
                                                                                <div v-if="!vsup.colloquial_name.maxLength">
                                                                                    <p class="caption red--text">Maximum characters: 100</p>
                                                                                </div>
                                                                            </v-col>
                                                                            <v-col cols="12" sm="6">
                                                                                <v-text-field
                                                                                    v-model="vsup.$model.organization"
                                                                                    label="Organization">
                                                                                </v-text-field>
                                                                                <div v-if="!vsup.organization.maxLength">
                                                                                    <p class="caption red--text">Maximum characters: 100</p>
                                                                                </div>
                                                                            </v-col>
                                                                        </v-row>
                                                                        <v-row>
                                                                            <v-col cols="12" sm="6">
                                                                                <v-select v-model="vsup.$model.supervisor_type_id"
                                                                                    :items="supervisorTypes" item-value="id" item-text="name_en"
                                                                                    label="Supervisor type">
                                                                                </v-select>
                                                                            </v-col>
                                                                            <v-col cols="12" sm="3">
                                                                                <v-menu ref="vsup.show_date_start" v-model="vsup.$model.show_date_start"
                                                                                    :close-on-content-click="false"
                                                                                    :nudge-right="10"
                                                                                    transition="scale-transition"
                                                                                    offset-y min-width="290px">
                                                                                    <template v-slot:activator="{ on }">
                                                                                        <v-text-field v-model="vsup.$model.valid_from"
                                                                                            label="Started" v-on="on">
                                                                                        </v-text-field>
                                                                                    </template>
                                                                                    <v-date-picker v-model="vsup.$model.valid_from"
                                                                                            @input="vsup.$model.show_date_start = false"
                                                                                            no-title></v-date-picker>
                                                                                </v-menu>
                                                                            </v-col>
                                                                            <v-col cols="12" sm="3">
                                                                                <v-menu ref="vsup.show_date_end" v-model="vsup.$model.show_date_end"
                                                                                    :close-on-content-click="false"
                                                                                    :nudge-right="10"
                                                                                    transition="scale-transition"
                                                                                    offset-y min-width="290px">
                                                                                    <template v-slot:activator="{ on }">
                                                                                        <v-text-field v-model="vsup.$model.valid_until"
                                                                                            label="Ended" v-on="on">
                                                                                        </v-text-field>
                                                                                    </template>
                                                                                    <v-date-picker v-model="vsup.$model.valid_until"
                                                                                            @input="vsup.$model.show_date_end = false"
                                                                                            no-title></v-date-picker>
                                                                                </v-menu>
                                                                            </v-col>
                                                                        </v-row>
                                                                    </v-col>
                                                                </v-expansion-panel-content>
                                                            </v-expansion-panel>
                                                        </v-expansion-panels>
                                                        <v-col>
                                                            <v-btn small outlined
                                                                @click="addItem(v.$model.external_supervisors,'external_supervisor',v.$model)">
                                                                Add external supervisor
                                                            </v-btn>
                                                        </v-col>
                                                    </v-row>
                                                </v-col>
                                            </v-row>
                                        </v-container>
                                    </v-card>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                        <v-col>
                            <v-btn class="mt-4" outlined @click="addItem(data.ongoing, 'degree', 'ongoingDegreesPanel')">Add a degree</v-btn>
                        </v-col>
                        <v-row align-content="center" justify="end">
                            <v-col cols="3" v-if="ongoingFormError">
                                <v-row justify="end">
                                    <p class="caption red--text">Unable to submit form.</p>
                                </v-row>
                            </v-col>
                            <v-col cols="2" align-self="end">
                                <v-row justify="end">
                                    <v-btn type="submit"
                                    outlined color="blue">Save</v-btn>
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
                        <div v-if="$v.$invalid">
                            <p class="caption red--text">At least one field is invalid.</p>
                        </div>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import time from '@/components/common/date-utils'
import subUtil from '@/components/common/submit-utils'
import {maxLength} from 'vuelidate/lib/validators'

var processDegrees = function(vm, result) {
    let ongoing = [];
    let finished = [];
    let today = time.momentToDate(time.moment());
    for (let ind in result) {
        result[ind].deleteSupervisors = [];
        result[ind].deleteExtSupervisors = [];
        result[ind].degree_name = '';
        result[ind].show_date_start = false;
        result[ind].show_date_end = false;
        result[ind].show_date_estimate_end = false;
        result[ind].supervisors_panel = undefined;
        result[ind].ext_supervisors_panel = undefined;
        if (result[ind].degree_id !== null) {
            let this_degree = vm.degrees.find(el => el.id === result[ind].degree_id)
            if (this_degree !== undefined) {
                result[ind].degree_name = this_degree.name_en;
            }
        }
        result[ind].start = time.momentToDate(result[ind].start);
        result[ind].end = time.momentToDate(result[ind].end);
        result[ind].estimate_end = time.momentToDate(result[ind].estimate_end);
        for (let indSup in result[ind].supervisors) {
            result[ind].supervisors[indSup].supervisor_search = result[ind].supervisors[indSup].colloquial_name;
            result[ind].supervisors[indSup].show_date_start = false;
            result[ind].supervisors[indSup].show_date_end = false;
            result[ind].supervisors[indSup].valid_from = time.momentToDate(result[ind].supervisors[indSup].valid_from);
            result[ind].supervisors[indSup].valid_until = time.momentToDate(result[ind].supervisors[indSup].valid_until);
        }
        for (let indSup in result[ind].external_supervisors) {
            result[ind].external_supervisors[indSup].show_date_start = false;
            result[ind].external_supervisors[indSup].show_date_end = false;
            result[ind].external_supervisors[indSup].valid_from = time.momentToDate(result[ind].external_supervisors[indSup].valid_from);
            result[ind].external_supervisors[indSup].valid_until = time.momentToDate(result[ind].external_supervisors[indSup].valid_until);
        }
        if (result[ind].end === null) {
            ongoing.push(result[ind]);
        } else if (result[ind].end > today ) {
            ongoing.push(result[ind]);
        } else {
            finished.push(result[ind])
        }
    }
    return {ongoing, finished};
};

export default {
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            ongoingFormError: false,

            data: {
                ongoing: [],
                finished: [],
            },
            toDelete: [],
            degrees: [{id: null, name_en: null}],
            supervisorTypes: [],
            people: [],
            loadingPeople: false,
            degreesPanel: undefined,
            ongoingDegreesPanel: undefined,
        }
    },
    computed: {
        personID () {
            return this.$store.state.session.personID;
        },
        toColumn () {
            const binding = {column: false};
            if (this.$vuetify.breakpoint.mdAndDown) {
                binding.column = true;
            }
            return binding;
        }
    },
    watch: {
        personID () {
            this.initialize();
        },
    },
    created() {
        this.getDegrees();
        this.getSupervisorTypes();
        this.getPeople();
        this.initialize();
    },
    methods: {
        initialize() {
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                let urlSubmit = 'api/people/' + personID + '/degrees';
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    this.data = processDegrees(this, result);
                });
            } else {
                this.$refs.form.reset();
                this.$refs.formOngoing.reset();
            }
        },
        submitForm() {
            if (this.$v.$invalid) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                if (this.$store.state.session.loggedIn) {
                    let personID = this.$store.state.session.personID;
                    let urlCreate = [];
                    let urlDelete = [];
                    let urlUpdate = [];
                    this.progress = true;
                    let degrees = this.data.finished.concat(this.data.ongoing);
                    for (let ind in degrees) {
                        if (degrees[ind].id === 'new') {
                            degrees[ind].person_id = personID;
                            urlCreate.push({
                                    url: 'api/people/' + personID + '/degrees',
                                    body: degrees[ind],
                                });

                        } else {
                            urlUpdate.push({
                                    url: 'api/people/' + personID
                                            + '/degrees/' + degrees[ind].id,
                                    body: degrees[ind],
                                });
                        }
                    }
                    for (let ind in this.toDelete) {
                        urlDelete.push('api/people/' + personID
                                    + '/degrees/' + this.toDelete[ind].id);
                    }

                    this.$http.all(
                        urlUpdate.map(el =>
                            this.$http.put(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                        .concat(
                            urlCreate.map(el =>
                                this.$http.post(el.url,
                                    { data: el.body, },
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                })))
                        .concat(
                            urlDelete.map(el =>
                                this.$http.delete(el,
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                })))
                    )
                    .then(this.$http.spread( () => {
                        this.progress = false;
                        this.success = true;
                        setTimeout(() => {this.success = false;}, 1500)
                        this.toDelete = [];
                        this.initialize();
                    }))
                    .catch((error) => {
                        this.progress = false;
                        this.error = true;
                        this.toDelete = [];
                        this.initialize();
                        setTimeout(() => {this.error = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    })
                }
            }
        },
        submitFormOngoing() {
            if (this.$v.$invalid) {
                this.ongoingFormError = true;
                setTimeout(() => {this.ongoingFormError = false;}, 3000)
            } else {
                if (this.$store.state.session.loggedIn) {
                    let personID = this.$store.state.session.personID;
                    let urlCreate = [];
                    let urlDelete = [];
                    let urlUpdate = [];
                    this.progress = true;
                    let degrees = this.data.finished.concat(this.data.ongoing);
                    for (let ind in degrees) {
                        if (degrees[ind].id === 'new') {
                            degrees[ind].person_id = personID;
                            urlCreate.push({
                                    url: 'api/people/' + personID + '/degrees',
                                    body: degrees[ind],
                                });

                        } else {
                            urlUpdate.push({
                                    url: 'api/people/' + personID
                                            + '/degrees/' + degrees[ind].id,
                                    body: degrees[ind],
                                });
                        }
                    }
                    for (let ind in this.toDelete) {
                        urlDelete.push('api/people/' + personID
                                    + '/degrees/' + this.toDelete[ind].id);
                    }

                    this.$http.all(
                        urlUpdate.map(el =>
                            this.$http.put(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                        .concat(
                            urlCreate.map(el =>
                                this.$http.post(el.url,
                                    { data: el.body, },
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                })))
                        .concat(
                            urlDelete.map(el =>
                                this.$http.delete(el,
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                })))
                    )
                    .then(this.$http.spread( () => {
                        this.progress = false;
                        this.success = true;
                        setTimeout(() => {this.success = false;}, 1500)
                        this.toDelete = [];
                        this.initialize();
                    }))
                    .catch((error) => {
                        this.progress = false;
                        this.error = true;
                        this.toDelete = [];
                        this.initialize();
                        setTimeout(() => {this.error = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    })
                }
            }
        },
        getDegrees() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'degrees';
                return subUtil.getPublicInfo(vm, urlSubmit, 'degrees');
            }
        },
        getSupervisorTypes() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'supervisor-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'supervisorTypes');
            }
        },
        getPeople() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'people';
                return subUtil.getPublicInfo(vm, urlSubmit, 'people', 'colloquial_name');
            }
        },
        addItem(list, type, panel) {
            if (type === 'degree') {
                list.push({id: 'new', degree_id: null, area: null, program: null,
                    institution: null, start: null, end: null, title: null,
                    supervisors: [], external_supervisors:[],
                    deleteSupervisors: [], deleteExtSupervisors: [],
                    show_date_start: false, show_date_end: false})
                this[panel] = list.length - 1;
            }
            if (type === 'supervisor') {
                list.push({id: 'new', supervisor_id: null,
                    supervisor_type_id: null,
                    valid_from: null, valid_until: null,
                    show_date_start: false, show_date_end: false});
                    panel.supervisors_panel = list.length - 1;
            }
            if (type === 'external_supervisor') {
                list.push({id: 'new', colloquial_name: null, organization: null,
                    supervisor_type_id: null,
                    valid_from: null, valid_until: null,
                    show_date_start: false, show_date_end: false});
                    panel.ext_supervisors_panel = list.length - 1;
            }

        },
        removeItem(list, ind, type, listSup, indSup, keySup) {
            if (type === 'degree' && list[ind].id !== 'new') {
                this.toDelete.push(list[ind]);
            }
            if (type === 'supervisor' && list[ind].id !== 'new') {
                listSup[indSup][keySup].push(list[ind].id);
            }
            if (type === 'extSupervisor' && list[ind].id !== 'new') {
                listSup[indSup][keySup].push(list[ind].id);
            }
            list.splice(ind, 1);
        },
        updateSelect(data, data_id, data_text, list, list_id, list_text) {
            for (let ind in list) {
                if (list[ind][list_id] === data[data_id]) {
                    this.$set(data, data_text, list[ind][list_text])
                }
            }
        }
    },
    validations: {
        data: {
            finished: {
                $each: {
                    program: { maxLength: maxLength(100), },
                    area: { maxLength: maxLength(100), },
                    institution: { maxLength: maxLength(100), },
                    title: { maxLength: maxLength(300), },
                    supervisors: {},
                    external_supervisors: {
                        $each: {
                            colloquial_name: { maxLength: maxLength(100)},
                            organization: { maxLength: maxLength(100)},
                        }
                    },
                }
            },
            ongoing: {
                $each: {
                    program: { maxLength: maxLength(100), },
                    area: { maxLength: maxLength(100), },
                    institution: { maxLength: maxLength(100), },
                    title: { maxLength: maxLength(300), },
                    supervisors: {},
                    external_supervisors: {
                        $each: {
                            colloquial_name: { maxLength: maxLength(100)},
                            organization: { maxLength: maxLength(100)},
                        }
                    },
                }
            }
        }
    }
}
</script>

<style scoped>

</style>
