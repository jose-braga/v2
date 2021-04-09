<template>
<v-card>
    <v-form ref="form"
        @submit.prevent="submitForm"
    >
        <v-card-title>
            <span> Edit data for project
                    <b>{{ projectDetails.project_details.title }}</b>
            </span>
        </v-card-title>
        <v-card-text>
        </v-card-text>
        <v-container>

            <v-row>
                <v-col cols="12">
                    <v-text-field v-model="projectDetails.project_details.title"
                        label="Title"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="4" sm="2">
                    <v-text-field v-model="projectDetails.project_details.acronym"
                        label="Acronym"
                    ></v-text-field>
                </v-col>
                <v-col cols="8" sm="3">
                    <v-text-field v-model="projectDetails.project_details.reference"
                        label="Reference"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="3">
                    <v-text-field v-model="projectDetails.project_details.website"
                        label="Website"
                    ></v-text-field>
                </v-col>
                <v-col cols="6" sm="2">
                    <v-menu ref="date_menu"
                        v-model="projectDetails.project_details.show_start"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="projectDetails.project_details.start"
                                label="Start date" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="projectDetails.project_details.start"
                            @input="projectDetails.project_details.show_start = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="6" sm="2">
                    <v-menu ref="date_menu"
                        v-model="projectDetails.project_details.show_end"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="projectDetails.project_details.end"
                                label="End date" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="projectDetails.project_details.end"
                            @input="projectDetails.project_details.show_end = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="3">
                    <v-select v-model="projectDetails.project_details.management_entities.management_entity_id"
                        :items="managementEntities"
                        item-value="id"
                        item-text="official_name"
                        label="Management Entity">
                    </v-select>
                </v-col>

                <v-col cols="12" sm="3">
                    <v-text-field v-model="projectDetails.project_details.management_entities.amount"
                        label="Mngmt Entity Amount (€)"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="3">
                    <v-text-field v-model="projectDetails.project_details.global_amount"
                        label="Global amount (€)"
                    ></v-text-field>
                </v-col>
                <v-col>
                    <v-switch v-model="projectDetails.project_details.confidential"
                        :label="'Confidential:' + projectDetails.project_details.confidential"
                        dense
                        hide-details
                    >
                    </v-switch>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="4">
                    <v-row justify="center">
                        <h3>Partners</h3>
                    </v-row>
                    <v-row v-for="(partner,i) in projectDetails.project_details.partners"
                        :key="i"
                        align="center"
                    >
                        <v-col cols="12">
                            <v-text-field v-model="partner.name"
                                label="Organization name"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="10" class="pb-8">
                            <v-autocomplete
                                v-model="partner.country_id"
                                :items="countries" item-value="id" item-text="name"
                                :search-input.sync="searchPartners[i]"
                                :filter="customSearch"
                                cache-items
                                flat
                                hide-no-data
                                hide-details
                                label="Country">
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="2">
                            <v-btn icon @click="removeItem(projectDetails.project_details.partners, i, 'partner')">
                                <v-icon color="red darken">mdi-delete</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col cols="12">
                            <v-divider></v-divider>
                        </v-col>
                    </v-row>

                    <v-row justify="center">
                        <v-btn small outlined class="ml-8"
                            @click="addItem(projectDetails.project_details.partners, 'partner')">
                                Add partner
                        </v-btn>
                    </v-row>
                </v-col>
                <v-divider vertical></v-divider>
                <v-col cols="12" sm="4">
                    <v-row justify="center">
                        <h3>LAQV/UCIBIO people</h3>
                    </v-row>
                    <v-row v-for="(person,i) in projectDetails.person_details"
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
                            <v-btn icon @click="removeItem(projectDetails.person_details, i, 'person')">
                                <v-icon color="red darken">mdi-delete</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col cols="12">
                            <v-divider></v-divider>
                        </v-col>
                    </v-row>

                    <v-row justify="center">
                        <v-btn small outlined class="ml-8"
                            @click="addItem(projectDetails.person_details, 'person')">
                                Add person
                        </v-btn>
                    </v-row>
                </v-col>
                <v-divider vertical></v-divider>
                <v-col cols="12" sm="">
                    <v-row justify="center">
                        <h3>Labs associated with project</h3>
                    </v-row>
                    <v-row v-for="(lab,i) in projectDetails.labs_details"
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
                            <v-btn icon @click="removeItem(projectDetails.labs_details, i, 'lab')">
                                <v-icon color="red darken">mdi-delete</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col cols="12">
                            <v-divider></v-divider>
                        </v-col>
                    </v-row>
                    <v-row justify="center">
                        <v-btn small outlined class="ml-8"
                            @click="addItem(projectDetails.labs_details, 'lab')">
                                Add lab
                        </v-btn>
                    </v-row>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-combobox flat
                        v-model="projectDetails.project_details.project_areas"
                        append-icon
                        chips
                        label="Write Project areas"
                        prefix="Project Areas: "
                        multiple
                        solo
                    >
                        <template v-slot:selection="{ attrs, item, select, selected }">
                            <v-chip
                                v-bind="attrs"
                                :input-value="selected"
                                close
                                @click="select"
                                @click:close="remove(projectDetails.project_details.project_areas, item)"
                            >
                                <strong>{{ item }}</strong>
                            </v-chip>
                        </template>
                    </v-combobox>
                </v-col>
                <v-col cols="6">
                    <v-textarea
                        v-model="projectDetails.project_details.notes"
                        rows="4"
                        counter
                        label="Notes (500 ca)">
                    </v-textarea>
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
        projectData: Object,
        projectId: Number,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            projectDetails: {
                project_details: {
                    title: '',
                    management_entities: {},
                    project_areas: [],
                    partners: [],
                },
                labs_details: [],
                person_details: [],

            },
            searchPeople: [],
            searchPartners: [],
            searchLabs: [],
            toDeletePerson: [],
            toDeletePartner: [],
            toDeleteLab: [],
            people: [],
            countries: [],
            labs: [],
            managementEntities : [],
        }
    },
    watch: {
        projectData () {
            this.initialize();
        },
    },
    mounted () {
        this.initialize();
        this.getPeople();
        this.getManagementEntities();
        this.getLabs();
        this.getCountries();
    },
    methods: {
        initialize () {
            this.projectDetails = Object.assign({}, this.projectData);
            if (this.projectDetails.project_details.confidential === 1) {
                this.projectDetails.project_details.confidential = true;
            } else if (this.projectDetails.project_details.confidential === 0) {
                this.projectDetails.project_details.confidential = false;
            } else if (this.projectDetails.project_details.confidential === undefined
                || this.projectDetails.project_details.confidential === null
            ) {
                this.projectDetails.project_details.confidential = false;
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let personID = this.otherPersonId;
                this.projectDetails.toDeletePerson = this.toDeletePerson;
                this.projectDetails.toDeleteLab = this.toDeleteLab;
                this.projectDetails.toDeletePartner = this.toDeletePartner;
                let urlUpdate = [
                    {
                        url: 'api/people/' + personID
                            + '/industry-projects/' + this.projectDetails.agreement_id,
                        body: this.projectDetails,
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
                    setTimeout(() => {
                        this.success = false;
                        this.toDeletePerson = [];
                        this.toDeleteLab = [];
                        this.toDeletePartner = [];
                        this.projectDetails = {
                            project_details: {
                                title: '',
                                management_entities: {},
                                project_areas: [],
                                partners: [],
                            },
                            labs_details: [],
                            person_details: [],

                        };
                        this.initialize();
                        this.$root.$emit('updatedIndustryProject')
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
        getCountries() {
            var this_vm = this;
            const urlSubmit = 'api/v2/' + 'countries';
            subUtil.getPublicInfo(this_vm, urlSubmit, 'countries');
        },
        getManagementEntities() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'management-entities';
                return subUtil.getPublicInfo(vm, urlSubmit, 'managementEntities');
            }
        },
        getLabs() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'labs';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labs');
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
        removeItem(list, ind, type) {
            if (type === 'person') {
                if (list[ind].id !== 'new') {
                    this.toDeletePerson.push(list[ind]);
                }
            } else if (type === 'lab') {
                if (list[ind].id !== 'new') {
                    this.toDeleteLab.push(list[ind]);
                }
            } else if (type === 'partner') {
                if (list[ind].id !== 'new') {
                    this.toDeletePartner.push(list[ind]);
                }
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