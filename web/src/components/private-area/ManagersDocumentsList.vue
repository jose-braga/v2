<template>
<v-card class="px-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Manage Documents Queue</h3>
        </div>
    </v-card-title>

    <v-container class="px-4">
        {{ documentsToUpdate }}
        <v-form ref="form"
                @submit.prevent="submitForm">
        <v-treeview :items="data.sections"
            hoverable
            item-text="name"
            open-on-click
        >
            <template v-slot:prepend="{ item }">
                <v-icon @click="editItem(item)">
                    {{ item.display_name ? 'mdi-delete': 'mdi-pencil'}}
                </v-icon>
            </template>
            <template v-slot:label="{ item }">
                <v-icon v-if="item.to_delete">
                    {{ 'mdi-alert-circle'}}
                </v-icon>
                <v-text-field v-if="item.editable"
                    v-model="item.sort_order"
                    label="Sort order">
                </v-text-field>
                <v-text-field v-if="item.editable && !item.content"
                    v-model="item.name"
                    label="Change section name">
                </v-text-field>
                <v-text-field v-if="item.editable && item.content"
                    v-model="item.name"
                    label="Change group name">
                </v-text-field>
                <v-textarea v-if="item.editable && item.content"
                    v-model="item.content"
                    label="Change group content">
                </v-textarea>
                <span v-if="!item.editable && !item.display_name">
                    {{ item.name }}
                </span>
                <span v-if="!item.editable && item.display_name">
                    <v-container>
                        <v-row align="center">
                            <v-col col="4">
                                {{ item.name }}
                            </v-col>
                            <v-col col="4">
                                <v-text-field v-model="item.display_name"
                                    label="Display name"
                                    @input="editDocumentInfo(item)"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col col="4">
                                <v-text-field v-model="item.sort_order"
                                    label="Sort order"
                                    @input="editDocumentInfo(item)"
                                >
                                </v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </span>
            </template>
            <!--
            <template v-slot:append="{ item }">

            </template>
            -->

        </v-treeview>
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
//import time from '@/components/common/date-utils'

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


