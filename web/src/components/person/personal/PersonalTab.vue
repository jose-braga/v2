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
                        <h3>Short CV</h3>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <ShortCV></ShortCV>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h3>Personal URLs</h3>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <PersonalURLs
                        >
                        </PersonalURLs>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h3>Personal Contacts</h3>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <PersonalContacts
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
const ShortCV = () => import(/* webpackChunkName: "person-personal-short-cv" */ './ShortCV')
const PersonalURLs = () => import(/* webpackChunkName: "person-personal-personal-urls" */ './PersonalURLs')
const PersonalContacts = () => import(/* webpackChunkName: "person-personal-personal-contacts" */ './PersonalContacts')
const EmergencyContacts = () => import(/* webpackChunkName: "person-personal-emergency-contacts" */ './EmergencyContacts')
const Identifications = () => import(/* webpackChunkName: "person-personal-identifications" */ './Identifications')
const Cars = () => import(/* webpackChunkName: "person-personal-cars" */ './Cars')
const DataEditors = () => import(/* webpackChunkName: "person-personal-data-editors" */ './DataEditors')

export default {
    components: {
        Authorization,
        EmergencyContacts,
        Cars,
        Identifications,
        NuclearInformation,
        Photo,
        ShortCV,
        PersonalURLs,
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
