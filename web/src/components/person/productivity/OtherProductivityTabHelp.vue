<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Help for "Other" Tab</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <v-container>
            <v-row>
                <h3>
                    In this tab you are presented with a wide variety of topics
                    in which scientists might be involved. However, the procedure
                    for adding, editing or removing information in each of them
                    is similar, so we will present the standard procedure for the
                    "Projects with Industry or Other Private Entities".
                </h3>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Projects with Industry or Other Private Entities</b>
                </v-col>
                <v-col cols="12" md="9">
                    The table presents a list of your projects with industry, initially sorted by end date
                    (then by start date and title). You can change the columns
                    in which the sort is performed.<br>
                    You can get and edit the project details. You can associate
                    a project with other people and with labs.
                    After modifying the project data press "Save".<br>

                    To associate to a project that already exists in the database,
                    you have to find the project by typing a few characters. From the list
                    that is shown, select the projects you want to associate with,
                    then press "Add to your projects".<br>

                    Before adding a new project please check if it is already
                    in the database (see previous paragraph). To add a project,
                    press the "Add new project" button, and fill the details. Press
                    "Save" in the end.

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