<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Your Team Publications</h3>
        </div>
    </v-card-title>
    <v-card-text>
        {{labData}}
    </v-card-text>
    <v-container>
        <v-form ref="form" class="pa-4"
                @submit.prevent="submitForm">
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
                                        @click="dissociateItem(item)">mdi-link</v-icon>
                                </template>
                                <span>Publication associatd with team.<br>
                                    Click to dissociate.
                                </span>
                            </v-tooltip>
                        </v-col>
                        <v-col cols="6" v-if="item.dissociate">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-icon
                                        v-on="on"
                                        color="red darken-1"
                                        @click="associateItem(item)">mdi-link-off</v-icon>
                                </template>
                                <span>Association to publication will be removed.<br>
                                    Click to undo the removal this association.
                                </span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
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
import time from '@/components/common/date-utils'
import {orderBy} from 'lodash'
import XLSX from 'xlsx'

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
    props: {
        labId: Number,
        labData: Object,
        labPositions: Array,
        myLabs: Array,
        publications: Array,
    },
    data() {
        return {
            dialog: false,
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
                { text: 'Status', value: 'action', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                publications: [],
            },
            toUpdate: [],
            toDissociate: [],
        }
    },
    mounted () {
        this.initialize();

    },
    watch: {
        labId () {
            this.initialize();
        },
        publications () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            this.data.publications = this.publications;
            this.onResize();
        },
        submitForm() {
            if (this.$store.state.session.loggedIn) {
                let urlDelete = [];
                let urlUpdate = [];
                let publications = this.data.publications;
                this.progress = true;
                for (let ind in publications) {
                    if (publications[ind].toUpdate && !publications[ind].dissociate) {
                        urlUpdate.push({
                            url: 'api/labs/' + this.labId
                                    + '/publications/' + publications[ind].id,
                            body: publications[ind],
                        });
                    } else if (publications[ind].toUpdate && publications[ind].dissociate) {
                        urlDelete.push('api/labs/' + this.labId
                                    + '/publications/' + publications[ind].id
                        );
                    }
                }
                this.$http.all(
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
                    .then(this.$http.spread( () => {
                        this.progress = false;
                        this.success = true;
                        setTimeout(() => {this.success = false;}, 1500)
                        this.toDelete = [];
                        this.toUpdate = [];
                        this.$root.$emit('updateLabPublications')
                        this.initialize();
                    }))
                    .catch((error) => {
                        this.progress = false;
                        this.error = true;
                        this.toDelete = [];
                        this.toUpdate = [];
                        this.initialize();
                        setTimeout(() => {this.error = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    })
            }
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
            let itemsCurated = processForSpreadsheet(items);

            let wb = XLSX.utils.book_new();
            let ws  = XLSX.utils.json_to_sheet(itemsCurated);
            XLSX.utils.book_append_sheet(wb, ws, 'Team Publications');
            let filename = this.labData.name.replace(/[^a-z0-9]/gi, '_')
            XLSX.writeFile(wb, filename + '_publications_' + dateFile + '.xlsx');
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
        cutLargeString (value, maxLength) {
            if (value.length > maxLength) {
                return value.substring(0, maxLength) + ' ...';
            } else {
                return value;
            }
        },
    },






}
</script>

<style>

</style>