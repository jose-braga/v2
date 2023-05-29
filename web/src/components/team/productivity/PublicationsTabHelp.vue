<template>
<v-carousel height="80vh">
    <v-carousel-item>
        <v-card height="80vh" class="px-12">
            <v-card-title>
                <span class="text-h2">Help for "Publications" Tab</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row class="text-sm-body-1 mt-4">
                        <v-col cols="12" md="3" class="text-md-right">
                            <b>Your team publications</b>
                        </v-col>
                        <v-col cols="12" md="9">
                            This table contains a list of publications associated to your lab.<br>
                            For each publication you control if it is visible and highlighted in
                            the website Lab page (note that this is specific to the lab
                            and is independent from what was defined at the "Person" level). <br>
                            If author names of you and your team members are kept up-to-date,
                            an import script that runs monthly (based on WOS data) will update
                            your lab publications with minimal effort from you.
                        </v-col>
                    </v-row>
                    <v-row class="text-sm-body-1">
                        <v-col cols="12" md="3" class="text-md-right">
                            <b>Publications from team members</b>
                        </v-col>
                        <v-col cols="12" md="9">
                            This table contains all the publications from your team members
                            (<b>present or past</b>) that are not yet part of your
                            lab publications.<br> Note that there are a few situations in which
                            <b>some publications in this list are not really publications
                            of your lab</b>: (i) a member that published before entering your lab,
                            (ii) publications from a past member of your group
                            that is now in another group at LAQV/UCIBIO.<br>
                            Simply select the ones which should be part
                            of your lab publications and then click "Associate to Lab".
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
    </v-carousel-item>
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
    <v-carousel-item>
        <v-card height="80vh" class="px-12">
            <v-card-title primary-title>
                <h1 class="text-h2">Publications from team members</h1>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <div class="text-sm-body-1">
                        For this section simply select the publications that should be
                        associated with your lab, clicking the checkbox on the left:
                        <v-row class="mt-2">
                            <v-col cols="12" offset="0" md="10" offset-md="1" >
                                <v-img
                                    :src="helpImages[1].final_link"
                                ></v-img>
                            </v-col>
                        </v-row>
                    </div>
                    <div class="text-sm-body-1 mt-4">
                        <b>Choices only become effective when you press "Associate to Lab"</b>.
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
                {name: 'publications_management_1.png'},
                {name: 'team_members_publications.png'},

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
