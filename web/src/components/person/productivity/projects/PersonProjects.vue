<template>
<v-card flat>
    <v-container>
        <v-data-table
            item-key="id"
            :headers="headers"
            :footer-props="footerProps"
            :items="data.projects"
            :items-per-page="10"

            :sort-by="['project_details.end_show', 'project_details.start_show', 'project_details.title']"
            :sort-desc="[true, true, false]"
            multi-sort

            class='mt-4'
        >
            <template v-slot:top>
                <v-dialog v-model="dialog" max-width="1600px">
                    <ProjectDetails
                        :project-data="editedItem"
                        :project-id="itemID"
                    >
                    </ProjectDetails>
                </v-dialog>
            </template>
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
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

import ProjectDetails from './ProjectDetails'

export default {
    props: {
         currentTab: String,
    },
    components: {
        ProjectDetails,
    },

    data() {
        return {
            dialog: false,
            itemID: undefined,
            editedIndex: -1,
            editedItem: {},
            headers: [
                { text: 'Title', value:'project_details.title' },
                { text: 'Start', value:'project_details.start_show' },
                { text: 'End', value:'project_details.end_show' },
                //{ text: 'To add', value: 'associate', sortable: false},
                { text: 'Details', value: 'details', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                projects: [],
            }
        }
    },
    mounted() {
        this.initialize();
        this.$root.$on('updatedProject',
            () => {
                this.initialize();
            }
        );
        this.$root.$on('addedProjectToDB',
            () => {
                this.initialize();
            }
        );
    },
    watch: {
        currentTab () {
            if (this.currentTab === '/person/productivity/projects') {
                this.initialize();
            }
        },
    },
    methods: {
        initialize () {
            let personID = this.$store.state.session.personID;
            let urlSubmit = 'api/people/' + personID  + '/projects';
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then( (result) => {
                for (let ind in result) {
                    let startDate = '...';
                    if (result[ind].project_details.start) {
                        startDate = time.momentToDate(result[ind].project_details.start)
                        result[ind].project_details.start = time.momentToDate(result[ind].project_details.start);
                    }
                    result[ind].project_details.start_show = startDate;
                    let endDate = '...';
                    if (result[ind].project_details.end) {
                        endDate = time.momentToDate(result[ind].project_details.end)
                        result[ind].project_details.end = time.momentToDate(result[ind].project_details.end)
                    }
                    result[ind].project_details.end_show = endDate;
                }
                this.data.projects = result;
            });

        },
        editItem (item) {
            this.dialog = true;
            this.editedIndex = this.data.projects.indexOf(item);
            this.editedItem = item;
            this.itemID = item.project_id;
        },
    }
}
</script>

<style scoped>

</style>