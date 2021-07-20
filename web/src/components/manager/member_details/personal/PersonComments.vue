<template>
<v-card class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Person Comments</h3>
        </div>
    </v-card-title>
    <v-container>
        <v-form ref="form"
            @submit.prevent="submitForm">
            <v-row align="center">
                <v-col cols="12">
                    <v-textarea
                        v-model="data.comments.comments"
                        rows="3"
                        counter
                        label="Comments">
                    </v-textarea>
                </v-col>
            </v-row>
            <v-row align-content="center" justify="end">
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

export default {
    props: {
        personId: Number,
        managerId: Number,
        endpoint: String,
    },
    data () {
        return {
            data: {
                comments: {},
            },
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
                let personID = this.personId;
                let urlSubmit = 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/comments';
                subUtil.getInfoPopulate(this, urlSubmit, false)
                .then( (result) => {
                    this.data.comments = result;
                });
            }
        },
        submitForm () {
            this.progress = true;
            let personID = this.personId;
            this.$http.put('api' + this.endpoint
                    + '/members'
                    + '/' + personID + '/comments',
                {
                    data: this.data.comments.comments,
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
        },
    },

}
</script>

<style>

</style>