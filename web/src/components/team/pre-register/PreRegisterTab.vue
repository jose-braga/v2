<template>
<v-container>
    <v-row>
        <v-col cols="12">
            prereg<!-- <CurrentMembers></CurrentMembers> -->
        </v-col>
    </v-row>
</v-container>
    
</template>

<script>

export default {
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            date_menu: false,
            data: {
                members: [],
            },
        }
    },

    methods: {
          
     },

}
</script>

<style>

</style>
