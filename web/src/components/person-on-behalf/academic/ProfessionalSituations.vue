<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Professional Situations and Categories</h3>
        </div>
    </v-card-title>
    <v-container>
        <v-form ref="form" class="pa-4"
                @submit.prevent="submitForm">
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
            <v-row align-content="center" justify="end" class="mt-4">
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
    </v-container>
</v-card>

</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'
import {minValue, maxValue, integer} from 'vuelidate/lib/validators'

export default {
    props: {
        otherPersonId: Number,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            situationsCategories : {},
            data: {
                situations: [],
            },
            toDelete: [],
            toDeleteFellowships: [],
            toDeleteContracts: [],
        }
    },
    computed: {},
    watch: {
        otherPersonId () {
            this.initialize();
        },
    },
    mounted() {
        this.getSituationsCategories();
        this.getFellowshipTypes();
        this.getManagementEntities();
        this.getFundingAgencies();
        this.initialize();

    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                let personID = this.otherPersonId;
                let urlSubmit = 'api/people/' + personID + '/professional-situations';
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    this.data.situations = result;
                    for (let ind in this.data.situations) {
                        this.updateViewCategories (this.data.situations[ind]);
                        this.$set(this.data.situations[ind], 'showDetails', false)
                        this.data.situations[ind].show_date_start = false;
                        this.data.situations[ind].show_date_end = false;
                        this.data.situations[ind].valid_from = time.momentToDate(this.data.situations[ind].valid_from);
                        this.data.situations[ind].valid_until = time.momentToDate(this.data.situations[ind].valid_until);
                        for (let indFellow in this.data.situations[ind].fellowships) {
                            let fellowship = this.data.situations[ind].fellowships[indFellow];
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
                        for (let indContract in this.data.situations[ind].contracts) {
                            let contract = this.data.situations[ind].contracts[indContract];
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
                    let personID = this.otherPersonId;
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
                    let situations = this.data.situations;
                    // 1. Create jobs
                    // 1a. Get jobID of each job created
                    // 2. Create fellowships/contracts associated with 1. (and with previously existing)
                    // 2a. Update jobs/fellowships/contracts
                    // 2b. Delete fellowships/contracts tagged to be deleted
                    // 3. Delete jobs tagged to be deleted
                    for (let ind in situations) {
                        if (situations[ind].id === 'new') {
                            urlCreate.push({
                                url: 'api/people/' + personID + '/professional-situations',
                                body: situations[ind],
                            });
                        } else {
                            urlUpdate.push({
                                url: 'api/people/' + personID
                                        + '/professional-situations/' + situations[ind].id,
                                body: situations[ind],
                            });
                            for (let indFellow in situations[ind].fellowships) {
                                if (situations[ind].fellowships[indFellow].id === 'new') {
                                    urlCreateFellowships.push({
                                        url: 'api/people/' + personID + '/professional-situations/' + situations[ind].id + '/fellowships',
                                        body: situations[ind].fellowships[indFellow],
                                    });
                                } else {
                                    urlUpdateFellowships.push({
                                        url: 'api/people/' + personID
                                            + '/professional-situations/' + situations[ind].id
                                            + '/fellowships/' + situations[ind].fellowships[indFellow].fellowship_id,
                                        body: situations[ind].fellowships[indFellow],
                                    });
                                }
                            }
                            for (let indContract in situations[ind].contracts) {
                                if (situations[ind].contracts[indContract].id === 'new') {
                                    urlCreateContracts.push({
                                        url: 'api/people/' + personID + '/professional-situations/' + situations[ind].id + '/contracts',
                                        body: situations[ind].contracts[indContract],
                                    });
                                } else {
                                    urlUpdateContracts.push({
                                        url: 'api/people/' + personID
                                            + '/professional-situations/' + situations[ind].id
                                            + '/contracts/' + situations[ind].contracts[indContract].contract_id,
                                        body: situations[ind].contracts[indContract],
                                    });
                                }
                            }
                        }
                    }
                    for (let ind in this.toDelete) {
                        urlDelete.push('api/people/' + personID
                                    + '/professional-situations/' + this.toDelete[ind].id);
                        // we must delete first fellowships/contracts associated with situation
                        for (let indFellow in this.toDelete[ind].fellowships) {
                            urlDeleteFellowships.push( 'api/people/' + personID
                                    + '/professional-situations/' + this.toDelete[ind].id
                                    + '/fellowships/' + this.toDelete[ind].fellowships[indFellow].fellowship_id);
                        }
                        for (let indContracts in this.toDelete[ind].contracts) {
                            urlDeleteContracts.push( 'api/people/' + personID
                                    + '/professional-situations/' + this.toDelete[ind].id
                                    + '/contracts/' + this.toDelete[ind].contracts[indContracts].contract_id);
                        }
                    }
                    for (let ind in this.toDeleteFellowships) {
                        urlDeleteFellowships.push('api/people/' + personID
                            + '/professional-situations/' + this.toDeleteFellowships[ind].situation.id
                            + '/fellowships/' + this.toDeleteFellowships[ind].fellowship.fellowship_id);
                    }
                    for (let ind in this.toDeleteContracts) {
                        urlDeleteContracts.push('api/people/' + personID
                            + '/professional-situations/' + this.toDeleteContracts[ind].situation.id
                            + '/contracts/' + this.toDeleteContracts[ind].contract.contract_id);
                    }
                    this.$http.all(
                        urlCreate.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .then(this.$http.spread( (...createdJobs) => {
                        for (let ind in createdJobs) {
                            let jobID = createdJobs[ind].data.result.jobID;
                            for (let indFellow in urlCreate[ind].body.fellowships) {
                                urlCreateFellowships.push({
                                    url: 'api/people/' + personID + '/professional-situations/' + jobID + '/fellowships',
                                    body: urlCreate[ind].body.fellowships[indFellow],
                                });
                            }
                            for (let indContract in urlCreate[ind].body.contracts) {
                                urlCreateContracts.push({
                                    url: 'api/people/' + personID + '/professional-situations/' + jobID + '/contracts',
                                    body: urlCreate[ind].body.contracts[indContract],
                                });
                            }
                        }
                        return this.$http.all(
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
                    }))
                    .then(this.$http.spread( () => {
                        return this.$http.all(
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
                    }))
                    .then(this.$http.spread( () => {
                        return this.$http.all(
                            urlDelete.map(el =>
                                this.$http.delete(el,
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                }))
                            )
                    }))
                    .then(this.$http.spread( () => {
                        this.progress = false;
                        this.success = true;
                        setTimeout(() => {this.success = false;}, 1500)
                        this.toDelete = [];
                        this.toDeleteFellowships = [];
                        this.toDeleteContracts = [];
                        this.initialize();
                    }))
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

<style scoped>

</style>
