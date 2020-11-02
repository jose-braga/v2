<template>
<div>
    <v-app-bar prominent app>
        <v-row  align="center">
            <v-col cols="1">
                <img src="/images/logo/ucibio-logo.png" width="40">
            </v-col>
            <v-col cols="10" class="ml-auto call-title">
                Calls: Manager Area<br>
                {{callName}}
            </v-col>
        </v-row>
    </v-app-bar>
    <div v-if="loggedIn" class="px-4">
        <v-row justify="center" align="center" class="mt-1">
            <v-col cols="12" align="center">
                <v-row justify="center" align="center">
                    <span class="mr-4">Export to spreadsheet</span>
                    <v-btn fab color="green" @click="generateSpreadsheet(applications)">
                        <v-icon color="white" x-large>mdi-file-excel</v-icon>
                    </v-btn>
                </v-row>
            </v-col>
        </v-row>
        <div
            v-for="(application, ind) in applications"
            :key="ind"
            class="px-2 mt-4"
        >
            <div v-if="indTotal[ind]">
                <v-expansion-panels
                    multiple
                    class="px-2"
                >
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <div>
                                <span class="applicant-name">
                                    Applicant name: {{application.applicant_name}}.
                                </span>
                                <span class="reviewer">Average:</span>
                                <span class="reviewer score">
                                    {{application.score_average}}.
                                </span>
                                <span class="date-submission">
                                    Submitted: {{application.date_submitted}} {{application.time_submitted}}
                                </span>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <ul class="mb-8">
                                <li><b>Email:</b> {{application.applicant.email}}</li>
                                <li><b>Address:</b> {{application.applicant.address}},
                                    {{application.applicant.postal_code}}, {{application.applicant.city}}
                                </li>
                                <li><b>ID card:</b> {{application.applicant.document_number}},
                                        valid until: {{application.applicant.document_valid_until | formatDate}}
                                </li>
                            </ul>
                            <v-row dense
                            >
                                <v-col cols="1"
                                >
                                    <v-row justify="end">
                                        Include score
                                    </v-row>
                                </v-col>
                                <v-col cols="11">
                                </v-col>
                            </v-row>

                            <v-row v-for="(reviewer, indRev) in application.reviewers"
                                    :key="ind + '-' + indRev"
                                    dense
                            >
                                <v-col cols="1"
                                >
                                    <v-row justify="end">
                                    <v-checkbox
                                        v-model="reviewer.use_score"
                                        @change="computeNewScore(ind)"
                                    ></v-checkbox>
                                    </v-row>
                                </v-col>
                                <v-col cols="11">
                                    <v-expansion-panels
                                        multiple
                                        class="px-2"
                                    >
                                        <v-expansion-panel
                                        >
                                            <v-expansion-panel-header>
                                                <div>
                                                    <span class="reviewer">
                                                        Reviewer: {{reviewer.name}}
                                                        <span v-if="reviewer.is_surrogate">
                                                            (surrogate)
                                                        </span>.
                                                    </span>
                                                    <span class="reviewer">Total:</span>
                                                    <span class="reviewer score">
                                                        {{data.scores[ind][indRev][indTotal[ind]].score_final}}
                                                    </span>
                                                    <v-icon
                                                        v-if="reviewer.reviewed" color="green"
                                                        class="ml-2 mb-2"
                                                    >
                                                        mdi-check
                                                    </v-icon>
                                                    <v-icon v-else color="red"
                                                        class="ml-2 mb-2"
                                                    >
                                                        mdi-alert
                                                    </v-icon>
                                                </div>
                                            </v-expansion-panel-header>
                                            <v-expansion-panel-content>
                                                <v-expansion-panels
                                                    v-if="data.isLAQV === 1"
                                                    multiple
                                                >
                                                    <ManagerCallApplicationsListLAQV
                                                        :scores="data.scores[ind][indRev][indTotal[ind]].children"
                                                        :application="applications[ind]"
                                                    >
                                                    </ManagerCallApplicationsListLAQV>
                                                </v-expansion-panels>
                                                <v-expansion-panels
                                                    v-else
                                                    multiple
                                                >
                                                    <v-expansion-panel
                                                        v-for="(criteria1, key1) in data.scores[ind][indRev][indTotal[ind]].children"
                                                        :key="ind + '-' + indRev + '-' + key1"
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
                                                                    :key="ind + '-' + indRev + '-' + key1 + '-' + key2"
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
                                                                                <li v-for="(datum, i) in applications[ind].academicDegrees"
                                                                                    :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + i"
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
                                                                                <v-card-text class="pre-formatted">{{applications[ind].motivationLetter.motivation_letter}}</v-card-text>
                                                                            </v-card>
                                                                        </div>
                                                                        <v-expansion-panels
                                                                            multiple
                                                                            class="px-10"
                                                                        >
                                                                            <v-expansion-panel
                                                                                v-for="(criteria3, key3) in criteria2.children"
                                                                                :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + key3"
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
                                                                                            <li v-for="(datum, i) in applications[ind].projects"
                                                                                                :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + key3 + '-' + i"
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
                                                                                            <li v-for="(datum, i) in applications[ind].papers"
                                                                                                :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + key3 + '-' + i"
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
                                                                                            <li v-for="(datum, i) in applications[ind].communications"
                                                                                                :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + key3 + '-' + i"
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
                                                                                            <li v-for="(datum, i) in applications[ind].posters"
                                                                                                :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + key3 + '-' + i"
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
                                                                                            <li v-for="(datum, i) in applications[ind].patents"
                                                                                                :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + key3 + '-' + i"
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
                                                                                            <li v-for="(datum, i) in applications[ind].prizes"
                                                                                                :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + key3 + '-' + i"
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
                                                                                            <li v-for="(datum, i) in applications[ind].professionalExperience"
                                                                                                :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + key3 + '-' + i"
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

                                                                                            <v-col cols="12" md="6" v-for="(datum, i) in applications[ind].recommenders"
                                                                                                :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + key3 + '-' + i"
                                                                                            >
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
                                                                                                            :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + key3 + '-' + i + '-' + j"
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
                                                                                        <p>Reviewer score: {{criteria3.score_manual}}</p>
                                                                                        <p>Reviewer comments: {{criteria3.comments}}</p>
                                                                                    </div>
                                                                                </v-expansion-panel-content>
                                                                            </v-expansion-panel>
                                                                        </v-expansion-panels>
                                                                        <div v-if="Object.keys(criteria2.children).length === 0">
                                                                            <v-divider class="my-2"></v-divider>
                                                                            <p>Automatic score: {{criteria2.score}}</p>
                                                                            <p>Reviewer score: {{criteria2.score_manual}}</p>
                                                                            <p>Reviewer comments: {{criteria2.comments}}</p>
                                                                        </div>
                                                                    </v-expansion-panel-content>
                                                                </v-expansion-panel>
                                                            </v-expansion-panels>
                                                            <div v-if="Object.keys(criteria1.children).length === 0">
                                                                <v-divider class="my-2"></v-divider>
                                                                <p>Automatic score: {{criteria1.score}}</p>
                                                                <p>Reviewer score: {{criteria1.score_manual}}</p>
                                                                <p>Reviewer comments: {{criteria1.comments}}</p>
                                                            </div>
                                                        </v-expansion-panel-content>
                                                    </v-expansion-panel>
                                                </v-expansion-panels>
                                            </v-expansion-panel-content>
                                        </v-expansion-panel>
                                    </v-expansion-panels>
                                </v-col>


                            </v-row>

                            <v-expansion-panels class="mt-3 px-2">
                                <v-expansion-panel>
                                    <v-expansion-panel-header>
                                        <span class="title-level-1">
                                            Application documents
                                        </span>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <ol>
                                            <li v-for="(doc, i) in application.documents"
                                                :key="ind + '-doc-' + i"
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
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import ManagerCallApplicationsListLAQV from './ManagerCallApplicationsListLAQV'
import time from '@/components/common/date-utils'
import XLSX from 'xlsx'

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
function processForSpreadsheet(items) {
    let itemsCurated = [];
    for (let ind in items) {
        let thisItem = {};
        thisItem.applicant_name = items[ind].applicant_name;
        thisItem.email = items[ind].applicant.email;
        thisItem.submission_time = items[ind].date_submitted + ' ' + items[ind].time_submitted;
        thisItem.score_average = items[ind].score_average;
        for (let indRev in items[ind].reviewers) {
            thisItem[
                    items[ind].reviewers[indRev].name
                    + '_reviewed'
                ] = items[ind].reviewers[indRev].reviewed ? items[ind].reviewers[indRev].reviewed : 0;
            for (let indAuto in items[ind].reviewers[indRev].automaticScores) {
                thisItem[
                    items[ind].reviewers[indRev].name
                    + '_' + items[ind].reviewers[indRev].automaticScores[indAuto].criteria_name
                ] = items[ind].reviewers[indRev].automaticScores[indAuto].score_final;
            }
        }
        itemsCurated.push(thisItem);
    }
    return itemsCurated;
}

