<template>
<v-card flat>
    <v-container class="px-6">
        <v-row v-if="$v.data.posters.$model.length === 0">
            Please add posters in which you are a co-author
        </v-row>
        <v-row v-else
            v-for="(v,i) in $v.data.posters.$each.$iter"
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
                    label="Poster title*">
                </v-text-field>
                <div v-if="v.title.$error">
                    <p v-if="!v.title.maxLength" class="caption red--text">Maximum length is 500 characters.</p>
                    <p v-if="!v.title.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="v.$model.meeting_name"
                    :error="v.meeting_name.$error"
                    @input="v.meeting_name.$touch(); addValue()"
                    label="Meeting name*">
                </v-text-field>
                <div v-if="v.meeting_name.$error">
                    <p v-if="!v.meeting_name.maxLength" class="caption red--text">Maximum length is 500 characters.</p>
                    <p v-if="!v.meeting_name.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="2">
                <v-menu ref="v.$model.show_date_end"
                    v-model="v.$model.show_date_end"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="v.$model.date"
                            @input="v.date.$touch(); addValue()"
                            label="Date" v-on="on">
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="v.$model.date"
                            @input="v.$model.show_date_end = false; addValue()"
                            no-title></v-date-picker>
                </v-menu>
                <div v-if="v.date.$error">
                    <p v-if="!v.date.dateFormat" class="caption red--text">Format should be<br>YYYY-MM-DD.</p>
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
                <v-checkbox
                    v-model="v.$model.international"
                    @change="v.international.$touch(); addValue()"
                    label="International meeting?"
                ></v-checkbox>
            </v-col>


            <v-col cols="1" sm="1">
                <v-btn icon @click="removeItem(data.posters, i)" class="mt-3">
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
                    @click="addItem(data.posters)"
                >
                    Add a poster
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
                posters: [],
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
                meeting_name: null,
                date: null,
                first_author: false,
                international: null,

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
            posters: {
                $each: {
                    authors_raw: { required, maxLength: maxLength(5000) },
                    title: { required, maxLength: maxLength(500) },
                    meeting_name: { required, maxLength: maxLength(500) },
                    date: {
                        dateFormat: (value) => {
                            if (value === undefined || value === null || value === '') return true;
                            return /^\d\d\d\d-\d\d-\d\d$/.test(value);
                        }
                    },
                    first_author: {  },
                    international: {  },
                }
            },
        },
    },


}
</script>

<style>

</style>