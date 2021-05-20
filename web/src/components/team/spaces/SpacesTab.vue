<template>
<v-container>
    <v-row>
        <v-col cols="12">
            <TeamSpacesManagement
                :lab-id="labId"
                :lab-data="labData"
                :my-labs="myLabs"
                :dep-team-id="depTeamId"
                :dep-team-data="depTeamData"
                :my-dep-teams="myDepTeams"
                :lab-positions="labPositions"
            ></TeamSpacesManagement>
        </v-col>
    </v-row>
</v-container>
</template>

<script>
import TeamSpacesManagement from './TeamSpacesManagement'

export default {
    components: {
        TeamSpacesManagement,
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

}
</script>

<style>

</style>