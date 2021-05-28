<template>
<v-form ref="form"
    @submit.prevent="submitForm()">
    <v-card-text>
        <v-row>
            <h2 class="black--text">User</h2>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field
                    v-model="$v.data.username.$model"
                    :error="$v.data.username.$error"
                    label="Username">
                </v-text-field>
                <div v-if="$v.data.username.$error">
                    <div v-if="!$v.data.username.isUnique">
                        <p class="caption red--text">Username already taken.</p>
                    </div>
                    <div v-if="!$v.data.username.required">
                        <p class="caption red--text">A username is required.</p>
                    </div>
                </div>
                <v-text-field
                    v-model="$v.data.password.$model"
                    :error="$v.data.password.$error"
                    label="Password"
                    type="password">
                </v-text-field>
                <div v-if="$v.data.password.$error">
                    <div v-if="!$v.data.password.required">
                        <p class="caption red--text">Password is required.</p>
                    </div>
                </div>
                <v-text-field
                    v-model="$v.data.passwordConfirm.$model"
                    :error="$v.data.passwordConfirm.$error"
                    label="Confirm Password"
                    type="password">
                </v-text-field>
                <div v-if="$v.data.passwordConfirm.$error">
                    <div v-if="!$v.data.passwordConfirm.confirmPassword">
                        <p class="caption red--text">Values don't match.</p>
                    </div>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <h2 class="black--text">Personal Data</h2>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field
                    v-model="$v.data.name.$model"
                    :error="$v.data.name.$error"
                    label="Full Name">
                </v-text-field>
                <div v-if="$v.data.name.$error">
                    <div v-if="!$v.data.name.required">
                        <p class="caption red--text">Name is required.</p>
                    </div>
                    <div v-if="!$v.data.name.maxLength">
                    <p class="caption red--text">Maximum characters: 100.</p>
                </div>
                </div>
                <v-text-field
                    v-model="$v.data.colloquial_name.$model"
                    :error="$v.data.colloquial_name.$error"
                    label="Colloquial Name (minimum: name and surname)">
                </v-text-field>
                <div v-if="$v.data.colloquial_name.$error">
                    <div v-if="!$v.data.colloquial_name.required">
                        <p class="caption red--text">Colloquial name is required.</p>
                    </div>
                    <div v-if="!$v.data.colloquial_name.maxLength">
                        <p class="caption red--text">Maximum characters: 100.</p>
                    </div>
                </div>
                <v-row>
                    <v-col cols="12" sm="4">
                        <v-select v-model="data.gender"
                            :items="genders" item-value="id" item-text="value"
                            label="Gender">
                        </v-select>
                    </v-col>
                    <v-col cols="12" sm="4">
                        <v-menu ref="date_menu_birth" v-model="date_menu_birth"
                            :close-on-content-click="false"
                            :nudge-right="10"
                            transition="scale-transition"
                            offset-y min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="data.birth_date"
                                    label="Birth date" v-on="on">
                                </v-text-field>
                            </template>
                            <v-date-picker v-model="data.birth_date" @input="date_menu_birth = false" no-title></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="12" sm="4">
                        <v-autocomplete
                            v-model="data.countries" multiple
                            :loading="loadingCountries"
                            :items="countries" item-value="id" item-text="name"
                            :search-input.sync="searchCountries"
                            return-object
                            cache-items
                            flat
                            hide-no-data
                            hide-details
                            label="Nationalities">
                        </v-autocomplete>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <v-row>
            <h2 class="black--text">Personal Contacts</h2>
        </v-row>
        <v-row>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="data.personal_phones.phone"
                    label="Personal Phone">
                </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="$v.data.personal_emails.email.$model"
                    :error="$v.data.personal_emails.email.$error"
                    label="Personal Email">
                </v-text-field>
                <div v-if="$v.data.personal_emails.email.$error">
                    <div v-if="!$v.data.personal_emails.email.email">
                        <p class="caption red--text">Invalid email.</p>
                    </div>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <h2 class="black--text">Highest Academic Degree</h2>
        </v-row>
        <v-row>
            <v-col cols="12" sm="5">
                <v-select
                    v-model="data.degree"
                    :items="degrees" item-value="id" item-text="name_en"
                    return-object
                    label="Degrees">
                </v-select>
            </v-col>
        </v-row>
        <v-row>
            <h2 class="black--text">Scientific Identifiers</h2>
        </v-row>
        <v-row>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="data.ciencia_id"
                    label="Ciência ID (wwww-wwww-wwww)">
                </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="data.ORCID"
                    label="ORCID (dddd-dddd-dddd-dddd)">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <h2 class="black--text">Institutional Contacts</h2>
        </v-row>
        <v-row>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.phones.phone"
                    label="Institutional Phone">
                </v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.phones.extension"
                    label="Extension">
                </v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="$v.data.emails.email.$model"
                    :error="$v.data.emails.email.$error"
                    label="Institutional Email">
                </v-text-field>
                <div v-if="$v.data.emails.email.$error">
                    <div v-if="!$v.data.emails.email.email">
                        <p class="caption red--text">Invalid email.</p>
                    </div>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <h2 class="black--text">Institutional Affiliations</h2>
        </v-row>
        <v-row v-for="(aff, i) in data.current_institutional_affiliations"
            :key="'aff-' + i"
            align="center"
        >
            <v-col cols="12" sm="5">
                <v-select
                    v-model="aff.department_id"
                    :items="departments" item-value="id" item-text="short_str_department_en"
                    label="Academic Institution">
                </v-select>
            </v-col>
            <v-col cols="12" sm="3">
                <v-menu ref="aff.show_valid_from"
                    v-model="aff.show_valid_from"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="aff.valid_from"
                            label="From" v-on="on">
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="aff.valid_from"
                            @input="aff.show_valid_from = false"
                            no-title></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="12" sm="3">
                <v-menu ref="aff.show_valid_until"
                    v-model="aff.show_valid_until"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="aff.valid_until"
                            label="Until" v-on="on">
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="aff.valid_until"
                            @input="aff.show_valid_until = false"
                            no-title></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="1">
                <v-btn icon @click.stop="removeItem(data.current_institutional_affiliations, i)">
                    <v-icon color="red darken">mdi-delete</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row class="mt-2 mb-8">
            <v-btn class="ml-2" outlined @click="addItem('institutional-affiliation')">
                Add an affiliation
            </v-btn>
        </v-row>
        <v-row>
            <h2 class="black--text">Research Units Affiliations</h2>
        </v-row>
        <v-row>
            <v-col cols="12" sm="4">
                <v-select v-if="cityId === undefined || cityId === null"
                    v-model="$v.data.poles.$model"
                    :error="$v.data.poles.$error"
                    :items="poles"
                    item-value="id" item-text="city"
                    label="Poles">
                </v-select>
                <v-select v-else
                    v-model="$v.data.poles.$model"
                    disabled
                    readonly
                    :items="poles"
                    item-value="id" item-text="city"
                    label="Poles">
                </v-select>
                <div v-if="$v.data.poles.$error">
                    <div v-if="!$v.data.poles.required">
                        <p class="caption red--text">Pole is required.</p>
                    </div>
                </div>
            </v-col>
            <v-col cols="12" sm="4">
                <v-select v-model="$v.data.roles.$model"
                    :error="$v.data.roles.$error"
                    multiple
                    return-object
                    @change="changedRoles()"
                    :items="roles"
                    item-value="id" item-text="name_en"
                    label="Roles">
                </v-select>
            </v-col>
            <v-col cols="12">
                 <v-expansion-panels multiple :value="data.panelOpen"
                    class="px-4"
                >
                    <v-expansion-panel v-if="data.isScientific">
                        <v-expansion-panel-header>
                            <div>
                                <span class="role-name">Lab Positions</span>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div v-for="(pos, i) in data.current_positions"
                                :key="i"
                            >
                                <v-row align="center">
                                    <v-switch v-model="pos.integrated" class="mx-2" label="Integrated"></v-switch>
                                    <v-switch v-model="pos.nuclearCV" class="mx-2" label="Nuclear CV"></v-switch>
                                    <v-switch v-model="pos.pluriannual" class="mx-2" label="Pluriannual"></v-switch>
                                </v-row>

                                <v-row align="center">
                                    <v-col cols="12" sm="4">
                                        <v-select v-if="unitId === undefined || unitId === null"
                                            v-model="pos.groups[0].units[0].id"
                                            :items="units" item-value="id" item-text="short_name"
                                            @change="changeGroupsList(pos.groups[0].units[0].id, i)"
                                            label="Unit">
                                        </v-select>
                                        <v-select v-else
                                            v-model="pos.groups[0].units[0].id"
                                            disabled
                                            readonly
                                            :items="units" item-value="id" item-text="short_name"
                                            label="Unit">
                                        </v-select>
                                    </v-col>
                                    <v-col cols="12" sm="4">
                                        <v-select v-model="pos.groups[0].id"
                                            :items="pos.unit_groups" item-value="id" item-text="name"
                                            @change="changeLabsList(pos.groups[0].units[0].id, pos.groups[0].id, i)"
                                            label="Group">
                                        </v-select>
                                    </v-col>
                                    <v-col cols="12" sm="4">
                                        <v-select v-model="pos.lab_id"
                                            :items="pos.unit_group_labs" item-value="id" item-text="name"
                                            label="Lab">
                                        </v-select>
                                    </v-col>
                                </v-row>
                                <v-row align="center">
                                    <v-col cols="12" sm="6">
                                        <v-select v-model="pos.lab_position_id"
                                            :items="labPositions" item-value="id" item-text="name_en"
                                            label="Position"
                                        ></v-select>
                                    </v-col>
                                    <v-col cols="12" sm="4">
                                        <v-text-field v-model="pos.dedication"
                                            label="Dedication (%)"
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row align="center">
                                    <v-col cols="12" sm="5">
                                        <v-menu ref="pos.show_valid_from"
                                            v-model="pos.show_valid_from"
                                            :close-on-content-click="false"
                                            :nudge-right="10"
                                            transition="scale-transition"
                                            offset-y min-width="290px">
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="pos.valid_from"
                                                    label="From" v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker v-model="pos.valid_from"
                                                    @input="pos.show_valid_from = false"
                                                    no-title></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                    <v-col cols="11" sm="5">
                                        <v-menu ref="pos.show_valid_until"
                                            v-model="pos.show_valid_until"
                                            :close-on-content-click="false"
                                            :nudge-right="10"
                                            transition="scale-transition"
                                            offset-y min-width="290px">
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="pos.valid_until"
                                                    label="Until" v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker v-model="pos.valid_until"
                                                    @input="pos.show_valid_until = false"
                                                    no-title></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                    <v-col cols="1">
                                        <v-btn icon @click.stop="removeItem(data.current_positions, i)">
                                            <v-icon color="red darken">mdi-delete</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                                <v-divider></v-divider>
                            </div>
                            <v-row class="mt-4">
                                <v-btn class="ml-2" outlined @click="addItem('scientific')">
                                    Add an affiliation
                                </v-btn>
                            </v-row>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="data.isTechnical">
                        <v-expansion-panel-header>
                            <div>
                                <span class="role-name">Facility Positions</span>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div v-for="(pos, i) in data.tech_current_positions"
                                :key="'tech'+i"
                            >
                                <v-row align="center">
                                    <v-col cols="12" sm="6">
                                        <v-select v-model="pos.technician_office_id"
                                            :items="facilities" item-value="id" item-text="name_en"
                                            label="Facility">
                                        </v-select>
                                    </v-col>
                                    <v-col cols="12" sm="4">
                                        <v-select v-if="unitId === undefined || unitId === null"
                                            v-model="pos.unit_id"
                                            :items="units" item-value="id" item-text="short_name"
                                            label="Unit">
                                        </v-select>
                                        <v-select v-else
                                            v-model="pos.unit_id"
                                            disabled
                                            readonly
                                            :items="units" item-value="id" item-text="short_name"
                                            label="Unit">
                                        </v-select>
                                    </v-col>
                                </v-row>
                                <v-row align="center">
                                    <v-col cols="12" sm="6">
                                        <v-select v-model="pos.technician_position_id"
                                            :items="technicianPositions" item-value="id" item-text="name_en"
                                            label="Position"
                                        ></v-select>
                                    </v-col>
                                    <v-col cols="12" sm="4">
                                        <v-text-field v-model="pos.dedication"

                                            label="Dedication (%)"
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row align="center">
                                    <v-col cols="12" sm="5">
                                        <v-menu ref="pos.show_valid_from"
                                            v-model="pos.show_valid_from"
                                            :close-on-content-click="false"
                                            :nudge-right="10"
                                            transition="scale-transition"
                                            offset-y min-width="290px">
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="pos.valid_from"
                                                    label="From" v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker v-model="pos.valid_from"
                                                    @input="pos.show_valid_from = false"
                                                    no-title></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                    <v-col cols="11" sm="5">
                                        <v-menu ref="pos.show_valid_until"
                                            v-model="pos.show_valid_until"
                                            :close-on-content-click="false"
                                            :nudge-right="10"
                                            transition="scale-transition"
                                            offset-y min-width="290px">
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="pos.valid_until"
                                                    label="Until" v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker v-model="pos.valid_until"
                                                    @input="pos.show_valid_until = false"
                                                    no-title></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                    <v-col cols="1">
                                        <v-btn icon @click.stop="removeItem(data.tech_current_positions, i)">
                                            <v-icon color="red darken">mdi-delete</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                                <v-divider></v-divider>
                            </div>
                            <v-row class="mt-4">
                                <v-btn class="ml-2" outlined @click="addItem('technical')">
                                    Add an affiliation
                                </v-btn>
                            </v-row>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="data.isScienceManagement">
                        <v-expansion-panel-header>
                            <div>
                                <span class="role-name">Science Management Positions</span>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div v-for="(pos, i) in data.scm_current_positions"
                                :key="'scm'+i"
                            >
                                <v-row align="center">
                                    <v-col cols="12" sm="6">
                                        <v-select v-model="pos.science_manager_office_id"
                                            :items="scienceManagerOffices" item-value="id" item-text="name_en"
                                            label="Office">
                                        </v-select>
                                    </v-col>
                                    <v-col cols="12" sm="4">
                                        <v-select v-if="unitId === undefined || unitId === null"
                                            v-model="pos.unit_id"
                                            :items="units" item-value="id" item-text="short_name"
                                            label="Unit">
                                        </v-select>
                                        <v-select v-else
                                            v-model="pos.unit_id"
                                            disabled
                                            readonly
                                            :items="units" item-value="id" item-text="short_name"
                                            label="Unit">
                                        </v-select>
                                    </v-col>
                                </v-row>
                                <v-row align="center">
                                    <v-col cols="12" sm="6">
                                        <v-select v-model="pos.science_manager_position_id"
                                            :items="scienceManagerPositions" item-value="id" item-text="name_en"
                                            label="Position"
                                        ></v-select>
                                    </v-col>
                                    <v-col cols="12" sm="4">
                                        <v-text-field v-model="pos.dedication"
                                            label="Dedication (%)"
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row align="center">
                                    <v-col cols="12" sm="5">
                                        <v-menu ref="pos.show_valid_from"
                                            v-model="pos.show_valid_from"
                                            :close-on-content-click="false"
                                            :nudge-right="10"
                                            transition="scale-transition"
                                            offset-y min-width="290px">
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="pos.valid_from"
                                                    label="From" v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker v-model="pos.valid_from"
                                                    @input="pos.show_valid_from = false"
                                                    no-title></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                    <v-col cols="11" sm="5">
                                        <v-menu ref="pos.show_valid_until"
                                            v-model="pos.show_valid_until"
                                            :close-on-content-click="false"
                                            :nudge-right="10"
                                            transition="scale-transition"
                                            offset-y min-width="290px">
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="pos.valid_until"
                                                    label="Until" v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker v-model="pos.valid_until"
                                                    @input="pos.show_valid_until = false"
                                                    no-title></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                    <v-col cols="1">
                                        <v-btn icon @click.stop="removeItem(data.scm_current_positions, i)">
                                            <v-icon color="red darken">mdi-delete</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                                <v-divider></v-divider>
                            </div>
                            <v-row class="mt-4">
                                <v-btn class="ml-2" outlined @click="addItem('scienceManagement')">
                                    Add an affiliation
                                </v-btn>
                            </v-row>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="data.isAdministrative">
                        <v-expansion-panel-header>
                            <div>
                                <span class="role-name">Administrative Positions</span>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div v-for="(pos, i) in data.adm_current_positions"
                                :key="'adm'+i"
                            >
                                <v-row align="center">
                                    <v-col cols="12" sm="6">
                                        <v-select v-model="pos.administrative_office_id"
                                            :items="administrativeOffices" item-value="id" item-text="name_en"
                                            label="Office">
                                        </v-select>
                                    </v-col>
                                    <v-col cols="12" sm="4">
                                        <v-select v-if="unitId === undefined || unitId === null"
                                            v-model="pos.unit_id"
                                            :items="units" item-value="id" item-text="short_name"
                                            label="Unit">
                                        </v-select>
                                        <v-select v-else
                                            v-model="pos.unit_id"
                                            disabled
                                            readonly
                                            :items="units" item-value="id" item-text="short_name"
                                            label="Unit">
                                        </v-select>
                                    </v-col>
                                </v-row>
                                <v-row align="center">
                                    <v-col cols="12" sm="6">
                                        <v-select v-model="pos.administrative_position_id"
                                            :items="administrativePositions" item-value="id" item-text="name_en"
                                            label="Position"
                                        ></v-select>
                                    </v-col>
                                    <v-col cols="12" sm="4">
                                        <v-text-field v-model="pos.dedication"
                                            label="Dedication (%)"
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row align="center">
                                    <v-col cols="12" sm="5">
                                        <v-menu ref="pos.show_valid_from"
                                            v-model="pos.show_valid_from"
                                            :close-on-content-click="false"
                                            :nudge-right="10"
                                            transition="scale-transition"
                                            offset-y min-width="290px">
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="pos.valid_from"
                                                    label="From" v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker v-model="pos.valid_from"
                                                    @input="pos.show_valid_from = false"
                                                    no-title></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                    <v-col cols="11" sm="5">
                                        <v-menu ref="pos.show_valid_until"
                                            v-model="pos.show_valid_until"
                                            :close-on-content-click="false"
                                            :nudge-right="10"
                                            transition="scale-transition"
                                            offset-y min-width="290px">
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="pos.valid_until"
                                                    label="Until" v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker v-model="pos.valid_until"
                                                    @input="pos.show_valid_until = false"
                                                    no-title></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                    <v-col cols="1">
                                        <v-btn icon @click.stop="removeItem(data.adm_current_positions, i)">
                                            <v-icon color="red darken">mdi-delete</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                                <v-divider></v-divider>
                            </div>
                            <v-row class="mt-4">
                                <v-btn class="ml-2" outlined @click="addItem('administrative')">
                                    Add an affiliation
                                </v-btn>
                            </v-row>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                 </v-expansion-panels>
                 <div v-if="$v.data.current_positions.$error">
                    <div v-if="!$v.data.current_positions.required">
                        <p class="caption red--text">There should be at least 1 lab affiliation.</p>
                    </div>
                </div>
                <div v-if="$v.data.tech_current_positions.$error">
                    <div v-if="!$v.data.tech_current_positions.required">
                        <p class="caption red--text">There should be at least 1 facility affiliation.</p>
                    </div>
                </div>
                <div v-if="$v.data.scm_current_positions.$error">
                    <div v-if="!$v.data.scm_current_positions.required">
                        <p class="caption red--text">There should be at least 1 science management position.</p>
                    </div>
                </div>
                <div v-if="$v.data.adm_current_positions.$error">
                    <div v-if="!$v.data.adm_current_positions.required">
                        <p class="caption red--text">There should be at least 1 administrative position.</p>
                    </div>
                </div>

            </v-col>
        </v-row>
        <v-row>
            <h2 class="black--text">Cost Centers</h2>
        </v-row>
        <v-row v-for="(cost, i) in data.costCenters"
            :key="'cCenters-' + i"
            align="center"
        >
            <v-col cols="12" sm="5">
                <v-select
                    v-model="cost.cost_center_id"
                    :items="costCenters" item-value="id" item-text="short_name"
                    label="Cost Center">
                </v-select>
            </v-col>
            <v-col cols="12" sm="3">
                <v-menu ref="cost.show_valid_from"
                    v-model="cost.show_valid_from"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="cost.valid_from"
                            label="From" v-on="on">
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="cost.valid_from"
                            @input="cost.show_valid_from = false"
                            no-title></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="12" sm="3">
                <v-menu ref="cost.show_valid_until"
                    v-model="cost.show_valid_until"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="cost.valid_until"
                            label="Until" v-on="on">
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="cost.valid_until"
                            @input="cost.show_valid_until = false"
                            no-title></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="1">
                <v-btn icon @click.stop="removeItem(data.costCenters, i)">
                    <v-icon color="red darken">mdi-delete</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row class="mt-2 mb-8">
            <v-btn class="ml-2" outlined @click="addItem('cost-centers')">
                Add a Cost Center
            </v-btn>
        </v-row>
        <v-row>
            <h2 class="black--text">Current Professional Situation</h2>
        </v-row>
        <v-row>
            <v-col cols="12" sm="5">
                <v-select
                    v-model="data.situation_id"
                    :items="situationsCategories.situations"
                    item-value="id" item-text="name_en"
                    label="Situations">
                </v-select>
            </v-col>
            <!--
            <v-col cols="12" sm="5">
                <v-text-field
                    v-model="data.username"
                    label="Username">
                </v-text-field>
            </v-col>
            -->
        </v-row>
        <v-row>
            <v-checkbox
                v-model="data.add_fct_mctes"
                label="To be added as member of team (for FCT/MCTES)"
            ></v-checkbox>
        </v-row>
    </v-card-text>
    <v-card-actions>
        <v-row>
            <v-col cols="6" sm="4">
                <v-btn type="submit"
                    outlined
                    color="blue darken-1"
                    text
                >
                    Add Member
                </v-btn>
            </v-col>
            <v-col cols="2" sm="1">
                <v-progress-circular indeterminate
                        v-show="progress"
                        :size="20" :width="2"
                        color="primary"></v-progress-circular>
                <v-icon v-show="success" color="green">mdi-check</v-icon>
                <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
            </v-col>
        </v-row>
    </v-card-actions>
