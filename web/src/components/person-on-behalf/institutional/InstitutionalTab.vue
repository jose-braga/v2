<template>
    <v-row class="pa-4">
        <v-col cols="12" md="6">
            <Roles :other-person-id="otherPersonId"></Roles>
        </v-col>
        <v-col cols="12" md="6">
            <Identifications :other-person-id="otherPersonId"></Identifications>
            <InstitutionalContacts :other-person-id="otherPersonId"></InstitutionalContacts>
            <AcademicAffiliations :other-person-id="otherPersonId"></AcademicAffiliations>
        </v-col>
    </v-row>
</template>

<script>

const AcademicAffiliations = () => import(/* webpackChunkName: "person-on-behalf-institutional-academic-affiliations" */ './AcademicAffiliations')
const Identifications = () => import(/* webpackChunkName: "person-on-behalf-institutional-identifications" */ './Identifications')
const InstitutionalContacts = () => import(/* webpackChunkName: "person-on-behalf-institutional-institutional-contacts" */ './InstitutionalContacts')
const Roles = () => import(/* webpackChunkName: "person-on-behalf-institutional-roles" */ './roles/Roles')

export default {
    components: {
        AcademicAffiliations,
        Identifications,
        InstitutionalContacts,
        Roles,
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