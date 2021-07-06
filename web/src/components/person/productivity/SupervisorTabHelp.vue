<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Help for "Supervisor" Tab</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <v-container>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Add person already in DB</b>
                </v-col>
                <v-col cols="12" md="9">
                    Use this if want to add a person already in the database to the
                    list of people you supervise. The "People" field has a search functionality
                    to help you finding people faster.<br>
                    If the person is not in the database, and if you have access
                    to the "Team" area, you can go to "Pre-register". Otherwise,
                    contact a science manager.
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>People you currently supervise</b>
                </v-col>
                <v-col cols="12" md="9">
                    This section presents a table of all the people that are currently
                    supervised by you.<br>
                    Opening the details of a person, you get his/her affiliations
                    and the list of the supervisors.<br>
                    You can add affiliation entries to the lab you belong to
                    (ask a science manager for changes on other labs).

                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Past supervisions</b>
                </v-col>
                <v-col cols="12" md="9">
                    This section presents a table that you supervised in the past,
                    otherwise it is similar to the previous section.
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
