<template>
<div>
    <div v-if="!data.isManager">
        You have no permissions to manage polls.
    </div>
    <v-card v-else>
        <v-card-text>A form should not be changed after the start of the polling period,
            (e.g. you can't delete questions that were already answered)
        </v-card-text>
        <v-form ref="form"
            @submit.prevent="submitForm"
        >
            <v-container class="px-6">
                <v-row class="save-container" justify="end">
                    <v-col cols="3" class="background-white">
                        <v-row align-content="center" justify="start">
                            <v-col cols="8" align-self="end">
                                <v-row justify="end">
                                    <v-btn type="submit" class="white--text"
                                    color="blue">Save Changes</v-btn>
                                </v-row>
                            </v-col>
                            <v-col cols="4">
                                <v-progress-circular indeterminate
                                        v-show="progress"
                                        :size="20" :width="2"
                                        color="primary"></v-progress-circular>
                                <v-icon v-show="success" color="green">mdi-check</v-icon>
                                <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="8">
                        <v-btn
                            class="ma-4 white--text"
                            color="red"
                            @click="deletePoll()"
                        >
                            Delete Poll
                        </v-btn>
                    </v-col>
                    <v-col cols="4">
                        <v-progress-circular indeterminate
                                v-show="progressPollDelete"
                                :size="20" :width="2"
                                color="primary"></v-progress-circular>
                        <v-icon v-show="successPollDelete" color="green">mdi-check</v-icon>
                        <v-icon v-show="errorPollDelete" color="red">mdi-alert-circle-outline</v-icon>
                    </v-col>
                </v-row>
                <v-row>
                    <h2>Poll settings</h2>
                </v-row>
                <v-row>
                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="data.poll.title"
                            label="Title">
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-checkbox
                            v-model="data.poll.visible"
                            :false-value="0"
                            :true-value="1"
                            label="Visible to users"
                        >
                        </v-checkbox>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" sm="3">
                        <v-menu ref="data.poll.show_date_start"
                            v-model="data.poll.show_date_start"
                            :close-on-content-click="false"
                            :nudge-right="10"
                            transition="scale-transition"
                            offset-y min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="data.poll.valid_from"
                                    label="Start date" v-on="on">
                                </v-text-field>
                            </template>
                            <v-date-picker v-model="data.poll.valid_from"
                                    no-title></v-date-picker>
                        </v-menu>

                    </v-col>
                    <v-col cols="12" sm="3">
                        <v-menu ref="data.poll.show_time_start"
                            v-model="data.poll.show_time_start"
                            :close-on-content-click="false"
                            :nudge-right="10"
                            transition="scale-transition"
                            offset-y min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="data.poll.time_from"
                                    label="Start time" v-on="on">
                                </v-text-field>
                            </template>
                            <v-time-picker
                                v-model="data.poll.time_from"
                                format="24hr"
                                use-seconds
                            ></v-time-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="12" sm="3">
                        <v-menu ref="data.poll.show_date_end"
                            v-model="data.poll.show_date_end"
                            :close-on-content-click="false"
                            :nudge-right="10"
                            transition="scale-transition"
                            offset-y min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="data.poll.valid_until"
                                    label="End date" v-on="on">
                                </v-text-field>
                            </template>
                            <v-date-picker v-model="data.poll.valid_until"
                                    no-title></v-date-picker>
                        </v-menu>

                    </v-col>
                    <v-col cols="12" sm="3">
                        <v-menu ref="data.poll.show_time_end"
                            v-model="data.poll.show_time_end"
                            :close-on-content-click="false"
                            :nudge-right="10"
                            transition="scale-transition"
                            offset-y min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="data.poll.time_until"
                                    label="End time" v-on="on">
                                </v-text-field>
                            </template>
                            <v-time-picker
                                v-model="data.poll.time_until"
                                format="24hr"
                                use-seconds
                            ></v-time-picker>
                        </v-menu>
                    </v-col>
                </v-row>
                <v-row class="mt-4">
                    <h2>Introductory texts</h2>
                </v-row>
                <v-row v-for="(text, i) in data.poll.texts"
                    :key="'text-'+ i"
                >
                    <v-col cols="12" sm="7">
                        <v-text-field
                            v-model="text.text"
                            label="Paragraph text">
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" sm="3">
                        <v-select v-model="text.text_type_id"
                            :items="textTypes"
                            item-value="id" item-text="name_en"
                            label="Text type">
                        </v-select>
                    </v-col>
                    <v-col cols="12" sm="1">
                        <v-text-field
                            v-model="text.sort_order"
                            label="Order">
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" sm="1">
                        <v-btn icon @click="removeItem(data.poll.texts, i, 'text')" class="mt-3">
                            <v-icon color="red darken">mdi-delete</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row>
                    <v-btn
                        class="ma-4"
                        outlined
                        color="blue"
                        @click="addItem(data.poll.texts,'text')"
                    >
                        Add text
                    </v-btn>
                </v-row>
                <v-row class="mt-4">
                    <h2>Questions</h2>
                </v-row>
                <v-row v-for="(question, i) in data.poll.questions"
                    :key="i"
                >
                    <v-col cols="12" sm="5">
                        <v-text-field
                            v-model="question.question"
                            label="Question">
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" sm="3">
                        <v-select v-model="question.question_type_id"
                            :items="questionTypes"
                            item-value="id" item-text="name_en"
                            @change="changedQuestionType(question)"
                            label="Question type">
                        </v-select>
                    </v-col>
                    <v-col cols="12" sm="2">
                        <v-checkbox
                            v-model="question.required"
                            :false-value="0"
                            :true-value="1"
                            label="Required"
                        >
                        </v-checkbox>
                    </v-col>
                    <v-col cols="12" sm="1">
                        <v-text-field
                            v-model="question.sort_order"
                            label="Order">
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" sm="1">
                        <v-btn icon @click="removeItem(data.poll.questions, i, 'question')" class="mt-3">
                            <v-icon color="red darken">mdi-delete</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col cols="12" v-if="question.question_type_id === 1">
                        <v-row>
                            <v-col offset="1">
                                <h4>Options for "{{question.question}}"</h4>
                            </v-col>
                        </v-row>
                        <v-row v-for="(option, j) in question.options"
                                :key="i + '-' + j"
                        >
                            <v-col cols="5" offset="1">
                                <v-text-field
                                    v-model="option.option_text"
                                    label="Option">
                                </v-text-field>
                            </v-col>
                            <v-col cols="1">
                                <v-text-field
                                    v-model="option.sort_order"
                                    label="Order">
                                </v-text-field>
                            </v-col>
                            <v-col cols="12" sm="1">
                                <v-btn icon @click="removeItem(question.options, j, 'option')" class="mt-3">
                                    <v-icon color="red darken">mdi-delete</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col offset="1">
                                <v-btn
                                    class="ma-4"
                                    outlined
                                    color="blue"
                                    @click="addItem(question.options,'option')"
                                >
                                    Add option
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <v-row>
                    <v-btn
                        class="ma-4"
                        outlined
                        color="blue"
                        @click="addItem(data.poll.questions,'question')"
                    >
                        Add Question
                    </v-btn>
                </v-row>
                <v-divider vertical></v-divider>

                <v-row>
                    <h2>People Access Management</h2>
                </v-row>
                <v-row>
                    <v-col cols="6">
                        <h4>List of Voters</h4>
                    </v-col>
                    <v-col cols="6">
                        <h4>Add People</h4>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="6">
                        <v-virtual-scroll
                            :items="data.people"
                            height="300"
                            item-height="50"
                        >
                            <template v-slot:default="{ item }">
                                <v-list-item :key="item.id">
                                    <v-list-item-content>
                                        <span class="smaller-text">
                                            {{ item.num }}.
                                            <b>{{ item.name }}</b>
                                        </span>
                                    </v-list-item-content>
                                    <v-list-item-action>
                                        <v-checkbox v-model="item.toDelete"
                                        >
                                        </v-checkbox>
                                    </v-list-item-action>
                                </v-list-item>
                            </template>
                        </v-virtual-scroll>
                        <v-row>
                            <v-col cols="8">
                                <v-btn
                                    class="ma-4"
                                    outlined
                                    color="blue"
                                    @click="deletePeopleSelected(data.people)"
                                >
                                    Delete Selected
                                </v-btn>
                            </v-col>
                            <v-col cols="4">
                                <v-progress-circular indeterminate
                                        v-show="progressDelete"
                                        :size="20" :width="2"
                                        color="primary"></v-progress-circular>
                                <v-icon v-show="successDelete" color="green">mdi-check</v-icon>
                                <v-icon v-show="errorDelete" color="red">mdi-alert-circle-outline</v-icon>
                            </v-col>
                        </v-row>

                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col cols="5">
                        <v-row>
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model="searchName"
                                    append-icon="mdi-magnify"
                                    label="Search by Name"
                                    single-line
                                    hide-details
                                    @input="filterData"
                                    class="px-2 mb-4"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model="searchPosition"
                                    append-icon="mdi-magnify"
                                    label="Search by Position"
                                    single-line
                                    hide-details
                                    @input="filterData"
                                    class="px-2 mb-4"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model="searchUnit"
                                    append-icon="mdi-magnify"
                                    label="Search by Unit"
                                    single-line
                                    hide-details
                                    @input="filterData"
                                    class="px-2 mb-4"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model="searchCity"
                                    append-icon="mdi-magnify"
                                    label="Search by Pole"
                                    single-line
                                    hide-details
                                    @input="filterData"
                                    class="px-2 mb-4"
                                ></v-text-field>
                            </v-col>

                        </v-row>
                        <v-row>
                            <v-btn
                                class="ma-4"
                                outlined
                                color="orange"
                                @click="selectAllSearch(people)"
                            >
                                Select all
                            </v-btn>
                        </v-row>
                        <v-row>
                            <v-virtual-scroll
                                :items="people"
                                height="300"
                                item-height="50"
                            >
                                <template v-slot:default="{ item }">
                                    <v-list-item :key="item.name + item.lab_name + item.position_name + item.unit + + item.city">
                                        <v-list-item-content>
                                            <span class="smaller-text"><b>{{ item.name }}</b> ({{ item.position_name }}
                                                , {{item.lab_name}}) - {{item.unit}}@{{item.city}}
                                            </span>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                            <v-checkbox v-model="item.selected">
                                                    </v-checkbox>
                                        </v-list-item-action>
                                    </v-list-item>
                                </template>
                            </v-virtual-scroll>

                        </v-row>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="4" offset="6">
                        <v-btn
                            class="ma-4"
                            outlined
                            color="blue"
                            @click="savePeopleSelected(people)"
                        >
                            Add Selected
                        </v-btn>
                    </v-col>
                    <v-col cols="2">
                        <v-progress-circular indeterminate
                                v-show="progressPeople"
                                :size="20" :width="2"
                                color="primary"></v-progress-circular>
                        <v-icon v-show="successPeople" color="green">mdi-check</v-icon>
                        <v-icon v-show="errorPeople" color="red">mdi-alert-circle-outline</v-icon>
                    </v-col>
                </v-row>
            </v-container>
        </v-form>
    </v-card>
</div>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'
import {debounce} from 'lodash'

export default {
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            progressPeople: false,
            successPeople: false,
            errorPeople: false,
            progressDelete: false,
            successDelete: false,
            errorDelete: false,
            progressPollDelete: false,
            successPollDelete: false,
            errorPollDelete: false,
            data: {
                isManager: false,
                poll: [],
                people: [],
            },
            textTypes: [],
            questionTypes: [],
            people: [],
            searchName: null,
            searchUnit: null,
            searchCity: null,
            searchPosition: null,


            toDeleteTexts: [],
            toDeleteQuestions: [],
            toDeleteQuestionOptions: [],
        }
    },
    mounted: function () {
    },
    created () {
        this.initialize();
    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                this.getPollInfo();
                this.getTextTypes();
                this.getQuestionTypes();
                this.getPollPeople();
            }
        },
        filterData: debounce(function () {
            this.getAllPeople(this.searchName, this.searchPosition, this.searchUnit, this.searchCity);
        }, 200),
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let pollID = this.$route.params.pollId;
                let personID = this.$store.state.session.personID;
                let urlCreateQuestionOption = [];
                let urlDeleteQuestionOption = [];
                let urlUpdateQuestionOption = [];
                let urlCreateQuestion = [];
                let urlDeleteQuestion = [];
                let urlUpdateQuestion = [];
                let urlCreateText = [];
                let urlDeleteText = [];
                let urlUpdateText = [];
                let urlUpdateSettings = [];
                //let urlCreatePoll = [];
                //let urlDeletePoll = [];
                for (let indQuest in this.data.poll.questions) {
                    if (this.data.poll.questions[indQuest].id === 'new') {
                        urlCreateQuestion.push({
                            url: 'api/polls/' + pollID
                                + '/managers/'+ personID
                                + '/questions',
                            body: this.data.poll.questions[indQuest],
                        });
                    } else {
                        urlUpdateQuestion.push({
                            url: 'api/polls/' + pollID
                                + '/managers/' + personID
                                + '/questions/' + this.data.poll.questions[indQuest].id,
                            body: this.data.poll.questions[indQuest],
                        });
                        for (let indOpt in this.data.poll.questions[indQuest].options) {
                            if (this.data.poll.questions[indQuest].options[indOpt].id === 'new') {
                                urlCreateQuestionOption.push({
                                    url: 'api/polls/' + pollID
                                        + '/managers/'+ personID
                                        + '/questions/'+ this.data.poll.questions[indQuest].id
                                        + '/options',
                                    body: this.data.poll.questions[indQuest].options[indOpt],
                                });
                            } else {
                                urlUpdateQuestionOption.push({
                                    url: 'api/polls/' + pollID
                                        + '/managers/' + personID
                                        + '/questions/' + this.data.poll.questions[indQuest].id
                                        + '/options/' + this.data.poll.questions[indQuest].options[indOpt].id,
                                    body: this.data.poll.questions[indQuest].options[indOpt],
                                });
                            }
                        }
                    }
                }
                for (let ind in this.toDeleteQuestionOptions) {
                    urlDeleteQuestionOption.push({
                        url: 'api/polls/' + pollID
                            + '/managers/'+ personID
                            + '/questions/'+ this.toDeleteQuestionOptions[ind].poll_question_id
                            + '/options/' + this.toDeleteQuestionOptions[ind].id,
                    });
                }
                for (let ind in this.toDeleteQuestions) {
                    urlDeleteQuestion.push({
                        url: 'api/polls/' + pollID
                            + '/managers/'+ personID
                            + '/questions/'+ this.toDeleteQuestions[ind].id,
                    });
                }
                for (let indTxt in this.data.poll.texts) {
                    if (this.data.poll.texts[indTxt].id === 'new') {
                        urlCreateText.push({
                            url: 'api/polls/' + pollID
                                + '/managers/'+ personID
                                + '/texts',
                            body: this.data.poll.texts[indTxt],
                        });
                    } else {
                        urlUpdateText.push({
                            url: 'api/polls/' + pollID
                                + '/managers/' + personID
                                + '/texts/' + this.data.poll.texts[indTxt].id,
                            body: this.data.poll.texts[indTxt],
                        });
                    }
                }
                for (let ind in this.toDeleteTexts) {
                    urlDeleteText.push({
                        url: 'api/polls/' + pollID
                            + '/managers/'+ personID
                            + '/texts/'+ this.toDeleteTexts[ind].id,
                    });
                }
                urlUpdateSettings.push({
                    url: 'api/polls/' + pollID
                        + '/managers/' + personID,
                    body: this.data.poll,
                });
                Promise.all(
                    urlCreateQuestionOption.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                        .concat(
                            urlDeleteQuestionOption.map(el =>
                                this.$http.delete(el.url,
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                }))
                        )
                        .concat(
                            urlUpdateQuestionOption.map(el =>
                                this.$http.put(el.url,
                                    { data: el.body, },
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                }))
                        )
                        .concat(
                            urlCreateQuestion.map(el =>
                                this.$http.post(el.url,
                                    { data: el.body, },
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                }))
                        )
                        .concat(
                            urlDeleteQuestion.map(el =>
                                this.$http.delete(el.url,
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                }))
                        )
                        .concat(
                            urlUpdateQuestion.map(el =>
                                this.$http.put(el.url,
                                    { data: el.body, },
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                }))
                        )
                        .concat(
                            urlCreateText.map(el =>
                                this.$http.post(el.url,
                                    { data: el.body, },
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                }))
                        )
                        .concat(
                            urlDeleteText.map(el =>
                                this.$http.delete(el.url,
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                }))
                        )
                        .concat(
                            urlUpdateText.map(el =>
                                this.$http.put(el.url,
                                    { data: el.body, },
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                }))
                        )
                        .concat(
                            urlUpdateSettings.map(el =>
                                this.$http.put(el.url,
                                    { data: el.body, },
                                    { headers:
                                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                                    },
                                }))
                        )
                )
                .then( () => {
                        this.progress = false;
                        this.success = true;
                        setTimeout(() => {this.success = false;}, 1500)
                        this.toDeleteTexts = [];
                        this.toDeleteQuestions = [];
                        this.toDeleteQuestionOptions = [];
                        this.initialize();
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    //this.toDelete = [];
                    this.toDeleteTexts = [];
                    this.toDeleteQuestions = [];
                    this.toDeleteQuestionOptions = [];
                    this.initialize();
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        savePeopleSelected (list) {
            if (this.$store.state.session.loggedIn) {
                this.progressPeople = true;
                let pollID = this.$route.params.pollId;
                let managerID = this.$store.state.session.personID;
                let urlAddPeople = [];
                let usedPersonID = []; // to filter people that appear several times
                for (let ind in list) {
                    if (list[ind].selected === true
                        && usedPersonID.indexOf(list[ind].person_id) === -1
                    ) {
                        urlAddPeople.push({
                            url: 'api/polls/' + pollID
                                + '/managers/'+ managerID
                                + '/people',
                            body: list[ind],
                        });
                        usedPersonID.push(list[ind].person_id)
                    }
                }
                Promise.all(
                    urlAddPeople.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                )
                .then( () => {
                        this.progressPeople = false;
                        this.successPeople = true;
                        setTimeout(() => {this.successPeople = false;}, 1500)
                        this.initialize();
                })
                .catch((error) => {
                    this.progressPeople = false;
                    this.errorPeople = true;
                    this.initialize();
                    setTimeout(() => {this.errorPeople = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        deletePeopleSelected (list) {
            if (this.$store.state.session.loggedIn) {
                this.progressDelete = true;
                let pollID = this.$route.params.pollId;
                let managerID = this.$store.state.session.personID;
                let urlDeletePeople = [];
                for (let ind in list) {
                    if (list[ind].toDelete === true) {
                        urlDeletePeople.push({
                            url: 'api/polls/' + pollID
                                + '/managers/'+ managerID
                                + '/people/' + list[ind].id,
                        });
                    }
                }
                Promise.all(
                    urlDeletePeople.map(el =>
                        this.$http.delete(el.url,
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                )
                .then( () => {
                    this.progressDelete = false;
                    this.successDelete = true;
                    setTimeout(() => {this.successDelete = false;}, 1500)
                    this.initialize();
                })
                .catch((error) => {
                    this.progressDelete = false;
                    this.errorDelete = true;
                    this.initialize();
                    setTimeout(() => {this.errorDelete = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })

            }
        },
        deletePoll () {
            // in the end we have to navigate back to /polls/managers page
            if (this.$store.state.session.loggedIn) {
                let proceed = confirm('This will delete all the poll contents.\n\n'
                    + ' Beware that problems might occur if the poll already received votes.');
                if (proceed) {
                    this.progressPollDelete = true;
                    let pollID = this.$route.params.pollId;
                    let managerID = this.$store.state.session.personID;
                    let urlDeletePoll = [];
                    urlDeletePoll.push({
                        url: 'api/polls/' + pollID
                            + '/managers/'+ managerID,
                    });
                    Promise.all(
                        urlDeletePoll.map(el =>
                            this.$http.delete(el.url,
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .then( () => {
                        this.progressPollDelete = false;
                        this.successPollDelete = true;
                        setTimeout(() => {this.successPollDelete = false;}, 1500)
                        this.$router.push('/polls/managers')
                    })
                    .catch((error) => {
                        this.progressPollDelete = false;
                        this.errorPollDelete = true;
                        this.initialize();
                        setTimeout(() => {this.errorPollDelete = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    })
                }
            }
        },
        changedQuestionType (question) {
            if (question.question_type_id === 2
                || question.question_type_id === 3) {
                //options are tagged for deletion
                for (let indOpt in question.options) {
                    if (question.options[indOpt].id !== 'new') {
                        this.toDeleteQuestionOptions.push(question.options[indOpt])
                    }
                }
                question.options = [];
            } else if (question.question_type_id === 1) {
                //if there were options tagged for deletion, untag them
                for (let ind in this.toDeleteQuestionOptions) {
                    if (this.toDeleteQuestionOptions[ind].poll_question_id === question.id) {
                        question.options.push(this.toDeleteQuestionOptions[ind])
                    }
                }
                this.toDeleteQuestionOptions = this.toDeleteQuestionOptions
                                                .filter(el => el.poll_question_id !== question.id)

            }

        },
        getPollInfo () {
            let pollID = this.$route.params.pollId;
            let personID = this.$store.state.session.personID;
            let urlSubmit = 'api/polls/' + pollID + '/managers/'+ personID;
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then( (result) => {
                // for each question, add an answer entry
                if (result !== null && result !== undefined && Object.keys(result).length > 0) {
                    this.data.poll = result;
                    this.data.poll.time_until =
                        time.momentToDate(this.data.poll.valid_until, undefined, 'HH:mm:ss')
                    this.data.poll.valid_until = time.momentToDate(this.data.poll.valid_until)
                    this.data.poll.time_from =
                        time.momentToDate(this.data.poll.valid_from, undefined, 'HH:mm:ss')
                    this.data.poll.valid_from = time.momentToDate(this.data.poll.valid_from)
                    this.data.isManager = true;
                    this.$store.commit('setActiveTile', {
                        newTile: 9,
                        newToolbarText: 'Edit poll: ' + this.data.poll.title
                    });
                }
            })
            .catch((error) => {
                console.log(error)
            })
        },
        getTextTypes() {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'polls-text-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'textTypes');
            }
        },
        getPollPeople() {
            if (this.$store.state.session.loggedIn) {
                let pollID = this.$route.params.pollId;
                let personID = this.$store.state.session.personID;
                let url = 'api/polls/' + pollID
                        + '/managers/'+ personID
                        + '/people';
                this.$http.get(url,
                    { headers:
                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                    },
                })
                .then( (result) => {
                    this.data.people = result.data.result;
                    let counter = 0;
                    for (let ind in this.data.people) {
                        counter++
                        this.$set(this.data.people[ind], 'num', counter);
                    }
                })
            }
        },
        getAllPeople(nameStr, positionStr, unitStr, cityStr) {
            if (this.$store.state.session.loggedIn) {
                let pollID = this.$route.params.pollId;
                let personID = this.$store.state.session.personID;
                let url = 'api/polls/' + pollID
                        + '/managers/'+ personID
                        + '/people-list';
                let additional = '';
                if (nameStr !== null && nameStr !== undefined && nameStr !== '') {
                    if (additional === '') {
                        additional = additional + '?q=' + nameStr;
                    } else {
                        additional = additional + '&q=' + nameStr;
                    }
                }
                if (positionStr !== null && positionStr !== undefined && positionStr !== '') {
                    if (additional === '') {
                        additional = additional + '?position=' + positionStr;
                    } else {
                        additional = additional + '&position=' + positionStr;
                    }
                }
                if (unitStr !== null && unitStr !== undefined && unitStr !== '') {
                    if (additional === '') {
                        additional = additional + '?unit=' + unitStr;
                    } else {
                        additional = additional + '&unit=' + unitStr;
                    }
                }
                if (cityStr !== null && cityStr !== undefined && cityStr !== '') {
                    if (additional === '') {
                        additional = additional + '?city=' + cityStr;
                    } else {
                        additional = additional + '&city=' + cityStr;
                    }
                }
                if (additional !== '') {
                    url = url + additional;
                }
                this.$http.get(url,
                    { headers:
                        {'Authorization': 'Bearer ' + localStorage['v2-token']
                    },
                })
                .then( (result) => {
                    this.people = result.data.result;
                })
            }
        },
        getQuestionTypes() {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'polls-question-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'questionTypes');
            }
        },
        addItem(list, type) {
            if (type === 'text') {
                list.push({
                    id: 'new',
                    text: null,
                    text_type_id: null,
                    sort_order: null,
                });
            } else if (type === 'question') {
                list.push({
                    id: 'new',
                    question: null,
                    question_type_id: null,
                    required: 0,
                    sort_order: null,
                    options: [],
                });
            } else if (type === 'option') {
                list.push({
                    id: 'new',
                    option_text: null,
                    sort_order: null,
                });
            }
        },
        removeItem(list, ind, type) {
            if (type === 'text') {
                if (list[ind].id !== 'new') {
                    this.toDeleteTexts.push(list[ind]);
                }
            } else if (type === 'question') {
                if (list[ind].id !== 'new') {
                    this.toDeleteQuestions.push(list[ind]);
                }
            } else if (type === 'option') {
                if (list[ind].id !== 'new') {
                    this.toDeleteQuestionOptions.push(list[ind]);
                }
            }
            list.splice(ind, 1);

        },
        selectAllSearch (list) {
            for (let ind in list) {
                this.$set(list[ind], 'selected', true);
            }
        }
    },

}
</script>

<style scoped>
.save-container {
    position: sticky;
    top: 100px;
}

.background-white {
    background-color: white;
    opacity: 1 !important;
}

.smaller-text {
    font-size: 0.8em;
}

</style>