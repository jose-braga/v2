<template>
<v-card class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Nuclear information</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container class="px-6">
        <v-text-field
            v-model="$v.data.name.$model"
            :error="$v.data.name.$error"
            @input="addValue"
            label="Full Name*">
        </v-text-field>
        <div v-if="$v.data.name.$error">
            <p v-if="!$v.data.name.required" class="caption red--text">Name is required.</p>
            <p v-if="!$v.data.name.maxLength" class="caption red--text">Maximum characters: 100.</p>
        </div>
        <v-text-field
            v-model="$v.data.colloquial_name.$model"
            :error="$v.data.colloquial_name.$error"
            @input="addValue"
            label="Colloquial Name* (minimum: name and surname)">
        </v-text-field>
        <div v-if="$v.data.colloquial_name.$error">
            <p v-if="!$v.data.colloquial_name.required" class="caption red--text">Colloquial name is required.</p>
            <p v-if="!$v.data.colloquial_name.maxLength" class="caption red--text">Maximum characters: 100.</p>
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
                        <v-text-field v-model="data.birth_date"
                             @input="addValue"
                            label="Birth date" v-on="on">
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="data.birth_date"
                        @input="date_menu = false; addValue()"
                        no-title
                    ></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="12" sm="4">
                <v-autocomplete
                    v-model="data.countries" multiple
                    :loading="loadingCountries"
                    :items="countries" item-value="id" item-text="name"
                    :search-input.sync="searchCountries"
                    return-object
                    cache-items
                    flat
                    hide-no-data
                    hide-details
                    @input="addValue"
                    label="Nationalities">
                </v-autocomplete>
            </v-col>
        </v-row>
    </v-container>
</v-card>

</template>

<script>
import subUtil from '@/components/common/submit-utils'
import {maxLength, required} from 'vuelidate/lib/validators'

export default {
    data() {
        return {
            date_menu: false,
            data: {
                name: undefined,
                colloquial_name: undefined,
                gender: undefined,
                birth_date: undefined,
                countries: undefined,
            },
            genders: [
                {id: 'M', value: 'Male'},
                {id: 'F', value: 'Female'},
            ],
            countries: [],
            loadingCountries: false,
            searchCountries: '',
        }
    },
    created() {
        this.getCountries();
    },
    methods: {
        addValue () {
            this.$store.commit('addPersonData', this.data);
        },
        getCountries() {
            var this_vm = this;
            const urlSubmit = 'api/v2/' + 'countries';
            return subUtil.getPublicInfo(this_vm, urlSubmit, 'countries');
        },
    },
    validations: {
        data: {
            name: { maxLength: maxLength(100), required },
            colloquial_name: { maxLength: maxLength(100), required },
        }
    }

}
</script>

<style>

</style>