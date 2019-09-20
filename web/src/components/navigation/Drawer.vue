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
                            <v-icon>{{tile.icon}}</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </router-link>
                <v-divider v-bind:key="`divider-${index}`"></v-divider>
            </template>
        </v-list>
    </v-navigation-drawer>
</template>

<script>

export default {
    mounted: function () {        
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
        }
    },
    watch: {
        currentTile (newCurrent, oldCurrent) {
            this.tiles[newCurrent].isActive = true;
            this.tiles[oldCurrent].isActive = false;
        }
    },
    methods: {
        changeTile: function(tiles, ind) {
            for (var el in tiles) {
                tiles[el].isActive = false;
            }
            tiles[ind].isActive = true;
            this.$store.state.navigation.activeTile = ind;
        }
    },
    data: () => ({
        tiles: [
            {
                text: 'Myself',
                icon: 'mdi-account',
                link: '/person',
                isActive: true,
            },
            {
                text: 'Team',
                icon: 'mdi-account-multiple',
                link: '/team',
                isActive: false,
            },
            {
                text: 'Group',
                icon: 'mdi-account-group',
                link: '/group',
                isActive: false,
            },
            {
                text: 'Unit',
                icon: 'mdi-city',
                link: '/unit',
                isActive: false,
            },
            {
                text: 'Manager',
                icon: 'mdi-account-tie',
                link: '/manager',
                isActive: false,
            },
            {
                text: 'Admin',
                icon: 'mdi-tools',
                link: '/admin',
                isActive: false,
            },
            {
                text: 'My UCIBIO',
                icon: '',
                link: '/unit-area/UCIBIO',
                isActive: false,
            },
            {
                text: 'My LAQV',
                icon: '',
                link: '/unit-area/LAQV',
                isActive: false,
            }
        ]
    })
}
</script>

<style>
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