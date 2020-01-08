<template>
<v-card class="pa-4">
    <v-form @submit.prevent="submitForm(editedItem)">
        <v-card-title>
            <span class="headline">Data for <b>{{personName}}</b></span>
        </v-card-title>
        <v-tabs v-model="activeTab">
            <v-tab>Personal</v-tab>
            <v-tab>Academic</v-tab>
            <v-tab>Institutional</v-tab>
            <v-tab>Productivity</v-tab>
        </v-tabs>
        <v-tabs-items v-model="activeTab">
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

export default {
    components: {
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
            activeTab: 0,
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