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
                    <IndustryProjects id="other-person-industry-projects"
                            :other-person-id="otherPersonId"
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
                    <TrainingNetworks id="other-person-training-networks"
                            :current-tab="currentTab"
                            :other-person-id="otherPersonId"
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
                    <StartupCompanies id="other-person-startups"
                            :current-tab="currentTab"
                            :other-person-id="otherPersonId"
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
                    <OralCommunications id="other-person-communications"
                            :current-tab="currentTab"
                            :other-person-id="otherPersonId"
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
                    <OrganizationMeetings id="other-person-organization-meetings"
                            :current-tab="currentTab"
                            :other-person-id="otherPersonId"
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
                    <ScientificPrizes id="other-person-prizes"
                            :current-tab="currentTab"
                            :other-person-id="otherPersonId"
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
                    <MemberBoards id="other-person-boards"
                            :current-tab="currentTab"
                            :other-person-id="otherPersonId"
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
                    <SubmittedPatents id="other-person-patents"
                            :current-tab="currentTab"
                            :other-person-id="otherPersonId"
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
                    <DepositDatasets id="other-person-datasets"
                            :current-tab="currentTab"
                            :other-person-id="otherPersonId"
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
                    <ParticipationOutreach id="other-person-outreach"
                            :current-tab="currentTab"
                            :other-person-id="otherPersonId"
                    ></ParticipationOutreach>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </v-col>
</v-row>
</template>

<script>
const IndustryProjects = () => import(/* webpackChunkName: "other-person-industry-projects" */ './other/IndustryProjects')
const TrainingNetworks = () => import(/* webpackChunkName: "other-person-training-networks" */ './other/TrainingNetworks')
const OralCommunications = () => import(/* webpackChunkName: "other-person-communications" */ './other/OralCommunications')
const OrganizationMeetings = () => import(/* webpackChunkName: "other-person-organization-meetings" */ './other/OrganizationMeetings')
const StartupCompanies = () => import(/* webpackChunkName: "other-person-startups" */ './other/StartupCompanies')
const ScientificPrizes = () => import(/* webpackChunkName: "other-person-prizes" */ './other/ScientificPrizes')
const MemberBoards = () => import(/* webpackChunkName: "other-person-boards" */ './other/MemberBoards')
const ParticipationOutreach = () => import(/* webpackChunkName: "other-person-outreach" */ './other/ParticipationOutreach')
const SubmittedPatents = () => import(/* webpackChunkName: "other-person-patents" */ './other/SubmittedPatents')
const DepositDatasets = () => import(/* webpackChunkName: "other-person-datasets" */ './other/DepositDatasets')


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
        otherPersonId: Number,
    },
    methods: {

    },

}
</script>

<style>

</style>