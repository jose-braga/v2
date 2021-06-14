<template>
<v-card>
    <v-form ref="form"
        @submit.prevent="submitForm"
    >
        <v-card-title>
            <span> Check data for group "{{itemDetails.name_en}}"
            </span>
        </v-card-title>
        {{itemDetails}}
        <v-container>
            <v-row>
                <v-col cols="4">
                    <v-text-field
                        v-model="itemDetails.name_en"
                        label="Group Name EN"
                    ></v-text-field>
                </v-col>
                <v-col cols="4">
                    <v-text-field
                        v-model="itemDetails.name_pt"
                        label="Group Name PT"
                    ></v-text-field>
                </v-col>
                <v-col cols="4">
                    <v-select v-model="itemDetails.email_type_id"
                        :items="emailTypes"
                        item-value="id"
                        item-text="name_en"
                        label="Email type">
                    </v-select>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="4">
                    <v-select v-model="itemDetails.city_id"
                        :items="poles"
                        item-value="id"
                        item-text="city"
                        @change="changedPole()"
                        label="All Poles">
                    </v-select>
                </v-col>
            </v-row>
            <v-row><h3>People within group</h3>
            </v-row>
            <v-row class="mt-2">
                <v-btn small outlined class="ml-8"
                    @click="addItem(itemDetails.people, 'person')">
                        Add person
                </v-btn>
            </v-row>
            <v-row>
                <v-col cols="4"
                    v-for="(person,i) in itemDetails.people"
                    :key="i"
                >
                    <v-row>
                        <v-col cols="9">
                            <v-autocomplete
                                v-model="person.person_id"
                                :items="people"
                                item-value="id"
                                item-text="colloquial_name"
                                :search-input.sync="searchPeople[i]"
                                :filter="customSearch"
                                :label="'Person ' + (i+1) ">
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="2">
                            <v-btn icon @click="removeItem(itemDetails.people, i, 'person')"
                                class="mt-3"
                            >
                                <v-icon color="red darken">mdi-delete</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col cols="1">
                        </v-col>
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
        itemData: Object,
        itemId: Number,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            itemDetails: {
            },
            searchPeople: [],
            toDeletePerson: [],
            emailTypes: [],
            poles: [],
            people: [],
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
        this.getPoles();
        this.getEmailTypes();
    },
    methods: {
        initialize () {
            this.itemDetails = Object.assign({}, this.itemData);
            for (let ind in this.itemDetails) {
                ind
                this.searchPeople.push(null);
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let personID = this.$store.state.session.personID;
                if (this.itemDetails.id === 'new') {
                    let urlCreate = [
                        {
                            url: 'api/admins/' + personID
                                + '/recipient-groups',
                            body: this.itemDetails,
                        }
                    ];
                    Promise.all(urlCreate.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                    )
                    .then(() => {
                        this.progress = false;
                        this.success = true;
                        this.$root.$emit('updatedRecipientGroups')
                        setTimeout(() => {
                            this.success = false;
                            this.toDeletePerson = [];
                            this.itemDetails = {
                            };
                        }, 1500);
                    })
                    .catch((error) => {
                        this.progress = false;
                        this.error = true;
                        setTimeout(() => {this.error = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    })
                } else {
                    this.itemDetails.toDeletePerson = this.toDeletePerson;
                    let urlUpdate = [
                        {
                            url: 'api/admins/' + personID
                                + '/recipient-groups/' + this.itemDetails.id,
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
                        this.$root.$emit('updatedRecipientGroups')
                        setTimeout(() => {
                            this.success = false;
                            this.toDeletePerson = [];
                            this.itemDetails = {
                            };
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
        getEmailTypes () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'email-types';
            return subUtil.getPublicInfo(vm, urlSubmit, 'emailTypes');
        },
        getPoles () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'poles';
            return subUtil.getPublicInfo(vm, urlSubmit, 'poles')
            .then( () => {
                this.poles.push({id: 'all', city: 'All poles'})
                if (this.itemDetails.any_cities === 1) {
                    this.itemDetails.city_id = 'all';
                }
            })
            ;
        },
        changedPole () {
            if (this.itemDetails.city_id === 'all') {
                this.itemDetails.any_cities = 1;
            } else {
                this.itemDetails.any_cities = 0;
            }
        },
        addItem(list, type) {
            if (type === 'person') {
                list.push({
                    id: 'new',
                });
                this.searchPeople.push(null);
            }
        },
        removeItem(list, ind, type) {
            if (type === 'person') {
                if (list[ind].id !== 'new') {
                    this.toDeletePerson.push(list[ind]);
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
}
</script>

<style>

</style>