<template>
<v-card class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Scientifc Identifications</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container class="px-6">
        <v-row>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.researcherIDs.ciencia_id"
                    @input="addValue"
                    label="Ciência ID">
                </v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.researcherIDs.association_key"
                    @input="addValue"
                    label="FCT MCTES association key">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.researcherIDs.ORCID"
                    @input="addValue"
                    label="ORCID">
                </v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.researcherIDs.scopusID"
                    @input="addValue"
                    label="Scopus ID">
                </v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.researcherIDs.researcherID"
                    @input="addValue"
                    label="Researcher ID">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="4">
                <v-select
                    v-model="data.researcherIDs.institutional_repository_id"
                    :items="institutionalRepositories" item-value="id" item-text="name"
                    @input="addValue"
                    label="Repository">
                </v-select>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="data.researcherIDs.pure_id"
                    @input="addValue"
                    label="ID in repository">
                </v-text-field>
            </v-col>
        </v-row>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    data() {
        return {
            institutionalRepositories: [],
            data: {
                researcherIDs: {}
            },
        }
    },
    created () {
        this.getRepositories();
    },
    methods: {
        addValue () {
            this.$store.commit('addPersonData', this.data);
        },
        getRepositories () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'institutional-repositories';
                return subUtil.getPublicInfo(vm, urlSubmit, 'institutionalRepositories');
            }
        },

    },

}
</script>

<style>

</style>