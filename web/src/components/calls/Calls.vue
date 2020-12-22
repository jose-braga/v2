<template>
<div>
    <v-app-bar prominent app>
        <v-row align="center">
            <v-col cols="2">
                <img v-if="isLaqv" src="/images/logo/laqv-logo.png" width="80">
                <img v-else src="/images/logo/ucibio-logo.png" width="40">
            </v-col>
            <v-col cols="9" class="ml-6">
                <div v-if="isLaqv"> LAQV Applications Portal</div>
                <div v-else> UCIBIO Applications Portal</div>
            </v-col>
        </v-row>
    </v-app-bar>
    <v-card>
        <v-card-title primary-title>
            <div>
                <h3 class="headline">Open calls:</h3>
            </div>
        </v-card-title>
        <v-card-text>Please choose the application call you want to view:</v-card-text>
        <v-container class="px-6">
            <v-row align="center">
                <v-col cols="12">
                    <ul>
                        <li v-for="(call, i) in openCalls"
                            :key="i"
                        >
                            <router-link :to="baseURL + call.call_url_segment">
                                <b>{{call.call_name}}</b> - Open from
                                {{call.date_from_show}}, {{call.time_from_show}}
                                to
                                {{call.date_until_show}}, {{call.time_until_show}}
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
        isLaqv: Boolean,
    },
    data() {
        return {
            data: {
                call: undefined,
            },
            openCalls: [],
            baseURL: '/calls/',
        }
    },
    created () {
        this.initialize();
        this.getOpenCalls();
    },
    methods: {
        initialize() {
            if (!this.isLaqv) {
                this.baseURL = '/calls/';
            } else {
                this.baseURL = '/laqv/calls/';
            }
        },
        getOpenCalls () {
            let vm = this;
            let urlSubmit
            if (!this.isLaqv) {
                urlSubmit = 'api/v2/' + 'open-calls';
            } else {
                urlSubmit = 'api/v2/' + 'laqv/open-calls';
            }
            subUtil.getPublicInfo(vm, urlSubmit, 'openCalls')
            .then(() => {
                for (let ind in this.openCalls) {
                    if (this.openCalls[ind].valid_from !== null) {
                        let datetime = time.moment(this.openCalls[ind].valid_from).tz('Europe/Lisbon');
                        this.$set(this.openCalls[ind], 'date_from_show',
                            datetime.format('YYYY-MM-DD'));
                        this.$set(this.openCalls[ind], 'time_from_show',
                            datetime.format('HH:mm:ss'));
                    } else {
                        this.$set(this.openCalls[ind], 'date_from_show', '-∞');
                        this.$set(this.openCalls[ind], 'time_from_show','');
                    }
                    if (this.openCalls[ind].valid_until !== null) {
                        let datetime = time.moment(this.openCalls[ind].valid_until).tz('Europe/Lisbon')
                        this.$set(this.openCalls[ind], 'date_until_show',
                            datetime.format('YYYY-MM-DD'));
                        this.$set(this.openCalls[ind], 'time_until_show',
                            datetime.format('HH:mm:ss'));
                    } else {
                        this.$set(this.openCalls[ind], 'date_until_show', '+∞');
                        this.$set(this.openCalls[ind], 'time_until_show','');
                    }
                }
            });

        },
    }
}
</script>

<style>

</style>