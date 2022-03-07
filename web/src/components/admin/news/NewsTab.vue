<template>
<v-row class="pa-4">
    <v-col>
        <NewsList></NewsList>
    </v-col>
</v-row>

</template>

<script>

const NewsList = () => import(/* webpackChunkName: "admin-news-list" */ './NewsList')

export default {
    components : {
        NewsList,
    }
}
</script>

<style scoped>

</style>