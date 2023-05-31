<template>
<div>
    <v-tabs
            v-if="loggedIn"
            show-arrows
            @change="tabChanged">
        <v-tab :to="'/unit-area/' + unitName + '/sub-tab/general'">
            All Poles
        </v-tab>
        <v-tab v-for="(city,i) in cities"
            :to="'/unit-area/' + unitName + '/city/' + city + '/sub-tab/general'"
            :key="i"
        >
            @{{city}}
        </v-tab>
        <v-tabs-items>
            <v-tabs
                show-arrows
                @change="tabChanged"
            >
                <v-tab v-for="(sub,j) in subTabs"
                    :to="toPath(unitName, cityName, sub.tab_path)"
                    :key="'tab-' + unitName + '-' + cityName + '-' + j"
                >
                    {{sub.tab_name}}
                </v-tab>
                <v-tabs-items>
                    <!-- use :max="N" in keep-alive if necessary-->
                    <keep-alive>
                        <router-view
                            :unit-name="unitName"
                            :city-name="cityName"
                            :sub-tab-name="subTabName"
                            :sub-tab-id="subTabID"
                        ></router-view>
                    </keep-alive>
                    <v-dialog v-model="showHelp" content-class="help">
                        <router-view name="help"></router-view>
                    </v-dialog>
                </v-tabs-items>
            </v-tabs>
            <!--
            <v-tabs>
                <v-tab :to="'/unit-area/' + unitName + '/sub-tab/general'">
                    General info
                </v-tab>

            </v-tabs>
            -->
        </v-tabs-items>
    </v-tabs>
    <v-row>
        <v-col v-if="!loggedIn">
            <div>Please login first (
                the symbol <v-icon color="green darken">mdi-login</v-icon>
                in the toolbar above).
            </div>
        </v-col>
    </v-row>
</div>

</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    components: {
    },
    data () {
        return {
            unitName: '',
            cityName: '',
            subTabName: '',
            subTabID: 1,
            allTabs: [],
            subTabs: [],
            activeTab: 0,
            cities: [],
        }
    },
    mounted() {
        this.initialize();
    },
    computed: {
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
    },
    watch: {
        $route () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            this.subTabs = [];
            this.unitName = this.$route.params.unitName;
            this.cityName = this.$route.params.cityName;
            this.subTabName = this.$route.params.subTabName;
            this.getDocumentTabs()
            .then(() => {
                if (this.unitName === 'UCIBIO') {
                    this.cities = ['Lisboa', 'Porto']
                    this.$store.commit('setActiveTile', {
                        newTile: 7,
                        newToolbarText: 'Documents and information shared for UCIBIO members'
                    });
                    if (this.cityName === 'Lisboa') {
                        for (let ind in this.allTabs) {
                            if (this.allTabs[ind].unit_id === 1 && this.allTabs[ind].city_id === 1) {
                                this.subTabs.push(this.allTabs[ind]);
                            }
                            if (this.allTabs[ind].unit_id === 1
                                && this.allTabs[ind].city_id === 1
                                && this.allTabs[ind].tab_path === this.subTabName
                            ) {
                                this.subTabID = this.allTabs[ind].id;
                            }
                        }
                    } else if (this.cityName === 'Porto') {
                        for (let ind in this.allTabs) {
                            if (this.allTabs[ind].unit_id === 1 && this.allTabs[ind].city_id === 2) {
                                this.subTabs.push(this.allTabs[ind]);
                            }
                            if (this.allTabs[ind].unit_id === 1
                                && this.allTabs[ind].city_id === 2
                                && this.allTabs[ind].tab_path === this.subTabName
                            ) {
                                this.subTabID = this.allTabs[ind].id;
                            }
                        }
                    } else {
                        for (let ind in this.allTabs) {
                            if (this.allTabs[ind].unit_id === 1 && this.allTabs[ind].city_id === null) {
                                this.subTabs.push(this.allTabs[ind]);
                            }
                            if (this.allTabs[ind].unit_id === 1
                                && this.allTabs[ind].city_id === null
                                && this.allTabs[ind].tab_path === this.subTabName
                            ) {
                                this.subTabID = this.allTabs[ind].id;
                            }
                        }
                    }
                } else if (this.unitName === 'LAQV') {
                    this.cities = ['Aveiro', 'Lisboa', 'Porto']
                    this.$store.commit('setActiveTile', {
                        newTile: 8,
                        newToolbarText: 'Documents and information shared for LAQV members'
                    });
                    if (this.cityName === 'Lisboa') {
                        for (let ind in this.allTabs) {
                            if (this.allTabs[ind].unit_id === 2 && this.allTabs[ind].city_id === 1) {
                                this.subTabs.push(this.allTabs[ind]);
                            }
                            if (this.allTabs[ind].unit_id === 2
                                && this.allTabs[ind].city_id === 1
                                && this.allTabs[ind].tab_path === this.subTabName
                            ) {
                                this.subTabID = this.allTabs[ind].id;
                            }
                        }
                    } else if (this.cityName === 'Porto') {
                        for (let ind in this.allTabs) {
                            if (this.allTabs[ind].unit_id === 2 && this.allTabs[ind].city_id === 2) {
                                this.subTabs.push(this.allTabs[ind]);
                            }
                            if (this.allTabs[ind].unit_id === 2
                                && this.allTabs[ind].city_id === 2
                                && this.allTabs[ind].tab_path === this.subTabName
                            ) {
                                this.subTabID = this.allTabs[ind].id;
                            }
                        }
                    } else if (this.cityName === 'Aveiro') {
                        for (let ind in this.allTabs) {
                            if (this.allTabs[ind].unit_id === 2 && this.allTabs[ind].city_id === 3) {
                                this.subTabs.push(this.allTabs[ind]);
                            }
                            if (this.allTabs[ind].unit_id === 2
                                && this.allTabs[ind].city_id === 3
                                && this.allTabs[ind].tab_path === this.subTabName
                            ) {
                                this.subTabID = this.allTabs[ind].id;
                            }
                        }
                    } else {
                        for (let ind in this.allTabs) {
                            if (this.allTabs[ind].unit_id === 2 && this.allTabs[ind].city_id === null) {
                                this.subTabs.push(this.allTabs[ind]);
                            }
                            if (this.allTabs[ind].unit_id === 2
                                && this.allTabs[ind].city_id === null
                                && this.allTabs[ind].tab_path === this.subTabName
                            ) {
                                this.subTabID = this.allTabs[ind].id;
                            }
                        }
                    }
                }
            })
        },
        toPath(unitName, cityName, subTabName) {
            if (cityName === '' || cityName === undefined || cityName === null) {
                return '/unit-area/' + unitName + '/sub-tab/' + subTabName;
            } else {
                return '/unit-area/' + unitName + '/city/' + cityName + '/sub-tab/' + subTabName;
            }
        },
        getDocumentTabs () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'document-tabs';
            return subUtil.getPublicInfo(vm, urlSubmit, 'allTabs');
        },
        tabChanged: function(tab) {
            this.activeTab = tab;
        }
    }

}
</script>

<style scoped>

</style>