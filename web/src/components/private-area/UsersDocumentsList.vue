<template>
<v-card class="px-4" flat>
    <v-card-text>
        <v-container>
            <v-row>
                <v-col>
                    <v-text-field
                        v-model="searchDocs"
                        label="Search documents or section names"
                        clearable
                        @input="filterDocs(searchDocs)"
                    ></v-text-field>

                </v-col>
            </v-row>
        </v-container>
        <v-expansion-panels>
            <v-expansion-panel
                v-for="(section,i) in data.sections"
                :key="i"
            >
                <v-expansion-panel-header v-if="section.show || section.show === undefined">
                    <span class="type-name">{{section.section_name}}</span>
                </v-expansion-panel-header>
                <v-expansion-panel-content v-if="section.show || section.show === undefined">
                    <v-container>
                        <v-row>
                            <v-col cols="12" md="6" lg="4"
                                v-for="(group, j) in section.groups.filter(group => group.show || group.show === undefined)"
                                :key="i + '-' + j"
                            >
                                <v-card class="pa-2"
                                >
                                    <v-card-text>
                                        <v-row>
                                            <span class="item-title">{{ group.title }}</span>
                                        </v-row>
                                        <v-row>
                                            <span class="item-content">{{ group.content }}</span>
                                        </v-row>
                                        <v-row>
                                            <span class="item-dates">
                                                Visible from
                                                <span v-if="group.valid_from !== null">{{group.valid_from | formatDate}}</span>
                                                <span v-else>-∞</span>
                                                to
                                                <span v-if="group.valid_until !== null">{{group.valid_until | formatDate}}</span>
                                                <span v-else>+∞</span>
                                            </span>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12">
                                                <v-list dense>
                                                    <v-list-group
                                                        :value="false"
                                                    >
                                                        <template v-slot:activator>
                                                            <v-list-item-title>Files</v-list-item-title>
                                                        </template>

                                                            <v-list-item
                                                                v-for="(item, k) in group.documents.filter(doc => doc.show || doc.show === undefined)"
                                                                :key="i + '-' + j + '-' + k"
                                                                @click="downloadFile(tabId, section, group, item)"
                                                            >
                                                                <v-list-item-content>
                                                                    <v-list-item-title>
                                                                        {{ item.display_name }}
                                                                    </v-list-item-title>

                                                                </v-list-item-content>
                                                            </v-list-item>
                                                    </v-list-group>
                                                </v-list>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </v-card-text>
    <v-card-text v-if="noDocuments">
        No documents to show in this section

    </v-card-text>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

function customSorter (a,b) {
    if (a.sort_order !== null && b.sort_order !== null) {
        return -(a.sort_order - b.sort_order);
    } else if (a.sort_order === null) {
        return +1;
    } else if (b.sort_order === null) {
        return -1;
    } else {
        return a.id - b.id;
    }
}

