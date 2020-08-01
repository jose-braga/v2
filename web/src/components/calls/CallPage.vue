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
            <v-col cols="10"
                class="">{{data.call.call_name}}
            </v-col>
        </v-row>
    </v-app-bar>
    <v-container>
        <!--
        <v-row>
            <span>Open from:</span>{{data.call.date_from_show}}, {{data.call.time_from_show}} (Lisbon time)
        </v-row>
        <v-row>
            <span>Closes:</span> {{data.call.date_until_show}}, {{data.call.time_until_show}} (Lisbon time)
        </v-row>
        -->
        <v-row v-for="(text, i) in data.call.texts"
            :key="i"
            align="center"
            justify="center"
        >
            <v-col cols="11" sm="8" xl="6" v-if="text.paragraph_type_name !== 'sponsors'">
                <div :class="text.paragraph_type_name">{{text.text}}</div>
            </v-col>
        </v-row>
        <v-row align="center"
            justify="center"
        >
            <v-col cols="12" md="2">
                <v-btn
                    color="blue"
                    :href="data.urlApplicants"
                >
                    Applicants
                </v-btn>
            </v-col>
            <v-col cols="12" md="2">
                <v-btn
                    color="orange"
                    :href="data.urlReviewers"
                >
                    Reviewers
                </v-btn>
            </v-col>
        </v-row>
        <v-row justify="center">
            <div class="sponsors">
                {{ data.sponsors }}
            </div>
        </v-row>

    </v-container>

</div>
</template>

<script>
import time from '@/components/common/date-utils'

export default {
    data() {
        return {
            data: {
                call: {},
                urlApplicants: '',
                urlReviewers: '',
                sponsors: ''
            },
            baseURL: '/calls/',

        }
    },
    created () {
        let callSegment = this.$route.params.callSegment
        this.initialize(callSegment);
        this.getCallInfo(callSegment);
    },
    methods: {
        initialize(callSegment) {
            this.data.urlApplicants = this.baseURL + callSegment + '/applicants';
            this.data.urlReviewers = '/reviewers';
        },
        getCallInfo(callSegment) {
            let urlSubmit = 'api/v2/calls/' + callSegment;
            let sponsors = '';
            this.$http.get(urlSubmit)
            .then((response) => {
                if (response) {
                    let result = response.data.result;
                    Object.keys(result).forEach(key => {
                        let value = result[key];
                        this.$set(this.data.call, key, value);
                    });
                    if (this.data.call.valid_from !== null) {
                        let datetime = time.moment(this.data.call.valid_from).tz('Europe/Lisbon');
                        this.$set(this.data.call, 'date_from_show',
                            datetime.format('YYYY-MM-DD'));
                        this.$set(this.data.call, 'time_from_show',
                            datetime.format('HH:mm:ss'));
                    } else {
                        this.$set(this.data.call, 'date_from_show', '-∞');
                        this.$set(this.data.call, 'time_from_show','');
                    }
                    if (this.data.call.valid_until !== null) {
                        let datetime = time.moment(this.data.call.valid_until).tz('Europe/Lisbon')
                        this.$set(this.data.call, 'date_until_show',
                            datetime.format('YYYY-MM-DD'));
                        this.$set(this.data.call, 'time_until_show',
                            datetime.format('HH:mm:ss'));
                    } else {
                        this.$set(this.data.call, 'date_until_show', '+∞');
                        this.$set(this.data.call, 'time_until_show','');
                    }
                    for (let ind in this.data.call.texts) {
                        if (this.data.call.texts[ind].paragraph_type_name === 'sponsors') {
                            sponsors = sponsors
                                + this.data.call.texts[ind].text + '\n';
                        }
                    }
                    this.$set(this.data, 'sponsors', sponsors)
                }
            })
            .catch((error) => {
                // eslint-disable-next-line
                console.log(error)
            });
        }
    }

}
</script>

<style scoped>

.call-title {
    font-size: 26px;
}

.dates {
    font-weight: 600;
    margin-bottom: 10px;
}

.introduction {
    margin-bottom: 10px;
}

.development {
    margin-bottom: 10px;
}

.sponsors {
    margin-top: 30px;
    font-size: 12px;
}

</style>