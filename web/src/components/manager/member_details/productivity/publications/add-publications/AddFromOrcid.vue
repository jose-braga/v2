<template>
<v-card flat>
    <v-card-text>Search your ORCID profile (only publicly accessible data).
        Search results will show only publications that are
        <b>not part of the LAQV/UCIBIO database</b>.<br>
        It is advisable to check individual publication info before submitting (e.g. possible mismatches in journal info).<br>
        Items tagged <v-icon color="red">mdi-alert-circle-outline</v-icon> are missing
        crucial data.<br>
        Should a warning about a slow script appear, you can safely choose "Wait".
    </v-card-text>
    <v-container>
        <v-form ref="form" class="px-4"
                @submit.prevent="submitForm">
            <v-row>
                <v-btn @click="getORCIDPublications()"
                        :disabled="orcidError || !finishedJournals"
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
            <v-row v-if="finishedGetORCID"
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

function filterORCIDData(works) {
    // filter out any works which are not printed/digital publications
    let publicationsFiltered = [];
    if (Object.prototype.hasOwnProperty.call(works, 'group')
            && works.group.length > 0) {
        for (let ind in works.group) {
            let publication = works.group[ind];
            let getThisPublication = false;
            let typeIsNull = false;
            let hasPutcode = true;
            let putcode = null;
            let currentBest = 10; // this number is the order of preference
            let thisClassification = 10;
            // sources from by order of preference
            // 1. CIÊNCIAVITAE,
            // 2. Crossref, Crossref Metadata Search, Europe PubMed Central, Scopus - Elsevier
            // (cont) ResearcherID, Universidade Nova de Lisboa
            // 3. All others that have BIBTEK citations (only after getting details)
            // 4. All others that have no BIBTEK citations (only after getting details)
            if (Object.prototype.hasOwnProperty.call(publication, 'work-summary')
                    && publication['work-summary'].length > 0) {
                for (let indSum in publication['work-summary']) {
                    if (Object.prototype.hasOwnProperty.call(publication['work-summary'][indSum],'type')) {
                        if (publication['work-summary'][indSum].type !== 'LECTURE_SPEECH'
                            && publication['work-summary'][indSum].type !== 'CONFERENCE_POSTER'
                            && publication['work-summary'][indSum].type !== 'CONFERENCE_PAPER'
                            && publication['work-summary'][indSum].type !== 'DISSERTATION'
                            && publication['work-summary'][indSum].type !== 'BOOK_CHAPTER'
                            && publication['work-summary'][indSum].type !== 'BOOK'
                           // && publication['work-summary'][indSum].type !== 'OTHER'
                        ) {

                            getThisPublication = true;
                        }
                    } else {
                        typeIsNull === true;
                    }
                    if (Object.prototype.hasOwnProperty.call(publication['work-summary'][indSum],'put-code')) {
                        if (Object.prototype.hasOwnProperty.call(publication['work-summary'][indSum],'source')) {
                            if (Object.prototype.hasOwnProperty.call(publication['work-summary'][indSum].source,'source-name')
                                && publication['work-summary'][indSum].source['source-name'] !== null
                            ) {
                                if (publication['work-summary'][indSum].source['source-name'].value === 'CIÊNCIAVITAE') {
                                    thisClassification = 1;
                                } else if (publication['work-summary'][indSum].source['source-name'].value === 'Crossref Metadata Search'
                                        || publication['work-summary'][indSum].source['source-name'].value === 'Crossref'
                                        || publication['work-summary'][indSum].source['source-name'].value === 'Europe PubMed Central'
                                        || publication['work-summary'][indSum].source['source-name'].value === 'Scopus - Elsevier'
                                        || publication['work-summary'][indSum].source['source-name'].value === 'ResearcherID'
                                        || publication['work-summary'][indSum].source['source-name'].value === 'Universidade Nova de Lisboa') {
                                    thisClassification = 2;
                                } else {
                                    thisClassification = 4;
                                }
                            } else {
                                thisClassification = 5;
                            }
                        } else {
                            thisClassification = 10;
                        }
                        if (thisClassification <= currentBest) {
                            currentBest = thisClassification;
                            putcode = publication['work-summary'][indSum]['put-code'];
                        }
                    }
                    let title = null;
                    if (Object.prototype.hasOwnProperty.call(publication['work-summary'][indSum],'title')
                        && publication['work-summary'][indSum]['title'] !== null
                    ) {
                        if (Object.prototype.hasOwnProperty.call(publication['work-summary'][indSum].title,'title')) {
                            title = publication['work-summary'][indSum].title.title.value.trim();
                        }
                    }
                    publication.title = title;
                    let doi = null;
                    if (Object.prototype.hasOwnProperty.call(publication['work-summary'][indSum],'external-ids')
                            && publication['work-summary'][indSum]['external-ids'] !== null) {
                        if (Object.prototype.hasOwnProperty.call(publication['work-summary'][indSum]['external-ids'],'external-id')) {
                            let extId = publication['work-summary'][indSum]['external-ids']['external-id'];
                            for (let indId in extId) {
                                if (extId[indId]['external-id-type'] === 'doi') {
                                    doi = extId[indId]['external-id-value'];
                                }
                            }
                        }
                    }
                    publication.doi = doi;
                }
            }
            if (putcode !== null) {
                publication.putcode = putcode;
                publication.preference = currentBest;

            } else {
                hasPutcode = false;
            }
            if ((getThisPublication || typeIsNull) && hasPutcode) {
                publicationsFiltered.push(publication);
            }
        }
    }
    return publicationsFiltered;
}
function removeExistingPublications(orcidPublications, dbPublications) {
    let newPublications = [];
    let dbDOIs = [];
    let dbTitles = [];
    for (let ind in dbPublications) {
        if (dbPublications[ind].doi !== null) {
            dbDOIs.push(dbPublications[ind].doi
                        .toLowerCase()
                        .replace('https://doi.org/','')
                        .replace('http://dx.doi.org/','')
                        .replace('doi: ','')
                        .replace('doi:','')
                        .replace('doi ',''))
        }
        dbTitles.push(dbPublications[ind].title
                    .toLowerCase()
                    .replace(/[-;,:]/g,''))
    }
    for (let ind in orcidPublications) {
        let orcidDOI = null;
        if (orcidPublications[ind].doi !== null) {
            orcidDOI = orcidPublications[ind].doi
                        .toLowerCase()
                        .replace('https://doi.org/','')
                        .replace('http://dx.doi.org/','')
                        .replace('doi: ','')
                        .replace('doi:','')
                        .replace('doi ','');
        }
        // search existing DOI, then existing titles
        if (orcidDOI === null || dbDOIs.indexOf(orcidDOI) === -1
        && orcidPublications[ind].title !== null) {
            let orcidTitle = orcidPublications[ind].title
                            .toLowerCase()
                            .replace(/[-;,:]/g,'')
            if (dbTitles.indexOf(orcidTitle) === -1) {
                //publication is not in DB
                newPublications.push(orcidPublications[ind])
            }
        }
    }
    return newPublications;
}
function processDetails(pub, response) {
    pub.isORCID = true; // send a signal to the details component that this data comes from ORCID
    pub.publication_source_id = 2;
    let details = response.data;
    let journal = null;
    if (Object.prototype.hasOwnProperty.call(details,'journal-title')) {
        if (details['journal-title'] !== null
                && Object.prototype.hasOwnProperty.call(details['journal-title'],'value')) {
            journal = details['journal-title']['value'];
        }
    }
    if (journal !== null) {
        journal = journal.replace(/&amp;/g,'&');
    }
    pub.journal_name = journal;
    let year = null;
    let month = null;
    let day = null;
    if (Object.prototype.hasOwnProperty.call(details,'publication-date')) {
        if (details['publication-date'] !== null
                && Object.prototype.hasOwnProperty.call(details['publication-date'],'year')
                && details['publication-date'].year !== null) {
            year = details['publication-date'].year.value;
            if (year !== null && year !== undefined) {
                pub.year = year;
            }
        }
        if (details['publication-date'] !== null
                && Object.prototype.hasOwnProperty.call(details['publication-date'],'month')
                && details['publication-date'].month !== null) {
            month = details['publication-date'].month.value;
            if (month !== null && month !== undefined) {
                pub.month = month;
            }
        }
        if (details['publication-date'] !== null
                && Object.prototype.hasOwnProperty.call(details['publication-date'],'day')
                && details['publication-date'].day !== null) {
            day = details['publication-date'].day.value;
            if (day !== null && day !== undefined) {
                pub.day = day;
            }
        }
    }
    let contributors = [];
    if (Object.prototype.hasOwnProperty.call(details,'contributors')) {
        if (details['contributors'] !== null && Object.prototype.hasOwnProperty.call(details['contributors'],'contributor')) {
            for (let ind in details.contributors.contributor) {
                if (Object.prototype.hasOwnProperty.call(details.contributors.contributor[ind],'credit-name')) {
                    if (details.contributors.contributor[ind]['credit-name'] !== null
                        && Object.prototype.hasOwnProperty.call(details.contributors.contributor[ind]['credit-name'],'value')) {
                        if (details.contributors.contributor[ind]['credit-name'].value !== null) {
                            contributors.push(details.contributors.contributor[ind]['credit-name'].value);
                        }
                    }
                }
            }
        }
    }
    let volume = null;
    let number = null; //this is used by some journals
    let pages = null;
    let authors = null;
    if (Object.prototype.hasOwnProperty.call(details,'citation')) {
        //from this we can get authors, volume, pages
        if (details.citation !== null && Object.prototype.hasOwnProperty.call(details.citation,'citation-type')) {
            if (details.citation['citation-type'] === 'BIBTEX') {
                if (details.citation['citation-value'] !== null) {
                    let vol = details.citation['citation-value'].match(/volume = {(.*?)}/);
                    if (vol !== null) volume = vol[1];
                    let num = details.citation['citation-value'].match(/number = {(.*?)}/);
                    if (num !== null) number = num[1];
                    let pg = details.citation['citation-value'].match(/pages = {(.*?)}/);
                    if (pg !== null) pages = pg[1];
                    let aut = details.citation['citation-value'].match(/author = {(.*?)}/);
                    if (aut !== null) authors = aut[1];
                    let j = details.citation['citation-value'].match(/journal = {(.*?)}/);
                    if (journal === null) {
                        if (j !== null) {
                            journal = j[1];
                            pub.journal_name = journal;
                        }
                    }
                    if (year === null) {
                        let yearCit = details.citation['citation-value'].match(/year = (\d+)/);
                        if (yearCit !== null) {
                            year = yearCit[1];
                            pub.year = year
                        }
                    }
                }
            } else {
                pub.alert_format = 1;
                //'This data is not in an automatically parsed format (Bibtex), please add additional info below\nData format: ' + details.citation['citation-type']);
            }
        }
    }
    pub.volume = volume;
    pub.number = number;
    pub.pages = pages;
    if (contributors.length ===0) {
        if (authors !== null && authors !== '') {
            pub.authors_raw = authors;
        }
    } else {
        let strAuthors = '';
        for (let ind in contributors) {
            if (ind > 0) strAuthors = strAuthors + '; ';
            strAuthors = strAuthors + contributors[ind];
        }
        pub.authors_raw = strAuthors
                    .replace(/\.\s/g, '')
                    .replace(/\./g, '');
    }
    return pub;
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
            let min_short_full = Math.min(minSimilarityFull, minSimilarityShort);
            let dissimilarityMetric = (min_short_full * 1.0)/(pub.journal_name.length * 1.0);
            if (dissimilarityMetric < 0.1) {
                mostSimilarJournalID = journals[bestInd].id;
            }
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
        personId: Number,
        managerId: Number,
        endpoint: String,
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
                orcid: undefined,
                publicationsDB: [],
                publications: [],
            },

        }
    },
    watch: {
        personId () {
            this.initialize();
        },
    },
    mounted() {
        this.initialize();
        this.$root.$on('managerUpdateSingleAddPublicationDatabaseORCID',
            (publicationData) => {
                this.updateData(publicationData);
            }
        );
    },
    methods: {
        initialize () {
            this.data.publicationsDB = [];
            this.data.publications = [];
            this.getORCID();
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
                let personID = this.personId;
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
                                url: 'api' + this.endpoint
                                    + '/members'
                                    + '/' + personID
                                    + '/journals',
                                body: publications[ind],
                            });

                        } else {
                            urlCreatePublications.push({
                                url: 'api' + this.endpoint
                                        + '/members'
                                        + '/' + personID
                                        + '/journals/' + publications[ind].journal_id
                                        + '/publications',
                                body: publications[ind],
                            });
                        }
                        this.data.publicationsDB.push(publications[ind]);
                    }
                }
                Promise.all(
                    urlCreateJournal.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                )
                .then( (createdJournals) => {
                    for (let ind in createdJournals) {
                        let journalID = createdJournals[ind].data.result.journalID;
                        urlCreatePublications.push({
                            url: 'api' + this.endpoint
                                    + '/members'
                                    + '/' + personID
                                    + '/journals/' + journalID
                                    + '/publications',
                            body: urlCreateJournal[ind].body,
                        });
                    }
                    return Promise.all(
                        urlCreatePublications.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                        ))
                    )
                })
                .then( (createdPublications) => {
                    for (let ind in createdPublications) {
                        let publicationID = createdPublications[ind].data.result.publicationID;
                        urlCreatePersonPublications.push({
                            url: 'api' + this.endpoint
                                    + '/members'
                                    + '/' + personID
                                    + '/people-publications/' + publicationID,
                            body: urlCreatePublications[ind].body,
                        });
                        //urlUpdatePublications.push({
                        //    url: 'api' + this.endpoint
                        //            + '/members'
                        //            + '/' + personID
                        //            + '/publications/' + publicationID,
                        //    body: urlCreatePublications[ind].body,
                        //});
                    }
                    return Promise.all(
                        urlCreatePersonPublications.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                        ))
                    )
                })
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
                    this.data.publications = removeExistingPublications(this.data.publications, this.data.publicationsDB);
                    this.$root.$emit('managerReloadPublicationsList');
                    setTimeout(() => {this.success = false;}, 1500)
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
        getJournals () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'journals';
                return subUtil.getPublicInfo(vm, urlSubmit, 'journals');
            }
        },
        getORCIDPublications () {
            let baseURL = 'https://pub.orcid.org';
            let version = 'v2.1';
            let resource = 'works';
            let urlORCID = baseURL
                        + '/' + version
                        + '/' + this.data.orcid
                        + '/' + resource;
            this.progressORCID = true;
            if (this.$store.state.session.loggedIn) {
                let urlSubmit = 'api' + this.endpoint
                                + '/members'
                                + '/' + 'all-publications';
                this.messageORCIDRequest = 'Getting ORCID publications missing from DB'
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    this.data.publicationsDB = result;
                    return this.$http.get(urlORCID, {
                        headers: { 'Accept': 'application/json' },
                    });
                })
                .then( (result) => {
                    let resultFiltered = filterORCIDData(result.data)
                    resultFiltered = removeExistingPublications(resultFiltered, this.data.publicationsDB);
                    this.data.publications = resultFiltered;
                    this.messageORCIDRequest = 'Processing results'
                    return Promise.all(
                        this.data.publications.map(el => {
                            let resource = 'work';
                            let url = baseURL
                                + '/' + version
                                + '/' + this.data.orcid
                                + '/' + resource
                                + '/' + el.putcode;
                            return this.$http.get(url, {
                                headers: { 'Accept': 'application/json' },
                            });
                        }
                    ))
                })
                .then( (details) => {
                    for (let ind in details) {
                        this.$set(this.data.publications[ind], 'publication_id',
                                        parseInt(ind, 10));
                        this.data.publications[ind] = processDetails(this.data.publications[ind], details[ind]);
                        this.data.publications[ind] = determineJournal(this.data.publications[ind], this.journals);
                        if (this.data.publications[ind].title === null
                            || this.data.publications[ind].authors_raw === null
                            || this.data.publications[ind].journal_name === null
                            || (this.data.publications[ind].journal_name !== null && this.data.publications[ind].journal_id === null)) {
                            this.$set(this.data.publications[ind], 'incomplete', true);
                        }
                    }
                    this.onResize();
                    this.progressORCID = false;
                    this.finishedGetORCID = true;
                });
            }
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
            //console.log(item)
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