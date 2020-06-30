<template>
<v-row class="pa-4">
    <v-col>
        <Messages></Messages>
    </v-col>
</v-row>

</template>

<script>

const Messages = () => import(/* webpackChunkName: "admin-messages" */ './Messages')

export default {
    components : {
        Messages,
    }

}
</script>

<style scoped>

</style>