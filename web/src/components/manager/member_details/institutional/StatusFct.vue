<template>
<v-card class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">FCT/MCTES status</h3>
        </div>
    </v-card-title>
    <v-card-text class="px-4">
        <v-form ref="form"
                @submit.prevent="submitForm">
            <v-row class="px-2">
                <v-col cols="12" md="6">
                    <v-checkbox
                        v-model="data.statusFCT.must_be_added"
                        label="Add to FCT/MCTES"
                    ></v-checkbox>
                </v-col>
                <v-col cols="12" md="6">
                    <v-checkbox
                        v-model="data.statusFCT.addition_requested"
                        label="Addition request sent"
                    ></v-checkbox>
                </v-col>
            </v-row>
            <v-row class="px-2">
                <v-col cols="12" md="6">
                    <v-checkbox
                        v-model="data.statusFCT.must_be_removed"
                        color="red"
                        label="Remove from FCT/MCTES"
                    ></v-checkbox>
                </v-col>
                <v-col cols="12" md="6">
                    <v-checkbox
                        v-model="data.statusFCT.removal_requested"
                        color="purple"
                        label="Removal request sent"
                    ></v-checkbox>
                </v-col>
            </v-row>
            <v-row align-content="center" justify="end">
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Update</v-btn>
                    </v-row>
                </v-col>
                <v-col cols="1">
                    <v-progress-circular indeterminate
                            v-show="progress"
                            :size="20" :width="2"
                            color="primary"></v-progress-circular>
                    <v-icon v-show="success" color="green">mdi-check</v-icon>
                    <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                </v-col>
            </v-row>
        </v-form>
    </v-card-text>
</v-card>

</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    props: {
        personId: Number,
        managerId: Number,
        endpoint: String,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            data: {
                statusFCT: {}
            },
        }
    },
    watch: {
        personId () {
            this.initialize();
        },
    },
    created () {
        this.initialize();
    },
    methods: {
        initialize () {
            this.data.statusFCT = {};
            if (this.$store.state.session.loggedIn) {
                let personID = this.personId;
                subUtil.getInfoPopulate(this,  'api' + this.endpoint
                                + '/fct-status'
                                + '/' + personID, false)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    if (result !== undefined) {
                        Object.keys(result).forEach(key => {
                            let value = result[key];
                            this.$set(this.data.statusFCT, key, value);
                        });
                    }
                })
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let requests = [];
                let personID = this.personId;
                let userID = this.$store.state.session.userID;
                this.data.statusFCT.changed_by = userID;
                if (this.data.statusFCT.id !== undefined) {
                    requests.push(this.$http.put('api' + this.endpoint
                                + '/fct-status'
                                + '/' + personID + '/status/' + this.data.statusFCT.id,
                        { data: this.data.statusFCT, },
                        { headers: {'Authorization': 'Bearer ' + localStorage['v2-token']}, }
                    ));
                } else {
                    requests.push(this.$http.post('api' + this.endpoint
                                + '/fct-status'
                                + '/' + personID,
                        { data: this.data.statusFCT, },
                        { headers: {'Authorization': 'Bearer ' + localStorage['v2-token']}, }
                    ));
                }
                Promise.all(requests)
                    .then( () => {
                        this.progress = false;
                        this.success = true;
                        this.$root.$emit('managerChangeStatusFCT');
                        setTimeout(() => {this.success = false;}, 1500)
                        this.initialize();
                    })
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
    },
}
</script>

<style>

</style>