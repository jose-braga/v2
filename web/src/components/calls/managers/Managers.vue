<template>
<div>
    <v-app-bar prominent app>
        <v-row  align="center">
            <v-col cols="1">
                <img src="/images/logo/ucibio-logo.png" width="40">
            </v-col>
            <v-col cols="10" class="ml-auto">Calls: Manager login</v-col>
        </v-row>
    </v-app-bar>
    <div v-if="!loggedIn" class="px-4">
        <v-form ref="form"
                @submit.prevent="submitForm">
            <v-card pa-2>
                <v-card-title>
                    <span class="headline">Fill in login credentials</span>
                </v-card-title>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model.trim="$v.data.username.$model"
                                :error="$v.data.username.$error"
                                label="Username">
                            </v-text-field>
                            <div v-if="$v.data.username.$error">
                                <p v-if="!$v.data.username.required" class="caption red--text">Username is required.</p>
                            </div>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field
                                v-model="$v.data.password.$model"
                                :error="$v.data.password.$error"
                                :label="passwordLabel"
                                type="password">
                            </v-text-field>
                            <div v-if="$v.data.password.$error">
                                <p v-if="!$v.data.password.required" class="caption red--text">{{passwordLabel}} is required.</p>
                            </div>
                        </v-col>
                        <v-col cols="12" v-if="showChangePassword">
                            <v-text-field v-if="showChangePassword"
                                v-model="$v.data.newPassword.$model"
                                :error="$v.data.newPassword.$error"
                                label="New Password"
                                type="password">
                            </v-text-field>
                            <div v-if="$v.data.newPassword.$error">
                                <p v-if="!$v.data.newPassword.required" class="caption red--text">Insert new password.</p>
                            </div>
                        </v-col>
                        <v-col cols="12" v-if="showChangePassword">
                            <v-text-field v-if="showChangePassword"
                                v-model="$v.data.newPasswordConfirm.$model"
                                :error="$v.data.newPasswordConfirm.$error"
                                label="Confirm New Password"
                                type="password">
                            </v-text-field>
                            <div v-if="$v.data.newPasswordConfirm.$error">
                                <p v-if="!$v.data.newPasswordConfirm.required" class="caption red--text">Please confirm password.</p>
                                <p v-if="!$v.data.newPasswordConfirm.confirmPassword" class="caption red--text">Values don't match.</p>
                            </div>
                        </v-col>
                        <v-col v-if="formError" cols="12">
                            <div v-if="formError">
                                <p class="caption red--text">Unable to submit form.</p>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
                <v-card-actions>
                    <v-container>
                        <v-row justify="center" align-content="center">
                            <v-col v-show="!showChangePassword">
                                <v-btn type="submit"
                                        v-show="!showChangePassword"
                                        color="blue darken-1" outlined>
                                        Login</v-btn>
                            </v-col>
                            <v-col v-show="!showChangePassword">
                                <v-btn color="blue darken-1" outlined
                                        v-show="!showChangePassword"
                                        @click="changePassword">Change Password</v-btn>
                            </v-col>
                            <v-col v-show="showChangePassword">
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
                    </v-container>
                </v-card-actions>
            </v-card>
        </v-form>

    </div>

</div>
</template>

<script>
import {required, requiredIf, sameAs} from 'vuelidate/lib/validators'

export default {
    data() {
        return {
            passwordLabel: 'Password',
            showChangePassword: false,
            loginError: false,
            changePasswordError: false,
            formError: false,
            data: {
                username: undefined,
                password: undefined,
                newPassword: undefined,
                newPasswordConfirm: undefined,
            }
        }
    },
    computed: {
        loggedIn () {
            return this.$store.state.session.loggedIn;
        },
    },
    created () {
        this.$store.commit('checkExistingSession', { path: undefined});
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
                            this.$router.push({ path: '/call-managers/calls' });

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
        submitChange: function () {
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
                    this.$store.commit('logoutProcedure', {path: undefined})
                    setTimeout(() => {this.changePasswordError = false;}, 3000)
                    // eslint-disable-next-line
                    console.log(error)
                });
            }

        },
        changePassword: function () {
            this.showChangePassword = true;
            this.passwordLabel = 'Old Password';
        },
        closeDialog: function () {
            this.showChangePassword = false;
            this.passwordLabel = 'Password';
        }
    },


    validations: {
        data: {
            username: {required},
            password: {required},
            newPassword: {required: requiredIf(function () { return this.showChangePassword})},
            newPasswordConfirm: {
                required: requiredIf(function () { return this.showChangePassword}),
                confirmPassword: sameAs('newPassword')
            }
        }
    }

}
</script>

<style scoped>

</style>
