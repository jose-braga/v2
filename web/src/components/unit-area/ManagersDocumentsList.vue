<template>
<v-card class="px-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Manage Documents Queue</h3>
        </div>
    </v-card-title>
    <v-card-text>
    </v-card-text>
    <v-container class="px-4">
        <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
            class="px-2 mb-4"
        ></v-text-field>
        <v-data-table
            item-key="id"
            :search="search"
            :headers="headers"
            :footer-props="footerProps"
            :items="data.documents"
            :items-per-page="10"
            :sort-by="['doc_type_name']"
            :sort-desc="[false]"
        >
            <template v-slot:top>
                <v-dialog v-model="dialog"
                    max-width="1600px"
                    width="100%"
                >
                    <v-card>
                        <v-card-title>
                            <span> Edit document data</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-form ref="form"
                                    @submit.prevent="submitForm"
                                >
                                    <v-row align="center">
                                        <v-col cols="12" sm="4">
                                            <v-select v-model="data.item.tab_id"
                                                :items="unitCityTabs" item-value="id" item-text="tab_name"
                                                label="Tab">
                                            </v-select>
                                        </v-col>
                                        <v-col cols="12" sm="4">
                                            <v-select v-model="data.item.doc_type_id"
                                                :items="documentTypes" item-value="id" item-text="name"
                                                label="Document type">
                                            </v-select>
                                        </v-col>
                                        <v-col cols="12" sm="4">
                                            <v-select v-model="data.item.contentOption"
                                                :items="contentOptions"
                                                @change="changedContentOption()"
                                                label="Contents type">
                                            </v-select>
                                        </v-col>
                                    </v-row>
                                    <v-row align="center">
                                        <v-col cols="2">
                                            <v-text-field
                                                v-model="data.item.sort_order"
                                                label="Order #">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="4">
                                            <v-menu ref="data.item.show_date_start"
                                                v-model="data.item.show_date_start"
                                                :close-on-content-click="false"
                                                :nudge-right="10"
                                                transition="scale-transition"
                                                offset-y min-width="290px">
                                                <template v-slot:activator="{ on }">
                                                    <v-text-field v-model="data.item.valid_from"
                                                        label="Visible from" v-on="on">
                                                    </v-text-field>
                                                </template>
                                                <v-date-picker v-model="data.item.valid_from"
                                                        @input="data.item.show_date_start = false"
                                                        no-title></v-date-picker>
                                            </v-menu>
                                        </v-col>
                                        <v-col cols="12" sm="4">
                                            <v-menu ref="data.item.show_date_end"
                                                v-model="data.item.show_date_end"
                                                :close-on-content-click="false"
                                                :nudge-right="10"
                                                transition="scale-transition"
                                                offset-y min-width="290px">
                                                <template v-slot:activator="{ on }">
                                                    <v-text-field v-model="data.item.valid_until"
                                                        label="Visible until" v-on="on">
                                                    </v-text-field>
                                                </template>
                                                <v-date-picker v-model="data.item.valid_until"
                                                        @input="data.item.show_date_end = false"
                                                        no-title></v-date-picker>
                                            </v-menu>
                                        </v-col>
                                    </v-row>
                                    <v-row v-if="hasFile" align="center">
                                        <v-col cols="12">
                                            <v-file-input
                                                v-model="data.item.file"
                                                accept=".doc,.docx,.pdf,.xls,.xlsx"
                                                show-size
                                                name
                                                label="File">
                                            </v-file-input>
                                        </v-col>
                                    </v-row>
                                    <v-row v-if="hasURL" align="center">
                                        <v-col cols="12">
                                            <v-text-field
                                                v-model="data.item.attachment_url"
                                                label="URL">
                                            </v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row align="center">
                                        <v-col cols="12">
                                            <v-text-field
                                                v-model="data.item.title"
                                                label="Title">
                                            </v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row align="center">
                                        <v-col cols="12">
                                            <v-textarea
                                                v-model="data.item.content"
                                                label="Contents">
                                            </v-textarea>
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
                        </v-card-text>
                    </v-card>
                </v-dialog>
            </template>
            <template v-slot:item.action="{ item }">
                <v-row class="pr-2">
                    <v-col cols="3">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-icon v-on="on"
                                    @click="editItem(item)">mdi-pencil</v-icon>
                            </template>
                            <span>View & edit details</span>
                        </v-tooltip>
                    </v-col>
                    <v-col cols="3">
                        <v-icon color="red darken" @click="removeItem(item)">mdi-delete</v-icon>
                    </v-col>
                </v-row>
            </template>
        </v-data-table>
        <v-row  justify="end" class="mt-4 mb-1">
            <v-col cols="2" align-self="end">
                <v-row justify="end">
                    <v-btn
                        @click="deleteDocuments()"
                        outlined
                        color="red darken"
                    >
                        Confirm delete
                    </v-btn>
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
    </v-container>
</v-card>

</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

