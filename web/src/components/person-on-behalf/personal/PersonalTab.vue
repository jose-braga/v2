<template>
  <v-row class="pa-4">
        <v-col cols="12" md="6">
            <NuclearInformation
                :other-person-id="otherPersonId"
                :current-person="currentPerson"
            ></NuclearInformation>
        </v-col>
        <v-col cols="12" md="6">
            <Photo
                :other-person-id="otherPersonId"
                :current-person="currentPerson"
            ></Photo>

            <v-expansion-panels multiple v-model="openPanel">
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h3>Personal Contacts</h3>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <PersonalContacts
                            :other-person-id="otherPersonId"
                            :current-person="currentPerson"
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
                        <EmergencyContacts
                            :other-person-id="otherPersonId"
                            :current-person="currentPerson"
                        ></EmergencyContacts>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h3>Identifications</h3>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <Identifications
                            :other-person-id="otherPersonId"
                            :current-person="currentPerson"
                        ></Identifications>
                    </v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <h3>Cars (FCT NOVA only)</h3>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <Cars
                            :other-person-id="otherPersonId"
                            :current-person="currentPerson"
                        ></Cars>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>

        </v-col>
    </v-row>
</template>

<script>
import NuclearInformation from './NuclearInformation'
import Photo from './Photo'
import PersonalContacts from './PersonalContacts'
import EmergencyContacts from './EmergencyContacts'
import Identifications from './Identifications'
import Cars from './Cars'

export default {
    components: {
        NuclearInformation,
        Photo,
        PersonalContacts,
        EmergencyContacts,
        Identifications,
        Cars,
    },
    props: {
        otherPersonId: Number,
        currentPerson: Object,
    },
    data () {
        return {
            openPanel: [],
        }
    },

}
</script>

<style>

</style>