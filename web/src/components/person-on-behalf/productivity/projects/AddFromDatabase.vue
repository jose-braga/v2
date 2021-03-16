<template>
<v-card flat>
    <v-card-title primary-title>
    </v-card-title>
    <v-card-text>Search database for projects.<br>
        Search results will show only projects that are
        <b>not already associated with you</b>.
    </v-card-text>
    <v-container>
        <v-form ref="form" class="px-4"
                @submit.prevent="submitForm">
            <v-row>
                <v-col cols="12">
                    <v-text-field
                        v-model="search"
                        @input="searchProjects(search)"
                        append-icon="mdi-magnify"
                        label="Search title, acronym or reference (char > 3)"
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
                :items="data.projects"
                :items-per-page="10"
                :sort-by="['end_show','start_show','title_show']"
                :sort-desc="[true, true, false]"
                multi-sort
            >
                <template v-slot:item.associate="{ item }">
                    <v-checkbox
                        v-model="item.to_associate"
                    ></v-checkbox>
                </template>
            </v-data-table>
            <v-row align-content="center" justify="end" class="mt-4">
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Add to your projects</v-btn>
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
import time from '@/components/common/date-utils'

//import ProjectDetails from './ProjectDetailsDatabase'

export default {
    components: {
        //ProjectDetails,
    },
    props: {
        otherPersonId: Number,
    },
    data() {
        return {
            //dialog: false,
            //editedIndex: -1,
            //editedItem: {},
            progress: false,
            success: false,
            error: false,
            formError: false,
            search: '',
            headers: [
                { text: 'Title', value:'title_show' },
                { text: 'Acronym, Reference', value:'reference_show' },
                { text: 'Start', value:'start_show' },
                { text: 'End', value:'end_show' },
                { text: 'To add', value: 'associate', sortable: false},
                //{ text: 'Details', value: 'details', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                projects: [],
            },
        }
    },
    methods: {
        searchProjects (search) {
            let minimumLength = 3;
            if (search.length > minimumLength) {
                this.data.projects = [];
                let personID = this.otherPersonId;
                let urlSubmit = 'api/people/' + personID + '/all-projects'
                                + '?';
                urlSubmit = urlSubmit + 'q=' + search;
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    for (let ind in result) {
                        result[ind].title_show = result[ind].title;
                        let startDate = '...';
                        if (result[ind].start) {
                            startDate = time.momentToDate(result[ind].start)
                            result[ind].start = time.momentToDate(result[ind].start);
                        }
                        result[ind].start_show = startDate;
                        let endDate = '...';
                        if (result[ind].end) {
                            endDate = time.momentToDate(result[ind].end)
                            result[ind].end = time.momentToDate(result[ind].end)
                        }
                        result[ind].end_show = endDate;
                        if (result[ind].acronym !== null && result[ind].acronym !== ''
                            && result[ind].reference !== null && result[ind].reference !== ''
                        ) {
                            result[ind].reference_show = result[ind].acronym + ', ' + result[ind].reference;
                        } else if (result[ind].acronym !== null && result[ind].acronym !== '') {
                            result[ind].reference_show = result[ind].acronym;
                        } else if (result[ind].reference !== null && result[ind].reference !== '') {
                            result[ind].reference_show = result[ind].reference;
                        } else {
                            result[ind].reference_show = '';
                        }
                    }

                    this.data.projects = result;
                })
            } else {
                this.data.projects = [];
            }
        },
        submitForm() {
            if (this.$store.state.session.loggedIn) {
                let personID = this.otherPersonId;
                let urlCreate = []; //create person-project association
                let projects = this.data.projects;
                this.progress = true;
                for (let ind in projects) {
                    if (projects[ind].to_associate) {
                        urlCreate.push({
                            url: 'api/people/' + personID
                                    + '/projects/' + projects[ind].id,
                            body: projects[ind],
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
                    this.progress = false;
                    this.success = true;
                    this.$root.$emit('updatedProject')
                    this.searchProjects(this.search);
                    setTimeout(() => {
                        this.success = false;
                    }, 1500)
                })
                .catch((error) => {
                    this.progress = false;
                    this.searchProjects(this.search);
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })

            }

        },

        /*
        editItem (item) {
            this.dialog = true;
            this.editedIndex = this.data.projects.indexOf(item);
            this.editedItem = item;
        },
        */
    },

}
</script>

<style>

</style>