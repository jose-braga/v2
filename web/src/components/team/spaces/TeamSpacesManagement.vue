<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Spaces used by team</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container>
        <v-form ref="form" class="my-2 ml-2"
            @submit.prevent="submitForm"
        >
            <v-row>
                <v-col cols="12">
                    <v-btn
                        @click="showNewSpace()"
                        outlined color="blue"
                    >
                        Add a new space
                    </v-btn>

                </v-col>
            </v-row>
            <v-row v-if="addingNewSpace" align-content="center">
                <v-col cols="12" sm="3">
                    <v-autocomplete
                        v-model="data.newSpaces.space_id"
                        :items="spaces" item-value="id" item-text="space_text"
                        :search-input.sync="searchSpaces"
                        :filter="customSearch"
                        cache-items
                        flat
                        hide-no-data
                        hide-details
                        label="Spaces">
                    </v-autocomplete>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-text-field
                        v-model="data.newSpaces.percentage"
                        label="% Occupation">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-menu ref="date_menu"
                        v-model="data.newSpaces.show_valid_from"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="data.newSpaces.valid_from"
                                label="Start date" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="data.newSpaces.valid_from"
                            @input="data.newSpaces.show_valid_from = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-menu ref="menu_end_date"
                        v-model="data.newSpaces.show_valid_until"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="data.newSpaces.valid_until"
                                label="End date"
                                v-on="on"
                                v-bind="attrs"
                            >
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="data.newSpaces.valid_until"
                            @click="data.newSpaces.show_valid_until = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="2" align-self="center">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="red">Add</v-btn>
                    </v-row>
                </v-col>
                <v-col cols="1" align-self="center">
                    <v-progress-circular indeterminate
                            v-show="progress"
                            :size="20" :width="2"
                            color="primary"></v-progress-circular>
                    <v-icon v-show="success" color="green">mdi-check</v-icon>
                    <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                </v-col>
                <v-col cols="12" v-show="error">
                    <v-row>
                        <v-col cols="5" offset="7">
                            <span class="red--text">{{errorMessage}}</span>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="12">
                    <v-row>
                        <v-col cols="12">
                            <p>In case of doubt, check the maps provided below:</p>
                        </v-col>
                        <v-col v-for="(map, i) in maps"
                            :key="'maps-' + i"
                            cols="3"
                        >
                            <v-btn @click="showMap(map)"
                                color="primary"
                                text
                            >
                                {{map.name}}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-col>
                <v-dialog v-model="dialogMaps"
                    max-width="1600px"
                >
                    <v-card>
                        <v-card-text>
                            <span>
                                Scroll to zoom, click to grab and move image
                            </span>
                        </v-card-text>
                        <panZoom ref="mapImage"
                            :options="currentMap.options"
                        >
                            <v-img
                                :src="currentMap.final_link"
                            ></v-img>
                        </panZoom>
                    </v-card>
                </v-dialog>
            </v-row>
        </v-form>
        <v-data-table
            item-key="id"
            :search="search"
            :headers="headers"
            :footer-props="footerProps"
            :items="data.spaces"
            :items-per-page="10"
            :sort-by="['name']"
            :sort-desc="[false]"
        >
            <template v-slot:top>
                <v-dialog v-model="dialog" max-width="1600px">
                    <SpaceDetails
                        :item-id="editedItem.id"
                        :space-id="editedItem.space_id"
                        :lab-id="labId"
                        :dep-team-id="depTeamId"
                        :space-data="editedItem"
                    >
                    </SpaceDetails>
                </v-dialog>
            </template>

            <template v-slot:item.action="{ item }">
                <v-icon @click.stop="editItem(item)">mdi-pencil</v-icon>
                <v-icon @click.stop="deleteItem(item)"
                    class="ml-2"
                    color="red">mdi-delete</v-icon>
            </template>
        </v-data-table>
    </v-container>

</v-card>

</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

