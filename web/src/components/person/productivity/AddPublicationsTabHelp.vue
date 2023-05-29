<template>
<v-carousel height="80vh">
    <v-carousel-item>
        <v-card height="80vh" class="px-12">
            <v-card-title primary-title>
                <h1 class="text-h2">Help on "Add Publications"</h1>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row class="text-sm-body-1">
                        <v-col cols="12" md="3" class="text-md-right">
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
                    <v-row class="text-sm-body-1">
                        <v-col cols="12" md="3" class="text-md-right">
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
                    <v-row class="text-sm-body-1">
                        <v-col cols="12" md="3" class="text-md-right">
                            <b>Add from institutional repository </b>
                        </v-col>
                        <v-col cols="12" md="9">
                            Similar to the previous.
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
    </v-carousel-item>
    <v-carousel-item>
        <v-card height="80vh" class="px-12">
            <v-card-title primary-title>
                <h1 class="text-h2">Add from LAQV/UCIBIO database</h1>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <div class="text-sm-body-1">
                        You can search publications by author names and by their title
                        (if you fill both fields the publications shown obey both conditions):
                        <v-row class="mt-2">
                            <v-col cols="12" offset="0" md="8" offset-md="2" >
                                <v-img
                                    :src="helpImages[0].final_link"
                                ></v-img>
                            </v-col>
                        </v-row>
                    </div>
                    <div class="text-sm-body-1 mt-2">
                        Then you can select the publications that should belong to your profile,
                        by clicking the "To Add" column. Press "Add to your publications" in the end.
                        <v-row class="mt-2">
                            <v-col cols="12" offset="0" md="8" offset-md="2" >
                                <v-img
                                    :src="helpImages[1].final_link"
                                ></v-img>
                            </v-col>
                        </v-row>
                    </div>
                    <div class="text-sm-body-1 mt-2">
                        Before adding a publication you can correct its details by
                        clicking the <v-icon>mdi-pencil</v-icon> icon.
                    </div>
                </v-container>
            </v-card-text>
        </v-card>
    </v-carousel-item>
    <v-carousel-item>
        <v-card height="80vh" class="px-12">
            <v-card-title primary-title>
                <h1 class="text-h2">Add from ORCID/Repository</h1>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <div class="text-sm-body-1">
                        <b>First you need to add your ORCID (or repository ID) in
                            "Institutional & Scientific" tab</b>.
                        Also you have to check if in your ORCID profile publications are public.
                        when these conditions are valid, click on "Get from <i>ORCID number</i>".<br>
                        This may take a while but eventually you will get a list of publications:
                        <v-row class="mt-2">
                            <v-col cols="12" offset="0" md="6" offset-md="3" lg="6" offset-lg="3">
                                <v-img
                                    :src="helpImages[2].final_link"
                                ></v-img>
                            </v-col>
                        </v-row>
                    </div>
                    <div class="text-sm-body-1 mt-2">
                        One of the publications is tagged with
                        <v-icon color="red">mdi-alert-circle-outline</v-icon>,
                        which means that the publication is missing either
                        the authors, title or journal name. You may correct these
                        by opening the publications details (<v-icon>mdi-pencil</v-icon>).
                        <b>Before adding a publication check the journal name on the details</b>.
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
                {name: 'search_within_database_1.png'},
                {name: 'search_within_database_2.png'},
                {name: 'add_from_orcid_1.png'},

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
