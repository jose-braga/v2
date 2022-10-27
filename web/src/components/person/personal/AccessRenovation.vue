<template>
<v-container>
    <v-row>
        {{warning}}
    </v-row>
    <v-row>
        <v-dialog
            v-model="dialog"
            width="500"
        >
            <template v-slot:activator="{ on }">
                <v-btn
                    outlined
                    color="red"
                    v-on="on"
                    class="ml-4 mt-4"
                    :disabled="disabled"
                    >
                    Ask for renewal
                </v-btn>
            </template>
            <v-card>
                <v-card-title
                    class="headline grey lighten-2"
                    primary-title
                >
                    (Optional) Text to add to automatic email
                </v-card-title>
                <v-form ref="emailForm"
                        @submit.prevent="submitEmailForm">
                    <v-textarea
                        v-model="message"
                        auto-grow
                        label="Text"
                        rows="2"
                        class="pa-2 pt-4"
                    ></v-textarea>
                    <v-card-actions>
                        <v-btn text type="submit">Send request</v-btn>
                        <div class="request-status-container">
                            <v-progress-circular indeterminate
                                    v-show="progressEmail"
                                    :size="20" :width="2"
                                    color="primary"></v-progress-circular>
                            <v-icon v-show="successEmail" color="green">mdi-check</v-icon>
                            <v-icon v-show="errorEmail" color="red">mdi-alert-circle-outline</v-icon>
                        </div>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
    </v-row>
</v-container>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

export default {
    data() {
        return {
            progressEmail: false,
            successEmail: false,
            errorEmail: false,
            emailFormError: false,
            dialog: false,
            disabled: true,
            message: '',
            warning: '',
        }
    },
    created () {
        this.initialize();
    },
    watch: {
        $route () {
            this.initialize();
        }
    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                this.warning = '';
                this.disabled = true;
                let personID = this.$store.state.session.personID;
                let today = time.momentToDate(time.moment());
                subUtil.getInfoPopulate(this, 'api/people/' + personID + '/academic-affiliations', true)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    let foundDepartment = false;
                    for (let ind in result) {
                        let valid_from = time.momentToDate(result[ind].valid_from);
                        let valid_until = time.momentToDate(result[ind].valid_until);
                        let department = result[ind].department_id
                        if ((valid_from === null || valid_from <= today)
                            && (valid_until === null || today <= valid_until)
                            && (department === 1 || department === 2 || department === 3)
                        ) {
                            this.disabled = false;
                            foundDepartment = true;
                        }
                    }
                    if (!foundDepartment) {
                        this.warning = 'No current NOVA department defined.'
                    }
                })
            }
        },
        submitEmailForm () {
            if (this.$store.state.session.loggedIn) {
                this.progressEmail = true;
                const personID = this.$store.state.session.personID;
                this.$http.post('api/people/' + personID + '/access-request',
                    {
                        data: {
                            message: this.message,
                            personName: this.$store.state.session.personName,
                        }
                    },
                    {
                        headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                    }
                )
                .then(() => {
                    this.progressEmail = false;
                    this.successEmail = true;
                    setTimeout(() => {
                        this.successEmail = false;
                        this.dialog = false;
                    }, 1500);
                })
                .catch((error) => {
                    this.progressEmail = false;
                    this.errorEmail = true;
                    setTimeout(() => {this.error = false;}, 6000)
                    console.log(error);
                });
            }
        },
    },

}
</script>

<style>

</style>