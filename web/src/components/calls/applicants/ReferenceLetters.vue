<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Contacts for Letters of Recommendation</h3>
        </div>
    </v-card-title>
    <v-card-text>Name 2 people familiar with your work.
        We will contact them to provide an analysis of your skills, attributes and accomplishments.
    </v-card-text>
    <v-container class="px-6">
        <v-row v-for="(v,i) in $v.data.recommendations.$each.$iter"
            :key="i"
            align="center"
        >
            <v-col cols="12" sm="3">
                <v-text-field
                    v-model="v.$model.name"
                    :error="v.name.$error"
                    @input="v.name.$touch(); addValue()"
                    label="Name*">
                </v-text-field>
                <div v-if="v.name.$error">
                    <p v-if="!v.name.maxLength" class="caption red--text">Maximum length is 200 characters.</p>
                    <p v-if="!v.name.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="3">
                <v-text-field
                    v-model="v.$model.email"
                    :error="v.email.$error"
                    @input="v.email.$touch(); addValue()"
                    label="Email*">
                </v-text-field>
                <div v-if="v.email.$error">
                    <p v-if="!v.email.maxLength" class="caption red--text">Maximum length is 200 characters.</p>
                    <p v-if="!v.email.email" class="caption red--text">Email invalid.</p>
                    <p v-if="!v.email.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="3">
                <v-text-field
                    v-model="v.$model.role"
                    :error="v.role.$error"
                    @input="v.role.$touch(); addValue()"
                    label="Job title*">
                </v-text-field>
                <div v-if="v.role.$error">
                    <p v-if="!v.role.maxLength" class="caption red--text">Maximum length is 200 characters.</p>
                    <p v-if="!v.role.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="3">
                <v-text-field
                    v-model="v.$model.institution"
                    :error="v.institution.$error"
                    @input="v.institution.$touch(); addValue()"
                    label="Institution*">
                </v-text-field>
                <div v-if="v.institution.$error">
                    <p v-if="!v.institution.maxLength" class="caption red--text">Maximum length is 200 characters.</p>
                    <p v-if="!v.institution.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
        </v-row>
    </v-container>
</v-card>
</template>

<script>
import { required, maxLength, email } from 'vuelidate/lib/validators'

export default {
    data() {
        return {
            data: {
                recommendations: [
                    {name: '', email: '', institution: '', role: ''},
                    {name: '', email: '', institution: '', role: ''},
                ],
            },
        }
    },
     created() {
        this.initialize ();
    },
    methods: {
        initialize () {
            let callSegment = this.$route.params.callSegment;
            if (callSegment !== undefined) {
                let savedData = this.$store.state.application;
                Object.keys(this.data).forEach(key => {
                    let value = savedData.application[key];
                    this.$set(this.data, key, value);
                });
            }
        },
        addValue () {
            this.$store.dispatch('addApplicationData', this.data);
        },
    },
    validations: {
        data: {
            recommendations: {
                $each: {
                    name: { required, maxLength: maxLength(200) },
                    institution: { required, maxLength: maxLength(200) },
                    email: { required, email, maxLength: maxLength(200) },
                    role: { required, maxLength: maxLength(200) },
                }
            },
        },
    },

}
</script>

<style>

</style>