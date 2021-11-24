<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Your Publications</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container>
        <v-form ref="form" class="pa-4"
                @submit.prevent="submitForm">
            <v-row class="mb-2" align="center">
                <span class="blue--text show-clickable" @click="changeTab()">Click to add more publications</span>
                <v-btn text icon large
                        @click="changeTab()"
                        color="blue"
                        class="ml-1"
                >
                    <v-icon>mdi-page-next</v-icon>
                </v-btn>
            </v-row>
            <v-row align-content="center" justify="end">
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Save</v-btn>
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
            <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
                class="px-2 mb-4"
            ></v-text-field>
            <v-data-table
                item-key="id"
                :search="search"
                :headers="headers"
                :footer-props="footerProps"
                :items="data.publications"
                :items-per-page="10"
                :custom-sort="customSort"
                :sort-by="['year', 'title_show']"
                :sort-desc="[true, false]"
                multi-sort
                v-resize="onResize"
            >
                <template v-slot:top>
                    <v-dialog v-model="dialog"
                        max-width="1600px"
                        width="100%"
                    >
                        <PublicationDetails
                            :person-publication-id="editedItem.id"
                            :publication-updated="editedItem.updated"
                            :publication-data="editedItem"
                        >
                        </PublicationDetails>
                    </v-dialog>
                </template>

                <template v-slot:item.visible="{ item }">
                    <v-checkbox
                        v-model="item.public"
                        @change="markToUpdate(item)"
                    ></v-checkbox>
                </template>
                <template v-slot:item.highlight="{ item }">
                    <v-checkbox
                        v-model="item.selected"
                        @change="markToUpdate(item)"
                    ></v-checkbox>
                </template>
                <template v-slot:item.action="{ item }">
                    <v-row class="pr-2">
                        <v-col cols="6" v-if="!item.dissociate">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-icon
                                        v-on="on"
                                        color="green darken-1"
                                        @click="dissociateItem(item)">mdi-account-plus</v-icon>
                                </template>
                                <span>You are associated to publication.<br>
                                    Click to tag this association for removal.
                                </span>
                            </v-tooltip>
                        </v-col>
                        <v-col cols="6" v-if="item.dissociate">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-icon
                                        v-on="on"
                                        color="red darken-1"
                                        @click="associateItem(item)">mdi-account-remove</v-icon>
                                </template>
                                <span>Association to publication will be removed.<br>
                                    Click to undo the removal this association.
                                </span>
                            </v-tooltip>
                        </v-col>
                        <v-col cols="6">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-icon v-on="on"
                                        @click="editItem(item)">mdi-pencil</v-icon>
                                </template>
                                <span>View & edit details</span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table>
            <v-row align-content="center" justify="end" class="mt-4">
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Save</v-btn>
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
            <v-row justify="center" align="center" class="mt-1">
                <v-col cols="12" align="center">
                    <v-row justify="center" align="center">
                        <span class="mr-4">Export to spreadsheet</span>
                        <v-btn fab color="green" @click="generateSpreadsheet(data.publications, labData)">
                            <v-icon color="white" x-large>mdi-file-excel</v-icon>
                        </v-btn>
                    </v-row>
                </v-col>
            </v-row>
        </v-form>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'
import {orderBy} from 'lodash'
import XLSX from 'xlsx'

import PublicationDetails from './PublicationDetails'

function processForSpreadsheet(items) {
    let itemsCurated = [];
    for (let ind in items) {
        let thisItem = {};
        thisItem.authors_raw = items[ind].authors_raw;
        thisItem.title = items[ind].title;
        thisItem.journal_name = items[ind].journal_name;
        thisItem.journal_short_name = items[ind].journal_short_name;
        thisItem.volume = items[ind].volume;
        thisItem.page_start = items[ind].page_start;
        thisItem.page_end = items[ind].page_end;
        thisItem.doi = items[ind].doi;
        thisItem.wos = items[ind].wos;
        thisItem.pubmed_id = items[ind].pubmed_id;
        let pubDescription = ''
        for (let indTypes in items[ind].publication_types) {
            pubDescription = pubDescription
                + items[ind].publication_types[indTypes].name_en + ';';
        }
        thisItem.publication_type = pubDescription;

        thisItem.publication_date = items[ind].publication_date;
        thisItem.year = items[ind].year;
        itemsCurated.push(thisItem);
    }
    return itemsCurated;
}

