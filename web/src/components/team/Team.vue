<template>
<v-container fluid>
    <v-tabs color="rgba(255,255,255,0)" 
            v-if="loggedIn && hasPermissions"
            show-arrows
            @change="tabChanged">
        <v-tab to="/team/members">
            Members
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
    <v-flex v-if="!loggedIn">
        <div>Please login first (
            the symbol <v-icon color="green darken">fas fa-sign-in-alt</v-icon>
            in the toolbar above).
        </div>
    </v-flex>
    <v-flex v-if="loggedIn && !hasPermissions">
        <div>You do not have permission to access this section. Please contact
        </div>
    </v-flex>
    
</v-container> 
    
  
</template>

<script>
export default {
    data () {
        return {
            activeTab: 0,
        }
    },
    mounted: function () {
        this.$store.commit('setActiveTile', {
            newTile: 1,
            newToolbarText: 'Edit your team details'
        });
    },
    computed: {
        hasPermissions () {
            if (this.$store.state.session.permissionID.includes(500)) {
                return true;
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

<style>
.selected-tab {
    background-color: #ffffff;
}

.help {
    max-width: 70%;
}
</style>