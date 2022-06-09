<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">User data</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container class="px-6">
        <v-row>
            <v-col cols="12" md="6">
                <v-form ref="formUser"
                        @submit.prevent="submitFormUser()">
                    <v-text-field
                        v-model="$v.data.username.$model"
                        :error="$v.data.username.$error"
                        label="Username">
                    </v-text-field>
                    <div v-if="$v.data.username.$error">
                        <div v-if="!$v.data.username.isUnique">
                            <p class="caption red--text">Username already taken.</p>
                        </div>
                    </div>
                    <v-row align-content="center" justify="end" class="mt-4">
                        <v-col cols="3" v-if="formErrorUser">
                            <v-row justify="end">
                                <p class="caption red--text">Unable to submit form.</p>
                            </v-row>
                        </v-col>
                        <v-col cols="2" align-self="end">
                            <v-row justify="end">
                                <v-btn type="submit"
                                outlined color="blue">Update user</v-btn>
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
            </v-col>
            <v-col cols="12" md="6">
                <v-form ref="formPassword"
                        @submit.prevent="submitFormPassword()">
                    <v-text-field
                        v-model="$v.data.password.$model"
                        label="Password"
                        type="password">
                    </v-text-field>
                    <v-text-field
                        v-model="$v.data.passwordConfirm.$model"
                        label="Confirm Password"
                        type="password">
                    </v-text-field>
                    <div v-if="$v.data.passwordConfirm.$error">
                        <div v-if="!$v.data.passwordConfirm.confirmPassword">
                            <p class="caption red--text">Values don't match.</p>
                        </div>
                    </div>
                    <v-row align-content="center" justify="end" class="mt-4">
                        <v-col cols="3" v-if="formErrorPassword">
                            <v-row justify="end">
                                <p class="caption red--text">Unable to submit form.</p>
                            </v-row>
                        </v-col>
                        <v-col cols="2" align-self="end">
                            <v-row justify="end">
                                <v-btn type="submit"
                                outlined color="red">Reset password</v-btn>
                            </v-row>
                        </v-col>
                        <v-col cols="1">
                            <v-progress-circular indeterminate
                                    v-show="progressPassword"
                                    :size="20" :width="2"
                                    color="primary"></v-progress-circular>
                            <v-icon v-show="successPassword" color="green">mdi-check</v-icon>
                            <v-icon v-show="errorPassword" color="red">mdi-alert-circle-outline</v-icon>
                        </v-col>
                    </v-row>
                </v-form>
            </v-col>
        </v-row>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import {required, sameAs} from 'vuelidate/lib/validators'

export default {
    props: {
        personId: Number,
        managerId: Number,
        endpoint: String,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            progressPassword: false,
            successPassword: false,
            errorPassword: false,
            formErrorUser: false,
            formErrorPassword: false,
            data: {
                originalUsername: '',
                username: '',
                userID: null,
                password: '',
                passwordConfirm: '',
            },
        }
    },
    computed: {},
    watch: {
        personId () {
            this.initialize();
        },
    },
    mounted() {
        this.initialize();

    },
    methods: {
        initialize () {
            this.data.username = '';
            this.data.originalUsername = '';
            this.data.password = '';
            this.data.passwordConfirm = '';
            this.data.userID = null;
            if (this.$store.state.session.loggedIn) {
                let personID = this.personId;
                let urlSubmit = 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/users';
                subUtil.getInfoPopulate(this, urlSubmit, false)
                .then( (result) => {
                    this.data.username = result.username;
                    this.data.originalUsername = result.username;
                    this.data.userID = result.id;
                });
            }
        },
        submitFormUser () {
            this.progress = true;
            let urlUpdate = [];
            let personID = this.personId;
            if (this.$store.state.session.loggedIn) {
                urlUpdate.push({
                    url: 'api' + this.endpoint
                        + '/members'
                        + '/' + personID
                        + '/users'
                        + '/' + this.data.userID,
                    body: this.data,
                });
                Promise.all(
                    urlUpdate.map(el =>
                        this.$http.put(el.url,
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
                        //this.$refs.form.reset();
                    }, 1500);
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
        submitFormPassword () {
            this.progressPassword = true;
            let urlUpdate = [];
            let personID = this.personId;
            if (this.$store.state.session.loggedIn) {
                urlUpdate.push({
                    url: 'api' + this.endpoint
                        + '/members'
                        + '/' + personID
                        + '/password'
                        + '/' + this.data.userID,
                    body: this.data,
                });
                Promise.all(
                    urlUpdate.map(el =>
                        this.$http.put(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                )
                .then( () => {
                    this.progressPassword = false;
                    this.successPassword = true;
                    setTimeout(() => {
                        this.successPassword = false;
                        //this.$refs.form.reset();
                    }, 1500);
                    this.initialize();
                })
                .catch((error) => {
                    this.progressPassword = false;
                    this.errorPassword = true;
                    setTimeout(() => {this.errorPassword = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
    },
    validations: {
        data: {
            username: {
                isUnique (value) {
                    if (this.$store.state.session.loggedIn && value !== undefined) {
                        if (value.length > 0) {
                            let urlSubmit = 'api' + this.endpoint
                                    + '/members'
                                    + '/' + this.personId
                                    + '/users/' + value;
                            return subUtil.getInfoPopulate(this, urlSubmit, true, true)
                            .then( (result) => {
                                if (result.valid) {
                                    return result.valid;
                                } else {
                                    if (this.data.username === this.data.originalUsername) {
                                        return true;
                                    } else {
                                        return false;
                                    }
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
            passwordConfirm: {
                confirmPassword: sameAs('password')
            }
        }
    }

}
</script>

<style scoped>

</style>
