<template>
<v-carousel height="80vh">
    <v-carousel-item>
        <v-card height="80vh" class="px-12">
            <v-card-title>
                <span class="text-h2">Help for "Pre-Register" Tab</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row class="text-sm-body-1 mt-4">
                        <v-col cols="12" md="3" class="text-md-right">
                            <b>Search person in database</b>
                        </v-col>
                        <v-col cols="12" md="9">
                            To avoid registering duplicates of people already in the
                            database please use the search (results show up after
                             more than 3 characters are introduced).
                        </v-col>
                    </v-row>
                    <v-row class="text-sm-body-1">
                        <v-col cols="12" md="3" class="text-md-right">
                            <b>Pre-register new member</b>
                        </v-col>
                        <v-col cols="12" md="9">
                            Fill in the required fields. This is the only input that is
                            needed from the Lab/Team Leader. After pressing "Pre-register" the following
                            sequence of events occur:
                            <ol>
                                <li>the new person will receive immediately an email with
                                    a link to a form (if she didn't, please ask her to check
                                    the Spam folder);
                                </li>
                                <li>The new person submits
                                    the registration form and Science Management is warned that
                                    a registration awaits approval;
                                </li>
                                <li>a member of the Science Management Office may make a
                                    few corrections to the form and then validates the registration.
                                </li>
                            </ol>
                            <br> Only after successful validation will a new member appear
                                in the plataform (also do not forget that <b>to appear in the
                                website the member must also authorize the communication
                                between the platform and the websites</b>).
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
    </v-carousel-item>
    <!--
    <v-carousel-item>
        <v-card height="80vh" class="px-12">
            <v-card-title primary-title>
                <h1 class="text-h2">Your team publications</h1>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <div class="text-sm-body-1">
                        For each publication you can:
                        <ol>
                            <li>Tag as visible in the Research Unit website,</li>
                            <li>Tag as as publication to be highlighted,</li>
                            <li>Remove association of publication from your lab by clicking
                                on the <v-icon color="green darken-1">mdi-link</v-icon> icon.
                                That publication is marked as unlinked
                                <v-icon color="red darken-1">mdi-link-off</v-icon>.
                            </li>
                        </ol>
                        <b>Changes are only effective when you press Update!</b>
                        <v-row class="mt-2">
                            <v-col cols="12" offset="0" md="8" offset-md="2" >
                                <v-img
                                    :src="helpImages[0].final_link"
                                ></v-img>
                            </v-col>
                        </v-row>
                        <div class="text-sm-body-1 mt-4">
                            If you want to seach for a particular publication you can
                            use the search field above the table.
                        </div>

                    </div>
                </v-container>
            </v-card-text>
        </v-card>
    </v-carousel-item>
    -->
</v-carousel>
</template>

<script>
export default {
    data () {
        return {
            images: [
                //{name: 'publications_management_1.png'},
                //{name: 'team_members_publications.png'},

            ],
            publicPath: process.env.VUE_APP_REQUEST_ORIGIN,
        }
    },
    computed: {
        helpImages () {
            let helpImages = [];
            for (let ind in this.images) {
                let img = this.images[ind];
                let final_link = this.publicPath + '/images/help/help/team/'
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
