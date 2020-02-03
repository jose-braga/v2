<template>
<v-row class="pa-4">
    <v-col cols="12">
        <v-expansion-panels>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Add from database</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <AddFromDatabase id="database"></AddFromDatabase>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Add from ORCID</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <AddFromOrcid id="orcid" class="mt-6"
                            :current-tab="currentTab"
                    ></AddFromOrcid>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Add from institutional repository</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <AddFromRepository id="repository" class="mt-6"></AddFromRepository>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>



    </v-col>
</v-row>
</template>

<script>
import AddFromDatabase from './add-publications/AddFromDatabase'
import AddFromOrcid from './add-publications/AddFromOrcid'
import AddFromRepository from './add-publications/AddFromRepository'

export default {
    components: {
        AddFromDatabase,
        AddFromOrcid,
        AddFromRepository
    },
    props: {
         currentTab: String,
    },
    methods: {
        scroller (element) {
            this.$vuetify.goTo(element)
        }

    },

}
</script>

<style scoped>

</style>