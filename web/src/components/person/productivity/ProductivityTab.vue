<template>
<div class="px-4">
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