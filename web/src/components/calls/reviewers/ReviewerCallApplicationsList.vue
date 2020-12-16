<template>
<div>
    <v-app-bar prominent app>
        <v-row  align="center">
            <v-col cols="1">
                <img src="/images/logo/ucibio-logo.png" width="40">
            </v-col>
            <v-col cols="10" class="ml-auto call-title">
                Calls: {{reviewerName}} Reviewer Area<br>
                {{callName}}
            </v-col>
        </v-row>
    </v-app-bar>
    <div v-if="loggedIn" class="px-4">
        <v-card pa-2>
            <v-card-title>
                <span class="headline">List of applications in this call:</span>
            </v-card-title>
            <v-container>
                <v-row align="center">
                    <v-col cols="12">
                        <ol class="applications-list">
                            <li v-for="(application, i) in applications"
                                :key="i"
                            >
                                <router-link :to="application.url">
                                    <b>{{application.applicant_name}}</b>
                                </router-link>.
                                Submitted: {{application.date_submitted}}, {{application.time_submitted}}
                                <v-icon
                                    v-if="application.reviewed" color="green"
                                    class="ml-2"
                                >
                                    mdi-check
                                </v-icon>
                                <v-icon v-else color="red"
                                    class="ml-2"
                                >
                                    mdi-alert
                                </v-icon>
                            </li>
                        </ol>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </div>
</div>
</template>

<script>
import time from '@/components/common/date-utils'

export default {
    data () {
        return {
            callName: '',
            applications: [],
            data: {
            }
        }
    },
    computed: {
        loggedIn () {
            return this.$store.state.sessionreviewer.loggedIn;
        },
        reviewerName () {
            return this.$store.state.sessionreviewer.reviewerName;
        },
    },
    mounted() {
        this.$store.commit('checkExistingSessionReviewer');
        this.getReviewerCallApplications();
    },
    watch: {
        $route () {
            this.getReviewerCallApplications();
        },
        reviewerName () {
            this.getReviewerCallApplications();
        },
    },
    methods: {
        getReviewerCallApplications () {
            this.$http.get('api/calls/' + this.$route.params.callSegment
                + '/applications'
                + '/reviewers/' + this.$store.state.sessionreviewer.reviewerID,
                {
                    headers: {'Authorization': 'Bearer ' + localStorage['v2-reviewer-token']},
                }
            )
            .then((result) => {
                this.callName = result.data.result.call.call_name
                let unfilteredList = result.data.result.applications;
                let filteredList = [];
                for (let ind in unfilteredList) {
                    if (unfilteredList[ind].ignore_score === 0) {
                        this.$set(unfilteredList[ind], 'url',
                            '/reviewers/calls/'
                            + this.$route.params.callSegment
                            + '/applications/'
                            + unfilteredList[ind].id
                        )
                        let datetime = time.moment(unfilteredList[ind].submitted).tz('Europe/Lisbon');
                        this.$set(unfilteredList[ind], 'date_submitted',
                            datetime.format('YYYY-MM-DD'));
                        this.$set(unfilteredList[ind], 'time_submitted',
                            datetime.format('HH:mm:ss'));
                        filteredList.push(unfilteredList[ind]);
                    }
                }
                this.applications = filteredList;
            })
            .catch( (error) => {
                console.log(error);
            })
        },
    },
}
</script>

<style scoped>

.call-title {
    font-size: 20px;
}

.applications-list li {
    margin-top: 10px;
}

</style>