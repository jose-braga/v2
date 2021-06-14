<template>
<v-row class="pa-4">
    <v-col>
        <RecipientGroups></RecipientGroups>
    </v-col>
</v-row>

</template>

<script>

const RecipientGroups = () => import(/* webpackChunkName: "admin-recipient-groups" */ './RecipientGroups')

export default {
    components : {
        RecipientGroups,
    }

}
</script>

<style scoped>

</style>