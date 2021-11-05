<template>
<v-container>
    <v-row>
        <v-col cols="12">
            <PublicationsTeam
                :lab-id="labId"
                :lab-data="labData"
                :my-labs="myLabs"
                :dep-team-id="depTeamId"
                :dep-team-data="depTeamData"
                :my-dep-teams="myDepTeams"
                :lab-positions="labPositions"
                :publications="data.publicationsTeam"
                :component-type="componentType"
            ></PublicationsTeam>
        </v-col>
        <v-col cols="12">
            <PublicationsMembers
                :lab-id="labId"
                :lab-data="labData"
                :my-labs="myLabs"
                :dep-team-id="depTeamId"
                :dep-team-data="depTeamData"
                :my-dep-teams="myDepTeams"
                :lab-positions="labPositions"
                :publications="data.publicationsMembers"
                :component-type="componentType"
            ></PublicationsMembers>
        </v-col>
    </v-row>
</v-container>

</template>

<script>
import subUtil from '@/components/common/submit-utils'

import PublicationsTeam from './PublicationsTeam'
import PublicationsMembers from './PublicationsMembers'

export default {
    components: {
        PublicationsTeam,
        PublicationsMembers,
    },
    props: {
        labId: Number,
        labData: Object,
        myLabs: Array,
        depTeamId: Number,
        depTeamData: Object,
        myDepTeams: Array,
        labPositions: Array,
    },
    data() {
        return {
            data: {
                publicationsTeam: [],
                publicationsMembers: [],
            },
            componentType: 'lab',   // might be 'lab' or 'team'
        }
    },
    mounted () {
        this.initialize();
        this.$root.$on('updateLabPublications', () => {
            // your code goes here
            this.initialize();
        });
    },
    watch: {
        labId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            let this_session = this.$store.state.session;
            let foundEndpoint = false;
            if (this_session.loggedIn) {
                for (let ind in this_session.permissionsEndpoints) {
                    let decomposedPath = this_session.permissionsEndpoints[ind].decomposedPath;
                    if ((decomposedPath[0] === 'labs'
                        && parseInt(decomposedPath[1], 10) === this.labId
                        && decomposedPath[2] === 'publications'
                        && this_session.permissionsEndpoints[ind].method_name === 'GET')
                        ||
                        (decomposedPath[0] === 'labs'
                        && parseInt(decomposedPath[1], 10) === this.labId
                        && this_session.permissionsEndpoints[ind].allow_all_subpaths === 1
                        && this_session.permissionsEndpoints[ind].method_name === 'GET')
                    ) {
                        foundEndpoint = true;
                        this.componentType = 'lab';
                        let urlSubmit = 'api' + '/labs/' + this.labId + '/publications';
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            for (let ind in result) {
                                result[ind].title_show = result[ind].title;
                                result[ind].authors_raw_show = result[ind].authors_raw;
                            }
                            this.data.publicationsTeam = result;
                        })
                        .then( () => {
                            urlSubmit = 'api/labs/' + this.labId + '/members-publications';
                            subUtil.getInfoPopulate(this, urlSubmit, true)
                            .then( (result) => {
                                let publicationsMembers = [];
                                for (let ind in result) {
                                    let found = false;
                                    for (let indTeam in this.data.publicationsTeam) {
                                        if (this.data.publicationsTeam[indTeam].id === result[ind].id ) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (!found) {
                                        result[ind].title_show = result[ind].title;
                                        result[ind].authors_raw_show = result[ind].authors_raw;
                                        publicationsMembers.push(result[ind])
                                    }
                                }
                                this.data.publicationsMembers = publicationsMembers;
                            })
                        })
                    }

                    if ((decomposedPath[0] === 'department-teams'
                        && parseInt(decomposedPath[1], 10) === this.depTeamId
                        && decomposedPath[2] === 'publications'
                        && this_session.permissionsEndpoints[ind].method_name === 'GET')
                        ||
                        (decomposedPath[0] === 'department-teams'
                        && parseInt(decomposedPath[1], 10) === this.depTeamId
                        && this_session.permissionsEndpoints[ind].allow_all_subpaths === 1
                        && this_session.permissionsEndpoints[ind].method_name === 'GET')
                    ) {
                        foundEndpoint = true;
                        this.componentType = 'team';
                        let urlSubmit = 'api' + '/department-teams/' + this.depTeamId + '/publications';
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            for (let ind in result) {
                                result[ind].title_show = result[ind].title;
                                result[ind].authors_raw_show = result[ind].authors_raw;
                            }
                            this.data.publicationsTeam = result;
                        })
                        .then( () => {
                            urlSubmit = 'api' + '/department-teams/' + this.depTeamId + '/members-publications';
                            subUtil.getInfoPopulate(this, urlSubmit, true)
                            .then( (result) => {
                                let publicationsMembers = [];
                                for (let ind in result) {
                                    let found = false;
                                    for (let indTeam in this.data.publicationsTeam) {
                                        if (this.data.publicationsTeam[indTeam].id === result[ind].id ) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (!found) {
                                        result[ind].title_show = result[ind].title;
                                        result[ind].authors_raw_show = result[ind].authors_raw;
                                        publicationsMembers.push(result[ind])
                                    }
                                }
                                this.data.publicationsMembers = publicationsMembers;
                            })
                        })
                    }
                }
                if (!foundEndpoint) {
                    this.data.publicationsTeam = [];
                    this.data.publicationsMembers = [];
                }
            }
            if (this_session.permissionsLevel < 3) {
                if (this.labId !== undefined) {
                    this.componentType = 'lab';
                    let urlSubmit = 'api' + '/labs/' + this.labId + '/publications';
                    subUtil.getInfoPopulate(this, urlSubmit, true)
                    .then( (result) => {
                        for (let ind in result) {
                            result[ind].title_show = result[ind].title;
                            result[ind].authors_raw_show = result[ind].authors_raw;
                        }
                        this.data.publicationsTeam = result;
                    })
                    .then( () => {
                        urlSubmit = 'api/labs/' + this.labId + '/members-publications';
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            let publicationsMembers = [];
                            for (let ind in result) {
                                let found = false;
                                for (let indTeam in this.data.publicationsTeam) {
                                    if (this.data.publicationsTeam[indTeam].id === result[ind].id ) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    result[ind].title_show = result[ind].title;
                                    result[ind].authors_raw_show = result[ind].authors_raw;
                                    publicationsMembers.push(result[ind])
                                }
                            }
                            this.data.publicationsMembers = publicationsMembers;
                        })
                    })
                } else if (this.depTeamId !== undefined) {
                    this.componentType = 'team';
                    let urlSubmit = 'api' + '/department-teams/' + this.depTeamId + '/publications';
                    subUtil.getInfoPopulate(this, urlSubmit, true)
                    .then( (result) => {
                        for (let ind in result) {
                            result[ind].title_show = result[ind].title;
                            result[ind].authors_raw_show = result[ind].authors_raw;
                        }
                        this.data.publicationsTeam = result;
                    })
                    .then( () => {
                        urlSubmit = 'api' + '/department-teams/' + this.depTeamId + '/members-publications';
                        subUtil.getInfoPopulate(this, urlSubmit, true)
                        .then( (result) => {
                            let publicationsMembers = [];
                            for (let ind in result) {
                                let found = false;
                                for (let indTeam in this.data.publicationsTeam) {
                                    if (this.data.publicationsTeam[indTeam].id === result[ind].id ) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    result[ind].title_show = result[ind].title;
                                    result[ind].authors_raw_show = result[ind].authors_raw;
                                    publicationsMembers.push(result[ind])
                                }
                            }
                            this.data.publicationsMembers = publicationsMembers;
                        })
                    })
                }
            }




            /*
            if (this.$store.state.session.loggedIn) {
                let url;
                url = 'api/labs/' + this.labId + '/publications';
                //if (this.depTeamId !== undefined) {
                //    url = 'api/department-teams/' + this.depTeamId + '/publications';
                //}
                subUtil.getInfoPopulate(this, url, true)
                .then( (result) => {
                    for (let ind in result) {
                        result[ind].title_show = result[ind].title;
                        result[ind].authors_raw_show = result[ind].authors_raw;
                    }
                    this.data.publicationsTeam = result;
                })
                .then( () => {
                    url = 'api/labs/' + this.labId + '/members-publications';
                    //if (this.depTeamId !== undefined) {
                    //    url = 'api/department-teams/' + this.depTeamId + '/publications';
                    //}
                    subUtil.getInfoPopulate(this, url, true)
                    .then( (result) => {
                        let publicationsMembers = [];
                        for (let ind in result) {
                            let found = false;
                            for (let indTeam in this.data.publicationsTeam) {
                                if (this.data.publicationsTeam[indTeam].id === result[ind].id ) {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                result[ind].title_show = result[ind].title;
                                result[ind].authors_raw_show = result[ind].authors_raw;
                                publicationsMembers.push(result[ind])
                            }
                        }
                        this.data.publicationsMembers = publicationsMembers;
                    })
                })
            }
            */
        },
    },

}
</script>

<style scoped>

</style>