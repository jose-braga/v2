<template>
<div>
    <v-app-bar prominent app>
        <v-row  align="center">
            <v-col cols="1">
                <img src="/images/logo/ucibio-logo.png" width="40">
            </v-col>
            <v-col cols="10" class="ml-auto call-title">
                Calls: {{reviewerName}} Reviewer Area<br>
                {{callName}}
            </v-col>
        </v-row>
    </v-app-bar>
    <v-form ref="form"
         @submit.prevent="submitForm"
    >
        <div v-if="loggedIn" class="px-4 mt-2">
            <v-card v-if="data.isLAQV === 1" pa-2>
                <ApplicationViewLAQV></ApplicationViewLAQV>
            </v-card>
            <v-card v-else pa-2>
                <v-card-title>
                    <v-container>
                        <v-row class="applicant-name">
                            Applicant name: {{data.application.applicant_name}}<br>
                        </v-row>
                        <v-row class="headline mt-2">
                            Evaluation of application
                        </v-row>
                    </v-container>
                </v-card-title>
                <v-card-text>Besides <b>Presentation</b> and <b>Interview</b>,
                    reviewer input is always necessary for the
                    <b>Letter(s) of Reference</b> and for the <b>Motivation Letter.</b>
                    <br>
                    Optionally a reviewer can always override automatic scores.
                </v-card-text>
                <v-container v-if="indTotal">
                    <v-row>
                        <v-col cols="12">
                            <span class="total-score ml-4">
                                Overall score: <span class="score">{{data.scores[indTotal].score_final}}</span>
                            </span>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-expansion-panels
                                multiple
                            >
                                <!-- v-for="(criteria1, key1) in data.scores[indTotal].children" -->
                                <v-expansion-panel
                                    v-for="(criteria1, key1) in data.scores[indTotal].children"
                                    :key="key1"
                                    multiple
                                >
                                    <v-expansion-panel-header>
                                        <span class="title-level-1">
                                            {{criteria1.criteria_name}}
                                            <span class="score"> - Score: {{criteria1.score_final}}</span>
                                            <span class="weight ml-2">(Weight: {{criteria1.weight * 100}}%)</span>
                                        </span>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <v-expansion-panels
                                            multiple
                                            class="px-10"
                                        >
                                            <v-expansion-panel
                                                v-for="(criteria2, key2) in criteria1.children"
                                                :key="key1 + '-' + key2"
                                                multiple
                                            >
                                                <v-expansion-panel-header>
                                                    <span class="title-level-2">
                                                        {{criteria2.criteria_name}}
                                                        <span class="score"> - Score: {{criteria2.score_final}}</span>
                                                        <span class="weight ml-2">(Weight: {{criteria2.weight * 100}}%)</span>
                                                    </span>
                                                </v-expansion-panel-header>
                                                <v-expansion-panel-content>
                                                    <div v-if="criteria2.criteria_name === 'Academic Path'">
                                                        <ol>
                                                            <li v-for="(datum, i) in data.application.academicDegrees"
                                                                :key="key1 + '-' + key2 + '-' + i"
                                                                class="mb-2"
                                                            >
                                                                <v-row class="pl-2" align="center">
                                                                    <span class="highlight">{{datum.degree_name}}</span>
                                                                    <span class="standard-text">, {{datum.course_name}}</span>
                                                                    <span class="standard-text">, {{datum.institution}}.</span>
                                                                    <span class="standard-text"> ({{datum.date_end | formatDate}}).</span>
                                                                    <span class="highlight"> Grade: ({{datum.grade}})</span>
                                                                </v-row>
                                                            </li>
                                                        </ol>
                                                    </div>
                                                    <div v-if="criteria2.criteria_name === 'Motivation Letter'">
                                                        <v-card>
                                                            <v-card-text class="pre-formatted">{{data.application.motivationLetter.motivation_letter}}</v-card-text>
                                                        </v-card>
                                                    </div>
                                                    <v-expansion-panels
                                                        multiple
                                                        class="px-10"
                                                    >
                                                        <v-expansion-panel
                                                            v-for="(criteria3, key3) in criteria2.children"
                                                            :key="key1 + '-' + key2 + '-' + key3"
                                                            multiple
                                                        >
                                                            <v-expansion-panel-header>
                                                                <span class="title-level-3">
                                                                    {{criteria3.criteria_name}}
                                                                    <span class="score"> - Score: {{criteria3.score_final}}</span>
                                                                    <span class="weight ml-2">(Weight: {{criteria3.weight * 100}}%)</span>
                                                                </span>
                                                            </v-expansion-panel-header>
                                                            <v-expansion-panel-content>
                                                                <div v-if="criteria3.criteria_name === 'Projects'">
                                                                    <ol>
                                                                        <li v-for="(datum, i) in data.application.projects"
                                                                            :key="key1 + '-' + key2 + '-' + key3 + '-' + i"
                                                                        >
                                                                            <span class="highlight">{{datum.title}}</span>
                                                                            <span class="standard-text"> ({{datum.acronym}}, {{datum.reference}}),</span>
                                                                            <span class="standard-text"> PI: {{datum.principal_investigator}}</span>
                                                                            <span class="standard-text">. Started: {{datum.year_start}}, Ended:{{datum.year_end}} </span>
                                                                            <br><span class="standard-text">Participation: {{datum.participation}}</span>
                                                                            <br><span class="standard-text">Applicant comments: {{datum.additional_data}}</span>
                                                                        </li>
                                                                    </ol>
                                                                </div>
                                                                <div v-if="criteria3.criteria_name === 'Papers'">
                                                                    <ol>
                                                                        <li v-for="(datum, i) in data.application.papers"
                                                                            :key="key1 + '-' + key2 + '-' + key3 + '-' + i"
                                                                        >
                                                                            <v-row class="pl-2" align="center">
                                                                                <span class="standard-text">{{datum.authors_raw}}</span>
                                                                                <span class="standard-text"> ({{datum.year}}).</span>
                                                                                <span class="standard-text"> "{{datum.title}}". </span>
                                                                                <span class="highlight"> {{datum.journal_name}},</span>
                                                                                <span class="standard-text"> {{datum.volume}},</span>
                                                                                <span class="standard-text"> {{datum.pages}}.</span>
                                                                                <span class="highlight">Quartile:  Q{{datum.journal_quartile}}.</span>
                                                                                <span class="standard-text"> DOI:
                                                                                    <a :href="'https://doi.org/' + datum.doi"
                                                                                        target="_blank"
                                                                                    >
                                                                                        {{datum.doi}}.
                                                                                    </a>
                                                                                </span>
                                                                                <span class="ml-2">
                                                                                    <v-checkbox
                                                                                        v-model="datum.first_author"
                                                                                        readonly
                                                                                        label="First author"
                                                                                    ></v-checkbox>
                                                                                </span>
                                                                            </v-row>
                                                                        </li>
                                                                    </ol>
                                                                </div>
                                                                <div v-if="criteria3.criteria_name === 'Communications'">
                                                                    <ol>
                                                                        <li v-for="(datum, i) in data.application.communications"
                                                                            :key="key1 + '-' + key2 + '-' + key3 + '-' + i"
                                                                        >
                                                                            <v-row class="pl-2" align="center">
                                                                                <span class="standard-text">{{datum.authors_raw}}</span>
                                                                                <span class="standard-text">, "{{datum.title}}"</span>
                                                                                <span class="highlight">. {{datum.meeting_name}}</span>
                                                                                <span class="standard-text">, {{datum.date | formatDate}}.</span>
                                                                                <span class="ml-2">
                                                                                    <v-checkbox
                                                                                        v-model="datum.first_author"
                                                                                        readonly
                                                                                        dense
                                                                                        label="First author"
                                                                                    ></v-checkbox>
                                                                                </span>
                                                                                <span class="ml-2">
                                                                                    <v-checkbox
                                                                                        v-model="datum.international"
                                                                                        readonly
                                                                                        dense
                                                                                        label="International"
                                                                                    ></v-checkbox>
                                                                                </span>
                                                                            </v-row>
                                                                        </li>
                                                                    </ol>
                                                                </div>
                                                                <div v-if="criteria3.criteria_name === 'Posters'">
                                                                    <ol>
                                                                        <li v-for="(datum, i) in data.application.posters"
                                                                            :key="key1 + '-' + key2 + '-' + key3 + '-' + i"
                                                                        >
                                                                            <v-row class="pl-2" align="center">
                                                                                <span class="standard-text">{{datum.authors_raw}}</span>
                                                                                <span class="standard-text">, "{{datum.title}}"</span>
                                                                                <span class="highlight">. {{datum.meeting_name}}</span>
                                                                                <span class="standard-text">, {{datum.date | formatDate}}.</span>
                                                                                <span class="ml-2">
                                                                                    <v-checkbox
                                                                                        v-model="datum.first_author"
                                                                                        readonly
                                                                                        dense
                                                                                        label="First author"
                                                                                    ></v-checkbox>
                                                                                </span>
                                                                                <span class="ml-2">
                                                                                    <v-checkbox
                                                                                        v-model="datum.international"
                                                                                        readonly
                                                                                        dense
                                                                                        label="International"
                                                                                    ></v-checkbox>
                                                                                </span>
                                                                            </v-row>
                                                                        </li>
                                                                    </ol>
                                                                </div>
                                                                <div v-if="criteria3.criteria_name === 'Patents/Prizes/Professional Experience'">
                                                                    <v-row class="pl-2 mb-2" align="center">
                                                                        <span class="highlight">Patents</span>
                                                                    </v-row>
                                                                    <ol>
                                                                        <li v-for="(datum, i) in data.application.patents"
                                                                            :key="key1 + '-' + key2 + '-' + key3 + '-' + i"
                                                                        >
                                                                            <v-row class="pl-2" align="center">
                                                                                <span class="standard-text">{{datum.authors_raw}}</span>
                                                                                <span class="standard-text"> ({{datum.year}})</span>
                                                                                <span class="standard-text">, "{{datum.title}}"</span>
                                                                                <span class="standard-text">. Reference: {{datum.reference}}</span>
                                                                                <span class="standard-text">. Status: {{datum.status}}</span>
                                                                            </v-row>
                                                                        </li>
                                                                    </ol>
                                                                    <v-row class="pl-2 my-2" align="center">
                                                                        <span class="highlight">Prizes</span>
                                                                    </v-row>
                                                                    <ol>
                                                                        <li v-for="(datum, i) in data.application.prizes"
                                                                            :key="key1 + '-' + key2 + '-' + key3 + '-' + i"
                                                                        >
                                                                            <v-row class="pl-2" align="center">
                                                                                <span class="standard-text">{{datum.prize_name}}</span>
                                                                                <span class="standard-text"> ({{datum.year}})</span>
                                                                                <span class="standard-text">, Comments: {{datum.additional_data}}</span>
                                                                            </v-row>
                                                                        </li>
                                                                    </ol>
                                                                    <v-row class="pl-2 my-2" align="center">
                                                                        <span class="highlight">Professional Experience</span>
                                                                    </v-row>
                                                                    <ol>
                                                                        <li v-for="(datum, i) in data.application.professionalExperience"
                                                                            :key="key1 + '-' + key2 + '-' + key3 + '-' + i"
                                                                        >
                                                                            <v-row class="pl-2" align="center">
                                                                                <span class="standard-text">{{datum.date_start | formatDate}}-{{datum.date_end | formatDate}}</span>
                                                                                <span class="standard-text">  - {{datum.company}}</span>
                                                                                <span class="standard-text">. Business Areas: {{datum.business_areas}}</span>
                                                                            </v-row>
                                                                        </li>
                                                                    </ol>
                                                                </div>
                                                                <div v-if="criteria3.criteria_name === 'Reference Letters'">
                                                                    <v-row>

                                                                        <v-col cols="12" md="6" v-for="(datum, i) in data.application.recommenders"
                                                                                :key="key1 + '-' + key2 + '-' + key3 + '-' + i">
                                                                            <v-card>
                                                                                <v-card-title>
                                                                                    <span class="highlight">{{datum.name}}</span>
                                                                                    <span class="standard-text">, ({{datum.role}}, {{datum.institution}}):</span>
                                                                                </v-card-title>
                                                                                <v-card-text>
                                                                                    <div class="pre-formatted">{{datum.referenceLetter.text}}</div>
                                                                                </v-card-text>
                                                                                <v-container >
                                                                                    <v-row v-for="(answer, j) in datum.answers"
                                                                                        :key="key1 + '-' + key2 + '-' + key3 + '-' + i + '-' + j"
                                                                                        dense
                                                                                        class="pre-formatted"
                                                                                    >
                                                                                        <v-col v-if="answer.answer_type === 'text'" cols="12">
                                                                                            <span class="question">{{answer.question}}</span>
                                                                                        </v-col>
                                                                                        <v-col v-if="answer.answer_type === 'text'" cols="12">
                                                                                            <span class="answer">- {{answer.answer}}
                                                                                            </span>
                                                                                        </v-col>
                                                                                        <v-col v-if="answer.answer_type === 'grade'" cols="10">
                                                                                            <span class="question">{{answer.question}}</span>
                                                                                        </v-col>
                                                                                        <v-col  v-if="answer.answer_type === 'grade'" cols="2">
                                                                                            <span class="answer">{{answer.score}}
                                                                                            </span>
                                                                                        </v-col>
                                                                                    </v-row>
                                                                                </v-container>
                                                                            </v-card>
                                                                        </v-col>
                                                                    </v-row>
                                                                </div>
                                                                <div v-if="Object.keys(criteria3.children).length === 0">
                                                                    <v-divider class="my-2"></v-divider>
                                                                    <p>Automatic score: {{criteria3.score}}</p>
                                                                    <v-row align="center">
                                                                        <v-col cols="12" sm="4" md="3" lg="2">
                                                                            Override score:
                                                                        </v-col>
                                                                        <v-col cols="12" sm="4" md="3" lg="2">
                                                                            <v-text-field
                                                                                v-model="criteria3.score_manual"
                                                                                :error="checkError(criteria3.score_manual)"
                                                                                @input="updateScores(criteria3, criteria3.criteria_id)"
                                                                                label="Your score"
                                                                            >
                                                                            </v-text-field>
                                                                        </v-col>
                                                                        <v-col cols="12" sm="12" md="6" lg="8">
                                                                            <v-text-field
                                                                                v-model="criteria3.comments"
                                                                                label="Comments"
                                                                            >
                                                                            </v-text-field>
                                                                        </v-col>
                                                                    </v-row>
                                                                </div>
                                                            </v-expansion-panel-content>
                                                        </v-expansion-panel>
                                                    </v-expansion-panels>
                                                    <div v-if="Object.keys(criteria2.children).length === 0">
                                                        <v-divider class="my-2"></v-divider>
                                                        <p>Automatic score: {{criteria2.score}}</p>
                                                        <v-row align="center">
                                                            <v-col cols="12" sm="4" md="3" lg="2">
                                                                Override score:
                                                            </v-col>
                                                            <v-col cols="12" sm="4" md="3" lg="2">
                                                                <v-text-field
                                                                    v-model="criteria2.score_manual"
                                                                    :error="checkError(criteria2.score_manual)"
                                                                    @input="updateScores(criteria2, criteria2.criteria_id)"
                                                                    label="Your score"
                                                                >
                                                                </v-text-field>
                                                            </v-col>
                                                            <v-col cols="12" sm="12" md="6" lg="8">
                                                                <v-text-field
                                                                    v-model="criteria2.comments"
                                                                    label="Comments"
                                                                >
                                                                </v-text-field>
                                                            </v-col>
                                                        </v-row>
                                                    </div>
                                                </v-expansion-panel-content>
                                            </v-expansion-panel>
                                        </v-expansion-panels>
                                        <div v-if="Object.keys(criteria1.children).length === 0">
                                            <v-divider class="my-2"></v-divider>
                                            <p>Automatic score: {{criteria1.score}}</p>
                                            <v-row align="center">
                                                <v-col cols="12" sm="4" md="3" lg="2">
                                                    Override score:
                                                </v-col>
                                                <v-col cols="12" sm="4" md="3" lg="2">
                                                    <v-text-field
                                                        v-model="criteria1.score_manual"
                                                        :error="checkError(criteria1.score_manual)"
                                                        @input="updateScores(criteria1, criteria1.criteria_id)"
                                                        label="Your score"
                                                    >
                                                    </v-text-field>
                                                </v-col>
                                                <v-col cols="12" sm="12" md="6" lg="8">
                                                    <v-text-field
                                                        v-model="criteria1.comments"
                                                        label="Comments"
                                                    >
                                                    </v-text-field>
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-expansion-panels>
                            <v-expansion-panel>
                                <v-expansion-panel-header>
                                    <span class="title-level-1">
                                        Application documents
                                    </span>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <ol>
                                        <li v-for="(doc, i) in data.application.documents"
                                            :key="'doc' + i"
                                            class="mb-2"
                                        >
                                            <span>
                                                <a :href="doc.url" target="_blank">
                                                    {{doc.document_type_name}}
                                                </a>
                                            </span>
                                        </li>
                                    </ol>

                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-row>
                    <v-row align-content="center" justify="center">
                        <v-col cols="3" v-if="formError">
                            <v-row justify="end">
                                <p class="caption red--text">Unable to submit form. Check scores!</p>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-row align-content="center" justify="center">
                        <v-col cols="2" align-self="end">
                            <v-row justify="end">
                                <v-btn type="submit"
                                    class="white--text"
                                    color="blue"
                                    large
                                >
                                    Save Your Review
                                </v-btn>
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
                    <v-row align-content="center" justify="center">
                        <v-col cols="2" align-self="end">
                            <v-row justify="end">
                                <v-btn v-if="data.application.reviewed !== true && data.application.reviewed !== 1"
                                    @click="tagChecked"
                                    class="white--text"
                                    color="green"
                                    large
                                >
                                    Tag as Checked
                                </v-btn>
                                <v-btn v-else
                                    @click="tagChecked"
                                    class="white--text"
                                    color="red"
                                    large
                                >
                                    Tag as Unchecked
                                </v-btn>
                            </v-row>
                        </v-col>
                        <v-col cols="1">
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </div>
    </v-form>
