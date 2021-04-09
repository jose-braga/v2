<template>
<v-card class="pa-4">
    <v-form @submit.prevent="submitForm(editedItem)">
        <v-card-title>
            <span class="headline">Data for <b>{{personName}}</b> (ID: {{personId}})</span>
        </v-card-title>
        <v-tabs v-model="activeTab">
            <v-tab>Permissions</v-tab>
            <v-tab>User</v-tab>
            <v-tab>Personal</v-tab>
            <v-tab>Academic</v-tab>
            <v-tab>Institutional</v-tab>
            <v-tab>Professional</v-tab>
            <v-tab>Supervisor</v-tab>
            <v-tab>Publications</v-tab>
            <v-tab>Projects</v-tab>
            <v-tab>Spaces</v-tab>
            <v-tab>Other productivity</v-tab>
        </v-tabs>
        <v-tabs-items v-model="activeTab">
            <v-tab-item>
                <AppAreaPermissions
                    :person-id="personId"
                    :manager-id="managerId"
                    :endpoint="endpoint"
                    class="mt-3"
                ></AppAreaPermissions>
                <Permissions
                    :person-id="personId"
                    :manager-id="managerId"
                    :endpoint="endpoint"
                    class="mt-6"
                ></Permissions>
            </v-tab-item>
            <v-tab-item>
                <ManageUser
                    :person-id="personId"
                    :manager-id="managerId"
                    :endpoint="endpoint"
                    class="mt-6"
                ></ManageUser>
            </v-tab-item>
            <v-tab-item>
                <v-row>
                    <v-col cols="12" md="6">
                        <Authorization
                            :person-id="personId"
                            :manager-id="managerId"
                            :endpoint="endpoint"
                        ></Authorization>
                        <NuclearInformation
                            :person-id="personId"
                            :manager-id="managerId"
                            :endpoint="endpoint"
                        ></NuclearInformation>
                        <v-expansion-panels multiple v-model="openPanel">
                            <v-expansion-panel>
                                <v-expansion-panel-header>
                                    <h3>Personal Contacts</h3>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <PersonalContacts
                                        :person-id="personId"
                                        :manager-id="managerId"
                                        :endpoint="endpoint"
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
                                        :person-id="personId"
                                        :manager-id="managerId"
                                        :endpoint="endpoint"
                                    ></EmergencyContacts>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                            <v-expansion-panel>
                                <v-expansion-panel-header>
                                    <h3>Identifications</h3>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <Identifications
                                        :person-id="personId"
                                        :manager-id="managerId"
                                        :endpoint="endpoint"
                                    ></Identifications>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                            <v-expansion-panel>
                                <v-expansion-panel-header>
                                    <h3>Cars (FCT NOVA only)</h3>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <Cars
                                        :person-id="personId"
                                        :person-name="personName"
                                        :manager-id="managerId"
                                        :endpoint="endpoint"
                                    ></Cars>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-col>
                    <v-col cols="12" md="6">
                        <Photo
                            :person-id="personId"
                            :manager-id="managerId"
                            :endpoint="endpoint"
                        ></Photo>
                    </v-col>
                </v-row>
            </v-tab-item>
            <v-tab-item>
                <Degrees
                    :person-id="personId"
                    :manager-id="managerId"
                    :endpoint="endpoint"
                    class="mt-3"
                ></Degrees>
            </v-tab-item>
            <v-tab-item>
                <v-row class="pa-4">
                    <v-col cols="12" md="6">
                        <Roles
                            :person-id="personId"
                            :person-name="personName"
                            :manager-id="managerId"
                            :endpoint="endpoint"
                        ></Roles>
                    </v-col>
                    <v-col cols="12" md="6">
                        <ScientificIdentifications
                            :person-id="personId"
                            :manager-id="managerId"
                            :endpoint="endpoint"
                        ></ScientificIdentifications>
                        <InstitutionalContacts
                            :person-id="personId"
                            :manager-id="managerId"
                            :endpoint="endpoint"
                        ></InstitutionalContacts>
                        <AcademicAffiliations
                            :person-id="personId"
                            :manager-id="managerId"
                            :endpoint="endpoint"
                        ></AcademicAffiliations>
                    </v-col>
                </v-row>
            </v-tab-item>
            <v-tab-item>
                <ProfessionalSituations
                    :person-id="personId"
                    :manager-id="managerId"
                    :endpoint="endpoint"
                    class="mt-6"
                ></ProfessionalSituations>
            </v-tab-item>
            <v-tab-item>
                <SupervisingList
                    :person-id="personId"
                    :manager-id="managerId"
                    :endpoint="endpoint"
                ></SupervisingList>
            </v-tab-item>
            <v-tab-item>
                <v-expansion-panels multiple v-model="openPanel" class="mt-4">
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <h3>Publications list</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <PublicationsList
                                :person-id="personId"
                                :manager-id="managerId"
                                :endpoint="endpoint"
                            ></PublicationsList>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <h3>Add from LAQV/UCIBIO database</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <AddFromDatabase
                                :person-id="personId"
                                :manager-id="managerId"
                                :endpoint="endpoint"
                            ></AddFromDatabase>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <h3>Add from ORCID</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <AddFromOrcid
                                :person-id="personId"
                                :manager-id="managerId"
                                :endpoint="endpoint"
                            ></AddFromOrcid>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <h3>Add from Institutional Repository</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <AddFromRepository
                                :person-id="personId"
                                :manager-id="managerId"
                                :endpoint="endpoint"
                            ></AddFromRepository>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-tab-item>
            <v-tab-item>
                <v-expansion-panels multiple>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <div>
                                <h3 class="headline">Projects with your participation</h3>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <PersonProjects
                                    :person-id="personId"
                                    :manager-id="managerId"
                                    :endpoint="endpoint"
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
                            <ProjectsAddFromDatabase
                                    :person-id="personId"
                                    :manager-id="managerId"
                                    :endpoint="endpoint"
                            ></ProjectsAddFromDatabase>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <div>
                                <h3 class="headline">Add projects from ORCID data</h3>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <ProjectsAddFromOrcid
                                    :person-id="personId"
                                    :manager-id="managerId"
                                    :endpoint="endpoint"
                            ></ProjectsAddFromOrcid>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>

            </v-tab-item>
            <v-tab-item>
                <v-expansion-panels multiple v-model="openPanel" class="mt-4">
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <h3>Spaces associated to user</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <SpacesManagement
                                :other-person-id="personId"
                                :manager-id="managerId"
                                :endpoint="endpoint"
                            ></SpacesManagement>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="isLAQV && isSupervisor">
                        <v-expansion-panel-header>
                            <h3>Spaces associated to supervisor team</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <SupervisorSpaces
                                :supervisor-id="personId"
                                :endpoint="endpoint"
                            >
                            </SupervisorSpaces>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="isUCIBIO && isLabLeader">
                        <v-expansion-panel-header>
                            <h3>Spaces associated to lab</h3>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <LabSpaces v-for="(lab,i) in myLabs"
                                :key="i"
                                :other-person-id="personId"
                                :lab="lab"
                                :endpoint="endpoint"
                            >
                            </LabSpaces>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-tab-item>
            <v-tab-item>
                <OtherProductivityTab
                    :other-person-id="personId"
                    :manager-id="managerId"
                    :endpoint="endpoint"
                    class="mt-6"
                ></OtherProductivityTab>
            </v-tab-item>
        </v-tabs-items>
    </v-form>
