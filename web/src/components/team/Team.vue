<template>
<div>
    <!--
    labId: {{labID}}<br>
    currentlab: {{currentLab}}<br>
    labData: {{labData}}<br>
    myLabMan: {{data.myLabsManagement}}<br>
    depTeamId: {{depTeamID}}<br>
    currentDepartmentTeam: {{currentDepartmentTeam}}<br>
    departmentTeamData: {{departmentTeamData}}<br>
    myTeamsDepMan: {{data.myDepartmentTeamsManagement}}<br>
    -->
    <v-container fluid v-if="loggedIn && hasPermissions && isManagerView">
        <v-row>
            <v-col cols="4">
                <v-autocomplete
                    v-model="data.managerCurrentLab"
                    :items="labs" item-value="id" item-text="name"
                    :search-input.sync="searchLabs"
                    :filter="customSearch"
                    return-object
                    @change="managerChangedTeam('lab')"
                    cache-items
                    flat
                    hide-no-data
                    hide-details
                    label="Labs"
                >
                </v-autocomplete>
            </v-col>
            <v-col cols="4">
                <v-autocomplete
                    v-model="data.managerCurrentDepTeam"
                    :items="departmentTeams" item-value="id" item-text="name"
                    :search-input.sync="searchDepTeams"
                    :filter="customSearch"
                    return-object
                    @change="managerChangedTeam('team')"
                    cache-items
                    flat
                    hide-no-data
                    hide-details
                    label="Department Teams"
                >
                </v-autocomplete>
            </v-col>
        </v-row>
        <v-tabs
            show-arrows
            v-model="activeTab"
            @change="tabChanged"
        >
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
            <v-tabs-items>
                <router-view
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
    </v-container>
    <v-tabs v-if="loggedIn && hasPermissions && !isManagerView"
            show-arrows
            v-model="activeTab"
            @change="tabChanged"
    >
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
        <v-tab to="/team/pre-register" :key="labData.length + departmentTeamData.length">
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

function prepareStringComparison(str) {
    if (str === null || str === undefined) {
        return null;
    } else {
        return str.toLocaleLowerCase()
            .replace(/[áàãâä]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[íìîï]/g, 'i')
            .replace(/[óòõôö]/g, 'o')
            .replace(/[úùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[ñ]/g, 'n')
            .replace(/(\.\s)/g, '')
            .replace(/(\.)/g, '')
            .replace(/[-:()]/g, ' ')
            .trim()
            ;
    }
}

export default {
    data () {
        return {
            activeTab: 0,
            labID: undefined,
            currentLab: undefined,
            depTeamID: undefined,
            currentDepartmentTeam: undefined,
            data: {
                managerCurrentLab: undefined,
                managerCurrentDepTeam: undefined,
                myLabs: [],
                myLabsManagement: [],
                //myLabsMembers: [],
                labPositions: undefined,
                myDepartmentTeams: [],
                myDepartmentTeamsManagement: [],
            },
            searchLabs: '',
            searchDepTeams: '',
            labs: [],
            departmentTeams: [],
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
        isManagerView () {
            let permissionsWebAreas = this.$store.state.session.permissionsWebAreas;
            for (let ind in permissionsWebAreas) {
                if (permissionsWebAreas[ind].app_area_en === 'Manager') {
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
        this.getLabs();
        this.getDepartmentTeams();
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
                        && this_session.permissionsEndpoints[ind].method_name === 'GET'
                    ) {
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
                    if ((decomposedPath[0] === 'department-teams'
                        && decomposedPath.length === 5
                        && decomposedPath[2] === 'members-affiliation'
                        && decomposedPath[4] === 'position'
                        && this_session.permissionsEndpoints[ind].method_name === 'POST')
                        ||
                        (decomposedPath[0] === 'department-teams'
                        && decomposedPath.length === 2
                        && this_session.permissionsEndpoints[ind].allow_all_subpaths === 1
                        && this_session.permissionsEndpoints[ind].method_name === 'POST')
                    ) {
                        let urlSubmit = 'api' + '/department-teams/' + decomposedPath[1];
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            this.data.myDepartmentTeamsManagement.push(result);
                        });
                    }
                }
                if (this_session.permissionsLevel < 3) {
                    let urlSubmit = 'api/v2/lab-positions';
                    subUtil.getInfoPopulate(this, urlSubmit, true)
                    .then( (result) => {
                        this.data.labPositions = result;
                    });
                }
            }
        },
        managerChangedTeam (type) {
            if (type === 'lab') {
                this.data.managerCurrentDepTeam = undefined;
                this.data.myDepartmentTeams = [];
                this.data.myDepartmentTeamsManagement = [];

                this.data.myLabs = [];
                this.data.myLabs.push(this.data.managerCurrentLab);
                this.data.myLabsManagement = [];
                this.data.myLabsManagement.push(this.data.managerCurrentLab);
                this.currentLab = this.data.managerCurrentLab
                this.labID = this.data.managerCurrentLab.id;
                let link = '/team/' + this.data.managerCurrentLab.name.toLowerCase().replace(/\s/g,'-');
                this.$router.replace(link).catch((err)=>console.log(err));

            } else if (type === 'team') {
                this.data.managerCurrentLab = undefined;
                this.data.myLabs = [];
                this.data.myLabsManagement = [];

                this.data.myDepartmentTeams = [];
                this.data.myDepartmentTeams.push(this.data.managerCurrentDepTeam)
                this.data.myDepartmentTeamsManagement = [];
                this.data.myDepartmentTeamsManagement.push(this.data.managerCurrentDepTeam)
                this.currentDepartmentTeam = this.data.managerCurrentDepTeam
                this.depTeamID = this.data.managerCurrentDepTeam.id;
                let link = '/team/' + this.data.managerCurrentDepTeam.name.toLowerCase().replace(/\s/g,'-');
                this.$router.replace(link).catch((err)=>console.log(err));
            }
        },
        getLabs() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'labs';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labs');
            }
        },
        getDepartmentTeams () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'department-teams';
                return subUtil.getPublicInfo(vm, urlSubmit, 'departmentTeams');
            }
        },
        customSearch (item, queryText, itemText) {
            let queryPre = prepareStringComparison(queryText);
            let query = queryPre.split(' ');
            let text = prepareStringComparison(itemText);
            for (let ind in query) {
                if (text.indexOf(query[ind]) === -1) {
                    return false;
                }
            }
            return true;
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