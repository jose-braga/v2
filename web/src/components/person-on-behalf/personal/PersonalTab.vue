<template>
  <v-row class="pa-4">
        <v-col cols="12" md="6">
            <NuclearInformation
                :other-person-id="otherPersonId"
                :current-person="currentPerson"
            ></NuclearInformation>
        </v-col>
        <!--
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
            </v-expansion-panels>
        </v-col>
        -->
    </v-row>
</template>

<script>
import NuclearInformation from './NuclearInformation'

export default {
    components: {
        NuclearInformation,
    },
    props: {
        otherPersonId: Number,
        currentPerson: Object,
    },

}
</script>

<style>

</style>