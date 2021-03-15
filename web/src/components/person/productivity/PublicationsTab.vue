<template>
<v-row class="px-4">
    <v-col cols="12">
        <AuthorNames
                :current-tab="currentTab"
        ></AuthorNames>
    </v-col>
    <v-col cols="12">
        <PublicationsList
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
    },

}
</script>

<style scoped>

</style>