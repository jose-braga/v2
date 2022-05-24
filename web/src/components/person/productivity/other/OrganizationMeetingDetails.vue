<template>
<v-card>
    <v-form ref="form"
        @submit.prevent="submitForm"
    >
        <v-card-title>
            <span> Edit data for event
                    <b>{{ itemDetails.meeting_name }}</b>
            </span>
        </v-card-title>
        <v-card-text>
        </v-card-text>
        <v-container>
            <v-row>
                <v-col cols="12" sm="12">
                    <v-text-field
                        v-model="$v.itemDetails.meeting_name.$model"
                        :error="$v.itemDetails.meeting_name.$error"
                        label="Meeting Name"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="3">
                    <v-select v-model="itemDetails.meeting_type_id"
                        :items="meetingTypes"
                        item-value="id"
                        item-text="name"
                        label="Meeting Type">
                    </v-select>
                </v-col>
                <v-col cols="12" sm="4" md="3" lg="3">
                    <v-switch v-model="itemDetails.international"
                        :label="'International:' + itemDetails.international"
                        dense
                        hide-details
                    >
                    </v-switch>
                </v-col>
                <v-col cols="12" sm="3">
                    <v-autocomplete
                        v-model="itemDetails.country_id"
                        :items="countries" item-value="id" item-text="name"
                        :search-input.sync="searchCountries"
                        :filter="customSearch"
                        cache-items
                        flat
                        hide-no-data
                        hide-details
                        label="Country">
                    </v-autocomplete>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="4">
                    <v-row>
                        <v-col cols="12">
                            <v-menu ref="date_menu"
                                v-model="itemDetails.show_start"
                                :close-on-content-click="false"
                                :nudge-right="10"
                                transition="scale-transition"
                                offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="$v.itemDetails.start.$model"
                                        :error="$v.itemDetails.start.$error"
                                        label="Start" v-on="on">
                                    </v-text-field>
                                </template>
                                <v-date-picker v-model="$v.itemDetails.start.$model"
                                    @input="itemDetails.show_start = false"
                                    no-title
                                ></v-date-picker>
                            </v-menu>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-menu ref="date_menu2"
                                v-model="itemDetails.show_end"
                                :close-on-content-click="false"
                                :nudge-right="10"
                                transition="scale-transition"
                                offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="$v.itemDetails.end.$model"
                                        :error="$v.itemDetails.end.$error"
                                        label="End" v-on="on">
                                    </v-text-field>
                                </template>
                                <v-date-picker v-model="$v.itemDetails.end.$model"
                                    @input="itemDetails.show_end = false"
                                    no-title
                                ></v-date-picker>
                            </v-menu>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="8">
                    <v-textarea
                        v-model="$v.itemDetails.description.$model"
                        :error="$v.itemDetails.description.$error"
                        rows="4"
                        counter
                        label="Description (<2000 ca)">
                    </v-textarea>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="6">
                    <v-row justify="center">
                        <h3>LAQV/UCIBIO people</h3>
                    </v-row>
                    <v-row v-for="(person,i) in itemDetails.person_details"
                        :key="i"
                        align="stretch"
                    >
                        <v-col cols="12" sm="7">
                            <v-autocomplete
                                v-model="person.person_id"
                                :items="people" item-value="id" item-text="colloquial_name"
                                :search-input.sync="searchPeople[i]"
                                :filter="customSearch"
                                cache-items
                                flat
                                hide-no-data
                                hide-details
                                label="People">
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="12" sm="3">
                            <v-text-field v-model="person.role"
                                label="Role"
                            ></v-text-field>
                        </v-col>

                        <v-col cols="2"  class="mt-2">
                            <v-btn icon @click="removeItem(itemDetails.person_details, i, 'person')">
                                <v-icon color="red darken">mdi-delete</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col cols="12">
                            <v-divider></v-divider>
                        </v-col>
                    </v-row>

                    <v-row justify="center">
                        <v-btn small outlined class="ml-8"
                            @click="addItem(itemDetails.person_details, 'person')">
                                Add person
                        </v-btn>
                    </v-row>
                </v-col>
                <v-divider vertical></v-divider>
                <v-col cols="12" sm="">
                    <v-row justify="center">
                        <h3>Labs associated with item</h3>
                    </v-row>
                    <v-row v-for="(lab,i) in itemDetails.labs_details"
                        :key="'labs-' + i"
                        align="center"
                    >
                        <v-col cols="12" sm="9">
                            <v-autocomplete
                                v-model="lab.lab_id"
                                :items="labs" item-value="id" item-text="name"
                                :search-input.sync="searchLabs[i]"
                                :filter="customSearch"
                                cache-items
                                flat
                                hide-no-data
                                hide-details
                                label="Labs">
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="3">
                            <v-btn icon @click="removeItem(itemDetails.labs_details, i, 'lab')">
                                <v-icon color="red darken">mdi-delete</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col cols="12">
                            <v-divider></v-divider>
                        </v-col>
                    </v-row>
                    <v-row justify="center">
                        <v-btn small outlined class="ml-8"
                            @click="addItem(itemDetails.labs_details, 'lab')">
                                Add lab
                        </v-btn>
                    </v-row>
                </v-col>
            </v-row>
            <v-row align-content="center" justify="center" class="pt-6">
                <v-col cols="3" v-if="formError">
                    <v-row justify="end">
                        <p class="caption red--text">Unable to submit form.</p>
                    </v-row>
                </v-col>
                <div>
                    <v-btn type="submit"
                        outlined color="blue">Save</v-btn>
                </div>
                <div class="request-status-container">
                    <v-progress-circular indeterminate
                            v-show="progress"
                            :size="20" :width="2"
                            color="primary"></v-progress-circular>
                    <v-icon v-show="success" color="green">mdi-check</v-icon>
                    <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                </div>
            </v-row>
        </v-container>
    </v-form>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'
