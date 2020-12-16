<template>
<v-form ref="form"
    @submit.prevent="submitForm()">
    <v-card-text>
        <v-row>
            <h2>User</h2>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field
                    v-model="$v.data.username.$model"
                    :error="$v.data.username.$error"
                    label="Username">
                </v-text-field>
                <div v-if="$v.data.username.$error">
                    <div v-if="!$v.data.username.isUnique">
                        <p class="caption red--text">Username already taken.</p>
                    </div>
                    <div v-if="!$v.data.username.required">
                        <p class="caption red--text">A username is required.</p>
                    </div>
                </div>
                <v-text-field
                    v-model="$v.data.password.$model"
                    label="Password"
                    type="password">
                </v-text-field>
                <v-text-field
                    v-model="$v.data.passwordConfirm.$model"
                    label="Confirm Password"
                    type="password">
                </v-text-field>
                <div v-if="$v.data.passwordConfirm.$error">
                    <div v-if="!$v.data.passwordConfirm.confirmPassword">
                        <p class="caption red--text">Values don't match.</p>
                    </div>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <h2>Personal Data</h2>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field
                    v-model="$v.data.name.$model"
                    label="Full Name">
                </v-text-field>
                <div v-if="$v.data.name.$error">
                    <div v-if="!$v.data.name.required">
                        <p class="caption red--text">Name is required.</p>
                    </div>
                    <div v-if="!$v.data.name.maxLength">
                    <p class="caption red--text">Maximum characters: 100.</p>
                </div>
                </div>
                <v-text-field
                    v-model="$v.data.colloquial_name.$model"
                    label="Colloquial Name (minimum: name and surname)">
                </v-text-field>
                <div v-if="$v.data.colloquial_name.$error">
                    <div v-if="!$v.data.colloquial_name.required">
                        <p class="caption red--text">Colloquial name is required.</p>
                    </div>
                    <div v-if="!$v.data.colloquial_name.maxLength">
                        <p class="caption red--text">Maximum characters: 100.</p>
                    </div>
                </div>
                <v-row>
                    <v-col cols="12" sm="4">
                        <v-select v-model="data.gender"
                            :items="genders" item-value="id" item-text="value"
                            label="Gender">
                        </v-select>
                    </v-col>
                    <v-col cols="12" sm="4">
                        <v-menu ref="date_menu_birth" v-model="date_menu_birth"
                            :close-on-content-click="false"
                            :nudge-right="10"
                            transition="scale-transition"
                            offset-y min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="data.birth_date"
                                    label="Birth date" v-on="on">
                                </v-text-field>
                            </template>
                            <v-date-picker v-model="data.birth_date" @input="date_menu_birth = false" no-title></v-date-picker>
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
                            label="Nationalities">
                        </v-autocomplete>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <v-row>
            <h2>Personal Contacts</h2>
        </v-row>
        <v-row>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="data.personal_phones.phone"
                    label="Personal Phone">
                </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="$v.data.personal_emails.email.$model"
                    label="Personal Email">
                </v-text-field>
                <div v-if="$v.data.personal_emails.email.$error">
                    <div v-if="!$v.data.personal_emails.email.email">
                        <p class="caption red--text">Invalid email.</p>
                    </div>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <h2>Institutional Contacts</h2>
        </v-row>
        <v-row>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.phones.phone"
                    label="Institutional Phone">
                </v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.phones.extension"
                    label="Extension">
                </v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="$v.data.emails.email.$model"
                    label="Institutional Email">
                </v-text-field>
                <div v-if="$v.data.emails.email.$error">
                    <div v-if="!$v.data.emails.email.email">
                        <p class="caption red--text">Invalid email.</p>
                    </div>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <h2>Research Units Affiliations</h2>
        </v-row>
        <v-row>
        </v-row>
    </v-card-text>
    <v-card-actions>
        <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
        >
            Add
        </v-btn>
    </v-card-actions>
</v-form>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import {
    required, sameAs, maxLength, email,
    minValue, maxValue, integer
} from 'vuelidate/lib/validators'

export default {

    props: {
        segmentType: String,
        unitId: Number,
        cityId: Number,
        unitData: Object,
        cityData: Object,
        managerId: Number,
        endpoint: String,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            date_menu_birth: false,
            data: {
                username: '',
                password: '',
                passwordConfirm: '',
                name: '',
                colloquial_name: '',
                gender: null,
                birth_date: null,
                countries: null,
                personal_addresses: {
                    address: undefined,
                    postal_code: undefined,
                    city: undefined,
                },
                personal_emails: { email: undefined },
                personal_phones: { phone: undefined },
                emails: { email: undefined },
                phones: {
                    phone: undefined,
                    extension: undefined,
                },
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
    mounted () {
        this.initialize();
        this.getCountries();
        this.getSituationsCategories();
        this.getFellowshipTypes();
        this.getManagementEntities();
        this.getFundingAgencies();

    },
    methods: {
        initialize () {

        },
        getCountries() {
            var this_vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'countries';
                return subUtil.getPublicInfo(this_vm, urlSubmit, 'countries');
            }
        },
        getSituationsCategories() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'situations-categories';
                return subUtil.getPublicInfo(vm, urlSubmit, 'situationsCategories');
            }
        },
        getFellowshipTypes() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'fellowship-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'fellowshipTypes');
            }
        },
        getManagementEntities() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'management-entities';
                return subUtil.getPublicInfo(vm, urlSubmit, 'managementEntities');
            }
        },
        getFundingAgencies() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'funding-agencies';
                return subUtil.getPublicInfo(vm, urlSubmit, 'fundingAgencies');
            }
        },

    },
    validations: {
        data: {
            username: {
                required,
                isUnique (value) {
                    if (this.$store.state.session.loggedIn && value !== undefined) {
                        if (value.length > 0) {
                            let urlSubmit = 'api' + this.endpoint
                                    + '/members'
                                    + '/' + this.personId
                                    + '/users/' + value;
                            return subUtil.getInfoPopulate(this, urlSubmit, true, true)
                            .then( (result) => {
                                if (result.valid) {
                                    return result.valid;
                                } else {
                                    if (this.data.username === this.data.originalUsername) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                }
                            })
                            .catch((error) => {
                                console.log(error)
                                return false;
                            });
                        } else {
                            return true;
                        }


                    } else {
                        return false;
                    }
                },
            },
            password: {required},
            passwordConfirm: { confirmPassword: sameAs('password') },
            name: { maxLength: maxLength(100), required },
            colloquial_name: { maxLength: maxLength(100), required },
            personal_emails: {
                email: { email }
            },
            emails: {
                email: { email }
            },
            situations: {
                $each: {
                    dedication: {
                        minValue: minValue(0),
                        maxValue: maxValue(100),
                        integer
                    }
                }
            },
        }
    }
}
</script>

<style>

</style>