export default {
    components: {
        PublicationDetails,
    },
    props: {
        currentTab: String,
    },
    data() {
        return {
            dialog: false,
            editedIndex: -1,
            editedItem: {},
            progress: false,
            success: false,
            error: false,
            formError: false,
            search: '',
            headers: [
                { text: 'Title', value:'title_show' },
                { text: 'Authors', value:'authors_raw_show' },
                { text: 'Journal', value:'journal_short_name' },
                { text: 'Year', value:'year' },
                { text: 'Visible', value: 'visible', sortable: false},
                { text: 'Highlight', value: 'highlight', sortable: false},
                { text: 'Actions', value: 'action', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                publications: [],
            },
            toUpdate: [],
        }
    },
    computed: {},
    watch: {
        currentTab () {
            if (this.currentTab === '/person/productivity/publications') {
                this.initialize();
            }
        },
    },
    mounted() {
        this.initialize();
        //this.onResize();
        this.$root.$on('updateSinglePublication', (personPublicationID) => {
            // your code goes here
            this.initialize('updated-single-publication', personPublicationID);
        });
    },
    methods: {
        initialize (evt, id) {
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                let urlSubmit = 'api/people/' + personID + '/publications';
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    let indexFound;
                    for (let ind in result) {
                        result[ind].title_show = result[ind].title;
                        result[ind].authors_raw_show = result[ind].authors_raw;
                        if (evt === 'updated-single-publication') {
                            if (result[ind].id === id) {
                                indexFound = ind;
                            }
                        }
                    }
                    this.data.publications = result;
                    this.onResize();
                    if (evt === 'updated-single-publication') {
                        this.editItem(this.data.publications[indexFound]);
                    }
                })
            }
        },
        submitForm() {
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                let urlDelete = [];
                let urlUpdate = [];
                let publications = this.data.publications;
                this.progress = true;
                for (let ind in publications) {
                    if (publications[ind].toUpdate && !publications[ind].dissociate) {
                        urlUpdate.push({
                            url: 'api/people/' + personID
                                    + '/people-publications/' + publications[ind].publication_id,
                            body: publications[ind],
                        });
                    } else if (publications[ind].toUpdate && publications[ind].dissociate) {
                        urlDelete.push('api/people/' + personID
                                    + '/people-publications/' + publications[ind].publication_id
                        );
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
                        .concat(
                            urlDelete.map(el =>
                                this.$http.delete(el,
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                })))
                    )
                    .then( () => {
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
        editItem (item) {
            item.citations_last_year = {};
            item.impact_factor_last_year = {};
            this.dialog = true;
            this.editedIndex = this.data.publications.indexOf(item);
            this.editedItem = item;
        },
        changeTab() {
            this.$router.push('/person/productivity/add-publications')
        },
        dissociateItem(item) {
            this.$set(item, 'dissociate', true);
            this.$set(item, 'toUpdate', true);
        },
        associateItem(item) {
            this.$set(item, 'dissociate', false);
            this.$set(item, 'toUpdate', true);
        },
        markToUpdate(item) {
            this.$set(item, 'toUpdate', true);
        },
        generateSpreadsheet(items) {
            let today = time.moment();
            let dateFile = time.momentToDate(today, 'Europe/Lisbon', 'YYYY-MM-DDTHHmmss')
            let username = this.$store.state.session.username;
            let itemsCurated = processForSpreadsheet(items);

            let wb = XLSX.utils.book_new();
            let ws  = XLSX.utils.json_to_sheet(itemsCurated);
            XLSX.utils.book_append_sheet(wb, ws, 'My Publications');
            XLSX.writeFile(wb, username + '_publications_' + dateFile + '.xlsx');
        },
        customSort (items, sortBy, sortDesc) {
            let funcOrderArray = [];
            let directionArray = [];
            for (let ind in sortBy) {
                if (sortDesc[ind] === false) {
                    directionArray.push('asc');
                } else {
                    directionArray.push('desc');
                }
                funcOrderArray.push(
                    function (el) {
                        let levels = sortBy[ind].split('.');
                        let thisLevel = el;
                        for (let indLevel in levels) {
                            thisLevel = thisLevel[levels[indLevel]];
                            if (thisLevel === undefined) {
                                break;
                            }
                        }
                        return thisLevel;
                    }
                )

            }
            items = orderBy(items, funcOrderArray, directionArray);

            return items
        },
        cutLargeString (value, maxLength) {
            if (value.length > maxLength) {
                return value.substring(0, maxLength) + ' ...';
            } else {
                return value;
            }
        },
        onResize() {
            if (this.$vuetify.breakpoint.mdAndDown) {
                for (let ind in this.data.publications) {
                    this.data.publications[ind].title_show = this.cutLargeString(this.data.publications[ind].title, 50);
                    this.data.publications[ind].authors_raw_show = this.cutLargeString(this.data.publications[ind].authors_raw, 50);
                }
            } else {
                for (let ind in this.data.publications) {
                    this.data.publications[ind].title_show = this.data.publications[ind].title;
                    this.data.publications[ind].authors_raw_show = this.data.publications[ind].authors_raw;
                }
            }
        },
    },

}
</script>

<style scoped>
.show-clickable {
    cursor: pointer;
    font-size: 0.9rem;
}

.to-delete {
    background-color: lightslategray;
}

</style>