</div>
</template>

<script>
import ApplicationViewLAQV from './ReviewerCallApplicationLAQV'

const scoreSum = (obj, sum) => {
    if (sum === undefined) sum = 0;
    const myKeys = Object.keys(obj)
    if (myKeys.includes('children')) {
        const myChildren = Object.values(obj.children);
        if (myChildren.length > 0) {
            myChildren.forEach( (val) => {
                if (val.score_final && Object.keys(val.children).length === 0 ) {
                    sum = sum + val.score_final * val.weight;
                } else if (Object.keys(val.children).length > 0) {
                    sum = sum + scoreSum(val) * val.weight;
                }
            })
        } else {
            sum = obj.score_final;
        }

    }
    return sum;
};

export default {
    components: {
        ApplicationViewLAQV,
    },
    data () {
        return {
            error: false,
            success: false,
            progress: false,
            formError: false,
            callName: '',
            data: {
                application: {},
                scores: {},
                isLAQV: false,
            },
            indTotal: undefined,
            applicationCriteria: [],
        }
    },
    computed: {
        loggedIn () {
            return this.$store.state.sessionreviewer.loggedIn;
        },
        reviewerName () {
            return this.$store.state.sessionreviewer.reviewerName;
        },
    },
    created() {
        this.$store.commit('checkExistingSessionReviewer');
        this.getReviewerApplicationDetails();
    },
    methods: {
        submitForm () {
            //first check
            let error = false;
            for (let ind in this.data.application.automaticScores) {
                if(this.checkError(this.data.application.automaticScores[ind].score_manual)) {
                    error = true;
                    this.formError = true;
                    break;
                }
            }
            if (!error) {
                this.formError = false;
                this.progress = true;
                this.$http.post('api/calls/' + this.$route.params.callSegment
                    + '/applications/' + this.$route.params.applicationID
                    + '/reviewers/' + this.$store.state.sessionreviewer.reviewerID
                    + '/scores',
                    {
                        data: { scores: this.data.application.automaticScores }
                    },
                    {
                        headers: {'Authorization': 'Bearer ' + localStorage['v2-reviewer-token']},
                    }
                )
                .then(() => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 3000)
                    this.data.application = {};
                    this.data.scores = {};
                    this.applicationCriteria = {};
                    this.indTotal = false;
                    this.getReviewerApplicationDetails();
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    setTimeout(() => {this.error = false;}, 10000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        tagChecked () {
            let create = false;
            if (this.data.application.reviewed === null) {
                create = true;
            }
            if (this.data.application.reviewed !== true && this.data.application.reviewed !== 1) {
                this.data.application.reviewed = true;
            } else {
                this.data.application.reviewed = false;
            }
            if (create) {
                this.$http.post('api/calls/' + this.$route.params.callSegment
                    + '/applications/' + this.$route.params.applicationID
                    + '/reviewers/' + this.$store.state.sessionreviewer.reviewerID
                    + '/tag-reviewed',
                    { data: { reviewed: this.data.application.reviewed } },
                    {
                        headers: {'Authorization': 'Bearer ' + localStorage['v2-reviewer-token']},
                    }
                )
                .catch((error) => console.log(error));

            } else {
                this.$http.put('api/calls/' + this.$route.params.callSegment
                    + '/applications/' + this.$route.params.applicationID
                    + '/reviewers/' + this.$store.state.sessionreviewer.reviewerID
                    + '/tag-reviewed',
                    { data: { reviewed: this.data.application.reviewed } },
                    {
                        headers: {'Authorization': 'Bearer ' + localStorage['v2-reviewer-token']},
                    }
                )
                .catch((error) => console.log(error));
            }
        },
        getReviewerApplicationDetails () {
            this.data.scores = {};
            this.$http.get('api/calls/' + this.$route.params.callSegment
                + '/applications/' + this.$route.params.applicationID
                + '/reviewers/' + this.$store.state.sessionreviewer.reviewerID,
                {
                    headers: {'Authorization': 'Bearer ' + localStorage['v2-reviewer-token']},
                }
            )
            .then((result) => {
                this.callName = result.data.result.call.call_name
                this.data.application = result.data.result.application;
                this.applicationCriteria = result.data.result.applicationCriteria;
                this.data.isLAQV = result.data.result.call.is_laqv;

                for (let ind in this.data.application.reviewerScores) {
                    for (let indAuto in this.data.application.automaticScores) {
                        if(this.data.application.automaticScores[indAuto].criteria_id ===
                            this.data.application.reviewerScores[ind].criteria_id
                        ) {
                            this.data.application.automaticScores[indAuto].score_manual =
                                this.data.application.reviewerScores[ind].score;
                            this.data.application.automaticScores[indAuto].comments =
                                this.data.application.reviewerScores[ind].comments;
                            break;
                        }
                    }
                }
                for (let ind in this.data.application.automaticScores) {
                    this.data.application.automaticScores[ind].children = {};
                    if (this.data.application.automaticScores[ind].score_manual !== null
                        && this.data.application.automaticScores[ind].score_manual !== undefined
                    ) {
                        this.data.application.automaticScores[ind].score_final =
                        this.data.application.automaticScores[ind].score_manual;
                    } else {
                        this.data.application.automaticScores[ind].score_final =
                        this.data.application.automaticScores[ind].score;
                    }
                    this.$set(this.data.scores, this.data.application.automaticScores[ind].criteria_id,
                        this.data.application.automaticScores[ind]);
                }

                for (const [key,val] of Object.entries(this.data.scores)) {
                    if (val.parent_criteria_id !== null) {
                        this.$set(this.data.scores[val.parent_criteria_id].children, key, val);
                    }
                    if (val.criteria_name === 'Total') {
                        this.indTotal = key;
                    }
                }
                this.updateScores();
            })
            .catch( (error) => {
                console.log(error);
            })

        },
        updateScores (criteria, id) {
            this.data.scores = {};
            // alter the changed score in the corresponding automaticScores array entry
            if (criteria !== undefined && id !== undefined) {
                for (let ind in this.data.application.automaticScores) {
                    if (this.data.application.automaticScores[ind].criteria_id
                            === id) {
                        if (criteria.score_manual !== null
                                && criteria.score_manual !== undefined
                                && criteria.score_manual !== ''
                                && !Number.isNaN(parseFloat(criteria.score_manual))
                            ) {
                            this.data.application.automaticScores[ind].score_manual =
                                parseFloat(criteria.score_manual);
                            this.data.application.automaticScores[ind].score_final =
                                parseFloat(criteria.score_manual);
                            //this.$v.data.application.automaticScores
                            //    .$each.$iter[ind].score_final.$touch();
                            this.$set(this.data.scores, id,
                                this.data.application.automaticScores[ind]);
                            break;
                        }
                    }
                }
            }
            for (let ind in this.data.application.automaticScores) {
                this.data.application.automaticScores[ind].children = {};
                if (this.data.application.automaticScores[ind].score_manual !== null
                    && this.data.application.automaticScores[ind].score_manual !== undefined
                    && this.data.application.automaticScores[ind].score_manual !== ''
                    && !Number.isNaN(parseFloat(this.data.application.automaticScores[ind].score_manual))
                ) {
                    this.data.application.automaticScores[ind].score_final =
                    this.data.application.automaticScores[ind].score_manual;
                } else {
                    this.data.application.automaticScores[ind].score_final =
                    this.data.application.automaticScores[ind].score;
                }
                this.$set(this.data.scores, this.data.application.automaticScores[ind].criteria_id,
                    this.data.application.automaticScores[ind]);
            }
            for (const [key,val] of Object.entries(this.data.scores)) {
                if (val.parent_criteria_id !== null) {
                    this.data.scores[val.parent_criteria_id].children[key] = val;
                }
            }
            for (const [key,val] of Object.entries(this.data.scores)) {
                val.score_final = scoreSum(val).toFixed(2);
                if (val.criteria_name === 'Total') {
                    this.indTotal = key;
                }
            }
        },
        checkError (val) {
            if (val === null || val === undefined || val === '') return false;
            if (Number.isNaN(parseFloat(val))) {
                return true;
            }
            if (parseFloat(val) < 0 || parseFloat(val) > 5) {
                return true;
            }
            return false;
        },
    },
}
</script>

<style scoped>

.call-title {
    font-size: 20px;
}

.applicant-name {
    font-size: 26px;
}
.total-score {
    font-size: 25px;
    padding: 10px;
    border:dimgray 1px solid;
}

.title-level-1 {
    font-size: 26px;
}
.title-level-2 {
    font-size: 22px;
    font-weight: 300;
}

.score {
    color:cornflowerblue;
}

.title-level-3 .weight {
    font-size: 12px;
    font-weight: 300;
}
.weight {
    font-size: 14px;
}

.highlight {
    font-weight: bold;
}
.pre-formatted {
    white-space: pre-wrap;
}
.question {
    font-size: 0.9em;
    font-style: italic;
}
.answer {
    font-size: 0.9rem;
    font-weight: bold;
}

</style>