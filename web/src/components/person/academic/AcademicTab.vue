<template>
    <v-row class="pa-4">
        <v-col cols="12">
            <AcademicAffiliations></AcademicAffiliations>
        </v-col>
        <v-col cols="12">
            <Degrees></Degrees>
        </v-col>
        <v-col cols="12">
            <ProfessionalSituations></ProfessionalSituations>
        </v-col>
    </v-row>
</template>

<script>
import Degrees from './Degrees'
const AcademicAffiliations = () => import(/* webpackChunkName: "person-academic-affiliations" */ './AcademicAffiliations')
const ProfessionalSituations = () => import(/* webpackChunkName: "person-professional-professional-situations" */ './ProfessionalSituations')

export default {
    components: {
        AcademicAffiliations,
        Degrees,
        ProfessionalSituations,
    }

}
</script>

<style scoped>

</style>
