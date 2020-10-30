<template>
    <v-row class="pa-4">
        <v-col cols="12" md="6">
            <Roles></Roles>
            <ResearchInterests v-if="isUCIBIO"></ResearchInterests>
        </v-col>
        <v-col cols="12" md="6">
            <Identifications></Identifications>
            <InstitutionalContacts></InstitutionalContacts>
            <AcademicAffiliations></AcademicAffiliations>
        </v-col>
    </v-row>
</template>

<script>

const AcademicAffiliations = () => import(/* webpackChunkName: "person-academic-affiliations" */ './AcademicAffiliations')
const Identifications = () => import(/* webpackChunkName: "person-identifications" */ './Identifications')
const ResearchInterests = () => import(/* webpackChunkName: "person-research-interests" */ './ResearchInterests')
const InstitutionalContacts = () => import(/* webpackChunkName: "person-academic-institutional-contacts" */ './InstitutionalContacts')
const Roles = () => import(/* webpackChunkName: "person-roles" */ './roles/Roles')

export default {
    components: {
        AcademicAffiliations,
        Identifications,
        InstitutionalContacts,
        Roles,
        ResearchInterests,
    },
    data() {
        return {
            isUCIBIO: false,
            isLAQV: false
        }
    },
    created () {
        this.checkUnits();
    },
    methods: {
        checkUnits() {
            let currentUnits = this.$store.state.session.currentUnits;
            if (currentUnits.indexOf(1) !== -1) this.isUCIBIO = true;
            if (currentUnits.indexOf(2) !== -1) this.isLAQV = true;

        }
    }
}
</script>

<style scoped>

</style>