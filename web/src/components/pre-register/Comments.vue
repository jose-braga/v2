<template>
<v-card class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Additional requests or questions</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container class="px-6">
        <v-textarea
            v-model="data.comments"
            @input="addValue"
            type="password"
            label="Your text here...">
        </v-textarea>

    </v-container>
</v-card>
</template>

<script>
export default {
    data() {
        return {
            data: {
                comments: undefined,
            }
        }
    },
    created() {},
    methods: {
        addValue () {
            this.$store.commit('addPersonData', this.data);
        },
    },

}
</script>

<style scoped>

</style>