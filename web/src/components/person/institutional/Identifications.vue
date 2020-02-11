<template>
<v-card class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Scientific Identifications</h3>
        </div>
    </v-card-title>
    <v-container>
        <v-form ref="form"
                @submit.prevent="submitForm">
            <v-row class="px-2">
                <v-col cols="12" sm="4">
                    <v-text-field
                        v-model="data.researcherIDs.ciencia_id"
                        label="Ciência ID">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-text-field
                        v-model="data.researcherIDs.association_key"
                        label="FCT MCTES association key">
                    </v-text-field>
                </v-col>
            </v-row>
            <v-row class="px-2">
                <v-col cols="12" sm="4">
                    <v-text-field
                        v-model="data.researcherIDs.ORCID"
                        label="ORCID">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-text-field
                        v-model="data.researcherIDs.scopusID"
                        label="Scopus ID">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-text-field
                        v-model="data.researcherIDs.researcherID"
                        label="Researcher ID">
                    </v-text-field>
                </v-col>
            </v-row>
            <v-row class="px-2">
                <v-col cols="12" sm="4">
                    <v-select
                            v-model="data.researcherIDs.institutional_repository_id"
                            :items="institutionalRepositories" item-value="id" item-text="name"
                            label="Repository">
                        </v-select>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-text-field
                        v-model="data.researcherIDs.pure_id"
                        label="ID in repository">
                    </v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-row align-content="center" justify="end">
                    <div>
                        <v-btn type="submit"
                            outlined color="blue">Update</v-btn>
                    </div>
                    <div class="request-status-container">
                        <v-progress-circular indeterminate
                                v-show="progress"
                                :size="20" :width="2"
                                color="primary"></v-progress-circular>
                        <v-icon v-show="success" color="green">mdi-check</v-icon>
                        <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                    </div>
                </v-row>
            </v-row>

        </v-form>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '../../common/submit-utils'

export default {
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            institutionalRepositories: [],
            data: {
                researcherIDs: {}
            },
        }
    },
    created () {
        this.initialize();
        this.getRepositories();
    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                subUtil.getInfoPopulate(this, 'api/people/' + personID + '/researcher-ids', false)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    Object.keys(result).forEach(key => {
                        let value = result[key];
                        this.$set(this.data.researcherIDs, key, value);
                    });
                })
            } else {
                this.$refs.form.reset();
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let requests = [];
                let personID = this.$store.state.session.personID;
                let userID = this.$store.state.session.userID;
                this.data.researcherIDs.changed_by = userID;
                if (this.data.researcherIDs.id !== undefined) {
                    requests.push(this.$http.put('api/people/' + personID + '/researcher-ids/' + this.data.researcherIDs.id,
                        { data: this.data.researcherIDs, },
                        { headers: {'Authorization': 'Bearer ' + localStorage['v2-token']}, }
                    ));
                } else {
                    requests.push(this.$http.post('api/people/' + personID + '/researcher-ids',
                        { data: this.data.researcherIDs, },
                        { headers: {'Authorization': 'Bearer ' + localStorage['v2-token']}, }
                    ));
                }
                this.$http.all(requests)
                    .then(this.$http.spread( () => {
                        this.progress = false;
                        this.success = true;
                        setTimeout(() => {this.success = false;}, 1500)
                        this.initialize();
                    }))
                    .catch((error) => {
                        this.progress = false;
                        this.error = true;
                        this.initialize();
                        setTimeout(() => {this.error = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    })

            }
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

<style scoped>

</style>