export default {
    props: {
        cityId: Number,
        unitId: Number,
        subTabId: Number,
    },
    data () {
        return {
            dialog: false,
            formError: false,
            progress: false,
            success: false,
            error: false,
            search: '',
            headers: [
                { text: 'Doc. Type', value:'doc_type_name' },
                { text: 'Title', value:'title' },
                { text: 'Contents', value:'content' },
                { text: 'Visible From', value:'valid_from' },
                { text: 'Visible Until', value:'valid_until' },
                { text: 'Actions', value: 'action', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                documents: [],
                item: { contentOption: 'Just text', },
            },
            allTabs: [],
            unitCityTabs: [],
            documentTypes: [],
            contentOptions: [
                'Just text',
                'Text + URL link',
                'Text + File',
            ],
            hasFile: false,
            hasURL: false,
            toDelete: [],
        }
    },
    mounted () {
        this.initialize();
        this.getDocumentTypes();
        this.$root.$on('updateUnitUserDocumentsList',
            () => {
                this.initialize();
            }
        );
    },
    watch: {
        cityId () {
            this.initialize();
        },
        unitId () {
            this.initialize();
        },
        subTabId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            this.data.documents = [];
            this.getDocumentTabs()
            .then(() => {
                for (let ind in this.allTabs) {
                    if (this.allTabs[ind].unit_id === this.unitId
                        && (this.allTabs[ind].city_id === this.cityId
                            || (this.allTabs[ind].city_id === null && this.cityId === undefined)
                        )
                    ) {
                        this.unitCityTabs.push(this.allTabs[ind]);
                    }

                }
            });
            if (this.cityId !== undefined) {
                let urlSubmit = 'api/unit-areas/' + this.unitId
                                + '/cities/' + this.cityId
                                + '/documents'
                                + '/tabs/' + this.subTabId
                                + '?status=all';
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    this.data.documents = result;
                });
            } else {
                let urlSubmit = 'api/unit-areas/' + this.unitId
                                + '/documents'
                                + '/tabs/' + this.subTabId
                                + '?status=all'
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    for (let ind in result) {
                        this.$set(this.data.documents, ind, {});
                        Object.keys(result[ind]).forEach(key => {
                            let value = result[ind][key];
                            if (key === 'valid_from' || key === 'valid_until') {
                                value = time.momentToDate(value);
                            }
                            this.$set(this.data.documents[ind], key, value);
                        });
                    }
                });
            }
        },
        submitForm() {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlUpdate;
                if (this.cityId !== undefined) {
                    urlUpdate = 'api/unit-areas/' + this.unitId
                            + '/cities/' + this.cityId
                            + '/documents/' + this.data.item.id;
                } else {
                    urlUpdate = 'api/unit-areas/' + this.unitId
                                + '/documents/' + this.data.item.id;
                }
                if (this.data.item.file !== undefined && this.data.item.file !== null) {
                    const formData = new FormData()
                    formData.append('title',this.data.item.title);
                    formData.append('content',this.data.item.content);
                    formData.append('doc_type_id',this.data.item.doc_type_id);
                    formData.append('sort_order',this.data.item.sort_order);
                    if (this.data.item.valid_from !== null
                            && this.data.item.valid_from !== undefined) {
                        formData.append('valid_from', this.data.item.valid_from);
                    }
                    if (this.data.item.valid_until !== null
                            && this.data.item.valid_until !== undefined) {
                        formData.append('valid_until', this.data.item.valid_until);
                    }
                    if (this.data.item.attachment_url !== null
                            && this.data.item.attachment_url !== undefined) {
                        formData.append('attachment_url', this.data.item.attachment_url);
                    }
                    if (this.data.item.file !== null && this.data.item.file !== undefined) {
                        formData.append('file_name', this.data.item.file.name);
                        formData.append('file', this.data.item.file);
                    }

                    this.$http.put(urlUpdate,
                        formData,
                        {
                            headers: {
                                'Authorization': 'Bearer ' + localStorage['v2-token'],
                                'Content-Type': 'multipart/form-data'
                            },
                        }
                    )
                    .then(() => {
                        this.progress = false;
                        this.success = true;
                        this.initialize();
                        this.$root.$emit('updateUnitUserDocumentsList')
                        setTimeout(() => {this.success = false;}, 1500);
                    })
                    .catch((error) => {
                        this.progress = false;
                        this.error = true;
                        this.initialize();
                        setTimeout(() => {this.error = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    });
                } else {
                    this.data.item.type_update = 'only text';
                    this.$http.put(urlUpdate,
                        { data: this.data.item, },
                        { headers:
                            {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        }
                    )
                    .then(() => {
                        this.progress = false;
                        this.success = true;
                        this.initialize();
                        this.$root.$emit('updateUnitUserDocumentsList')
                        setTimeout(() => {this.success = false;}, 1500);
                    })
                    .catch((error) => {
                        this.progress = false;
                        this.error = true;
                        this.initialize();
                        setTimeout(() => {this.error = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    });
                }
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
                Promise.all(
                    urlDelete.map(el =>
                        this.$http.delete(el,
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']},
                            }
                    ))
                )
                .then( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.toDelete = [];
                    this.$root.$emit('updateUnitUserDocumentsList')
                    this.initialize();
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    this.toDelete = [];
                    this.initialize();
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                });
            }
        },
        changedContentOption () {
            if (this.data.item.contentOption === 'Just text') {
                this.hasFile = false;
                this.hasURL = false;
                delete this.data.item.file;
                delete this.data.item.attachment_url;
            } else if (this.data.item.contentOption === 'Text + URL link') {
                this.hasFile = false;
                this.hasURL = true;
                delete this.data.item.file;
                this.$set(this.data.item, 'attachment_url', null);
            } else if (this.data.item.contentOption === 'Text + File') {
                this.hasFile = true;
                this.hasURL = false;
                delete this.data.item.attachment_url;
                delete this.data.item.file;
            }
        },
        getDocumentTabs () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'document-tabs';
            return subUtil.getPublicInfo(vm, urlSubmit, 'allTabs');
        },
        getDocumentTypes() {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'document-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'documentTypes');
            }
        },
        editItem(item) {
            this.dialog = true;
            this.item = {};
            this.hasURL = false;
            this.$set(this.data.item, 'contentOption', 'Just text');
            Object.keys(item).forEach(key => {
                let value = item[key];
                if (key === 'attachment_url' && (value !== null && value !== undefined)) {
                    this.$set(this.data.item, 'contentOption', 'Text + URL link');
                    this.hasURL = true;
                }
                this.$set(this.data.item, key, value);
            });
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