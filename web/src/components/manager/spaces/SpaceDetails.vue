<template>
<v-card>
    <v-form @submit.prevent="submitForm(spaceDetails)">
        <v-card-title>
            <span> Edit data for
                    <b>{{ spaceDetails.name_pt }}</b>
            </span>
        </v-card-title>
        <v-container>
            <v-row>
                <v-col cols="12" sm="6">
                    <v-text-field v-model="spaceDetails.name_pt"
                        label="Name (PT)">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                    <v-text-field v-model="spaceDetails.name_en"
                        label="Name (EN)">
                    </v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="2">
                    <v-select v-model="spaceDetails.space_type_id"
                        :items="spaceTypes" item-value="id" item-text="name_en"
                        label="Space Type">
                    </v-select>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-text-field v-model="spaceDetails.area"
                        label="Area (m^2)">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-text-field v-model="spaceDetails.reference"
                        label="Room #">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-text-field v-model="spaceDetails.short_reference"
                        label="Room # (short)">
                    </v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-expansion-panels>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <h2>Associations to teams</h2>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-row align-content="center" justify="start">
                                <v-col cols="4">
                                    <v-row justify="center">
                                        <v-btn
                                            @click.stop="addItem(spaceDetails.teams,'team')"
                                            outlined color="black"
                                        >
                                            Add a team
                                        </v-btn>
                                    </v-row>
                                </v-col>
                            </v-row>
                            <v-row v-for="(team, i) in spaceDetails.teams"
                                :key="i"
                            >
                                <v-col cols="12" sm="4">
                                    <v-select v-model="team.team_id"
                                        :items="departmentTeams" item-value="id" item-text="name"
                                        label="Space Type">
                                    </v-select>
                                </v-col>
                                <v-col cols="12" sm="2">
                                    <v-text-field v-model="team.percentage"
                                        label="% occupation">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" sm="2">
                                    <v-menu ref="date_menu"
                                        v-model="team.show_valid_from"
                                        :close-on-content-click="false"
                                        :nudge-right="10"
                                        transition="scale-transition"
                                        offset-y min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="team.valid_from"
                                                label="Start date" v-on="on">
                                            </v-text-field>
                                        </template>
                                        <v-date-picker v-model="team.valid_from"
                                            @input="team.show_valid_from = false"
                                            no-title
                                        ></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="12" sm="2">
                                    <v-menu ref="date_menu_2"
                                        v-model="team.show_valid_until"
                                        :close-on-content-click="false"
                                        :nudge-right="10"
                                        transition="scale-transition"
                                        offset-y min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="team.valid_until"
                                                label="End date" v-on="on">
                                            </v-text-field>
                                        </template>
                                        <v-date-picker v-model="team.valid_until"
                                            @input="team.show_valid_until = false"
                                            no-title
                                        ></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="12" sm="1">
                                    <v-btn icon @click.stop="removeItem(spaceDetails.teams, i, 'team')" class="mt-3">
                                        <v-icon color="red darken">mdi-delete</v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <h2>Associations to people</h2>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-row align-content="center" justify="start">
                                <v-col cols="4">
                                    <v-row justify="center">
                                        <v-btn
                                            @click.stop="addItem(spaceDetails.people,'people')"
                                            outlined color="black"
                                        >
                                            Add a person
                                        </v-btn>
                                    </v-row>
                                </v-col>
                            </v-row>
                            <v-row v-for="(person, i) in spaceDetails.people"
                                :key="'person-' + i"
                            >
                                <v-col cols="12" sm="4">
                                        <v-autocomplete
                                        v-model="person.person_id"
                                        :loading="loadingPeople"
                                        :items="people" item-value="id" item-text="colloquial_name"
                                        :search-input.sync="person.person_search"
                                        :filter="customSearch"
                                        cache-items
                                        flat
                                        hide-no-data
                                        hide-details
                                        label="Person">
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="12" sm="2">
                                    <v-select v-model="person.role_id"
                                        :items="spaceRoles" item-value="id" item-text="name_en"
                                        label="Role">
                                    </v-select>
                                </v-col>
                                <v-col cols="12" sm="2">
                                    <v-menu ref="date_menu"
                                        v-model="person.show_valid_from"
                                        :close-on-content-click="false"
                                        :nudge-right="10"
                                        transition="scale-transition"
                                        offset-y min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="person.valid_from"
                                                label="Start date" v-on="on">
                                            </v-text-field>
                                        </template>
                                        <v-date-picker v-model="person.valid_from"
                                            @input="person.show_valid_from = false"
                                            no-title
                                        ></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="12" sm="2">
                                    <v-menu ref="date_menu_2"
                                        v-model="person.show_valid_until"
                                        :close-on-content-click="false"
                                        :nudge-right="10"
                                        transition="scale-transition"
                                        offset-y min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="person.valid_until"
                                                label="End date" v-on="on">
                                            </v-text-field>
                                        </template>
                                        <v-date-picker v-model="person.valid_until"
                                            @input="person.show_valid_until = false"
                                            no-title
                                        ></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="12" sm="1">
                                    <v-btn icon @click.stop="removeItem(spaceDetails.people, i, 'people')" class="mt-3">
                                        <v-icon color="red darken">mdi-delete</v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-row>
            <v-row align-content="center" justify="end" class="mt-6 mb-1">
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
        </v-container>
    </v-form>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

