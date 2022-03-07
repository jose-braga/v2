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
            Academic & Professional
        </v-tab>
        <v-tab to="/person/institutional">
            Institutional & Scientific
        </v-tab>
        <!--
        <v-tab to="/person/professional">
            Professional
        </v-tab>
        -->
        <v-tab to="/person/productivity">
            Productivity
        </v-tab>
        <v-tab v-if="accessSpaces" to="/person/spaces">
            Spaces
        </v-tab>
        <v-tab v-if="accessWarehouse" to="/person/warehouse">
            Warehouse
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
    <!--
    <v-row v-if="!loggedIn" class="pa-4">
        <h3>News:</h3>
    </v-row>
    -->

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
        accessSpaces () {
            let departments = this.$store.state.session.currentDepartments;
            for (let ind in departments) {
                if (departments[ind].department_id === 1) {
                    return true;
                }
            }
            return false;
        },
        accessWarehouse () {
            return this.$store.state.session.storeAccess.accessStore
                || this.$store.state.session.storeAccess.manageUsers
                || this.$store.state.session.storeAccess.manageOrders
                || this.$store.state.session.storeAccess.manageStock
                || this.$store.state.session.storeAccess.manageFinances
            ;
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

