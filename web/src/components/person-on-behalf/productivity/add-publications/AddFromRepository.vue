<template>
<v-card flat>
    <v-card-title primary-title>
    </v-card-title>
    <v-card-text>Shown are publications in your institutional repository
        which are <b>not part of the LAQV/UCIBIO database</b><br>
        It is advisable to check individual publication info before submitting (e.g. possible mismatches in journal info).<br>
        Items tagged <v-icon color="red">mdi-alert-circle-outline</v-icon> are missing
        crucial data.<br>
        Should a warning about a slow script appear, you can safely choose "Wait".
    </v-card-text>
    <v-container>
        <v-form ref="form" class="pa-4"
                @submit.prevent="submitForm">
            <v-row>
                <v-btn @click="getRepositoryPublications()"
                        :disabled="repoError || !finishedJournals"
                >
                    {{ repoMessage }}
                </v-btn>
                <div class="request-status-container ml-2">
                    <v-progress-circular indeterminate
                            v-show="progressRepo"
                            :size="20" :width="2"
                            color="primary">
                    </v-progress-circular>
                </div>
                <div v-show="progressRepo">
                    {{ messageRepoRequest }}
                </div>
            </v-row>
             <v-data-table v-if="finishedGetRepo"
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
                    class='mt-4'
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
                                        @click="editItem(item)">mdi-pencil
                                    </v-icon>
                                    <v-icon color="red" v-show="item.incomplete"
                                        @click="editItem(item)"
                                    >
                                        mdi-alert-circle-outline
                                    </v-icon>
                                </template>
                                <span>View & edit details</span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table>
            <v-row v-if="errorBeforeSubmit">
                <p class="caption red--text">
                    {{ messageErrorBeforeSubmit }}
                </p>
            </v-row>
            <v-row v-if="finishedGetRepo"
                    align-content="center"
                    justify="end"
                    class="pt-6">
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
import leven from 'leven'

import PublicationDetails from './PublicationDetails'

