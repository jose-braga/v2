<template>
<div>a
    <v-dialog v-model="showHelp" content-class="help">
        <router-view name="help"></router-view>
    </v-dialog>
</div>
</template>

<script>
export default {

    computed: {
        showHelp: {
            get() {
                return this.$store.state.navigation.showHelp;
            },
            set(state) {
                if (state !== this.$store.state.navigation.showHelp) {
                    this.$store.dispatch('showHelp')
                }
            }

        },
    },

}
</script>

<style>

</style>