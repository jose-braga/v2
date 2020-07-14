<template>
<div>
    <v-tabs
            v-if="loggedIn"
            show-arrows
            @change="tabChanged">
        <v-tab :to="'/unit-area/' + unitName">
            All Poles
        </v-tab>
        <v-tab v-for="(city,i) in cities"
            :to="'/unit-area/' + unitName + '/city/' + city"
            :key="i"
        >
            @{{city}}
        </v-tab>

        <v-tabs-items>
            <!-- use :max="N" in keep-alive if necessary-->
            <keep-alive>
                <router-view
                    :unit-name="unitName"
                    :city-name="cityName"
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
    </v-row>
</div>

</template>

<script>
export default {
    components: {
    },
    data () {
        return {
            unitName: '',
            cityName: '',
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
            this.unitName = this.$route.params.unitName;
            this.cityName = this.$route.params.cityName;
            if (this.unitName === 'UCIBIO') {
                this.cities = ['Lisboa', 'Porto']
                this.$store.commit('setActiveTile', {
                    newTile: 7,
                    newToolbarText: 'Documents and information shared for UCIBIO members'
                });
            } else if (this.unitName === 'LAQV') {
                this.cities = ['Aveiro', 'Lisboa', 'Porto']
                this.$store.commit('setActiveTile', {
                    newTile: 8,
                    newToolbarText: 'Documents and information shared for LAQV members'
                });
            }
        },
        tabChanged: function(tab) {
            this.activeTab = tab;
        }
    }

}
</script>

<style scoped>

</style>