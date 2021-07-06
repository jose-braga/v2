<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Help for "Projects" Tab</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <v-container>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Projects with your participation</b>
                </v-col>
                <v-col cols="12" md="9">
                    The table presents a list of your projects, initially sorted by end date
                    (then by start date and title). You can change the columns
                    in which the sort is performed.<br>
                    You can get and edit the project details. You can associate
                    a project with other people and with labs.
                    After modifying the project data press "Save".
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Search within LAQV/UCIBIO database</b>
                </v-col>
                <v-col cols="12" md="9">
                    Search projects by typing text (more than 3 characters).
                    The search will look up the title, acronym and reference of the
                    project.
                    Select the projects that are going to be associated to you and then press
                    "Add to your projects".
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Add projects from ORCID data</b>
                </v-col>
                <v-col cols="12" md="9">
                    After connecting to ORCID, only the list of <b>projects that
                    are not part of the database</b> is shown.<br>
                    To add the project, open its details. At ORCID, projects
                    might have data coming from multiple sources, please choose
                    the source which has better data and then you can add the project
                    to the database.
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

<style>

</style>