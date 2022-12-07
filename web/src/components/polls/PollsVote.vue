<template>
<div>
    <v-card v-if="isVoter">
        <v-card-title primary-title>
            <div>
                <h3 class="headline">{{poll.title}}</h3>
            </div>
        </v-card-title>
        <v-container class="px-6">
            <v-row v-for="(text, i) in poll.texts"  class="pl-4"
                :key="i"
            >
                <span v-if="text.text_type_name_en === 'Title'"
                    class="poll-title-text"
                >
                    {{text.text}}
                </span>
                <span v-else-if="text.text_type_name_en === 'Normal Text'"
                    class="poll-normal-text"
                >
                    {{text.text}}
                </span>
                <span v-else-if="text.text_type_name_en === 'Small letter text'"
                    class="poll-small-text"
                >
                    {{text.text}}
                </span>
            </v-row>
        </v-container>
        <v-form ref="form"
            @submit.prevent="submitForm"
        >
            <v-container class="px-6">
                <v-row align="center">
                    <v-col cols="12">
                        <ol>
                            <li v-for="(v, i) in $v.poll.questions.$each.$iter"
                                :key="i"
                            >
                                <div v-if="v.$model.question_type_name_en === 'Multiple choice'"
                                    class="ml-4"
                                >
                                    <v-radio-group v-model="v.$model.answer"
                                        :error="v.answer.$error"
                                    >
                                        <template v-slot:label>
                                            <h3 class="black--text mb-2">
                                                {{v.$model.question}}
                                                <span v-if="v.$model.required === 1" class="red--text mb-2">
                                                    *
                                                </span>
                                            </h3>

                                        </template>
                                        <v-radio v-for="(option, j) in v.$model.options"
                                            :key="i + '-' + j"
                                            :label="option.option_text"
                                            :value="option"
                                        ></v-radio>
                                    </v-radio-group>
                                    <div v-if="v.answer.$error">
                                        <p v-if="!v.answer.required" class="caption red--text">Answer is required.</p>
                                        <p v-if="!v.answer.maxLength" class="caption red--text">Answer exceeds maximum length.</p>
                                    </div>
                                </div>
                                <div v-else-if="v.$model.question_type_name_en === 'Line Input'"
                                    class="ml-4"
                                >
                                    <v-text-field
                                        v-model="v.$model.answer"
                                        :error="v.answer.$error"
                                    >
                                        <template v-slot:label>
                                            {{v.$model.question}} <span v-if="v.$model.required === 1" class="red--text mb-2">*</span>
                                        </template>
                                    </v-text-field>
                                    <div v-if="v.answer.$error">
                                        <p v-if="!v.answer.required" class="caption red--text">Answer is required.</p>
                                        <p v-if="!v.answer.maxLength" class="caption red--text">Answer exceeds maximum length.</p>
                                    </div>
                                </div>
                                <div v-else-if="v.$model.question_type_name_en === 'Multi-line Input'"
                                    class="ml-4"
                                >
                                    <v-textarea
                                        v-model="v.$model.answer"
                                        :error="v.answer.$error"
                                    >
                                        <template v-slot:label>
                                            {{v.$model.question}} <span v-if="v.$model.required === 1" class="red--text mb-2">*</span>
                                        </template>
                                    </v-textarea>
                                    <div v-if="v.answer.$error">
                                        <p v-if="!v.answer.required" class="caption red--text">Answer is required.</p>
                                        <p v-if="!v.answer.maxLength" class="caption red--text">Answer exceeds maximum length.</p>
                                    </div>
                                </div>
                            </li>
                        </ol>
                    </v-col>
                </v-row>
                <v-row justify="start">
                    <v-col cols="12" v-if="formError">
                        <p class="caption red--text">Check if you answered all required questions.</p>
                    </v-col>
                </v-row>
                <v-row align-content="center" justify="start" class="mb-4">
                    <v-col cols="6" sm="2" align-self="end">
                        <v-row justify="end">
                            <v-btn type="submit" class="white--text"
                            color="blue">Vote</v-btn>
                        </v-row>
                    </v-col>
                    <v-col cols="6" sm="10">
                        <v-progress-circular indeterminate
                                v-show="progress"
                                :size="20" :width="2"
                                color="primary"></v-progress-circular>
                        <v-icon v-show="success" color="green">mdi-check</v-icon>
                        <span v-show="success" class="green--text">Your vote was successful!</span>
                        <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                        <span v-show="error" class="red--text">Something went wrong.</span>
                    </v-col>
                </v-row>
            </v-container>
        </v-form>
    </v-card>
    <p v-else>You are not allowed to vote in this poll.
        Contact Science Management (josebraga@fct.unl.pt)
        if you have any doubts.</p>
</div>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import { requiredIf, helpers } from 'vuelidate/lib/validators'

const myMaxLength = (param) =>
    (value) => {
        return !helpers.req(value)
            || (typeof value === 'object')
            || (typeof value === 'string' && value.length <= param)
        }

export default {
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            isVoter: false,
            data: {
            },
            poll: [],
            baseURL: '/polls/',
        }
    },
    mounted: function () {
        this.$store.commit('setActiveTile', {
            newTile: 10,
            newToolbarText: 'Answer poll questions'
        });
    },
    created () {
        this.initialize();
    },
    methods: {
        initialize() {
            if (this.$store.state.session.loggedIn) {
                this.getPollInfo();
            }
        },
        getPollInfo () {
            let pollID = this.$route.params.pollId;
            let personID = this.$store.state.session.personID;
            let urlSubmit = 'api/polls/' + pollID + '/people/'+ personID;
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then( (result) => {
                // for each question, add an answer entry
                if (result !== null && result !== undefined) {
                    for (let ind in result.questions) {
                        this.$set(result.questions[ind], 'answer', null);
                        //if (result.questions[ind].required === 1) {
                        //    result.questions[ind].question = result.questions[ind].question + '*';
                        //}
                    }
                    this.poll = result;
                    this.isVoter = true;
                }
            })
            .catch((error) => {
                console.log(error)
            })
        },
        submitForm () {
            let personID = this.$store.state.session.personID;
            this.formError = false;
            this.$v.$touch();
            if (this.$v.$invalid) {
                this.formError = true;
            } else {
                this.progress = true;
                let urlCreate = [];
                urlCreate.push({
                    url: 'api/polls/' + this.poll.id
                        + '/people/' + personID,
                    body: { poll: this.poll },
                });
                Promise.all(
                    urlCreate.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token'] },
                            }
                        )
                    )
                )
                .then( () => {
                    this.progress = false;
                    this.success = true;
                    this.submitted = true;
                    setTimeout(() => {this.success = false;}, 3000)
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
    },
    validations: {
        poll: {
            questions: {
                $each: {
                    answer: {
                        required: requiredIf((v) => {
                            return v.required === 1;
                        }),
                        maxLength: myMaxLength(1000),
                    }
                }
            }
        }
    },

}
</script>

<style scoped>
.poll-title-text {
    font-size: 1.4em;
    font-weight: 600;
}
.poll-normal-text {
    color: darkslategrey;
}
.poll-small-text {
    font-size: 0.7em;
}
</style>