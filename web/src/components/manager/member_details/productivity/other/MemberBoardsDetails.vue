<template>
<v-card>
    <v-form ref="form"
        @submit.prevent="submitForm"
    >
        <v-card-title>
            <span> Edit data for board
                    <b>{{ itemDetails.item_details.board_name }}</b>
            </span>
        </v-card-title>
        <v-card-text>
        </v-card-text>
        <v-container>
            <v-form ref="form"
                @submit.prevent="submitForm">
                <v-row>
                    <v-col cols="12" sm="5">
                        <v-text-field v-model="itemDetails.item_details.board_name"
                            label="Board name"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="3">
                        <v-select v-model="itemDetails.item_details.board_type_id"
                            :items="boardTypes"
                            item-value="id"
                            item-text="name"
                            label="Board type">
                        </v-select>
                    </v-col>
                    <v-col>
                        <v-switch v-model="itemDetails.item_details.international"
                            :label="'International:' + itemDetails.item_details.international"
                            dense
                            hide-details
                        >
                        </v-switch>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" sm="5">
                        <v-text-field v-model="itemDetails.item_details.role"
                            label="Role"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="2">
                        <v-menu ref="date_menu"
                            v-model="itemDetails.item_details.show_start"
                            :close-on-content-click="false"
                            :nudge-right="10"
                            transition="scale-transition"
                            offset-y min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="itemDetails.item_details.start_date"
                                    label="Start date" v-on="on">
                                </v-text-field>
                            </template>
                            <v-date-picker v-model="itemDetails.item_details.start_date"
                                @input="itemDetails.item_details.show_start = false"
                                no-title
                            ></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="6" sm="2">
                        <v-menu ref="date_menu_2"
                            v-model="itemDetails.item_details.show_end"
                            :close-on-content-click="false"
                            :nudge-right="10"
                            transition="scale-transition"
                            offset-y min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="itemDetails.item_details.end_date"
                                    label="End date" v-on="on">
                                </v-text-field>
                            </template>
                            <v-date-picker v-model="itemDetails.item_details.end_date"
                                @input="itemDetails.item_details.show_end = false"
                                no-title
                            ></v-date-picker>
                        </v-menu>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-textarea
                            v-model="itemDetails.item_details.short_description"
                            rows="3"
                            counter
                            label="Description (<400 ca)">
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
                            align="center"
                        >
                            <v-col cols="12" sm="9">
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

                            <v-col cols="3">
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
                            <h3>Labs associated with prize</h3>
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
            </v-form>
        </v-container>
    </v-form>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
//import {integer, decimal} from 'vuelidate/lib/validators'

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
            itemDetails: {
                item_details: {
                    board_name: '',
                },
                labs_details: [],
                person_details: [],

            },
            searchPeople: [],
            searchLabs: [],
            toDeletePerson: [],
            toDeleteLab: [],
            people: [],
            labs: [],
            boardTypes: [],
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
        this.getLabs();
        this.getBoardTypes();
    },
    methods: {
        initialize () {
            this.itemDetails = Object.assign({}, this.itemData);
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let personID = this.otherPersonId;
                this.itemDetails.toDeletePerson = this.toDeletePerson;
                this.itemDetails.toDeleteLab = this.toDeleteLab;
                let urlUpdate = [
                    {
                        url: 'api' + this.endpoint
                            + '/members'
                            + '/' + personID
                            + '/boards/' + this.itemDetails.board_id,
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
                    this.$root.$emit('updatedBoard')
                    setTimeout(() => {
                        this.success = false;
                        this.toDeletePerson = [];
                        this.toDeleteLab = [];
                        this.itemDetails = {
                            labs_details: [],
                            person_details: [],
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
        },
        getPeople () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'people-simple';
            return subUtil.getPublicInfo(vm, urlSubmit, 'people');
        },
        getLabs() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'labs';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labs');
            }
        },
        getBoardTypes() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'board-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'boardTypes');
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
    },

}
</script>

<style>

</style>