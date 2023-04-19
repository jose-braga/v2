<template>
    <div>
        <div v-if="!data.isManager">
            You have no permissions to manage polls.
        </div>
        <v-card v-else>
            <v-card-title primary-title>
                <div>
                    <h2 class="headline">Results for the poll: <i>"{{ poll.title }}"</i>
                    </h2>
                </div>
            </v-card-title>
            <v-card-text></v-card-text>
            <v-container class="px-6">
                <v-row class="mb-4">
                    <v-col cols="12">
                        <h3>General poll data:</h3>
                    </v-col>
                    <ul>
                        <li>
                            Total possible voters: {{ poll.voterCount.totalPossibleVoters }}
                        </li>
                        <li>
                            Number of effective voters: {{ poll.voterCount.numberVoted }}
                        </li>
                        <li>
                            Poll turnout: {{ poll.voterCount.abstention }}
                            ({{poll.voterCount.pollTurnout}}%)
                        </li>
                    </ul>
                </v-row>
                <v-row v-for="(question, i) in poll.questions"
                    :key="i"
                >
                    <v-col cols="12">
                            <h3>Question {{ i + 1 }}: <i>"{{ question.question }}"</i>
                            </h3>
                    </v-col>
                    <!-- v-if="question.question_type_name_en === 'Multiple choice'"-->
                    <v-col cols="12" lg="6">
                        <v-row v-if="question.question_type_name_en === 'Multiple choice'">
                            <v-col>
                                <vue-frappe
                                    :id="'question-' + (i + 1)"
                                    :ref="'question-' + (i + 1)"
                                    :labels="question.labels"
                                    :type="graphType"
                                    :height="300"
                                    :dataSets="question.data"
                                    :colors="colors"
                                >
                                </vue-frappe>
                            </v-col>
                        </v-row>
                        <v-row v-else>
                            <v-col>
                                <ol>
                                    <li v-for="(answer, j) in question.answers"
                                        :key="i + '-' + j"
                                    >
                                        {{ answer }}
                                    </li>
                                </ol>
                            </v-col>
                        </v-row>
                        <v-row v-if="question.question_type_name_en === 'Multiple choice'">
                            <v-col cols="12" lg="6">
                                <v-select
                                    v-model="graphType"
                                    :items="graphTypes"
                                    @input="updateChart('question-' + (i + 1))"
                                    label="Graph type"
                                >
                                </v-select>
                            </v-col>
                            <v-col cols="12" lg="6">
                                <v-btn type="button"
                                    @click="exportChart('question-' + (i + 1))"
                                    outlined color="blue"
                                >
                                    Export
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="12" lg="6">
                        <p>Details for this question:</p>
                        <ul>
                            <li>
                                Non blank votes: {{ question.totalNonBlank }}
                            </li>
                            <li>
                                Blank votes: {{ question.totalBlank }}
                                ({{question.blankPercentage}}%)
                            </li>
                        </ul>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </div>
    </template>

    <script>
    import { VueFrappe } from 'vue2-frappe'


    export default {
        components: {
            VueFrappe,
        },
        data() {
            return {
                progress: false,
                success: false,
                error: false,
                data: {
                    isManager: false,
                },
                graphType: 'donut',
                graphTypes: ['donut', 'pie', 'bar', ],
                colors: ['#2D87BB', '#64C2A6', '#E6F69D', '#FEAE65', '#F66D44'],
                poll: {voterCount: {}},
                baseURL: '/polls/',
            }
        },
        mounted: function () {
            this.$store.commit('setActiveTile', {
                newTile: 10,
                newToolbarText: 'Poll results'
            });
        },
        created () {
            this.initialize();
        },
        methods: {
            initialize() {
                if (this.$store.state.session.loggedIn) {
                    this.getPollResults();
                }
            },
            getPollResults () {
                let personID = this.$store.state.session.personID;
                let pollID = this.$route.params.pollId;
                let urlSubmit = 'api/polls/' + 'managers/'+ personID;
                this.$http.get(urlSubmit,
                    {
                        headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                    }
                )
                .then( () => {
                    this.data.isManager = true;
                    let urlResults = 'api/polls/' + pollID
                        + '/managers/'+ personID + '/results';
                    return this.$http.get(urlResults,
                        {
                            headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                        }
                    )
                })
                .then( (result) => {
                    this.poll = result.data.result;
                    let abstention = this.poll.voterCount.totalPossibleVoters - this.poll.voterCount.numberVoted
                    this.$set(this.poll.voterCount,'abstention', abstention);
                    this.$set(this.poll.voterCount,'pollTurnout',
                        (100.0 - abstention * 100.0 / this.poll.voterCount.totalPossibleVoters)
                        .toFixed(2)
                        );
                    for (let indQuestion in this.poll.questions) {
                        let question = this.poll.questions[indQuestion]
                        if (question.question_type_name_en === 'Multiple choice') {
                            let labels = [];
                            let values = [];
                            for (let indOption in question.options) {
                                labels.push(question.options[indOption].option_text);
                                values.push(question.options[indOption].votes);
                            }
                            this.$set(this.poll.questions[indQuestion],'labels', labels);
                            this.$set(this.poll.questions[indQuestion],'data', [{values}]);
                        }
                        this.$set(this.poll.questions[indQuestion],'blankPercentage',
                            (question.totalBlank * 100.0 / (question.totalNonBlank + question.totalBlank))
                            .toFixed(2)
                        );
                    }
                })
                .catch((error) => {
                    //console.log(error);
                    if (error.response) {
                        console.log(error.response.status, '- You are not allowed to see the poll results.')
                    }
                })
            },
            updateChart (id) {
                this.$nextTick(() => this.$refs[id][0].startChart());
            },
            exportChart (id) {
                this.$refs[id][0].export();
            },
        },

    }
    </script>

    <style>

    </style>