<template>
<v-row class="px-4">
    <v-col cols="12">
        <v-expansion-panels multiple>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Projects with your participation</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <PersonProjects
                            :other-person-id="otherPersonId"
                            :current-tab="currentTab"
                    ></PersonProjects>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Search within LAQV/UCIBIO database</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <AddFromDatabase
                            :other-person-id="otherPersonId"
                            :current-tab="currentTab"
                    ></AddFromDatabase>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Add projects from ORCID data</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <AddFromOrcid
                            :other-person-id="otherPersonId"
                            :current-tab="currentTab"
                    ></AddFromOrcid>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </v-col>
</v-row>
</template>

<script>

const PersonProjects = () => import(/* webpackChunkName: "person-person-projects" */ './projects/PersonProjects')
const AddFromOrcid = () => import(/* webpackChunkName: "person-add-project-from-orcid" */ './projects/AddFromOrcid')
const AddFromDatabase = () => import(/* webpackChunkName: "person-add-project-from-database" */ './projects/AddFromDatabase')

export default {
    components: {
        PersonProjects,
        AddFromOrcid,
        AddFromDatabase,
    },
    props: {
         currentTab: String,
         otherPersonId: Number,
    },
    methods: {

    },

}
</script>

<style>

</style>