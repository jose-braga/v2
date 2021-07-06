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
                    <b>Add new space</b>
                </v-col>
                <v-col cols="12" md="9">
                    In the "Spaces" field you can type a few characters to find the
                    space more easily. Fill in the remaining fields and then press
                    "Save".
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Spaces associated to you</b>
                </v-col>
                <v-col cols="12" md="9">
                    The list contains all the space in which you are, or were,
                    associated with. You can change the details of your association
                    with the space by clicking on <v-icon>mdi-pencil</v-icon>. After
                    editing the data for the space press "Update". If you remove all
                    the associations with the space it will no longer appear on the list.
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