<template>
<v-row class="pa-4">
    <v-col>
        <ProfessionalSituations></ProfessionalSituations>
    </v-col>
</v-row>

</template>

<script>

const ProfessionalSituations = () => import(/* webpackChunkName: "person-professional-professional-situations" */ './ProfessionalSituations')

export default {
    components : {
        ProfessionalSituations,
    }

}
</script>

<style scoped>

</style>