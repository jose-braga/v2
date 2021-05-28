<template>
<v-form ref="form"
    @submit.prevent="submitForm">
<v-container class="px-6">
    <v-row v-for="(team, i) in data.departmentTeams"
        :key="i"
    >
        <v-col cols="12" md="10">
            <v-select v-model="team.team_id"
                :items="departmentTeams" item-value="id" item-text="name"
                label="Department Team">
            </v-select>
        </v-col>
        <v-col cols="2">
            <v-btn icon @click="removeItem(data.departmentTeams, i)" class="mt-3">
                <v-icon color="red darken">mdi-delete</v-icon>
            </v-btn>
        </v-col>

    </v-row>
    <v-row class="ml-4">
        <v-btn outlined @click="addItem()">
            Add team association
        </v-btn>
    </v-row>
    <v-row>
        <v-col cols="11" align-self="end">
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
</v-container>
</v-form>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    props: {
        personId: Number,
        managerId: Number,
        endpoint: String,
    },
    data () {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            data: {
                departmentTeams: [],
            },
            departmentTeams: [],
            toDelete: [],
        }
    },
    watch: {
        personId () {
            this.initialize();
        },
    },
    created () {
        this.initialize();
        this.getDepartmentTeams();
    },
    methods: {
        initialize () {
            this.data.departmentTeams = [];
            if (this.$store.state.session.loggedIn) {
                let personID = this.personId;
                subUtil.getInfoPopulate(this, 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/department-teams', true)
                .then( (result) => {
                    this.data.departmentTeams = result;
                })
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreate = [];
                let urlDelete = [];
                let urlUpdate = [];
                let personID = this.personId;
                let depTeams = this.data.departmentTeams;
                for (let ind in depTeams) {
                    if (depTeams[ind].id === 'new') {
                        depTeams[ind].person_id = personID;
                        urlCreate.push({
                            url: 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/department-teams',
                            body: depTeams[ind],
                        });
                    } else {
                        urlUpdate.push({
                                url: 'api' + this.endpoint
                                    + '/members'
                                    + '/' + personID
                                    + '/department-teams/' + depTeams[ind].id,
                                body: depTeams[ind],
                            });
                    }
                }
                for (let ind in this.toDelete) {
                    urlDelete.push('api' + this.endpoint
                                    + '/members'
                                    + '/' + personID
                                    + '/department-teams/' + this.toDelete[ind].id);
                }
                Promise.all(
                    urlUpdate.map(el =>
                        this.$http.put(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                    .concat(
                        urlCreate.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            })))
                    .concat(
                        urlDelete.map(el =>
                            this.$http.delete(el,
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            })))
                )
                .then(() => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.toDelete = [];
                    this.initialize();
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    this.toDelete = [];
                    this.initialize();
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        getDepartmentTeams() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'department-teams';
                return subUtil.getPublicInfo(vm, urlSubmit, 'departmentTeams');
            }
        },
        addItem() {
            this.data.departmentTeams.push(
                {
                    id: 'new', person_id: this.personId,
                    team_id: null,
                });
        },
        removeItem(list, ind) {
            if (list[ind].id !== 'new') {
                this.toDelete.push(list[ind]);
            }
            list.splice(ind, 1);
        },
    }

}
</script>

<style>

</style>