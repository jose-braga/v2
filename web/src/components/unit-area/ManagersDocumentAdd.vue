<template>
<v-card class="px-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Add a document</h3>
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
                    <v-select v-model="data.document.doc_type_id"
                        :items="documentTypes" item-value="id" item-text="name"
                        label="Document type">
                    </v-select>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-select v-model="data.contentOption"
                        :items="contentOptions"
                        @change="changedContentOption()"
                        label="Contents type">
                    </v-select>
                </v-col>
                <v-col cols="2">
                    <v-text-field
                        v-model="data.document.sort_order"
                        label="Order #">
                    </v-text-field>
                </v-col>
            </v-row>
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
            <v-row v-if="hasFile" align="center">
                <v-col cols="12">
                    <v-file-input
                        v-model="data.document.file"
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
                        v-model="data.document.attachment_url"
                        label="URL">
                    </v-text-field>
                </v-col>
            </v-row>
            <v-row align="center">
                <v-col cols="12">
                    <v-text-field
                        v-model="data.document.title"
                        label="Title">
                    </v-text-field>
                </v-col>
            </v-row>
            <v-row align="center">
                <v-col cols="12">
                    <v-textarea
                        v-model="data.document.content"
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
        </v-form>
    </v-container>
</v-card>

</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    props: {
        cityId: Number,
        unitId: Number,
        subTabId: Number,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            documentTypes: [],
            contentOptions: [
                'Just text',
                'Text + URL link',
                'Text + File',
            ],
            hasFile: false,
            hasURL: false,
            data: {
                document: {},
                contentOption: 'Just text',
            },
        }
    },
    created () {
        this.getDocumentTypes();
    },
    methods: {
        submitForm() {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreate;
                if (this.cityId !== undefined) {
                    urlCreate = 'api/unit-areas/' + this.unitId
                            + '/cities/' + this.cityId
                            + '/documents';
                } else {
                    urlCreate = 'api/unit-areas/' + this.unitId
                                + '/documents';
                }
                const formData = new FormData()
                formData.append('title',this.data.document.title);
                formData.append('content',this.data.document.content);
                formData.append('tab_id', this.subTabId);
                formData.append('doc_type_id',this.data.document.doc_type_id);
                formData.append('sort_order',this.data.document.sort_order);
                if (this.data.document.valid_from !== null
                        && this.data.document.valid_from !== undefined) {
                    formData.append('valid_from', this.data.document.valid_from);
                }
                if (this.data.document.valid_until !== null
                        && this.data.document.valid_until !== undefined) {
                    formData.append('valid_until', this.data.document.valid_until);
                }
                if (this.data.document.attachment_url !== null
                        && this.data.document.attachment_url !== undefined) {
                    formData.append('attachment_url', this.data.document.attachment_url);
                }
                if (this.data.document.file !== null && this.data.document.file !== undefined) {
                    formData.append('file_name', this.data.document.file.name);
                    formData.append('file', this.data.document.file);
                }

                this.$http.post(urlCreate,
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
                    setTimeout(() => {this.success = false;}, 1500);
                    this.$root.$emit('updateUnitUserDocumentsList');
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
        changedContentOption () {
            if (this.data.contentOption === 'Just text') {
                this.hasFile = false;
                this.hasURL = false;
                delete this.data.document.file;
                delete this.data.document.attachment_url;
            } else if (this.data.contentOption === 'Text + URL link') {
                this.hasFile = false;
                this.hasURL = true;
                delete this.data.document.file;
                this.$set(this.data.document, 'attachment_url', null);
            } else if (this.data.contentOption === 'Text + File') {
                this.hasFile = true;
                this.hasURL = false;
                delete this.data.document.attachment_url;
                delete this.data.document.file;
            }
        },
        getDocumentTypes() {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'document-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'documentTypes');
            }
        },
    },
}
</script>

<style>

</style>