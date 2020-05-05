<template>
<v-card class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Professional Situation</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container class="px-6">
        <v-row>
            <v-col>
                <v-btn small outlined
                    @click="addItem(data.situations)">
                    Add professional situation
                </v-btn>
            </v-col>
            </v-row>
            <div v-for="(v,i) in $v.data.situations.$each.$iter"
                :key="i">
                <v-row align="center">
                    <v-col cols="12" md="10">
                        <v-row>
                            <v-col cols="6" md="3">
                                <v-select v-model="v.$model.situation_id"
                                    @change="updateViewCategories(v.$model)"
                                    @input="addValue"
                                    :items="situationsCategories.situations"
                                    item-value="id" item-text="name_en"
                                    label="Situation">
                                </v-select>
                            </v-col>
                            <v-col cols="6" md="3">
                                <v-select v-model="v.$model.category_id"
                                    :items="v.$model.categoriesFiltered"
                                    @input="addValue"
                                    item-value="category_id" item-text="category_name_en"
                                    label="Categories">
                                </v-select>
                            </v-col>
                            <v-col cols="6" md="3">
                                <v-text-field v-model="v.$model.organization"
                                    @input="addValue"
                                    label="Organization">
                                </v-text-field>
                            </v-col>
                            <v-col cols="6" md="3">
                                <v-text-field v-model="v.$model.dedication"
                                    @input="addValue"
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
                            <v-col cols="6" md="3">
                                <v-menu ref="v.$model.show_date_start" v-model="v.$model.show_date_start"
                                    :close-on-content-click="false"
                                    :nudge-right="10"
                                    transition="scale-transition"
                                    offset-y min-width="290px">
                                    <template v-slot:activator="{ on }">
                                        <v-text-field v-model="v.$model.valid_from"
                                            @input="addValue"
                                            label="Started" v-on="on">
                                        </v-text-field>
                                    </template>
                                    <v-date-picker v-model="v.$model.valid_from"
                                            @input="v.$model.show_date_start = false; addValue()"
                                            no-title></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="6" md="3">
                                <v-menu ref="v.$model.show_date_end" v-model="v.$model.show_date_end"
                                    :close-on-content-click="false"
                                    :nudge-right="10"
                                    transition="scale-transition"
                                    offset-y min-width="290px">
                                    <template v-slot:activator="{ on }">
                                        <v-text-field v-model="v.$model.valid_until"
                                            @input="addValue"
                                            label="Ended" v-on="on">
                                        </v-text-field>
                                    </template>
                                    <v-date-picker v-model="v.$model.valid_until"
                                            @input="v.$model.show_date_end = false; addValue()"
                                            no-title></v-date-picker>
                                </v-menu>
                            </v-col>
                        </v-row>
                        <div v-if="v.$model.showDetails">
                            <div v-for="(vfellow,j) in v.$model.fellowships"
                                :key="i + '-' + j">
                                <v-row align="center"> Fellowship {{ j + 1}}:
                                    <v-btn icon @click="removeItem(v.$model.fellowships, j)">
                                        <v-icon color="red darken">mdi-delete</v-icon>
                                    </v-btn>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" md="3">
                                        <v-select v-model="vfellow.fellowship_type_id"
                                            :items="fellowshipTypes"
                                            item-value="id" item-text="name"
                                            @input="addValue"
                                            label="Fellowship Type">
                                        </v-select>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-text-field v-model="vfellow.reference"
                                            @input="addValue"
                                            label="Reference">
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-select v-model="vfellow.management_entities"
                                            multiple
                                            :items="managementEntities"
                                            item-value="id"
                                            item-text="official_name"
                                            @input="addValue"
                                            label="Management Entities">
                                        </v-select>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-select v-model="vfellow.funding_agencies"
                                            multiple
                                            :items="fundingAgencies"
                                            item-value="id"
                                            item-text="official_name"
                                            @input="addValue"
                                            label="Funding Agencies">
                                        </v-select>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-menu ref="vfellow.show_date_start"
                                            v-model="vfellow.show_date_start"
                                            :close-on-content-click="false"
                                            :nudge-right="10"
                                            transition="scale-transition"
                                            offset-y min-width="290px">
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="vfellow.start"
                                                    @input="addValue"
                                                    label="Started" v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker v-model="vfellow.start"
                                                    @input="vfellow.show_date_start = false; addValue()"
                                                    no-title></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-menu ref="vfellow.show_date_end"
                                            v-model="vfellow.show_date_end"
                                            :close-on-content-click="false"
                                            :nudge-right="10"
                                            transition="scale-transition"
                                            offset-y min-width="290px">
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="vfellow.end"
                                                    @input="addValue"
                                                    label="Ended" v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker v-model="vfellow.end"
                                                    @input="vfellow.show_date_end = false; addValue()"
                                                    no-title></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                </v-row>
                            </div>
                            <div v-for="(vcontract,j) in v.$model.contracts"
                                    :key="i + '-' + j + '-contracts'">
                                <v-row align="center"> Contract {{ j + 1}}:
                                    <v-btn icon @click="removeItem(v.$model.contracts, j)">
                                        <v-icon color="red darken">mdi-delete</v-icon>
                                    </v-btn>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" md="3">
                                        <v-text-field v-model="vcontract.reference"
                                            @input="addValue"
                                            label="Reference">
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-select v-model="vcontract.management_entities"
                                            multiple
                                            :items="managementEntities"
                                            item-value="id"
                                            item-text="official_name"
                                            @input="addValue"
                                            label="Management Entities">
                                        </v-select>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-select v-model="vcontract.funding_agencies"
                                            multiple
                                            :items="fundingAgencies"
                                            item-value="id"
                                            item-text="official_name"
                                            @input="addValue"
                                            label="Funding Agencies">
                                        </v-select>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-menu ref="vcontract.show_date_start"
                                            v-model="vcontract.show_date_start"
                                            :close-on-content-click="false"
                                            :nudge-right="10"
                                            transition="scale-transition"
                                            offset-y min-width="290px">
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="vcontract.start"
                                                    @input="addValue"
                                                    label="Started" v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker v-model="vcontract.start"
                                                    @input="vcontract.show_date_start = false; addValue()"
                                                    no-title></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-menu ref="vcontract.show_date_end"
                                            v-model="vcontract.show_date_end"
                                            :close-on-content-click="false"
                                            :nudge-right="10"
                                            transition="scale-transition"
                                            offset-y min-width="290px">
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="vcontract.end"
                                                    @input="addValue"
                                                    label="Ended" v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker v-model="vcontract.end"
                                                    @input="vcontract.show_date_end = false; addValue()"
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
                        <v-btn icon @click="seeDetails(v.$model)" class="mt-3" v-if="!v.$model.showDetails">
                            <v-icon color="black darken">mdi-unfold-more-horizontal</v-icon>
                        </v-btn>
                        <v-btn icon @click="seeDetails(v.$model)" class="mt-3" v-if="v.$model.showDetails">
                            <v-icon color="black darken">mdi-unfold-less-horizontal</v-icon>
                        </v-btn>
                        <v-btn icon @click="removeItem(data.situations, i)" class="mt-3">
                            <v-icon color="red darken">mdi-delete</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row>
                    <v-divider></v-divider>
                </v-row>
            </div>
    </v-container>
</v-card>

</template>

<script>
import subUtil from '../common/submit-utils'
import {minValue, maxValue, integer} from 'vuelidate/lib/validators'

export default {
    data() {
        return {
            situationsCategories : {},
            managementEntities: [],
            fellowshipTypes: [],
            fundingAgencies: [],
            data: {
                situations: [],
            },
        }
    },
    created() {
        this.getSituationsCategories();
        this.getFellowshipTypes();
        this.getManagementEntities();
        this.getFundingAgencies();
    },
    methods: {
        addValue () {
            this.$store.commit('addPersonData', this.data);
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
        removeItem(list, ind) {
            list.splice(ind, 1);
            this.addValue();
        },
        seeDetails(situation) {
            situation.showDetails = !situation.showDetails;
        },
    },
    validations: {
        data: {
            situations: {
                $each: {
                    dedication: {
                        minValue: minValue(0),
                        maxValue: maxValue(100),
                        integer
                    }
                }
            },
        },
    },
}
</script>

<style>

</style>