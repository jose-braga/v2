<template>
<div>
    <v-app-bar prominent app>
        <v-row align="center">
            <v-col cols="2">
                <img src="/images/logo/ucibio-logo.png" width="40">
            </v-col>
            <!--
            <v-col>
                <img src="/images/logo/laqv-logo.png" width="64">
            </v-col>
            -->
            <v-col cols="10" class="ml-6">UCIBIO Applications Portal</v-col>
        </v-row>
        <!--
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon v-on="on" @click.stop="showHelp">
                    <v-icon>mdi-help</v-icon>
                </v-btn>
            </template>
            <span>Help for this page</span>
        </v-tooltip>
        -->
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
                            <a :href="baseURL + call.call_url_segment">
                                <b>{{call.call_name}}</b> - Open from
                                {{call.date_from_show}}, {{call.time_from_show}}
                                to
                                {{call.date_until_show}}, {{call.time_until_show}}
                            </a>
                        </li>
                    </ul>
                </v-col>
            </v-row>
        </v-container>
        <!-- <router-view></router-view> -->
    </v-card>
</div>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

export default {
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
        },
        getOpenCalls () {
            let vm = this;

            const urlSubmit = 'api/v2/' + 'open-calls';
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