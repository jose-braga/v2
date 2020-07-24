<template>
<v-card flat>
    <v-container class="px-6">
        <v-row v-if="$v.data.professional.$model.length === 0">
            Please add professional experiences you may have
        </v-row>
        <v-row v-else
            v-for="(v,i) in $v.data.professional.$each.$iter"
            :key="i"
            align="start"
        >
            <v-col cols="12" sm="3">
                <v-text-field
                    v-model="v.$model.company"
                    :error="v.company.$error"
                    @input="v.company.$touch(); addValue()"
                    label="Company*">
                </v-text-field>
                <div v-if="v.company.$error">
                    <p v-if="!v.company.maxLength" class="caption red--text">Maximum length is 100 characters.</p>
                    <p v-if="!v.company.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="4">
                <v-textarea
                    v-model="v.$model.business_areas"
                    :error="v.business_areas.$error"
                    @input="v.business_areas.$touch(); addValue()"
                    rows="2"
                    label="Business areas*">
                </v-textarea>
                <div v-if="v.business_areas.$error">
                    <p v-if="!v.business_areas.maxLength" class="caption red--text">Maximum length is 500 characters.</p>
                    <p v-if="!v.business_areas.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="2">
                <v-menu ref="v.$model.show_date_start"
                    v-model="v.$model.show_date_start"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="v.$model.date_start"
                            @input="addValue"
                            label="Start date" v-on="on">
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="v.$model.date_start"
                            @input="v.$model.show_date_start = false; addValue()"
                            no-title></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="12" sm="2">
                <v-menu ref="v.$model.show_date_end"
                    v-model="v.$model.show_date_end"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="v.$model.date_end"
                            @input="addValue"
                            label="End date" v-on="on">
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="v.$model.date_end"
                            @input="v.$model.show_date_end = false; addValue()"
                            no-title></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="1" sm="1">
                <v-btn icon @click="removeItem(data.professional, i)" class="mt-3">
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
                    @click="addItem(data.professional)"
                >
                    Add a professional experience
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</v-card>
</template>

<script>
import {maxLength, required} from 'vuelidate/lib/validators'

export default {
    data() {
        return {
            data: {
                professional: [],
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
                company: null,
                business_areas: null,
                date_start: null,
                date_end: null,
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
            professional: {
                $each: {
                    company: { required, maxLength: maxLength(100) },
                    business_areas: { required, maxLength: maxLength(500) },
                    date_start: {},
                    date_end: {},
                }
            },
        },
    },

}
</script>

<style>

</style>