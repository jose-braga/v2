<template>
    <v-form ref="form"
        @submit.prevent="submitForm">
        <v-row>
            <v-col cols="12">
                <v-text-field
                    v-model="$v.data.personal_addresses.address.$model"
                    label="Current address">
                </v-text-field>
                <div v-if="!$v.data.personal_addresses.address.maxLength">
                    <p class="caption red--text">Maximum characters: 150.</p>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="$v.data.personal_addresses.postal_code.$model"
                    label="Postal Code">
                </v-text-field>
                <div v-if="!$v.data.personal_addresses.postal_code.maxLength">
                    <p class="caption red--text">Maximum characters: 8.</p>
                </div>
                <div v-if="!$v.data.personal_addresses.postal_code.postalCodeValidate">
                    <p class="caption red--text">Invalid postal code.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.personal_addresses.city"
                    label="City">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.personal_phones.phone"
                    label="Personal Phone">
                </v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="$v.data.personal_emails.email.$model"
                    label="Personal Email">
                </v-text-field>
                <div v-if="!$v.data.personal_emails.email.email">
                    <p class="caption red--text">Invalid email.</p>
                </div>
            </v-col>
        </v-row>
        <v-row align-content="center" justify="end" class="mb-1">
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
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import {helpers, maxLength, email} from 'vuelidate/lib/validators'

const postalCodeValidate = (value) => {
    return !helpers.req(value)
           || /^\d\d\d\d-\d\d\d$/.test(value)
           || /^\d\d\d\d$/.test(value);
}

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
            formError: false,
            data: {
                personal_addresses: {
                    address: undefined,
                    postal_code: undefined,
                    city: undefined,
                },
                personal_emails: { email: undefined },
                personal_phones: { phone: undefined },
            },
        }
    },
    watch: {
        personId () {
            this.initialize();
        },
    },
    created () {
        this.initialize();
    },
    methods: {
        initialize () {
            this.data =  {
                personal_addresses: {
                    address: undefined,
                    postal_code: undefined,
                    city: undefined,
                },
                personal_emails: { email: undefined },
                personal_phones: { phone: undefined },
            };
            if (this.$store.state.session.loggedIn) {
                let personID = this.personId;
                let urlSubmit = 'api' + this.endpoint
                                + '/members'
                                + '/' + personID
                                + '/personal-address';
                subUtil.getInfoPopulate(this, urlSubmit, false)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    if (result !== undefined) {
                        Object.keys(result).forEach(key => {
                            let value = result[key];
                            this.$set(this.data.personal_addresses, key, value);
                        });
                    }
                })
                urlSubmit = 'api' + this.endpoint
                                + '/members'
                                + '/' + personID
                                + '/personal-phone';
                subUtil.getInfoPopulate(this, urlSubmit, false)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    if (result !== undefined) {
                        Object.keys(result).forEach(key => {
                            let value = result[key];
                            this.$set(this.data.personal_phones, key, value);
                        });
                    }
                })
                urlSubmit = 'api' + this.endpoint
                                + '/members'
                                + '/' + personID
                                + '/personal-email';
                subUtil.getInfoPopulate(this, urlSubmit, false)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    if (result !== undefined) {
                        Object.keys(result).forEach(key => {
                            let value = result[key];
                            this.$set(this.data.personal_emails, key, value);
                        });
                    }
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
                let personID = this.personId;
                if (this.data.personal_addresses.id !== undefined) {
                    requests.push(this.$http.put(
                                'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/personal-address/' + this.data.personal_addresses.id,
                        {
                            data: this.data
                        },
                        {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        }
                    ));
                } else {
                    requests.push(this.$http.post(
                                'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/personal-address',
                        {
                            data: this.data
                        },
                        {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        }
                    ));
                }
                if (this.data.personal_phones.id !== undefined) {
                    requests.push(this.$http.put(
                                'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/personal-phone/' + this.data.personal_phones.id,
                        {
                            data: this.data
                        },
                        {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        }
                    ));
                } else {
                    requests.push(this.$http.post(
                            'api' + this.endpoint
                            + '/members'
                            + '/' + personID + '/personal-phone',
                        {
                            data: this.data
                        },
                        {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        }
                    ));
                }
                if (this.data.personal_emails.id !== undefined) {
                    requests.push(this.$http.put(
                                'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/personal-email/' + this.data.personal_emails.id,
                        {
                            data: this.data
                        },
                        {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        }
                    ));
                } else {
                    requests.push(this.$http.post(
                                'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/personal-email',
                        {
                            data: this.data
                        },
                        {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        }
                    ));
                }

                Promise.all(requests)
                    .then( () => {
                        this.progress = false;
                        this.success = true;
                        setTimeout(() => {this.success = false;}, 1500)
                        this.initialize();
                    })
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
            personal_addresses: {
                address: { maxLength: maxLength(150) },
                postal_code: { maxLength: maxLength(8), postalCodeValidate },
            },
            personal_emails: {
                email: { email }
            },
        }
    }
}
</script>

<style scoped>

</style>