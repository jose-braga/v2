<template>
<v-container>
    <v-row>
        <v-col cols="12">
            <SearchPeople></SearchPeople>
        </v-col>
        <v-col cols="12">
            <UserPreRegistration
                :lab-id="labId"
                :lab-data="labData"
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
        labPositions: Array,
    },
    data() {
        return {
        }
    },
    methods: {
    },
}
</script>

<style scoped>

</style>
