<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Publications from team members</h3>
        </div>
    </v-card-title>
    <v-card-text>
    </v-card-text>
    <v-container>
        <v-form ref="form" class="pa-4"
                @submit.prevent="submitForm">
            <v-row align-content="center" justify="end" class="mt-4">
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Associate to Lab</v-btn>
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
                show-select
                multi-sort
                v-resize="onResize"
                @input="getSelected"
            >
            </v-data-table>
            <v-row align-content="center" justify="end" class="mt-4">
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Associate to Lab</v-btn>
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
import {orderBy} from 'lodash'


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
                //{ text: 'Actions', value: 'action', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                publications: [],
                selectedPublications: [],
            },
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
            this.data.selectedPublications = [];
            this.onResize();
        },
        submitForm() {
            if (this.$store.state.session.loggedIn) {
                let urlCreateAssociation = [];
                let publications = this.data.selectedPublications;
                this.progress = true;
                for (let ind in publications) {
                    urlCreateAssociation.push({
                        url: 'api/labs/' + this.labId
                                + '/publications',
                        body: {
                            publication: publications[ind],
                            labData: this.labData
                        },
                    });
                }
                Promise.all(
                    urlCreateAssociation.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            {
                                headers: { 'Authorization': 'Bearer ' + localStorage['v2-token'] },
                            }
                    ))
                )
                .then( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.toDelete = [];
                    this.$root.$emit('updateLabPublications')
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
        getSelected(pub) {
            this.data.selectedPublications = pub;
        }
    },

}
</script>

<style>

</style>