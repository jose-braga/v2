<template>
<div>
<v-row class="pa-4">
    <v-col cols="12">
        <SpacesManagement></SpacesManagement>
    </v-col>
</v-row>
<v-row class="px-4">
    <v-col cols="12">
        <ManagerSpaces v-if="isSpaceDataManager"
            :supervisor-id="personID"
        ></ManagerSpaces>
    </v-col>
</v-row>
</div>
</template>

<script>
//const LabSpaces = () => import(/* webpackChunkName: "lab-spaces" */ './LabSpaces')
const ManagerSpaces = () => import(/* webpackChunkName: "manager-spaces" */ './ManagerSpaces')
const SpacesManagement = () => import(/* webpackChunkName: "spaces-management" */ './SpacesManagement')

export default {
    components: {
        //LabSpaces,
        ManagerSpaces,
        SpacesManagement,
    },
    data() {
        return {
            isSpaceDataManager: false,
            //isLAQV: false,
            //isSupervisor: false,
            //isUCIBIO: false,
            //isLabLeader: false, // or a person with team management permissions
            myLabs: [],
        }
    },
    computed: {
        personID () {
            return this.$store.state.session.personID;
        },
    },
    watch: {
        personID () {
            this.initialize();
        },
    },
    mounted () {
        this.initialize();

    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID
                let urlSubmit = 'api/people/' + personID + '/space-data-managers';
                this.$http.get(urlSubmit)
                .then((response) => {
                    let dataManagers = response.data.result;
                    for (let ind in dataManagers) {
                        if(personID === dataManagers[ind].person_id) {
                            this.isSpaceDataManager = true;
                        }
                    }
                });



                /*
                let urlSubmit = 'api/v2/supervisors';
                this.$http.get(urlSubmit)
                .then((response) => {
                    let supervisors = response.data.result;
                    for (let ind in supervisors) {
                        if(this_session.personID === supervisors[ind].id) {
                            this.isSupervisor = true;
                        }
                    }
                })
                if (this_session.currentUnits.length === 1
                    && this_session.currentUnits[0] === 2
                ) {
                    this.isLAQV = true;
                } else if (this_session.currentUnits.length === 1
                    && this_session.currentUnits[0] === 1
                ) {
                    this.isUCIBIO = true;
                }
                if (this.isUCIBIO) {

                    //let permissionsWebAreas = this_session.permissionsWebAreas;
                    //let permisionToTeamArea = false;
                    //for (let ind in permissionsWebAreas) {
                    //    if (permissionsWebAreas[ind].app_area_en === 'Team') {
                    //        permisionToTeamArea === true;
                    //    }
                    //}

                    // to know which labs a user manages
                    for (let ind in this_session.permissionsEndpoints) {
                        let decomposedPath = this_session.permissionsEndpoints[ind].decomposedPath;
                        if (decomposedPath[0] === 'labs'
                            && decomposedPath.length === 5
                            && decomposedPath[2] === 'members-affiliation'
                            && decomposedPath[4] === 'position'
                            && this_session.permissionsEndpoints[ind].method_name === 'POST') {
                            this.isLabLeader = true;
                            this.myLabs.push(parseInt(decomposedPath[1], 10))
                        }
                    }
                }
                */
            }
        }
    },
}
</script>

<style scoped>

</style>