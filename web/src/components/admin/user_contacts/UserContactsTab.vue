<template>
<v-row class="pa-4">
    <v-col cols="12">
        <PendingBugs></PendingBugs>
    </v-col>
    <v-col cols="12">
        <SolvedBugs></SolvedBugs>
    </v-col>
    <v-col cols="12">
        <SuggestionsList></SuggestionsList>
    </v-col>
</v-row>

</template>

<script>
const PendingBugs = () => import(/* webpackChunkName: "admin-pending-bugs" */ './PendingBugs')
const SolvedBugs = () => import(/* webpackChunkName: "admin-solved-bugs" */ './SolvedBugs')
const SuggestionsList = () => import(/* webpackChunkName: "admin-solved-bugs" */ './SuggestionsList')

export default {
    components : {
        PendingBugs,
        SolvedBugs,
        SuggestionsList,
    }
}
</script>

<style>

</style>