<template>
<div>
    <div v-if="!data.isManager">
        You have no permissions to manage polls.
    </div>
    <v-card v-else>
        <v-card-title primary-title>
            <div>
                <h3 class="headline">All polls:</h3>
            </div>
        </v-card-title>
        <v-card-text>Please choose the poll you want to edit:</v-card-text>
        <v-container class="px-6">
            <v-row align="center">
                <v-col cols="12">
                    <ul>
                        <li v-for="(poll, i) in polls"
                            :key="i"
                        >
                            <router-link :to="baseURL + 'managers/' + poll.id">
                                <b>{{poll.title}}</b> - Open from
                                {{poll.date_from_show}}, {{poll.time_from_show}}
                                to
                                {{poll.date_until_show}}, {{poll.time_until_show}}
                            </router-link>
                        </li>
                    </ul>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="8">
                        <v-btn
                            class="ma-4 white--text"
                            color="blue"
                            @click="createPoll()"
                        >
                            Add new Poll
                        </v-btn>
                    </v-col>
                    <v-col cols="4">
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
</div>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

export default {
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            data: {
                isManager: false,
            },
            polls: [],
            baseURL: '/polls/',
        }
    },
    mounted: function () {
        this.$store.commit('setActiveTile', {
            newTile: 11,
            newToolbarText: 'Manage polls'
        });
    },
    created () {
        this.initialize();
    },
    methods: {
        initialize() {
            if (this.$store.state.session.loggedIn) {
                this.getPolls();
            }
        },
        getPolls () {
            let personID = this.$store.state.session.personID;
            let urlSubmit = 'api/polls/' + 'managers/'+ personID;
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then( (result) => {
                this.polls = result;
                this.data.isManager = true;
                for (let ind in this.polls) {
                    if (this.polls[ind].valid_from !== null) {
                        let datetime = time.moment(this.polls[ind].valid_from).tz('Europe/Lisbon');
                        this.$set(this.polls[ind], 'date_from_show',
                            datetime.format('YYYY-MM-DD'));
                        this.$set(this.polls[ind], 'time_from_show',
                            datetime.format('HH:mm:ss'));
                    } else {
                        this.$set(this.polls[ind], 'date_from_show', '-∞');
                        this.$set(this.polls[ind], 'time_from_show','');
                    }
                    if (this.polls[ind].valid_until !== null) {
                        let datetime = time.moment(this.polls[ind].valid_until).tz('Europe/Lisbon');
                        this.$set(this.polls[ind], 'date_until_show',
                            datetime.format('YYYY-MM-DD'));
                        this.$set(this.polls[ind], 'time_until_show',
                            datetime.format('HH:mm:ss'));
                    } else {
                        this.$set(this.polls[ind], 'date_until_show', '+∞');
                        this.$set(this.polls[ind], 'time_until_show','');
                    }
                }
            })
        },
        createPoll () {
            // in the end we have to navigate back to /polls/managers page
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let managerID = this.$store.state.session.personID;
                let urlCreatePoll = [];
                urlCreatePoll.push({
                    url: 'api/polls'
                        + '/managers/'+ managerID,
                });
                Promise.all(
                    urlCreatePoll.map(el =>
                        this.$http.post(el.url,
                            { data: {} },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                )
                .then( (result) => {
                    if (result !== null && result !== undefined && result.length > 0) {
                        let newPollID = result[0].data.result.pollID
                        this.progress = false;
                        this.success = true;
                        setTimeout(() => {this.success = false;}, 1500)
                        this.$router.push('/polls/managers/' + newPollID)
                    }
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
        },
    },

}
</script>

<style>

</style>