</v-card>

</template>

<script>

import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

const AppAreaPermissions = () => import(/* webpackChunkName: "manager-details-app-area-permissions" */ './permissions/AppAreaPermissions')
const Permissions = () => import(/* webpackChunkName: "manager-details-permissions" */ './permissions/Permissions')
const ManageUser = () => import(/* webpackChunkName: "manager-details-user" */ './user/ManageUser')
const Authorization = () => import(/* webpackChunkName: "manager-details-authorization" */ './personal/Authorization')
const NuclearInformation = () => import(/* webpackChunkName: "manager-details-nuclear-information" */ './personal/NuclearInformation')
const Photo = () => import(/* webpackChunkName: "manager-details-photo" */ './personal/Photo')
const PersonalContacts = () => import(/* webpackChunkName: "manager-details-personal-contacts" */ './personal/PersonalContacts')
const EmergencyContacts = () => import(/* webpackChunkName: "manager-details-emergency-contacts" */ './personal/EmergencyContacts')
const Identifications = () => import(/* webpackChunkName: "manager-details-identifications" */ './personal/Identifications')
const Cars = () => import(/* webpackChunkName: "manager-details-cars" */ './personal/Cars')
const Degrees = () => import(/* webpackChunkName: "manager-details-degrees" */ './academic/Degrees')
const Roles = () => import(/* webpackChunkName: "manager-details-roles" */ './institutional/roles/Roles')
const ScientificIdentifications = () => import(/* webpackChunkName: "manager-details-sc-identifications" */ './institutional/Identifications')
const InstitutionalContacts = () => import(/* webpackChunkName: "manager-details-institutional-contacts" */ './institutional/InstitutionalContacts')
const AcademicAffiliations = () => import(/* webpackChunkName: "manager-details-academic-affiliations" */ './institutional/AcademicAffiliations')
const ProfessionalSituations = () => import(/* webpackChunkName: "manager-details-professional-situations" */ './professional/ProfessionalSituations')
const PublicationsList = () => import(/* webpackChunkName: "manager-details-publications-list" */ './productivity/publications/PublicationsList')
const SupervisingList = () => import(/* webpackChunkName: "manager-details-supervising-list" */ './supervisor/SupervisingList')
const SpacesManagement = () => import(/* webpackChunkName: "manager-details-supervising-list" */ './spaces/SpacesManagement')
const LabSpaces = () => import(/* webpackChunkName: "manager-details-lab-spaces" */ './spaces/LabSpaces')
const SupervisorSpaces = () => import(/* webpackChunkName: "manager-details-lab-spaces" */ './spaces/SupervisorSpaces')
const AddFromDatabase = () => import(/* webpackChunkName: "manager-details-add-from-database" */ './productivity/publications/add-publications/AddFromDatabase')
const AddFromOrcid = () => import(/* webpackChunkName: "manager-details-add-from-orcid" */ './productivity/publications/add-publications/AddFromOrcid')
const AddFromRepository = () => import(/* webpackChunkName: "manager-details-add-from-repo" */ './productivity/publications/add-publications/AddFromRepository')
const PersonProjects = () => import(/* webpackChunkName: "manager-details-person-projects" */ './productivity/projects/PersonProjects')
const OtherProductivityTab = () => import(/* webpackChunkName: "manager-details-person-projects" */ './productivity/OtherProductivityTab')
const ProjectsAddFromOrcid = () => import(/* webpackChunkName: "manager-details-projects-orcid" */ './productivity/projects/AddFromOrcid')
const ProjectsAddFromDatabase = () => import(/* webpackChunkName: "manager-details-projects-database" */ './productivity/projects/AddFromDatabase')

