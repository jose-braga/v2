<template>
<v-tabs show-arrows
>
    <v-tab :to="link + '/members'">
        Members
    </v-tab>
    <v-tab v-if="labId !== undefined"
        :to="link + '/publications'">
        Publications
    </v-tab>
    <v-tab v-if="accessSpaces"
        :to="link + '/spaces'">
        Spaces
    </v-tab>
    <v-tabs-items>
            <router-view
                :lab-id="labId"
                :lab-data="labData"
                :my-labs="myLabs"
                :dep-team-id="depTeamId"
                :dep-team-data="depTeamData"
                :my-dep-teams="myDepTeams"
                :lab-positions="labPositions"
            ></router-view>

        <v-dialog v-model="showHelp" content-class="help">
            <router-view name="help2"></router-view>
        </v-dialog>
    </v-tabs-items>
</v-tabs>

</template>

<script>
export default {
    props: {
        labId: Number,
        labData: Object,
        myLabs: Array,
        depTeamId: Number,
        depTeamData: Object,
        myDepTeams: Array,
        labPositions: Array,
    },
    data () {
        return {

        }
    },
    mounted () {
        this.initialize();
    },
    computed: {
        link() {
            let link;
            if (this.labData !== undefined) {
                link = this.labData.link;
            }
            if (this.depTeamData !== undefined) {
                link = this.depTeamData.link;
            }
            return link;
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
        accessSpaces () {
            let departments = this.$store.state.session.currentDepartments;
            for (let ind in departments) {
                if (departments[ind].department_id === 1) {
                    return true;
                }
            }
            return false;
        },
    },
    watch: {
        labId () {
            this.initialize();
        },
        depTeamId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            this.$router.replace(this.link + '/members')
                .catch((err)=>console.log(err));
        },
    }

}
</script>

<style scoped>

</style>