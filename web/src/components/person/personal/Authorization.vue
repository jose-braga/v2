<template>
    <v-card class="mb-4">
        <v-card-title primary-title>
            <div>
                <h3 class="headline">Data visibility authorization</h3>
            </div>
        </v-card-title>
        <v-container>
            <v-row>
                <v-col cols="12" md="8">
                    <b>The following data is visible to external partners:</b>
                    <span  class="small-text"> Full name, Colloquial name, Photo URL, Academic degrees & academic jobs,
                                Lab and group affiliations within LAQV or UCIBIO, Institutional contacts: Email,
                                Phone and Internal Phone extension, Institutional personal webpage & CV, ORCID & Researcher ID and Publications
                    </span>
                </v-col>
                <v-col cols="12" md="4">
                    <v-row justify="center" align="center">
                        <v-switch v-model="data.visible_public"
                            :label="authorizedText"
                            @change="changeAuthorization()"
                            dense
                            hide-details
                        >
                        </v-switch>
                        <div class="request-status-container">
                            <v-progress-circular indeterminate
                                    v-show="progress"
                                    :size="20" :width="2"
                                    color="primary"></v-progress-circular>
                            <v-icon v-show="success" color="green">mdi-check</v-icon>
                            <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                        </div>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
</template>

<script>
import subUtil from '../../common/submit-utils'

export default {
    data() {
        return {
            data: {
                visible_public: false
            },
            authorizedText: 'Not authorized',
            progress: false,
            success: false,
            error: false,
        }
    },
    created () {
        this.initialize();
    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                let urlSubmit = 'api/people/' + personID + '/external-api-authorization';
                subUtil.getInfoPopulate(this, urlSubmit, false)
                .then( (result) => {
                    this.data = result;
                    if (this.data.visible_public) {
                        this.authorizedText = 'Authorized';
                    } else {
                        this.authorizedText = 'Not authorized';
                    }
                });
            }

        },
        changeAuthorization () {
            if (this.data.visible_public) {
                this.authorizedText = 'Authorized';
            } else {
                this.authorizedText = 'Not authorized';
            }
            this.progress = true;
            let personID = this.$store.state.session.personID;
            this.$http.put('api/people/' + personID + '/external-api-authorization',
                {
                    data: this.data,
                },
                {
                    headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                }
            )
            .then(() => {
                this.progress = false;
                this.success = true;
                setTimeout(() => {this.success = false;}, 1500)
                this.initialize();
            })
            .catch((error) => {
                this.progress = false;
                this.error = true;
                this.initialize();
                setTimeout(() => {this.error = false;}, 6000)
                // eslint-disable-next-line
                console.log(error)
            })
        }
    }
}
</script>

<style scoped>
.small-text {
    font-size: 0.75rem;
}

</style>