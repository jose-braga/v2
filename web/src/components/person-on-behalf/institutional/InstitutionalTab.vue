<template>
    <v-row class="pa-4">
        <v-col cols="12" md="6">
            <Roles :other-person-id="otherPersonId"></Roles>
            <ResearchInterests :other-person-id="otherPersonId"></ResearchInterests>
        </v-col>
        <v-col cols="12" md="6">
            <Identifications :other-person-id="otherPersonId"></Identifications>
            <InstitutionalContacts :other-person-id="otherPersonId"></InstitutionalContacts>
            <CostCenters :other-person-id="otherPersonId"></CostCenters>
        </v-col>
    </v-row>
</template>

<script>

//const AcademicAffiliations = () => import(/* webpackChunkName: "person-on-behalf-institutional-academic-affiliations" */ './AcademicAffiliations')
const Identifications = () => import(/* webpackChunkName: "person-on-behalf-institutional-identifications" */ './Identifications')
const InstitutionalContacts = () => import(/* webpackChunkName: "person-on-behalf-institutional-institutional-contacts" */ './InstitutionalContacts')
const Roles = () => import(/* webpackChunkName: "person-on-behalf-institutional-roles" */ './roles/Roles')
const ResearchInterests = () => import(/* webpackChunkName: "person-on-behalf-research-interests" */ './ResearchInterests')
const CostCenters = () => import(/* webpackChunkName: "person-on-behalf-cost-centers" */ './CostCenters')

export default {
    components: {
        //AcademicAffiliations,
        Identifications,
        InstitutionalContacts,
        Roles,
        ResearchInterests,
        CostCenters,
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