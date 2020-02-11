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

const AcademicAffiliations = () => import('./AcademicAffiliations')
const Identifications = () => import('./Identifications')
const InstitutionalContacts = () => import('./InstitutionalContacts')
const Roles = () => import('./roles/Roles')

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