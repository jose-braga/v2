<template>
    <v-row class="pa-4">
        <v-col cols="12" md="6">
            <Authorization></Authorization>
            <NuclearInformation></NuclearInformation>
        </v-col>
        <v-col cols="12" md="6">
            <Photo></Photo>
            <v-expansion-panels multiple v-model="openPanel">
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h3>Personal Contacts</h3>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <PersonalContacts
                            v-if="openPanel.indexOf(0) !== -1"
                        >
                        </PersonalContacts>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h3>Emergency Contacts</h3>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h3>Identifications</h3>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h3>Cars</h3>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-col>
    </v-row>
</template>

<script>
import Authorization from './Authorization'
import NuclearInformation from './NuclearInformation'
import Photo from './Photo'
const PersonalContacts = () => import('./PersonalContacts')

export default {
    components: {
        Authorization,
        NuclearInformation,
        Photo,
        PersonalContacts,
    },
    data () {
        return {
            openPanel: [],
        }
    }

}
</script>

<style scoped>

</style>
