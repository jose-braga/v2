<template>
<div>
    <v-tabs v-model="currentTab">
        <v-tab v-if="isSupervisor" to="/person/productivity/supervisor">
            Supervisor
        </v-tab>
        <v-tab to="/person/productivity/publications">
            Publications
        </v-tab>
        <v-tab to="/person/productivity/add-publications">
            Add Publications
        </v-tab>
        <v-tab to="/person/productivity/projects">
            Projects
        </v-tab>
        <v-tab to="/person/productivity/other">
            Other
        </v-tab>
        <v-tabs-items>
            <!-- use :max="N" in keep-alive if necessary-->
            <keep-alive>
                <router-view
                        :current-tab="currentTab"
                ></router-view>
            </keep-alive>
            <v-dialog v-model="showHelp2" content-class="help">
                <router-view name="help2"></router-view>
            </v-dialog>
        </v-tabs-items>
    </v-tabs>
</div>


</template>

<script>

export default {
    data () {
        return {
            currentTab: undefined,
            isSupervisor: false,
        }
    },
    mounted() {
        this.initialize()
    },
    computed: {
        showHelp2: {
            get() {
                return this.$store.state.navigation.showHelp2;
            },
            set(state) {
                if (state !== this.$store.state.navigation.showHelp2) {
                    this.$store.dispatch('showHelp2')
                }
            }

        },
    },
    methods: {
        initialize() {
            if (this.$store.state.session.loggedIn) {
                let urlSubmit = 'api/v2/supervisors';
                this.$http.get(urlSubmit)
                .then((response) => {
                    let supervisors = response.data.result;
                    for (let ind in supervisors) {
                        if(this.$store.state.session.personID === supervisors[ind].id) {
                            this.isSupervisor = true;
                        }
                    }
                })
            }
        }
    },

}
</script>

<style scoped>

</style>