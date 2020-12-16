<template>
<v-row class="pa-4">
    <v-col cols="12">
        <AuthorNames
                :other-person-id="otherPersonId"
                :current-tab="currentTab"
        ></AuthorNames>
    </v-col>
    <v-col cols="12">
        <PublicationsList
                :other-person-id="otherPersonId"
                :current-tab="currentTab"
        ></PublicationsList>
    </v-col>
</v-row>
</template>

<script>
import PublicationsList from './publications/PublicationsList'
import AuthorNames from './publications/AuthorNames'

export default {
    components: {
        PublicationsList,
        AuthorNames,
    },
    props: {
        currentTab: String,
        otherPersonId: Number,
    },

}
</script>

<style scoped>

</style>