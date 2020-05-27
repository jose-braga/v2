<template>
<div>
    <v-tabs v-if="loggedIn && hasPermissions && data.myPeople.length > 0"
            show-arrows
        @change="tabChanged"
    >
        <v-tab v-for="(person, i) in peopleData"
            :key="i"
            :to="person.link"
            :disabled="person.disabled">
            {{person.colloquial_name}}
        </v-tab>
       <v-tabs-items>
            <!-- use :max="N" in keep-alive if necessary-->
            <keep-alive>
                <router-view v-if="data.myPeople.length > 0"
                ></router-view>
            </keep-alive>
            <v-dialog v-model="showHelp" content-class="help">
                <router-view name="help"></router-view>
            </v-dialog>
        </v-tabs-items>
    </v-tabs>
    <div v-if="loggedIn && hasPermissions && data.myPeople.length === 0"
             class="ma-2">
        No one assigned you as an editor of their data.
    </div>
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
import subUtil from '../common/submit-utils'

export default {
    data () {
        return {
            otherPersonID: 0,
            currentPerson: {},
            rootTab: '0',
            data: {
                myPeople: [],
            },
        }
    },

    mounted: function () {
        this.$store.commit('setActiveTile', {
            newTile: 1,
            newToolbarText: 'Edit data from other users'
        });
    },
    computed: {
        hasPermissions () {
            let permissionsWebAreas = this.$store.state.session.permissionsWebAreas;
            for (let ind in permissionsWebAreas) {
                if (permissionsWebAreas[ind].app_area_en === 'On Behalf') {
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
        peopleData () {
            let peopleData = this.data.myPeople;
            for (let ind in peopleData) {
                this.$set(peopleData[ind], 'link', '/person-on-behalf/'
                + peopleData[ind].id);
                this.$set(peopleData[ind], 'disabled', false);
            }
            return peopleData;
        },
    },
    created() {
        this.$root.$on('updateNuclearInformation', () => {
            // your code goes here
            this.initialize();
        });
        this.initialize();

    },
    methods: {
        initialize() {
            this.data.myPeople = [];
            let this_session = this.$store.state.session;
            if (this_session.loggedIn) {
                let urls = [];
                for (let ind in this_session.permissionsEndpoints) {
                    let decomposedPath = this_session.permissionsEndpoints[ind].decomposedPath
                    if (decomposedPath[0] === 'people'
                        && decomposedPath.length === 2
                        && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        let urlSubmit = 'api' + this_session.permissionsEndpoints[ind].endpoint_url
                                        + '/nuclear-info';
                        urls.push(urlSubmit);
                    }
                }
                this.$http.all(
                    urls.map(el => subUtil.getInfoPopulate(this, el, false))
                )
                .then(this.$http.spread( (...people) => {
                    people.sort(function(a,b) {
                        if (a.colloquial_name.toLowerCase()
                                < b.colloquial_name.toLowerCase()) return -1;
                        if (a.colloquial_name.toLowerCase()
                                > b.colloquial_name.toLowerCase()) return 1;
                        return 0;
                    })
                    let firstPerson = true;
                    for (let ind in people) {
                        this.$set(people[ind], 'link', '/person-on-behalf/'
                                    + people[ind].id);
                        this.$set(this.data.myPeople, ind, people[ind]);
                        if (firstPerson) {
                            firstPerson = false;
                            //this.activeTab = result.link;
                            if (this.$route.path !== people[ind].link) {
                                this.$router.replace(people[ind].link)
                            }
                        }
                    }
                }))
            }
        },

        tabChanged: function(tab) {
            for (let ind in this.peopleData) {
                if (this.data.myPeople[ind].link === tab) {
                    this.peopleData[ind].disabled = true;
                } else {
                    this.peopleData[ind].disabled = false;
                }
            }

        },
    },
}

</script>