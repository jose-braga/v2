<template>
<v-row class="pa-4">
    <v-col>
        <ProfessionalSituations :other-person-id="otherPersonId"></ProfessionalSituations>
    </v-col>
</v-row>

</template>

<script>

const ProfessionalSituations = () => import(/* webpackChunkName: "person-professional-professional-situations" */ './ProfessionalSituations')

export default {
    components : {
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