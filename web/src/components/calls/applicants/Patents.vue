<template>
<v-card flat>
    <v-container class="px-6">
        <v-row v-if="$v.data.patents.$model.length === 0">
            Please add patents in which you are a co-author
        </v-row>
        <v-row v-else
            v-for="(v,i) in $v.data.patents.$each.$iter"
            :key="i"
            align="center"
        >
            <v-col cols="12" sm="3">
                <v-text-field
                    v-model="v.$model.authors_raw"
                    :error="v.authors_raw.$error"
                    @input="v.authors_raw.$touch(); addValue()"
                    label="Authors*">
                </v-text-field>
                <div v-if="v.authors_raw.$error">
                    <p v-if="!v.authors_raw.maxLength" class="caption red--text">Maximum length is 5000 characters.</p>
                    <p v-if="!v.authors_raw.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="v.$model.title"
                    :error="v.title.$error"
                    @input="v.title.$touch(); addValue()"
                    label="Patent title*">
                </v-text-field>
                <div v-if="v.title.$error">
                    <p v-if="!v.title.maxLength" class="caption red--text">Maximum length is 200 characters.</p>
                    <p v-if="!v.title.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="2">
                <v-text-field
                    v-model="v.$model.reference"
                    :error="v.reference.$error"
                    @input="v.reference.$touch(); addValue()"
                    label="Reference*">
                </v-text-field>
                <div v-if="v.reference.$error">
                    <p v-if="!v.reference.maxLength" class="caption red--text">Maximum length is 200 characters.</p>
                    <p v-if="!v.reference.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="1">
                <v-text-field
                    v-model="v.$model.status"
                    :error="v.status.$error"
                    @input="v.status.$touch(); addValue()"
                    label="Status">
                </v-text-field>
                <div v-if="v.status.$error">
                    <p v-if="!v.status.maxLength" class="caption red--text">Maximum length is 45 characters.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="1">
                <v-text-field
                    v-model="v.$model.year"
                    :error="v.year.$error"
                    @input="v.year.$touch(); addValue()"
                    label="Year">
                </v-text-field>
                <div v-if="v.year.$error">
                    <p v-if="!v.year.integer" class="caption red--text">Must be integer.</p>
                </div>
            </v-col>



            <v-col cols="1" sm="1">
                <v-btn icon @click="removeItem(data.patents, i)" class="mt-3">
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
                    @click="addItem(data.patents)"
                >
                    Add a patent
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
                patents: [],
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
                authors_raw: null,
                title: null,
                reference: null,
                status: null,
                year: null,

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
            patents: {
                $each: {
                    authors_raw: { required, maxLength: maxLength(5000) },
                    title: { required, maxLength: maxLength(200) },
                    reference: { required, maxLength: maxLength(45) },
                    status: {},
                    year: { integer },
                }
            },
        },
    },
}
</script>

<style>

</style>