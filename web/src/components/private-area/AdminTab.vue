<template>
<v-card class="px-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Manage People Permissions</h3>
        </div>
    </v-card-title>
    <v-card-text>
    </v-card-text>
    <v-container class="px-4">
        <v-form ref="form"
            @submit.prevent="submitForm"
        >
            <v-treeview :items="tabs"
                hoverable
                item-text="name"
                open-on-click
            >
                <template v-slot:prepend="{ item }">
                    <v-icon v-if="item.person_id"
                        @click="editItem(item)">
                        {{ 'mdi-pencil'}}
                    </v-icon>
                </template>
                <template v-slot:label="{ item }">
                    <div v-if="!item.editable">
                        {{ item.name }}
                    </div>
                    <div v-else>
                        <v-container>
                            <v-row align="center">
                                <v-col cols="6">
                                    {{ item.name }}
                                </v-col>
                                <v-col cols="3">
                                    <v-checkbox
                                        v-model="item.tab_permission"
                                        @change="accessChange(item)"
                                        label="Access tab"
                                        >
                                    </v-checkbox>
                                </v-col>
                                <v-col cols="3">
                                    <v-checkbox
                                        v-model="item.management_permission"
                                        @change="managementChange(item)"
                                        label="Manage tab"
                                        >
                                    </v-checkbox>
                                </v-col>
                            </v-row>
                        </v-container>

                    </div>
                </template>
            </v-treeview>
            <v-row class="mt-4">
                <v-col cols="12">
                    <h3>Add person to a tab</h3>
                </v-col>
            </v-row>
            <v-row align="center">
                <v-col cols="4">
                    <v-autocomplete
                        v-model="toCreate.person_id"
                        :items="people"
                        item-value="id" item-text="name"
                        :filter="customSearch"
                        label="Person name"
                        dense>
                    </v-autocomplete>
                </v-col>
                <v-col cols="4">
                    <v-select v-model="toCreate.tab_id"
                        :items="tabs"
                        item-value="id" item-text="tab_name"
                        label="Tab"
                        dense>
                    </v-select>
                </v-col>
                <v-col cols="3">
                    <v-checkbox
                        v-model="toCreate.management_permission"
                        label="Manage tab"
                    >
                    </v-checkbox>
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
import subUtil from '@/components/common/submit-utils'


function customSorter (a,b) {
    if (a.sort_order !== null && b.sort_order !== null) {
        return -(a.sort_order - b.sort_order);
    } else if (a.sort_order === null) {
        return +1;
    } else if (b.sort_order === null) {
        return -1;
    } else {
        return a.id - b.id;
    }
}

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
        unitName: String,
        unitId: Number,
        tabName: String,
        tabId: Number,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            tabs: [],
            people: [],
            toDelete: [],
            toUpdate: [],
            toCreate: {},
        }
    },
    created () {
        this.initialize();
    },
    watch: {
        tabName () {
            this.initialize();
            this.$refs.form.reset()
        },
        unitId () {
            this.initialize();
            this.$refs.form.reset()
        },

    },
    methods: {
        submitForm() {
            // Create submit data first for creating DB entries
            // Then upload files
            if (this.$store.state.session.loggedIn) {
                let this_session = this.$store.state.session;
                let personID = this_session.personID;
                this.progress = true;
                let create = [];
                if (this.toCreate.person_id != null && this.toCreate.person_id != undefined) {
                    create = [this.toCreate]
                }
                Promise.all(
                    create.map(el =>
                        this.$http.post('api/private-areas/' + personID
                                + '/tabs/' + el.tab_id
                                + '/people',
                            { data: el, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']},
                            })
                    )
                )
                .then(() => {
                    return Promise.all(
                        this.toUpdate.map(el =>
                            this.$http.put(
                                'api/private-areas/' + personID
                                + '/tabs/' + el.priv_tab_id
                                + '/people/' + el.person_id,
                            { data: el, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']},
                            })
                    ))
                })
                /*
                .then(() => {
                    return Promise.all(
                        this.toDelete.map(el =>
                            this.$http.delete(
                                'api/private-areas/' + personID
                                + '/tabs/' + el.priv_tab_id
                                + '/people/' + el.person_id,
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                            )
                    ))
                })
                    */
                .then(() => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {
                        this.success = false;
                        this.$refs.form.reset();}, 1500);
                    this.toDelete = [];
                    this.toUpdate = [];
                    this.toCreate = {};
                    this.initialize();
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
        initialize() {
            let this_session = this.$store.state.session;
            let personID = this_session.personID;
            this.getPeople();
            const urlSubmit = 'api/v2/' + 'private-document-tabs?unit_id=' + this.unitId;
            subUtil.getPublicInfo(this, urlSubmit, 'tabs')
            .then(() => {
                this.tabs.sort(customSorter)
                let url = '';
                return Promise.all(
                        this.tabs.map(el => {
                            this.$set(el, 'name', el.tab_name);
                            url = 'api/private-areas/' + personID
                                + '/tabs/' + el.id
                                + '/people'
                            return this.$http.get(url,
                            {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                            })
                        })
                    )

            })
            .then((result) => {
                for (let ind in result) {
                    let people = result[ind].data.result;
                    for (let ind2 in people) {
                        people[ind2].tab_permission = true;
                    }
                    this.$set(this.tabs[ind], 'children', people);
                }

            })
            .catch((error) => {
                // eslint-disable-next-line
                console.log(error)
            });

        },
        editItem(item) {
            if (item.editable) {
                item.editable = !item.editable;
            } else {
                this.$set(item, 'editable', true);
                if (this.toUpdate.indexOf(item) === -1) {
                    this.toUpdate.push(item)
                }
            }
        },
        accessChange(item) {
            if (item.tab_permission === 0 || item.tab_permission === false) {
                item.management_permission = false;
            }
        },
        managementChange(item) {
            if (item.management_permission === 1 || item.management_permission === true ) {
                item.tab_permission = true;
            }

        },
        getPeople() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'people-simple';
                return subUtil.getPublicInfo(vm, urlSubmit, 'people', 'colloquial_name');
            }
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