<template>
<div>
    <AcademicAffiliations class="ma-4"
        :other-person-id="otherPersonId"
    ></AcademicAffiliations>
    <Degrees
        :other-person-id="otherPersonId"
    ></Degrees>
    <ProfessionalSituations
        :other-person-id="otherPersonId"
    ></ProfessionalSituations>
</div>
</template>

<script>
import Degrees from './Degrees'
const AcademicAffiliations = () => import(/* webpackChunkName: "person-on-behalf-academic-affiliations" */ './AcademicAffiliations')
const ProfessionalSituations = () => import(/* webpackChunkName: "person-on-behalf-professional-professional-situations" */ './ProfessionalSituations')

export default {
    components: {
        AcademicAffiliations,
        Degrees,
        ProfessionalSituations,
    },
    props: {
    },
    computed: {
        otherPersonId() {
            return parseInt(this.$route.params.id, 10);
        },
    },
    data () {
        return {

        }
    },
}
</script>

<style scoped>

</style>
