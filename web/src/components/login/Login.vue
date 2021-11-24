<template>
    <v-dialog v-model="dialog"
            @input="v => v || closeDialog()"
            class="pa-2"
            max-width="470px">
        <v-form ref="form"
                @submit.prevent="submitForm"
        >
            <v-card v-show="forgotPassword" class="pa-2">
                <v-card-title>
                    <span class="headline">I forgot my password...</span>
                </v-card-title>
                <v-container>
                    <v-row class="px-2">
                        <v-col cols="12">
                            <v-text-field
                                v-model.trim="$v.data.recoveryString.$model"
                                label="Email or username*">
                            </v-text-field>
                            <div v-if="!$v.data.recoveryString.required">
                                <p class="caption red--text">Email or username needed.</p>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row class="pa-2">
                        <v-col v-if="formError" cols="12">
                            <div>
                                <p class="caption red--text">Unable to submit form.</p>
                            </div>
                        </v-col>
                        <v-col cols="12" v-if="errorRecovery">
                            <p class="caption red--text">{{ errorRecoveryMessage }}</p>
                        </v-col>
                        <v-col cols="12" v-if="recovered">
                            <p class="caption blue--text">Success! Check your email.</p>
                        </v-col>
                        <v-col cols="12">
                            <v-btn color="red darken-1" outlined
                                    @click="recover">Send recovery email</v-btn>
                        </v-col>
                        <v-col cols="12">
                            <v-btn color="blue darken-1" outlined
                                    @click="showForgot">Back</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
            <v-card v-show="!forgotPassword" class="pa-2">
                <v-card-title>
                    <span class="headline">Fill in login credentials</span>
                </v-card-title>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model.trim="$v.data.username.$model"
                                label="Username">
                            </v-text-field>
                            <div v-if="!$v.data.username.required">
                                <p class="caption red--text">Username is required.</p>
                            </div>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field
                                v-model="$v.data.password.$model"
                                :label="passwordLabel"
                                type="password">
                            </v-text-field>
                            <div v-if="!$v.data.password.required">
                                <p class="caption red--text">{{passwordLabel}} is required.</p>
                            </div>
                        </v-col>
                        <v-col cols="12" v-if="showChangePassword">
                            <v-text-field v-if="showChangePassword"
                                v-model="$v.data.newPassword.$model"
                                label="New Password"
                                type="password">
                            </v-text-field>
                            <div v-if="!$v.data.newPassword.required">
                                <p class="caption red--text">Insert new password.</p>
                            </div>
                        </v-col>
                        <v-col cols="12" v-if="showChangePassword">
                            <v-text-field v-if="showChangePassword"
                                v-model="$v.data.newPasswordConfirm.$model"
                                label="Confirm New Password"
                                type="password">
                            </v-text-field>
                            <div v-if="!$v.data.newPasswordConfirm.required">
                                <p class="caption red--text">Please confirm password.</p>
                            </div>
                            <div v-if="!$v.data.newPasswordConfirm.confirmPassword
                                    && $v.data.newPassword.$dirty
                                    && $v.data.newPasswordConfirm.$dirty
                                    && showChangePassword">
                                <p class="caption red--text">Values don't match.</p>
                            </div>
                        </v-col>
                        <v-col v-if="formError" cols="12">
                            <div v-if="formError">
                                <p class="caption red--text">Unable to submit form.</p>
                            </div>
                        </v-col>
                    </v-row>

                    <v-row class="pa-2"
                        justify="center"
                        align-content="center"
                    >
                        <v-col cols="5" v-show="!showChangePassword">
                            <v-btn type="submit"
                                    v-show="!showChangePassword"
                                    color="blue darken-1" outlined>
                                    Login</v-btn>
                        </v-col>
                        <v-col cols="7" v-show="!showChangePassword">
                            <v-btn color="blue darken-1" outlined
                                    v-show="!showChangePassword"
                                    @click="changePassword">Change Password</v-btn>
                        </v-col>
                        <v-col cols="6" v-show="showChangePassword">
                            <v-btn color="blue darken-1" outlined
                                    v-show="showChangePassword"
                                    @click="submitChange">Submit</v-btn>
                        </v-col>
                        <v-col cols="12" v-if="loginError">
                            <p class="caption red--text">There was a problem with your login!</p>
                        </v-col>
                        <v-col cols="12" v-if="changePasswordError">
                            <p class="caption red--text">There was a problem changing password!</p>
                        </v-col>

                    </v-row>
                    <v-row class="pa-2">
                        <v-col cols="12">
                            <v-btn color="red darken-1" outlined
                                    @click="showForgot()">I forgot my credentials</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </v-form>
    </v-dialog>
