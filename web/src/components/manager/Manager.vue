<template>
<div>
    <v-tabs v-if="loggedIn && hasPermissions"
            show-arrows
            @change="tabChanged">
        <v-tab v-for="(segment, i) in segmentData"
            :key="i"
            :to="segment.link">
            <div v-if="segment.type === 'unit'">
                Members@{{segment.short_name}}
            </div>
            <div v-if="segment.type === 'city'">
                Members@{{segment.city[0].city}}
            </div>
            <div v-if="segment.type === 'unit-city'">
                Members@{{segment.city[0].city}}&{{segment.unit[0].short_name}}
            </div>
        </v-tab>
        <v-tab to="/manager/people-no-association">
            Undefined associations
        </v-tab>
        <v-tab to="/manager/validate">
            To validate
        </v-tab>
        <v-tab to="/manager/spaces"
            v-if="manageSpaces"
        >
            Spaces
        </v-tab>
        <v-tab to="/manager/export"
        >
            Export
        </v-tab>
        <v-tabs-items>
            <!-- use :max="N" in keep-alive if necessary-->
            <keep-alive>
                <router-view v-if="segmentType && (data.myUnits || data.myUnitsCities)"
                    :segment-type="segmentType"
                    :unit-id="unitID"
                    :city-id="cityID"
                    :unit-data="currentUnit"
                    :city-data="currentCity"
                    ></router-view>
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
</div>
</template>
<script>
import subUtil from '@/components/common/submit-utils'

