<template>
<div>
    <v-app-bar app>
        <v-row  justify="center">
            LAQV/UCIBIO Password Recovery
        </v-row>
    </v-app-bar>
    <div v-if="loggedIn" class="px-4">
        <v-form ref="form"
                @submit.prevent="submitForm"
        >
            <v-container>
                <v-row>
                    Username: {{ $route.params.username }}
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            v-model="$v.data.newPassword.$model"
                            label="New Password"
                            type="password">
                        </v-text-field>
                        <div v-if="!$v.data.newPassword.required">
                            <p class="caption red--text">Insert new password.</p>
                        </div>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field
                            v-model="$v.data.newPasswordConfirm.$model"
                            label="Confirm New Password"
                            type="password">
                        </v-text-field>
                        <div v-if="!$v.data.newPasswordConfirm.required">
                            <p class="caption red--text">Please confirm password.</p>
                        </div>
                        <div v-if="!$v.data.newPasswordConfirm.confirmPassword
                                && $v.data.newPassword.$dirty
                                && $v.data.newPasswordConfirm.$dirty">
                            <p class="caption red--text">Values don't match.</p>
                        </div>
                    </v-col>
                    <v-col v-if="formError" cols="12">
                        <div>
                            <p class="caption red--text">Unable to submit form.</p>
                        </div>
                    </v-col>
                    <v-col v-if="error" cols="12">
                        <div>
                            <p class="caption red--text">Server-side error.</p>
                        </div>
                    </v-col>
                    <v-col v-if="success" cols="12">
                        <div>
                            <p class="caption blue--text">Password change successfull
                                <br> Redirecting you to the initial page.
                            </p>
                        </div>
                    </v-col>
                    <v-col cols="12">
                        <v-btn type="submit"
                            color="blue darken-1" outlined
                        >
                            Change Password
                        </v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-form>
    </div>
    <div v-else class="px-4">
        The link you are using is incorrect!
    </div>

</div>
</template>

<script>
import { required, sameAs } from 'vuelidate/lib/validators'

export default {

    data() {
        return {
            error: false,
            success: false,
            progress: false,
            formError: false,
            loggedIn: false,
            token: '',
            data: {
                newPassword: undefined,
                newPasswordConfirm: undefined,
            }
        }
    },
    created () {
        this.checkLogin();
    },
    methods: {
        checkLogin() {
            const urlSubmit = 'api/recovery-login';
            this.$http.post(
                urlSubmit,
                {
                    username: this.$route.params.username,
                    password: this.$route.params.password,
                }, {}
            )
            .then((result) => {
                // the user is logged in
                this.loggedIn = true;
                this.token = result.data.token;
            })
            .catch((error) => {
                this.loggedIn = false;
                // eslint-disable-next-line
                console.log(error)
            });
        },
        submitForm () {
            if (this.$v.$invalid) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                const urlSubmit = 'api/recovery-change-password/' + this.$route.params.userID;
                this.$http.put(
                    urlSubmit,
                    {
                        username: this.$route.params.username,
                        password: this.$route.params.password,
                        newPassword: this.data.newPassword,
                        newPasswordConfirm: this.data.newPasswordConfirm,
                    },{
                        headers: {'Authorization': 'Bearer ' + this.token},
                    })
                .then(() => {
                    this.success = true;
                    setTimeout(() => {
                        this.$router.push({ path: '/person/personal' });
                    }, 1500)

                })
                .catch((error) => {
                    this.error = true;
                    setTimeout(() => {this.error = false;}, 3000)
                    // eslint-disable-next-line
                    console.log(error)
                });
            }

        },

    },
    validations: {
        data: {
            newPassword: { required },
            newPasswordConfirm: {
                required,
                confirmPassword: sameAs('newPassword')
            },
        }
    },
}
</script>

<style scoped>

</style>