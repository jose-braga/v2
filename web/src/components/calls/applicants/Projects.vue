<template>
<v-card flat>
    <v-container class="px-6">
        <v-row v-if="$v.data.projects.$model.length === 0">
            Please add projects in which you participated as a team member
        </v-row>
        <v-row v-else
            v-for="(v,i) in $v.data.projects.$each.$iter"
            :key="i"
            align="center"
        >
            <v-col cols="12" sm="2">
                <v-text-field
                    v-model="v.$model.reference"
                    :error="v.reference.$error"
                    @input="v.reference.$touch(); addValue()"
                    label="Project reference*">
                </v-text-field>
                <div v-if="v.reference.$error">
                    <p v-if="!v.reference.maxLength" class="caption red--text">Maximum length is 100 characters.</p>
                    <p v-if="!v.reference.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="5">
                <v-text-field
                    v-model="v.$model.title"
                    :error="v.title.$error"
                    @input="v.title.$touch(); addValue()"
                    label="Project title*">
                </v-text-field>
                <div v-if="v.title.$error">
                    <p v-if="!v.title.maxLength" class="caption red--text">Maximum length is 500 characters.</p>
                    <p v-if="!v.title.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="2">
                <v-text-field
                    v-model="v.$model.acronym"
                    :error="v.acronym.$error"
                    @input="v.acronym.$touch(); addValue()"
                    label="Acronym*">
                </v-text-field>
                <div v-if="v.acronym.$error">
                    <p v-if="!v.acronym.maxLength" class="caption red--text">Maximum length is 45 characters.</p>
                    <p v-if="!v.acronym.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="3">
                <v-text-field
                    v-model="v.$model.principal_investigator"
                    :error="v.principal_investigator.$error"
                    @input="v.principal_investigator.$touch(); addValue()"
                    label="PI name">
                </v-text-field>
                <div v-if="v.principal_investigator.$error">
                    <p v-if="!v.principal_investigator.maxLength" class="caption red--text">Must be decimal.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="4">
                <v-row align="center">
                    <v-col cols="10">
                        <v-text-field
                            v-model="v.$model.participation"
                            :error="v.participation.$error"
                            @input="v.participation.$touch(); addValue()"
                            label="Participation form in project*">
                        </v-text-field>
                        <div v-if="v.participation.$error">
                            <p v-if="!v.participation.required" class="caption red--text">Field is required.</p>
                        </div>
                    </v-col>
                    <v-col cols="2">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-icon
                                    color="primary"
                                    dark
                                    v-on="on"
                                >
                                    mdi-help-circle
                                </v-icon>
                            </template>
                            <span>Describe your participation
                                (e.g.: fellowship supported by project, if applicable)</span>
                        </v-tooltip>
                    </v-col>
                </v-row>
            </v-col>
            <v-col cols="12" sm="2">
                <v-text-field
                    v-model="v.$model.year_start"
                    :error="v.year_start.$error"
                    @input="v.year_start.$touch(); addValue()"
                    label="Year start*">
                </v-text-field>
                <div v-if="v.year_start.$error">
                    <p v-if="!v.year_start.integer" class="caption red--text">Must be integer.</p>
                    <p v-if="!v.year_start.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="2">
                <v-text-field
                    v-model="v.$model.year_end"
                    :error="v.year_end.$error"
                    @input="v.year_end.$touch(); addValue()"
                    label="Year end">
                </v-text-field>
                <div v-if="v.year_end.$error">
                    <p v-if="!v.year_end.integer" class="caption red--text">Must be integer.</p>
                </div>
            </v-col>
            <v-col cols="11" sm="11">
                <v-text-field
                    v-model="v.$model.additional"
                    :error="v.additional.$error"
                    @input="v.additional.$touch(); addValue()"
                    label="Additional relevant data">
                </v-text-field>
                <div v-if="v.additional.$error">
                    <p v-if="!v.additional.integer" class="caption red--text">Must be integer.</p>
                </div>
            </v-col>
            <v-col cols="1" sm="1">
                <v-btn icon @click="removeItem(data.projects, i)" class="mt-3">
                    <v-icon color="red darken">mdi-delete</v-icon>
                </v-btn>
            </v-col>
            <v-col cols="12">
                <v-divider></v-divider>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="mt-4">
                <v-btn outlined
                    @click="addItem(data.projects)"
                >
                    Add a project
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</v-card>
</template>

<script>
import {maxLength, required, integer} from 'vuelidate/lib/validators'

export default {
    data() {
        return {
            data: {
                projects: [],
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
        addItem(list) {
            list.push({
                reference: null,
                title: null,
                acronym: null,
                principal_investigator: null,
                participation: null,
                year_start: null,
                year_end: null,
                additional: null,

            })
            this.$store.dispatch('addApplicationData', this.data);
        },
        removeItem(list, ind) {
            list.splice(ind, 1);
            this.$store.dispatch('addApplicationData', this.data);
        },
    },
    validations: {
        data: {
            projects: {
                $each: {
                    reference: { required, maxLength: maxLength(100)},
                    title: { required, maxLength: maxLength(500)},
                    acronym: { required, maxLength: maxLength(45)},
                    principal_investigator: { maxLength: maxLength(100) },
                    participation: { required },
                    year_start: { required, integer },
                    year_end: { integer },
                    additional: { maxLength: maxLength(1000) }
                }
            },
        },
    },

}
</script>

<style>

</style>