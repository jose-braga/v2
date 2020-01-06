<template>
<div>
    <v-tabs
            v-if="loggedIn"
            show-arrows
            @change="tabChanged">
        <v-tab to="/person/personal">
            Personal
        </v-tab>
        <v-tab to="/person/academic">
            Academic
        </v-tab>
        <v-tab to="/person/institutional">
            Institutional
        </v-tab>
        <v-tab to="/person/productivity">
            Productivity
        </v-tab>
       <v-tabs-items>
            <!-- use :max="N" in keep-alive if necessary-->
            <keep-alive>
                <router-view></router-view>
            </keep-alive>
            <v-dialog v-model="showHelp" content-class="help">
                <router-view name="help"></router-view>
            </v-dialog>
        </v-tabs-items>
    </v-tabs>
    <v-row v-if="!loggedIn" class="pa-4">
        <div>Please login first (
            the symbol <v-icon color="green darken">mdi-login</v-icon>
            in the toolbar above).
        </div>
    </v-row>
</div>

</template>

<script>

export default {
    components: {
    },
    data () {
        return {
            activeTab: 0,
        }
    },
    mounted: function () {
        this.$store.commit('setActiveTile', {
            newTile: 0,
            newToolbarText: 'Edit your personal details'
        });
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
    methods: {
        tabChanged: function(tab) {
            this.activeTab = tab;
        }
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

