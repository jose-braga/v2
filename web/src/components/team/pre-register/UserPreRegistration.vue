<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Pre-register new member</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <ul>
            <li>Username field is used for credentials, e.g.: <i>johnsmith</i>. AVOID SPACES!</li>
            <li>After pressing "Pre-register", the new user will receive an email with a link for a form in which additional data is filled.</li>
            <li>Finally, a member from the Science Management will approve the new registration.</li>
        </ul>
        {{success}}
    </v-card-text>
    <v-container class="px-6">
        <v-form ref="form"
                @submit.prevent="submitForm">
            <v-row>
                <v-col cols="12" md="6">
                    <v-text-field
                        v-model="$v.data.person.username.$model"
                        :error="$v.data.person.username.$error"
                        label="Username*">
                    </v-text-field>
                    <div v-if="$v.data.person.username.$error">
                        <div v-if="!$v.data.person.username.required">
                            <p class="caption red--text">Username is required.</p>
                        </div>
                        <div v-if="!$v.data.person.username.isUnique">
                            <p class="caption red--text">Username already taken.</p>
                        </div>
                    </div>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field
                        v-model="$v.data.person.email.$model"
                        :error="$v.data.person.email.$error"
                        label="Personal email*">
                    </v-text-field>
                    <div v-if="$v.data.person.email.$error">
                        <div v-if="!$v.data.person.email.required">
                            <p class="caption red--text">Email is required.</p>
                        </div>
                        <div v-if="!$v.data.person.email.email">
                            <p class="caption red--text">Not a valid email.</p>
                        </div>
                    </div>
                </v-col>
            </v-row>

            <v-row  v-if="depTeamId !== undefined">
                <v-col cols="12">
                    <v-select
                        v-model="$v.data.person.team_id.$model"
                        :items="myDepTeams"
                        item-value="id" item-text="name"
                        :error="$v.data.person.team_id.$error"
                        label="Team*">
                    </v-select>
                    <div v-if="$v.data.person.team_id.$error">
                        <div v-if="!$v.data.person.team_id.required">
                            <p class="caption red--text">Team is required.</p>
                        </div>
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="6">
                    <v-select v-if="labId !== undefined"
                        v-model="$v.data.person.lab_id.$model"
                        :items="myLabs"
                        item-value="id" item-text="name"
                        :error="$v.data.person.lab_id.$error"
                        label="Lab/Group*">
                    </v-select>
                    <v-select v-if="depTeamId !== undefined"
                        v-model="$v.data.person.lab_id.$model"
                        :items="myDepTeams"
                        item-value="lab_id" item-text="lab_name"
                        :error="$v.data.person.lab_id.$error"
                        label="Lab/Group*">
                    </v-select>
                    <div v-if="$v.data.person.lab_id.$error">
                        <div v-if="!$v.data.person.lab_id.required">
                            <p class="caption red--text">Lab/Group is required.</p>
                        </div>
                    </div>
                </v-col>
                <v-col cols="12" md="6">
                    <v-select v-model="$v.data.person.lab_position_id.$model"
                        :items="labPositions"
                        item-value="id" item-text="name_en"
                        :error="$v.data.person.lab_position_id.$error"
                        label="Position*">
                    </v-select>
                    <div v-if="$v.data.person.lab_position_id.$error">
                        <div v-if="!$v.data.person.lab_position_id.required">
                            <p class="caption red--text">Position is required.</p>
                        </div>
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="6">
                    <v-text-field
                        v-model="$v.data.person.dedication.$model"
                        :error="$v.data.person.dedication.$error"
                        label="Dedication (%)">
                    </v-text-field>
                    <div v-if="$v.data.person.dedication.$error">
                        <div v-if="!$v.data.person.dedication.integer">
                            <p class="caption red--text">Must be an integer.</p>
                        </div>
                        <div v-if="!$v.data.person.dedication.between">
                            <p class="caption red--text">Must be between 0 and 100.</p>
                        </div>
                    </div>
                </v-col>
                <v-col cols="12" md="6">
                    <v-select v-model="$v.data.person.city_id.$model"
                        :items="poles" item-value="id" item-text="city"
                        label="Institution Pole*">
                    </v-select>
                    <div v-if="$v.data.person.city_id.$error">
                        <div v-if="!$v.data.person.city_id.required">
                            <p class="caption red--text">Pole is required.</p>
                        </div>
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="6">
                    <v-menu ref="data.person.show_valid_from" v-model="data.person.show_valid_from"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="$v.data.person.valid_from.$model"
                                label="Start*" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="$v.data.person.valid_from.$model"
                                @input="data.person.show_valid_from = false"
                                no-title></v-date-picker>
                    </v-menu>
                    <div v-if="$v.data.person.valid_from.$error">
                        <div v-if="!$v.data.person.valid_from.required">
                            <p class="caption red--text">Date is required.</p>
                        </div>
                    </div>
                </v-col>
                <v-col cols="12" sm="6">
                    <v-menu ref="data.person.show_valid_until" v-model="data.person.show_valid_until"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="data.person.valid_until"
                                label="End" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="data.person.valid_until"
                                @input="data.person.show_valid_until = false"
                                no-title></v-date-picker>
                    </v-menu>
                </v-col>
            </v-row>
            <v-row class="px-2">
                <v-col cols="12">
                    <v-checkbox
                        v-model="data.person.must_be_added"
                        label="Add to the team reported to FCT/MCTES"
                    ></v-checkbox>
                </v-col>
            </v-row>
            <v-row align-content="center" justify="end" class="mb-1">
                <v-col cols="4" v-if="formError" class="caption red--text">
                    <div>Unable to submit form.</div>
                </v-col>
                <v-col cols="5" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Pre-Register</v-btn>
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
/**
 * For members of labs
 */