export default {
    components: {
        AppAreaPermissions,
        Permissions,
        ManageUser,
        Authorization,
        NuclearInformation,
        Photo,
        PersonalContacts,
        EmergencyContacts,
        Identifications,
        Cars,
        Degrees,
        Roles,
        ScientificIdentifications,
        InstitutionalContacts,
        AcademicAffiliations,
        ProfessionalSituations,
        PublicationsList,
        SupervisingList,
        SpacesManagement,
        LabSpaces,
        SupervisorSpaces,
        AddFromDatabase,
        AddFromOrcid,
        AddFromRepository,
        PersonProjects,
        ProjectsAddFromOrcid,
        ProjectsAddFromDatabase,
        OtherProductivityTab,
    },
    props: {
        personId: Number,
        personName: String,
        managerId: Number,
        endpoint: String,
    },
    data () {
        return {
            activeTab: 2,
            openPanel: [],
            isLAQV: false,
            isSupervisor: false,
            isUCIBIO: false,
            isLabLeader: false, // or a person with team management permissions
            myLabs: [],
        }
    },
    mounted () {
        this.initialize();
    },
    watch: {
        personId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            this.isLAQV = false;
            this.isUCIBIO = false;
            this.isSupervisor = false;
            this.isLabLeader = false;
            this.myLabs = [];
            if (this.$store.state.session.loggedIn) {
                //let this_session = this.$store.state.session;
                let urlSubmit = 'api/v2/supervisors';
                this.$http.get(urlSubmit)
                .then((response) => {
                    let supervisors = response.data.result;
                    for (let ind in supervisors) {
                        if(this.personId === supervisors[ind].id) {
                            this.isSupervisor = true;
                        }
                    }
                    if (this.isSupervisor) {
                        urlSubmit = 'api' + this.endpoint
                                + '/members'
                                + '/' + this.personId
                                + '/lab-affiliations';
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            let currentUnits = [];
                            for (let ind in result) {
                                let valid_from = time.momentToDate(result[ind].valid_from);
                                let valid_until = time.momentToDate(result[ind].valid_until);
                                let now = time.moment().format('YYYY-MM-DD');
                                if ((valid_from === null || valid_from < now)
                                    && (valid_until === null || valid_until > now)
                                ) {
                                    if (this.myLabs.indexOf(result[ind].lab_id) === -1) {
                                        this.myLabs.push(parseInt(result[ind].lab_id, 10));
                                    }
                                    // current lab, get current unit
                                    if (result[ind].lab_position_id === 11 || result[ind].lab_position_id === 2) {
                                        this.isLabLeader = true;
                                    }
                                    for (let indGrp in result[ind].groups) {
                                        for (let indUnit in result[ind].groups[indGrp].units) {
                                            currentUnits.push( result[ind].groups[indGrp].units[indUnit].id);
                                        }
                                    }
                                }
                            }
                            if (currentUnits.length === 1
                                && currentUnits[0] === 2
                            ) {
                                this.isLAQV = true;
                            } else if (currentUnits.length === 1
                                && currentUnits[0] === 1
                            ) {
                                this.isUCIBIO = true;
                            }
                        });
                    }
                })
            }
        },
    },

}
</script>

<style scoped>

</style>