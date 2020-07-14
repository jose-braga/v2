<template>
<div>
    <v-app-bar prominent app>
        <v-toolbar-title>
            <v-row align="center">
                <v-col cols="1">
                    <img src="/images/logo/ucibio-logo.png" width="40">
                </v-col>
                <v-col cols="10" class="ml-auto call-title">{{data.call.call_name}} <br> Application page</v-col>
            </v-row>
        </v-toolbar-title>
        <v-spacer></v-spacer>
    </v-app-bar>
    <v-container>
        <v-row
            align="center"
            justify="center"
        >
            <v-col cols="11" sm="8" xl="6">
                <div class="dates">{{data.dates}}</div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" md="6">
                <PersonalData></PersonalData>
            </v-col>
            <v-col cols="12" md="6">
                <PersonalData></PersonalData>
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
//import time from '@/components/common/date-utils'
import PersonalData from './PersonalData'

export default {
    components: {
        PersonalData,

    },
    data() {
        return {
            data: {
                call: {},
                urlApplicants: '',
                dates: '',
                sponsors: ''
            },
            baseURL: '/calls/',

        }
    },
    created () {
        let callID = this.$route.params.callID
        this.initialize(callID);
        this.getCallInfo(callID);
    },
    methods: {
        initialize(callID) {
            console.log(callID)
        },
        getCallInfo(callID) {
            let urlSubmit = 'api/v2/calls/' + callID;
            let sponsors = '';
            let dates = '';
            this.$http.get(urlSubmit)
            .then((response) => {
                if (response) {
                    let result = response.data.result;
                    Object.keys(result).forEach(key => {
                        let value = result[key];
                        this.$set(this.data.call, key, value);
                    });
                    for (let ind in this.data.call.texts) {
                        if (this.data.call.texts[ind].paragraph_type_name === 'sponsors') {
                            sponsors = sponsors
                                + this.data.call.texts[ind].text + '\n';
                        } else if (this.data.call.texts[ind].paragraph_type_name === 'dates') {
                            dates = dates
                                + this.data.call.texts[ind].text + '\n';
                        }
                    }
                    this.$set(this.data, 'sponsors', sponsors)
                    this.$set(this.data, 'dates', dates)
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