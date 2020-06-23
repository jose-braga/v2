<template>
    <v-navigation-drawer
            v-model="drawer" :value="drawer" width=200 app>
        <v-list>
            <template v-for="(tile, index) in tiles">
                <router-link
                        :to="tile.link"
                        style="text-decoration: none;"
                        :key="`route-${index}`"
                        :class="{ activetile: tile.isActive, inactivetile: !tile.isActive }">
                    <v-list-item
                            :key="`title-${index}`"
                            @click="changeTile(tiles, index)">
                        <v-list-item-content>
                            <v-list-item-title>{{tile.text}}</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon v-if="tile.icon">{{tile.icon}}</v-icon>
                            <img v-if="tile.image" :src="tile.image" width="24">
                        </v-list-item-action>
                    </v-list-item>
                </router-link>
                <v-divider v-bind:key="`divider-${index}`"></v-divider>
            </template>
        </v-list>
    </v-navigation-drawer>
</template>

<script>
//import subUtil from '@/components/common/submit-utils'

export default {
    mounted() {
        this.initialize();
    },
    computed: {
        drawer: {
            get() {
                return this.$store.state.navigation.drawer;
            },
            set(state) {
                if (state !== this.$store.state.navigation.drawer) {
                    this.$store.dispatch('changeDrawer');
                }
            }
        },
        currentTile () {
            return this.$store.state.navigation.activeTile;
        },
        personID () {
            return this.$store.state.session.personID;
        },
    },
    watch: {
        currentTile (newCurrent, oldCurrent) {
            this.tiles[newCurrent].isActive = true;
            this.tiles[oldCurrent].isActive = false;
        },
        personID () {
            this.initialize();
        },
    },
    methods: {
        changeTile: function(tiles, ind) {
            for (var el in tiles) {
                tiles[el].isActive = false;
            }
            tiles[ind].isActive = true;
            this.$store.state.navigation.activeTile = ind;
        },
        initialize() {
            for(let ind in this.tiles) {
                if (this.tiles[ind].text === 'Team') {
                    /*
                    let this_session = this.$store.state.session;
                    let urlSubmit;
                    for (let ind in this_session.permissionsEndpoints) {
                        if (this_session.permissionsEndpoints[ind].resource1_type_name === 'labs'
                            && this_session.permissionsEndpoints[ind].resource2_type_name === null
                            && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                            urlSubmit = 'api' + this_session.permissionsEndpoints[ind].endpoint_url;
                            break;
                        }
                    }
                    subUtil.getInfoPopulate(this, urlSubmit, true)
                    .then( (result) => {
                        if (result !== undefined) {
                            this.tiles[ind].link = '/team/'
                                + result.name.toLowerCase().replace(/\s/g,'-');
                        } else {
                            this.tiles[ind].link = '/team';
                        }

                    })
                    */
                }
            }
        }
    },
    data: () => ({
        tiles: [
            {
                text: 'Myself',
                icon: 'mdi-account',
                image: false,
                link: '/person',
                isActive: true,
            },
            {
                text: 'On Behalf',
                icon: 'mdi-account-switch',
                image: false,
                link: '/person-on-behalf',
                isActive: false,
            },
            {
                text: 'Team',
                icon: 'mdi-account-multiple',
                image: false,
                link: '/team',
                isActive: false,
            },
            {
                text: 'Group',
                icon: 'mdi-account-group',
                image: false,
                link: '/group',
                isActive: false,
            },
            {
                text: 'Unit',
                icon: 'mdi-city',
                image: false,
                link: '/unit',
                isActive: false,
            },
            {
                text: 'Manager',
                icon: 'mdi-account-tie',
                image: false,
                link: '/manager',
                isActive: false,
            },
            {
                text: 'Admin',
                icon: 'mdi-tools',
                image: false,
                link: '/admin',
                isActive: false,
            },
            {
                text: 'My UCIBIO',
                icon: false,
                image: '/images/logo/ucibio-logo.png',
                link: '/unit-area/UCIBIO',
                isActive: false,
            },
            {
                text: 'My LAQV',
                icon: false,
                image: '/images/logo/laqv-logo.png',
                link: '/unit-area/LAQV',
                isActive: false,
            }
        ]
    })
}
</script>

<style scoped>
.activetile div{
    background-color: transparent;
}

.inactivetile div{
    background-color: #f0f0f0;
}

.inactivetile .v-list__tile__content,
.inactivetile .v-list__tile__title,
.inactivetile .v-list__tile__avatar {
    background-color: transparent;
}

</style>