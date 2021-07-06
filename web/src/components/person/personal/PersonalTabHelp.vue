<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Help for "Personal" Tab</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <v-container>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Data visibility authorization</b>
                </v-col>
                <v-col cols="12" md="9">
                    Select "Authorize" to ensure that part of your data
                    contained in the LAQV/UCIBIO database is
                    visible to your Research Unit website.<br>
                    If you choose "Not Authorized" your data will be removed from
                    the public websites.
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Nuclear Information</b>
                </v-col>
                <v-col cols="12" md="9">
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
            <v-row>
                <v-col cols="12" md="3">
                    <b>Website person photo</b>
                </v-col>
                <v-col cols="12" md="9">
                    Use web-friendly file formats (png, jpeg).<br>
                    After selecting an image a cropper functionality will appear to help
                    you in selecting an area of the image. This area will have
                    the correct aspect ratio for the images used in the websites.
                    <br>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Expansion panels (Short CV, Personal URLs, Personal Contacts, etc)</b>
                </v-col>
                <v-col cols="12" md="9">
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
</template>

<script>
export default {

}
</script>

 <style scoped>

</style>
