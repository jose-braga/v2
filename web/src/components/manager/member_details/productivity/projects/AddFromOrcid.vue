<template>
<v-card flat>
    <v-card-title primary-title>
    </v-card-title>
    <v-card-text>Search your ORCID profile (only publicly accessible data).
        Search results will show only projects that are
        <b>not part of the LAQV/UCIBIO database</b>.<br>
        Should a warning about a slow script appear, you can safely choose "Wait".
        <br> Each ORCID record might have several versions, so select the version to be added in the details.


    </v-card-text>
    <v-container>
        <v-form ref="form" class="pa-4"
                @submit.prevent="submitForm">
            <v-row>
                <v-btn @click="getORCIDProjects()"
                        :disabled="orcidError"
                >
                    {{ orcidMessage }}
                </v-btn>
                <div class="request-status-container ml-2">
                    <v-progress-circular indeterminate
                            v-show="progressORCID"
                            :size="20" :width="2"
                            color="primary">
                    </v-progress-circular>
                </div>
                <div v-show="progressORCID">
                    {{ messageORCIDRequest }}
                </div>
            </v-row>
            <v-data-table v-if="finishedGetORCID"
                    item-key="id"
                    :headers="headers"
                    :footer-props="footerProps"
                    :items="data.projects"
                    :items-per-page="10"

                    :sort-by="['end_show', 'start_show', 'title_show']"
                    :sort-desc="[true, true, false]"
                    multi-sort

                    class='mt-4'
            >
                <template v-slot:top>
                    <v-dialog v-model="dialog" max-width="1600px">
                        <ProjectDetails
                            :project-data="editedItem"
                            :other-person-id="personId"
                            :endpoint="endpoint"
                        >
                        </ProjectDetails>
                    </v-dialog>
                </template>
                <!--
                <template v-slot:item.associate="{ item }">
                    <v-checkbox
                        v-model="item.to_associate"
                        disabled
                    ></v-checkbox>
                </template>
                -->
                <template v-slot:item.details="{ item }">
                    <v-row class="pr-2">
                        <v-col cols="6">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-icon v-on="on"
                                        @click="editItem(item)">mdi-file-document-multiple
                                    </v-icon>
                                </template>
                                <span>View details</span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table>
        </v-form>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

import ProjectDetails from './ProjectDetailsORCID'

function compareTwoStrings(first, second) {
    //https://github.com/aceakash/string-similarity/blob/master/compare-strings.js
    first = first.replace(/\s+/g, '')
    second = second.replace(/\s+/g, '')

    if (!first.length && !second.length) return 1;                   // if both are empty strings
    if (!first.length || !second.length) return 0;                   // if only one is empty string
    if (first === second) return 1;       							 // identical
    if (first.length === 1 && second.length === 1) return 0;         // both are 1-letter strings
    if (first.length < 2 || second.length < 2) return 0;			 // if either is a 1-letter string

    let firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
        const bigram = first.substr(i, 2);
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram) + 1
            : 1;

        firstBigrams.set(bigram, count);
    }

    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
        const bigram = second.substr(i, 2);
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram)
            : 0;

        if (count > 0) {
            firstBigrams.set(bigram, count - 1);
            intersectionSize++;
        }
    }

    return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

