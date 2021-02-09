<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">People you supervise</h3>
        </div>
    </v-card-title>
    <v-card-text>{{data.students}}</v-card-text>
</v-card>

</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            newName: null,
            data: {
                students: [],
            },
            toCreate: [],
            toDelete: [],
        }
    },
    watch: {
        currentTab () {
            if (this.currentTab === '/person/productivity/supervisor') {
                this.initialize();
            }
        },
    },
    mounted() {
        this.initialize();
    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                let urlSubmit = 'api/people/' + personID + '/students';
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    this.data.students = result;
                })
            }
        },
    },

}
</script>

<style scoped>

</style>