<template>
<v-row class="pa-4">
    <v-col cols="12">
        <v-row align="center">
            <v-col cols="12" md="2" class="text-md-right">
                Navigate to:
            </v-col>
            <v-divider v-if="$vuetify.breakpoint.mdAndUp" vertical
                class="my-6"></v-divider>
            <v-col cols="12" md="3" lg="2" class="ml-1">
                <v-btn text color="blue darken-2"
                        @click="scroller('#database')">Add from database</v-btn>
                <v-btn text color="blue darken-2"
                        @click="scroller('#orcid')">Add from ORCID</v-btn>
                <v-btn text color="blue darken-2"
                        @click="scroller('#repository')">Add from Repository</v-btn>
            </v-col>
        </v-row>
        <AddFromDatabase id="database"></AddFromDatabase>
        <AddFromOrcid id="orcid" class="mt-6"></AddFromOrcid>
        <AddFromRepository id="repository" class="mt-6"></AddFromRepository>
    </v-col>
</v-row>
</template>

<script>
import AddFromDatabase from './add-publications/AddFromDatabase'
import AddFromOrcid from './add-publications/AddFromOrcid'
import AddFromRepository from './add-publications/AddFromRepository'

export default {
    components: {
        AddFromDatabase,
        AddFromOrcid,
        AddFromRepository
    },
    methods: {
        scroller (element) {
            this.$vuetify.goTo(element)
        }

    },

}
</script>

<style scoped>

</style>