const SpaceDetails = () => import(/* webpackChunkName: "space-lab-details" */ './SpaceLabDetails')

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
        labId: Number,
        labData: Object,
        myLabs: Array,
        depTeamId: Number,
        depTeamData: Object,
        myDepTeams: Array,
        labPositions: Array,
    },
    components: {
        SpaceDetails,
    },
    data() {
        return {
            dialog: false,
            dialogMaps: false,
            progress: false,
            success: false,
            error: false,
            errorMessage: '',
            editedIndex: -1,
            editedItem: {},
            labName: '',
            addingNewSpace: false,
            data: {
                newSpaces: {},
                spaces: [],
            },
            maps: [
                {name: 'Piso 0 - Ambiente', link:'Piso-0-Ambiente-2021.jpg'},
                {name: 'Piso 1 - Ambiente', link:'Piso-1-Ambiente-2021.jpg'},
                {name: 'Piso 1 - DQ', link:'Piso-1-DQ-2021.jpg'},
                {name: 'Piso 2 - DQ', link:'Piso-2-DQ-2021.jpg'},
                {name: 'Piso 3 - DQ', link:'Piso-3-DQ-2021.jpg'},
                {name: 'Piso 4 - DQ', link:'Piso-4-DQ-2021.jpg'},
                {name: 'Piso 5 - DQ', link:'Piso-5-DQ-2021.jpg'},
                {name: 'Piso 6 - DQ', link:'Piso-6-DQ-2021.jpg'},
            ],
            currentMap: {},
            mapOptions: { initialZoom: 1 },
            publicPath: process.env.VUE_APP_REQUEST_ORIGIN,
            search: '',
            headers: [
                { text: 'Room #', value:'reference' },
                { text: 'Name', value:'space_name_pt' },
                { text: '%', value:'percentage' },
                { text: 'Dates', value:'spaces_dates_show' },
                { text: 'Type', value:'space_type_name_en' },
                { text: 'Actions', value: 'action', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            spaces: [],
            searchSpaces: '',
        }
    },
    mounted() {
        this.initialize();
        this.getSpaces();
        this.$root.$on('updateLabSpaceTable',
            () => {
                this.initialize();
            }
        );
    },
    methods: {
        initialize () {
            let urlSubmit
            if (this.labId !== undefined) {
                urlSubmit = 'api/labs/' + this.labId + '/spaces';
            }
            if (this.depTeamId !== undefined) {
                urlSubmit = 'api/department-teams/' + this.depTeamId + '/spaces';
            }
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then((result) => {
                for (let ind in result) {
                    let spaces_valid_from = '...'
                    let spaces_valid_until = '...'
                    if (result[ind].valid_from !== null) {
                        result[ind].valid_from = time.momentToDate(result[ind].valid_from);
                        spaces_valid_from = result[ind].valid_from;

                    }
                    if (result[ind].valid_until !== null) {
                        result[ind].valid_until = time.momentToDate(result[ind].valid_until)
                        spaces_valid_until = result[ind].valid_until;
                    }
                    result[ind].spaces_dates_show = spaces_valid_from
                        + ' - ' + spaces_valid_until;
                }
                this.data.spaces = result;
            })
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreate = [];
                let url
                if (this.labId !== undefined) {
                    url = 'api/labs/' + this.labId + '/spaces';
                }
                if (this.depTeamId !== undefined) {
                    url = 'api/department-teams/' + this.depTeamId + '/spaces';
                }
                urlCreate.push({
                    url: url,
                    body: this.data.newSpaces,
                });
                Promise.all(
                    urlCreate.map(el =>
                        this.$http.post(el.url,
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
                    //this.toDeleteLabPositions = []; // add the others
                    this.data.newSpaces = {}
                    this.addingNewSpace = false;
                    this.initialize();
                })
                .catch((error) => {
                    if (error.response) {
                        this.errorMessage = error.response.data.message;
                    }
                    this.progress = false;
                    this.error = true;
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },


        getSpaces () {
            let personID = this.$store.state.session.personID;
            const urlSubmit = 'api/people/' + personID + '/all-spaces';
            return subUtil.getInfoPopulate(this, urlSubmit, true)
            .then((result) => {
                for (let ind in result) {
                    let space_text = '';
                    space_text = space_text
                        + 'Room '
                        + result[ind].reference
                        + ', ';
                    space_text = space_text +
                        (result[ind].name_pt !== null ? result[ind].name_pt : '');
                    result[ind].space_text = space_text;
                }
                this.spaces = result
            })
            .catch( (error) => {
                console.log(error);
            })
        },
        showNewSpace () {
            this.addingNewSpace = !this.addingNewSpaceShowsdsd;
        },
        editItem (item) {
            this.dialog = true;
            this.editedIndex = this.data.spaces.indexOf(item);
            this.editedItem = item;
        },
        deleteItem (item) {
            let confirmation = confirm('Do you want to delete this association?')
            if (confirmation) {
                let urlDeleteLab = [];
                let url
                if (this.labId !== undefined) {
                    url = 'api/labs/' + this.labId + '/spaces/' + item.id;
                }
                if (this.depTeamId !== undefined) {
                    url = 'api/department-teams/' + this.depTeamId + '/spaces/' + item.id;
                }
                urlDeleteLab.push({
                    url: url
                });
                Promise.all(
                    urlDeleteLab.map(el =>
                        this.$http.delete(el.url,
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                    )
                .then(() => {
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
        showMap (map) {
            this.dialogMaps = true;
            this.currentMap = map;
            this.$set(this.currentMap, 'final_link',
                this.publicPath  + '/images/dq-spaces/' + map.link
            );
            this.$set(this.currentMap, 'options', { initialZoom: 1 });
            if (this.$refs.mapImage !== undefined) {
                this.$refs.mapImage.$panZoomInstance.moveTo(0, 0);
                this.$refs.mapImage.$panZoomInstance.zoomAbs( 0, 0, 1 );
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