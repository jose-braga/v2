<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Research Units Affiliations</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <v-row>
            <v-col cols="12" md="4">
                <v-select v-model="data.current_pole.city_id"
                    disabled
                    :items="poles" item-value="id" item-text="city"
                    label="Current pole">
                </v-select>
            </v-col>
            <v-col cols="12" md="4" v-if="data.previous_poles.length > 0">
                <div>
                    Previous poles
                    <ul>
                        <li v-for="(pole,i) in data.previous_poles" :key="i">
                            {{pole.city}}, {{pole.valid_from}} - {{pole.valid_until}}
                        </li>
                    </ul>
                </div>
            </v-col>
            <v-col cols="12" md="4">
                <v-select v-model="data.roles"
                    multiple
                    disabled
                    :items="roles" item-value="role_id" item-text="name_en"
                    label="Roles@Units">
                </v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-expansion-panels>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <div>
                                <span class="role-name">Responsibles</span>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <Responsibles :other-person-id="otherPersonId"></Responsibles>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-expansion-panels multiple :value="data.panelOpen">
                    <v-expansion-panel v-if="data.isScientific">
                        <v-expansion-panel-header>
                            <div>
                                <span class="role-name">Lab Positions</span>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <ScientificAffiliations :other-person-id="otherPersonId"></ScientificAffiliations>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="data.isTechnical">
                        <v-expansion-panel-header>
                            <div>
                                <span class="role-name">Facilities</span>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <TechnicalAffiliations :other-person-id="otherPersonId"></TechnicalAffiliations>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="data.isScienceManagement">
                        <v-expansion-panel-header>
                            <div>
                                <span class="role-name">Science Management</span>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <ScienceManagerAffiliations :other-person-id="otherPersonId"></ScienceManagerAffiliations>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="data.isAdministrative">
                        <v-expansion-panel-header>
                            <div>
                                <span class="role-name">Administrative</span>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <AdministrativeAffiliations :other-person-id="otherPersonId"></AdministrativeAffiliations>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-col>
        </v-row>
        <v-row align-content="center" justify="center" class="pt-4 pb-2">
            <v-dialog
                v-model="dialog"
                width="500"
            >
                <template v-slot:activator="{ on }">
                    <v-btn
                        outlined
                        color="blue"
                        v-on="on"
                        >
                        Request change
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title
                        class="headline grey lighten-2"
                        primary-title
                    >
                        Change Affiliations: <br>
                        Send an email to a data manager
                    </v-card-title>
                    <v-form ref="form"
                            @submit.prevent="submitForm">
                        <v-textarea
                            v-model="message"
                            auto-grow
                            label="Text for change request"
                            rows="2"
                            class="pa-2 pt-4"
                        ></v-textarea>
                        <v-card-actions>
                            <v-btn text type="submit">Send</v-btn>
                            <div class="request-status-container">
                                <v-progress-circular indeterminate
                                        v-show="progress"
                                        :size="20" :width="2"
                                        color="primary"></v-progress-circular>
                                <v-icon v-show="success" color="green">mdi-check</v-icon>
                                <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                            </div>
                        </v-card-actions>
                    </v-form>
                </v-card>
            </v-dialog>
        </v-row>
    </v-card-text>
</v-card>

</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'
const Responsibles = () => import(/* webpackChunkName: "person-on-behalf-roles-responsibles" */ './Responsibles')
const ScientificAffiliations = () => import(/* webpackChunkName: "person-on-behalf-roles-scientific-affiliations" */ './ScientificAffiliations')
const TechnicalAffiliations = () => import(/* webpackChunkName: "person-on-behalf-roles-technical-affiliations" */ './TechnicalAffiliations')
const ScienceManagerAffiliations = () => import(/* webpackChunkName: "person-on-behalf-roles-science-manager-affiliations" */ './ScienceManagerAffiliations')
const AdministrativeAffiliations = () => import(/* webpackChunkName: "person-on-behalf-roles-administrative-affiliations" */ './AdministrativeAffiliations')

export default {
    props: {
        otherPersonId: Number,
    },
    components: {
        Responsibles,
        ScientificAffiliations,
        TechnicalAffiliations,
        ScienceManagerAffiliations,
        AdministrativeAffiliations,
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
                personName: '',
                current_pole: {},
                previous_poles: [],
                roles: [],
                isScientific: false,
                isTechnical: false,
                isScienceManagement: false,
                isAdministrative: false,
                panelOpen: [],
            },
            poles: [{id: null, city: null, sort_order: null}],
            roles: [{id: null, name_en: null, name_pt: null, sort_order: null}],
        }
    },
    created () {
        this.initialize();
        this.getPoles();
        this.getRoles();
    },
    watch: {
        otherPersonId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                let personID = this.otherPersonId;
                this.personID = personID;
                subUtil.getInfoPopulate(this, 'api/people/' + personID + '/poles', true)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    let current_pole;
                    let indCurrent;
                    let today = time.momentToDate(time.moment());
                    for (let el in result) {
                        this.data.previous_poles.push({});
                        Object.keys(result[el]).forEach(key => {
                            let value = result[el][key];
                            this.data.previous_poles[el][key] = value;
                        });
                        if (result[el].valid_from <= today
                                || result[el].valid_from === null) {
                            if (result[el].valid_until >= today
                                   || result[el].valid_until === null) {
                                current_pole = result[el];
                                indCurrent = el;
                            }
                        }
                    }
                    this.data.previous_poles.splice(indCurrent, 1);
                    this.data.current_pole = current_pole;
                })
                subUtil.getInfoPopulate(this, 'api/people/' + personID + '/roles', true)
                .then( (result) => {
                    let currentPanel = 0;
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
                        this.data.panelOpen.push(currentPanel);
                        currentPanel++;
                        Object.keys(result[el]).forEach(key => {
                            let value = result[el][key];
                            this.data.roles[el][key] = value;
                        });
                    }
                })
                subUtil.getInfoPopulate(this, 'api'
                                + '/people'
                                + '/' + this.otherPersonId
                                + '/nuclear-info', false)
                .then( (result) => {
                    this.data.personName = result.name;
                })
            } else {
                this.$refs.form.reset();
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
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                const personID = this.otherPersonId;
                this.$http.post('api/people/' + personID + '/affiliation-message',
                    {
                        data: {
                            message: this.message
                                + '\n(message sent on behalf by editor with id:'
                                + this.$store.state.session.personID + ')',
                            personName: this.data.personName,
                        }
                    },
                    {
                        headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                    }
                )
                .then(() => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {
                        this.success = false;
                        this.dialog = false;
                    }, 1500);
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    setTimeout(() => {this.error = false;}, 6000)
                    console.log(error);
                });
            }
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