function prepareStringComparison(str) {
    if (str === null || str === undefined) {
        return null;
    } else {
        return str.toLocaleLowerCase()
            .replace(/[áàãâä]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[íìîï]/g, 'i')
            .replace(/[óòõôö]/g, 'o')
            .replace(/[úùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[ñ]/g, 'n')
            .replace(/(\.\s)/g, '')
            .replace(/(\.)/g, '')
            .replace(/[-:()]/g, ' ')
            .trim()
            ;
    }
}

export default {
    props: {
        spaceId: Number,
        spaceData: Object,
        managerId: Number,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            loadingPeople: false,
            spaceDetails: {
                name: '',
                teams:[],
            },
            toDeleteTeams: [],
            toDeletePeople: [],
            departmentTeams: [],
            spaceTypes: [],
            spaceRoles: [],
            people: [],
        }
    },
    watch: {
        spaceId () {
            this.initialize();
        },
    },
    mounted() {
        this.initialize();
        this.getDepartmentTeams();
        this.getSpaceTypes();
        this.getPeople();
        this.getSpaceRoles();

    },
    methods: {
        initialize () {
            this.$set(this, 'spaceDetails', this.spaceData);
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlUpdateSpace = [];
                let urlUpdateSpaceTeam = [];
                let urlCreateSpaceTeam = [];
                let urlDeleteSpaceTeam = [];
                let urlUpdateSpacePerson = [];
                let urlCreateSpacePerson = [];
                let urlDeleteSpacePerson = [];
                urlUpdateSpace.push({
                    url: 'api/managers/' + this.managerId
                        + '/cities/' + 1
                        + '/spaces/' + this.spaceId,
                    body: this.spaceDetails,
                });
                for (let ind in this.spaceDetails.teams) {
                    let datum = this.spaceDetails.teams[ind];
                    if (datum.id === 'new') {
                        urlCreateSpaceTeam.push({
                            url: 'api/managers/' + this.managerId
                                + '/cities/' + 1
                                + '/spaces/' + this.spaceId
                                + '/teams',
                            body: datum,
                        });
                    } else {
                        urlUpdateSpaceTeam.push({
                            url: 'api/managers/' + this.managerId
                                + '/cities/' + 1
                                + '/spaces/' + this.spaceId
                                + '/teams/' + datum.id,
                            body: datum,
                        })
                    }
                }
                for (let ind in this.spaceDetails.people) {
                    let datum = this.spaceDetails.people[ind];
                    if (datum.id === 'new') {
                        urlCreateSpacePerson.push({
                            url: 'api/managers/' + this.managerId
                                + '/cities/' + 1
                                + '/spaces/' + this.spaceId
                                + '/people',
                            body: datum,
                        });
                    } else {
                        urlUpdateSpacePerson.push({
                            url: 'api/managers/' + this.managerId
                                + '/cities/' + 1
                                + '/spaces/' + this.spaceId
                                + '/people/' + datum.id,
                            body: datum,
                        })
                    }
                }
                for (let ind in this.toDeleteTeams) {
                    let datum = this.toDeleteTeams[ind]
                    urlDeleteSpaceTeam.push('api/managers/' + this.managerId
                                + '/cities/' + 1
                                + '/spaces/' + this.spaceId
                                + '/teams/' + datum.id)
                }
                for (let ind in this.toDeletePeople) {
                    let datum = this.toDeletePeople[ind]
                    urlDeleteSpacePerson.push('api/managers/' + this.managerId
                                + '/cities/' + 1
                                + '/spaces/' + this.spaceId
                                + '/people/' + datum.id)
                }
                Promise.all(
                    urlDeleteSpaceTeam.map(el =>
                        this.$http.delete(el,
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                    .concat(
                        urlDeleteSpacePerson.map(el =>
                            this.$http.delete(el,
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlUpdateSpace.map(el =>
                            this.$http.put(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlUpdateSpaceTeam.map(el =>
                            this.$http.put(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlUpdateSpacePerson.map(el =>
                            this.$http.put(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlCreateSpaceTeam.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlCreateSpacePerson.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                )
                .then(() => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.toDeleteTeams = [];
                    this.toDeletePeople = [];
                    this.$root.$emit('updateManagerSpace')
                    //this.initialize();
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    this.toDeleteTeams = [];
                    this.toDeletePeople = [];
                    this.initialize();
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        getDepartmentTeams () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'department-teams';
                return subUtil.getPublicInfo(vm, urlSubmit, 'departmentTeams');
            }
        },
        getPeople() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'people-simple';
                return subUtil.getPublicInfo(vm, urlSubmit, 'people', 'colloquial_name');
            }
        },
        getSpaceTypes () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'space-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'spaceTypes');
            }
        },
        getSpaceRoles () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'space-roles';
                return subUtil.getPublicInfo(vm, urlSubmit, 'spaceRoles');
            }
        },
        removeItem(list, ind, type) {
            if (type === 'team' && list[ind].id !== 'new') {
                this.toDeleteTeams.push(list[ind]);
            } else if (type === 'people' && list[ind].id !== 'new') {
                this.toDeletePeople.push(list[ind]);
            }

            list.splice(ind, 1);
        },
        addItem(list, type) {
            if (type === 'team') {
                list.push({
                    id: 'new',
                    team_id: null,
                    space_id: this.spaceId,
                    valid_from: null,
                    valid_until: null,
                })
            } else if (type === 'people') {
                list.push({
                    id: 'new',
                    person_id: null,
                    role_id: null,
                    space_id: this.spaceId,
                    valid_from: null,
                    valid_until: null,
                })
            }
        },
        customSearch (item, queryText, itemText) {
            let queryPre = prepareStringComparison(queryText);
            let query = queryPre.split(' ');
            let text = prepareStringComparison(itemText);
            for (let ind in query) {
                if (text.indexOf(query[ind]) === -1) {
                    return false;
                }
            }
            return true;
        },
    },

}
</script>

<style>

</style>