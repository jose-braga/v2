<template>

    <v-carousel height="80vh">
        <v-carousel-item>
            <v-card height="80vh" class="px-12">
                <v-card-title primary-title>
                    <h1 class="text-h2">General help for data management platform</h1>
                </v-card-title>
                <v-img
                    :src="publicPath + '/personal/uppertoolbar.png'"
                    max-width="960px"
                >
                </v-img>
                <v-card-text class="ml-4">
                    <div class="text-sm-body-1">
                        The upper toolbar contains the following buttons:
                    </div>
                    <ul class="text-sm-body-1 mt-4 ml-4">
                        <li class="mt-4">
                            <v-icon size="30">mdi-menu</v-icon>
                            - Show/hide the navigation drawer.
                        </li>
                        <li class="mt-4">
                            <v-icon size="30">mdi-comment-alert-outline</v-icon>
                            - Submit bug reports or suggestions.
                        </li>
                        <li class="mt-4">
                            <v-icon color="green darken" size="30">mdi-login</v-icon>
                            / <v-icon color="red darken" size="30">mdi-logout</v-icon>
                            - Login/Logout buttons.
                        </li>
                        <li class="mt-4">
                            <v-icon size="30">mdi-help</v-icon>
                            - Contextual help (i.e. help contents will depend on current screen).
                        </li>
                    </ul>

                </v-card-text>
            </v-card>
        </v-carousel-item>
        <v-carousel-item>
            <v-card height="80vh" class="px-12">
                <v-card-title primary-title>
                    <h1 class="text-h2">General help for data management platform (cont.)</h1>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="5" sm="3">
                                <v-img class="float-right"
                                    :src="publicPath + '/personal/navigationdrawer.png'"
                                    max-width="200px"
                                >
                                </v-img>
                            </v-col>
                            <v-col cols="7" sm="9">
                                <v-card-text class="ml-4">
                                    <div class="text-sm-body-1">
                                        Use the navigation drawer to access different sections
                                        of the platform provided you have the appropriate permissions.
                                    </div>
                                </v-card-text>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-carousel-item>
        <v-carousel-item>
            <v-card height="80vh" class="px-12">
                <v-card-title primary-title>
                    <h1 class="text-h2">General help for data management platform (cont.)</h1>
                </v-card-title>
                <v-img
                    :src="publicPath + '/personal/tabs.png'"
                    max-width="1200px"
                >
                </v-img>
                <v-card-text class="ml-4">
                    <div class="text-sm-body-1">
                        Each section might be divided into several tabs. In this case:
                    </div>
                    <ul class="text-sm-body-1 mt-4 ml-4">
                        <li class="mt-4">
                            Personal - contains data about the identity of a person.
                        </li>
                        <li class="mt-4">
                            Academic & Professional - data about ongoing or finished academic degrees
                            and about relevant past and current professional situations.
                        </li>
                        <li class="mt-4">
                            Institutional & Scientific - past and present affiliation data
                            (Research Units and Academic Institutions) and several scientific identifiers (ORCID, Ciência ID).
                        </li>
                        <li class="mt-4">
                            Productivity - your publications, projects, communications, etc.
                        </li>
                        <li class="mt-4">
                            Warehouse - only for UCIBIO users with adequate permissions.
                        </li>
                    </ul>

                </v-card-text>
            </v-card>
        </v-carousel-item>
        <v-carousel-item>
            <v-card height="80vh" class="px-12">
                <v-card-title primary-title>
                    <h1 class="text-md-h2">"Personal" tab help</h1>
                </v-card-title>
                <v-card-text class="ml-2">
                    <v-container>
                        <v-row>
                            <v-col cols="12" md="3" class="text-sm-body-1 text-md-right">
                                <b>Data visibility authorization</b>
                            </v-col>
                            <v-col cols="12" md="9" class="text-sm-body-1">
                                Select "Authorize" to ensure that part of your data
                                contained in the LAQV/UCIBIO database is
                                visible to your Research Unit website.<br>
                                If you choose "Not Authorized" your data will be removed from
                                the public websites.
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="3" class="text-sm-body-1 text-md-right">
                                <b>Nuclear Information</b>
                            </v-col>
                            <v-col cols="12" md="9" class="text-sm-body-1">
                                "Colloquial name" will be the name visible in the websites.<br>
                                Please fill in the "Full name" with your complete official name,
                                as this helps in many administrative tasks.<br><br>
                                You can either type a birth date in the form YYYY-MM-DD, or you can use
                                the datepicker that shows up (click on the title of the datepicker
                                to navigate dates by month, and once again to navigate dates by year)
                                <br><br>
                                The nationalities field is a selection field with autocomplete,
                                i.e. you can type a search string to find the country more easily.
                                Also, you can select multiple nationalities, if this applies to you.<br>

                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-carousel-item>
        <v-carousel-item>
            <v-card height="80vh" class="px-12">
                <v-card-title primary-title>
                    <h1 class="text-md-h2">"Personal" tab help (cont.)</h1>
                </v-card-title>
                <v-card-text class="ml-2">
                    <v-container>
                        <v-row>
                            <v-col
                                cols="12" md="3" class="text-sm-body-1 text-md-right">
                                <b>Website person photo</b>
                            </v-col>
                            <v-col cols="12" md="9" class="text-sm-body-1">
                                Use web-friendly file formats (png, jpeg).<br>
                                After selecting an image, a cropper functionality will appear to help
                                you in selecting an area. This area will have
                                the correct aspect ratio for the images used in the websites.
                                <br>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="3" class="text-sm-body-1 text-md-right">
                                <b>Expansion panels (Short CV, Personal URLs, Personal Contacts, etc)</b>
                            </v-col>
                            <v-col cols="12" md="9" class="text-sm-body-1">
                                <ul>
                                    <li>
                                        <b>Short CV</b> - (for LAQV only). Contains the text which appears
                                        on the personal webpage.
                                    </li>
                                    <li>
                                        <b>Personal URLs</b> - you may insert several URLs of different types.
                                        The URL must be complete, including the "http://" or "https://".
                                        The Description is simply a note to yourself to help you remembering
                                        what the URL is.
                                    </li>
                                    <li>
                                        <b>Personal Contacts</b> - Postal code must be in the "dddd" or
                                        "dddd-ddd" format ("d" stands for a decimal algarism)
                                    </li>
                                    <li>
                                        <b>Emergency Contacts</b> - the person to contact in case of an emergency
                                    </li>
                                    <li>
                                        <b>Identifications</b> - used for administrative processes only
                                    </li>
                                    <li>
                                        <b>Cars</b> - this information is used only at FCT NOVA.
                                            You can notify a FCT responsible in case you change your car.
                                    </li>
                                    <li>
                                        <b>Editors of your data</b> - you may define other people who can access
                                        and modify your data. These people (not you!) will find your name in the
                                        "On Behalf" section.
                                    </li>
                                </ul>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-carousel-item>
    </v-carousel>

