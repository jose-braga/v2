<template>
<v-container fluid>
    <v-row>
        <v-col cols="12" md="6">
            <SearchPeople
                :lab-id="labId"
                :lab-data="labData"
                :my-labs="myLabs"
                :dep-team-id="depTeamId"
                :dep-team-data="depTeamData"
                :my-dep-teams="myDepTeams"
                :lab-positions="labPositions"
            ></SearchPeople>
        </v-col>
        <v-col cols="12" md="6">
            <!-- Add tabs for facilities/science management/administrative -->
            <UserPreRegistration
                :lab-id="labId"
                :lab-data="labData"
                :my-labs="myLabs"
                :dep-team-id="depTeamId"
                :dep-team-data="depTeamData"
                :my-dep-teams="myDepTeams"
                :lab-positions="labPositions"
            ></UserPreRegistration>
        </v-col>
    </v-row>
</v-container>

</template>

<script>

import SearchPeople from './SearchPeople'
import UserPreRegistration from './UserPreRegistration'

export default {
    components: {
        SearchPeople,
        UserPreRegistration
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
    data() {
        return {
        }
    },
    watch: {
    },

    methods: {
    },
}
</script>

<style scoped>

</style>