export default {
    props: {
        personId: Number,
        managerId: Number,
        endpoint: String,
    },
    components: {
        ProjectDetails,
    },
    data() {
        return {
            orcidError: false,
            orcidMessage: '',
            messageORCIDRequest: '',
            dialog: false,
            editedIndex: -1,
            editedItem: {},
            errorBeforeSubmit: false,
            messageErrorBeforeSubmit: '',
            progress: false,
            success: false,
            error: false,
            formError: false,
            progressORCID: false,
            finishedGetORCID: false,
            headers: [
                { text: 'Title', value:'title_show' },
                { text: 'Start', value:'start_show' },
                { text: 'End', value:'end_show' },
                //{ text: 'To add', value: 'associate', sortable: false},
                { text: 'Details', value: 'details', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                orcid: undefined,
                projectsDB: [],
                projects: [],
            },

        }
    },
    mounted() {
        this.initialize();
        this.$root.$on('addedProjectToDB',
            () => {
                this.dialog = false;
                this.getORCIDProjects();
            }
        );
    },
    watch: {
        personId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            this.getORCID();
        },
        getORCID () {
            if (this.$store.state.session.loggedIn) {
                let personID = this.personId;
                let urlSubmit = 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/researcher-ids';
                subUtil.getInfoPopulate(this, urlSubmit, false)
                .then( (result) => {
                    if (result !== undefined) {
                        this.data.orcid = result.ORCID;
                    }
                    if (this.data.orcid === undefined
                            || this.data.orcid === null
                            || this.data.orcid === ''
                            || result === undefined) {
                        this.orcidError = true;
                        this.orcidMessage = 'Missing ORCID!';
                    } else {
                        this.orcidError = false;
                        this.orcidMessage = 'Get from ' + this.data.orcid;
                    }
                });
            }
        },
        getORCIDProjects () {
            let projects = [];
            let filteredProjects = [];
            let baseURL = 'https://pub.orcid.org';
            let version = 'v3.0';
            let resource = 'fundings';
            let urlORCID = baseURL
                        + '/' + version
                        + '/' + this.data.orcid
                        + '/' + resource;
            this.progressORCID = true;
            if (this.$store.state.session.loggedIn) {
                let personID = this.otherPersonId;
                let urlSubmit = 'api' + this.endpoint
                                + '/members'
                                + '/' + personID  + '/all-projects';
                this.messageORCIDRequest = 'Getting ORCID projects missing from DB';
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    this.data.projectsDB = result;
                    return this.$http.get(urlORCID, {
                        headers: { 'Accept': 'application/json' },
                    })
                })
                .then( (result) => {
                    projects = result.data.group;
                    // filter projects
                    for (let ind in projects) {
                        let projectTitles = [];
                        let startDates = [];
                        let endDates = [];
                        for (let ind2 in projects[ind]['funding-summary']) {
                            let summary = projects[ind]['funding-summary'][ind2];
                            if (summary.title !== null && summary.title !== undefined) {
                                if (summary.title['title'] !== null && summary.title['title'] !== undefined) {
                                    if (summary.title['title'].value !== null && summary.title['title'].value !== null) {
                                        if (projectTitles.indexOf(summary.title['title'].value) === -1) {
                                            projectTitles.push(summary.title['title'].value)
                                        }
                                    }
                                }
                                if (summary.title['translated-title'] !== null && summary.title['translated-title'] !== undefined) {
                                    if (summary.title['translated-title'].value !== null && summary.title['translated-title'].value !== null) {
                                        if (projectTitles.indexOf(summary.title['translated-title'].value) === -1) {
                                            projectTitles.push(summary.title['translated-title'].value)
                                        }
                                    }
                                }
                            }
                            let dateStart = ''
                            let dateEnd = ''
                            if (summary['start-date'] !== null && summary['start-date'] !== undefined) {
                                if (summary['start-date'].year !== null && summary['start-date'].year !== undefined) {
                                    if (summary['start-date'].year.value !== null && summary['start-date'].year.value !== undefined) {
                                        dateStart = dateStart + summary['start-date'].year.value;
                                    }
                                }
                                if (summary['start-date'].month !== null && summary['start-date'].month !== undefined) {
                                    if (summary['start-date'].month.value !== null && summary['start-date'].month.value !== undefined) {
                                        dateStart = dateStart + '-' + summary['start-date'].month.value;
                                    }
                                }
                                if (summary['start-date'].day !== null && summary['start-date'].day !== undefined) {
                                    if (summary['start-date'].day.value !== null && summary['start-date'].day.value !== undefined) {
                                        dateStart = dateStart + '-' + summary['start-date'].day.value;
                                    }
                                }
                            }
                            if (summary['end-date'] !== null && summary['end-date'] !== undefined) {
                                if (summary['end-date'].year !== null && summary['end-date'].year !== undefined) {
                                    if (summary['end-date'].year.value !== null && summary['end-date'].year.value !== undefined) {
                                        dateEnd = dateEnd + summary['end-date'].year.value;
                                    }
                                }
                                if (summary['end-date'].month !== null && summary['end-date'].month !== undefined) {
                                    if (summary['end-date'].month.value !== null && summary['end-date'].month.value !== undefined) {
                                        dateEnd = dateEnd + '-' + summary['end-date'].month.value;
                                    }
                                }
                                if (summary['end-date'].day !== null && summary['end-date'].day !== undefined) {
                                    if (summary['end-date'].day.value !== null && summary['end-date'].day.value !== undefined) {
                                        dateEnd = dateEnd + '-' + summary['end-date'].day.value;
                                    }
                                }
                            }
                            startDates.push(dateStart)
                            endDates.push(dateEnd)
                        }
                        let found = false;
                        for (let indDB in this.data.projectsDB) {
                            let dbTitle = this.data.projectsDB[indDB].title;
                            if (dbTitle !== null && dbTitle !== undefined) {
                                for (let indProjTitle in projectTitles) {
                                    if (compareTwoStrings(projectTitles[indProjTitle],dbTitle) > 0.95) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (found) {
                                    break;
                                }
                            }
                        }
                        if (!found) {
                            projects[ind].orcid_person = this.data.orcid;
                            projects[ind].title_show = projectTitles[0];
                            projects[ind].start_show = startDates[0];
                            projects[ind].end_show = endDates[0];
                            filteredProjects.push(projects[ind]);
                        }
                    }
                    this.data.projects = filteredProjects;
                    this.progressORCID = false;
                    this.finishedGetORCID = true;
                })
            }
        },
        editItem (item) {
            this.dialog = true;
            this.editedIndex = this.data.projects.indexOf(item);
            this.editedItem = item;
        },
    }

}
</script>

<style>

</style>