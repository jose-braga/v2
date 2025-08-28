<template>
<v-card class="px-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Add Documents</h3>
        </div>
    </v-card-title>
    <v-card-text>
    </v-card-text>
    <v-container class="px-4">
        <v-form ref="form"
            @submit.prevent="submitForm"
        >
            <v-row align="center">
                <v-col cols="12" sm="4">
                    <v-select v-model="data.document.section_id"
                        :items="sections" item-value="id" item-text="section_name"
                        @change="getGroups(data.document.section_id)"
                        label="Section">
                    </v-select>
                </v-col>
                <v-col cols="12" sm="4"
                    v-if="data.document.section_id === 'new'">
                    <v-text-field
                        v-model="data.document.new_section_name"
                        label="New Section name">
                    </v-text-field>
                </v-col>
                <v-col cols="2" v-if="data.document.section_id === 'new'">
                    <v-text-field
                        v-model="data.document.section_sort_order"
                        label="Section Order #">
                    </v-text-field>
                </v-col>
            </v-row>
            <v-row align="center" v-if="data.document.section_id !== undefined && data.document.section_id !== null">
                <v-col cols="12" sm="4">
                    <v-select v-model="data.document.group_id"
                        :items="groups" item-value="id" item-text="title"
                        label="Group">
                    </v-select>
                </v-col>
                <v-col cols="2">
                    <v-text-field v-if="data.document.group_id === 'new'"
                        v-model="data.document.group_sort_order"
                        label="Group Order #">
                    </v-text-field>
                </v-col>
            </v-row>
            <!--
            <v-row align="center">
                <v-col cols="12" sm="4">
                    <v-menu ref="data.document.show_date_start"
                        v-model="data.document.show_date_start"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="data.document.valid_from"
                                label="Visible from" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="data.document.valid_from"
                                @input="data.document.show_date_start = false"
                                no-title></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-menu ref="data.document.show_date_end"
                        v-model="data.document.show_date_end"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="data.document.valid_until"
                                label="Visible until" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="data.document.valid_until"
                                @input="data.document.show_date_end = false"
                                no-title></v-date-picker>
                    </v-menu>
                </v-col>
            </v-row>
             -->
            <v-row align="center" v-if="data.document.group_id === 'new'">
                <v-col cols="12">
                    <v-text-field
                        v-model="data.document.title"
                        label="Title">
                    </v-text-field>
                </v-col>
            </v-row>
            <v-row align="center" v-if="data.document.group_id === 'new'">
                <v-col cols="12">
                    <!--
                    <v-textarea
                        v-model="data.document.content"
                        label="Contents">
                    </v-textarea>
                    -->
                    <tiptap-vuetify
                        v-model="data.document.content"
                        placeholder="Contents for text above documents"
                        :extensions="extensions"
                    />
                </v-col>
            </v-row>
            <v-row align="center"  class="mb-2">
                <v-col cols="6">
                    <!--accept=".doc,.docx,.pdf,.xls,.xlsx"-->
                    <v-file-input
                        multiple
                        v-model="data.document.files"
                        show-size
                        name
                        label="Files"
                        @change="processFileList()"
                    >
                    </v-file-input>
                </v-col>
                <v-col cols="3" v-if="formError">
                    <v-row justify="end">
                        <p class="caption red--text">Unable to submit form.</p>
                    </v-row>
                </v-col>
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Add</v-btn>
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
            <v-row>
                <v-col cols="10">
                    <ol>
                        <li v-for="(item,i) in data.document.files"
                        :key="i">
                        <v-row align="center">
                            <v-col cols="4">{{ item.name }}</v-col>
                            <v-col cols="4"><v-text-field v-model="item.display_name" label="Display name"></v-text-field></v-col>
                            <v-col cols="4"><v-text-field v-model="item.sort_order" label="Sort Order"></v-text-field></v-col>

                        </v-row>

                        </li>
                    </ol>
                </v-col>
            </v-row>
        </v-form>
    </v-container>
</v-card>

</template>

<script>
import subUtil from '@/components/common/submit-utils'
import { TiptapVuetify, Bold, Italic, Underline,
    BulletList, OrderedList, ListItem, Link, History } from 'tiptap-vuetify'


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
    components: { TiptapVuetify },
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
            sections: [],
            groups: [],
            hasFile: false,
            hasURL: false,
            extensions: [
                History,
                Link,
                Bold,
                Underline,
                Italic,
                ListItem,
                BulletList,
                OrderedList,
            ],
            data: {
                document: {},
            },
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
                let urlCreate = 'api/private-areas/' + personID
                                + '/tabs/' + this.tabId
                                + '/sections/' + this.data.document.section_id
                                + '/groups/' + this.data.document.group_id
                                + '/documents-info';
                let filenames = [];
                for (let ind in this.data.document.files) {
                    filenames.push({
                        name: this.data.document.files[ind].name,
                        display_name: this.data.document.files[ind].display_name,
                        sort_order: this.data.document.files[ind].sort_order
                    })
                }
                let {section_id, group_id, new_section_name, section_sort_order,
                    group_sort_order, title, content} = this.data.document;
                let selectedData = {section_id, group_id, new_section_name, section_sort_order,
                    group_sort_order, title, content, filenames}
                this.$http.post(urlCreate,
                    { data: selectedData, },
                    { headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},}
                )
                .then((result) => {
                    let urlUpload = 'api/private-areas/' + personID
                                + '/tabs/' + this.tabId
                                + '/sections/' + result.data.data.section_id
                                + '/groups/' + result.data.data.group_id
                                + '/documents';
                    const formData = new FormData()
                    for (let ind in this.data.document.files) {
                            //formData.append('file_name', this.data.document.files[ind].name);
                            formData.append('files', this.data.document.files[ind],this.data.document.files[ind].name);
                    }
                    return this.$http.post(urlUpload,
                        formData,
                        {
                            headers: {
                                'Authorization': 'Bearer ' + localStorage['v2-token'],
                                'Content-Type': 'multipart/form-data'
                            },
                        }
                    )
                })
                .then(() => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {
                        this.success = false;
                        this.$refs.form.reset();}, 1500);
                    this.$root.$emit('updatePrivateDocumentsList');
                    this.initialize();
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                });
            }
        },
        initialize() {
            let this_session = this.$store.state.session;
            let personID = this_session.personID;
            let url = 'api/private-areas/' + personID
                            + '/tabs/' + this.tabId
                            + '/sections'
            subUtil.getInfoPopulate(this, url, true)
                .then( (result) => {
                    this.sections = result.sort(customSorter)
                    this.sections.push({id: 'new', section_name: 'New Section'})
                })
        },
        getGroups (section_id) {
            if (section_id !== 'new') {
                let this_session = this.$store.state.session;
                let personID = this_session.personID;
                let url = 'api/private-areas/' + personID
                                + '/tabs/' + this.tabId
                                + '/sections/' + section_id
                                + '/groups';
                subUtil.getInfoPopulate(this, url, true)
                    .then( (result) => {
                        this.groups = result.sort(customSorter)
                        this.groups.push({id: 'new', title: 'New Group'})
                    });
            } else {
                this.groups = [{id: 'new', title: 'New Group'}];
                this.$set(this.data.document,'group_id','new');
            }


        },
        processFileList () {
            for (let ind in this.data.document.files) {
                this.$set(this.data.document.files[ind], 'display_name',
                    this.data.document.files[ind].name
                )
            }

        },
    },
}
</script>

<style>

</style>