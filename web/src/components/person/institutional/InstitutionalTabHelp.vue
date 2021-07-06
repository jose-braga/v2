<template>
    <v-card>
        <v-card-title primary-title>
            <div>
                <h3 class="headline">Help for "Institutional & Scientific" Tab</h3>
            </div>
        </v-card-title>
        <v-card-text>
            <v-container>
                <v-row>
                    <v-col cols="12" md="3">
                        <b>Research Units Affiliations</b>
                    </v-col>
                    <v-col cols="12" md="9">
                        <ul>
                            <li><b>Responsibles</b> - Add your current or
                                past responsibles/supervisors within LAQV/UCIBIO.
                                Click "Save" after modifications
                            </li>
                            <li><b>Lab Positions/Facilities/Science Managment/Administrative</b> -
                                Only data managers can change this informations. Please click
                                on "Request Change" to contact them. State what is the change you want to be made
                                and press "Send".
                            </li>
                        </ul>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" md="3">
                        <b>Research Interests (UCIBIO only)</b>
                    </v-col>
                    <v-col cols="12" md="9">
                        Add the keywords (ca. 5) that best describe your scientific work.
                        The "Order" field is an integer that controls the
                        order by which research interests are shown.
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" md="3">
                        <b>Scientific Identifications</b>
                    </v-col>
                    <v-col cols="12" md="9">
                        Ciência ID and ORCID are the most important fields
                        (FCT association key is being phased out).<br>
                        Connection to ORCID is one of the possible ways publications can be
                        added to your profile, you have to insert ORCID here for using this.
                        <br>
                        Repository: If your academic institution has an internal repository
                        for your scientific output (e.g. PURE at NOVA ST) insert it here.<br>
                        NOTE: communication with AUTHENTICUS system is not implemented yet.
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" md="3">
                        <b>Institutional Contacts</b>
                    </v-col>
                    <v-col cols="12" md="9">
                        Please, do not insert your personal mobile phone. This information is
                        shown on the public websites.
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" md="3">
                        <b>Cost Centers (Porto)</b>
                    </v-col>
                    <v-col cols="12" md="9">
                        Add your current or past Cost Centers.
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
