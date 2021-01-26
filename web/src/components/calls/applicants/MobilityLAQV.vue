<template>
<v-card flat>
    <v-container class="px-6">
        <v-row v-if="$v.data.mobility.$model.length === 0">
            Please add projects through which you went to other institutions
        </v-row>
        <v-row v-else
            v-for="(v,i) in $v.data.mobility.$each.$iter"
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
            <v-col cols="12" sm="3">
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
                    v-model="v.$model.institution"
                    :error="v.institution.$error"
                    @input="v.institution.$touch(); addValue()"
                    label="institution*">
                </v-text-field>
                <div v-if="v.institution.$error">
                    <p v-if="!v.institution.maxLength" class="caption red--text">Maximum length is 200 characters.</p>
                    <p v-if="!v.institution.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="2">
                <v-text-field
                    v-model="v.$model.start_date"
                    :error="v.start_date.$error"
                    @input="v.start_date.$touch(); addValue()"
                    label="Start date*">
                </v-text-field>
                <div v-if="v.start_date.$error">
                    <p v-if="!v.start_date.required" class="caption red--text">Field is required.</p>
                    <p v-if="!v.start_date.dateFormat" class="caption red--text">Format should be<br>YYYY-MM-DD.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="2">
                <v-text-field
                    v-model="v.$model.duration"
                    :error="v.duration.$error"
                    @input="v.duration.$touch(); addValue()"
                    label="Duration*">
                </v-text-field>
                <div v-if="v.duration.$error">
                    <p v-if="!v.duration.maxLength" class="caption red--text">Maximum length is 45 characters.</p>
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
                <v-btn icon @click="removeItem(data.mobility, i)" class="mt-3">
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
                    @click="addItem(data.mobility)"
                >
                    Add project mobility
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
                mobility: [],
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
                institution: null,
                start_date: null,
                duration: null,
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
            mobility: {
                $each: {
                    reference: { required, maxLength: maxLength(100)},
                    title: { required, maxLength: maxLength(500)},
                    institution: { required, maxLength: maxLength(200)},
                    start_date: { required,
                        dateFormat: (value) => {
                            if (value === undefined || value === null || value === '') return true;
                            return /^\d\d\d\d-\d\d-\d\d$/.test(value);
                        }
                    },
                    duration: { maxLength: maxLength(45)},
                    additional: { maxLength: maxLength(1000) }
                }
            },
        },
    },

}
</script>

<style>

</style>