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
                    <IndustryProjects id="manager-person-industry-projects"
                            :other-person-id="otherPersonId"
                            :manager-id="managerId"
                            :endpoint="endpoint"
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
                    <TrainingNetworks id="manager-person-training-networks"
                            :manager-id="managerId"
                    :endpoint="endpoint"
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
                    <StartupCompanies id="manager-person-startups"
                            :manager-id="managerId"
                            :endpoint="endpoint"
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
                    <OralCommunications id="manager-person-communications"
                            :manager-id="managerId"
                            :endpoint="endpoint"
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
                    <OrganizationMeetings id="manager-person-organization-meetings"
                            :manager-id="managerId"
                            :endpoint="endpoint"
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
                    <ScientificPrizes id="manager-person-prizes"
                            :manager-id="managerId"
                            :endpoint="endpoint"
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
                    <MemberBoards id="manager-person-boards"
                            :manager-id="managerId"
                            :endpoint="endpoint"
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
                    <SubmittedPatents id="manager-person-patents"
                            :manager-id="managerId"
                            :endpoint="endpoint"
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
                    <DepositDatasets id="manager-person-datasets"
                            :manager-id="managerId"
                            :endpoint="endpoint"
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
                    <ParticipationOutreach id="manager-person-outreach"
                            :manager-id="managerId"
                            :endpoint="endpoint"
                            :other-person-id="otherPersonId"
                    ></ParticipationOutreach>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </v-col>
</v-row>
</template>

<script>
const IndustryProjects = () => import(/* webpackChunkName: "manager-industry-projects" */ './other/IndustryProjects')
const TrainingNetworks = () => import(/* webpackChunkName: "manager-training-networks" */ './other/TrainingNetworks')
const OralCommunications = () => import(/* webpackChunkName: "manager-communications" */ './other/OralCommunications')
const OrganizationMeetings = () => import(/* webpackChunkName: "other-person-organization-meetings" */ './other/OrganizationMeetings')
const StartupCompanies = () => import(/* webpackChunkName: "manager-startups" */ './other/StartupCompanies')
const ScientificPrizes = () => import(/* webpackChunkName: "manager-prizes" */ './other/ScientificPrizes')
const MemberBoards = () => import(/* webpackChunkName: "manager-boards" */ './other/MemberBoards')
const ParticipationOutreach = () => import(/* webpackChunkName: "manager-outreach" */ './other/ParticipationOutreach')
const SubmittedPatents = () => import(/* webpackChunkName: "manager-patents" */ './other/SubmittedPatents')
const DepositDatasets = () => import(/* webpackChunkName: "manager-datasets" */ './other/DepositDatasets')

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
        otherPersonId: Number,
        managerId: Number,
        endpoint: String,
    },
    methods: {

    },

}
</script>

<style>

</style>