export default {
    props: {
        unitName: String,
        unitId: Number,
        tabName: String,
        tabId: Number,
    },
    data () {
        return {
            formError: false,
            progress: false,
            success: false,
            error: false,
            search: '',
            data: {
                sections: [],
            },

            hasFile: false,
            hasURL: false,
            toDelete: [],
            documentsToUpdate: [],
            sectionsToUpdate: [],
            groupsToUpdate: [],
        }
    },
    mounted () {
        this.initialize();
        this.$root.$on('updatePrivateDocumentsList',
            () => {
                this.initialize();
            }
        );
    },
    watch: {
        tabName () {
            this.initialize();
        },
        unitId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            let urlGetDocuments = []
            let this_session = this.$store.state.session;
            let personID = this_session.personID;
            let url = 'api/private-areas/' + personID
                            + '/tabs/' + this.tabId
                            + '/sections'
            subUtil.getInfoPopulate(this, url, true)
                .then( (result) => {
                    this.data.sections = result.sort(customSorter)
                    if (result.length > 0) this.noDocuments = false;
                    return Promise.all(
                        this.data.sections.map(el => {
                            url = 'api/private-areas/' + personID
                                + '/tabs/' + this.tabId
                                + '/sections/' + el.id
                                + '/groups'
                            return this.$http.get(url,
                            {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                            })
                        })
                    )
                })
                .then( (result) => {
                    for (let ind in result) {
                        this.$set(this.data.sections[ind], 'children',
                            result[ind].data.result.sort(customSorter))
                        this.$set(this.data.sections[ind], 'name',
                            this.data.sections[ind].section_name)
                        for (let ind2 in this.data.sections[ind].children) {
                            this.$set(this.data.sections[ind].children[ind2], 'children', [])
                            this.$set(this.data.sections[ind].children[ind2], 'name',
                                this.data.sections[ind].children[ind2].title)
                            url = 'api/private-areas/' + personID
                                + '/tabs/' + this.tabId
                                + '/sections/' + this.data.sections[ind].id
                                + '/groups/' + this.data.sections[ind].children[ind2].id
                                + '/documents'
                            urlGetDocuments.push({
                                section: this.data.sections[ind].id,
                                group: this.data.sections[ind].children[ind2].id,
                                url
                            })
                        }
                    }
                    return Promise.all(
                        urlGetDocuments.map(el => {
                            return this.$http.get(el.url,
                            {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                            })
                        })
                    )
                })
                .then( (result) => {
                    for (let ind in result) {
                        // find the section in which it should be placed
                        for (let ind2 in this.data.sections){
                            for (let ind3 in this.data.sections[ind2].children) {
                                if (this.data.sections[ind2].id === urlGetDocuments[ind].section
                                    && this.data.sections[ind2].children[ind3].id === urlGetDocuments[ind].group
                                ){
                                    this.$set(this.data.sections[ind2].children[ind3], 'children',
                                        result[ind].data.result.sort(customSorter))
                                    for (let ind4 in this.data.sections[ind2].children[ind3].children) {
                                        this.$set(this.data.sections[ind2].children[ind3].children[ind4], 'name',
                                            this.data.sections[ind2].children[ind3].children[ind4].display_name)
                                    }

                                }
                            }
                        }
                    }
                })

        },
        submitForm() {
            if (this.$store.state.session.loggedIn) {
                let this_session = this.$store.state.session;
                let personID = this_session.personID;
                this.progress = true;
                let toDeleteIDs = []
                let toupdateIDs = []
                for (let ind in this.toDelete) {
                    let found = false
                    // finds section_id of document
                    for (let ind2 in this.data.sections) {
                        for (let ind3 in this.data.sections[ind2].children) {
                            if (this.data.sections[ind2].children[ind3].id === this.toDelete[ind].group_id) {
                                toDeleteIDs.push({
                                    tab_id: this.tabId,
                                    section_id: this.data.sections[ind2].id,
                                    group_id: this.toDelete[ind].group_id,
                                    doc_id: this.toDelete[ind].id,
                                })
                            }
                        }
                        if (found) break;
                    }
                }
                for (let ind in this.documentsToUpdate) {
                    let found = false
                    // finds section_id of document
                    for (let ind2 in this.data.sections) {
                        for (let ind3 in this.data.sections[ind2].children) {
                            if (this.data.sections[ind2].children[ind3].id === this.documentsToUpdate[ind].group_id) {
                                toupdateIDs.push({
                                    tab_id: this.tabId,
                                    section_id: this.data.sections[ind2].id,
                                    group_id: this.documentsToUpdate[ind].group_id,
                                    doc_id: this.documentsToUpdate[ind].id,
                                    display_name: this.documentsToUpdate[ind].display_name,
                                    sort_order: this.documentsToUpdate[ind].sort_order,
                                })
                            }
                        }
                        if (found) break;
                    }
                }
                return Promise.all(
                    toDeleteIDs.map(el =>
                        this.$http.delete(
                            'api/private-areas/' + personID
                                + '/tabs/' + el.tab_id
                                + '/sections/' + el.section_id
                                + '/groups/' + el.group_id
                                + '/documents/' + el.doc_id,
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']},
                            }
                    ))
                )
                .then( () => {
                    return Promise.all(
                        toupdateIDs.map(el =>
                            this.$http.put(
                                'api/private-areas/' + personID
                                + '/tabs/' + el.tab_id
                                + '/sections/' + el.section_id
                                + '/groups/' + el.group_id
                                + '/documents/' + el.doc_id,
                                { data: el, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                        ))
                    )
                })
                .then( () => {
                    return Promise.all(
                        this.groupsToUpdate.map(el =>
                            this.$http.put(
                                'api/private-areas/' + personID
                                    + '/tabs/' + this.tabId
                                    + '/sections/' + el.section_id
                                    + '/groups/' + el.id,
                                { data: el, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                        ))
                    )
                })
                .then( () => {
                    return Promise.all(
                        this.sectionsToUpdate.map(el =>
                            this.$http.put(
                                'api/private-areas/' + personID
                                    + '/tabs/' + this.tabId
                                    + '/sections/' + el.id,
                                { data: el, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                        ))
                    )
                })
                .then( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.toDelete = [];
                    this.sectionsToUpdate = [],
                    this.groupsToUpdate = [],
                    this.$root.$emit('updatePrivateDocumentsList')
                    this.initialize();
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    this.toDelete = [];
                    this.sectionsToUpdate = [],
                    this.groupsToUpdate = [],
                    this.initialize();
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                });
            }
        },
        deleteDocuments() {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlDelete = [];
                for (let ind in this.toDelete) {
                    if (this.cityId !== undefined) {
                        urlDelete.push('api/unit-areas/' + this.unitId
                                + '/cities/' + this.cityId
                                + '/documents/' + this.toDelete[ind].id);
                    } else {
                        urlDelete.push('api/unit-areas/' + this.unitId
                                    + '/documents/' + this.toDelete[ind].id);
                    }
                }

            }
        },
        editDocumentInfo (item) {
            if (this.documentsToUpdate.indexOf(item) === -1) {
                this.documentsToUpdate.push(item);
            }
        },
        editItem(item) {
            if (item.display_name) {
                if (item.to_delete) {
                    item.to_delete = !item.to_delete;
                    let ind = this.toDelete.indexOf(item);
                    this.toDelete.splice(ind, 1);
                } else {
                    this.toDelete.push(item);
                    this.$set(item, 'to_delete', true);
                }
            } else {
                item.editable = !item.editable;
                if (item.section_name) {
                    if (this.sectionsToUpdate.indexOf(item) === -1) {
                        this.sectionsToUpdate.push(item);
                    }

                } else if (item.title) {
                    if (this.groupsToUpdate.indexOf(item) === -1) {
                        this.groupsToUpdate.push(item);
                    }
                }
            }

        },
        removeItem(item) {
            let ind = this.data.documents.indexOf(item);
            this.toDelete.push(this.data.documents[ind]);
            this.data.documents.splice(ind, 1);
        },
    },
}
</script>

<style>
.item-dates {
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 5px;
    font-size: 0.7rem;
}

</style>