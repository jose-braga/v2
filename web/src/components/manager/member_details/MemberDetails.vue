<template>
<v-card class="pa-4">
    <v-form @submit.prevent="submitForm(editedItem)">
        <v-card-title>
            <span class="headline">Data for <b>{{personName}}</b></span>
        </v-card-title>
        <v-tabs v-model="activeTab">
            <v-tab>Permissions</v-tab>
            <v-tab>Personal</v-tab>
            <v-tab>Academic</v-tab>
            <v-tab>Institutional</v-tab>
            <v-tab>Productivity</v-tab>
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
                <v-row>
                    <v-col cols="12" md="6">
                        <NuclearInformation
                            :person-id="personId"
                            :manager-id="managerId"
                            :endpoint="endpoint"
                        ></NuclearInformation>
                    </v-col>
                    <v-col cols="12" md="6">

                    </v-col>
                </v-row>
            </v-tab-item>
            <v-tab-item>Academic</v-tab-item>
            <v-tab-item>Institutional</v-tab-item>
            <v-tab-item>Productivity</v-tab-item>
        </v-tabs-items>
    </v-form>
</v-card>

</template>

<script>

const NuclearInformation = () => import('./personal/NuclearInformation')
const AppAreaPermissions = () => import('./permissions/AppAreaPermissions')
const Permissions = () => import('./permissions/Permissions')

export default {
    components: {
        AppAreaPermissions,
        Permissions,
        NuclearInformation
    },
    props: {
        personId: Number,
        personName: String,
        managerId: Number,
        endpoint: String,
    },
    data () {
        return {
            activeTab: 1,
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
        },
    },

}
</script>

<style scoped>

</style>