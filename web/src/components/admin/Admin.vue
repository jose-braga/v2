<template>
<div>
    <v-tabs
            v-if="loggedIn && hasPermissions"
            show-arrows
            @change="tabChanged">
        <v-tab to="/admin/messages">
            Messages
        </v-tab>
        <v-tab to="/admin/user-contacts">
            Bugs & Suggestions
        </v-tab>
        <v-tab to="/admin/email-definitions">
            Email Definitions
        </v-tab>
        <v-tab to="/admin/news">
            News
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
            newTile: 6,
            newToolbarText: 'Make administrative tasks'
        });
    },
    computed: {
        hasPermissions () {
            let permissionsWebAreas = this.$store.state.session.permissionsWebAreas;
            for (let ind in permissionsWebAreas) {
                if (permissionsWebAreas[ind].app_area_en === 'Admin') {
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
    },
    methods: {
        tabChanged: function(tab) {
            this.activeTab = tab;
        }
    }

}
</script>

<style scoped>

</style>