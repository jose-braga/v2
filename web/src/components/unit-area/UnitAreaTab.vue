<template>
<v-container fluid>
<v-row>

    <v-col v-if="hasPermissions" cols="12">
        <UsersDocumentsList
            :unit-id="unitID"
            :city-id="cityID"
            :sub-tab-id="subTabId"
        ></UsersDocumentsList>
    </v-col>
    <v-col v-if="hasPermissions && hasManagement" cols="12">
        <ManagersDocumentsList
            :unit-id="unitID"
            :city-id="cityID"
            :sub-tab-id="subTabId"
        ></ManagersDocumentsList>
    </v-col>
    <v-col v-if="hasPermissions && hasManagement" cols="12">
        <ManagersDocumentAdd
            :unit-id="unitID"
            :city-id="cityID"
            :sub-tab-id="subTabId"
        ></ManagersDocumentAdd>
    </v-col>
    <v-col v-if="!hasPermissions">
        <div>You do not have permission to access this section.</div>
    </v-col>
</v-row>
</v-container>
</template>

<script>
const UsersDocumentsList = () => import(/* webpackChunkName: "unit-area-documents-list" */ './UsersDocumentsList')
const ManagersDocumentsList = () => import(/* webpackChunkName: "unit-area-managers-documents-list" */ './ManagersDocumentsList')
const ManagersDocumentAdd = () => import(/* webpackChunkName: "unit-area-managers-document-add" */ './ManagersDocumentAdd')

export default {
    components: {
        UsersDocumentsList,
        ManagersDocumentsList,
        ManagersDocumentAdd,
    },
    props: {
        unitName: String,
        cityName: String,
        subTabName: String,
        subTabId: Number,
    },
    data () {
        return {
            hasPermissions: false,
            hasManagement: false,
            unitID: undefined,
            cityID: undefined,
            //showSubTabs: false,
            //activeTab: 2,
            //openPanel: [],
        }
    },
    mounted () {
        this.initialize();
    },
    watch: {
        unitName () {
            this.initialize();
        },
        cityName () {
            this.initialize();
        },
        subTabName () {
            this.initialize();
        },

    },
    methods: {
        initialize () {
            this.unitID = undefined;
            this.cityID = undefined;
            this.hasPermissions = false;
            this.hasManagement = false;
            if (this.unitName === 'UCIBIO') {
                this.unitID = 1;
                //this.showSubTabs  = true;
            }
            if (this.unitName === 'LAQV') this.unitID = 2;
            if (this.cityName === 'Lisboa') this.cityID = 1;
            if (this.cityName === 'Porto') this.cityID = 2;
            if (this.cityName === 'Aveiro') this.cityID = 3;
            let this_session = this.$store.state.session;
            if (this_session.currentUnits.includes(this.unitID)) {
                if (this.cityName !== undefined) {
                    if (this_session.currentCity !== undefined
                            && this_session.currentCity.city_id === this.cityID) {
                        this.hasPermissions = true;
                        // gets unit documents for this city
                        for (let ind in this_session.permissionsEndpoints) {
                            let decomposedPath = this_session.permissionsEndpoints[ind].decomposedPath;
                            if (decomposedPath[0] === 'unit-areas'
                                && decomposedPath[2] === 'cities'
                                && decomposedPath.length === 5
                                && this_session.permissionsEndpoints[ind].method_name === 'POST') {
                                this.hasManagement = true;
                            }
                        }
                    } else {
                        for (let ind in this_session.permissionsEndpoints) {
                            let decomposedPath = this_session.permissionsEndpoints[ind].decomposedPath;
                            if (decomposedPath[0] === 'unit-areas'
                                && decomposedPath[2] === 'cities'
                                && decomposedPath[3] == this.cityID
                                && decomposedPath.length === 5
                                && this_session.permissionsEndpoints[ind].method_name === 'POST') {
                                this.hasManagement = true;
                                this.hasPermissions = true;
                            }
                        }
                    }
                } else {
                    this.hasPermissions = true;
                    // gets unit documents
                    for (let ind in this_session.permissionsEndpoints) {
                        let decomposedPath = this_session.permissionsEndpoints[ind].decomposedPath;
                        if (decomposedPath[0] === 'unit-areas'
                            && decomposedPath.length === 3
                            && this_session.permissionsEndpoints[ind].method_name === 'POST') {
                            this.hasManagement = true;
                        }
                    }
                }
            }
        }
    },


}
</script>

<style>

</style>