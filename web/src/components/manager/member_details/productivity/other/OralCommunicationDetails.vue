<template>
<v-card>
    <v-form ref="form"
        @submit.prevent="submitForm"
    >
        <v-card-title>
            <span> Edit data for communication
                    <b>{{ itemDetails.title_show }}</b>
            </span>
        </v-card-title>
        <v-card-text>
        </v-card-text>
        <v-container>
            <v-form ref="form"
                @submit.prevent="submitForm"
            >
                <v-row v-if="isUnstructured" align="center">
                    <v-col cols="12" sm="2">
                        Data is <b>unstructured</b>.
                    </v-col>
                    <v-col>
                        <v-checkbox
                            v-model="convertToStructured"
                            label="Convert to structured data."

                        >
                        </v-checkbox>
                    </v-col>

                </v-row>
                <v-row v-else><p>Data is <b>structured</b></p></v-row>
                <div v-if="convertToStructured">
                    <v-row>
                        <v-col cols="12" sm="9">
                            <v-text-field v-model="itemDetails.title"
                                label="Title"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="3">
                            <v-select v-model="itemDetails.type_id"
                                :items="communicationTypes"
                                item-value="id"
                                item-text="name"
                                label="Communication Type">
                            </v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="itemDetails.authors_raw"
                                label="Authors"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6">
                            <v-text-field v-model="itemDetails.conference_title"
                                label="Meeting Name"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="3">
                            <v-select v-model="itemDetails.conference_type_id"
                                :items="conferenceTypes"
                                item-value="id"
                                item-text="name"
                                label="Meeting Type">
                            </v-select>
                        </v-col>
                        <v-col>
                            <v-switch v-model="itemDetails.international"
                                :label="'International:' + itemDetails.international"
                                dense
                                hide-details
                            >
                            </v-switch>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6" sm="4" class="pb-8">
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
                        <v-col cols="6" sm="4">
                            <v-text-field v-model="itemDetails.city"
                                label="City"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="6" sm="2">
                            <v-menu ref="date_menu"
                                v-model="itemDetails.show_start"
                                :close-on-content-click="false"
                                :nudge-right="10"
                                transition="scale-transition"
                                offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="itemDetails.date"
                                        label="Date talk/poster" v-on="on">
                                    </v-text-field>
                                </template>
                                <v-date-picker v-model="itemDetails.date"
                                    @input="itemDetails.show_start = false"
                                    no-title
                                ></v-date-picker>
                            </v-menu>
                        </v-col>
                    </v-row>
                </div>
                <div v-else>
                    <v-row>
                        <v-col cols="12">
                            <v-textarea v-model="itemDetails.communication_raw"
                                label="Communications (unstructured data)"
                                rows="2"
                            ></v-textarea>
                        </v-col>
                    </v-row>
                </div>
                <v-row>
                    <v-col cols="12">
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
                                <v-btn icon @click="removeItem(itemDetails.labs_details, i)">
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
                    <div>
                        <v-btn type="submit"
                            outlined color="blue">Update</v-btn>
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
            </v-form>
        </v-container>
    </v-form>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

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
        otherPersonId: Number,
        itemData: Object,
        itemId: Number,
        endpoint: String,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            isUnstructured: false,
            convertToStructured: false,
            searchCountries: '',
            itemDetails: {
                labs_details: [],
            },
            searchLabs: [],
            toDeleteLab: [],
            people: [],
            countries: [],
            labs: [],
            conferenceTypes: [],
            communicationTypes: [],
        }
    },
    watch: {
        itemData () {
            this.initialize();
        },
    },
    mounted () {
        this.initialize();
        this.getLabs();
        this.getCountries();
        this.getConferenceTypes();
        this.getCommunicationTypes();
    },
    methods: {
        initialize () {
            this.isUnstructured = false;
            this.convertToStructured = false;
            this.itemDetails = Object.assign({}, this.itemData);
            if (this.itemDetails.international === null
                || this.itemDetails.international === undefined) {
                this.itemDetails.international = false;
            }
            if (this.itemDetails.communication_raw) {
                this.isUnstructured = true;
            } else {
                // data is already structured
                this.convertToStructured = true;
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let personID = this.otherPersonId;
                this.itemDetails.isUnstructured = this.isUnstructured;
                this.itemDetails.convertToStructured = this.convertToStructured;
                this.itemDetails.toDeleteLab = this.toDeleteLab;
                let urlUpdate = [
                    {
                        url: 'api' + this.endpoint
                            + '/members'
                            + '/' + personID
                            + '/communications/' + this.itemDetails.id,
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
                    this.$root.$emit('updatedCommunication')
                    setTimeout(() => {
                        this.success = false;
                        this.toDeleteLab = [];
                        this.itemDetails = {
                            labs_details: [],
                        };
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
        getConferenceTypes() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'conference-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'conferenceTypes');
            }
        },
        getCommunicationTypes() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'communication-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'communicationTypes');
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
            } else if (type === 'partner') {
                list.push({
                    id: 'new',
                });
                this.searchPartners.push(null);
            }
        },
        removeItem(list, ind) {
            if (list[ind].id !== 'new') {
                this.toDeleteLab.push(list[ind]);
            }
            list.splice(ind, 1);
        },
        remove (list, item) {
            list.splice(list.indexOf(item), 1)
            list = [...list]
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


}
</script>

<style>

</style>