<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">FCT/MCTES Team Management </h3>
        </div>
    </v-card-title>
    <v-card-text>
        <h2>The following members should be added to the FCT/MCTES team for this Unit</h2>
    </v-card-text>
    <v-container>
        <v-form ref="form" class="px-4"
            @submit.prevent="submitForm">
            <v-data-table
                item-key="person_id"
                :headers="headers"
                :footer-props="footerProps"
                :items="data.members"
                :items-per-page="itemsPerPage"
                :sort-by="['name']"
                :sort-desc="[false]"
                class="elevation-1"
            >
                <template v-slot:item.must_be_added="{ item }">
                    <v-checkbox
                        v-model="item.must_be_added"
                        @change="markToUpdate(item)"
                    ></v-checkbox>
                </template>
                <template v-slot:item.addition_requested="{ item }">
                    <v-checkbox
                        v-model="item.addition_requested"
                        @change="markToUpdate(item)"
                    ></v-checkbox>
                </template>
            </v-data-table>
            <v-row align-content="center" justify="end" class="mt-4">
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
    </v-container>
    <v-card-text>
        <h2>Addition of these members was already requested to FCT/MCTES</h2>
    </v-card-text>
    <v-container>
        <v-form ref="form" class="px-4"
            @submit.prevent="submitFormRequested">
            <v-data-table
                item-key="person_id"
                :headers="headersRequested"
                :footer-props="footerPropsRequested"
                :items="data.membersRequested"
                :items-per-page="itemsPerPageRequested"
                :sort-by="['name']"
                :sort-desc="[false]"
                class="elevation-1"
            >
                <template v-slot:item.addition_requested="{ item }">
                    <v-checkbox
                        v-model="item.addition_requested"
                        @change="markToUpdate(item)"
                    ></v-checkbox>
                </template>
                <template v-slot:item.must_be_removed="{ item }">
                    <v-checkbox
                        v-model="item.must_be_removed"
                        color="red"
                        @change="markToUpdate(item)"
                    ></v-checkbox>
                </template>
                <template v-slot:item.removal_requested="{ item }">
                    <v-checkbox
                        v-model="item.removal_requested"
                        color="purple"
                        @change="markToUpdate(item)"
                    ></v-checkbox>
                </template>
            </v-data-table>
            <v-row align-content="center" justify="end" class="mt-4">
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Update Requested</v-btn>
                    </v-row>
                </v-col>
                <v-col cols="1">
                    <v-progress-circular indeterminate
                            v-show="progressRequested"
                            :size="20" :width="2"
                            color="primary"></v-progress-circular>
                    <v-icon v-show="successRequested" color="green">mdi-check</v-icon>
                    <v-icon v-show="errorRequested" color="red">mdi-alert-circle-outline</v-icon>
                </v-col>
            </v-row>
        </v-form>

    </v-container>
    <v-card-text>
        <h2>Removal of these members was requested to FCT/MCTES</h2>
    </v-card-text>
    <v-container>
        <v-form ref="form" class="px-4"
            @submit.prevent="submitFormRemoved">
            <v-data-table
                item-key="person_id"
                :headers="headersRemoved"
                :footer-props="footerPropsRemoved"
                :items="data.membersRemoved"
                :items-per-page="itemsPerPageRemoved"
                :sort-by="['name']"
                :sort-desc="[false]"
                class="elevation-1"
            >
                <template v-slot:item.removal_requested="{ item }">
                    <v-checkbox
                        v-model="item.removal_requested"
                        @change="markToUpdate(item)"
                    ></v-checkbox>
                </template>
            </v-data-table>
            <v-row align-content="center" justify="end" class="mt-4">
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Update Removed</v-btn>
                    </v-row>
                </v-col>
                <v-col cols="1">
                    <v-progress-circular indeterminate
                            v-show="progressRemoved"
                            :size="20" :width="2"
                            color="primary"></v-progress-circular>
                    <v-icon v-show="successRemoved" color="green">mdi-check</v-icon>
                    <v-icon v-show="errorRemoved" color="red">mdi-alert-circle-outline</v-icon>
                </v-col>
            </v-row>
        </v-form>
    </v-container>

</v-card>
</template>

<script>
import time from '@/components/common/date-utils'
import subUtil from '@/components/common/submit-utils'

function processResults(vm, result) {
    for (let ind in result) {
        result[ind].valid_from = time.momentToDate(result[ind].valid_from);
        result[ind].valid_until = time.momentToDate(result[ind].valid_until);
    }
    return result;
}