<!--
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Fields to fill</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <v-container>
            <v-row>
                <v-col cols="12">
                    Depending on the unit you belong to you should fill the following fields:
                    (specific help for this page below)
                </v-col>
                <v-col cols="3"><b>LAQV</b></v-col>
                <v-col cols="3"><b>UCIBIO</b></v-col>
            </v-row>
            <v-row class="mt-1">
                <v-col cols="3">
                    <ul>
                        <li>Data visibility authorization</li>
                        <li>Nuclear Information - Gender</li>
                        <li>Photo</li>
                        <li>Short CV</li>
                        <li>Personal URLs - Personal webpage</li>
                        <li>Personal URLs - CV</li>
                        <li>Degrees</li>
                        <li>Jobs</li>
                        <li>Academic Institutions</li>
                        <li>Workplace</li>
                        <li>CiênciaID</li>
                        <li>ORCID</li>
                        <li>Institutional Contacts</li>
                        <li>Cost Centers</li>
                        <li>Publications</li>
                        <li>Spaces</li>
                    </ul>
                </v-col>
                <v-col cols="3">
                    <ul>
                        <li>Data visibility authorization</li>
                        <li>Nuclear Information - Gender</li>
                        <li>Photo</li>
                        <li>Nationality</li>
                        <li>Personal URLs - Personal webpage</li>
                        <li>Personal URLs - CV</li>
                        <li>Degrees</li>
                        <li>Jobs</li>
                        <li>Academic Institutions</li>
                        <li>Workplace</li>
                        <li>CiênciaID</li>
                        <li>ORCID</li>
                        <li>Research Interests</li>
                        <li>Institutional Contacts</li>
                        <li>Publications</li>
                        <li>Spaces</li>
                    </ul>
                </v-col>
            </v-row>

        </v-container>
    </v-card-text>
-->
</template>

<script>
export default {
    data () {
        return {
            publicPath: process.env.VUE_APP_REQUEST_ORIGIN + '/images/help/help',
        }
    }

}
</script>

 <style scoped>

</style>
