<template>
<v-row class="px-4">
    <v-col cols="12">
        <v-expansion-panels multiple>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Projects with Industry or Other Private Entities</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <IndustryProjects id="person-industry-projects"
                            :current-tab="currentTab"
                    ></IndustryProjects>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Training networks</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <TrainingNetworks id="person-training-networks"
                            :current-tab="currentTab"
                    ></TrainingNetworks>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Startups</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <StartupCompanies id="person-startups"
                            :current-tab="currentTab"
                    ></StartupCompanies>

                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Communications (Oral & Poster)</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <OralCommunications id="person-communications"
                            :current-tab="currentTab"
                    ></OralCommunications>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Organization of meetings, conferences, seminars, workshops</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <OrganizationMeetings id="person-organization-meetings"
                            :current-tab="currentTab"
                    ></OrganizationMeetings>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Scientific Prizes</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <ScientificPrizes id="person-prizes"
                            :current-tab="currentTab"
                    ></ScientificPrizes>

                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Member of Advisory/Regulatory Boards</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <MemberBoards id="person-boards"
                            :current-tab="currentTab"
                    ></MemberBoards>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Patents</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <SubmittedPatents id="person-patents"
                            :current-tab="currentTab"
                    ></SubmittedPatents>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Datasets submitted to repositories</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <DepositDatasets id="person-datasets"
                            :current-tab="currentTab"
                    ></DepositDatasets>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <div>
                        <h3 class="headline">Outreach</h3>
                    </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <ParticipationOutreach id="person-outreach"
                            :current-tab="currentTab"
                    ></ParticipationOutreach>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </v-col>
</v-row>
</template>

<script>
const IndustryProjects = () => import(/* webpackChunkName: "person-industry-projects" */ './other/IndustryProjects')
const TrainingNetworks = () => import(/* webpackChunkName: "person-training-networks" */ './other/TrainingNetworks')
const OralCommunications = () => import(/* webpackChunkName: "person-communications" */ './other/OralCommunications')
const OrganizationMeetings = () => import(/* webpackChunkName: "person-organization-meetings" */ './other/OrganizationMeetings')
const StartupCompanies = () => import(/* webpackChunkName: "person-startups" */ './other/StartupCompanies')
const ScientificPrizes = () => import(/* webpackChunkName: "person-prizes" */ './other/ScientificPrizes')
const MemberBoards = () => import(/* webpackChunkName: "person-boards" */ './other/MemberBoards')
const ParticipationOutreach = () => import(/* webpackChunkName: "person-outreach" */ './other/ParticipationOutreach')
const SubmittedPatents = () => import(/* webpackChunkName: "person-patents" */ './other/SubmittedPatents')
const DepositDatasets = () => import(/* webpackChunkName: "person-datasets" */ './other/DepositDatasets')


export default {
    components: {
        IndustryProjects,
        TrainingNetworks,
        OralCommunications,
        OrganizationMeetings,
        StartupCompanies,
        ScientificPrizes,
        MemberBoards,
        ParticipationOutreach,
        SubmittedPatents,
        DepositDatasets,
    },
    props: {
         currentTab: String,
    },
    methods: {

    },

}
</script>

<style>

</style>