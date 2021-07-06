<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Help for "Spaces" Tab</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <v-container>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Spaces used by team</b>
                </v-col>
                <v-col cols="12" md="9">
                    The table shows the spaces occupied by the team. Click on
                    <v-icon>mdi-pencil</v-icon> to get space details. The new window
                    will show a list of teams associated with the space. You can
                    change the details for your team (note: the sum of the % of occupations
                    cannot be larger than 100% for any given time).<br>
                    Press "Update" to save your modifications.
                </v-col>
            </v-row>
        </v-container>
    </v-card-text>
</v-card>
</template>

<script>
export default {

}
</script>

<style scoped>

</style>
