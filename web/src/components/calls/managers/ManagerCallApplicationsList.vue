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
        <v-row class="mt-1">
            <v-col cols="10" md="6" align="end">
                <v-row justify="end" align="center">
                    <span class="mr-4">Export grades to spreadsheet</span>
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
                            <v-row align-content="center" justify="start">
                                <v-col cols="3" align-self="end">
                                    <v-row justify="end">
                                        <v-btn
                                            @click="submitRevInfo(application)"
                                            class="white--text"
                                            color="blue"
                                            large
                                        >
                                            Save reviewer info
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
                                                    v-else-if="data.isPorto !== 1"
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
                                                <v-expansion-panels
                                                    v-else-if="data.isPorto === 1"
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
                                                            <div v-if="criteria1.criteria_name === 'Academic Curriculum'">
                                                                <ol>
                                                                    <li v-for="(datum, i) in applications[ind].academicDegrees"
                                                                        :key="key1 + '-' + i"
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
                                                            <div v-if="criteria1.criteria_name === 'Motivation Letter'">
                                                                <v-card>
                                                                    <v-card-text class="pre-formatted">{{applications[ind].motivationLetter.motivation_letter}}</v-card-text>
                                                                </v-card>
                                                            </div>
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
                                                                        <div v-if="criteria2.criteria_name === 'Projects'">
                                                                            <ol>
                                                                                <li v-for="(datum, i) in applications[ind].projects"
                                                                                    :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + i"
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
                                                                        <div v-if="criteria2.criteria_name === 'Papers'">
                                                                            <ol>
                                                                                <li v-for="(datum, i) in applications[ind].papers"
                                                                                    :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + i"
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
                                                                        <div v-if="criteria2.criteria_name === 'Communications'">
                                                                            <ol>
                                                                                <li v-for="(datum, i) in applications[ind].communications"
                                                                                    :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + i"
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
                                                                        <div v-if="criteria2.criteria_name === 'Posters'">
                                                                            <ol>
                                                                                <li v-for="(datum, i) in applications[ind].posters"
                                                                                    :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + i"
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
                                                                        <div v-if="criteria2.criteria_name === 'Patents/Prizes/Professional Experience'">
                                                                            <v-row class="pl-2 mb-2" align="center">
                                                                                <span class="highlight">Patents</span>
                                                                            </v-row>
                                                                            <ol>
                                                                                <li v-for="(datum, i) in applications[ind].patents"
                                                                                    :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + i"
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
                                                                                    :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + i"
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
                                                                                    :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + i"
                                                                                >
                                                                                    <v-row class="pl-2" align="center">
                                                                                        <span class="standard-text">{{datum.date_start | formatDate}}-{{datum.date_end | formatDate}}</span>
                                                                                        <span class="standard-text">  - {{datum.company}}</span>
                                                                                        <span class="standard-text">. Business Areas: {{datum.business_areas}}</span>
                                                                                    </v-row>
                                                                                </li>
                                                                            </ol>
                                                                        </div>
                                                                        <div v-if="criteria2.criteria_name === 'Reference Letters'">
                                                                            <v-row>

                                                                                <v-col cols="12" md="6" v-for="(datum, i) in applications[ind].recommenders"
                                                                                    :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + i"
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
                                                                                                :key="ind + '-' + indRev + '-' + key1 + '-' + key2 + '-' + i + '-' + j"
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
                            <v-row class="mt-1">
                                <v-col cols="10" md="6" align="end">
                                    <v-row justify="end" align="center">
                                        <span class="mr-4">Export candidate documentation</span>
                                        <v-btn fab color="blue" @click="exportDocumentation(application)">
                                            <v-icon color="white" x-large>mdi-file-document-multiple</v-icon>
                                        </v-btn>
                                    </v-row>
                                </v-col>
                            </v-row>
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
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'
import XLSX from 'xlsx'
import { PDFDocument, PageSizes,
    StandardFonts,
    rgb
//, PDFName, PDFBool, PDFString, PDFNumber
} from 'pdf-lib'
import download from 'downloadjs'

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
        /*
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
        */
        if (items[ind].reviewers.length > 0) {
            for (let indRev in items[ind].reviewers) {
                thisItem[
                    items[ind].reviewers[indRev].name
                    + '_reviewed'
                ] = items[ind].reviewers[indRev].reviewed ? items[ind].reviewers[indRev].reviewed : 0;
            }
            for (let indRev in items[ind].reviewers) {
                thisItem[
                    items[ind].reviewers[indRev].name
                    + '_use_score'
                ] = items[ind].reviewers[indRev].use_score ? items[ind].reviewers[indRev].use_score : 0;
            }
            for (let indAuto in items[ind].reviewers[0].automaticScores) {
                for (let indRev in items[ind].reviewers) {
                    thisItem[
                        items[ind].reviewers[indRev].name
                        + '_' + items[ind].reviewers[indRev].automaticScores[indAuto].criteria_name
                    ] = items[ind].reviewers[indRev].automaticScores[indAuto].score_final;
                }
            }
        }

        itemsCurated.push(thisItem);
    }
    return itemsCurated;
}
function makeList(pdfDoc, page, options, text, currentLine, newYStartPosition, type) {
    let { maxLineLength, lineSpacing, yRectMargin,
        yStartPositionTitle, listIndentFirst, listIndentOther,
        textFont, textFontBold, textFontOblique, fontSizeNormal, colorNormal
    } = options;
    let words = text.split(' ');
    let textLine = '';
    let listLine = 1;
    for (let indWord in words) {
        let wordLength = words[indWord].length;
        let currentTextLength = textLine.length;
        // + 1 because we add a space
        if (currentTextLength + wordLength + 1 <= maxLineLength) {
            textLine = textLine + words[indWord] + ' ';
        } else {
        if ( newYStartPosition - currentLine * lineSpacing < yRectMargin * 3) {
                page = pdfDoc.addPage(PageSizes.A4);
                newYStartPosition = yStartPositionTitle;
                currentLine = 1;
            }
            if (type === 'bold') {
                page.drawText(textLine, {
                    x: listLine === 1 ? listIndentFirst : listIndentOther,
                    y: newYStartPosition - currentLine * lineSpacing,
                    size: fontSizeNormal,
                    font: textFontBold,
                    color: colorNormal,
                })
            } else if (type === 'oblique') {
                page.drawText(textLine, {
                    x: listLine === 1 ? listIndentFirst : listIndentOther,
                    y: newYStartPosition - currentLine * lineSpacing,
                    size: fontSizeNormal,
                    font: textFontOblique,
                    color: colorNormal,
                })
            } else {
                page.drawText(textLine, {
                    x: listLine === 1 ? listIndentFirst : listIndentOther,
                    y: newYStartPosition - currentLine * lineSpacing,
                    size: fontSizeNormal,
                    font: textFont,
                    color: colorNormal,
                })
            }
            textLine = words[indWord] + ' ';
            listLine++;
            currentLine++;
        }
    }
    if ( newYStartPosition - currentLine * lineSpacing < yRectMargin * 3) {
        page = pdfDoc.addPage(PageSizes.A4);
        newYStartPosition = yStartPositionTitle;
        currentLine = 1;
    }
    if (type === 'bold') {
        page.drawText(textLine, {
            x: listLine === 1 ? listIndentFirst : listIndentOther,
            y: newYStartPosition - currentLine * lineSpacing,
            size: fontSizeNormal,
            font: textFontBold,
            color: colorNormal,
        })
    } else if (type === 'oblique') {
        page.drawText(textLine, {
            x: listLine === 1 ? listIndentFirst : listIndentOther,
            y: newYStartPosition - currentLine * lineSpacing,
            size: fontSizeNormal,
            font: textFontOblique,
            color: colorNormal,
        })
    } else {
        page.drawText(textLine, {
            x: listLine === 1 ? listIndentFirst : listIndentOther,
            y: newYStartPosition - currentLine * lineSpacing,
            size: fontSizeNormal,
            font: textFont,
            color: colorNormal,
        })
    }
    currentLine++;
    return { pdfDoc, page, currentLine, newYStartPosition };
}

