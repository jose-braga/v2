<template>
<v-card class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Personal Contacts</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container class="px-6">
        <v-row>
            <v-col cols="12">
                <v-text-field
                    v-model="$v.data.personal_addresses.address.$model"
                    :error="$v.data.personal_addresses.address.$error"
                    @input="addValue"
                    label="Current address">
                </v-text-field>
                <div v-if="$v.data.personal_addresses.address.$error">
                    <p v-if="!$v.data.personal_addresses.address.maxLength"
                        class="caption red--text">Maximum characters: 150.</p>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="$v.data.personal_addresses.postal_code.$model"
                    :error="$v.data.personal_addresses.postal_code.$error"
                    @input="addValue"
                    label="Postal Code">
                </v-text-field>
                <div v-if="$v.data.personal_addresses.postal_code.$error">
                    <p v-if="!$v.data.personal_addresses.postal_code.maxLength"
                        class="caption red--text">Maximum characters: 8.</p>
                    <p v-if="!$v.data.personal_addresses.postal_code.postalCodeValidate"
                        class="caption red--text">Invalid postal code.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.personal_addresses.city"
                    @input="addValue"
                    label="City">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.personal_phones.phone"
                    @input="addValue"
                    label="Personal Phone">
                </v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="$v.data.personal_emails.email.$model"
                    :error="$v.data.personal_emails.email.$error"
                    @input="addValue"
                    label="Personal Email*">
                </v-text-field>
                <div v-if="$v.data.personal_emails.email.$error">
                    <p v-if="!$v.data.personal_emails.email.email"
                        class="caption red--text">Invalid email.</p>
                    <p v-if="!$v.data.personal_emails.email.required"
                        class="caption red--text">Required.</p>
                </div>
            </v-col>
        </v-row>
    </v-container>
</v-card>

</template>

<script>
import {helpers, maxLength, email, required} from 'vuelidate/lib/validators'

const postalCodeValidate = (value) => {
    return !helpers.req(value)
           || /^\d\d\d\d-\d\d\d$/.test(value)
           || /^\d\d\d\d$/.test(value);
}

export default {
    props: {
        personId: Number,
        token: String,
    },
    data() {
        return {
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
    created () {
        this.getPersonalEmail();
    },
    methods: {
        addValue () {
            this.$store.commit('addPersonData', this.data);
        },
        getPersonalEmail() {
            const urlSubmit = 'api/pre-register/people/' + this.personId + '/personal-email';
            this.$http.get(urlSubmit, {
                headers: {'Authorization': 'Bearer ' + this.token},
            })
            .then((result) => {
                this.data.personal_emails.email = result.data.result[0].email;
                this.addValue();
            })
            .catch((error) => console.log(error))

        },
    },
    validations: {
        data: {
            personal_addresses: {
                address: { maxLength: maxLength(150) },
                postal_code: { maxLength: maxLength(8), postalCodeValidate },
            },
            personal_emails: {
                email: { email, required }
            },
        }
    }

}
</script>

<style>

</style>