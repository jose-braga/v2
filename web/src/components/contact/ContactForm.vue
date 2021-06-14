<template>
    <v-dialog v-model="dialog"
            @input="v => v || closeDialog()"
            class="pa-2"
            max-width="470px">
        <v-form ref="form"
                @submit.prevent="submitForm"
        >
            <v-card class="pa-2">
                <v-card-title>
                    <span class="headline">Report a bug or leave a suggestion</span>
                </v-card-title>
                <v-row class="px-2">
                    <v-col cols="12">
                        <v-select v-model="data.contact_type_id"
                            :items="contactTypes"
                            item-value="id" item-text="name_en"
                            @change="changeContactType"
                            label="Contact type">
                        </v-select>
                    </v-col>
                    <v-col cols="12" v-if="data.contact_type_id !== null">
                        <v-text-field
                            v-model.trim="$v.data.subject.$model"
                            :error="$v.data.subject.$error"
                            rows="4"
                            label="Subject">
                        </v-text-field>
                        <div v-if="$v.data.subject.$error">
                            <p v-if="!$v.data.subject.maxLength" class="caption red--text">
                                Text exceeds maximum size (200 chars).
                            </p>
                        </div>
                    </v-col>
                    <v-col cols="12" v-if="data.contact_type_id !== null">
                        <v-textarea
                            v-model.trim="$v.data.email_text.$model"
                            :error="$v.data.email_text.$error"
                            rows="4"
                            :label="emailLabel">
                        </v-textarea>
                        <div v-if="$v.data.email_text.$error">
                            <p v-if="!$v.data.email_text.maxLength" class="caption red--text">
                                Text exceeds maximum size (2000 chars).
                            </p>
                        </div>
                    </v-col>
                </v-row>
                <v-row class="pa-2" v-if="data.contact_type_id !== null">
                    <v-col cols="4">
                        <v-btn type="submit"
                            color="red darken-1"
                            outlined
                        >Send
                        </v-btn>
                    </v-col>
                    <v-col cols="2">
                        <v-progress-circular indeterminate
                                v-show="progress"
                                :size="20" :width="2"
                                color="primary"></v-progress-circular>
                        <v-icon v-show="success" color="green">mdi-check</v-icon>
                        <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                    </v-col>
                </v-row>
            </v-card>
        </v-form>
    </v-dialog>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import { maxLength } from 'vuelidate/lib/validators'

export default {
    components: {
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            emailLabel: '',
            data: {
                subject: null,
                email_text: null,
                contact_type_id: null,
            },
            contactTypes: [],
        }
    },
    computed: {
        dialog: {
            get: function () {
                return this.$store.state.session.showContact;
            },
            set: function (val) {
                this.$store.commit('makeContact', {val: val});
            }
        },
    },
    created() {
        this.getContactTypes();
    },
    methods: {
        submitForm () {
            if (!this.$v.$invalid) {
                this.progress = true;
                let personID = this.$store.state.session.personID;
                const urlSubmit = 'api/people/' + personID + '/user-contacts';
                this.data.personName = this.$store.state.session.personName;
                this.$http.post(
                    urlSubmit,
                    {data: this.data},
                    { headers:
                        {'Authorization': 'Bearer ' + localStorage['v2-token']}
                    }
                )
                .then( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {
                        this.success = false;
                        this.data = {
                            subject: null,
                            email_text: null,
                            contact_type_id: null,
                        }
                    }, 1500)
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
        changeContactType () {
            if (this.data.contact_type_id === 1) {
                this.emailLabel = 'Report the bug';
            }
            if (this.data.contact_type_id === 2) {
                this.emailLabel = 'Leave your suggestion';
            }

        },
        closeDialog () {
            this.emailLabel = null;
            this.data.contact_type_id = null;
        },
        getContactTypes () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'contact-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'contactTypes');
            }
        },
    },
    validations: {
        data: {
            subject: { maxLength: maxLength(200) },
            email_text: { maxLength: maxLength(2000) }
        }
    }
}
</script>

<style scoped>

</style>