</v-form>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import {
    required, sameAs, maxLength, email,
    // requiredIf,
    // minValue, maxValue, integer
} from 'vuelidate/lib/validators'

export default {

    props: {
        segmentType: String,
        unitId: Number,
        cityId: Number,
        unitData: Object,
        cityData: Object,
        managerId: Number,
        endpoint: String,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            date_menu_birth: false,
            data: {
                username: '',
                password: '',
                passwordConfirm: '',
                name: '',
                colloquial_name: '',
                gender: null,
                birth_date: null,
                countries: null,
                personal_addresses: {
                    address: undefined,
                    postal_code: undefined,
                    city: undefined,
                },
                personal_emails: { email: undefined },
                personal_phones: { phone: undefined },
                emails: { email: undefined },
                phones: {
                    phone: undefined,
                    extension: undefined,
                },
                degrees: [],
                ciencia_id: null,
                ORCID: null,

                current_institutional_affiliations: [],
                poles: null,
                roles: [],
                currentUnit: null,
                isScientific: false,
                isTechnical: false,
                isScienceManagement: false,
                isAdministrative: false,
                current_positions: [],
                tech_current_positions: [],
                scm_current_positions: [],
                adm_current_positions: [],
                costCenters: [],
                situation_id: null,
                add_fct_mctes: false,
            },
            genders: [
                {id: 'M', value: 'Male'},
                {id: 'F', value: 'Female'},
            ],
            countries: [],
            loadingCountries: false,
            searchCountries: null,
            departments: [],
            roles: [],
            poles: null,
            units: [],
            facilities: [],
            labPositions: [],
            technicianPositions: [],
            scienceManagerPositions: [],
            scienceManagerOffices: [],
            administrativePositions: [],
            administrativeOffices: [],
            costCenters: [],
            degrees: [],
            situationsCategories: {},
        }
    },
    mounted () {
        this.initialize();
        this.getCountries();
        this.getDepartments();
        this.getRoles();
        this.getPoles();
        this.getUnits();
        this.getLabPositions();
        this.getFacilities();
        this.getTechnicianPositions();
        this.getScienceManagerPositions();
        this.getScienceManagerOffices();
        this.getAdministrativePositions();
        this.getAdministrativeOffices();
        this.getCostCenters();
        this.getDegrees();
        this.getSituationsCategories();
    },
    watch: {
        unitId () {
            this.initialize();
        },
        cityId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            this.data.username = '';
            this.data.password = '';
            this.data.isScientific = false;
            this.data.isTechnical = false;
            this.data.isScienceManagement = false;
            this.data.isAdministrative = false;
            this.data.current_institutional_affiliations = [];
            this.data.roles = [];
            this.data.currentUnit = this.unitId;
            this.data.current_positions = [];
            this.data.tech_current_positions = [];
            this.data.scm_current_positions = [];
            this.data.adm_current_positions = [];
            if (this.cityId !== null && this.cityId !== undefined) {
                this.data.poles = this.cityId;
            } else {
                this.data.poles = null;
            }
            this.data.costCenters = [];

        },
        submitForm() {
            this.$v.$touch();
            if (this.$v.$invalid) {
                console.log('Error in filling form');
            } else {
                this.progress = true;
                let urlCreate = [];
                if (this.$store.state.session.loggedIn) {
                    this.data.changedBy = this.$store.state.session.userID;
                    let url = 'api/managers/' + this.$store.state.session.userID
                    if (this.unitId) {
                        url = url + '/units/' + this.unitId
                    }
                    if (this.cityId) {
                        url = url + '/cities/' + this.cityId
                    }
                    url = url + '/members'
                    urlCreate.push({
                        url: url,
                        body: this.data,
                    });
                    console.log(urlCreate)

                    Promise.all(
                        urlCreate.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .then( () => {
                        this.progress = false;
                        this.success = true;
                        setTimeout(() => {
                            this.success = false;
                            this.$refs.form.reset();
                            this.$v.$reset();
                        }, 1500);
                        this.data = {
                            username: '',
                            password: '',
                            passwordConfirm: '',
                            name: '',
                            colloquial_name: '',
                            gender: null,
                            birth_date: null,
                            countries: null,
                            personal_addresses: {
                                address: undefined,
                                postal_code: undefined,
                                city: undefined,
                            },
                            personal_emails: { email: undefined },
                            personal_phones: { phone: undefined },
                            emails: { email: undefined },
                            phones: {
                                phone: undefined,
                                extension: undefined,
                            },
                            degrees: [],
                            current_institutional_affiliations: [],
                            poles: null,
                            roles: [],
                            currentUnit: null,
                            isScientific: false,
                            isTechnical: false,
                            isScienceManagement: false,
                            isAdministrative: false,
                            current_positions: [],
                            tech_current_positions: [],
                            scm_current_positions: [],
                            adm_current_positions: [],
                            costCenters: [],
                            situation_id: null,
                            add_fct_mctes: false,
                        };
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
        getDegrees() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'degrees';
                return subUtil.getPublicInfo(vm, urlSubmit, 'degrees');
            }
        },
        getCountries() {
            var this_vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'countries';
                return subUtil.getPublicInfo(this_vm, urlSubmit, 'countries');
            }
        },
        getDepartments () {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'departments';
                return subUtil.getPublicInfo(vm, urlSubmit, 'departments');
            }
        },
        getPoles() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'poles';
                return subUtil.getPublicInfo(vm, urlSubmit, 'poles');
            }
        },
        getRoles() {
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'roles';
                this.$http.get(urlSubmit, {})
                .then((result) => {
                    this.roles = result.data.result;
                })
            }
        },
        getUnits() {
            let vm = this;
            subUtil.getPublicInfo(vm, 'api/v2/' + 'units', 'units');
        },
        getLabPositions () {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'lab-positions';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labPositions');
            }
        },
        getTechnicianPositions() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'technician-positions';
                return subUtil.getPublicInfo(vm, urlSubmit, 'technicianPositions');
            }
        },
        getFacilities() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'facilities';
                return subUtil.getPublicInfo(vm, urlSubmit, 'facilities');
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
        getCostCenters () {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'cost-centers';
                return subUtil.getPublicInfo(vm, urlSubmit, 'costCenters');
            }
        },
        getSituationsCategories() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'situations-categories';
                return subUtil.getPublicInfo(vm, urlSubmit, 'situationsCategories');
            }
        },
        addItem(role) {
            if (role === 'scientific') {
                if (this.unitId === undefined || this.unitId === null) {
                    this.data.current_positions.push({
                        id: 'new',
                        lab_position_id: null,
                        valid_from: null,
                        valid_until: null,
                        groups: [
                            {
                                units: [{}]
                            }
                        ]
                    });
                } else {
                    this.data.current_positions.push({
                        id: 'new',
                        lab_position_id: null,
                        valid_from: null,
                        valid_until: null,
                        groups: [
                            {
                                units: [this.unitData]
                            }
                        ]
                    });
                    this.changeGroupsList(this.unitId, this.data.current_positions.length - 1)
                }
            } else if (role === 'technical') {
                if (this.unitId === undefined || this.unitId === null) {
                    this.data.tech_current_positions.push({
                        id: 'new',
                        technician_position_id: null,
                        technician_office_id: null,
                        unit_id: null,
                        dedication: null,
                        valid_from: null,
                        valid_until: null,
                    });
                } else {
                    this.data.tech_current_positions.push({
                        id: 'new',
                        technician_position_id: null,
                        technician_office_id: null,
                        unit_id: this.unitId,
                        dedication: null,
                        valid_from: null,
                        valid_until: null,
                    });
                }
            } else if (role === 'scienceManagement') {
                if (this.unitId === undefined || this.unitId === null) {
                    this.data.scm_current_positions.push({
                        id: 'new',
                        science_manager_position_id: null,
                        science_manager_office_id: null,
                        unit_id: null,
                        dedication: null,
                        valid_from: null,
                        valid_until: null,
                    });
                } else {
                    this.data.scm_current_positions.push({
                        id: 'new',
                        science_manager_position_id: null,
                        science_manager_office_id: null,
                        unit_id: this.unitId,
                        dedication: null,
                        valid_from: null,
                        valid_until: null,
                    });
                }
            } else if (role === 'administrative') {
                if (this.unitId === undefined || this.unitId === null) {
                    this.data.adm_current_positions.push({
                        id: 'new',
                        administrative_position_id: null,
                        administrative_office_id: null,
                        unit_id: null,
                        dedication: null,
                        valid_from: null,
                        valid_until: null,
                    });
                } else {
                    this.data.adm_current_positions.push({
                        id: 'new',
                        administrative_position_id: null,
                        administrative_office_id: null,
                        unit_id: this.unitId,
                        dedication: null,
                        valid_from: null,
                        valid_until: null,
                    });
                }
            } else if (role === 'institutional-affiliation') {
                this.data.current_institutional_affiliations.push({
                    id: 'new',
                });
            } else if (role === 'cost-centers') {
                this.data.costCenters.push({
                    id: 'new',
                });
            } else if (role === 'degrees') {
                this.data.degrees.push({
                    id: 'new',
                });
            }
        },
        removeItem(list, ind) {
            list.splice(ind, 1);
        },
        changedRoles() {
            this.rolesChanged = true;
            this.data.isScientific = false;
            this.data.isTechnical= false;
            this.data.isScienceManagement= false;
            this.data.isAdministrative= false;
            for (let el in this.data.roles) {
                if (this.data.roles[el].role_id === 1) {
                    this.data.isScientific = true;
                }
                if (this.data.roles[el].role_id === 2) {
                    this.data.isTechnical = true;
                }
                if (this.data.roles[el].role_id === 3) {
                    this.data.isScienceManagement = true;
                }
                if (this.data.roles[el].role_id === 4) {
                    this.data.isAdministrative = true;
                }
            }
        },
        changeGroupsList(unit_id, ind) {
            for (let indUnit in this.units) {
                if (this.units[indUnit].id === unit_id) {
                    this.$set(this.data.current_positions[ind], 'unit_groups', this.units[indUnit].groups);
                    this.$set(this.data.current_positions[ind], 'unit_group_labs', []);
                    this.$set(this.data.current_positions[ind].groups[0], 'id', null);
                    break;
                }
            }
        },
        changeLabsList(unit_id, group_id, ind) {
            for (let indUnit in this.units) {
                if (this.units[indUnit].id === unit_id) {
                    for (let indGroup in this.units[indUnit].groups) {
                        if (this.units[indUnit].groups[indGroup].id === group_id) {
                            this.$set(this.data.current_positions[ind],
                                'unit_group_labs',
                                this.units[indUnit].groups[indGroup].labs);
                            this.$set(this.data.current_positions[ind], 'lab_id', null);
                            break;
                        }
                    }
                    break;
                }
            }
        },
    },
    validations: {
        data: {
            username: {
                required,
                isUnique (value) {
                    if (this.$store.state.session.loggedIn && value !== undefined) {
                        if (value.length > 0) {
                            let urlSubmit = 'api/people/'
                                    + this.$store.state.session.personID
                                    + '/users/' + value;
                            return subUtil.getInfoPopulate(this, urlSubmit, true, true)
                            .then( (result) => {
                                if (result.valid) {
                                    return result.valid;
                                } else {
                                    return false;
                                }
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
            password: {required},
            passwordConfirm: { confirmPassword: sameAs('password') },
            name: { maxLength: maxLength(100), required },
            colloquial_name: { maxLength: maxLength(100), required },
            personal_emails: {
                email: { email }
            },
            emails: {
                email: { email }
            },
            poles: { required },
            roles: { required },
            current_positions: {
                /*$each: {
                    dedication: {
                        integer,
                        maxValue: maxValue(100),
                        minValue: minValue(0),
                    },
                    /*
                    required: requiredIf(function () {
                        return this.data.isScientific;
                    }),
                }
                */
            },
            tech_current_positions: {
                /*$each: {
                    required: requiredIf(function () {
                        return this.data.isTechnical;
                    }),
                }*/
            },
            scm_current_positions: {
                /*$each: {
                    required: requiredIf(function () {
                        return this.data.isScienceManagement;
                    }),
                }*/
            },
            adm_current_positions: {
                /*$each: {
                    required: requiredIf(function () {
                        return this.data.isAdministrative;
                    }),
                }*/
            },

        }
    }
}
</script>

<style scoped>
.role-name {
    font-weight: bolder;
    font-size:1.3em;
}
</style>