function prepareStringComparison(str) {
    if (str === null || str === undefined) {
        return null;
    } else {
        return str.toLowerCase()
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
function determineJournal(pub, journals) {
    let mostSimilarJournalID = null;
    if (pub.journal_name === null) {
        pub.journal_id = null;
    } else {
        for (let ind in journals) {
            if (pub.journal_name === journals[ind].name
                || pub.journal_name === journals[ind].short_name) {
                mostSimilarJournalID = journals[ind].id;
                break;
            }
        }
        if (mostSimilarJournalID === null) {
            let bestIndFull, bestIndShort, bestInd;
            let minSimilarityFull = 1e6, minSimilarityShort = 1e6;
            for (let ind in journals) {
                let levenFull = leven(pub.journal_name.toLowerCase(),
                                    journals[ind].name.toLowerCase());
                if (levenFull < minSimilarityFull) {
                    minSimilarityFull = levenFull;
                    bestIndFull = ind;
                }
                let levenShort = leven(pub.journal_name.toLowerCase(),
                                    journals[ind].short_name.toLowerCase());
                if (levenShort < minSimilarityShort) {
                    minSimilarityShort = levenShort;
                    bestIndShort = ind;
                }
            }
            if (minSimilarityFull < minSimilarityShort) {
                bestInd = bestIndFull;

            } else {
                bestInd = bestIndShort;
            }
            mostSimilarJournalID = journals[bestInd].id;
        }
        pub.journal_id = mostSimilarJournalID;
    }
    return pub;
}

export default {
    components: {
        PublicationDetails,
    },
    props: {
        currentTab: String,
        otherPersonId: Number,
    },
    data() {
        return {
            repoError: false,
            repoMessage: '',
            messageRepoRequest: '',
            dialog: false,
            editedIndex: -1,
            editedItem: {},
            errorBeforeSubmit: false,
            messageErrorBeforeSubmit: '',
            progress: false,
            success: false,
            error: false,
            formError: false,
            progressRepo: false,
            finishedGetRepo: false,
            finishedJournals: false,
            headers: [
                { text: 'Title', value:'title_show' },
                { text: 'Authors', value:'authors_raw_show' },
                { text: 'Journal', value:'journal_name' },
                { text: 'Year', value:'year' },
                { text: 'To add', value: 'associate', sortable: false},
                { text: 'Actions', value: 'action', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            journals: [],
            data: {
                pureID: undefined, //actually in general it is the ID in the current repo
                repoName: '',
                publicationsDB: [],
                publications: [],
            },

        }
    },
    mounted() {
        this.initialize();
        this.$root.$on('updateSingleAddPublicationDatabasePURE',
            (publicationData) => {
                this.updateData(publicationData);
            }
        );
    },
    watch: {
        currentTab () {
            if (this.currentTab.includes('/add-publications')) {
                this.initialize();
            }
        },
    },
    methods: {
        initialize () {
            this.data.publicationsDB = [];
            this.data.publications = [];
            this.getRepoID();
            this.getJournals()
                .then(() => { this.finishedJournals = true;});
        },
        submitForm() {
            // first check if selected publications are OK for addition
            let publicationsOK = true;
            let notOKPublications = [];
            for (let ind in this.data.publications) {
                if (this.data.publications[ind].to_associate) {
                    if (this.data.publications[ind].title === null
                        || this.data.publications[ind].authors_raw === null
                        || (this.data.publications[ind].journal_name === null
                            && (this.data.publications[ind].journal_id === null
                                || this.data.publications[ind].new_journal))) {
                        publicationsOK = false;
                        notOKPublications.push(this.data.publications[ind]);
                    }
                }
            }
            this.messageErrorBeforeSubmit = '';
            if (!publicationsOK) {
                let textMessage = 'The following publications have problems: '
                for (let ind in notOKPublications) {
                    textMessage = textMessage
                                + '"' + notOKPublications[ind].title + '"'
                                + '(' + notOKPublications[ind].authors_raw
                                + ';' + notOKPublications[ind].journal_name + '); '
                                ;
                }
                this.errorBeforeSubmit = true;
                this.messageErrorBeforeSubmit = textMessage;
            }
            if (this.$store.state.session.loggedIn && publicationsOK) {
                let personID = this.otherPersonId;
                let urlCreateJournal = [];
                let urlCreatePublications = [];
                let urlCreatePersonPublications = [];
                let urlUpdatePublications = [];
                let publications = this.data.publications;
                this.progress = true;
                for (let ind in publications) {
                    if (publications[ind].to_associate) {
                        if (publications[ind].new_journal === true) {
                            urlCreateJournal.push({
                                url: 'api/people/' + personID
                                        + '/journals',
                                body: publications[ind],
                            });

                        } else {
                            urlCreatePublications.push({
                                url: 'api/people/' + personID
                                        + '/journals/' + publications[ind].journal_id
                                        + '/publications',
                                body: publications[ind],
                            });
                        }
                        this.data.publicationsDB.push(publications[ind]);
                    }
                }
                this.$http.all(
                    urlCreateJournal.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                )
                .then(this.$http.spread( (...createdJournals) => {
                    for (let ind in createdJournals) {
                        let journalID = createdJournals[ind].data.result.journalID;
                        urlCreatePublications.push({
                            url: 'api/people/' + personID
                                    + '/journals/' + journalID
                                    + '/publications',
                            body: urlCreateJournal[ind].body,
                        });
                    }
                    return this.$http.all(
                        urlCreatePublications.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                        ))
                    )
                }))
                .then(this.$http.spread( (...createdPublications) => {
                    for (let ind in createdPublications) {
                        let publicationID = createdPublications[ind].data.result.publicationID;
                        urlCreatePersonPublications.push({
                            url: 'api/people/' + personID
                                    + '/people-publications/' + publicationID,
                            body: urlCreatePublications[ind].body,
                        });
                        urlUpdatePublications.push({
                            url: 'api/people/' + personID
                                    + '/publications/' + publicationID,
                            body: urlCreatePublications[ind].body,
                        });
                    }
                    return this.$http.all(
                        urlCreatePersonPublications.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                        ))
                    )
                }))
                .then(this.$http.spread( () => {
                    return this.$http.all(urlUpdatePublications.map(el =>
                        this.$http.put(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']},
                            }
                        )
                    ));
                }))
                .then(this.$http.spread( () => {
                    this.progress = false;
                    this.success = true;
                    this.getRepositoryPublications();
                    setTimeout(() => {this.success = false;}, 1500)
                }))
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })

            }

        },
        getRepoID () {
            if (this.$store.state.session.loggedIn) {
                let personID = this.otherPersonId;
                let urlSubmit = 'api/people/' + personID + '/researcher-ids';
                subUtil.getInfoPopulate(this, urlSubmit, false)
                .then( (result) => {
                    if (result !== undefined) {
                        this.data.pureID = result.pure_id;
                        this.data.repoName = result.repository_short_name;
                    }
                    if (this.data.pureID === undefined
                            || this.data.pureID === null
                            || this.data.pureID === ''
                            || result === undefined) {
                        this.repoError = true;
                        this.repoMessage = 'Missing ID in repository!';
                    } else {
                        this.repoError = false;
                        this.repoMessage = 'Get from '+ this.data.repoName
                                            + ' (id=' + this.data.pureID + ')';
                    }
                });
            }
        },
        getJournals () {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'journals';
                return subUtil.getPublicInfo(vm, urlSubmit, 'journals');
            }
        },
        getRepositoryPublications () {
            let personID = this.otherPersonId;
            this.data.publicationsDB = [];
            this.data.publications = [];
            if (this.$store.state.session.loggedIn) {
                let urlSubmit = 'api/people' + '/all-publications';
                this.messageRepoRequest = 'Getting repository publications missing from DB';
                this.progressRepo = true;
                subUtil.getInfoPopulate(this, urlSubmit, true)
                    .then( (result) => {
                        this.data.publicationsDB = result;
                        let urlPURE = 'api/people/' + personID + '/pure-publications';
                        this.messageRepoRequest = 'Processing details of new publications';
                        return subUtil.getInfoPopulate(this, urlPURE, true);
                    })
                    .then( (result) => {
                        let publicationsPURE = result.publications;
                        publicationsPURE = this.removeExistingPublications(publicationsPURE, this.data.publicationsDB);
                        for (let ind in publicationsPURE) {
                            this.$set(publicationsPURE[ind], 'publication_id',
                                        parseInt(ind, 10));
                            publicationsPURE[ind].publication_source_id = 4;
                            publicationsPURE[ind].isPURE = true;
                            publicationsPURE[ind] = determineJournal(publicationsPURE[ind], this.journals);
                            if (publicationsPURE[ind].title === null
                                    || publicationsPURE[ind].authors_raw === null
                                    || publicationsPURE[ind].journal_name === null) {
                                this.$set(publicationsPURE[ind], 'incomplete', true);
                            }
                        }
                        this.data.publications = publicationsPURE;
                        this.onResize();
                        this.progressRepo = false;
                        this.finishedGetRepo = true;
                    })
                    .catch((error) => {
                        // eslint-disable-next-line
                        console.log(error)
                    });
            }
        },
        removeExistingPublications(purePublications, dbPublications) {
            let newPublications = [];
            let dbDOIs = [];
            let dbWOSs = [];
            let dbPubmeds = [];
            let dbTitles = [];
            let dbJournals = [];
            let dbJournalsShort = [];

            for (let ind in dbPublications) {
                if (dbPublications[ind].doi !== null) {
                    dbDOIs.push(dbPublications[ind].doi
                        .toLowerCase()
                        .replace('https://doi.org/','')
                        .replace('http://dx.doi.org/','')
                        .replace('doi: ','')
                        .replace('doi:','')
                        .replace('doi ',''));
                }
                if (dbPublications[ind].wos !== null) {
                    dbWOSs.push(dbPublications[ind].wos
                        .toLowerCase()
                        .replace('WOS:',''));
                }
                if (dbPublications[ind].pubmed_id !== null) {
                    dbPubmeds.push(dbPublications[ind].pubmed_id);
                }
                if (dbPublications[ind].title !== null) {
                    dbTitles.push(prepareStringComparison(dbPublications[ind].title));
                    dbJournals.push(prepareStringComparison(dbPublications[ind].journal_name));
                    dbJournalsShort.push(prepareStringComparison(dbPublications[ind].journal_short_name));
                }
            }
            for (let ind in purePublications) {
                let pureDOI = null;
                let electronicVersion = purePublications[ind].electronicVersions;
                let checkMore = true;
                if (electronicVersion !== null
                        && electronicVersion !== undefined
                        && electronicVersion.length !== 0) {
                    pureDOI = electronicVersion[0].doi;
                    if (pureDOI !== null && pureDOI !== undefined) {
                        pureDOI = pureDOI.toLowerCase()
                                .replace('https://doi.org/','')
                                .replace('http://dx.doi.org/','');
                        if (dbDOIs.indexOf(pureDOI) === -1) {
                            checkMore = true;
                        } else {
                            checkMore = false;
                            continue;
                        }
                    }
                }
                // DOI didn't match, try WOS and Pubmed and title/journal
                // this numbers can be found in several keys
                if (checkMore) {
                    let pureWOS = null;
                    let purePubmedId = null;
                    let info = purePublications[ind].info;
                    if (info !== undefined && info !== null) {
                        let addExtID = info.additionalExternalIds;
                        if (addExtID !== undefined && addExtID !== null) {
                            for (let indExt in addExtID) {
                                if (addExtID[indExt].idSource === 'WOS') {
                                    pureWOS = addExtID[indExt].value;
                                } else if (addExtID[indExt].idSource === 'PubMed') {
                                    purePubmedId = addExtID[indExt].value;
                                }
                            }
                            if (dbWOSs.indexOf(pureWOS) === -1) {
                                checkMore = true;
                            } else {
                                checkMore = false;
                                continue;
                            }
                            if (dbPubmeds.indexOf(purePubmedId) === -1) {
                                checkMore = true;
                            } else {
                                checkMore = false;
                                continue;
                            }
                        }
                    }
                    // now try checking by title/journal
                    if (checkMore) {
                        let pureTitle = prepareStringComparison(purePublications[ind].title.value);
                        let indTitle = dbTitles.indexOf(pureTitle);
                        if (indTitle === -1) {
                            checkMore = true;
                        } else {
                            // now check if corresponding journal is the same
                            if (purePublications[ind].journalAssociation !== null
                                && purePublications[ind].journalAssociation !== undefined) {
                                let pureJournal = prepareStringComparison(purePublications[ind].journalAssociation.title.value);
                                if (compareTwoStrings(pureTitle, dbTitles[indTitle]) > 0.95
                                    && (compareTwoStrings(pureJournal, dbJournals[indTitle]) > 0.95
                                        || compareTwoStrings(pureJournal, dbJournalsShort[indTitle]) > 0.95)
                                    ) {
                                    checkMore = false;
                                    continue;
                                }
                                else {
                                    checkMore = true;
                                }
                            }
                        }
                        if (checkMore) {
                            let pureJournal = null;
                            let pureISSN = null;
                            let purePublisher = null;
                            let purePages;
                            let purePageStart = null;
                            let purePageEnd = null;
                            let pureYear, pureMonth, pureDay;
                            let pureAuthors = ''
                            let pureNumberAuthors = null;
                            purePublications[ind].title = purePublications[ind].title.value
                            if (purePublications[ind].journalAssociation !== null
                                && purePublications[ind].journalAssociation !== undefined) {
                                pureJournal = purePublications[ind].journalAssociation.title.value;
                                if (purePublications[ind].journalAssociation.issn !== null
                                    && purePublications[ind].journalAssociation.issn !== undefined) {
                                    pureISSN = purePublications[ind].journalAssociation.issn.value;
                                }
                            }
                            if (purePublications[ind].publisher !== null
                                && purePublications[ind].publisher !== undefined) {
                                if (purePublications[ind].publisher.name !== null
                                    && purePublications[ind].publisher.name !== undefined) {
                                    if (purePublications[ind].publisher.name.text !== null
                                        && purePublications[ind].publisher.name.text !== undefined) {
                                        purePublisher = purePublications[ind].publisher.name.text[0].value;
                                    }
                                }
                            }
                            purePages = purePublications[ind].pages;
                            if (purePages !== null && purePages !== undefined) {
                                purePages = purePages.split('-');
                                if (purePages.length > 1) {
                                    purePageStart = purePages[0];
                                    purePageEnd = purePages[1];
                                } else {
                                    purePageStart = purePages[0];
                                }
                            }
                            if (purePublications[ind].publicationStatuses !== null
                                    && purePublications[ind].publicationStatuses !== undefined) {
                                for (let stat in purePublications[ind].publicationStatuses) {
                                    if (purePublications[ind].publicationStatuses[stat].current === true) {
                                        pureYear = purePublications[ind].publicationStatuses[stat].publicationDate.year;
                                        pureMonth = purePublications[ind].publicationStatuses[stat].publicationDate.month;
                                        pureDay = purePublications[ind].publicationStatuses[stat].publicationDate.day;
                                        break;
                                    }
                                }
                            }
                            if (purePublications[ind].personAssociations !== null
                                    && purePublications[ind].personAssociations !== undefined) {
                                pureNumberAuthors = purePublications[ind].personAssociations.length;
                            }
                            for (let aut in purePublications[ind].personAssociations) {
                                if (purePublications[ind].personAssociations[aut].name !== null
                                    && purePublications[ind].personAssociations[aut].name !== undefined) {
                                    let firstName = purePublications[ind].personAssociations[aut].name.firstName;
                                    let lastName = purePublications[ind].personAssociations[aut].name.lastName;
                                    if (lastName !== null && lastName !== undefined) {
                                        if (firstName !== null && firstName !== undefined) {
                                            pureAuthors= pureAuthors + lastName + ', '
                                                        + firstName;
                                        } else {
                                            pureAuthors = pureAuthors + lastName;
                                        }
                                    } else {
                                        if (firstName !== null && firstName !== undefined) {
                                            pureAuthors = pureAuthors + firstName;
                                        }
                                    }
                                    if (parseInt(aut, 10) < purePublications[ind].personAssociations.length - 1) {
                                        pureAuthors = pureAuthors + '; ';
                                    }
                                }
                            }
                            purePublications[ind].journal_name = pureJournal;
                            purePublications[ind].publisher = purePublisher;
                            purePublications[ind].doi = pureDOI;
                            purePublications[ind].wos = pureWOS;
                            purePublications[ind].pubmed_id = purePubmedId;
                            purePublications[ind].issn = pureISSN;
                            purePublications[ind].page_start = purePageStart;
                            purePublications[ind].page_end = purePageEnd;
                            purePublications[ind].year = pureYear;
                            purePublications[ind].month = pureMonth;
                            purePublications[ind].day = pureDay;
                            let publicationDate = '';
                            if (pureYear !== null && pureYear !== undefined) {
                                publicationDate = publicationDate + pureYear;
                                if (pureMonth !== null && pureMonth !== undefined) {
                                    publicationDate = publicationDate + '-' + pureMonth;
                                    if (pureDay !== null && pureDay !== undefined) {
                                        publicationDate = publicationDate + '-' + pureDay;
                                    }
                                }
                            } else {
                                if (pureMonth !== null && pureMonth !== undefined) {
                                    publicationDate = publicationDate + pureMonth;
                                    if (pureDay !== null && pureDay !== undefined) {
                                        publicationDate = publicationDate + '-' + pureDay;
                                    }
                                }
                            }
                            purePublications[ind].publication_date = pureYear + '-' + pureMonth + '-' + pureDay;
                            purePublications[ind].authors_raw = pureAuthors;
                            purePublications[ind].number_authors = pureNumberAuthors;
                            newPublications.push(purePublications[ind])
                        }
                    }
                }
            }
            return newPublications;
        },
        updateData (publicationData) {
            for (let ind in this.data.publications) {
                if (this.data.publications[ind].publication_id === publicationData.publication_id) {
                    this.$set(this.data.publications, ind, publicationData);
                    if (this.data.publications[ind].title === null
                        || this.data.publications[ind].authors_raw === null
                        || (this.data.publications[ind].journal_name === null
                            && (this.data.publications[ind].journal_id === null
                                || this.data.publications[ind].new_journal))) {
                        this.$set(this.data.publications[ind], 'incomplete', true);
                    }
                    this.onResize();
                    break;
                }
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