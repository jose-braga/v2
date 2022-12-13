<template>
<v-container fluid>
    <v-row>
        <v-col cols="12">
            <CurrentMembers
                :lab-id="labId"
                :lab-data="labData"
                :my-labs="myLabs"
                :dep-team-id="depTeamId"
                :dep-team-data="depTeamData"
                :my-dep-teams="myDepTeams"
                :lab-positions="labPositions"
            ></CurrentMembers>
        </v-col>
        <v-col cols="12">
            <PastMembers
                :lab-id="labId"
                :lab-data="labData"
                :my-labs="myLabs"
                :dep-team-id="depTeamId"
                :dep-team-data="depTeamData"
                :my-dep-teams="myDepTeams"
                :lab-positions="labPositions"
            ></PastMembers>
        </v-col>
    </v-row>
</v-container>
</template>

<script>

import CurrentMembers from './CurrentMembersList'
import PastMembers from './PastMembersList'

export default {
    components: {
        CurrentMembers,
        PastMembers,
    },
    props: {
        labId: Number,
        labData: Object,
        myLabs: Array,
        depTeamId: Number,
        depTeamData: Object,
        myDepTeams: Array,
        labPositions: Array,
    },
    computed: {
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            date_menu: false,
            data: {
                members: [],
            },
        }
    },

    methods: {

    },

}
</script>

<style scoped>

</style>

