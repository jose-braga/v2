<template>
<v-card class="mb-4">
        <v-card-title primary-title>
            <div>
                <h3 class="headline">Data visibility authorization</h3>
            </div>
        </v-card-title>
        <v-container>
            <v-row align="center">
                <v-col cols="12" class="small-text">
                    <b>In accordance with the General Data Protection Regulation
                        (EU) 2016/679, in force since 25 May, 2018, I have been
                        informed that:</b>
                    <ul class="small-text">
                        <li>All data provided through the platform https://laqv-ucibio.info/
                            can be used to:<br>
                            (1) the internal management of the research team
                            and<br>
                            (2) dissemination of the activities of the institution.<br>
                            For the second purpose, only the Full name, Colloquial name,
                            Photo URL, Academic degrees & academic jobs, Lab and
                            group affiliations within LAQV or UCIBIO, Institutional
                            contacts: Email, Phone and Internal Phone extension,
                            Institutional personal webpage & CV, ORCID, Researcher ID,
                            Ciência ID, and Publications will be used.
                        </li>
                        <li>I have the right to request, at any time, the access to my
                            personal data, as well as the rectification or erasure of
                            data collected for dissemination purposes, by sending an
                            email to josebraga@fct.unl.pt.
                        </li>
                        <li>The Research Units have taken technical and organizational
                            measures necessary to ensure the protection of my personal
                            data;
                        </li>
                        <li>By saying YES, I consent the use of my personal data
                            for the above-mentioned purposes</li>
                    </ul>
                </v-col>
            </v-row>
                <v-row justify="center" align="center"  class="mb-2">
                    <v-switch v-model="data.visible_public"
                        :label="authorizedText"
                        @change="changeAuthorization()"
                        dense
                        hide-details
                    >
                    </v-switch>
                </v-row>
        </v-container>
    </v-card>
</template>

<script>
export default {
    data() {
        return {
            authorizedText: 'Not authorized',
            data: {
                visible_public: false
            },
        }
    },
    methods: {
        changeAuthorization () {
            if (this.data.visible_public) {
                this.authorizedText = 'Authorized';
            } else {
                this.authorizedText = 'Not authorized';
            }
            this.$store.commit('addPersonData', this.data);
        },
    }

}
</script>

<style scoped>
.small-text {
    font-size: 0.75rem;
}
</style>