export default {
    props: {
        unitName: String,
        unitId: Number,
        tabName: String,
        tabId: Number,
    },
    data () {
        return {
            searchDocs: '',
            data: {
                sections: [],
                ///sections_show: [],
            },
            path: '/private-areas/tabs/',
            noDocuments: true,
        }
    },
    //computed: {
    //    visibleGroups() {
//
    //    }
    //},
    mounted () {
        this.initialize();
        this.$root.$on('updatePrivateDocumentsList',
            () => {
                this.initialize();
            }
        );
    },
    watch: {
        tabName () {
            this.initialize();
        },
        unitId () {
            this.initialize();
        },

    },
    methods: {
        initialize () {
            let urlGetDocuments = []
            let this_session = this.$store.state.session;
            let personID = this_session.personID;
            let url = 'api/private-areas/' + personID
                            + '/tabs/' + this.tabId
                            + '/sections'
            subUtil.getInfoPopulate(this, url, true)
                .then( (result) => {
                    this.data.sections = result.sort(customSorter)
                    if (result.length > 0) this.noDocuments = false;
                    return Promise.all(
                        this.data.sections.map(el => {
                            url = 'api/private-areas/' + personID
                                + '/tabs/' + this.tabId
                                + '/sections/' + el.id
                                + '/groups'
                            return this.$http.get(url,
                            {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                            })
                        })
                    )
                })
                .then( (result) => {
                    for (let ind in result) {
                        this.$set(this.data.sections[ind], 'groups',
                            result[ind].data.result.sort(customSorter))
                        for (let ind2 in this.data.sections[ind].groups) {
                            this.$set(this.data.sections[ind].groups[ind2], 'documents', [])
                            url = 'api/private-areas/' + personID
                                + '/tabs/' + this.tabId
                                + '/sections/' + this.data.sections[ind].id
                                + '/groups/' + this.data.sections[ind].groups[ind2].id
                                + '/documents'
                            urlGetDocuments.push({
                                section: this.data.sections[ind].id,
                                group: this.data.sections[ind].groups[ind2].id,
                                url
                            })
                        }
                    }
                    return Promise.all(
                        urlGetDocuments.map(el => {
                            return this.$http.get(el.url,
                            {
                                headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                            })
                        })
                    )
                })
                .then( (result) => {
                    for (let ind in result) {
                        // find the section in which it should be placed
                        for (let ind2 in this.data.sections){
                            for (let ind3 in this.data.sections[ind2].groups) {
                                if (this.data.sections[ind2].id === urlGetDocuments[ind].section
                                    && this.data.sections[ind2].groups[ind3].id === urlGetDocuments[ind].group
                                ){
                                    this.$set(this.data.sections[ind2].groups[ind3], 'documents',
                                        result[ind].data.result.sort(customSorter))
                                }
                            }
                        }
                    }
                })
                ;

        },
        downloadFile (tabID, section, group, doc) {
            let this_session = this.$store.state.session;
            let personID = this_session.personID;
            let url = 'api/private-areas/' + personID
                    + '/tabs/' + tabID
                    + '/sections/' + section.id
                    + '/groups/' + group.id
                    + '/documents/' + doc.attachment_url
                    + '/download'

            this.$http.get(url, {
                responseType: 'blob',
                headers: { 'Authorization': 'Bearer ' + localStorage['v2-token'] },
            })
            .then( (response) => {
                const type = response.headers['content-type'];
                const blob = new Blob([response.data], { type: type, encoding: 'UTF-8'});
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = doc.attachment_url;
                link.click()
            })
            .catch((error) => {
                // eslint-disable-next-line
                console.log(error)
            });

        },
        filterDocs (strSearch) {
            if (strSearch === '' || strSearch === null) { strSearch = ''; }
            let search = strSearch.toLowerCase();
            let sections = this.data.sections;
            for (let ind in sections) {
                if (sections[ind].section_name.toLowerCase().includes(search)) {
                    this.$set(sections[ind],'show', true);
                    // show everything inside this section
                    for (let indGrp in this.data.sections[ind].groups) {
                        this.$set(this.data.sections[ind].groups[indGrp],'show', true);
                        for (let indDoc in this.data.sections[ind].groups[indGrp].documents) {
                            this.$set(this.data.sections[ind].groups[indGrp].documents[indDoc],
                            'show', true);
                        }
                    }
                } else {
                    // set as false, can be changed if something inside is found
                    this.$set(sections[ind],'show', false);
                    // see if anything inside should be shown
                    let foundAny = false;
                    for (let indGrp in this.data.sections[ind].groups) {
                        if (sections[ind].groups[indGrp].title.toLowerCase().includes(search)
                            || sections[ind].groups[indGrp].content.toLowerCase().includes(search)) {
                            foundAny = true;
                            this.$set(this.data.sections[ind],'show', true);
                            this.$set(this.data.sections[ind].groups[indGrp],'show', true);
                            for (let indDoc in this.data.sections[ind].groups[indGrp].documents) {
                                this.$set(this.data.sections[ind].groups[indGrp].documents[indDoc],
                                'show', true);
                            }
                        } else {
                            this.$set(this.data.sections[ind].groups[indGrp],'show', false);
                            for (let indDoc in this.data.sections[ind].groups[indGrp].documents) {
                                if (sections[ind].groups[indGrp].documents[indDoc].display_name.toLowerCase().includes(search)
                                    || sections[ind].groups[indGrp].documents[indDoc].attachment_url.toLowerCase().includes(search)
                                ) {
                                    foundAny = true;
                                    this.$set(this.data.sections[ind],'show', true);
                                    this.$set(this.data.sections[ind].groups[indGrp],'show', true);
                                    this.$set(this.data.sections[ind].groups[indGrp].documents[indDoc],
                                        'show', true);
                                } else {
                                    this.$set(this.data.sections[ind].groups[indGrp].documents[indDoc],
                                        'show', false);
                                }
                            }
                        }
                    }
                    if (!foundAny) {
                        this.$set(sections[ind],'show', false);
                        for (let indGrp in this.data.sections[ind].groups) {
                            this.$set(this.data.sections[ind].groups[indGrp],'show', false);
                            for (let indDoc in this.data.sections[ind].groups[indGrp].documents) {
                                this.$set(this.data.sections[ind].groups[indGrp].documents[indDoc],
                                        'show', false);
                            }
                        }
                    }
                }
            }

        }
    }
}
</script>

<style scoped>
.type-name {
    font-weight: 600;
    color: mediumblue;
    font-size: 1.3rem;
    margin-top: 10px;
    margin-bottom: 10px;
}
.item-title {
    font-weight: 500;
    padding-top: 0;
    padding-bottom: 0;
    font-size: 1rem;
}
.item-content {
    padding-top: 0;
    padding-bottom: 0;
    font-size: 0.9rem;
}
.item-url {
    padding-top: 0;
    padding-bottom: 0;
    font-size: 0.9rem;
}
.item-dates {
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 5px;
    font-size: 0.7rem;
}

</style>