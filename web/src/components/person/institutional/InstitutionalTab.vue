<template>
    <v-row class="pa-4">
        <v-col cols="12" md="6">
            <Roles></Roles>
        </v-col>
        <v-col cols="12" md="6">
            <InstitutionalContacts></InstitutionalContacts>
            <AcademicAffiliations></AcademicAffiliations>
        </v-col>
    </v-row>
</template>

<script>

const InstitutionalContacts = () => import('./InstitutionalContacts')
const AcademicAffiliations = () => import('./AcademicAffiliations')
const Roles = () => import('./roles/Roles')

export default {
    components: {
        InstitutionalContacts,
        AcademicAffiliations,
        Roles,
    }
}
</script>

<style scoped>

</style>