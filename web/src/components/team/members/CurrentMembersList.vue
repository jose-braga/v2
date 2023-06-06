<template>
    <v-card>
        <v-card-title primary-title>
            <div>
                <h3 class="headline">Current members and positions</h3>
            </div>
        </v-card-title>
        <v-card-text>
            <span v-if="currentGroup">Currently this team  is part of the group <b>{{currentGroup.name}}@{{currentGroup.unit.short_name}}</b>.</span>
            <p v-if="pastGroups"> Previously the team was part of the:
                <ul>
                    <li v-for="group in pastGroups" :key="group.id">
                        {{group.name}} group@{{group.units_history[0].short_name}}
                         (until {{group.valid_until | formatDate}})</li>
                </ul>
            </p>
        </v-card-text>
        <v-container fluid>
            <v-form ref="form" class="my-2 ml-2"
                v-if="depTeamId !== undefined"
                @submit.prevent="submitNewMember"
            >
                <v-row>
                    <v-col cols="6">
                        <v-btn
                            @click="showFromDB()"
                            outlined color="blue"
                        >
                            Add person already in DB
                        </v-btn>

                    </v-col>
                </v-row>
                <v-row v-if="addingFromDB" align-content="center">
                    <v-col cols="12" sm="6">
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
            <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
                class="px-2 mb-4"
            ></v-text-field>
            <v-data-table
                item-key="person_id"
                :search="search"
                :headers="headers"
                :footer-props="footerProps"
                :items="data.members"
                :items-per-page="10"
                :custom-sort="customSort"
                :sort-by="['most_recent_data.lab_position_name_en', 'name']"
                :sort-desc="[false, false]"
                multi-sort
                class="elevation-1"
            >
                <template v-slot:top>
                    <v-dialog v-model="dialog"
                        max-width="1600px"
                        width="100%"
                    >
                        <v-card>
                            <!--
                                {{ editedItem }}
                            <br>---<br>
                            {{ situationsCategories }}
                            -->
                            <v-card-title primary-title>
                                <h3 class="headline"><span class="headline">{{ editedItem.name }}</span></h3>
                            </v-card-title>
                            <v-card-text>
                                <v-expansion-panels multiple v-model="openPanel">
                                    <v-expansion-panel>
                                        <v-expansion-panel-header>
                                            <h2>Lab (or Group) affiliation data</h2>
                                        </v-expansion-panel-header>
                                        <v-expansion-panel-content>
                                            <v-form @submit.prevent="submitForm(editedItem)">
                                                <v-row align="center" justify="center">
                                                    <v-col cols="12" sm="3">
                                                        <b>Edit current position data:</b>
                                                        <v-btn v-if="!editedItem.most_recent_data.to_delete"
                                                                @click="deleteCurrent(editedItem)"
                                                                small color="red"
                                                                class="ml-2 white--text">
                                                            Delete this
                                                        </v-btn>
                                                        <v-btn v-if="editedItem.most_recent_data.to_delete"
                                                                @click="undeleteCurrent(editedItem)"
                                                                small color="red"
                                                                class="ml-2 white--text">
                                                            Undelete this
                                                        </v-btn>
                                                    </v-col>
                                                    <v-col cols="12" sm="3"
                                                        v-if="depTeamId !== undefined"
                                                    >
                                                        <v-select v-model="editedItem.most_recent_data.lab_id"
                                                            :items="labs" item-value="id" item-text="name"
                                                            disabled
                                                            label="Lab/Group"
                                                        ></v-select>
                                                    </v-col>
                                                    <v-col cols="12" sm="3">
                                                        <v-select v-model="editedItem.most_recent_data.lab_position_id"
                                                            :items="labPositions" item-value="id" item-text="name_en"
                                                            :disabled="editedItem.most_recent_data.to_delete"
                                                            label="Position"
                                                        ></v-select>
                                                    </v-col>
                                                    <v-col cols="12" sm="2">
                                                        <v-text-field v-model="editedItem.most_recent_data.dedication"
                                                            :disabled="editedItem.most_recent_data.to_delete"
                                                            label="Dedication (%)"
                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" sm="2">
                                                        <v-menu ref="editedItem.most_recent_data.show_valid_from"
                                                            v-model="editedItem.most_recent_data.show_valid_from"
                                                            :close-on-content-click="false"
                                                            :nudge-right="10"
                                                            transition="scale-transition"
                                                            offset-y min-width="290px">
                                                            <template v-slot:activator="{ on }">
                                                                <v-text-field v-model="editedItem.most_recent_data.valid_from"
                                                                    :disabled="editedItem.most_recent_data.to_delete"
                                                                    label="Started" v-on="on">
                                                                </v-text-field>
                                                            </template>
                                                            <v-date-picker v-model="editedItem.most_recent_data.valid_from"
                                                                    @input="editedItem.most_recent_data.show_valid_from = false"
                                                                    no-title></v-date-picker>
                                                        </v-menu>
                                                    </v-col>
                                                    <v-col cols="12" sm="2">
                                                        <v-menu ref="editedItem.most_recent_data.show_valid_until" v-model="editedItem.most_recent_data.show_valid_until"
                                                            :close-on-content-click="false"
                                                            :nudge-right="10"
                                                            transition="scale-transition"
                                                            offset-y min-width="290px">
                                                            <template v-slot:activator="{ on }">
                                                                <v-text-field v-model="$v.editedItem.most_recent_data.valid_until.$model"
                                                                    :error="$v.$invalid"
                                                                    :disabled="editedItem.most_recent_data.to_delete"
                                                                    label="Ended" v-on="on">
                                                                </v-text-field>
                                                            </template>
                                                            <v-date-picker v-model="$v.editedItem.most_recent_data.valid_until.$model"
                                                                    @input="editedItem.most_recent_data.show_valid_until = false"
                                                                    no-title></v-date-picker>
                                                        </v-menu>
                                                    </v-col>
                                                </v-row>
                                                <v-row align="center">
                                                    <v-col cols="12" sm="3">
                                                        <div v-if="editedItem.most_recent_data.show_add_more_recent">
                                                            <v-btn @click="editedItem.most_recent_data.show_add_more_recent = false"
                                                                    small outlined color="red">
                                                                Add newer position
                                                            </v-btn>
                                                        </div>
                                                        <div v-if="!editedItem.most_recent_data.show_add_more_recent">
                                                            <b>Insert newer data:</b>
                                                            <v-btn @click="discardNewer(editedItem)"
                                                                    small outlined color="red"
                                                                    class="ml-2">
                                                                Discard this
                                                            </v-btn>
                                                            <div class="small-text">
                                                                Please add end date to previous position
                                                            </div>
                                                        </div>
                                                    </v-col>
                                                    <v-col cols="12" sm="3" v-if="!editedItem.most_recent_data.show_add_more_recent">
                                                        <v-select v-model="editedItem.newer_data.lab_position_id"
                                                            :items="labPositions"
                                                            item-value="id" item-text="name_en"
                                                            label="Position"
                                                        ></v-select>
                                                    </v-col>
                                                    <v-col cols="12" sm="2" v-if="!editedItem.most_recent_data.show_add_more_recent">
                                                        <v-text-field v-model="editedItem.newer_data.dedication"
                                                            label="Dedication (%)"
                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" sm="2" v-if="!editedItem.most_recent_data.show_add_more_recent">
                                                        <v-menu ref="editedItem.newer_data.show_valid_from" v-model="editedItem.newer_data.show_valid_from"
                                                            :close-on-content-click="false"
                                                            :nudge-right="10"
                                                            transition="scale-transition"
                                                            offset-y min-width="290px">
                                                            <template v-slot:activator="{ on }">
                                                                <v-text-field v-model="editedItem.newer_data.valid_from"
                                                                    label="Started" v-on="on">
                                                                </v-text-field>
                                                            </template>
                                                            <v-date-picker v-model="editedItem.newer_data.valid_from"
                                                                    @input="editedItem.newer_data.show_valid_from = false"
                                                                    no-title></v-date-picker>
                                                        </v-menu>
                                                    </v-col>
                                                    <v-col cols="12" sm="2" v-if="!editedItem.most_recent_data.show_add_more_recent">
                                                        <v-menu ref="editedItem.newer_data.show_valid_until" v-model="editedItem.newer_data.show_valid_until"
                                                            :close-on-content-click="false"
                                                            :nudge-right="10"
                                                            transition="scale-transition"
                                                            offset-y min-width="290px">
                                                            <template v-slot:activator="{ on }">
                                                                <v-text-field v-model="editedItem.newer_data.valid_until"
                                                                    label="Ended" v-on="on">
                                                                </v-text-field>
                                                            </template>
                                                            <v-date-picker v-model="editedItem.newer_data.valid_until"
                                                                    @input="editedItem.newer_data.show_valid_until = false"
                                                                    no-title></v-date-picker>
                                                        </v-menu>
                                                    </v-col>
                                                </v-row>
                                                <v-card-actions>
                                                    <v-row justify="center" align="center">
                                                        <v-col cols="11" sm="2">
                                                            <v-row justify="end">
                                                                <div v-if="formError">
                                                                    <p class="caption red--text">Unable to submit form.</p>
                                                                </div>
                                                                <v-btn type="submit"
                                                                    outlined
                                                                    color="blue"
                                                                    class="mr-2">Save</v-btn>
                                                            </v-row>
                                                        </v-col>
                                                        <v-col cols="11" sm="3"
                                                            v-if="depTeamId !== undefined"
                                                        >
                                                            <v-row justify="end">
                                                                <v-btn
                                                                    @click="submitDeleteDepartmentTeam(editedItem)"
                                                                    outlined
                                                                    color="red"
                                                                    class="mr-2">Remove from team</v-btn>
                                                            </v-row>
                                                        </v-col>
                                                        <v-col cols="1" sm="3">
                                                            <v-progress-circular indeterminate
                                                                    v-show="editedItem.progress"
                                                                    :size="20" :width="2"
                                                                    color="primary"></v-progress-circular>
                                                            <v-icon v-show="editedItem.success" color="green">mdi-check</v-icon>
                                                            <v-icon v-show="editedItem.error" color="red">mdi-alert-circle-outline</v-icon>
                                                        </v-col>
                                                    </v-row>
                                                </v-card-actions>
                                            </v-form>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                    <v-expansion-panel>
                                        <v-expansion-panel-header>
                                            <h2>Professional Situation</h2>
                                        </v-expansion-panel-header>
                                        <v-expansion-panel-content>
                                            <v-form @submit.prevent="submitFormProfSituation(editedItem)">
                                                <v-row>
                                                    <v-col>
                                                        <v-btn small outlined
                                                            @click="addItem(editedItem.situations)">
                                                            Add professional situation
                                                        </v-btn>
                                                    </v-col>
                                                </v-row>
                                                <div v-for="(v,i) in $v.editedItem.situations.$each.$iter"
                                                    :key="i">
                                                    <v-row align="center">
                                                        <v-col cols="12" md="10">
                                                            <v-row>
                                                                <v-col cols="12" md="3">
                                                                    <v-select v-model="v.$model.situation_id"
                                                                        @change="updateViewCategories(v.$model)"
                                                                        :items="situationsCategories.situations"
                                                                        item-value="id" item-text="name_en"
                                                                        label="Situation">
                                                                    </v-select>
                                                                </v-col>
                                                                <v-col cols="12" md="3">
                                                                    <v-select v-model="v.$model.category_id"
                                                                        :items="v.$model.categoriesFiltered"
                                                                        item-value="category_id" item-text="category_name_en"
                                                                        label="Categories">
                                                                    </v-select>
                                                                </v-col>
                                                                <v-col cols="12" md="3">
                                                                    <v-text-field v-model="v.$model.organization"
                                                                        label="Organization">
                                                                    </v-text-field>
                                                                </v-col>
                                                                <v-col cols="12" md="1">
                                                                    <v-text-field v-model="v.$model.dedication"
                                                                        label="Dedication (%)">
                                                                    </v-text-field>
                                                                    <div v-if="!v.dedication.minValue">
                                                                        <p class="caption red--text">Min. value: 0</p>
                                                                    </div>
                                                                    <div v-if="!v.dedication.maxValue">
                                                                        <p class="caption red--text">Max. value: 100</p>
                                                                    </div>
                                                                    <div v-if="!v.dedication.integer">
                                                                        <p class="caption red--text">Must be integer</p>
                                                                    </div>
                                                                </v-col>
                                                                <v-col cols="12" md="1">
                                                                    <v-menu ref="v.$model.show_date_start" v-model="v.$model.show_date_start"
                                                                        :close-on-content-click="false"
                                                                        :nudge-right="10"
                                                                        transition="scale-transition"
                                                                        offset-y min-width="290px">
                                                                        <template v-slot:activator="{ on }">
                                                                            <v-text-field v-model="v.$model.valid_from"
                                                                                label="Started" v-on="on">
                                                                            </v-text-field>
                                                                        </template>
                                                                        <v-date-picker v-model="v.$model.valid_from"
                                                                                @input="v.$model.show_date_start = false"
                                                                                no-title></v-date-picker>
                                                                    </v-menu>
                                                                </v-col>
                                                                <v-col cols="12" md="1">
                                                                    <v-menu ref="v.$model.show_date_end" v-model="v.$model.show_date_end"
                                                                        :close-on-content-click="false"
                                                                        :nudge-right="10"
                                                                        transition="scale-transition"
                                                                        offset-y min-width="290px">
                                                                        <template v-slot:activator="{ on }">
                                                                            <v-text-field v-model="v.$model.valid_until"
                                                                                label="Ended" v-on="on">
                                                                            </v-text-field>
                                                                        </template>
                                                                        <v-date-picker v-model="v.$model.valid_until"
                                                                                @input="v.$model.show_date_end = false"
                                                                                no-title></v-date-picker>
                                                                    </v-menu>
                                                                </v-col>
                                                            </v-row>
                                                            <div v-if="v.$model.showDetails">
                                                                <div v-for="(vfellow,j) in v.$model.fellowships"
                                                                    :key="i + '-' + j">
                                                                    <v-row align="center"> Fellowship {{ j + 1}}:
                                                                        <v-btn icon @click="removeItem(v.$model.fellowships, j, 'fellowships', v.$model)">
                                                                            <v-icon color="red darken">mdi-delete</v-icon>
                                                                        </v-btn>
                                                                    </v-row>
                                                                    <v-row>
                                                                        <v-col cols="12" md="3">
                                                                            <v-select v-model="vfellow.fellowship_type_id"
                                                                                :items="fellowshipTypes"
                                                                                item-value="id" item-text="name"
                                                                                label="Fellowship Type">
                                                                            </v-select>
                                                                        </v-col>
                                                                        <v-col cols="12" md="2">
                                                                            <v-text-field v-model="vfellow.reference"
                                                                                label="Reference">
                                                                            </v-text-field>
                                                                        </v-col>
                                                                        <v-col cols="12" md="2">
                                                                            <v-select v-model="vfellow.management_entities"
                                                                                multiple
                                                                                :items="managementEntities"
                                                                                item-value="id"
                                                                                item-text="official_name"
                                                                                label="Management Entities">
                                                                            </v-select>
                                                                        </v-col>
                                                                        <v-col cols="12" md="3">
                                                                            <v-select v-model="vfellow.funding_agencies"
                                                                                multiple
                                                                                :items="fundingAgencies"
                                                                                item-value="id"
                                                                                item-text="official_name"
                                                                                label="Funding Agencies">
                                                                            </v-select>
                                                                        </v-col>
                                                                        <v-col cols="12" md="1">
                                                                            <v-menu ref="vfellow.show_date_start"
                                                                                v-model="vfellow.show_date_start"
                                                                                :close-on-content-click="false"
                                                                                :nudge-right="10"
                                                                                transition="scale-transition"
                                                                                offset-y min-width="290px">
                                                                                <template v-slot:activator="{ on }">
                                                                                    <v-text-field v-model="vfellow.start"
                                                                                        label="Started" v-on="on">
                                                                                    </v-text-field>
                                                                                </template>
                                                                                <v-date-picker v-model="vfellow.start"
                                                                                        @input="vfellow.show_date_start = false"
                                                                                        no-title></v-date-picker>
                                                                            </v-menu>
                                                                        </v-col>
                                                                        <v-col cols="12" md="1">
                                                                            <v-menu ref="vfellow.show_date_end"
                                                                                v-model="vfellow.show_date_end"
                                                                                :close-on-content-click="false"
                                                                                :nudge-right="10"
                                                                                transition="scale-transition"
                                                                                offset-y min-width="290px">
                                                                                <template v-slot:activator="{ on }">
                                                                                    <v-text-field v-model="vfellow.end"
                                                                                        label="Ended" v-on="on">
                                                                                    </v-text-field>
                                                                                </template>
                                                                                <v-date-picker v-model="vfellow.end"
                                                                                        @input="vfellow.show_date_end = false"
                                                                                        no-title></v-date-picker>
                                                                            </v-menu>
                                                                        </v-col>
                                                                    </v-row>
                                                                </div>
                                                                <div v-for="(vcontract,j) in v.$model.contracts"
                                                                        :key="i + '-' + j + '-contracts'">
                                                                    <v-row align="center"> Contract {{ j + 1}}:
                                                                        <v-btn icon @click="removeItem(v.$model.contracts, j, 'contracts', v.$model)">
                                                                            <v-icon color="red darken">mdi-delete</v-icon>
                                                                        </v-btn>
                                                                    </v-row>
                                                                    <v-row>
                                                                        <v-col cols="12" md="2">
                                                                            <v-text-field v-model="vcontract.reference"
                                                                                label="Reference">
                                                                            </v-text-field>
                                                                        </v-col>
                                                                        <v-col cols="12" md="2">
                                                                            <v-select v-model="vcontract.management_entities"
                                                                                multiple
                                                                                :items="managementEntities"
                                                                                item-value="id"
                                                                                item-text="official_name"
                                                                                label="Management Entities">
                                                                            </v-select>
                                                                        </v-col>
                                                                        <v-col cols="12" md="3">
                                                                            <v-select v-model="vcontract.funding_agencies"
                                                                                multiple
                                                                                :items="fundingAgencies"
                                                                                item-value="id"
                                                                                item-text="official_name"
                                                                                label="Funding Agencies">
                                                                            </v-select>
                                                                        </v-col>
                                                                        <v-col cols="12" md="1">
                                                                            <v-menu ref="vcontract.show_date_start"
                                                                                v-model="vcontract.show_date_start"
                                                                                :close-on-content-click="false"
                                                                                :nudge-right="10"
                                                                                transition="scale-transition"
                                                                                offset-y min-width="290px">
                                                                                <template v-slot:activator="{ on }">
                                                                                    <v-text-field v-model="vcontract.start"
                                                                                        label="Started" v-on="on">
                                                                                    </v-text-field>
                                                                                </template>
                                                                                <v-date-picker v-model="vcontract.start"
                                                                                        @input="vcontract.show_date_start = false"
                                                                                        no-title></v-date-picker>
                                                                            </v-menu>
                                                                        </v-col>
                                                                        <v-col cols="12" md="1">
                                                                            <v-menu ref="vcontract.show_date_end"
                                                                                v-model="vcontract.show_date_end"
                                                                                :close-on-content-click="false"
                                                                                :nudge-right="10"
                                                                                transition="scale-transition"
                                                                                offset-y min-width="290px">
                                                                                <template v-slot:activator="{ on }">
                                                                                    <v-text-field v-model="vcontract.end"
                                                                                        label="Ended" v-on="on">
                                                                                    </v-text-field>
                                                                                </template>
                                                                                <v-date-picker v-model="vcontract.end"
                                                                                        @input="vcontract.show_date_end = false"
                                                                                        no-title></v-date-picker>
                                                                            </v-menu>
                                                                        </v-col>
                                                                    </v-row>
                                                                </div>
                                                            </div>
                                                            <v-row v-if="v.$model.showDetails">
                                                                <v-btn small outlined class="ml-12"
                                                                    @click="addItem(v.$model.fellowships, 'fellowships')">
                                                                        Add fellowship data
                                                                </v-btn>
                                                                <v-btn small outlined class="ml-12"
                                                                    @click="addItem(v.$model.contracts, 'contracts')">
                                                                        Add contract data
                                                                </v-btn>
                                                            </v-row>
                                                        </v-col>
                                                        <v-divider vertical class="my-6"></v-divider>
                                                        <v-col cols="12" md="1">
                                                            <v-tooltip bottom>
                                                                <template v-slot:activator="{ on }">
                                                                    <v-btn icon
                                                                        v-on="on"
                                                                        @click="seeDetails(v.$model)" class="mt-3" v-show="!v.$model.showDetails"
                                                                    >
                                                                        <v-icon color="black darken">mdi-unfold-more-horizontal</v-icon>
                                                                    </v-btn>
                                                                </template>
                                                                <span>Click to get more details on this professional situation.</span>
                                                            </v-tooltip>
                                                            <v-btn icon @click="seeDetails(v.$model)" class="mt-3" v-show="v.$model.showDetails">
                                                                <v-icon color="black darken">mdi-unfold-less-horizontal</v-icon>
                                                            </v-btn>
                                                            <v-tooltip bottom>
                                                                <template v-slot:activator="{ on }">
                                                                    <v-btn icon
                                                                        v-on="on"
                                                                        @click="removeItem(editedItem.situations, i)" class="mt-3"
                                                                    >
                                                                        <v-icon color="red darken">mdi-delete</v-icon>
                                                                    </v-btn>
                                                                </template>
                                                                <span>This deletes the respective situation and all its data.</span>
                                                            </v-tooltip>
                                                        </v-col>
                                                    </v-row>
                                                    <v-row>
                                                        <v-divider></v-divider>
                                                    </v-row>
                                                </div>
                                                <v-row align-content="center" justify="end"
                                                        class="mt-6 mb-1"
                                                >
                                                    <v-col cols="3" v-if="formError">
                                                        <v-row justify="end">
                                                            <p class="caption red--text">Unable to submit form.</p>
                                                        </v-row>
                                                    </v-col>
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
                                            </v-form>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                </v-expansion-panels>
                            </v-card-text>
                        </v-card>
                    </v-dialog>
                </template>
                <template v-slot:item.action="{ item }">
                    <v-icon @click="editItem(item)">mdi-pencil</v-icon>
                </template>
            </v-data-table>
            <v-row justify="center" align="center" class="mt-4 mb-2">
                <v-col cols="12" align="center">
                    <v-row justify="center" align="center">
                        <span class="mr-4">Export to spreadsheet</span>
                        <v-btn fab color="green" @click="generateSpreadsheet(data.members)">
                            <v-icon color="white" x-large>mdi-file-excel</v-icon>
                        </v-btn>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