import subUtil from '@/components/common/submit-utils'
import { required, requiredIf, email, integer, between } from 'vuelidate/lib/validators'

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
            progress: false,
            success: false,
            error: false,
            formError: false,
            data: {
                person: {
                    username: '',
                    email: '',
                    team_id: null,
                    lab_id: null,
                    lab_position_id: null,
                    dedication: null,
                    city_id: null,
                    valid_from: null,
                },
            },
            poles: [],
            labs: [],
            departmentTeams: [],
            //labPositions: [],
        }
    },
    mounted() {
        this.getPoles();
        this.getLabs();
        this.getDepartmentTeams();
    },
    methods: {
        submitForm () {
            if (this.$v.$invalid) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                this.progress = true;
                let urlCreate = [];
                if (this.$store.state.session.loggedIn) {
                    this.data.person.changedBy = this.$store.state.session.userID;
                    let url
                    if (this.labId !== undefined) {
                        url = 'api/labs/' + this.labId
                                + '/people';
                    }
                    if (this.depTeamId !== undefined) {
                        url = 'api/department-teams/' + this.depTeamId
                                + '/people';
                    }
                    urlCreate.push({
                        url: url,
                        body: this.data.person,
                    });
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
                            this.data.person = {
                                username: '',
                                email: '',
                                team_id: null,
                                lab_id: null,
                                lab_position_id: null,
                                dedication: null,
                                city_id: null,
                                valid_from: null,
                            };
                            this.$v.$reset()
                            this.success = false;
                        }, 2500);
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
        getPoles () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'poles';
                return subUtil.getPublicInfo(vm, urlSubmit, 'poles');
            }
        },
        getLabs() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'labs';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labs');
            }
        },
        getDepartmentTeams() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'department-teams';
                return subUtil.getPublicInfo(vm, urlSubmit, 'departmentTeams');
            }
        },
    },
    validations: {
        data: {
            person: {
                username: {
                    required,
                    isUnique (value) {
                        if (this.$store.state.session.loggedIn
                             && value !== undefined && value !== null) {
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
                email: { required, email },
                team_id: {
                    required: requiredIf( function () {
                        return this.depTeamId !== undefined;
                    }
                )},
                lab_id: { required },
                lab_position_id: { required },
                dedication: { integer, between: between(0,100)},
                city_id: { required },
                valid_from: { required }
            }
        }
    }
}
</script>

<style scoped>

</style>