import { maxLength } from 'vuelidate/lib/validators'

function prepareStringComparison(str) {
    if (str === null || str === undefined) {
        return null;
    } else {
        return str.toLocaleLowerCase()
            .replace(/[áàãâä]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[íìîï]/g, 'i')
            .replace(/[óòõôö]/g, 'o')
            .replace(/[úùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[ñ]/g, 'n')
            .replace(/(\.\s)/g, '')
            .replace(/(\.)/g, '')
            .replace(/[-:()]/g, ' ')
            .trim()
            ;
    }
}

export default {
    props: {
        itemData: Object,
        itemId: Number,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            searchCountries: '',
            itemDetails: {
                meeting_name: undefined,
                description: undefined,
                international: false,
                person_details: [],
                labs_details: [],
                start: null,
                end: null,
            },
            searchPeople: [],
            searchLabs: [],
            toDeletePerson: [],
            toDeleteLab: [],
            people: [],
            labs: [],
            countries: [],
            meetingTypes: [],
        }
    },
    watch: {
        itemData () {
            this.initialize();
        },
    },
    mounted () {
        this.initialize();
        this.getPeople();
        this.getCountries();
        this.getLabs();
        this.getMeetingTypes();
    },
    methods: {
        initialize () {
            this.itemDetails = Object.assign({}, this.itemData);
        },
        submitForm () {
            if (this.$v.$invalid) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                if (this.$store.state.session.loggedIn) {
                    this.progress = true;
                    let personID = this.$store.state.session.personID;
                    this.itemDetails.toDeletePerson = this.toDeletePerson;
                    this.itemDetails.toDeleteLab = this.toDeleteLab;
                    let urlUpdate = [
                        {
                            url: 'api/people/' + personID
                                + '/organization-meetings/' + this.itemDetails.meeting_id,
                            body: this.itemDetails,
                        }
                    ];
                    Promise.all(urlUpdate.map(el =>
                        this.$http.put(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                    )
                    .then(() => {
                        this.progress = false;
                        this.success = true;
                        this.$root.$emit('updatedMeetingOrganization')
                        setTimeout(() => {
                            this.success = false;
                            this.toDeletePerson = [];
                            this.toDeleteLab = [];
                            this.itemDetails = {
                            };
                            //this.$root.$emit('updatedPatent')
                            this.initialize();
                        }, 1500);
                    })
                    .catch((error) => {
                        this.progress = false;
                        this.error = true;
                        setTimeout(() => {this.error = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    })
                }
            }
        },
        getPeople () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'people-simple';
            return subUtil.getPublicInfo(vm, urlSubmit, 'people');
        },
        getCountries() {
            var this_vm = this;
            const urlSubmit = 'api/v2/' + 'countries';
            subUtil.getPublicInfo(this_vm, urlSubmit, 'countries');
        },
        getLabs() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'labs';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labs');
            }
        },
        getMeetingTypes() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'meeting-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'meetingTypes');
            }
        },
        addItem(list, type) {
            if (type === 'person') {
                list.push({
                    id: 'new',
                });
                this.searchPeople.push(null);
            } else if (type === 'lab') {
                list.push({
                    id: 'new',
                });
                this.searchLabs.push(null);
            }
        },
        removeItem(list, ind, type) {
            if (type === 'person') {
                if (list[ind].id !== 'new') {
                    this.toDeletePerson.push(list[ind]);
                }
            } else if (type === 'lab') {
                if (list[ind].id !== 'new') {
                    this.toDeleteLab.push(list[ind]);
                }
            }
            list.splice(ind, 1);
        },
        customSearch (item, queryText, itemText) {
            let queryPre = prepareStringComparison(queryText);
            let query = queryPre.split(' ');
            let text = prepareStringComparison(itemText);
            for (let ind in query) {
                if (text.indexOf(query[ind]) === -1) {
                    return false;
                }
            }
            return true;
        },
    },
    validations: {
        itemDetails: {
            meeting_name: { maxLength: maxLength(1000)},
            description: { maxLength: maxLength(2000)},
            start: { isValid: time.validate },
            end: { isValid: time.validate },
        }
    },

}
</script>

<style>

</style>