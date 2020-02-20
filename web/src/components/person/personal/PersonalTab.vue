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
                        <EmergencyContacts></EmergencyContacts>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h3>Identifications</h3>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <Identifications></Identifications>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h3>Cars (FCT NOVA only)</h3>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <Cars></Cars>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h3>Editors of your data</h3>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <DataEditors></DataEditors>
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
const EmergencyContacts = () => import('./EmergencyContacts')
const Identifications = () => import('./Identifications')
const Cars = () => import('./Cars')
const DataEditors = () => import('./DataEditors')

export default {
    components: {
        Authorization,
        EmergencyContacts,
        Cars,
        Identifications,
        NuclearInformation,
        Photo,
        PersonalContacts,
        DataEditors,
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
