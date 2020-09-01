<template>
<v-card flat>
    <v-card-text>
        <b>Tip:</b> <a href="https://www.scimagojr.com/" target="_blank">Scimago</a> has information on journal quartiles.
    </v-card-text>
    <v-container class="px-6">
        <v-row v-if="$v.data.papers.$model.length === 0">
            Please add publications in which you are a co-author
        </v-row>
        <v-row v-else
            v-for="(v,i) in $v.data.papers.$each.$iter"
            :key="i"
            align="center"
        >
            <v-col cols="12" sm="4">
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
                    label="Pub. title*">
                </v-text-field>
                <div v-if="v.title.$error">
                    <p v-if="!v.title.maxLength" class="caption red--text">Maximum length is 500 characters.</p>
                    <p v-if="!v.title.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="v.$model.journal_name"
                    :error="v.journal_name.$error"
                    @input="v.journal_name.$touch(); addValue()"
                    label="Journal*">
                </v-text-field>
                <div v-if="v.journal_name.$error">
                    <p v-if="!v.journal_name.maxLength" class="caption red--text">Maximum length is 200 characters.</p>
                    <p v-if="!v.journal_name.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="1">
                <v-text-field
                    v-model="v.$model.volume"
                    :error="v.volume.$error"
                    @input="v.volume.$touch(); addValue()"
                    label="Volume">
                </v-text-field>
                <div v-if="v.volume.$error">
                    <p v-if="!v.volume.maxLength" class="caption red--text">Maximum length is 45 characters.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="1">
                <v-text-field
                    v-model="v.$model.pages"
                    :error="v.pages.$error"
                    @input="v.pages.$touch(); addValue()"
                    label="Pages">
                </v-text-field>
                <div v-if="v.pages.$error">
                    <p v-if="!v.pages.maxLength" class="caption red--text">Maximum length is 45 characters.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="2">
                <v-text-field
                    v-model="v.$model.year"
                    :error="v.year.$error"
                    @input="v.year.$touch(); addValue()"
                    label="Year pub.">
                </v-text-field>
                <div v-if="v.year.$error">
                    <p v-if="!v.year.integer" class="caption red--text">Must be integer.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="2">
                <v-text-field
                    v-model="v.$model.doi"
                    :error="v.doi.$error"
                    @input="v.doi.$touch(); addValue()"
                    label="DOI*">
                </v-text-field>
                <div v-if="v.doi.$error">
                    <p v-if="!v.doi.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="2">
                <v-checkbox
                    v-model="v.$model.first_author"
                    @change="v.first_author.$touch(); addValue()"
                    label="First author?"
                ></v-checkbox>
            </v-col>
            <v-col cols="12" sm="2">
                <v-select v-model="v.$model.journal_quartile"
                    :items="quartiles" item-value="type" item-text="text"
                    @input="v.journal_quartile.$touch(); addValue()"
                    label="Journal Quartile">
                </v-select>
            </v-col>


            <v-col cols="1" sm="1">
                <v-btn icon @click="removeItem(data.papers, i)" class="mt-3">
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
                    @click="addItem(data.papers)"
                >
                    Add a publication
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
                papers: [],
            },
            quartiles: [
                {type: 1, text:"Q1"},
                {type: 2, text:"Q2"},
                {type: 3, text:"Q3"},
                {type: 4, text:"Q4"},
            ]
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
                journal_name: null,
                volume: null,
                year: null,
                doi: null,
                first_author: false,
                journal_quartile: null,
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
            papers: {
                $each: {
                    authors_raw: { required, maxLength: maxLength(5000) },
                    title: { required, maxLength: maxLength(500) },
                    journal_name: { required, maxLength: maxLength(200) },
                    volume: { maxLength: maxLength(45) },
                    pages: { maxLength: maxLength(45) },
                    year: { integer },
                    doi: { required, maxLength: maxLength(100) },
                    first_author: {  },
                    journal_quartile: {  },

                }
            },
        },
    },

}
</script>

<style>

</style>