</template>

<script>
import time from '@/components/common/date-utils'
import subUtil from '@/components/common/submit-utils'
import {orderBy} from 'lodash'
import {utils, writeFileXLSX} from 'xlsx/xlsx.mjs'
import {requiredIf} from 'vuelidate/lib/validators'
import {minValue, maxValue, integer} from 'vuelidate/lib/validators'

function processResults(vm, result) {
    let currentMembers = [];
    let today = time.moment();
    for (let ind in result) {
        for (let indHistory in result[ind].history) {
            let validFrom = result[ind].history[indHistory].valid_from;
            let validUntil = result[ind].history[indHistory].valid_until;
            if ((validFrom === null || time.moment(validFrom).isBefore(today))
                && (validUntil === null || time.moment(validUntil).isAfter(today))
                ) {
                result[ind].progress = false;
                result[ind].success = undefined;
                result[ind].error = undefined;
                result[ind].history[indHistory].valid_from = time.momentToDate(result[ind].history[indHistory].valid_from);
                result[ind].history[indHistory].valid_until = time.momentToDate(result[ind].history[indHistory].valid_until);
                result[ind].history[indHistory].show_valid_from = false;
                result[ind].history[indHistory].show_valid_until = false;
                result[ind].history[indHistory].show_add_more_recent = true;
                result[ind].history[indHistory].to_delete = false;
                result[ind].most_recent_data = result[ind].history[indHistory];
                result[ind].newer_data = {}
                currentMembers.push(result[ind]);
                break;
            }
        }
        if (result[ind].history.length === 0) {
            result[ind].most_recent_data = {}
            result[ind].newer_data = {}
            currentMembers.push(result[ind]);
        }
    }
    return currentMembers;
}
function processForSpreadsheet(members) {
    let membersCurated = [];
    for (let ind in members) {
        let thisMember = {};
        thisMember.name = members[ind].name;
        thisMember.colloquial_name = members[ind].colloquial_name;
        thisMember.position = members[ind].most_recent_data.lab_position_name_en;
        thisMember.valid_from = members[ind].most_recent_data.valid_from;
        thisMember.valid_until = members[ind].most_recent_data.valid_until;
        thisMember.valid_from = members[ind].most_recent_data.valid_from;
        thisMember.association_key = members[ind].researcher_details[0].association_key;
        thisMember.ciencia_id = members[ind].researcher_details[0].ciencia_id;
        thisMember.ORCID = members[ind].researcher_details[0].ORCID;
        let situations = '';
        for (let indSit in members[ind].situations) {
            situations = situations
                + members[ind].situations[indSit].situation_name_en
                + ': '
                + members[ind].situations[indSit].category_name_en
                + ' ('
                + members[ind].situations[indSit].organization
                + ', '
                + time.momentToDate(members[ind].situations[indSit].valid_from)
                + '-'
                + time.momentToDate(members[ind].situations[indSit].valid_until)
                + ')'
                + '\n'
            ;
        }
        thisMember.professional_situations = situations;
        membersCurated.push(thisMember);
    }
    return membersCurated;
}
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
        labId: Number,
        labData: Object,
        myLabs: Array,
        depTeamId: Number,
        depTeamData: Object,
        myDepTeams: Array,
        labPositions: Array,
    },
    data() {
        return {
            dialog: false,
            formError: false,
            progress: false,
            success: false,
            error: false,
            editedIndex: -1,
            editedItem: {
                most_recent_data: {},
                newer_data: {},
            },
            addingFromDB: false,
            openPanel: [],
            search: '',
            headers: [
                { text: 'Name', value:'name' },
                { text: 'Position', value:'most_recent_data.lab_position_name_en' },
                { text: 'Dedication', value:'most_recent_data.dedication' },
                { text: 'Ciência ID', value:'researcher_details[0].ciencia_id', sortable: false },
                { text: 'ORCID', value:'researcher_details[0].ORCID', sortable: false },
                { text: 'Actions', value: 'action', sortable: false },
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                newStudent: {
                   person_id: null,
                },
                members: [],
            },
            searchPeople: null,
            people: [],
            labs: [],
            situationsCategories : {},
            fellowshipTypes: [],
            managementEntities: [],
            fundingAgencies: [],
            toDelete: [],
            toDeleteFellowships: [],
            toDeleteContracts: [],
            componentType: 'lab',   // might be 'lab' or 'team'
        }
    },
    mounted () {
        this.initialize();
        this.$root.$on('updateCurrentTeamMembers', () => {
            // your code goes here
            this.initialize();
        });
        this.getLabs();
        this.getPeople();
        this.getSituationsCategories();
        this.getFellowshipTypes();
        this.getManagementEntities();
        this.getFundingAgencies();
    },
    computed: {
        currentGroup () {
            let today = time.moment();
            if (this.labData !== undefined) {
                for (let ind in  this.labData.groups_history) {
                    if ((this.labData.groups_history[ind].valid_from === null ||
                        time.moment(this.labData.groups_history[ind].valid_from).isBefore(today))
                        &&
                        (this.labData.groups_history[ind].valid_until === null ||
                        time.moment(this.labData.groups_history[ind].valid_until).isAfter(today))) {
                        let currentGroup = {
                            name: this.labData.groups_history[ind].name,
                            unit: this.labData.groups_history[ind].units_history[0],
                        };
                        return currentGroup;
                    }
                }
            }
            return false;
        },
        pastGroups () {
            let today = time.moment();
            let pastGroups = [];
            if (this.labData !== undefined) {
                for (let ind in  this.labData.groups_history) {
                    if ((this.labData.groups_history[ind].valid_from === null ||
                        time.moment(this.labData.groups_history[ind].valid_from).isBefore(today))
                        && time.moment(this.labData.groups_history[ind].valid_until).isBefore(today)) {
                        pastGroups.push(this.labData.groups_history[ind]);
                        return pastGroups;
                    }
                }
            }
            return false;
        },
    },
    watch: {
        labId () {
            this.initialize();
        },
        depTeamId () {
            this.initialize();
        }
    },
    methods: {
        initialize () {
            let this_session = this.$store.state.session;
            let foundEndpoint = false;
            if (this_session.loggedIn) {
                for (let ind in this_session.permissionsEndpoints) {
                    let decomposedPath = this_session.permissionsEndpoints[ind].decomposedPath;
                    if ((decomposedPath[0] === 'labs'
                        && parseInt(decomposedPath[1], 10) === this.labId
                        && decomposedPath[2] === 'members-affiliation'
                        && this_session.permissionsEndpoints[ind].method_name === 'GET')
                        ||
                        (decomposedPath[0] === 'labs'
                        && parseInt(decomposedPath[1], 10) === this.labId
                        && this_session.permissionsEndpoints[ind].allow_all_subpaths === 1
                        && this_session.permissionsEndpoints[ind].method_name === 'GET')
                    ) {
                        foundEndpoint = true;
                        this.componentType = 'lab';
                        let urlSubmit = 'api' + '/labs/' + this.labId + '/members-affiliation';
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            let currentMembers = processResults(this, result);
                            this.data.members = currentMembers;
                        });
                    }
                    if ((decomposedPath[0] === 'department-teams'
                        && parseInt(decomposedPath[1], 10) === this.depTeamId
                        && decomposedPath[2] === 'members-affiliation'
                        && this_session.permissionsEndpoints[ind].method_name === 'GET')
                        ||
                        (decomposedPath[0] === 'department-teams'
                        && parseInt(decomposedPath[1], 10) === this.depTeamId
                        && this_session.permissionsEndpoints[ind].allow_all_subpaths === 1
                        && this_session.permissionsEndpoints[ind].method_name === 'GET')
                    ) {
                        foundEndpoint = true;
                        this.componentType = 'team';
                        let urlSubmit = 'api' + '/department-teams/' + this.depTeamId + '/members-affiliation';
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            let currentMembers = processResults(this, result);
                            this.data.members = currentMembers;
                        });
                    }
                }
                if (!foundEndpoint) {
                    this.data.members = [];
                }
            }
            //Admins and super-managers can see teams (the same way as team manager)
            if (this_session.permissionsLevel < 3) {
                if (this.labId !== undefined) {
                    this.componentType = 'lab';
                    let urlSubmit = 'api' + '/labs/' + this.labId + '/members-affiliation';
                    subUtil.getInfoPopulate(this, urlSubmit, true)
                    .then( (result) => {
                        let currentMembers = processResults(this, result);
                        this.data.members = currentMembers;
                    });
                } else if (this.depTeamId !== undefined) {
                    this.componentType = 'team';
                    let urlSubmit = 'api' + '/department-teams/' + this.depTeamId + '/members-affiliation';
                    subUtil.getInfoPopulate(this, urlSubmit, true)
                    .then( (result) => {
                        let currentMembers = processResults(this, result);
                        this.data.members = currentMembers;
                    });
                }
            }
        },
        editItem (member) {
            let url = ''
            if (this.componentType === 'lab') {
                url = 'api'
                    + '/labs/' + this.labId
                    + '/members-affiliation/' + member.person_id
                    + '/professional-situations'
                ;
            }
            if (this.componentType === 'team') {
                url = 'api'
                    + '/department-teams/' + this.depTeamId
                    + '/members-affiliation/' + member.person_id
                    + '/professional-situations'
                ;
            }
            subUtil.getInfoPopulate(this, url, true)
            .then( (result) => {
                member.situations = result;
                for (let ind in member.situations) {
                    this.updateViewCategories (member.situations[ind]);
                    this.$set(member.situations[ind], 'showDetails', false)
                    member.situations[ind].show_date_start = false;
                    member.situations[ind].show_date_end = false;
                    member.situations[ind].valid_from = time.momentToDate(member.situations[ind].valid_from);
                    member.situations[ind].valid_until = time.momentToDate(member.situations[ind].valid_until);
                    for (let indFellow in member.situations[ind].fellowships) {
                        let fellowship = member.situations[ind].fellowships[indFellow];
                        fellowship.show_date_start = false;
                        fellowship.show_date_end = false;
                        fellowship.start = time.momentToDate(fellowship.start);
                        fellowship.end = time.momentToDate(fellowship.end);
                        fellowship.maximum_extension = time.momentToDate(fellowship.maximum_extension);
                        for (let indManage in fellowship.management_entities) {
                            this.$set(fellowship.management_entities[indManage], 'id', fellowship.management_entities[indManage].management_entity_id)
                        }
                        for (let indFund in fellowship.funding_agencies) {
                            this.$set(fellowship.funding_agencies[indFund], 'id', fellowship.funding_agencies[indFund].funding_agency_id)
                        }
                    }
                    for (let indContract in member.situations[ind].contracts) {
                        let contract = member.situations[ind].contracts[indContract];
                        contract.show_date_start = false;
                        contract.show_date_end = false;
                        contract.start = time.momentToDate(contract.start);
                        contract.end = time.momentToDate(contract.end);
                        contract.maximum_extension = time.momentToDate(contract.maximum_extension);
                        for (let indManage in contract.management_entities) {
                            this.$set(contract.management_entities[indManage], 'id', contract.management_entities[indManage].management_entity_id)
                        }
                        for (let indFund in contract.funding_agencies) {
                            this.$set(contract.funding_agencies[indFund], 'id', contract.funding_agencies[indFund].funding_agency_id)
                        }
                    }
                }
                this.dialog = true;
                this.editedIndex = this.data.members.indexOf(member);
                this.editedItem = Object.assign({}, member);
            });

        },
        deleteCurrent (member) {
            alert('Warning: Deletion will only occur after pressing the "Save" button for this member.')
            member.most_recent_data.to_delete = true;
        },
        undeleteCurrent (member) {
            member.most_recent_data.to_delete = false;
        },
        discardNewer (member) {
            member.newer_data = {};
            member.most_recent_data.show_add_more_recent = true;
        },
        submitNewMember () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreate = '';
                //let personID = this.$store.state.session.personID;
                let this_session = this.$store.state.session;
                let reqCreate;
                let requests = [];
                if (this.depTeamId !== undefined) {
                    reqCreate = '/department-teams/' + this.depTeamId
                                + '/members';
                    urlCreate =  'api' + reqCreate;
                }
                for (let ind in this_session.permissionsEndpoints) {
                    if (subUtil.checkPermissions(reqCreate, 'POST',
                        this_session.permissionsEndpoints[ind].endpoint_url,
                        this_session.permissionsEndpoints[ind].method_name,
                        this_session.permissionsEndpoints[ind].allow_all_subpaths)
                    ) {
                        requests.push(this.$http.post(urlCreate,
                            {
                                data: this.data.newStudent
                            },
                            {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                            }
                        ));
                    }
                }
                if (requests.length === 0
                    && this_session.permissionsLevel < 3
                ) {
                    requests.push(this.$http.post(urlCreate,
                        {
                            data: this.data.newStudent
                        },
                        {
                        headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        }
                    ));
                }
                Promise.all(requests)
                .then( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.data.newStudent = {}
                    this.addingFromDB = false;
                    this.$root.$emit('updatePastTeamMembers')
                    this.initialize();
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
        submitForm (member) {
            if (this.$v.$invalid) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                let this_session = this.$store.state.session;
                if (this_session.loggedIn) {
                    member.most_recent_data.changed_by = this_session.userID;
                    member.progress = true;
                    let memberID = member.person_id;
                    let reqUpdate, urlUpdate,
                        reqCreate, urlCreate,
                        reqDelete, urlDelete;
                    if (this.labId !== undefined) {
                        reqUpdate = '/labs/' + this.labId
                                + '/members-affiliation/' + memberID
                                + '/position/' + member.most_recent_data.id;
                        urlUpdate = 'api' + reqUpdate;

                        reqCreate = '/labs/' + this.labId
                                    + '/members-affiliation/' + memberID
                                    + '/position';
                        urlCreate = 'api' + reqCreate;
                        reqDelete = '/labs/' + this.labId
                                    + '/members-affiliation/' + memberID
                                    + '/position/' + member.most_recent_data.id;
                        urlDelete = 'api' + reqDelete;
                    }
                    if (this.depTeamId !== undefined) {
                        reqUpdate = '/department-teams/' + this.depTeamId
                                + '/members-affiliation/' + memberID
                                + '/position/' + member.most_recent_data.id;
                        urlUpdate = 'api' + reqUpdate;

                        reqCreate = '/department-teams/' + this.depTeamId
                                    + '/members-affiliation/' + memberID
                                    + '/position';
                        urlCreate = 'api' + reqCreate;
                        reqDelete = '/department-teams/' + this.depTeamId
                                    + '/members-affiliation/' + memberID
                                    + '/position/' + member.most_recent_data.id;
                        urlDelete = 'api' + reqDelete;
                    }
                    let requests = [];
                    let alreadyCreate = false;
                    for (let ind in this_session.permissionsEndpoints) {
                        if (subUtil.checkPermissions(reqUpdate, 'PUT',
                                    this_session.permissionsEndpoints[ind].endpoint_url,
                                    this_session.permissionsEndpoints[ind].method_name,
                                    this_session.permissionsEndpoints[ind].allow_all_subpaths
                                    )
                            && !member.most_recent_data.to_delete ) {
                            requests.push(this.$http.put(urlUpdate,
                                {
                                    data: member.most_recent_data
                                },
                                {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                            ));
                        }
                        if (subUtil.checkPermissions(reqCreate, 'POST',
                                    this_session.permissionsEndpoints[ind].endpoint_url,
                                    this_session.permissionsEndpoints[ind].method_name,
                                    this_session.permissionsEndpoints[ind].allow_all_subpaths)
                            && Object.keys(member.newer_data).length > 0
                            && !alreadyCreate) {
                            alreadyCreate = true;
                            member.newer_data.changed_by = this_session.userID;
                            member.newer_data.lab_id = this.depTeamData.lab_id;
                            requests.push(this.$http.post(urlCreate,
                                {
                                    data: member.newer_data
                                },
                                {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                            ));
                        }
                        if (subUtil.checkPermissions(reqDelete, 'DELETE',
                                    this_session.permissionsEndpoints[ind].endpoint_url,
                                    this_session.permissionsEndpoints[ind].method_name,
                                    this_session.permissionsEndpoints[ind].allow_all_subpaths)
                            && member.most_recent_data.to_delete) {
                            requests.push(this.$http.delete(urlDelete,
                                {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                data: { data: member.most_recent_data },
                                }
                            ));
                        }
                    }
                    if (requests.length === 0
                        && this_session.permissionsLevel < 3
                    ) {
                        if (!member.most_recent_data.to_delete) {
                            requests.push(this.$http.put(urlUpdate,
                                {
                                    data: member.most_recent_data
                                },
                                {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                            ));
                        }
                        if (Object.keys(member.newer_data).length > 0
                            && !alreadyCreate
                        ) {
                            alreadyCreate = true;
                            member.newer_data.changed_by = this_session.userID;
                            member.newer_data.lab_id = this.depTeamData.lab_id;
                            requests.push(this.$http.post(urlCreate,
                                {
                                    data: member.newer_data
                                },
                                {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                            ));
                        }
                        if (member.most_recent_data.to_delete) {
                            requests.push(this.$http.delete(urlDelete,
                                {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                data: { data: member.most_recent_data },
                                }
                            ));
                        }
                    }
                    Promise.all(requests)
                        .then( () => {
                            member.progress = false;
                            member.success = true;
                            setTimeout(() => {member.success = false;}, 1500)
                            this.$root.$emit('updatePastTeamMembers')
                            this.initialize();
                        })
                        .catch((error) => {
                            member.progress = false;
                            member.error = true;
                            this.initialize();
                            setTimeout(() => {member.error = false;}, 6000)
                            // eslint-disable-next-line
                            console.log(error)
                        })
                }
            }
        },
        submitFormProfSituation (member) {
            if (this.$v.$invalid) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                if (this.$store.state.session.loggedIn) {
                    let personID = member.person_id;
                    let urlCreate = [];
                    let urlDelete = [];
                    let urlUpdate = [];
                    let urlCreateFellowships = [];
                    let urlDeleteFellowships = [];
                    let urlUpdateFellowships = [];
                    let urlCreateContracts = [];
                    let urlDeleteContracts = [];
                    let urlUpdateContracts = [];
                    this.progress = true;
                    let situations = member.situations;
                    // 1. Create jobs
                    // 1a. Get jobID of each job created
                    // 2. Create fellowships/contracts associated with 1. (and with previously existing)
                    // 2a. Update jobs/fellowships/contracts
                    // 2b. Delete fellowships/contracts tagged to be deleted
                    // 3. Delete jobs tagged to be deleted
                    let urlPrior = '';
                    if (this.componentType === 'lab') {
                        urlPrior = 'api'
                            + '/labs/' + this.labId
                            + '/members-affiliation/';
                    }
                    if (this.componentType === 'team') {
                        urlPrior = 'api'
                            + '/department-teams/' + this.depTeamId
                            + '/members-affiliation/';
                    }
                    for (let ind in situations) {
                        if (situations[ind].id === 'new') {
                            urlCreate.push({
                                url: urlPrior + personID
                                    + '/professional-situations',
                                body: situations[ind],
                            });
                        } else {
                            urlUpdate.push({
                                url: urlPrior + personID
                                    + '/professional-situations/' + situations[ind].id,
                                body: situations[ind],
                            });
                            for (let indFellow in situations[ind].fellowships) {
                                if (situations[ind].fellowships[indFellow].id === 'new') {
                                    urlCreateFellowships.push({
                                        url: urlPrior + personID
                                            + '/professional-situations/' + situations[ind].id
                                            + '/fellowships',
                                        body: situations[ind].fellowships[indFellow],
                                    });
                                } else {
                                    urlUpdateFellowships.push({
                                        url: urlPrior + personID
                                            + '/professional-situations/' + situations[ind].id
                                            + '/fellowships/' + situations[ind].fellowships[indFellow].fellowship_id,
                                        body: situations[ind].fellowships[indFellow],
                                    });
                                }
                            }
                            for (let indContract in situations[ind].contracts) {
                                if (situations[ind].contracts[indContract].id === 'new') {
                                    urlCreateContracts.push({
                                        url: urlPrior + personID
                                            + '/professional-situations/' + situations[ind].id
                                            + '/contracts',
                                        body: situations[ind].contracts[indContract],
                                    });
                                } else {
                                    urlUpdateContracts.push({
                                        url: urlPrior + personID
                                            + '/professional-situations/' + situations[ind].id
                                            + '/contracts/' + situations[ind].contracts[indContract].contract_id,
                                        body: situations[ind].contracts[indContract],
                                    });
                                }
                            }
                        }
                    }
                    for (let ind in this.toDelete) {
                        urlDelete.push(urlPrior + personID
                                    + '/professional-situations/' + this.toDelete[ind].id);
                        // we must delete first fellowships/contracts associated with situation
                        for (let indFellow in this.toDelete[ind].fellowships) {
                            urlDeleteFellowships.push( urlPrior + personID
                                    + '/professional-situations/' + this.toDelete[ind].id
                                    + '/fellowships/' + this.toDelete[ind].fellowships[indFellow].fellowship_id);
                        }
                        for (let indContracts in this.toDelete[ind].contracts) {
                            urlDeleteContracts.push( urlPrior + personID
                                    + '/professional-situations/' + this.toDelete[ind].id
                                    + '/contracts/' + this.toDelete[ind].contracts[indContracts].contract_id);
                        }
                    }
                    for (let ind in this.toDeleteFellowships) {
                        urlDeleteFellowships.push(urlPrior + personID
                            + '/professional-situations/' + this.toDeleteFellowships[ind].situation.id
                            + '/fellowships/' + this.toDeleteFellowships[ind].fellowship.fellowship_id);
                    }
                    for (let ind in this.toDeleteContracts) {
                        urlDeleteContracts.push(urlPrior + personID
                            + '/professional-situations/' + this.toDeleteContracts[ind].situation.id
                            + '/contracts/' + this.toDeleteContracts[ind].contract.contract_id);
                    }
                    Promise.all(
                        urlCreate.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .then( (createdJobs) => {
                        for (let ind in createdJobs) {
                            let jobID = createdJobs[ind].data.result.jobID;
                            for (let indFellow in urlCreate[ind].body.fellowships) {
                                urlCreateFellowships.push({
                                    url: urlPrior + personID
                                        + '/professional-situations/' + jobID
                                        + '/fellowships',
                                    body: urlCreate[ind].body.fellowships[indFellow],
                                });
                            }
                            for (let indContract in urlCreate[ind].body.contracts) {
                                urlCreateContracts.push({
                                    url: urlPrior + personID
                                        + '/professional-situations/' + jobID
                                        + '/contracts',
                                    body: urlCreate[ind].body.contracts[indContract],
                                });
                            }
                        }
                        return Promise.all(
                            urlCreateFellowships.map(el =>
                                this.$http.post(el.url,
                                    { data: el.body, },
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                }))
                            .concat(urlCreateContracts.map(el =>
                                this.$http.post(el.url,
                                    { data: el.body, },
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                })))
                            .concat(urlUpdate.map(el =>
                                this.$http.put(el.url,
                                    { data: el.body, },
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                })))
                            .concat(urlUpdateFellowships.map(el =>
                                this.$http.put(el.url,
                                    { data: el.body, },
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                })))
                            .concat(urlUpdateContracts.map(el =>
                                this.$http.put(el.url,
                                    { data: el.body, },
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                })))
                        )
                    })
                    .then( () => {
                        return Promise.all(
                            urlDeleteFellowships.map(el =>
                                this.$http.delete(el,
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                }))
                            .concat(urlDeleteContracts.map(el =>
                                this.$http.delete(el,
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                }))
                            )
                        );
                    })
                    .then( () => {
                        return Promise.all(
                            urlDelete.map(el =>
                                this.$http.delete(el,
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                }))
                            )
                    })
                    .then( () => {
                        this.progress = false;
                        this.success = true;
                        setTimeout(() => {this.success = false;}, 1500)
                        this.toDelete = [];
                        this.toDeleteFellowships = [];
                        this.toDeleteContracts = [];
                        this.initialize();
                    })
                    .catch((error) => {
                        this.progress = false;
                        this.error = true;
                        this.toDelete = [];
                        this.toDeleteFellowships = [];
                        this.toDeleteContracts = [];
                        this.initialize();
                        setTimeout(() => {this.error = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    })
                }
            }
        },
        submitDeleteDepartmentTeam (member) {
            let this_session = this.$store.state.session;
            if (this_session.loggedIn) {
                member.most_recent_data.changed_by = this_session.userID;
                member.progress = true;
                let memberID = member.person_id;
                let reqDelete, urlDelete;
                reqDelete = '/department-teams/' + this.depTeamId
                            + '/members-affiliation/' + memberID;
                urlDelete = 'api' + reqDelete;
                let requests = [];
                for (let ind in this_session.permissionsEndpoints) {
                    if (subUtil.checkPermissions(reqDelete, 'DELETE',
                                this_session.permissionsEndpoints[ind].endpoint_url,
                                this_session.permissionsEndpoints[ind].method_name,
                                this_session.permissionsEndpoints[ind].allow_all_subpaths)
                    ) {
                        requests.push(this.$http.delete(urlDelete,
                            {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                            data: { data: member.most_recent_data },
                            }
                        ));
                    }
                }
                if (requests.length === 0
                    && this_session.permissionsLevel < 3
                ) {
                    requests.push(this.$http.delete(urlDelete,
                        {
                        headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        data: { data: member.most_recent_data },
                        }
                    ));
                }
                Promise.all(requests)
                .then( () => {
                    member.progress = false;
                    member.success = true;
                    setTimeout(() => {member.success = false;}, 1500)
                    this.$root.$emit('updatePastTeamMembers')
                    this.initialize();
                })
                .catch((error) => {
                    member.progress = false;
                    member.error = true;
                    this.initialize();
                    setTimeout(() => {member.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        generateSpreadsheet(members) {
            let today = time.moment();
            let dateFile = time.momentToDate(today, 'Europe/Lisbon', 'YYYY-MM-DDTHHmmss');
            let filename = '';
            if (this.componentType === 'lab') {
                filename = this.labData.name.replace(/[^a-z0-9]/gi, '_');
            }
            if (this.componentType === 'team') {
                filename = this.depTeamData.name.replace(/[^a-z0-9]/gi, '_');
            }
            let url = [];
            for (let ind in members) {
                let urlGet = '';
                if (this.componentType === 'lab') {
                    urlGet = 'api'
                        + '/labs/' + this.labId
                        + '/members-affiliation/' + members[ind].person_id
                        + '/professional-situations'
                    ;
                }
                if (this.componentType === 'team') {
                    urlGet = 'api'
                        + '/department-teams/' + this.depTeamId
                        + '/members-affiliation/' + members[ind].person_id
                        + '/professional-situations'
                    ;
                }
                url.push(urlGet);
            }
            Promise.all(
                url.map(el =>
                    this.$http.get(el,
                        { headers: {'Authorization': 'Bearer ' + localStorage['v2-token'] } }
                ))
            )
            .then( (situations) => {
                for (let ind in situations) {
                    members[ind].situations = situations[ind].data.result;
                }
                let membersCurated = processForSpreadsheet(members);
                let wb = utils.book_new();
                let ws  = utils.json_to_sheet(membersCurated);
                utils.book_append_sheet(wb, ws, 'Current Team');
                writeFileXLSX(wb, filename + '_current-team-members_' + dateFile + '.xlsx');
            })
            .catch((error) => {
                console.log(error)
            })
        },
        customSort (items, sortBy, sortDesc) {
            let funcOrderArray = [];
            let directionArray = [];
            for (let ind in sortBy) {
                if (sortDesc[ind] === false) {
                    directionArray.push('asc');
                } else {
                    directionArray.push('desc');
                }
                // special cases when a column is sorted based on a different 'hidden' value
                if (sortBy[ind] === 'most_recent_data.lab_position_name_en') {
                    funcOrderArray.push(
                        function (el) {
                            return el.most_recent_data.lab_position_sort_order;
                        }
                    )
                } else {
                    funcOrderArray.push(
                        function (el) {
                            let levels = sortBy[ind].split('.');
                            let thisLevel = el;
                            for (let indLevel in levels) {
                                thisLevel = thisLevel[levels[indLevel]];
                                if (thisLevel === undefined) {
                                    break;
                                }
                            }
                            return thisLevel;
                        }
                    )
                }
            }
            items = orderBy(items, funcOrderArray, directionArray);

            return items
        },
        getLabs() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'labs';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labs');
            }
        },
        getPeople () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'people-simple';
            return subUtil.getPublicInfo(vm, urlSubmit, 'people');
        },
        getSituationsCategories() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'situations-categories';
                return subUtil.getPublicInfo(vm, urlSubmit, 'situationsCategories');
            }
        },
        getFellowshipTypes() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'fellowship-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'fellowshipTypes');
            }
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
        updateViewCategories (situation) {
            let categoriesFiltered = [];
            if (situation.situation_id !== undefined
                    && situation.situation_id !== null) {
                for (let ind in this.situationsCategories.relationships) {
                    if (this.situationsCategories.relationships[ind].situation_id === situation.situation_id) {
                        categoriesFiltered.push(this.situationsCategories.relationships[ind]);
                    }
                }
                situation.categoriesFiltered = categoriesFiltered;
            } else {
                situation.categoriesFiltered = [];
            }
        },
        addItem(list, type) {
            if (type === 'fellowships') {
                list.push({
                    id: 'new',
                    show_date_start: false,
                    show_date_end: false,
                });
            } else if (type === 'contracts') {
                list.push({
                    id: 'new',
                    show_date_start: false,
                    show_date_end: false,
                });
            } else {
                list.push({
                    id: 'new',
                    show_date_start: false,
                    show_date_end: false,
                    showDetails: false,
                    fellowships: [],
                    contracts: [],
                });
            }
        },
        removeItem(list, ind, type, parent) {
            if (type === 'fellowships') {
                if (list[ind].id !== 'new') {
                    this.toDeleteFellowships.push({
                        fellowship: list[ind],
                        situation: parent,
                    });
                }
            } else if (type === 'contracts') {
                if (list[ind].id !== 'new') {
                    this.toDeleteContracts.push({
                        contract: list[ind],
                        situation: parent,
                    });
                }
            } else {
                if (list[ind].id !== 'new') {
                    this.toDelete.push(list[ind]);
                }
            }
            list.splice(ind, 1);
        },
        seeDetails(situation) {
            situation.showDetails = !situation.showDetails;
        },
        showFromDB () {
            this.addingFromDB = !this.addingFromDB;
            this.data.newStudent = {
                person_id: null,
            };
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
    //editedItem.most_recent_data.valid_until
    validations: {
        editedItem: {
            most_recent_data: {
                valid_until: {
                    required: requiredIf(
                        function () {
                            return !this.editedItem.most_recent_data.show_add_more_recent;
                        }
                    ),
                }
            },
            situations: {
                $each: {
                    dedication: {
                        minValue: minValue(0),
                        maxValue: maxValue(100),
                        integer
                    }
                }
            },
        }
    }
}
</script>

<style scoped>

</style>