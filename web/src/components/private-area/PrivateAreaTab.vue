<template>
<v-container fluid>
<v-row>
    <v-col v-if="hasPermissions && tabId === 0" cols="12">
        <GeneralInfoTab
            :unit-name="unitName"
            :unit-id="unitID"
            :tab-name="tabName"
            :tab-id="tabId"
        ></GeneralInfoTab>
    </v-col>

    <v-col v-if="hasPermissions && tabId !== 0 && !isAdminTab()" cols="12">
        <UsersDocumentsList
            :unit-name="unitName"
            :unit-id="unitID"
            :tab-name="tabName"
            :tab-id="tabId"
        ></UsersDocumentsList>
    </v-col>
    <v-col v-if="isManagerTab()" cols="12">
        <ManagersDocumentsList
            :unit-name="unitName"
            :unit-id="unitID"
            :tab-name="tabName"
            :tab-id="tabId"
        ></ManagersDocumentsList>
    </v-col>
    <v-col v-if="isManagerTab()" cols="12">
        <ManagersDocumentAdd
            :unit-name="unitName"
            :unit-id="unitID"
            :tab-name="tabName"
            :tab-id="tabId"
        ></ManagersDocumentAdd>
    </v-col>
    <v-col v-if="isAdminTab()" cols="12">
        <AdminTab
            :unit-name="unitName"
            :unit-id="unitID"
            :tab-name="tabName"
            :tab-id="tabId"
        ></AdminTab>
        <AdminTabManagement class="mt-4"
            :unit-name="unitName"
            :unit-id="unitID"
            :tab-name="tabName"
            :tab-id="tabId"
        ></AdminTabManagement>
    </v-col>
    <v-col v-if="!hasPermissions">
        <div>You do not have permission to access this section.</div>
    </v-col>
</v-row>
</v-container>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

const UsersDocumentsList = () => import(/* webpackChunkName: "private-area-documents-list" */ './UsersDocumentsList')
const ManagersDocumentsList = () => import(/* webpackChunkName: "private-area-managers-documents-list" */ './ManagersDocumentsList')
const ManagersDocumentAdd = () => import(/* webpackChunkName: "private-area-managers-document-add" */ './ManagersDocumentAdd')
const GeneralInfoTab = () => import(/* webpackChunkName: "private-area-managers-documents-list" */ './GeneralInfoTab')
const AdminTab = () => import(/* webpackChunkName: "private-area-admin" */ './AdminTab')
const AdminTabManagement = () => import(/* webpackChunkName: "private-area-admin-management" */ './AdminTabManagement')

export default {
    components: {
        UsersDocumentsList,
        ManagersDocumentsList,
        ManagersDocumentAdd,
        GeneralInfoTab,
        AdminTab,
        AdminTabManagement,
    },
    props: {
        unitName: String,
        tabName: String,
        tabId: Number,
    },
    data () {
        return {
            hasPermissions: false,
            hasManagement: false,
            unitID: undefined,
        }
    },
    mounted () {
        this.initialize();
    },
    watch: {
        tabName () {
            this.initialize();
        },

        unitID () {
            this.initialize();
        },

    },
    methods: {
        initialize () {
            this.unitID = undefined;
            this.hasPermissions = false;
            this.hasManagement = false;
            if (this.unitName === 'UCIBIO') {
                this.unitID = 1;
            }
            if (this.unitName === 'LAQV') {
                this.unitID = 2;
            }
            let this_session = this.$store.state.session;
            let personID = this_session.personID;
            subUtil.getInfoPopulate(this, 'api/private-areas/' + personID + '/permissions', true, false)
                .then( (result) => {
                    result.forEach(element => {
                        if (element.unit_id === this.unitID
                            && this.tabId === 0
                        ) {
                            this.hasPermissions = true;
                        }
                        if (element.priv_tab_id === this.tabId) {

                            this.hasPermissions = true;
                            if (element.management_permission === 1) {
                                this.hasManagement = true;
                            }
                        }
                    });
                })
        },
        isManagerTab () {
            if (this.hasPermissions && this.hasManagement
                && this.tabId !== 0 && this.tabName !== 'admin'){
                return true;
            }
        },
        isAdminTab () {
            if (this.hasPermissions && this.hasManagement  && this.tabName === 'admin'){
                return true;
            }

        },

    },


}
</script>

<style>

</style>