<template>
<v-card flat>
    <v-card-title primary-title>
    </v-card-title>
    <v-card-text>Search database for publications.<br>
        Search results will show only publications that are
        <b>not already associated with you</b>.
    </v-card-text>
    <v-container>
        <v-form ref="form" class="pa-4"
                @submit.prevent="submitForm">
            <v-row>
                <v-col cols="12" md="6">
                    <v-text-field
                        v-model="searchAuthors"
                        @input="searchPublications(searchAuthors, searchTitle)"
                        append-icon="mdi-magnify"
                        label="Search authors (char > 3)"
                        single-line
                        hide-details
                        class="px-2 mb-4"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field
                        v-model="searchTitle"
                        @input="searchPublications(searchAuthors, searchTitle)"
                        append-icon="mdi-magnify"
                        label="Search titles (char > 3)"
                        single-line
                        hide-details
                        class="px-2 mb-4"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-data-table
                item-key="id"
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
                    <v-dialog v-model="dialog" max-width="1600px">
                        <PublicationDetails
                            :publication-id="editedItem.publication_id"
                            :publication-data="editedItem"
                        >
                        </PublicationDetails>
                    </v-dialog>
                </template>

                <template v-slot:item.associate="{ item }">
                    <v-checkbox
                        v-model="item.to_associate"
                    ></v-checkbox>
                </template>
                <template v-slot:item.action="{ item }">
                    <v-row class="pr-2">
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
                        outlined color="blue">Add to your publications</v-btn>
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
        </v-form>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import {orderBy} from 'lodash'

import PublicationDetails from './PublicationDetails'

export default {
    components: {
        PublicationDetails,
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
            searchTitle: '',
            searchAuthors: '',
            headers: [
                { text: 'Title', value:'title_show' },
                { text: 'Authors', value:'authors_raw_show' },
                { text: 'Journal', value:'journal_short_name' },
                { text: 'Year', value:'year' },
                { text: 'To add', value: 'associate', sortable: false},
                { text: 'Actions', value: 'action', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                publications: [],
            }

        }
    },
    mounted() {
        this.$root.$on('updateSingleAddPublicationDatabase',
            (publicationData) => {
                this.updateData(publicationData);
            }
        );
    },
    methods: {
        searchPublications (authors, titles) {
            let minimumLength = 3;
            if (authors.length > minimumLength || titles.length > minimumLength) {
                let personID = this.$store.state.session.personID;
                let urlSubmit = 'api/people/' + personID + '/publications'
                                + '?';
                if (authors.length > minimumLength && titles.length > minimumLength) {
                    urlSubmit = urlSubmit + 'authors=' + authors + '&title=' + titles;
                } else if (authors.length > minimumLength) {
                    urlSubmit = urlSubmit + 'authors=' + authors;

                } else if (titles.length > minimumLength) {
                    urlSubmit = urlSubmit + 'title=' + titles;
                }
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    for (let ind in result) {
                        result[ind].title_show = result[ind].title;
                        result[ind].authors_raw_show = result[ind].authors_raw;
                    }
                    this.data.publications = result;
                    this.onResize();
                })
            } else {
                this.data.publications = [];
            }
        },
        updateData (publicationData) {
            for (let ind in this.data.publications) {
                if (this.data.publications[ind].publication_id === publicationData.publication_id) {
                    this.$set(this.data.publications, ind, publicationData);
                    this.onResize();
                    break;
                }
            }
        },
        submitForm() {
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                let urlCreate = []; //create person-publication association, then update publications
                let urlUpdatePublications = [];
                let publications = this.data.publications;
                this.progress = true;
                for (let ind in publications) {
                    if (publications[ind].to_associate) {
                        urlCreate.push({
                            url: 'api/people/' + personID
                                    + '/people-publications/' + publications[ind].publication_id,
                            body: publications[ind],
                        });
                        urlUpdatePublications.push({
                            url: 'api/people/' + personID
                                    + '/publications/' + publications[ind].publication_id,
                            body: publications[ind],
                        });
                    }
                }
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
                    return Promise.all(urlUpdatePublications.map(el =>
                        this.$http.put(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']},
                            }
                        )
                    ));
                })
                .then( () => {
                    this.progress = false;
                    this.success = true;
                    this.$root.$emit('updateCompleteness');
                    setTimeout(() => {this.success = false;}, 1500)
                    this.toDelete = [];
                    this.searchPublications (this.searchAuthors, this.searchTitle);
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    this.toDelete = [];
                    this.searchPublications (this.searchAuthors, this.searchTitle);
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

</style>