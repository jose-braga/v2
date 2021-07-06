<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Help for "Add Publications" Tab</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <v-container>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Add from LAQV/UCIBIO database</b>
                </v-col>
                <v-col cols="12" md="9">
                    Some publications might have been added to the database but
                    are not yet associated to you. You can find those publications
                    and claim your association to them.
                    <b>Search results will show only publications that are not
                         associated with you.</b>

                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Add from ORCID</b>
                </v-col>
                <v-col cols="12" md="9">
                    By pressing "Get from dddd-dddd-dddd-dddd" you get a list of
                    the publications that are not part of the database yet.
                    If an item lacks some mandatory information (title, authors,
                    journal/book name) a warning sign appears <v-icon color="red">mdi-alert-circle-outline</v-icon>.
                    You can always edit the publication details before importing
                    it to the database.
                    Beware that imports from ORCID only associates the publication
                    with the current user. Therefore other
                    co-authors that are also members of LAQV or UCIBIO will have to
                    use "Search within LAQV/UCIBIO database".
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Add from institutional repository </b>
                </v-col>
                <v-col cols="12" md="9">
                    Similar to the previous.
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
