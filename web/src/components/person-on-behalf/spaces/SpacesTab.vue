<template>
<div>
<v-row class="pa-4">
    <v-col cols="12">
        <SpacesManagement
            :other-person-id="otherPersonId"
        ></SpacesManagement>
    </v-col>
</v-row>
<!--
<v-row class="px-4">
    <v-col cols="12">
        <SupervisorSpaces v-if="isLAQV && isSupervisor"
            :supervisor-id="otherPersonId"
        ></SupervisorSpaces>
        <div v-if="isUCIBIO && isLabLeader">
            <LabSpaces v-for="(lab,i) in myLabs"
                :key="i"
                :other-person-id="otherPersonId"
                :lab="lab"
            >
            </LabSpaces>
        </div>
    </v-col>
</v-row>
-->
</div>
</template>

<script>

//import subUtil from '@/components/common/submit-utils'
//import time from '@/components/common/date-utils'

//const LabSpaces = () => import(/* webpackChunkName: "person-on-behalf-lab-spaces" */ './LabSpaces')
//const SupervisorSpaces = () => import(/* webpackChunkName: "person-on-behalf-supervisor-spaces" */ './SupervisorSpaces')
const SpacesManagement = () => import(/* webpackChunkName: "person-on-behalf-spaces-management" */ './SpacesManagement')

export default {
    components: {
        //LabSpaces,
        //SupervisorSpaces,
        SpacesManagement,
    },
    data() {
        return {
            isLAQV: false,
            isSupervisor: false,
            isUCIBIO: false,
            isLabLeader: false, // or a person with team management permissions
            myLabs: [],
        }
    },
    computed: {
        otherPersonId() {
            return parseInt(this.$route.params.id, 10);
        },
    },
    watch: {
        otherPersonId () {
            this.initialize();
        },
    },
    mounted () {
        this.initialize();

    },
    methods: {
        initialize () {
            /*
            this.isLAQV = false;
            this.isUCIBIO = false;
            this.isSupervisor = false;
            this.isLabLeader = false;
            this.myLabs = [];
            if (this.$store.state.session.loggedIn) {
                //let this_session = this.$store.state.session;
                let urlSubmit = 'api/v2/supervisors';
                this.$http.get(urlSubmit)
                .then((response) => {
                    let supervisors = response.data.result;
                    for (let ind in supervisors) {
                        if(this.otherPersonId === supervisors[ind].id) {
                            this.isSupervisor = true;
                        }
                    }
                    if (this.isSupervisor) {
                        urlSubmit = 'api/people/' + this.otherPersonId
                            + '/lab-affiliations';
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            let currentUnits = [];
                            for (let ind in result) {
                                let valid_from = time.momentToDate(result[ind].valid_from);
                                let valid_until = time.momentToDate(result[ind].valid_until);
                                let now = time.moment().format('YYYY-MM-DD');
                                if ((valid_from === null || valid_from < now)
                                    && (valid_until === null || valid_until > now)
                                ) {
                                    if (this.myLabs.indexOf(result[ind].lab_id) === -1) {
                                        this.myLabs.push(parseInt(result[ind].lab_id, 10));
                                    }
                                    // current lab, get current unit
                                    if (result[ind].lab_position_id === 11 || result[ind].lab_position_id === 2) {
                                        this.isLabLeader = true;
                                    }
                                    for (let indGrp in result[ind].groups) {
                                        for (let indUnit in result[ind].groups[indGrp].units) {
                                            currentUnits.push( result[ind].groups[indGrp].units[indUnit].id);
                                        }
                                    }
                                }
                            }
                            if (currentUnits.length === 1
                                && currentUnits[0] === 2
                            ) {
                                this.isLAQV = true;
                            } else if (currentUnits.length === 1
                                && currentUnits[0] === 1
                            ) {
                                this.isUCIBIO = true;
                            }
                        });
                    }
                })
            }
            */
        }
    },
}
</script>

<style scoped>

</style>