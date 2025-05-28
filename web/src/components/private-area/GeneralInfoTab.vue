<template>
<v-container fluid>
<v-row>

    <v-col cols="12">
        <h1>Private Documents</h1>
        <p class="mt-8">The Private Documents section provides secure access to documents
            that are shared with restricted groups of users.
        </p>
        <p>Each tab corresponds to a specific UCIBIO governing body
            (e.g., Directive Board, Management Board, Executive Council Lisboa/Porto).</p>

        <p>Only members of a given governing body can view and access the
            documents in their respective tab. Access to documents from other
            governing bodies is not possible.</p>

        <p>This feature ensures that sensitive information is shared only with
             the intended recipients, maintaining confidentiality and
             supporting effective governance.</p>
    </v-col>
</v-row>
</v-container>
</template>

<script>

export default {
    props: {
        unitName: String,
        tabName: String,
        tabId: Number,
    },
    data () {
        return {
            hasPermissions: false,
            hasManagement: false,
        }
    },
    mounted () {
        this.initialize();
    },
    watch: {
        unitName () {
            this.initialize();
        },
        cityName () {
            this.initialize();
        },
        subTabName () {
            this.initialize();
        },

    },
    methods: {
        initialize () {

        }
    },


}
</script>

<style>

</style>