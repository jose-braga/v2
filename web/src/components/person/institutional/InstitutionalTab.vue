<template>
    <v-row class="pa-4">
        <v-col cols="12" md="6">
            <InstitutionalContacts></InstitutionalContacts>
        </v-col>
    </v-row>
</template>

<script>

const InstitutionalContacts = () => import('./InstitutionalContacts')

export default {
    components: {
        InstitutionalContacts,
    }

}
</script>

<style scoped>

</style>