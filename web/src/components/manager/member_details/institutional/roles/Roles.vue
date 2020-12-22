<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Research Units Affiliations</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container class="px-6">
        <v-form ref="form"
                @submit.prevent="submitForm">
            <v-col cols="12" md="6">
                <v-select v-model="data.roles"
                    multiple
                    @change="changedRoles()"
                    :items="roles" item-value="role_id" item-text="name_en"
                    label="Roles@Units">
                </v-select>
            </v-col>
            <v-row cols="12" class="ml-2">
                Pole history
            </v-row>
            <v-row v-for="(pole,i) in data.poles" :key="i" align="center">
                <v-col cols="12" md="4">
                    <v-select v-model="pole.city_id"
                        :items="poles" item-value="id" item-text="city"
                        label="Pole">
                    </v-select>
                </v-col>

                <v-col cols="12" md="3">
                    <v-menu ref="date_menu" v-model="pole.date_menu_from"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="pole.valid_from"
                                label="Start date" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="pole.valid_from"
                            @input="pole.date_menu_from = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="10" md="3">
                    <v-menu ref="date_menu" v-model="pole.date_menu_until"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="pole.valid_until"
                                label="End date" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="pole.valid_until"
                            @input="pole.date_menu_until = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="1" md="2">
                    <v-btn icon @click.stop="removeItem(data.poles, i)">
                        <v-icon color="red darken">mdi-delete</v-icon>
                    </v-btn>
                </v-col>

            </v-row>
            <v-row>
                <v-btn outlined class="ml-2" @click="addItem()">
                    Add a pole
                </v-btn>
            </v-row>
            <v-row align-content="center" justify="end">
            <v-col cols="3" v-if="formError">
                <v-row justify="end">
                    <p class="caption red--text">Unable to submit form.</p>
                </v-row>
            </v-col>
            <v-col cols="2" align-self="end">
                <v-row justify="end">
                    <v-btn type="submit"
                    outlined color="blue">Update Poles/Roles</v-btn>
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
        <v-row>
            <v-col>
                <v-expansion-panels class="px-4">
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <div>
                                <span class="role-name">Responsibles</span>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <Responsibles
                                :person-id="personId"
                                :manager-id="managerId"
                                :endpoint="endpoint"
                            ></Responsibles>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
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
                            <ScientificAffiliations
                                :person-id="personId"
                                :manager-id="managerId"
                                :endpoint="endpoint"
                            ></ScientificAffiliations>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="data.isTechnical">
                        <v-expansion-panel-header>
                            <div>
                                <span class="role-name">Facilities</span>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <TechnicalAffiliations
                                :person-id="personId"
                                :manager-id="managerId"
                                :endpoint="endpoint"
                            ></TechnicalAffiliations>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="data.isScienceManagement">
                        <v-expansion-panel-header>
                            <div>
                                <span class="role-name">Science Management</span>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <ScienceManagerAffiliations
                                :person-id="personId"
                                :manager-id="managerId"
                                :endpoint="endpoint"
                            ></ScienceManagerAffiliations>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="data.isAdministrative">
                        <v-expansion-panel-header>
                            <div>
                                <span class="role-name">Administrative</span>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <AdministrativeAffiliations
                                :person-id="personId"
                                :manager-id="managerId"
                                :endpoint="endpoint"
                            ></AdministrativeAffiliations>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
        </v-row>
</v-card>

</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'
const Responsibles = () => import(/* webpackChunkName: "manager-details-roles-responsibles" */ './Responsibles')
const ScientificAffiliations = () => import(/* webpackChunkName: "manager-details-roles-scientific-affiliations" */ './ScientificAffiliations')
const TechnicalAffiliations = () => import(/* webpackChunkName: "manager-details-roles-technical-affiliations" */ './TechnicalAffiliations')
const ScienceManagerAffiliations = () => import(/* webpackChunkName: "manager-details-roles-science-manager-affiliations" */ './ScienceManagerAffiliations')
const AdministrativeAffiliations = () => import(/* webpackChunkName: "manager-details-roles-administrative-affiliations" */ './AdministrativeAffiliations')

