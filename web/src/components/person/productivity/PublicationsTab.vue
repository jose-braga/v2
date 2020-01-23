<template>
<v-row class="pa-4">
    <v-col cols="12">
        <PublicationsList
                :current-tab="currentTab"
        ></PublicationsList>
    </v-col>
</v-row>
</template>

<script>
import PublicationsList from './publications/PublicationsList'

export default {
    components: {
        PublicationsList
    },
    props: {
        currentTab: String,
    },

}
</script>

<style scoped>

</style>