<template>
<v-container>
    <v-row>
        <v-col cols="12">
            <PublicationsTeam
                :lab-id="labId"
                :lab-data="labData"
                :lab-positions="labPositions"
                :my-labs="myLabs"
                :publications="data.publicationsTeam"
            ></PublicationsTeam>
        </v-col>
        <v-col cols="12">
            <PublicationsMembers
                 v-if="data.publicationsMembers.length > 0"
                :lab-id="labId"
                :lab-data="labData"
                :lab-positions="labPositions"
                :my-labs="myLabs"
                :publications="data.publicationsMembers"
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
        labPositions: Array,
        myLabs: Array,
    },
    data() {
        return {
            data: {
                publicationsTeam: [],
                publicationsMembers: [],
            },
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
            if (this.$store.state.session.loggedIn) {
                subUtil.getInfoPopulate(this, 'api/labs/' + this.labId + '/publications', true)
                .then( (result) => {
                    for (let ind in result) {
                        result[ind].title_show = result[ind].title;
                        result[ind].authors_raw_show = result[ind].authors_raw;
                    }
                    this.data.publicationsTeam = result;
                })
                .then(
                    subUtil.getInfoPopulate(this, 'api/labs/' + this.labId + '/members-publications', true)
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
                )
            }
        },
    },

}
</script>

<style scoped>

</style>