export default {
    components: {
        Responsibles,
        ScientificAffiliations,
        TechnicalAffiliations,
        ScienceManagerAffiliations,
        AdministrativeAffiliations,
    },
    props: {
        personId: Number,
        personName: String,
        managerId: Number,
        endpoint: String,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            dialog: false,
            message: '',
            formError: false,
            data: {
                current_pole: {},
                poles: [],
                roles: [],
                isScientific: false,
                isTechnical: false,
                isScienceManagement: false,
                isAdministrative: false,
                panelOpen: [],
            },
            toDeletePoles: [],
            rolesChanged: false,
            roles: [],
            poles: [{id: null, city: null, sort_order: null}],
        }
    },
    watch: {
        personId () {
            this.initialize();
        },
    },
    mounted () {
        this.initialize();
        this.getPoles();
        this.getRoles();
        this.$root.$on('updateManagerRolesFromOffice',
            () => {
                this.initialize();
            }
        );
    },
    methods: {
        initialize () {
            this.data.isScientific = false;
            this.data.isTechnical = false;
            this.data.isScienceManagement = false;
            this.data.isAdministrative = false;
            this.data.poles = [];
            this.data.roles = [];
            if (this.$store.state.session.loggedIn) {
                let personID = this.personId;
                subUtil.getInfoPopulate(this, 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/poles', true)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    for (let el in result) {
                        this.data.poles.push({});
                        Object.keys(result[el]).forEach(key => {
                            let value = result[el][key];
                            if (key === 'valid_until' || key === 'valid_from') {
                                value = time.momentToDate(value);
                            }
                            this.$set(this.data.poles[el], key, value);
                        });
                        this.$set(this.data.poles[el], 'date_menu_from', false);
                        this.$set(this.data.poles[el], 'date_menu_until', false);
                    }
                })
                subUtil.getInfoPopulate(this, 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/roles', true)
                .then( (result) => {
                    //let currentPanel = 0;
                    for (let el in result) {
                        this.data.roles.push({});
                        if (result[el].role_id === 1) {
                            this.data.isScientific = true;
                        }
                        if (result[el].role_id === 2) {
                            this.data.isTechnical = true;
                        }
                        if (result[el].role_id === 3) {
                            this.data.isScienceManagement = true;
                        }
                        if (result[el].role_id === 4) {
                            this.data.isAdministrative = true;
                        }
                        //this.data.panelOpen.push(currentPanel);
                        //currentPanel++;
                        Object.keys(result[el]).forEach(key => {
                            let value = result[el][key];
                            this.data.roles[el][key] = value;
                        });
                    }
                })
            } else {
                this.$refs.form.reset();
            }
        },
        changedRoles() {
            this.rolesChanged = true;
            this.data.isScientific = false;
            this.data.isTechnical= false;
            this.data.isScienceManagement= false;
            this.data.isAdministrative= false;
            for (let el in this.data.roles) {
                if (this.data.roles[el] !== null) {
                    if (typeof this.data.roles[el] === 'number') {
                        if (this.data.roles[el] === 1) {
                            this.data.isScientific = true;
                        }
                        if (this.data.roles[el] === 2) {
                            this.data.isTechnical = true;
                        }
                        if (this.data.roles[el] === 3) {
                            this.data.isScienceManagement = true;
                        }
                        if (this.data.roles[el] === 4) {
                            this.data.isAdministrative = true;
                        }
                    } else {
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
                }
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreate = [];
                let urlDelete = [];
                let urlUpdate = [];
                let urlCreateRoles = [];
                let urlDeleteRoles = [];
                const personID = this.personId;
                let poles = this.data.poles;
                let roles = this.data.roles;
                for (let ind in poles) {
                    if (poles[ind].id === 'new') {
                        urlCreate.push({
                                url: 'api' + this.endpoint
                                    + '/members'
                                    + '/' + personID + '/poles',
                                body: poles[ind],
                            });

                    } else {
                        urlUpdate.push({
                                url: 'api' + this.endpoint
                                    + '/members'
                                    + '/' + personID
                                    + '/poles/' + poles[ind].id,
                                body: poles[ind],
                            });
                    }
                }
                for (let ind in this.toDeletePoles) {
                    urlDelete.push('api' + this.endpoint
                                    + '/members'
                                    + '/' + personID
                                    + '/poles/' + this.toDeletePoles[ind].id);
                }
                if (this.rolesChanged) {
                    urlDeleteRoles.push('api' + this.endpoint
                                    + '/members'
                                    + '/' + personID
                                    + '/roles');
                    for (let ind in roles) {
                        urlCreateRoles.push({
                            url: 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/roles',
                            body: roles[ind],
                        });
                    }
                }

                this.$http.all(
                    urlDeleteRoles.map(el =>
                        this.$http.delete(el,
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                )

                .then(this.$http.spread( () => {
                    return this.$http.all(
                        urlCreateRoles.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    );
                }))
                .then(this.$http.spread( () => {
                    return this.$http.all(
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
                }))
                .then(this.$http.spread( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.toDelete = [];
                    this.initialize();
                    //this.changedRoles();
                    this.$root.$emit('updateManagerRolesFromRoles')
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
        addItem() {
            this.data.poles.push({id: 'new',
                person_id: this.personId, city_id: null,
                valid_from: null, valid_until: null,
                date_menu_from: false, date_menu_until: false,});
        },
        removeItem(list, ind) {
            if (list[ind].id !== 'new') {
                this.toDeletePoles.push(list[ind]);
            }
            list.splice(ind, 1);
        },
    },
}
</script>

<style scoped>

.role-name {
    font-weight: bolder;
    font-size:1.3em;
}

</style>