</template>

<script>
import { requiredIf, sameAs } from 'vuelidate/lib/validators'

export default {
    components: {
    },
    data() {
        return {
            passwordLabel: 'Password',
            showChangePassword: false,
            forgotPassword: false,
            loginError: false,
            errorRecovery: false,
            errorRecoveryMessage: '',
            recovered: false,
            changePasswordError: false,
            formError: false,
            data: {
                username: undefined,
                password: undefined,
                newPassword: undefined,
                newPasswordConfirm: undefined,
                recoveryString: '',
            }
        }
    },
    computed: {
        dialog: {
            get: function () {
                return this.$store.state.session.showLogin;
            },
            set: function (val) {
                this.$store.commit('makeLogin', {val: val});
            }
        },
    },
    methods: {
        submitForm: function () {
            if (this.$v.$invalid) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                const urlSubmit = 'api/login';
                return this.$http.post(
                    urlSubmit,
                    {
                        username: this.data.username,
                        password: this.data.password,
                    }, {})
                    .then((result) => {
                        // the user is logged in
                        if (!this.showChangePassword) {
                            this.$store.commit('afterLoginProcedure',
                            {
                                token: result.data.token,
                                showLogin: false,
                                loggedIn: true,
                            });
                            // cleans passwords so they are not hanging around in browser data
                            this.data = {
                                username: undefined,
                                password: undefined,
                                newPassword: undefined,
                                newPasswordConfirm: undefined,
                            }

                        } else {
                            this.$store.commit('afterLoginProcedure',
                            {
                                token: result.data.token,
                                showLogin: true,
                                loggedIn: false,
                            });
                        }
                        // eslint-disable-next-line
                        //console.log(result)
                        this.showChangePassword = false;
                        this.passwordLabel = 'Password'
                        return result;
                    })
                    .catch((error) => {
                        this.loginError = true;
                        setTimeout(() => {this.loginError = false;}, 3000)
                        // eslint-disable-next-line
                        console.log(error)
                    });
            }
        },
        submitChange () {
            if (this.$v.$invalid) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                this.submitForm()
                .then( () => {
                    let userID = this.$store.state.session.userID;
                    const urlSubmit = 'api/change-password/' + userID;
                    return this.$http.put(
                        urlSubmit,
                        {
                            username: this.data.username,
                            password: this.data.password,
                            newPassword: this.data.newPassword,
                            newPasswordConfirm: this.data.newPasswordConfirm,
                        },{
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        });
                })
                .then((result) => {
                    // remove previous token
                    localStorage.removeItem('v2-token');
                    return result;
                })
                .then(() => {
                    // must login with new credentials
                    this.$store.commit('makeLogin', {val: false})
                    this.showChangePassword = false;
                    this.data.password = this.data.newPassword;
                    this.submitForm();
                })
                .catch((error) => {
                    this.changePasswordError = true;
                    this.$store.commit('logoutProcedure')
                    setTimeout(() => {this.changePasswordError = false;}, 3000)
                    // eslint-disable-next-line
                    console.log(error)
                });
            }

        },
        changePassword () {
            this.showChangePassword = true;
            this.passwordLabel = 'Old Password';
        },
        recover () {
            if (this.$v.$invalid) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                const urlSubmit = 'api/generate-recovery';
                return this.$http.post(
                    urlSubmit,
                    {
                        recoveryString: this.data.recoveryString,
                    }, {})
                .then(() => {
                    this.recovered = true;
                })
                .catch( (error) => {
                    console.log(error);
                    if (error.response) {
                        this.errorRecovery = true;
                        this.errorRecoveryMessage = error.response.data.message;
                        setTimeout(() => {
                            this.errorRecovery = false;
                            this.errorRecoveryMessage = '';
                        }, 3000)
                    }
                })

            }


        },
        closeDialog () {
            this.showChangePassword = false;
            this.passwordLabel = 'Password';
        },
        showForgot () {
            this.forgotPassword = !this.forgotPassword;
        },
    },
    validations: {
        data: {
            username: {
                required: requiredIf(function () {
                    return !this.forgotPassword
                })
            },
            password: {
                required: requiredIf(function () {
                    return !this.forgotPassword
                })
            },
            newPassword: {
                required: requiredIf(function () {
                    return this.showChangePassword && !this.forgotPassword
                })
            },
            newPasswordConfirm: {
                required: requiredIf(function () {
                    return this.showChangePassword && !this.forgotPassword
                }),
                confirmPassword: sameAs('newPassword')
            },
            recoveryString: {
                required: requiredIf(function () {
                    return this.forgotPassword
                }),
            },
        }
    }
}
</script>

<style scoped>

</style>