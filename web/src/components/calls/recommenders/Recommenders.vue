<template>
<div>
    <v-app-bar prominent app>
        <v-row  align="center">
            <v-col cols="1">
                <img src="/images/logo/ucibio-logo.png" width="40">
            </v-col>
            <v-col v-if="loggedIn" cols="10" class="call-title">{{callName}}
                - Reference for {{applicantName}}
            </v-col>
            <v-col v-else cols="10" class="call-title">{{callName}}
                Error
            </v-col>
        </v-row>
    </v-app-bar>
    <div v-if="loggedIn" class="px-4">
        <v-container>
            <v-form ref="form"
                @submit.prevent="submitForm"
            >
                <v-row>
                    <v-col cols="12">
                        Please answer the quick questions and write a letter of reference below.
                        If you do not want to fill this form for this applicant please contact xx@plpl.com (mail a definir).
                    </v-col>
                </v-row>
                <v-row v-for="(v, i) in $v.questions.$each.$iter"
                    :key="i"
                >
                    <v-col cols="12"
                        v-if="v.$model.answer_type === 'text'"
                    >
                        <span class="question">
                            {{parseInt(i,10) + 1}}. {{v.$model.question}} <span v-if="v.$model.required">*</span>
                        </span>
                    </v-col>
                    <v-col cols="12" md="4"
                        v-if="v.$model.answer_type === 'grade'"
                    >
                        <span class="question">
                            {{parseInt(i,10) + 1}}. {{v.$model.question}}
                            <span v-if="v.$model.required">*</span><br>
                            <span class="explanation">Grades (1 - Weak to 5 - Excellent, 0 - Don't know)</span>
                        </span>
                    </v-col>
                    <v-col cols="12"
                            v-if="v.$model.answer_type === 'text'">
                        <v-textarea
                            v-model="v.$model.answer"
                            :error="v.answer.$error"
                            @input="v.answer.$touch()"
                            rows="1"
                            counter
                            label="Answer">
                        </v-textarea>
                        <div v-if="v.answer.$error">
                            <p v-if="!v.answer.maxLength" class="caption red--text">Maximum length is 1000 characters.</p>
                            <p v-if="!v.answer.requiredIf" class="caption red--text">Field is required.</p>
                        </div>
                    </v-col>
                    <v-col cols="12" md="6"
                            v-if="v.$model.answer_type === 'grade'">
                        <v-radio-group v-model="v.$model.answer" row>
                            <v-radio v-for="(grade, j) in grades"
                                :key="j"
                                :label="grade.toString()"
                                :value="grade">
                            </v-radio>
                        </v-radio-group>
                        <div v-if="v.answer.$error">
                            <p v-if="!v.answer.requiredIf" class="caption red--text">This field is required</p>
                        </div>
                    </v-col>
                    <v-col cols="12">
                        <v-divider></v-divider>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <span class="question">
                            {{questions.length + 1}}. Letter of reference * (max. 2000 characters)
                        </span>
                    </v-col>
                    <v-col cols="12">
                        <v-textarea
                            v-model="$v.reference.$model"
                            :error="$v.reference.$error"
                            rows="12"
                            counter
                            label="Answer*">
                        </v-textarea>
                        <div v-if="$v.reference.$error">
                            <p v-if="!$v.reference.maxLength" class="caption red--text">Maximum length is 1000 characters.</p>
                            <p v-if="!$v.reference.required" class="caption red--text">Field is required.</p>
                        </div>

                    </v-col>
                </v-row>
                <v-row align-content="center" justify="center">
                    <v-col cols="3" v-if="formError">
                        <v-row justify="end">
                            <p class="caption red--text">Unable to submit form.</p>
                        </v-row>
                        <v-row justify="end" v-if="submitted">
                            <p class="caption red--text">You have already submitted your evaluation.</p>
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
                                Submit Evaluation
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
                <v-row align-content="center" justify="center" v-if="success">
                    <p class="caption blue--text">
                        Everything was successful.
                        Thank you for your contribution!
                    </p>
                </v-row>

            </v-form>
        </v-container>
    </div>
    <div v-else class="pa-6">
        Either the link you are using is incorrect or you have already submitted your letter of reference.
    </div>
</div>
</template>

<script>
import {maxLength, required, requiredIf} from 'vuelidate/lib/validators'

export default {
    components: {

    },
    data() {
        return {
            error: false,
            success: false,
            progress: false,
            formError: false,
            loggedIn: false,
            token: '',
            recommenderID: null,
            callName: '',
            callID: null,
            applicationID: null,
            applicantName: '',
            questions: [],
            reference: '',
            submitted: false,
            grades: [0,1,2,3,4,5],
            data: {

            }
        }
    },
    created() {
        this.checkLogin();
    },
    mounted() {},
    computed: {
        showHelp2: {
            get() {
                return this.$store.state.navigation.showHelp;
            },
            set(state) {
                if (state !== this.$store.state.navigation.showHelp) {
                    this.$store.dispatch('showHelp')
                }
            }

        },
    },
    methods: {
        showHelp: function () {
            this.$store.commit('showHelp');
        },
        checkLogin() {
            const urlSubmit = 'api/recommendation-login';
            this.recommenderID = this.$route.params.recommenderID;
            this.$http.post(
                urlSubmit,
                {
                    recommenderID: this.recommenderID,
                    password: this.$route.params.password,
                }, {}
            )
            .then((result) => {
                // the user is logged in
                this.loggedIn = true;
                this.token = result.data.token;
                this.callName = result.data.call.call_name;
                this.callID = result.data.call.id;
                this.applicationID = result.data.application.id;
                this.applicantName = result.data.application.applicant_name;
                return this.$http.get(
                    'api/calls/' + this.callID
                    + '/applications/' + this.applicationID
                    + '/recommenders/' + this.recommenderID
                    + '/questions'
                    ,
                    {
                        headers: {'Authorization': 'Bearer ' + this.token },
                    }
                )
            })
            .then( (result) => {
                this.questions = result.data.result;
            })
            .catch((error) => {
                this.loggedIn = false;
                // eslint-disable-next-line
                console.log(error)
            });
        },
        submitForm () {
            if (this.loggedIn
                && !this.submitted
                && !this.$v.$invalid
            ) {
                this.progress = true;
                let urlCreate = [];
                urlCreate.push({
                    url: 'api/calls/' + this.callID
                        + '/applications/' + this.applicationID
                        + '/recommenders/' + this.recommenderID,
                    body: {
                        answers: this.questions,
                        reference: this.reference,
                    },
                });
                this.$http.all(
                    urlCreate.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + this.token },
                            }
                        )
                    )
                )
                .then(this.$http.spread( () => {
                    this.progress = false;
                    this.success = true;
                    this.submitted = true;
                    setTimeout(() => {this.success = false;}, 10000)
                }))
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    setTimeout(() => {this.error = false;}, 10000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            } else if (this.submitted) {
                this.formError = true;
            }
        },
    },
    validations: {
        questions: {
            $each: {
                answer: {
                    maxLength: maxLength(1000),
                    requiredIf: requiredIf((v) => {
                        return v.required === 1;
                    })
                }
            },
        },
        reference: {
            required,
            maxLength: maxLength(2000),
        },
    },

}
</script>

<style scoped>
.call-title {
    font-size: 20px;
}
.question {
    font-size: 1.2rem;
    font-weight: 500;
}
.explanation {
font-size: 0.8rem;
}

</style>