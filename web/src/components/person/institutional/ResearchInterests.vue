<template>
<v-card class="mt-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Research Interests</h3>
        </div>
    </v-card-title>
    <v-card-text class="px-4">
    </v-card-text>
</v-card>
</template>

<script>
export default {
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            departments: [],
            data: {
                researchInterests: [],
            },
            toDelete: [],
        }
    },


}
</script>

<style scoped>

</style>