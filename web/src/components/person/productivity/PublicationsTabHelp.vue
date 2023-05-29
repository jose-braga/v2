<template>
    <v-carousel height="80vh">
        <v-carousel-item>
            <v-card height="80vh" class="px-12">
                <v-card-title primary-title>
                    <h1 class="text-h2">Help on Publications</h1>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <h3>
                            Scientifc publications are central to a researchers profile.
                            Below follows a brief explanation on how publications are
                            handled by the plataform. More details on adding publications
                            are given in the tab "Add Publications".
                        </h3>
                        <div class="text-sm-body-1">
                            The database stores publications and the relations between
                            publications and the following entities: People, Labs and Units.
                            An association of a publication to a person does not necessarily imply
                            an association with a Lab or a Unit (e.g. person X is now a member of UCIBIO,
                            but he has publications from a previous affiliation, so those
                            publications belong to X but not to UCIBIO).
                            <v-row class="mt-2">
                                <v-col cols="8" offset="2" sm="3" offset-sm="4" >
                                    <v-img
                                        :src="helpImages[0].final_link"
                                    ></v-img>
                                </v-col>
                            </v-row>
                        </div>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-carousel-item>
        <v-carousel-item>
            <v-card height="80vh" class="px-12">
                <v-card-title primary-title>
                    <h1 class="text-h2">Help on Publications (cont.)</h1>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <div class="text-sm-body-1">
                            Publications can be added to the database by a plataform
                            user via his/hers ORCID or in bulk
                            by the administrator of the plataform via a script that is
                            run monthly using Web of Science data.<br>

                            When adding from ORCID the publication is only associated to the user
                            (ORCID publication data consists essentially on the bibliographical
                            citation).
                            <v-row class="mt-2">
                                <v-col cols="12" offset="0" sm="6" offset-sm="3" >
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
        <v-carousel-item>
            <v-card height="80vh" class="px-12">
                <v-card-title primary-title>
                    <h1 class="text-h2">Help on Publications (cont.)</h1>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <div class="text-sm-body-1">
                            As information content from WOS is richer, the script is usually
                            able (at least it tries to) to establish associations between
                            each publication and LAQV/UCIBIO authors, labs and Units.<br><br>
                            <b>It is very important that you add your author names into the database
                                for the script to work!
                            </b>
                            <v-row class="mt-2">
                                <v-col cols="12" offset="0" sm="6" offset-sm="3" >
                                    <v-img
                                        :src="helpImages[2].final_link"
                                    ></v-img>
                                </v-col>
                            </v-row>
                        </div>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-carousel-item>
        <v-carousel-item>
            <v-card height="80vh" class="px-12">
                <v-card-title primary-title>
                    <h1 class="text-h2">Help on the "Publications" sub-tab</h1>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row  class="text-sm-body-1">
                            <v-col cols="12" md="3" class="text-md-right">
                                <b>Names used as author of scientifc publications</b>
                            </v-col>
                            <v-col cols="12" md="9">
                                A list of all the variants of citations names used in publications.
                                This helps in matching the publications to their authors.
                                Note that mistakes can happen, as when 2 authors have equal
                                citation names.
                                <b>Ideally author name should be in the form used by WOS (see below):</b>
                                <v-row class="mt-2">
                                    <v-col cols="12" offset="0" md="6" offset-md="3">
                                        <v-img
                                            :src="helpImages[3].final_link"
                                        ></v-img>
                                    </v-col>
                                </v-row>

                            </v-col>
                        </v-row>
                        <v-row  class="text-sm-body-1">
                            <v-col cols="12" md="3" class="text-md-right">
                                <b>Your publications</b>
                            </v-col>
                            <v-col cols="12" md="9">
                                This sections consists of a table of publications that are associated
                                to you. The table is ordered by year and then by title, but if you can
                                change the sort direction and the columns by which you order this list.
                                The table is paginated and in the footer you will find buttons to navigate through pages.
                                <ul>
                                    <li><b>Visible</b> - This person-publication association is visible to the public website.</li>
                                    <li><b>Highlight</b> - This publication is highlighted in your Research Unit website personal profile.</li>
                                    <li><b>Actions</b> - You can remove your association to this publication (this does not delete the publication,
                                    or others people association to it). You can also edit the publication details.
                                    Don't forget to click "Save" after modifying something.</li>
                                </ul>
                            </v-col>
                        </v-row>
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
                {name: 'database_diagram.png'},
                {name: 'orcid_import.png'},
                {name: 'wos_import.png'},
                {name: 'author_names.png'},
            ],
            publicPath: process.env.VUE_APP_REQUEST_ORIGIN,
        }
    },
    computed: {
        helpImages () {
            let helpImages = [];
            for (let ind in this.images) {
                let img = this.images[ind];
                let final_link = this.publicPath + '/images/help/help/productivity/publications/'
                            + this.images[ind].name
                img.final_link = final_link;
                helpImages.push(img);
            }
            return helpImages;

        }
    }

}
</script>

<style scoped>

</style>
