<template>
<div>
    <v-tabs v-if="loggedIn && hasPermissions"
            show-arrows
            v-model="activeTab"
            @change="tabChanged">
        <v-tab v-for="(lab, i) in labData"
            :key="i"
            :to="lab.link"
        >
            {{lab.name}}
        </v-tab>
        <v-tab v-for="(lab, i) in departmentTeamData"
            :key="'dep-' + i"
            :to="lab.link"
        >
            {{lab.name}}
        </v-tab>
        <v-tab to="/team/pre-register" :key="labData.length">
            Pre-Register
        </v-tab>
       <v-tabs-items>
            <router-view v-if="data.labPositions && ((currentLab && data.myLabsManagement) || (currentDepartmentTeam && data.myDepartmentTeamsManagement))"
                :lab-id="labID"
                :lab-data="currentLab"
                :my-labs="data.myLabsManagement"
                :dep-team-id="depTeamID"
                :dep-team-data="currentDepartmentTeam"
                :my-dep-teams="data.myDepartmentTeamsManagement"
                :lab-positions="data.labPositions"
            >
            </router-view>
            <v-dialog v-model="showHelp" content-class="help">
                <router-view name="help2"></router-view>
            </v-dialog>
        </v-tabs-items>
    </v-tabs>
    <v-row>
        <v-col v-if="!loggedIn">
            <div>Please login first (
                the symbol <v-icon color="green darken">mdi-login</v-icon>
                in the toolbar above).
            </div>
        </v-col>
        <v-col v-if="loggedIn && !hasPermissions">
            <div>You do not have permission to access this section. Please contact the app administrator.
            </div>
        </v-col>
    </v-row>

</div>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    data () {
        return {
            activeTab: 0,
            labID: undefined,
            currentLab: undefined,
            depTeamID: undefined,
            currentDepartmentTeam: undefined,
            data: {
                myLabs: [],
                myLabsManagement: [],
                //myLabsMembers: [],
                labPositions: undefined,
                myDepartmentTeams: [],
                myDepartmentTeamsManagement: [],
            },
        }
    },
    mounted: function () {
        this.$store.commit('setActiveTile', {
            newTile: 2,
            newToolbarText: 'Edit your team details',
        });
    },
    computed: {
        hasPermissions () {
            let permissionsWebAreas = this.$store.state.session.permissionsWebAreas;
            for (let ind in permissionsWebAreas) {
                if (permissionsWebAreas[ind].app_area_en === 'Team') {
                    return true;
                }
            }
            return false;
        },
        loggedIn () {
            return this.$store.state.session.loggedIn;
        },
        labData () {
            let labData = this.data.myLabs;
            for (let ind in labData) {
                this.$set(labData[ind], 'link', '/team/'
                + labData[ind].name.toLowerCase().replace(/\s/g,'-'));
            }
            return labData;
        },
        departmentTeamData () {
            let labData = this.data.myDepartmentTeams;
            for (let ind in labData) {
                this.$set(labData[ind], 'link', '/team/'
                + labData[ind].name.toLowerCase().replace(/\s/g,'-'));
            }
            return labData;
        },
        showHelp: {
            get() {
                return this.$store.state.navigation.showHelp;
            },
            set(state) {
                if (state !== this.$store.state.navigation.showHelp) {
                    this.$store.dispatch('showHelp')
                }
            }
        },
    },
    created() {
        this.initialize();
    },
    watch: {
        $route () {
            this.tabChanged(this.$route.path)
        }

    },
    methods: {
        initialize() {
            let this_session = this.$store.state.session;
            let firstLab = true;
            if (this_session.loggedIn) {
                for (let ind in this_session.permissionsEndpoints) {
                    let decomposedPath = this_session.permissionsEndpoints[ind].decomposedPath
                    if (decomposedPath[0] === 'labs'
                        && decomposedPath.length === 2
                        && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        let urlSubmit = 'api' + this_session.permissionsEndpoints[ind].endpoint_url;
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            this.$set(result, 'link', '/team/'
                                + result.name.toLowerCase().replace(/\s/g,'-'));
                            this.data.myLabs.push(result);
                            if (firstLab) {
                                firstLab = false;
                                //this.activeTab = result.link;
                                this.$router.replace(result.link).catch((err)=>console.log(err));
                            }
                        });
                        urlSubmit = 'api/v2/lab-positions';
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            this.data.labPositions = result;
                        });
                    }
                    // to know which labs a user manages
                    if (decomposedPath[0] === 'labs'
                        && decomposedPath.length === 5
                        && decomposedPath[2] === 'members-affiliation'
                        && decomposedPath[4] === 'position'
                        && this_session.permissionsEndpoints[ind].method_name === 'POST'
                    ) {
                        let urlSubmit = 'api' + '/labs/' + decomposedPath[1];
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            this.data.myLabsManagement.push(result);
                        });
                    }
                    if (decomposedPath[0] === 'department-teams'
                        && decomposedPath.length === 2
                        && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        let urlSubmit = 'api' + this_session.permissionsEndpoints[ind].endpoint_url;
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            this.$set(result, 'link', '/team/'
                                + result.name.toLowerCase().replace(/\s/g,'-'));
                            this.data.myDepartmentTeams.push(result);
                            if (firstLab) {
                                firstLab = false;
                                //this.activeTab = result.link;
                                this.$router.replace(result.link).catch((err)=>console.log(err));
                            }
                        });
                        urlSubmit = 'api/v2/lab-positions';
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            this.data.labPositions = result;
                        });
                    }
                    // if user manages a department team
                    if (decomposedPath[0] === 'department-teams'
                        && decomposedPath.length === 5
                        && decomposedPath[2] === 'members-affiliation'
                        && decomposedPath[4] === 'position'
                        && this_session.permissionsEndpoints[ind].method_name === 'POST'
                    ) {
                        let urlSubmit = 'api' + '/department-teams/' + decomposedPath[1];
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            this.data.myDepartmentTeamsManagement.push(result);
                        });
                    }
                }
            }
        },
        tabChanged: function(tab) {
            for (let ind in this.data.myLabs) {
                if (this.data.myLabs[ind].link === tab) {
                    this.labID = this.data.myLabs[ind].id;
                    this.currentLab = this.data.myLabs[ind];
                    this.depTeamID = undefined;
                    this.currentDepartmentTeam = undefined;
                    return;
                }
            }
            for (let ind in this.data.myDepartmentTeams) {
                if (this.data.myDepartmentTeams[ind].link === tab) {
                    this.labID = undefined;
                    this.currentLab = undefined;
                    this.depTeamID = this.data.myDepartmentTeams[ind].id;
                    this.currentDepartmentTeam = this.data.myDepartmentTeams[ind];
                    return;
                }
            }
        },
    }
}

</script>

<style scoped>
.selected-tab {
    background-color: #ffffff;
}

.help {
    max-width: 70%;
}
</style>