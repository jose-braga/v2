<template>
<v-card>
    <v-form @submit.prevent="submitForm(publicationDetails)">
        <v-card-title>
            <span> Edit data for <br>
                    <b>{{ publicationDetails.title | cutLargeString }}</b>
            </span>
        </v-card-title>
        <v-card-text>
            <v-container v-if="loadingJournals">
                <v-row justify="center">
                    <v-progress-circular
                        size="100"
                        width="8"
                        indeterminate
                        color="blue"></v-progress-circular>
                </v-row>
            </v-container>
            <v-container v-if="!loadingJournals">
                <v-row justify="end">
                    <span class="small">Last updated: {{ publicationUpdated }}</span>
                </v-row>
                <v-row>
                    <v-col cols="12" md="3">
                        <v-select multiple
                            v-model="publicationDetails.publication_types"
                            :items="publicationTypes" item-value="publication_type" item-text="name_en"
                            label="Publication Type">
                        </v-select>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-select
                            v-model="publicationDetails.publication_source_id"
                            :items="publicationSources" item-value="id" item-text="name"
                            label="Information Source">
                        </v-select>
                    </v-col>
                    <v-col cols="12" md="3">
                        <b>Citations</b><br>
                        Year: {{publicationDetails.citations_last_year.year}},
                        Citations: {{publicationDetails.citations_last_year.citations}}
                    </v-col>
                    <v-col cols="12" md="3">
                        <b>Impact Factor</b><br>
                        Year: {{publicationDetails.impact_factor_last_year.year}},
                        IF: {{publicationDetails.impact_factor_last_year.impact_factor}}
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="publicationDetails.title"
                            label="Title"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="publicationDetails.authors_raw"
                            label="Authors"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" md="3">
                        <v-select v-model="publicationDetails.author_type_id"
                            :items="authorTypes" item-value="id" item-text="name_en"
                            label="Corresponding/Standard author">
                        </v-select>
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-text-field v-model="publicationDetails.position"
                            label="My position in authors list"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-text-field v-model="publicationDetails.number_authors"
                            label="Number of authors"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-autocomplete
                            v-model="publicationDetails.journal_id"
                            @change="journalChange()"
                            :items="journals" item-value="id" item-text="name_show"
                            cache-items
                            flat
                            hide-no-data
                            hide-details
                            label="Journal">
                        </v-autocomplete>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-text-field
                            v-model="publicationDetails.publisher_show"
                            disabled
                            label="Publisher"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-text-field
                            v-model="publicationDetails.issn_show"
                            disabled
                            label="ISSN / EISSN"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" md="2">
                        <v-text-field v-model="publicationDetails.volume"
                            label="Volume"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-text-field v-model="publicationDetails.page_start"
                            label="Start Page"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-text-field v-model="publicationDetails.page_end"
                            label="End Page"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-text-field v-model="publicationDetails.publication_date"
                            label="Publication Date"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-text-field v-model="publicationDetails.year"
                            label="Year"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" md="2">
                        <v-text-field v-model="publicationDetails.doi"
                            label="DOI"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-text-field v-model="publicationDetails.wos"
                            disabled
                            label="WOS accession number"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-text-field v-model="publicationDetails.wos"
                            disabled
                            label="PUBMED ID"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row align-content="center" justify="end" class="pt-6">
                <div>
                    <v-btn type="submit"
                        outlined color="blue">Save</v-btn>
                </div>
                <div class="request-status-container">
                    <v-progress-circular indeterminate
                            v-show="progress"
                            :size="20" :width="2"
                            color="primary"></v-progress-circular>
                    <v-icon v-show="success" color="green">mdi-check</v-icon>
                    <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                </div>
            </v-row>
            </v-container>
        </v-card-text>
    </v-form>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    props: {
        personPublicationId: Number,
        publicationUpdated: String,
        publicationData: Object,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            loadingJournals: true,
            searchJournals: null,
            publicationDetails: { title: ''},
            journals: [],
            publicationSources: [],
            publicationTypes: [],
            authorTypes: [],
        }
    },
    created () {},
    mounted () {
        this.getPublicationTypes()
        .then(() => {
            for (let ind in this.publicationTypes) {
                this.$set(this.publicationTypes[ind], 'publication_type',
                    this.publicationTypes[ind].id);
            }
        });
        this.getPublicationSources();
        this.getAuthorTypes();
        this.getJournals()
        .then(() => {
            for (let ind in this.journals) {
                this.$set(this.journals[ind], 'name_show',
                    this.journals[ind].short_name
                    + ' - ' + this.journals[ind].name);
            }
            this.loadingJournals = false;
        })
        this.initialize();
    },
    watch: {
        personPublicationId () {
            this.initialize();
        },
        publicationUpdated () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            this.publicationDetails = Object.assign({}, this.publicationData);
            this.$set(this.publicationDetails, 'publisher_show',
                    this.publicationDetails.publisher
                    + ' - ' + this.publicationDetails.publisher_city);
            this.$set(this.publicationDetails, 'issn_show',
                    this.publicationDetails.issn
                    + ' / ' + this.publicationDetails.eissn);
            let citations_last_year = {};
            let impact_factor_last_year = {};
            if (this.publicationDetails.citations.length === 0) {
                citations_last_year = { year:'N/A', citations: 'N/A' };
            } else {
                let maxYear = 0;
                for (let ind in this.publicationDetails.citations) {
                    if (this.publicationDetails.citations[ind].year > maxYear) {
                        maxYear = this.publicationDetails.citations[ind].year;
                        citations_last_year = {
                            year: this.publicationDetails.citations[ind].year,
                            citations: this.publicationDetails.citations[ind].citations,
                        };
                    }
                }
            }
            this.$set(this.publicationDetails, 'citations_last_year', citations_last_year);
            if (this.publicationDetails.impact_factors.length === 0) {
                impact_factor_last_year = {year:'N/A', impact_factor: 'N/A'};
            } else {
                let maxYear = 0;
                for (let ind in this.publicationDetails.impact_factors) {
                    if (this.publicationDetails.impact_factors[ind].year > maxYear) {
                        maxYear = this.publicationDetails.impact_factors[ind].year;
                        impact_factor_last_year = {
                            year: this.publicationDetails.impact_factors[ind].year,
                            impact_factor: this.publicationDetails.impact_factors[ind].impact_factor,
                        };
                    }
                }
            }
            this.$set(this.publicationDetails, 'impact_factor_last_year', impact_factor_last_year);
        },
        submitForm() {
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                let urlUpdate = [];
                this.progress = true;
                urlUpdate.push({
                    url: 'api/people/' + personID
                            + '/publications/' + this.publicationDetails.publication_id,
                    body: this.publicationDetails,
                });
                this.$http.all(
                        urlUpdate.map(el =>
                            this.$http.put(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .then(this.$http.spread( () => {
                        this.progress = false;
                        this.success = true;
                        this.$root.$emit('managerUpdateSinglePublication', this.personPublicationId);
                        setTimeout(() => {this.success = false;}, 1500)
                        this.initialize();
                    }))
                    .catch((error) => {
                        this.progress = false;
                        this.error = true;
                        this.$root.$emit('managerUpdateSinglePublication', this.personPublicationId);
                        setTimeout(() => {this.error = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    })
            }
        },
        getJournals () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'journals';
                return subUtil.getPublicInfo(vm, urlSubmit, 'journals');
            }
        },
        getPublicationSources () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'publication-sources';
                return subUtil.getPublicInfo(vm, urlSubmit, 'publicationSources');
            }
        },
        getPublicationTypes () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'publication-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'publicationTypes');
            }
        },
        getAuthorTypes () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'author-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'authorTypes');
            }
        },
        journalChange() {
            for (let ind in this.journals) {
                if ( this.journals[ind].id === this.publicationDetails.journal_id) {
                    this.$set(this.publicationDetails, 'publisher_show',
                        this.journals[ind].publisher
                        + ' - ' + this.journals[ind].publisher_city);
                    this.$set(this.publicationDetails, 'issn_show',
                        this.journals[ind].issn
                        + ' / ' + this.journals[ind].eissn);
                    break;
                }
            }
        },
    },
    filters: {
        cutLargeString (value) {
            let maxLength = 150;
            if (value.length > maxLength) {
                return value.substring(0, maxLength) + ' ...';
            } else {
                return value;
            }
        },
    },

}
</script>

<style scoped>

.small {
    font-size: 0.6rem;
}

</style>