export default {
    components: {
        ManagerCallApplicationsListLAQV,
    },
    data () {
        return {
            error: false,
            success: false,
            progress: false,
            formError: false,
            callName: '',
            applications: [],
            data: {
                scores: [],
                isLAQV: false,
                isPorto: false,
            },
            indTotal: [],
            countries: [],
            cardTypes: [],

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
        this.getCountries();
        this.getCardTypes();
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
                if (result.data.result.call.call_url_segment.includes('-porto-')) {
                    this.data.isPorto = 1;
                }
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
        submitRevInfo (application) {
            this.progress = true;
            let urlUpdate = [];
            urlUpdate.push({
                url: 'api/calls'
                    + '/call-managers/' + this.$store.state.session.personID
                    + '/applications/' + application.id,
                body: {
                    application
                },
            });
            this.$http.all(
                urlUpdate.map(el =>
                    this.$http.put(el.url,
                        { data: el.body, },
                        {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        }
                    )
                )
            )
            .then(this.$http.spread( () => {
                this.progress = false;
                this.success = true;
                this.submitted = true;
                this.getManagerCallApplications();
                setTimeout(() => {this.success = false;}, 3000)
            }))
            .catch((error) => {
                this.progress = false;
                this.error = true;
                setTimeout(() => {this.error = false;}, 10000)
                // eslint-disable-next-line
                console.log(error)
                this.getManagerCallApplications();
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
        getCardTypes () {
            let this_vm = this;
            const urlSubmit = 'api/v2/' + 'card-types';
            subUtil.getPublicInfo(this_vm, urlSubmit, 'cardTypes')
            .then(() => {
                this.cardTypes = this.cardTypes.filter(
                    (el) => {
                        return el.name_en !== "Fiscal Number"
                            && el.name_en !== "Social Security Number"
                    }
                );
            });
        },
        getCountries() {
            var this_vm = this;
            const urlSubmit = 'api/v2/' + 'countries';
            subUtil.getPublicInfo(this_vm, urlSubmit, 'countries');
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
        async exportDocumentation (application) {
            let pdfDoc = await PDFDocument.create();
            const textFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const textFontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const textFontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
            //const textFontBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
            let page = pdfDoc.addPage(PageSizes.A4);
            const { width, height } = page.getSize();
            const fontSizeHeader = 9;
            const fontSizeTitle = 20;
            const fontSizeNormal = 11;
            const maxLineLength = 90;
            let listIndentFirst = 60;
            let listIndentOther = 80;
            let currentLine = 1;
            let lineSpacing = 1.4 * fontSizeNormal
            let yStartPositionHeader = height - 3 * fontSizeHeader
            let yStartPositionTitle = yStartPositionHeader - 2 * fontSizeTitle
            let yStartPosition = yStartPositionTitle - 4 * lineSpacing;
            const xRectMargin = 30;
            const yRectMargin = 10;
            const colorHeader = rgb(0.1, 0.1, 0.1)
            const colorTitle = rgb(0, 0, 0.5)
            const colorNormal = rgb(0, 0, 0)
            const xImageSize = 120;
            const year = '2021'
            let options = {
                textFont, textFontBold, textFontOblique,
                fontSizeHeader, fontSizeTitle, fontSizeNormal, colorHeader, colorTitle, colorNormal,
                width, height, maxLineLength, listIndentFirst, listIndentOther,
                lineSpacing, yStartPositionHeader, yStartPositionTitle, yStartPosition,
                xRectMargin, yRectMargin,
                xImageSize
            }
            page.drawText(this.callName + ' - ' + year, {
                x: 50,
                y: yStartPositionHeader - fontSizeHeader,
                size: fontSizeHeader,
                font: textFont,
                color: colorHeader,
            })
            for (let ind in application.documents) {
                if (application.documents[ind].document_type_id === 6) {
                    let url = application.documents[ind].url;
                    let photo = await this.$http.get(url,
                        {
                            responseType: 'arraybuffer'
                        })
                    .then(result => result.data )
                    let urlSplit = url.split('.');
                    let extension = urlSplit[urlSplit.length - 1];
                    let image;
                    //let imageSize;
                    if (extension === 'jpg' || extension === 'jpeg') {
                        image = await pdfDoc.embedJpg(photo);
                    } else if (extension === 'png') {
                        image = await pdfDoc.embedPng(photo);
                    }
                    if (image !== undefined) {
                        let scaleImage = image.scale(1);
                        let factor = xImageSize / scaleImage.width
                        let imageSize = image.scale(factor);
                        page.drawImage(
                            image,
                            {
                                x: width - imageSize.width - xRectMargin,
                                y: yStartPositionHeader - imageSize.height,
                                width: imageSize.width,
                                height: imageSize.height,
                            }
                        )
                    }
                }
            }
            page.drawText('Documentation for candidate: ', {
                x: 50,
                y: yStartPositionTitle - fontSizeTitle,
                size: fontSizeTitle,
                font: textFont,
                color: colorTitle,
            })
            page.drawText(application.applicant_name, {
                x: 50,
                y: yStartPositionTitle - 2 * fontSizeTitle,
                size: fontSizeTitle,
                font: textFont,
                color: colorTitle,
            })
            page.drawLine( {
                start: {x: xRectMargin, y: yStartPosition - currentLine * lineSpacing - yRectMargin},
                end: {x: width - xRectMargin, y: yStartPosition - currentLine * lineSpacing - yRectMargin},
            })

            page.drawText('Candidate Personal Data:', {
                x: 50,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontBold,
                color: colorNormal,
            })
            currentLine++; currentLine++;
            page.drawText('Name:', {
                x: 50,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontBold,
                color: colorNormal,
            })
            page.drawText(application.applicant_name, {
                x: 100,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFont,
                color: colorNormal,
            })
            currentLine++;
            page.drawText('Email:', {
                x: 50,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontBold,
                color: colorNormal,
            })
            page.drawText(application.applicant.email, {
                x: 100,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFont,
                color: colorNormal,
            })
            page.drawText('Phone:', {
                x: 290,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontBold,
                color: colorNormal,
            })
            page.drawText(application.applicant.phone, {
                x: 340,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFont,
                color: colorNormal,
            })
            currentLine++;
            page.drawText('Gender:', {
                x: 50,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontBold,
                color: colorNormal,
            })
            page.drawText(application.applicant.gender, {
                x: 100,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFont,
                color: colorNormal,
            })
            page.drawText('Birth date:', {
                x: 150,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontBold,
                color: colorNormal,
            })
            let birth_date = ''
            if (application.applicant.birth_date !== null
                && application.applicant.birth_date !== null
                && application.applicant.birth_date !== '') {
                birth_date = time.moment(application.applicant.birth_date)
                                .format('YYYY-MM-DD');
            }
            page.drawText(birth_date, {
                x: 210,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFont,
                color: colorNormal,
            })
            page.drawText('Nationality:', {
                x: 290,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontBold,
                color: colorNormal,
            })
            let nation = ''
            for (let ind in this.countries) {
                if (this.countries[ind].id === application.applicant.id_country) {
                    nation = this.countries[ind].name;
                    break;
                }
            }
            page.drawText(nation, {
                x: 355,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFont,
                color: colorNormal,
            })
            currentLine++;
            page.drawText('ID card type:', {
                x: 50,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontBold,
                color: colorNormal,
            })
            let cardType = ''
            for (let ind in this.cardTypes) {
                if (this.cardTypes[ind].id === application.applicant.document_type_id) {
                    cardType = this.cardTypes[ind].name_en;
                    break;
                }
            }
            page.drawText(cardType, {
                x: 120,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFont,
                color: colorNormal,
            })
            page.drawText('ID card number:', {
                x: 220,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontBold,
                color: colorNormal,
            })
            page.drawText(application.applicant.document_number, {
                x: 308,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFont,
                color: colorNormal,
            })
            page.drawText('Valid until:', {
                x: 400,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontBold,
                color: colorNormal,
            })
            let validity = ''
            if (application.applicant.document_valid_until !== null
                && application.applicant.document_valid_until !== null
                && application.applicant.document_valid_until !== '') {
                validity = time.moment(application.applicant.document_valid_until)
                                .format('YYYY-MM-DD');
            }
            page.drawText(validity, {
                x: 460,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFont,
                color: colorNormal,
            })
            currentLine++;
            page.drawText('Address:', {
                x: 50,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontBold,
                color: colorNormal,
            })
            let addressLines = application.applicant.address.split('\n')
            for (let ind in addressLines) {
                page.drawText(addressLines[ind], {
                    x: 100,
                    y: yStartPosition - currentLine * lineSpacing,
                    size: fontSizeNormal,
                    font: textFont,
                    color: colorNormal,
                })
                currentLine++;
            }
            page.drawText(application.applicant.postal_code + ' ' + application.applicant.city, {
                x: 100,
                y: yStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFont,
                color: colorNormal,
            })
            let newYStartPosition = yStartPosition - currentLine * lineSpacing - yRectMargin
            newYStartPosition = newYStartPosition - 2 * yRectMargin - lineSpacing;
            page.drawText('Academic Curriculum:', {
                x: 50,
                y: newYStartPosition,
                size: fontSizeNormal,
                font: textFontBold,
                color: colorNormal,
            })
            page.drawLine( {
                start: {x: xRectMargin, y: newYStartPosition - yRectMargin},
                end: {x: width - xRectMargin, y: newYStartPosition - yRectMargin},
            })
            currentLine = 2; // refers to the start of the block
            for (let ind in application.academicDegrees) {
                let text = (parseInt(ind,10) + 1)
                    + '. ' + application.academicDegrees[ind].degree_name
                    + ' - ' + application.academicDegrees[ind].course_name
                    + ' (' + application.academicDegrees[ind].institution + ')'
                    + '. Grade:' + application.academicDegrees[ind].grade;
                let words = text.split(' ');
                let textLine = '';
                let listLine = 1;
                for (let indWord in words) {
                    let wordLength = words[indWord].length;
                    let currentTextLength = textLine.length;
                    // + 1 because we add a space
                    if (currentTextLength + wordLength + 1 <= maxLineLength) {
                        textLine = textLine + words[indWord] + ' ';
                    } else {
                        page.drawText(textLine, {
                            x: listLine === 1 ? listIndentFirst : listIndentOther,
                            y: newYStartPosition - currentLine * lineSpacing,
                            size: fontSizeNormal,
                            font: textFont,
                            color: colorNormal,
                        })
                        textLine = words[indWord] + ' ';
                        listLine++;
                        currentLine++;
                    }
                }
                page.drawText(textLine, {
                    x: listLine === 1 ? listIndentFirst : listIndentOther,
                    y: newYStartPosition - currentLine * lineSpacing,
                    size: fontSizeNormal,
                    font: textFont,
                    color: colorNormal,
                })
                currentLine++;
            }
            currentLine++;
            if (application.applicant.erasmus_experience === 1) {
                page.drawText('Candidate participated in Erasmus Programme', {
                    x: listIndentFirst,
                    y: newYStartPosition - currentLine * lineSpacing,
                    size: fontSizeNormal,
                    font: textFontOblique,
                    color: colorNormal,
                })
                currentLine++;
            }
            currentLine++;
            page.drawText('MSc Thesis Abstract:', {
                x: listIndentFirst,
                y: newYStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontOblique,
                color: colorNormal,
            })
            currentLine++;
            let abstractLines = application.applicant.msc_abstract.split('\n')
            for (let ind in abstractLines) {
                let text = abstractLines[ind];
                // object destructuring requires the parenthesis
                ({ pdfDoc, page, currentLine, newYStartPosition }
                    = makeList(pdfDoc, page, options, text, currentLine, newYStartPosition))
            }

            currentLine++;
            newYStartPosition = newYStartPosition - (currentLine - 1) * lineSpacing - yRectMargin
            newYStartPosition = newYStartPosition - 2 * yRectMargin - lineSpacing;
            page.drawText('Scientific Curriculum:', {
                x: 50,
                y: newYStartPosition,
                size: fontSizeNormal,
                font: textFontBold,
                color: colorNormal,
            })
            page.drawLine( {
                start: {x: xRectMargin, y: newYStartPosition - yRectMargin},
                end: {x: width - xRectMargin, y: newYStartPosition - yRectMargin},
            })
            currentLine = 2; // refers to the start of the block
            page.drawText('Publications', {
                x: 50,
                y: newYStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontOblique,
                color: colorNormal,
            })
            currentLine++;
            for (let ind in application.papers) {
                let text = (parseInt(ind,10) + 1)
                    + '. ' + application.papers[ind].authors_raw
                    + ' (' + application.papers[ind].year + ').'
                    + ' "' + application.papers[ind].title + '"'
                    + '. ' + application.papers[ind].journal_name
                    + ', ' + application.papers[ind].volume
                    + ', ' + application.papers[ind].pages;
                let words = text.split(' ');
                let textLine = '';
                let listLine = 1;
                for (let indWord in words) {
                    let wordLength = words[indWord].length;
                    let currentTextLength = textLine.length;
                    // + 1 because we add a space, - 5 (an adjustment for publications)
                    if (currentTextLength + wordLength + 1 <= maxLineLength - 5) {
                        textLine = textLine + words[indWord] + ' ';
                    } else {
                        if ( newYStartPosition - currentLine * lineSpacing < yRectMargin * 3) {
                            page = pdfDoc.addPage(PageSizes.A4);
                            newYStartPosition = yStartPositionTitle;
                            currentLine = 1;
                        }
                        page.drawText(textLine, {
                            x: listLine === 1 ? listIndentFirst : listIndentOther,
                            y: newYStartPosition - currentLine * lineSpacing,
                            size: fontSizeNormal,
                            font: textFont,
                            color: colorNormal,
                        })
                        textLine = words[indWord] + ' ';
                        listLine++;
                        currentLine++;
                    }
                }
                if ( newYStartPosition - currentLine * lineSpacing < yRectMargin * 3) {
                    page = pdfDoc.addPage(PageSizes.A4);
                    newYStartPosition = yStartPositionTitle;
                    currentLine = 1;
                }
                page.drawText(textLine, {
                    x: listLine === 1 ? listIndentFirst : listIndentOther,
                    y: newYStartPosition - currentLine * lineSpacing,
                    size: fontSizeNormal,
                    font: textFont,
                    color: colorNormal,
                })
                currentLine++;
                if ( newYStartPosition - currentLine * lineSpacing < yRectMargin * 3) {
                    page = pdfDoc.addPage(PageSizes.A4);
                    newYStartPosition = yStartPositionTitle;
                    currentLine = 1;
                }
                page.drawText('DOI: ' + application.papers[ind].doi, {
                    x: listIndentOther,
                    y: newYStartPosition - currentLine * lineSpacing,
                    size: fontSizeNormal,
                    font: textFont,
                    color: colorNormal,
                })
                currentLine++;
            }
            currentLine++;
            if ( newYStartPosition - currentLine * lineSpacing < yRectMargin * 3) {
                page = pdfDoc.addPage(PageSizes.A4);
                newYStartPosition = yStartPositionTitle;
                currentLine = 1;
            }
            page.drawText('Participation in Projects', {
                x: 50,
                y: newYStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontOblique,
                color: colorNormal,
            })
            currentLine++;
            for (let ind in application.projects) {
                let text = (parseInt(ind,10) + 1)
                    + '. ' + application.projects[ind].title
                    + ' (' + application.projects[ind].acronym
                    + ', ' + application.projects[ind].reference + ').'
                    + ' PI: ' + application.projects[ind].principal_investigator
                    + '. Start: ' + application.projects[ind].year_start
                    + ', End: ' + application.projects[ind].year_end;
                // object destructuring requires the parenthesis
                ({ pdfDoc, page, currentLine, newYStartPosition }
                    = makeList(pdfDoc, page, options, text, currentLine, newYStartPosition))
            }
            currentLine++;
            if ( newYStartPosition - currentLine * lineSpacing < yRectMargin * 3) {
                page = pdfDoc.addPage(PageSizes.A4);
                newYStartPosition = yStartPositionTitle;
                currentLine = 1;
            }
            page.drawText('Mobility in the scope of Projects', {
                x: 50,
                y: newYStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontOblique,
                color: colorNormal,
            })
            currentLine++;
            for (let ind in application.mobility) {
                let start_date = ''
                if (application.mobility[ind].start_date !== null
                    && application.mobility[ind].start_date !== null
                    && application.mobility[ind].start_date !== '') {
                    start_date = time.moment(application.mobility[ind].start_date)
                                    .format('YYYY-MM-DD');
                }
                let text = (parseInt(ind,10) + 1)
                    + '. ' + application.mobility[ind].title
                    + ' (' + application.mobility[ind].reference + ').'
                    + ' Institution: ' + application.mobility[ind].institution
                    + '. Start: ' + start_date
                    + ', Duration: ' + application.mobility[ind].duration;
                // object destructuring requires the parenthesis
                ({ pdfDoc, page, currentLine, newYStartPosition }
                    = makeList(pdfDoc, page, options, text, currentLine, newYStartPosition))
            }
            currentLine++;
            if ( newYStartPosition - currentLine * lineSpacing < yRectMargin * 3) {
                page = pdfDoc.addPage(PageSizes.A4);
                newYStartPosition = yStartPositionTitle;
                currentLine = 1;
            }
            page.drawText('Oral Communications', {
                x: 50,
                y: newYStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontOblique,
                color: colorNormal,
            })
            currentLine++;
            for (let ind in application.communications) {
                let date = ''
                if (application.communications[ind].date !== null
                    && application.communications[ind].date !== null
                    && application.communications[ind].date !== '') {
                    date = time.moment(application.communications[ind].date)
                                    .format('YYYY-MM-DD');
                }
                let text = (parseInt(ind,10) + 1)
                    + '. ' + application.communications[ind].authors_raw
                    + ' "' + application.communications[ind].title + '"'
                    + '. ' + application.communications[ind].meeting_name
                    + ' (' + date + ')';
                // object destructuring requires the parenthesis
                ({ pdfDoc, page, currentLine, newYStartPosition } =
                    makeList(pdfDoc, page, options, text, currentLine, newYStartPosition))
            }
            currentLine++;
            if ( newYStartPosition - currentLine * lineSpacing < yRectMargin * 3) {
                page = pdfDoc.addPage(PageSizes.A4);
                newYStartPosition = yStartPositionTitle;
                currentLine = 1;
            }
            page.drawText('Poster Communications', {
                x: 50,
                y: newYStartPosition - currentLine * lineSpacing,
                size: fontSizeNormal,
                font: textFontOblique,
                color: colorNormal,
            })
            currentLine++;
            for (let ind in application.posters) {
                let date = ''
                if (application.posters[ind].date !== null
                    && application.posters[ind].date !== null
                    && application.posters[ind].date !== '') {
                    date = time.moment(application.posters[ind].date)
                                    .format('YYYY-MM-DD');
                }
                let text = (parseInt(ind,10) + 1)
                    + '. ' + application.posters[ind].authors_raw
                    + ' "' + application.posters[ind].title + '"'
                    + '. ' + application.posters[ind].meeting_name
                    + ' (' + date + ')';
                // object destructuring requires the parenthesis
                ({ pdfDoc, page, currentLine, newYStartPosition } =
                    makeList(pdfDoc, page, options, text, currentLine, newYStartPosition))
            }
            page = pdfDoc.addPage(PageSizes.A4);
            newYStartPosition = yStartPositionTitle;
            currentLine = 1;
            page.drawText('Motivation Letter:', {
                x: 50,
                y: newYStartPosition,
                size: fontSizeNormal,
                font: textFontBold,
                color: colorNormal,
            })
            page.drawLine( {
                start: {x: xRectMargin, y: newYStartPosition - yRectMargin},
                end: {x: width - xRectMargin, y: newYStartPosition - yRectMargin},
            })
            currentLine++;
            let motivationLines = application.motivationLetter.motivation_letter.split('\n')
            for (let ind in motivationLines) {
                let text = motivationLines[ind];
                // object destructuring requires the parenthesis
                ({ pdfDoc, page, currentLine, newYStartPosition }
                    = makeList(pdfDoc, page, options, text, currentLine, newYStartPosition))
            }
            page = pdfDoc.addPage(PageSizes.A4);
            newYStartPosition = yStartPositionTitle;
            currentLine = 1;
            page.drawText('Recommendation Letters:', {
                x: 50,
                y: newYStartPosition,
                size: fontSizeNormal,
                font: textFontBold,
                color: colorNormal,
            })
            page.drawLine( {
                start: {x: xRectMargin, y: newYStartPosition - yRectMargin},
                end: {x: width - xRectMargin, y: newYStartPosition - yRectMargin},
            })
            currentLine++;
            for (let indRec in application.recommenders) {
                let textRef = application.recommenders[indRec].name
                    + ', ' + application.recommenders[indRec].role
                    + ' (' + application.recommenders[indRec].institution + ')'
                    + '. Email: ' + application.recommenders[indRec].email;
                ({ pdfDoc, page, currentLine, newYStartPosition }
                    = makeList(pdfDoc, page, options, textRef, currentLine, newYStartPosition, 'bold')) ;
                currentLine++;
                for (let indAnswer in application.recommenders[indRec].answers) {
                    let textAns = application.recommenders[indRec].answers[indAnswer].question;

                    if (application.recommenders[indRec].answers[indAnswer].answer_type === 'text') {
                        textAns = textAns + ' - ' + application.recommenders[indRec].answers[indAnswer].answer;
                    } else {
                        textAns = textAns + ' - ' + application.recommenders[indRec].answers[indAnswer].score;
                    }
                    ({ pdfDoc, page, currentLine, newYStartPosition }
                        = makeList(pdfDoc, page, options, textAns, currentLine, newYStartPosition)) ;
                }
                currentLine++;
                let referenceLines = application.recommenders[indRec].referenceLetter.text;
                if (referenceLines !== null && referenceLines !== undefined) {
                    referenceLines = referenceLines.split('\n')
                    for (let ind in referenceLines) {
                        let text = referenceLines[ind];
                        // object destructuring requires the parenthesis
                        ({ pdfDoc, page, currentLine, newYStartPosition }
                            = makeList(pdfDoc, page, options, text, currentLine, newYStartPosition))
                    }
                }
                currentLine++;
            }
            // first university diplomas
            for (let ind in application.documents) {
                if (application.documents[ind].document_type_id === 2) {
                    let url = application.documents[ind].url;
                    // only pdf accepted
                    let diploma = await this.$http.get(url,
                        {
                            responseType: 'arraybuffer'
                        })
                    .then(result => result.data )
                    let diplomaPDF = await PDFDocument.load(diploma);
                    let copyDiplomaPDF = await pdfDoc.copyPages(diplomaPDF, diplomaPDF.getPageIndices());
                    copyDiplomaPDF.forEach((page) => pdfDoc.addPage(page));

                }
            }
            // then CV
            for (let ind in application.documents) {
                if (application.documents[ind].document_type_id === 1) {
                    let url = application.documents[ind].url;
                    // only pdf accepted
                    let cv = await this.$http.get(url,
                        {
                            responseType: 'arraybuffer'
                        })
                    .then(result => result.data )
                    let cvPDF = await PDFDocument.load(cv);
                    let copyCvPDF = await pdfDoc.copyPages(cvPDF, cvPDF.getPageIndices());
                    copyCvPDF.forEach((page) => pdfDoc.addPage(page));
                }
            }
            // then ID and residence certificate
            for (let ind in application.documents) {
                if (application.documents[ind].document_type_id === 4) {
                    let url = application.documents[ind].url;
                    let photo = await this.$http.get(url,
                        {
                            responseType: 'arraybuffer'
                        })
                    .then(result => result.data )
                    let urlSplit = url.split('.');
                    let extension = urlSplit[urlSplit.length - 1];
                    let image;
                    //let imageSize;
                    if (extension === 'jpg' || extension === 'jpeg') {
                        image = await pdfDoc.embedJpg(photo);
                    } else if (extension === 'png') {
                        image = await pdfDoc.embedPng(photo);
                    } else if (extension === 'pdf') {
                        let idPDF = await PDFDocument.load(photo);
                        let copyIdPDF = await pdfDoc.copyPages(idPDF, idPDF.getPageIndices());
                        copyIdPDF.forEach((page) => pdfDoc.addPage(page));
                    }
                    if (image !== undefined) {
                        page = pdfDoc.addPage(PageSizes.A4);
                        let scaleImage = image.scale(1);
                        let factor = (width - 2 * xRectMargin) / scaleImage.width
                        let imageSize = image.scale(factor);
                        page.drawImage(
                            image,
                            {
                                x: page.getWidth() / 2 - imageSize.width / 2,
                                y: page.getHeight() / 2 - imageSize.height / 2,
                                width: imageSize.width,
                                height: imageSize.height,
                            }
                        )
                    }
                }
            }
            for (let ind in application.documents) {
                if (application.documents[ind].document_type_id === 5) {
                    let url = application.documents[ind].url;
                    let photo = await this.$http.get(url,
                        {
                            responseType: 'arraybuffer'
                        })
                    .then(result => result.data )
                    let urlSplit = url.split('.');
                    let extension = urlSplit[urlSplit.length - 1];
                    let image;
                    //let imageSize;
                    if (extension === 'jpg' || extension === 'jpeg') {
                        image = await pdfDoc.embedJpg(photo);
                    } else if (extension === 'png') {
                        image = await pdfDoc.embedPng(photo);
                    } else if (extension === 'pdf') {
                        let certificatePDF = await PDFDocument.load(photo);
                        let copyCertificatePDF = await pdfDoc.copyPages(certificatePDF, certificatePDF.getPageIndices());
                        copyCertificatePDF.forEach((page) => pdfDoc.addPage(page));
                    }
                    if (image !== undefined) {
                        page = pdfDoc.addPage(PageSizes.A4);
                        let scaleImage = image.scale(1);
                        let factor = (width - 2 * xRectMargin) / scaleImage.width
                        let imageSize = image.scale(factor);
                        page.drawImage(
                            image,
                            {
                                x: page.getWidth() / 2 - imageSize.width / 2,
                                y: page.getHeight() / 2 - imageSize.height / 2,
                                width: imageSize.width,
                                height: imageSize.height,
                            }
                        )
                    }
                }
            }
            let now = time.moment().format('YYYY-MM-DD_HH-mm-ss');
            const savedPDF = await pdfDoc.save();
            download(savedPDF,
                'Documentation_'
                + application.applicant_name
                + '_' + now + '.pdf',
                'application/pdf');
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