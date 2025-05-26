<template>
<v-container fluid>
<v-row>

    <v-col cols="12">
        TEXT HERE
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