<template>
<v-card class="mb-6">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Search person in database</h3>
        </div>
    </v-card-title>
    <v-card-text>Check if person you want to add to the team is already in the database.
        <br>
        Proceed to pre-registration only if not found.
    </v-card-text>
    <v-container>
        <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
            @input="filterPeople('new')"
            class="px-4 mb-4"
        ></v-text-field>
        <v-row v-if="data.people.length > 0"
            class="pl-4 mb-2 "
        >
            <span class="highlight">Search results:</span>
        </v-row>
        <v-row v-if="data.people.length > 0"
            class="pl-4 mb-2 " align="center"
        >
            <v-btn icon @click.stop="previousPage">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            {{ page }}/{{ totalPages }}
            <v-btn icon @click.stop="nextPage">
                <v-icon>mdi-arrow-right</v-icon>
            </v-btn>
        </v-row>
        <ul>
            <li v-for="(person, i) in data.people"
                :key="i"
                class="mb-2"
            >
                <span class="name">{{ person.name }}</span><br>
                <span class="position">{{ person.lab_position_name }}</span> - <span class="lab">{{ person.lab_name }}</span><br>
                <span class="date">{{ person.valid_from | formatDate }} - {{ person.valid_until | formatDate}}</span>
            </li>
        </ul>
        <v-row v-if="data.people.length > 0"
            class="pl-4 mb-2 " align="center"
        >
            <v-btn icon @click.stop="previousPage">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            {{ page }}/{{ totalPages }}
            <v-btn icon @click.stop="nextPage">
                <v-icon>mdi-arrow-right</v-icon>
            </v-btn>
        </v-row>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    props: {
        labId: Number,
        depTeamId: Number,
        labPositions: Array,
    },
    data () {
        return {
            search: '',
            page: 1,
            itemsPerPage: 5,
            totalPages: 1,
            data: {
                total: 0,
                people: [],
            },
        }
    },
    methods: {
        filterPeople (newSearch) {
            this.data.people = [];
            if (newSearch === 'new') {
                this.page = 1;
            }
            if (this.search !== undefined && this.search.length > 2) {
                let this_session = this.$store.state.session;
                if (this_session.loggedIn) {
                    for (let ind in this_session.permissionsEndpoints) {
                        let decomposedPath = this_session.permissionsEndpoints[ind].decomposedPath;
                        if ((
                            (decomposedPath.length === 3
                            && (decomposedPath[0] === 'labs' || decomposedPath[0] === 'department-teams')
                            && decomposedPath[2] === 'people')
                            ||
                            (decomposedPath.length === 2
                            && (decomposedPath[0] === 'labs' || decomposedPath[0] === 'department-teams')
                            && this_session.permissionsEndpoints[ind].allow_all_subpaths === 1
                            )

                            )

                            && this_session.permissionsEndpoints[ind].method_name === 'GET') {
                            let urlSubmit
                            if (this.labId !== undefined) {
                                urlSubmit = 'api/labs/' + this.labId + '/people';
                            }
                            if (this.depTeamId !== undefined) {
                                urlSubmit = 'api/department-teams/' + this.depTeamId  + '/people';
                            }
                            urlSubmit = urlSubmit
                                        + '?limit=' + this.itemsPerPage
                                        + '&offset=' + (this.page - 1) * this.itemsPerPage
                                        + '&q=' + this.search;
                            subUtil.getInfoPopulate(this, urlSubmit, true, true)
                            .then( (result) => {
                                // only works if this.data and result have the same keys
                                for (let ind in result.result) {
                                    this.$set(this.data.people, ind, {});
                                    Object.keys(result.result[ind]).forEach(key => {
                                        let value = result.result[ind][key];
                                        this.$set(this.data.people[ind], key, value);
                                    });
                                }
                                this.data.total = result.count;
                                this.totalPages = Math.ceil(this.data.total / this.itemsPerPage);
                            })
                        }
                    }
                }
            } else {
                this.data.people = [];
            }
        },
        previousPage () {
            if (this.page > 1) {
                this.page--;
                this.filterPeople();
            }
        },
        nextPage () {
            if (this.page < this.totalPages) {
                this.page++;
                this.filterPeople();
            }
        },
    },
}
</script>

<style scoped>
.highlight {
    font-size: 1.2em;
}
.name {
    font-weight: 600;
}
.position {
    font-style: italic;
    font-size: 0.8em;
}
.lab {
    font-weight: 500;
    font-size: 0.8em;
}
.date {
    font-size: 0.7em;
}
</style>