export default {
    components: {
        ManagerCallApplicationsListLAQV,
    },
    data () {
        return {
            callName: '',
            applications: [],
            data: {
                scores: [],
                isLAQV: false,
            },
            indTotal: [],

        }
    },
    computed: {
        loggedIn () {
            return this.$store.state.session.loggedIn;
        },
        personName () {
            return this.$store.state.session.personName;
        },
    },
    mounted() {
        this.$store.commit('checkExistingSession', { path: '/call-managers'});
        this.getManagerCallApplications();
    },
    watch: {
        $route () {
            this.getManagerCallApplications();
        },
    },
    methods: {
        getManagerCallApplications () {
            this.$http.get('api/calls/' + this.$route.params.callSegment
                + '/applications'
                + '/call-managers/' + this.$store.state.session.personID,
                {
                    headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                }
            )
            .then((result) => {
                this.callName = result.data.result.call.call_name
                this.data.isLAQV = result.data.result.call.is_laqv;
                this.applications = result.data.result.applications;
                for (let ind in this.applications) {
                    let datetime = time.moment(this.applications[ind].submitted).tz('Europe/Lisbon');
                    this.$set(this.applications[ind], 'date_submitted',
                        datetime.format('YYYY-MM-DD'));
                    this.$set(this.applications[ind], 'time_submitted',
                        datetime.format('HH:mm:ss'));
                    this.indTotal.push(undefined)
                    this.data.scores.push([])
                    for (let indRev in this.applications[ind].reviewers) {
                        this.data.scores[ind].push({})
                        this.applications[ind].reviewers[indRev].automaticScores =
                            JSON.parse(JSON.stringify(this.applications[ind].automaticScores))
                        for (let indRevScore in this.applications[ind].reviewers[indRev].reviewerScores) {
                            for (let indAuto in this.applications[ind].automaticScores) {
                                if(this.applications[ind].automaticScores[indAuto].criteria_id ===
                                   this.applications[ind].reviewers[indRev].reviewerScores[indRevScore].criteria_id
                                ) {
                                    this.applications[ind].reviewers[indRev].automaticScores[indAuto].score_manual =
                                        this.applications[ind].reviewers[indRev].reviewerScores[indRevScore].score;
                                    this.applications[ind].reviewers[indRev].automaticScores[indAuto].comments =
                                        this.applications[ind].reviewers[indRev].reviewerScores[indRevScore].comments;
                                    break;
                                }
                            }
                        }
                        for (let indAuto in this.applications[ind].reviewers[indRev].automaticScores) {
                            this.applications[ind].reviewers[indRev].automaticScores[indAuto].children = {};
                            if (this.applications[ind].reviewers[indRev].automaticScores[indAuto].score_manual !== null
                                && this.applications[ind].reviewers[indRev].automaticScores[indAuto].score_manual !== undefined
                            ) {
                                this.applications[ind].reviewers[indRev].automaticScores[indAuto].score_final =
                                this.applications[ind].reviewers[indRev].automaticScores[indAuto].score_manual;
                            } else {
                                this.applications[ind].reviewers[indRev].automaticScores[indAuto].score_final =
                                this.applications[ind].reviewers[indRev].automaticScores[indAuto].score;
                            }
                            this.$set(this.data.scores[ind][indRev],
                                this.applications[ind].reviewers[indRev].automaticScores[indAuto].criteria_id,
                                this.applications[ind].reviewers[indRev].automaticScores[indAuto]);
                        }
                        for (const [key,val] of Object.entries(this.data.scores[ind][indRev])) {
                            if (val.parent_criteria_id !== null) {
                                this.$set(this.data.scores[ind][indRev][val.parent_criteria_id].children, key, val);
                            }
                            if (val.criteria_name === 'Total') {
                                this.indTotal[ind] = key;
                            }
                        }
                        for (const val of Object.entries(this.data.scores[ind][indRev])) {
                            val[1].score_final = scoreSum(val[1]).toFixed(2);
                        }
                        this.applications[ind].reviewers[indRev].use_score = 0;
                        if (this.applications[ind].reviewers[indRev].ignore_score === 0) {
                            this.applications[ind].reviewers[indRev].use_score = 1;
                        } else if (this.applications[ind].reviewers[indRev].ignore_score === null
                            && (this.applications[ind].reviewers[indRev].is_surrogate === null
                                || this.applications[ind].reviewers[indRev].is_surrogate === 0)) {
                            this.applications[ind].reviewers[indRev].use_score = 1;
                        }
                    }
                    let score_total = 0;
                    let num_reviewers = 0;
                    for (let indRev in this.applications[ind].reviewers) {
                        if (this.applications[ind].reviewers[indRev].use_score === 1) {
                            score_total = score_total + parseFloat(this.data.scores[ind][indRev][this.indTotal[ind]].score_final)
                            num_reviewers++;
                        }
                    }
                    let score_average = score_total / num_reviewers;
                    this.$set(this.applications[ind], 'score_average', score_average.toFixed(2));
                }
            })
            .catch( (error) => {
                console.log(error);
            })
        },
        computeNewScore (ind) {
            let score_total = 0;
            let num_reviewers = 0;
            for (let indRev in this.applications[ind].reviewers) {
                if (this.applications[ind].reviewers[indRev].use_score) {
                    score_total = score_total + parseFloat(this.data.scores[ind][indRev][this.indTotal[ind]].score_final)
                    num_reviewers++;
                }
            }
            let score_average = score_total / num_reviewers;
            this.$set(this.applications[ind], 'score_average', score_average.toFixed(2));

        },
        generateSpreadsheet(items) {
            let today = time.moment();
            let dateFile = time.momentToDate(today, 'Europe/Lisbon', 'YYYY-MM-DDTHHmmss')
            let username = this.$store.state.session.username;
            let itemsCurated = processForSpreadsheet(items);

            let wb = XLSX.utils.book_new();
            let ws  = XLSX.utils.json_to_sheet(itemsCurated);
            XLSX.utils.book_append_sheet(wb, ws, 'Applicants');
            XLSX.writeFile(wb, username
                    + '_' + this.callName
                    + '_applicants_' + dateFile + '.xlsx');
        },
    },

}
</script>

<style>
.applicant-name {
    font-size: 26px;
}
.date-submission {
    font-size: 12px;
}

.reviewer {
    font-size: 20px;
}

.total-score {
    font-size: 20px;
    margin-left: 20px;
    padding: 10px;
}

.title-level-1 {
    font-size: 20px;
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