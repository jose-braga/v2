<template>
    <v-card class="mb-4">
        <v-card-title primary-title>
            <div>
                <h3 class="headline">Data visibility authorization</h3>
            </div>
        </v-card-title>
        <v-container>
            <v-row align="center">
                <v-col cols="12">
                    <v-row justify="center" align="center">
                        <v-switch v-model="data.visible_public"
                            :label="authorizedText"
                            disabled
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
import subUtil from '@/components/common/submit-utils'

export default {
    props: {
        personId: Number,
        personName: String,
        managerId: Number,
        endpoint: String,
    },
    data () {
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
    watch: {
        personId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                let personID = this.personId;
                let urlSubmit = 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/external-api-authorization';
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
    }
}
</script>

<style scoped>
.small-text {
    font-size: 0.75rem;
}

</style>