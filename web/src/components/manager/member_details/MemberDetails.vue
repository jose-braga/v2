<template>
<v-card>
    <v-form @submit.prevent="submitForm(editedItem)">
        <v-card-title>
            <span class="headline">Teste</span>
        </v-card-title>
    </v-form>
</v-card>
  
</template>

<script>
export default {
    components: {
    },
    props: {
        personId: Number,
    },
    mounted () {
        this.initialize();
    },
    watch: {
        personId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            console.log(this.personId)
        },

    },

}
</script>

<style scoped>

</style>