<template>
<v-row class="pa-4">
    <v-col cols="12">
        <PublicationsList></PublicationsList>
    </v-col>
</v-row>
</template>

<script>
import PublicationsList from './publications/PublicationsList'

export default {
    components: {
        PublicationsList
    },

}
</script>

<style scoped>

</style>