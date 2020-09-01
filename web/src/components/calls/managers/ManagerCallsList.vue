<template>
<div>
    <v-app-bar prominent app>
        <v-row  align="center">
            <v-col cols="1">
                <img src="/images/logo/ucibio-logo.png" width="40">
            </v-col>
            <v-col cols="10" class="ml-auto">Calls: Manager Area</v-col>
        </v-row>
    </v-app-bar>
    <div v-if="loggedIn" class="px-4">
        <v-card pa-2>
            <v-card-title>
                <span class="headline">List of calls you manage:</span>
            </v-card-title>
            <v-container>
                <v-row align="center">
                    <v-col cols="12">
                        <ul>
                            <li v-for="(call, i) in calls"
                                :key="i"
                            >
                                <router-link :to="baseURL + call.call_url_segment">
                                    <b>{{call.call_name}}</b>
                                </router-link> - Open from
                                {{call.date_from_show}}, {{call.time_from_show}}
                                to
                                {{call.date_until_show}}, {{call.time_until_show}}
                            </li>
                        </ul>
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
            calls: [],
            baseURL: '/call-managers/calls/',
            data: {
            }
        }
    },
    computed: {
        loggedIn () {
            return this.$store.state.session.loggedIn;
        },
        personName () {
            return this.$store.state.session.personName;
        },
    },
    created () {
        this.$store.commit('checkExistingSession', { path: '/call-managers'});
        this.getManagerCalls();
    },
    methods: {
        getManagerCalls() {
            this.$http.get('api/calls/call-managers/' + this.$store.state.session.personID,
                {
                    headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                }
            )
            .then((result) => {
                this.calls = result.data.result;
                for (let ind in this.calls) {
                    if (this.calls[ind].valid_from !== null) {
                        let datetime = time.moment(this.calls[ind].valid_from).tz('Europe/Lisbon');
                        this.$set(this.calls[ind], 'date_from_show',
                            datetime.format('YYYY-MM-DD'));
                        this.$set(this.calls[ind], 'time_from_show',
                            datetime.format('HH:mm:ss'));
                    } else {
                        this.$set(this.calls[ind], 'date_from_show', '-∞');
                        this.$set(this.calls[ind], 'time_from_show','');
                    }
                    if (this.calls[ind].valid_until !== null) {
                        let datetime = time.moment(this.calls[ind].valid_until).tz('Europe/Lisbon')
                        this.$set(this.calls[ind], 'date_until_show',
                            datetime.format('YYYY-MM-DD'));
                        this.$set(this.calls[ind], 'time_until_show',
                            datetime.format('HH:mm:ss'));
                    } else {
                        this.$set(this.calls[ind], 'date_until_show', '+∞');
                        this.$set(this.calls[ind], 'time_until_show','');
                    }
                    if (this.calls[ind].reviewer_deadline !== null) {
                        let datetime = time.moment(this.calls[ind].reviewer_deadline).tz('Europe/Lisbon')
                        this.$set(this.calls[ind], 'date_reviewer_deadline_show',
                            datetime.format('YYYY-MM-DD'));
                        this.$set(this.calls[ind], 'time_reviewer_deadline_show',
                            datetime.format('HH:mm:ss'));
                    } else {
                        this.$set(this.calls[ind], 'date_reviewer_deadline_show', '+∞');
                        this.$set(this.calls[ind], 'time_reviewer_deadline_show','');
                    }
                }
            })
            .catch( (error) => {
                console.log(error);
            })
        },

    }

}
</script>

<style scoped>

</style>
