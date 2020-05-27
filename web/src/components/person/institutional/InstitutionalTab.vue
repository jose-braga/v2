<template>
    <v-row class="pa-4">
        <v-col cols="12" md="6">
            <Roles></Roles>
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
const InstitutionalContacts = () => import(/* webpackChunkName: "person-academic-institutional-contacts" */ './InstitutionalContacts')
const Roles = () => import(/* webpackChunkName: "person-roles" */ './roles/Roles')

export default {
    components: {
        AcademicAffiliations,
        Identifications,
        InstitutionalContacts,
        Roles,
    }
}
</script>

<style scoped>

</style>