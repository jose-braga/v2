<template>
<v-card class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Institutional Contacts</h3>
        </div>
    </v-card-title>
    <v-container>
        <v-form ref="form"
                @submit.prevent="submitForm">
            <v-row>
                <v-col cols="12" sm="4">
                    <v-text-field
                        v-model="data.phones.phone"
                        label="Personal Phone">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-text-field
                        v-model="data.phones.extension"
                        label="Extension">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-text-field
                        v-model="$v.data.emails.email.$model"
                        label="Institutional Email">
                    </v-text-field>
                    <div v-if="!$v.data.emails.email.email">
                        <p class="caption red--text">Non valid email.</p>
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <div v-if="formError">
                    <p class="caption red--text">Unable to submit form.</p>
                </div>
                <v-row align-content="center" justify="end">
                    <div>
                        <v-btn type="submit"
                            outlined color="blue">Update</v-btn>
                    </div>
                    <div class="request-status-container">
                        <v-progress-circular indeterminate
                                v-show="progress"
                                :size="20" :width="2"
                                color="primary"></v-progress-circular>
                        <v-icon v-show="success" color="green">mdi-check</v-icon>
                        <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                    </div>
                </v-row>
            </v-row>

        </v-form>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '../../common/submit-utils'
import {email} from 'vuelidate/lib/validators'

export default {
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            data: {
                emails: { email: undefined },
                phones: {
                    phone: undefined,
                    extension: undefined,
                },
            },
        }
    },
    created () {
        this.initialize();
    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                subUtil.getInfoPopulate(this, 'api/people/' + personID + '/institutional-phone', false)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    Object.keys(result).forEach(key => {
                        let value = result[key];
                        this.data.phones[key] = value;
                    });
                })

                subUtil.getInfoPopulate(this, 'api/people/' + personID + '/institutional-email', false)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    Object.keys(result).forEach(key => {
                        let value = result[key];
                        this.data.emails[key] = value;
                    });
                })

            } else {
                this.$refs.form.reset();
            }
        },
        submitForm () {
            if (this.$v.$invalid) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let requests = [];
                let personID = this.$store.state.session.personID;
                if (this.data.phones.id !== undefined) {
                    requests.push(this.$http.put('api/people/' + personID + '/institutional-phone/' + this.data.phones.id,
                        {
                            data: this.data
                        },
                        {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        }
                    ));
                } else {
                    requests.push(this.$http.post('api/people/' + personID + '/institutional-phone',
                        {
                            data: this.data
                        },
                        {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        }
                    ));
                }
                if (this.data.emails.id !== undefined) {
                    requests.push(this.$http.put('api/people/' + personID + '/institutional-email/' + this.data.emails.id,
                        {
                            data: this.data
                        },
                        {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        }
                    ));
                } else {
                    requests.push(this.$http.post('api/people/' + personID + '/institutional-email',
                        {
                            data: this.data
                        },
                        {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        }
                    ));
                }
                this.$http.all(requests)
                    .then(this.$http.spread( () => {
                        this.progress = false;
                        this.success = true;
                        setTimeout(() => {this.success = false;}, 1500)
                        this.initialize();
                    }))
                    .catch((error) => {
                        this.progress = false;
                        this.error = true;
                        this.initialize();
                        setTimeout(() => {this.error = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    })

            }
        },
    },
    validations: {
        data: {
            emails: {
                email: { email }
            },
        }
    }
}
</script>

<style scoped>

</style>