export default {
    props: {
        segmentType: String,
        unitId: Number,
        cityId: Number,
        unitData: Object,
        cityData: Object,
    },
    data() {
        return {
            dialog: false,
            progress: false,
            success: false,
            error: false,
            progressRequested: false,
            successRequested: false,
            errorRequested: false,
            progressRemoved: false,
            successRemoved: false,
            errorRemoved: false,
            itemsPerPage: 10,
            itemsPerPageRequested: 10,
            itemsPerPageRemoved: 10,
            search: '',
            memberID: undefined,
            memberName: undefined,
            managerID: undefined, // Attention: this is a user ID (not a person ID)
            endpoint: '',
            data: {
                members: [],
                membersRequested: [],
                membersRemoved: [],
            },
            headers: [
                { text: 'ID', value: 'person_id', sortable: false},
                { text: 'Name', value: 'name', sortable: true},
                { text: 'Add?', value: 'must_be_added', sortable: false },
                { text: 'Addition Requested?', value: 'addition_requested', sortable: false },
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            headersRequested: [
                { text: 'ID', value: 'person_id', sortable: false},
                { text: 'Name', value: 'name', sortable: true},
                { text: 'Addition Requested?', value: 'addition_requested', sortable: false },
                { text: 'Removal?', value: 'must_be_removed', sortable: false },
                { text: 'Removal Requested?', value: 'removal_requested', sortable: false },
            ],
            footerPropsRequested: {
                'items-per-page-options': [10,20,50,-1]
            },
            headersRemoved: [
                { text: 'ID', value: 'person_id', sortable: false},
                { text: 'Name', value: 'name', sortable: true},
                { text: 'Removal Requested?', value: 'removal_requested', sortable: false },
            ],
            footerPropsRemoved: {
                'items-per-page-options': [10,20,50,-1]
            },
        }
    },
    mounted () {
        this.initialize();
        this.$root.$on('managerChangeStatusFCT',
            () => {
                this.initialize();
            }
        );
    },
    computed: {
        currentUnitCity () {
            return this.segmentType + '-' + this.unitId + '-' + this.cityId;
        },
    },
    watch: {
        currentUnitCity () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            let this_session = this.$store.state.session;
            let foundEndpoint = false;
            if (this_session.loggedIn) {
                this.managerID = this_session.userID;
                for (let ind in this_session.permissionsEndpoints) {
                    let decomposedPath = this_session.permissionsEndpoints[ind].decomposedPath;
                    if ( this.segmentType === 'unit'
                            && decomposedPath.length === 4
                            && decomposedPath[0] === 'managers'
                            && parseInt(decomposedPath[1], 10) === this_session.userID
                            && decomposedPath[2] === 'units'
                            && parseInt(decomposedPath[3], 10) === this.unitId
                            && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        foundEndpoint = true;
                        let urlSubmit;
                        this.endpoint = this_session.permissionsEndpoints[ind].endpoint_url;
                        urlSubmit = 'api' + this.endpoint
                                + '/to-add-fct-mctes-members'
                                ;
                        subUtil.getInfoPopulate(this, urlSubmit, true, true)
                        .then( (result) => {
                            this.data.members = processResults(this, result.result);
                        });
                        urlSubmit = 'api' + this.endpoint
                                + '/requested-fct-mctes-members'
                                ;
                        subUtil.getInfoPopulate(this, urlSubmit, true, true)
                        .then( (result) => {
                            this.data.membersRequested = processResults(this, result.result);
                        });
                        urlSubmit = 'api' + this.endpoint
                                + '/removed-fct-mctes-members'
                                ;
                        subUtil.getInfoPopulate(this, urlSubmit, true, true)
                        .then( (result) => {
                            this.data.membersRemoved = processResults(this, result.result);
                        });
                    } else if ( this.segmentType === 'unit-city'
                            && decomposedPath.length === 6
                            && decomposedPath[0] === 'managers'
                            && parseInt(decomposedPath[1], 10) === this_session.userID
                            && decomposedPath[2] === 'units'
                            && parseInt(decomposedPath[3], 10) === this.unitId
                            && decomposedPath[4] === 'cities'
                            && parseInt(decomposedPath[5], 10) === this.unitId
                            && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        foundEndpoint = true;
                        let urlSubmit;
                        this.endpoint = this_session.permissionsEndpoints[ind].endpoint_url;
                        urlSubmit = 'api' + this.endpoint
                                + '/to-add-fct-mctes-members'
                                ;
                        subUtil.getInfoPopulate(this, urlSubmit, true, true)
                        .then( (result) => {
                            this.data.members = processResults(this, result.result);
                        });
                        urlSubmit = 'api' + this.endpoint
                                + '/requested-fct-mctes-members'
                                ;
                        subUtil.getInfoPopulate(this, urlSubmit, true, true)
                        .then( (result) => {
                            this.data.membersRequested = processResults(this, result.result);
                        });
                        urlSubmit = 'api' + this.endpoint
                                + '/removed-fct-mctes-members'
                                ;
                        subUtil.getInfoPopulate(this, urlSubmit, true, true)
                        .then( (result) => {
                            this.data.membersRemoved = processResults(this, result.result);
                        });
                    } else if ( this.segmentType === 'city'
                            && decomposedPath.length === 4
                            && decomposedPath[0] === 'managers'
                            && parseInt(decomposedPath[1], 10) === this_session.userID
                            && decomposedPath[2] === 'cities'
                            && parseInt(decomposedPath[3], 10) === this.cityId
                            && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                        foundEndpoint = true;
                        let urlSubmit;
                        this.endpoint = this_session.permissionsEndpoints[ind].endpoint_url;
                        urlSubmit = 'api' + this.endpoint
                                + '/to-add-fct-mctes-members'
                                ;
                        subUtil.getInfoPopulate(this, urlSubmit, true, true)
                        .then( (result) => {
                            this.data.members = processResults(this, result.result);
                        });
                        urlSubmit = 'api' + this.endpoint
                                + '/requested-fct-mctes-members'
                                ;
                        subUtil.getInfoPopulate(this, urlSubmit, true, true)
                        .then( (result) => {
                            this.data.membersRequested = processResults(this, result.result);
                        });
                        urlSubmit = 'api' + this.endpoint
                                + '/removed-fct-mctes-members'
                                ;
                        subUtil.getInfoPopulate(this, urlSubmit, true, true)
                        .then( (result) => {
                            this.data.membersRemoved = processResults(this, result.result);
                        });
                    }
                }
                if (!foundEndpoint) {
                    this.data.members = [];
                }
            }
        },
        submitForm() {
            if (this.$store.state.session.loggedIn) {
                let urlUpdate = [];
                let members = this.data.members;
                this.progress = true;
                for (let ind in members) {
                    if (members[ind].toUpdate) {
                        if (members[ind].must_be_added === true) {
                            members[ind].must_be_added = 1;
                        } else if (members[ind].must_be_added === false) {
                            members[ind].must_be_added = 0;
                        }
                        if (members[ind].addition_requested === true) {
                            members[ind].addition_requested = 1;
                        } else if (members[ind].addition_requested === false) {
                            members[ind].addition_requested = 0;
                        }
                        urlUpdate.push({
                            url: 'api' + this.endpoint
                                + '/to-add-fct-mctes-members'
                                + '/' + members[ind].id,
                            body: members[ind],
                        });
                    }
                }
                Promise.all(
                    urlUpdate.map(el =>
                        this.$http.put(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                )
                .then( () => {
                    this.progress = false;
                    this.success = true;
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
        submitFormRequested() {
            if (this.$store.state.session.loggedIn) {
                let urlUpdate = [];
                let members = this.data.membersRequested;
                this.progressRequested = true;
                for (let ind in members) {
                    if (members[ind].toUpdate) {
                        if (members[ind].must_be_removed === true) {
                            members[ind].must_be_removed = 1;
                        } else if (members[ind].must_be_removed === false) {
                            members[ind].must_be_removed = 0;
                        }
                        if (members[ind].removal_requested === true) {
                            members[ind].removal_requested = 1;
                        } else if (members[ind].removal_requested === false) {
                            members[ind].removal_requested = 0;
                        }
                        if (members[ind].addition_requested === true) {
                            members[ind].addition_requested = 1;
                        } else if (members[ind].addition_requested === false) {
                            members[ind].addition_requested = 0;
                        }
                        urlUpdate.push({
                            url: 'api' + this.endpoint
                                + '/requested-fct-mctes-members'
                                + '/' + members[ind].id,
                            body: members[ind],
                        });
                    }
                }
                Promise.all(
                    urlUpdate.map(el =>
                        this.$http.put(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                )
                .then( () => {
                    this.progressRequested = false;
                    this.successRequested = true;
                    setTimeout(() => {this.successRequested = false;}, 1500)
                    this.initialize();
                })
                .catch((error) => {
                    this.progressRequested = false;
                    this.errorRequested = true;
                    this.initialize();
                    setTimeout(() => {this.errorRequested = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        submitFormRemoved() {
            if (this.$store.state.session.loggedIn) {
                let urlUpdate = [];
                let members = this.data.membersRemoved;
                this.progressRemoved = true;
                for (let ind in members) {
                    if (members[ind].toUpdate) {
                        if (members[ind].removal_requested === true) {
                            members[ind].removal_requested = 1;
                        } else if (members[ind].removal_requested === false) {
                            members[ind].removal_requested = 0;
                        }
                        urlUpdate.push({
                            url: 'api' + this.endpoint
                                + '/removed-fct-mctes-members'
                                + '/' + members[ind].id,
                            body: members[ind],
                        });
                    }
                }
                Promise.all(
                    urlUpdate.map(el =>
                        this.$http.put(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                )
                .then( () => {
                    this.progressRemoved = false;
                    this.successRemoved = true;
                    setTimeout(() => {this.successRemoved = false;}, 1500)
                    this.initialize();
                })
                .catch((error) => {
                    this.progressRemoved = false;
                    this.errorRemoved = true;
                    this.initialize();
                    setTimeout(() => {this.errorRemoved = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        markToUpdate(item) {
            this.$set(item, 'toUpdate', true);
        },
    },

}
</script>

<style>

</style>