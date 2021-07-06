<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Help for "Publications" Tab</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <v-container>
            <v-row>
                <h3>
                    Scientifc publications are central to a researchers profile.
                    Below follows a brief explanation on how publications are
                    handled by the plataform. More details on adding publications
                    are given in the tab "Add Publications".
                </h3>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>About Publications</b>
                </v-col>
                <v-col cols="12" md="9">
                    The database stores publications and the relations between
                    publications and the following entities: People, Labs and Units.
                    An association of a publication to a person does not necessarily imply
                    an association with a Lab or a Unit (e.g. person X is now a member of UCIBIO,
                    but he has publications from a previous affiliation, so those
                    publications belong to X but not to UCIBIO).
                    <v-row>
                        <v-col cols="8" offset="2" md="3" offset-md="4" >
                            <v-img
                                :src="helpImages[0].final_link"
                            ></v-img>
                        </v-col>
                    </v-row>

                    Publications can be added to the database by a plataform
                    user via his/hers ORCID or in bulk
                    by the administrator of the plataform via a script that is
                    run monthly using Web of Science data.<br>

                    When adding from ORCID the publication is only associated to the user
                    (ORCID publication data consists essentially on the bibliographical
                    citation).

                    <v-row>
                        <v-col cols="12" offset="0" md="6" offset-md="3">
                            <v-img
                                :src="helpImages[1].final_link"
                            ></v-img>
                        </v-col>
                    </v-row>

                    As information content from WOS is richer, the script is usually
                    able (at least it tries to) to establish associations between
                    each publication and LAQV/UCIBIO authors, labs and Units.
                    <v-row>
                        <v-col cols="12" offset="0" md="6" offset-md="3">
                            <v-img
                                :src="helpImages[2].final_link"
                            ></v-img>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Names used as author of scientifc publications</b>
                </v-col>
                <v-col cols="12" md="9">
                    A list of all the variants of citations names used in publications.
                    This helps in matching the publications to their authors.
                    Note that mistakes can happen, as when 2 authors have equal
                    citation names.
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
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
</template>

<script>
export default {
    data () {
        return {
            images: [
                {name: 'database_diagram.png'},
                {name: 'orcid_import.png'},
                {name: 'wos_import.png'},
            ],
            publicPath: process.env.VUE_APP_REQUEST_ORIGIN,
        }
    },
    computed: {
        helpImages () {
            let helpImages = [];
            for (let ind in this.images) {
                let img = this.images[ind];
                let final_link = this.publicPath + '/images/help/' + this.images[ind].name
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
