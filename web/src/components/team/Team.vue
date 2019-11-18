<template>
<v-container fluid>
    <v-tabs v-if="loggedIn && hasPermissions"
            show-arrows
            @change="tabChanged">
        <v-tab v-for="(lab, i) in labData"
            :key="i"
            :to="lab.link">
            Members<br>@{{lab.name}}
        </v-tab>
        <v-tab to="/team/pre-register">
            Pre-Register
        </v-tab>
       <v-tabs-items>
            <!-- use :max="N" in keep-alive if necessary-->
            <keep-alive>
                <router-view v-if="data.labPositions && currentLab"
                    :lab-id="labID"
                    :lab-data="currentLab"
                    :lab-positions="data.labPositions"></router-view>
            </keep-alive>
            <v-dialog v-model="showHelp" content-class="help">
                <router-view name="help"></router-view>
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

</v-container>


</template>

<script>
import subUtil from '../common/submit-utils'

export default {
    data () {
        return {
            //activeTab: 0,
            labID: undefined,
            currentLab: undefined,
            data: {
                myLabs: [],
                //myLabsMembers: [],
                labPositions: undefined,
            },
        }
    },
    mounted: function () {
        this.$store.commit('setActiveTile', {
            newTile: 1,
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
        labData () {
            let labData = this.data.myLabs;
            for (let ind in labData) {
                this.$set(labData[ind], 'link', '/team/'
                + labData[ind].name.toLowerCase().replace(/\s/g,'-'));
            }
            return labData;
        },
    },
    created() {
        this.initialize();
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
                                this.$router.replace(result.link)
                            }
                        });
                        urlSubmit = 'api/v2/lab-positions';
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            this.data.labPositions = result;
                        });
                    }
                }
            }
        },
        tabChanged: function(tab) {
            //this.activeTab = tab;
            for (let ind in this.data.myLabs) {
                if (this.data.myLabs[ind].link === tab) {
                    this.labID = this.data.myLabs[ind].id;
                    this.currentLab = this.data.myLabs[ind];
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