export default {
    data () {
        return {
            segmentType: undefined,
            unitID: undefined,
            cityID: undefined,
            currentUnit: undefined,
            currentCity: undefined,
            manageSpaces: false,
            data: {
                myUnitsCities: [],
                myCities: [],
                myUnits: [],
                myAllWithRoles: [],
                // TODO: below all data for lists like units, groups, labs, positions
                // TODO: pass this data to router AND make router-view dependent on completion!!!!!
            },
        }
    },
    mounted: function () {
        this.$store.commit('setActiveTile', {
            newTile: 5,
            newToolbarText: 'Manage data of Research Units members',
        });
    },
    computed: {
        hasPermissions () {
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
        segmentData () {
            let unitsCitiesData = this.data.myUnitsCities;
            let unitsData = this.data.myUnits;
            let citiesData = this.data.myCities;
            let allWithRolesData = this.data.myAllWithRoles;
            for (let ind in unitsCitiesData) {
                this.$set(unitsCitiesData[ind], 'type', 'unit-city');
            }
            for (let ind in citiesData) {
                this.$set(citiesData[ind], 'type', 'city');
            }
            for (let ind in unitsData) {
                this.$set(unitsData[ind], 'type', 'unit');
            }
            let segmentData;
            if (allWithRolesData.length > 0) {
                segmentData = allWithRolesData;
            } else {
                segmentData = unitsCitiesData.concat(unitsData, citiesData);
            }

            return segmentData;
        },

    },
    created() {
        this.initialize();
    },
    methods: {
        initialize() {
            let this_session = this.$store.state.session;
            let initialSegment = true;
            if (this_session.loggedIn) {
                //console.log(this_session.permissionsEndpoints)
                for (let ind in this_session.permissionsEndpoints) {
                    let decomposedPath = this_session.permissionsEndpoints[ind].decomposedPath
                    // TODO: modify condition when unsegmented. Special attention to that case
                    if (decomposedPath[0] === 'managers'
                        && decomposedPath.length === 3
                        && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        console.log('-------------1-------------')
                    } else if (decomposedPath[0] === 'managers'
                        && decomposedPath.length === 4
                        && decomposedPath[2] === 'units'
                        && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        let urlSubmit = 'api' + this_session.permissionsEndpoints[ind].endpoint_url;
                        subUtil.getInfoPopulate(this, urlSubmit, false)
                        .then( (result) => {
                            this.$set(result, 'link', '/manager/unit/'
                                + result.short_name.toLowerCase().replace(/\s/g,'-'));
                            this.data.myUnits.push(result);
                            if (initialSegment) {
                                initialSegment = false;
                                //this.activeTab = result.link;
                                this.$router.replace(result.link)
                                    .catch(err => {err});
                                this.unitID = result.id;
                            }
                        });
                    } else if (decomposedPath[0] === 'managers'
                        && decomposedPath.length === 4
                        && decomposedPath[2] === 'cities'
                        && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        let urlSubmit = 'api' + this_session.permissionsEndpoints[ind].endpoint_url;
                        subUtil.getInfoPopulate(this, urlSubmit, false)
                        .then( (result) => {
                            this.$set(result, 'link', '/manager/city/'
                                + result.city[0].city.toLowerCase().replace(/\s/g,'-'));
                            this.data.myCities.push(result);
                            if (initialSegment) {
                                initialSegment = false;
                                //this.activeTab = result.link;
                                this.$router.replace(result.link)
                                    .catch(err => {err});
                                this.cityID = result.city[0].id;
                            }
                        });

                    } else if (decomposedPath[0] === 'managers'
                        && decomposedPath.length === 6
                        && decomposedPath[2] === 'units'
                        && decomposedPath[4] === 'cities'
                        && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        let urlSubmit = 'api' + this_session.permissionsEndpoints[ind].endpoint_url;
                        subUtil.getInfoPopulate(this, urlSubmit, false)
                        .then( (result) => {
                            this.$set(result, 'link', '/manager/unit/'
                                + result.unit[0].short_name.toLowerCase().replace(/\s/g,'-')
                                + '/city/'
                                + result.city[0].city.toLowerCase().replace(/\s/g,'-')
                            );
                            this.data.myUnitsCities.push(result);
                            if (initialSegment) {
                                initialSegment = false;
                                //this.activeTab = result.link;
                                this.$router.replace(result.link)
                                    .catch(err => {err});
                                this.unitID = result.unit[0].id;
                                this.cityID = result.city[0].id;
                            }
                        });
                    }  else if (decomposedPath[0] === 'managers'
                        && decomposedPath.length === 5
                        && decomposedPath[2] === 'cities'
                        && decomposedPath[3] === '1' // for now, only for Lisboa
                        && decomposedPath[4] === 'spaces'
                        && this_session.permissionsEndpoints[ind].allow_all_subpaths === 1
                        && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        this.manageSpaces = true;
                    }
                }
            }

        },
        tabChanged: function(tab) {
            for (let ind in this.segmentData) {
                if (this.segmentData[ind].link === tab) {
                    if (this.segmentData[ind].type === 'unit-city') {
                        this.segmentType = this.segmentData[ind].type;
                        this.unitID = this.segmentData[ind].unit[0].id;
                        this.cityID = this.segmentData[ind].city[0].id;
                        this.currentUnit = this.segmentData[ind].unit[0];
                        this.currentCity = this.segmentData[ind].city[0];
                    } else if (this.segmentData[ind].type === 'city') {
                        this.segmentType = this.segmentData[ind].type;
                        this.unitID = undefined;
                        this.cityID = this.segmentData[ind].city[0].id;
                        this.currentUnit = undefined;
                        this.currentCity = this.segmentData[ind].city[0];
                    } else if (this.segmentData[ind].type === 'unit') {
                        this.segmentType = this.segmentData[ind].type;
                        this.unitID = this.segmentData[ind].id;
                        this.cityID = undefined;
                        this.currentUnit = this.segmentData[ind];
                        this.currentCity = undefined;
                    } else {
                        this.segmentType = 'all';
                        this.unitID = undefined;
                        this.cityID = undefined;
                        this.currentUnit = undefined;
                        this.currentCity = undefined;
                    }

                    /*this.labID = this.data.myLabs[ind].id;
                    this.currentLab = this.data.myLabs[ind];
                    */
                }
            }
        },
    },

}
</script>

<style scoped>

</style>