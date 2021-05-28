<template>
<v-container>
    <v-row>
        <v-col cols="12">
            <SpacesList
            ></SpacesList>
        </v-col>
    </v-row>
</v-container>
</template>

<script>

const SpacesList = () => import(/* webpackChunkName: "manager-spaces-list" */ './SpacesList')

export default {
    components: {
        SpacesList,
    },
    props: {
    },
}
</script>

<style>

</style>