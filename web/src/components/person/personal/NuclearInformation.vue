<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Nuclear information</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container class="px-6">
        <v-form ref="form"
                @submit.prevent="submitForm">
            <v-text-field
                v-model="$v.data.name.$model"
                label="Full Name">
            </v-text-field>
            <div v-if="!$v.data.name.required">
                <p class="caption red--text">Name is required.</p>
            </div>
            <div v-if="!$v.data.name.maxLength">
                <p class="caption red--text">Maximum characters: 100.</p>
            </div>
            <v-text-field
                v-model="$v.data.colloquial_name.$model"
                label="Colloquial Name (minimum: name and surname)">
            </v-text-field>
            <div v-if="!$v.data.colloquial_name.required">
                <p class="caption red--text">Colloquial name is required.</p>
            </div>
            <div v-if="!$v.data.colloquial_name.maxLength">
                <p class="caption red--text">Maximum characters: 100.</p>
            </div>
            <v-row>
                <v-col cols="12" sm="4">
                    <v-select v-model="data.gender"
                        :items="genders" item-value="id" item-text="value"
                        label="Gender">
                    </v-select>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-menu ref="date_menu" v-model="date_menu"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on: date_menu }">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on: tooltip }">
                                    <v-text-field v-model="$v.data.birth_date.$model"
                                        :error="$v.data.birth_date.$error"
                                        label="Birth date" v-on="{...tooltip,...date_menu}">
                                    </v-text-field>
                                    <div v-if="$v.data.birth_date.$error">
                                        <p v-if="!$v.data.birth_date.isValid" class="caption red--text">Date format should be 'YYYY-MM-DD' (or empty)</p>
                                    </div>
                                </template>
                                <span>
                                    Click to navigate dates.<br>
                                    <span class="smaller-text">
                                        Click header 1 time to navigate by month.
                                    </span><br>
                                    <span class="smaller-text">
                                        Click header 2 times to navigate by year.
                                    </span>
                                </span>
                            </v-tooltip>
                        </template>
                        <v-date-picker v-model="data.birth_date" @input="date_menu = false" no-title></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-autocomplete
                                v-model="data.countries"
                                multiple
                                v-on="on"
                                :loading="loadingCountries"
                                :items="countries" item-value="id" item-text="name"
                                :search-input.sync="searchCountries"
                                return-object
                                cache-items
                                flat
                                hide-no-data
                                hide-details
                                label="Nationalities">
                            </v-autocomplete>
                        </template>
                        <span>Type text to find country.</span>
                    </v-tooltip>
                </v-col>
            </v-row>
            <v-row align-content="center" justify="end" class="mb-1">
                <v-col cols="3" v-if="formError">
                    <v-row justify="end">
                        <p class="caption red--text">Unable to submit form.</p>
                    </v-row>
                </v-col>
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Update</v-btn>
                    </v-row>
                </v-col>
                <v-col cols="1">
                    <v-progress-circular indeterminate
                            v-show="progress"
                            :size="20" :width="2"
                            color="primary"></v-progress-circular>
                    <v-icon v-show="success" color="green">mdi-check</v-icon>
                    <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                </v-col>
            </v-row>
        </v-form>
    </v-container>
</v-card>
</template>

<script>
import time from '@/components/common/date-utils'
import subUtil from '@/components/common/submit-utils'
import {maxLength, required} from 'vuelidate/lib/validators'

var submitNuclearInformation = function (vm, urlSubmit) {
    vm.data.person_id = vm.data.id;
    return vm.$http.put(urlSubmit,
        {
            data: vm.data,
        },
        {
            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
        });
};

var submitNationalities = function (vm, urlSubmit) {
    const result = subUtil.compareOriginal(
        vm.original.countries, vm.data.countries, 'id');
    result.person_id = vm.$store.state.session.personID;
    return vm.$http.put(urlSubmit,
        {
            data: result,
        },
        {
            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
        });
};

export default {
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            date_menu: false,
            data: {
                name: undefined,
                colloquial_name: undefined,
                gender: undefined,
                birth_date: undefined,
                countries: undefined,
            },
            original: {
                // save here the relevant original states
                countries: undefined,
            },
            genders: [
                {id: 'M', value: 'Male'},
                {id: 'F', value: 'Female'},
            ],
            countries: [],
            loadingCountries: false,
            searchCountries: null,
        }
    },
    computed: {
        personID () {
            return this.$store.state.session.personID;
        },
    },
    watch: {
        personID () {
            this.initialize();
        },
        searchCountries () {
             if (this.data.countries.length > 0) return;
             this.loadingCountries = true;
             this.getCountries().then(()=> {this.loadingCountries = false;})
        },
    },
    mounted() {
        this.initialize(true);
        this.getCountries();
    },
    methods: {
        initialize(mounting) {
            //var this_vm = this;
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                let urlSubmit = 'api/people/' + personID + '/nuclear-info';
                subUtil.getInfoPopulate(this, urlSubmit, false)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    Object.keys(result).forEach(key => {
                        let value = result[key];
                        this.$set(this.data, key, value);
                    });
                    this.data.birth_date = time.processResultsDate(this.data.birth_date);
                    return this.data;
                })
                .then( () => {
                    urlSubmit = 'api/people/' + personID + '/nationalities';
                    return subUtil.getInfoPopulate(this, urlSubmit, true);
                })
                .then( (result) => {
                    this.data.countries = result;
                    if (mounting) {
                        this.original.countries = result;
                    }
                });
            } else {
                this.$refs.form.reset();
            }
        },
        submitForm() {
            if (this.$v.$invalid) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000)
            } else {
                if (this.$store.state.session.loggedIn) {
                    this.progress = true;
                    const personID = this.$store.state.session.personID;
                    Promise.all([
                        submitNuclearInformation(this, 'api/people/' + personID + '/nuclear-info'),
                        submitNationalities(this, 'api/people/' + personID + '/nationalities'),
                    ])
                    .then( () => {
                        this.progress = false;
                        this.success = true;
                        this.$root.$emit('updateCompleteness');
                        setTimeout(() => {this.success = false;}, 1500)
                        this.initialize(true);
                    })
                    .catch((error) => {
                        this.progress = false;
                        this.error = true;
                        this.initialize(true);
                        setTimeout(() => {this.error = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    })
                }
            }
        },
        getCountries() {
            var this_vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'countries';
                return subUtil.getPublicInfo(this_vm, urlSubmit, 'countries');
            }
        },
    },
    validations: {
        data: {
            name: { maxLength: maxLength(100), required },
            colloquial_name: { maxLength: maxLength(100), required },
            birth_date: { isValid: time.validate },
        }
    }
}
</script>

<style scoped>
.smaller-text {
    font-size: 0.8em;
}

</style>
