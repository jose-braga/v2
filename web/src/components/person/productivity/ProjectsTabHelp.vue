<template>
<v-carousel height="80vh">
    <v-carousel-item>
        <v-card height="80vh" class="px-12">
            <v-card-title primary-title>
                <h1 class="text-h2">Help for "Projects" Tab</h1>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row class="text-sm-body-1">
                        <v-col cols="12" md="3" class="text-md-right">
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
                    <v-row class="text-sm-body-1">
                        <v-col cols="12" md="3" class="text-md-right">
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
                    <v-row class="text-sm-body-1">
                        <v-col cols="12" md="3" class="text-md-right">
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
    </v-carousel-item>
    <v-carousel-item>
        <v-card height="80vh" class="px-12">
            <v-card-title primary-title>
                <h1 class="text-h2">Search within LAQV/UCIBIO database</h1>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <div class="text-sm-body-1">
                        When you insert a search term it will lookup on the title,
                        acronym and reference fields of projects.
                        <b>Only projects not associated with you are shown.</b>
                        <v-row class="mt-2">
                            <v-col cols="12" offset="0" md="8" offset-md="2" >
                                <v-img
                                    :src="helpImages[0].final_link"
                                ></v-img>
                            </v-col>
                        </v-row>
                    </div>
                    <div class="text-sm-body-1 mt-2">
                        Simply select the projects you are associated with and then
                        press "Add to your projects".
                    </div>
                </v-container>
            </v-card-text>
        </v-card>
    </v-carousel-item>
    <v-carousel-item>
        <v-card height="80vh" class="px-12">
            <v-card-title primary-title>
                <h1 class="text-h2">Add projects from ORCID data</h1>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <div class="text-sm-body-1">
                        <b>First you need to add your ORCID (or repository ID) in
                            "Institutional & Scientific" tab</b>.
                        Also you have to check if in your ORCID profile projects are public.
                        When these conditions are valid, click on "Get from <i>ORCID number</i>":<br>
                        <v-row class="mt-2">
                            <v-col cols="10" offset="2" md="6" offset-md="3" >
                                <v-img
                                    :src="helpImages[0].final_link"
                                ></v-img>
                            </v-col>
                        </v-row>
                    </div>
                    <div class="text-sm-body-1 mt-4">
                        Open the project details by clicking on <v-icon>mdi-file-document-multiple</v-icon>.
                        Information on projects might be from several sources, by clicking
                        on a source you can see its details. Select the most complete source
                        and then click "Add Project". <b>Don't forget to check this project details
                        on your projects list</b>!
                        <v-row class="mt-2">
                            <v-col cols="9" offset="2" md="5" offset-md="3" >
                                <v-img
                                    :src="helpImages[1].final_link"
                                ></v-img>
                            </v-col>
                        </v-row>

                    </div>
                </v-container>
            </v-card-text>
        </v-card>
    </v-carousel-item>
</v-carousel>
</template>

<script>
export default {
    data () {
        return {
            images: [
                {name: 'add_projects_orcid_1.png'},
                {name: 'add_projects_orcid_2s.png'},

            ],
            publicPath: process.env.VUE_APP_REQUEST_ORIGIN,
        }
    },
    computed: {
        helpImages () {
            let helpImages = [];
            for (let ind in this.images) {
                let img = this.images[ind];
                let final_link = this.publicPath + '/images/help/help/productivity/projects/'
                            + this.images[ind].name
                img.final_link = final_link;
                helpImages.push(img);
            }
            return helpImages;

        }
    }

}
</script>

<style>

</style>