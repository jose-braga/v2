<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Identification</h3>
        </div>
    </v-card-title>
    <v-container class="px-6">
        <v-text-field
            v-model="$v.data.name.$model"
            :error="$v.data.name.$error"
            @input="addValue"
            label="Full Name*">
        </v-text-field>
        <div v-if="$v.data.name.$error">
            <p v-if="!$v.data.name.required" class="caption red--text">Name is required.</p>
            <p v-if="!$v.data.name.maxLength" class="caption red--text">Maximum characters: 200.</p>
        </div>
        <v-row>
            <v-col cols="12" sm="4">
                <v-select v-model="data.gender"
                    :items="genders" item-value="id" item-text="value"
                    @input="addValue"
                    label="Gender">
                </v-select>
            </v-col>
            <v-col cols="12" sm="4">
                <v-menu ref="date_menu" v-model="date_menu"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="$v.data.birth_date.$model"
                            :error="$v.data.birth_date.$error"
                            @input="addValue"
                            label="Birth date*" v-on="on">
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="data.birth_date"
                        @input="date_menu = false; addValue()"
                        no-title
                    ></v-date-picker>
                </v-menu>
                <div v-if="$v.data.birth_date.$error">
                    <p v-if="!$v.data.birth_date.required" class="caption red--text">Birth date is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="4">
                <v-autocomplete
                    v-model="data.countries"
                    :loading="loadingCountries"
                    :items="countries" item-value="id" item-text="name"
                    :search-input.sync="searchCountries"
                    return-object
                    cache-items
                    flat
                    hide-no-data
                    hide-details
                    @input="addValue"
                    label="Nationality">
                </v-autocomplete>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="11" sm="4">
                <v-select v-model="data.identification_type_id"
                    :items="cardTypes" item-value="id" item-text="name_en"
                    @input="addValue"
                    label="ID Card Type">
                </v-select>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="$v.data.identification_number.$model"
                    :error="$v.data.identification_number.$error"
                    @input="addValue"
                    label="Card ID number*">
                </v-text-field>
                <div v-if="$v.data.identification_number.$error">
                    <p v-if="!$v.data.identification_number.required" class="caption red--text">ID number is required.</p>
                </div>
            </v-col>

            <v-col cols="12" sm="4">
                <v-menu ref="data.identification_show_date_end"
                    v-model="data.identification_show_date_end"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="data.identification_valid_until"
                            @input="addValue"
                            label="Valid until" v-on="on">
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="data.identification_valid_until"
                            @input="data.identification_show_date_end = false; addValue()"
                            no-title></v-date-picker>
                </v-menu>
            </v-col>
        </v-row>
    </v-container>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Contacts</h3>
        </div>
    </v-card-title>
    <v-container class="px-6">
        <v-row>
            <v-col cols="12">
                <v-textarea
                    v-model="$v.data.address.$model"
                    :error="$v.data.address.$error"
                    @input="addValue"
                    rows="2"
                    label="Address*">
                </v-textarea>
                <div v-if="$v.data.address.$error">
                    <p v-if="!$v.data.address.maxLength" class="caption red--text">Maximum length is 500 characters.</p>
                    <p v-if="!$v.data.address.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" md="6">
                <v-text-field
                    v-model="$v.data.postal_code.$model"
                    :error="$v.data.postal_code.$error"
                    @input="addValue"
                    label="Postal Code*">
                </v-text-field>
                <div v-if="$v.data.postal_code.$error">
                    <p v-if="!$v.data.postal_code.maxLength" class="caption red--text">Maximum length is 45 characters.</p>
                    <p v-if="!$v.data.postal_code.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" md="6">
                <v-text-field
                    v-model="$v.data.city.$model"
                    :error="$v.data.city.$error"
                    @input="addValue"
                    label="City*">
                </v-text-field>
                <div v-if="$v.data.city.$error">
                    <p v-if="!$v.data.city.maxLength" class="caption red--text">Maximum length is 100 characters.</p>
                    <p v-if="!$v.data.city.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="$v.data.phone.$model"
                    :error="$v.data.phone.$error"
                    @input="addValue"
                    label="Personal Phone*">
                </v-text-field>
                <div v-if="$v.data.phone.$error">
                    <p v-if="!$v.data.phone.maxLength" class="caption red--text">Maximum length is 45 characters.</p>
                    <p v-if="!$v.data.phone.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="$v.data.email.$model"
                    :error="$v.data.email.$error"
                    @input="addValue"
                    label="Email*">
                </v-text-field>
                <div v-if="$v.data.email.$error">
                    <p v-if="!$v.data.email.required" class="caption red--text">Email is required.</p>
                    <p v-if="!$v.data.email.maxLength" class="caption red--text">Maximum length is 200 characters.</p>
                    <p v-if="!$v.data.email.email" class="caption red--text">Must be valid email.</p>
                </div>
            </v-col>
        </v-row>
    </v-container>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Curriculum Vitae</h3>
        </div>
    </v-card-title>
    <v-card-text>Upload your CV. This file does not substitute the information provided in the rest of the form.
    </v-card-text>
    <v-container class="px-6">
        <v-row>
            <v-col cols="12" sm="12">
                <v-file-input
                    v-model="$v.data.cv.$model"
                    :error="$v.data.cv.$error"
                    accept=".doc,.docx,.pdf,.odt"
                    show-size
                    name
                    @change="addValue()"
                    @input="addValue()"
                    label="CV*">
                </v-file-input>
            </v-col>
            <div v-if="$v.data.cv.$error">
                <p v-if="!$v.data.cv.required" class="caption red--text">Field is required.</p>
            </div>
        </v-row>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import {maxLength, required, email} from 'vuelidate/lib/validators'

export default {
    data() {
        return {
            date_menu: false,
            data: {
                name: undefined,
                gender: undefined,
                birth_date: undefined,
                countries: undefined,
                identification_type_id: null,
                identification_number: null,
                identification_valid_until: null,
                phone: null,
                email: null,
                address: null,
                postal_code: null,
                city: null,
            },
            genders: [
                {id: 'M', value: 'Male'},
                {id: 'F', value: 'Female'},
            ],
            countries: [],
            loadingCountries: false,
            searchCountries: null,
            cardTypes: [],
        }
    },
    mounted() {
        this.initialize();
        this.getCountries();
        this.getCardTypes();
    },
    computed: {
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
        getCountries() {
            var this_vm = this;
            const urlSubmit = 'api/v2/' + 'countries';
            subUtil.getPublicInfo(this_vm, urlSubmit, 'countries');
        },
        getCardTypes () {
            let this_vm = this;
            const urlSubmit = 'api/v2/' + 'card-types';
            subUtil.getPublicInfo(this_vm, urlSubmit, 'cardTypes')
            .then(() => {
                this.cardTypes = this.cardTypes.filter(
                    (el) => {
                        return el.name_en !== "Fiscal Number"
                            && el.name_en !== "Social Security Number"
                    }
                );
                console.log(this.cardTypes);
            });
        },
    },
    validations: {
        data: {
            name: { maxLength: maxLength(200), required },
            birth_date: { required },
            identification_number: { required },
            email: { required, email, maxLength: maxLength(200) },
            address: { required, maxLength: maxLength(500) },
            postal_code: { required, maxLength: maxLength(45) },
            city: { required, maxLength: maxLength(100) },
            phone: { required, maxLength: maxLength(45) },
            cv: { required },
        }
    },

}
</script>

<style>

</style>