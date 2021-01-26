<template>
<div>
    <div  v-if="data.isManager">
        <router-link :to="baseURL + 'managers'">
            <v-btn
                class="ma-4"
                outlined
                color="red"
            >
                Manage Polls
            </v-btn>
        </router-link>
    </div>
    <v-card>
        <v-card-title primary-title>
            <div>
                <h3 class="headline">Open polls:</h3>
            </div>
        </v-card-title>
        <v-card-text>Please choose the poll in which you want to vote:</v-card-text>
        <v-container class="px-6">
            <v-row align="center">
                <v-col cols="12">
                    <ul>
                        <li v-for="(poll, i) in data.currentPolls"
                            :key="i"
                        >
                            <router-link :to="baseURL + poll.id">
                                <b>{{poll.title}}</b> - Open from
                                {{poll.date_from_show}}, {{poll.time_from_show}}
                                to
                                {{poll.date_until_show}}, {{poll.time_until_show}}
                            </router-link>
                        </li>
                    </ul>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
    <v-card class="mt-4">
        <v-card-title primary-title>
            <div>
                <h3 class="headline">Upcoming polls:</h3>
            </div>
        </v-card-title>
        <v-container class="px-6">
            <v-row align="center">
                <v-col cols="12">
                    <ul>
                        <li v-for="(poll, i) in data.futurePolls"
                            :key="i"
                        >

                                <b>{{poll.title}}</b> - Open from
                                {{poll.date_from_show}}, {{poll.time_from_show}}
                                to
                                {{poll.date_until_show}}, {{poll.time_until_show}}

                        </li>
                    </ul>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
    <v-card class="mt-4">
        <v-card-title primary-title>
            <div>
                <h3 class="headline">Past polls:</h3>
            </div>
        </v-card-title>
        <v-card-text>Select to see poll details (provided you have permissions):</v-card-text>
        <v-container class="px-6">
            <v-row align="center">
                <v-col cols="12">
                    <ul>
                        <li v-for="(poll, i) in data.pastPolls"
                            :key="i"
                        >
                            <router-link :to="baseURL + poll.id">
                                <b>{{poll.title}}</b> - Open from
                                {{poll.date_from_show}}, {{poll.time_from_show}}
                                to
                                {{poll.date_until_show}}, {{poll.time_until_show}}
                            </router-link>
                        </li>
                    </ul>
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
    props: {
    },
    data() {
        return {
            data: {
                pastPolls: [],
                currentPolls: [],
                futurePolls: [],
                isManager: false,
            },
            polls: [],
            baseURL: '/polls/',
        }
    },
    mounted: function () {
        this.$store.commit('setActiveTile', {
            newTile: 9,
            newToolbarText: 'Choose a poll'
        });
    },
    created () {
        this.initialize();
    },

    methods: {
        initialize() {
            if (this.$store.state.session.loggedIn) {
                this.getPolls();
                this.checkManager();
            }
        },
        checkManager () {
            let personID = this.$store.state.session.personID;
            let urlSubmit = 'api/polls/' + 'managers/'+ personID;
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then( (result) => {
                if (result !== undefined && result !== null) {
                    this.data.isManager = true;
                }
            })
            .catch((error) => {
                console.log(error)
            })
        },
        getPolls () {
            let personID = this.$store.state.session.personID;
            let urlSubmit = 'api/polls/' + 'people/'+ personID;
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then( (result) => {
                this.polls = result;
                let now = new Date();
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
                    let start = new Date(this.polls[ind].valid_from);
                    let end = new Date(this.polls[ind].valid_until);
                    if (start <= now && now <= end) {
                        this.data.currentPolls.push(this.polls[ind]);
                    } else if (now < start) {
                        this.data.futurePolls.push(this.polls[ind]);
                    } else if (end < now) {
                        this.data.pastPolls.push(this.polls[ind]);
                    }
                }
            })
        },
    }
}
</script>

<style>

</style>