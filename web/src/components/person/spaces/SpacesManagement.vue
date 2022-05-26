<template>
<v-card>
    <!-- For managing space associations at the person level -->
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Spaces associated to you</h3>
        </div>
    </v-card-title>
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
                <v-col cols="12" sm="2">
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
                    <v-select v-model="data.newSpaces.role_id"
                        :items="spaceRoles" item-value="id" item-text="name_pt"
                        label="Role">
                    </v-select>
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
                <v-col cols="12" sm="2">
                    <v-textarea
                        v-model="data.newSpaces.comments"
                        label="Comments"
                        rows="1"
                    ></v-textarea>
                </v-col>
                <v-col cols="1" align-self="center">
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
                <v-col>
                    <v-divider></v-divider>
                </v-col>
                <v-dialog v-model="dialogMaps"
                    width="100%"
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
            <ul class="mt-4">
                <li v-for="(space, i) in data.spaces" class="mt-2"
                    :key="i"
                >
                    Room <b>{{space.reference}} - {{space.space_name_pt}}</b>
                    <span class="ml-1 space-type">({{space.space_type_name_pt}})</span>:
                    <span v-for="(role, j) in space.roles" class="mt-2"
                        :key="i + '-' + j">
                        <span class="role-name">{{role.space_role_name_pt}}</span>
                        <span class="dates">{{role.dates_show}}</span>
                    </span>
                    <v-icon @click="editItem(space)"
                        class="ml-2"
                    >mdi-pencil</v-icon>
                </li>
            </ul>
        </v-form>
    </v-container>
    <v-dialog v-model="dialog"
        width="100%"
        max-width="1600px"
    >
        <SpaceDetails
            :item-id="editedItem.space_id"
            :person-id="editedItem.person_id"
            :space-data="editedItem"
        >
        </SpaceDetails>
    </v-dialog>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'
const SpaceDetails = () => import(/* webpackChunkName: "space-person-details" */ './SpacePersonDetails')

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
            formError: false,
            editedIndex: -1,
            editedItem: {},
            addingNewSpace: false,
            data: {
                newSpaces: {},
                spaces: [],
            },
            maps: [
                {name: 'Piso 0 - Ambiente', link:'Piso-0-Ambiente-2021.jpg'},
                {name: 'Piso 1 - Ambiente', link:'Piso-1-Ambiente-2021.jpg'},
                {name: 'Piso 2 - Ambiente', link:'Piso-2-Ambiente-2021.jpg'},
                {name: 'Piso 3 - Ambiente', link:'Piso-3-Ambiente-2021.jpg'},
                {name: 'Piso 4 - Ambiente', link:'Piso-4-Ambiente-2021.jpg'},
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
            spaces: [],
            spaceRoles: [],
            searchSpaces: '',
        }
    },
    mounted() {
        this.initialize();
        this.getSpaces();
        this.getSpaceRoles();
        this.$root.$on('updatePersonSpacesTable',
            () => {
                this.initialize();
            }
        );
    },
    methods: {
        initialize () {
            let personID = this.$store.state.session.personID;
            const urlSubmit = 'api/people/' + personID + '/spaces';
            return subUtil.getInfoPopulate(this, urlSubmit, true)
            .then((result) => {
                for (let ind in result){

                    for (let indRole in result[ind].roles){
                        let date_text = ''
                        let role = result[ind].roles[indRole];
                        let valid_from = '...'
                        let valid_until = '...'
                        if (role.valid_from !== null) {
                            valid_from = time.momentToDate(role.valid_from);
                            role.valid_from = valid_from;
                        }
                        if (role.valid_until !== null) {
                            valid_until = time.momentToDate(role.valid_until);
                            role.valid_until = valid_until;
                        }
                        date_text = date_text + ' (' + valid_from + ' - '+  valid_until + '), '
                        result[ind].roles[indRole].dates_show = date_text;
                    }

                }
                this.data.spaces = result;
            })
            .catch( (error) => {
                console.log(error);
            })
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreate = [];
                let personID = this.$store.state.session.personID;
                urlCreate.push({
                    url: 'api/people/' + personID
                        + '/spaces',
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
                    this.data.newSpaces = {}
                    this.addingNewStudent = false;
                    this.initialize();
                })
                .catch((error) => {
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
        getSpaceRoles () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'space-roles';
                return subUtil.getPublicInfo(vm, urlSubmit, 'spaceRoles');
            }
        },
        showNewSpace () {
            this.addingNewSpace = !this.addingNewSpace;
        },
        editItem (item) {
            this.dialog = true;
            this.editedIndex = this.data.spaces.indexOf(item);
            this.editedItem = item;
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
    },
}
</script>

<style scoped>
.space-type {
    font-style: oblique;
}
.role-name {
    font-size: 1rem;
}
.dates {
    font-size: 0.7rem;
}

</style>