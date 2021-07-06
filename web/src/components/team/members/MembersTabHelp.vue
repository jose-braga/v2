<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Help for "Members" Tab</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <v-container>
            <v-row>
                <h3>
                    This tab contains two sections with similar functionality.<br>
                    The first section shows a table of the current members of the
                    team and their current positions.<br>
                    The second section shows a table of past members
                    and past positions of current members.
                </h3>
            </v-row>
            <v-row class="mt-4">
                <v-col cols="12" md="3">
                    <b>Current members and positions</b>
                </v-col>
                <v-col cols="12" md="9">
                    To get and edit the details of a current member click on
                    <v-icon>mdi-pencil</v-icon>. You will be able to check/correct the
                    data for the current position. <br>
                    If the person is no longer a member of the lab you should
                    simply insert an end date.<br>
                    If the member has a newer position in your lab,
                    press "Add newer position", then you will be required to enter
                    an end date for the present position and to fill the details
                    of the new one.<br>
                    After modifying the data press "Save".
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Past members and positions</b>
                </v-col>
                <v-col cols="12" md="9">
                    As in the previous section you can get and edit the details
                    of a person. The details window will show a list of previous
                    positions associated with her/him. You can change the data of
                    those and you can add other positions.<br>
                    After modifying the data press "Save".
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
