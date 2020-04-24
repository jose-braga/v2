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
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.phones.phone"
                    @input="addValue"
                    label="Personal Phone">
                </v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.phones.extension"
                    @input="addValue"
                    label="Extension">
                </v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="$v.data.emails.email.$model"
                    :error="$v.data.emails.email.$error"
                    @input="addValue"
                    :label="emailLabel">
                </v-text-field>
                <div v-if="$v.data.emails.email.$error">
                    <p v-if="!$v.data.emails.email.required"
                        class="caption red--text">Required.</p>
                    <p v-if="!$v.data.emails.email.email"
                        class="caption red--text">Non valid email.</p>
                </div>
                <v-checkbox
                    v-model="data.emails.requestEmail"
                    @change="changeLabel"
                    label="Request email? (FCT only)"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row v-if="data.emails.requestEmail" justify="end">
            <span class="small-text">A PDF file will be generated on submission.<br>
            Be sure to fill in department data<br>
            Please, print, sign and deliver it to your department's secretariat.</span>
        </v-row>
    </v-container>
</v-card>

</template>

<script>

import {email, required} from 'vuelidate/lib/validators'


export default {
    data() {
        return {
            emailLabel: 'Institutional Email*',
            data: {
                emails: {
                    email: undefined,
                    requestEmail: false,
                },
                phones: {
                    phone: undefined,
                    extension: undefined,
                },
            },
        }
    },
    methods: {
        addValue () {
            this.$store.commit('addPersonData', this.data);
        },
        changeLabel () {
            if (this.data.emails.requestEmail) {
                this.emailLabel = 'Email sugestion*'
            } else {
                this.emailLabel = 'Institutional Email*'
            }
        }
    },
    validations: {
        data: {
            emails: {
                email: { email, required }
            },
        }
    }
}
</script>

<style>
.small-text {
    font-size: 0.75rem;
}

</style>