<template>
<div>
    <v-app-bar prominent app>
        <v-row  align="center">
            <v-col cols="1">
                <img src="/images/logo/laqv-logo.png" width="80">
            </v-col>
            <v-col cols="10" class="ml-auto call-title">{{data.call.call_name}} - Application page</v-col>
        </v-row>
    </v-app-bar>
    <v-container>
        <v-row
            align="center"
            justify="center"
        >
            <p><span class="dates">{{data.dates}}</span></p>
        </v-row>
        <v-row justify="center">
            <!-- <v-col cols="11" sm="8" xl="6"> -->
                <p class="form-note">
                    Fill in fields below
                    <span class="note-warning">(*=required)</span>.<br>
                    Information entered will remain in this browser even if you close the window or restart the device.<br>
                    <span class="note-warning">(Exception: file inputs, should be verified before submission)</span>.<br>
                    Data you submit will be used solely for administrative purposes and for the evaluation of the application by the reviewers.<br>
                    If you experience problems submitting the application contact <span class="blue--text">josebraga@fct.unl.pt</span>.
                    <br><br>
                    Note: When you input dates, you can click the header of the datepicker to navigate dates easily (1 click for months, 2 clicks for years).
                </p>
                <p class="form-note"></p>
            <!-- </v-col> -->
        </v-row>
        <v-row>
            <v-col cols="12" md="6">
                <PersonalData ref="personal" v-if="gotInitialData"></PersonalData>
            </v-col>
            <v-col cols="12" md="6">
                <MotivationLetter ref="motivation" v-if="gotInitialData"></MotivationLetter>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <AcademicDegrees ref="academic" v-if="gotInitialData"></AcademicDegrees>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <ReferenceLetters ref="recommendation" v-if="gotInitialData"></ReferenceLetters>
            </v-col>
        </v-row>
        <v-expansion-panels multiple v-model="openPanel">
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <h2>Participation in Scientific Projects</h2>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <Projects ref="projects" v-if="gotInitialData"></Projects>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <h2>Mobility between Institutions within the scope of Projects</h2>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <Mobility ref="mobility" v-if="gotInitialData"></Mobility>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <h2>Papers Published in Indexed Journals</h2>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <Papers ref="papers" v-if="gotInitialData"></Papers>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <h2>Presenting Author of Oral Communications in Scientific Meetings</h2>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <Communications ref="communications" v-if="gotInitialData"></Communications>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
                <v-expansion-panel-header>
                    <h2>Presenting Author of Posters Presented in Scientifc Meetings</h2>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <Posters ref="posters" v-if="gotInitialData"></Posters>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
        <v-row align-content="center" justify="center" class="mt-4">
            <v-col cols="12" v-if="formError">
                <v-row justify="center" class="caption red--text">
                    <v-col cols="3">
                        Unable to submit form.
                    </v-col>
                </v-row>
                <v-row v-for="(errorStr, i) in errorsList"
                    :key="i"
                    justify="center"
                >
                    <v-col cols="3" class="caption red--text">
                         {{ errorStr }}
                    </v-col>
                </v-row>
            </v-col>
            <v-col cols="12" v-if="applicationData.application.submitted">
                <v-row align-content="center" justify="center">
                    <v-col cols="2" align-self="end">
                        <v-row justify="end">
                            <v-btn @click="confirmForm('update')" large
                                color="red"
                                class="white--text"
                                :disabled="buttonDisabled"
                            >
                                Submit correction
                            </v-btn>
                        </v-row>
                    </v-col>
                    <v-col cols="1">
                    </v-col>
                </v-row>
            </v-col>
            <v-col cols="2" align-self="end">
                <v-row justify="end">
                    <v-btn @click="confirmForm" large
                        color="blue"
                        class="white--text"
                        :disabled="buttonDisabled"
                    >
                        Submit application
                    </v-btn>
                </v-row>
            </v-col>
            <v-col cols="1">
                <v-progress-circular indeterminate
                        v-show="progress"
                        :size="20" :width="2"
                        color="primary"></v-progress-circular>
                <v-icon v-show="success" color="green">mdi-check</v-icon>
                <span v-show="success" class="green--text">Your submission was succesful</span>
                <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                <span v-show="error" class="red--text">A problem occurred</span>
            </v-col>
        </v-row>


        <v-row justify="center">
            <div class="sponsors">
                {{ data.sponsors }}
            </div>
        </v-row>
    </v-container>
</div>
</template>

<script>
//import time from '@/components/common/date-utils'
import PersonalData from './PersonalData'
import MotivationLetter from './MotivationLetter'
import AcademicDegrees from './AcademicDegreesLAQV'
import Projects from './Projects'
import Mobility from './MobilityLAQV'
import Papers from './PapersLAQV'
import Communications from './CommunicationsLAQV'
import Posters from './PostersLAQV'
import ReferenceLetters from './ReferenceLetters'


export default {
    components: {
        PersonalData,
        MotivationLetter,
        AcademicDegrees,
        Projects,
        Mobility,
        Papers,
        Communications,
        Posters,
        ReferenceLetters,
    },
    data() {
        return {
            data: {
                call: {},
                urlApplicants: '',
                dates: '',
                sponsors: ''
            },
            gotInitialData: false,
            openPanel: [],
            formError: false,
            buttonDisabled: false,
            progress: false,
            success: false,
            error: false,
            errorsList: [],

        }
    },
    created () {
        let callSegment = this.$route.params.callSegment
        this.getCallInfo(callSegment);
    },
    computed: {
        applicationData () {
            return this.$store.getters.applicationData;
        }
    },
    watch: {
        $route () {
            let callSegment = this.$route.params.callSegment
            this.getCallInfo(callSegment);
        }
    },
    methods: {
        initialize(callSegment) {
            this.$store.commit('checkExistingApplication', {callSegment: callSegment});

            if (this.applicationData.application.projects.length > 0) {
                this.openPanel.push(0);
            }
            if (this.applicationData.application.projects.length > 0) {
                this.openPanel.push(1);
            }
            if (this.applicationData.application.papers.length > 0) {
                this.openPanel.push(2);
            }
            if (this.applicationData.application.communications.length > 0) {
                this.openPanel.push(3);
            }
            if (this.applicationData.application.posters.length > 0) {
                this.openPanel.push(4);
            }
            if (this.applicationData.application.prizes.length > 0) {
                this.openPanel.push(5);
            }
            if (this.applicationData.application.patents.length > 0) {
                this.openPanel.push(6);
            }
            if (this.applicationData.application.professional.length > 0) {
                this.openPanel.push(7);
            }
            this.gotInitialData = true;
        },
        getCallInfo(callSegment) {
            let urlSubmit = 'api/v2/calls/' + callSegment;
            let sponsors = '';
            let dates = '';
            this.$http.get(urlSubmit)
            .then((response) => {
                if (response) {
                    let result = response.data.result;
                    Object.keys(result).forEach(key => {
                        let value = result[key];
                        this.$set(this.data.call, key, value);
                    });
                    for (let ind in this.data.call.texts) {
                        if (this.data.call.texts[ind].paragraph_type_name === 'sponsors') {
                            sponsors = sponsors
                                + this.data.call.texts[ind].text + '\n';
                        } else if (this.data.call.texts[ind].paragraph_type_name === 'dates') {
                            dates = dates
                                + this.data.call.texts[ind].text + '\n';
                        }
                    }
                    this.$set(this.data, 'sponsors', sponsors)
                    this.$set(this.data, 'dates', dates)
                    this.initialize(callSegment);
                }
            })
            .catch((error) => {
                // eslint-disable-next-line
                console.log(error)
            });
        },
        confirmForm(typeStr) {
            let proceed = true;
            let sendToRecommenders = false;
            if (this.applicationData.application.submitted && typeStr !== 'update') {
                proceed = confirm('You already submitted an application successfully.\n\n'
                                + ' Do you wish to proceed and submit a new one?');
            } else if (typeStr === 'update') {
                sendToRecommenders = confirm('We have already sent emails requesting letters of recommendation.\n\n'
                                + ' Do you want to send these emails again?\n\n'
                                + ' Cancel = proceed without sending emails');
            }
            if (proceed) {
                if (typeStr !== 'update') {
                    this.$store.dispatch('setApplicationSubmitted', {submitted: false});
                }
                this.errorsList = [];
                this.errorsList.push('Check the following sections:');
                let sections = [
                    {ref: 'personal', text:' - Identification or Contacts'},
                    {ref: 'motivation', text:' - Motivation Letter'},
                    {ref: 'academic', text:' - Academic Degrees'},
                    {ref: 'recommendation', text:' - Contacts for Letters of Recommendation'},
                    {ref: 'projects', text:' - Participation in Scientific Projects'},
                    {ref: 'mobility', text:' - Mobility between Institutions in the scope of Projects'},
                    {ref: 'papers', text:' - Papers Published in Indexed Journals'},
                    {ref: 'communications', text:' - Oral Communications in Scientific Meetings'},
                    {ref: 'posters', text:' - Posters Presented in Scientifc Meetings'},
                ];
                this.formError = false;
                for (let ind in sections) {
                    if (this.$refs[sections[ind].ref] !== undefined
                            && this.$refs[sections[ind].ref].$v.$invalid) {
                        this.formError = true;
                        this.errorsList.push(sections[ind].text);
                        this.$refs[sections[ind].ref].$v.$touch();
                    }
                }
                if (!this.formError) {
                    this.submitForm(typeStr, sendToRecommenders);
                }
            }
        },
        submitForm(typeStr, sendToRecommenders) {
            this.progress = true;
            this.buttonDisabled = true;
            let callSegment = this.$route.params.callSegment;
            // submission is made in steps:
            // 1. submit data & send recommender emails
            // 2. upload documents (adding their info to the database)
            // 3. Compute scores (server-side)
            let data;
            if (typeStr !== 'update') {
                this.$http.post('api/v2/calls/' + callSegment + '/applications',
                    {
                        data: this.applicationData.application,
                        isLAQV: true,
                    },
                    { }
                )
                .then((result) => {
                        data = result.data.data;
                        data.isLAQV = true;
                        let uploadDocuments = [];
                        let formDataCV = new FormData();
                        formDataCV.append('doc_type_id', 1); // CV doc type
                        formDataCV.append('application_id', data.applicationID);
                        formDataCV.append('file_name', this.applicationData.application.cv.name);
                        formDataCV.append('file', this.applicationData.application.cv);
                        let url = 'api/v2/calls/' + callSegment
                                + '/applications/' + data.applicationID
                                + '/documents';
                        uploadDocuments.push({
                            url,
                            body: formDataCV,
                        })
                        let formDataID = new FormData();
                        formDataID.append('doc_type_id', 4); // ID card doc type
                        formDataID.append('application_id', data.applicationID);
                        formDataID.append('file_name', this.applicationData.application.identification_image.name);
                        formDataID.append('file', this.applicationData.application.identification_image);
                        url = 'api/v2/calls/' + callSegment
                                + '/applications/' + data.applicationID
                                + '/documents';
                        uploadDocuments.push({
                            url,
                            body: formDataID,
                        })
                        if (this.applicationData.application.residence_certificate !== null && this.applicationData.application.residence_certificate !== undefined) {
                            let formDataResidence = new FormData();
                            formDataResidence.append('doc_type_id', 5); // residence certificate
                            formDataResidence.append('application_id', data.applicationID);
                            formDataResidence.append('file_name', this.applicationData.application.residence_certificate.name);
                            formDataResidence.append('file', this.applicationData.application.residence_certificate);
                            url = 'api/v2/calls/' + callSegment
                                    + '/applications/' + data.applicationID
                                    + '/documents';
                            uploadDocuments.push({
                                url,
                                body: formDataResidence,
                            });
                        }
                        let formDataPhoto = new FormData();
                        formDataPhoto.append('doc_type_id', 6); // personal photo
                        formDataPhoto.append('application_id', data.applicationID);
                        formDataPhoto.append('file_name', this.applicationData.application.personal_photo.name);
                        formDataPhoto.append('file', this.applicationData.application.personal_photo);
                        url = 'api/v2/calls/' + callSegment
                                + '/applications/' + data.applicationID
                                + '/documents';
                        uploadDocuments.push({
                            url,
                            body: formDataPhoto,
                        });
                        for (let ind in this.applicationData.application.academicDegrees) {
                            let formDataDegree = new FormData();
                            formDataDegree.append('doc_type_id', 2); // degree doc type
                            formDataDegree.append('application_id', data.applicationID);
                            formDataDegree.append('file_name',
                                this.applicationData.application.academicDegrees[ind].certificate.name);
                            formDataDegree.append('file',
                                this.applicationData.application.academicDegrees[ind].certificate);
                            uploadDocuments.push({
                                url,
                                body: formDataDegree,
                            })
                        }
                        //this.$store.dispatch('addApplicationData', data);
                        return Promise.all(
                            uploadDocuments.map(el =>
                                this.$http.post(el.url,
                                    el.body,
                                    { headers:
                                        { 'Content-Type': 'multipart/form-data' },
                                    }
                                )
                            )
                        );
                    }
                )
                .then( () => {
                    //this.$store.dispatch('addApplicationData', data);
                    return this.$http.post('api/v2/calls/' + callSegment
                                    + '/applications/' + data.applicationID
                                    + '/scores',
                            {
                                data,
                                isLAQV: true,
                            },
                            { }
                        )
                    }
                )
                .then(() => {
                    return this.$http.post('api/v2/calls/' + callSegment
                                    + '/applications/' + data.applicationID
                                    + '/email-applicant',
                            { data: this.applicationData.application },
                            { }
                        )
                    }
                )
                .then( (result) => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {
                            this.success = false;
                            this.buttonDisabled = false;
                        }
                    , 1500)
                    //console.log(result.data.result)
                    this.$store.dispatch('setApplicationSubmitted',
                        {
                            submitted: true,
                            applicationID: result.data.result.applicationID,
                            callID: result.data.result.callID,
                        });
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    this.initialize();
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            } else {
                this.applicationData.application.sendToRecommenders = sendToRecommenders;
                this.$http.put('api/v2/calls/' + callSegment
                        + '/applications/' + this.applicationData.application.applicationID,
                    {
                        data: this.applicationData.application,
                        isLAQV: true
                    },
                    { }
                )
                .then(() => {
                    return this.$http.delete('api/v2/calls/' + callSegment
                        + '/applications/' + this.applicationData.application.applicationID
                        + '/documents');
                })
                .then(() => {
                        let uploadDocuments = [];
                        let formDataCV = new FormData();
                        formDataCV.append('doc_type_id', 1); // CV doc type
                        formDataCV.append('application_id', this.applicationData.application.applicationID);
                        formDataCV.append('file_name', this.applicationData.application.cv.name);
                        formDataCV.append('file', this.applicationData.application.cv);
                        let url = 'api/v2/calls/' + callSegment
                            + '/applications/' + this.applicationData.application.applicationID
                            + '/documents';
                        uploadDocuments.push({
                            url,
                            body: formDataCV,
                        })
                        let formDataID = new FormData();
                        formDataID.append('doc_type_id', 4); // ID card type
                        formDataID.append('application_id', this.applicationData.application.applicationID);
                        formDataID.append('file_name', this.applicationData.application.identification_image.name);
                        formDataID.append('file', this.applicationData.application.identification_image);
                        url = 'api/v2/calls/' + callSegment
                                + '/applications/' + this.applicationData.application.applicationID
                                + '/documents';
                        uploadDocuments.push({
                            url,
                            body: formDataID,
                        })
                        if (this.applicationData.application.residence_certificate !== null
                                && this.applicationData.application.residence_certificate !== undefined) {
                            let formDataResidence = new FormData();
                            formDataResidence.append('doc_type_id', 5); // residence certificate
                            formDataResidence.append('application_id', this.applicationData.application.applicationID);
                            formDataResidence.append('file_name', this.applicationData.application.residence_certificate.name);
                            formDataResidence.append('file', this.applicationData.application.residence_certificate);
                            url = 'api/v2/calls/' + callSegment
                                    + '/applications/' + this.applicationData.application.applicationID
                                    + '/documents';
                            uploadDocuments.push({
                                url,
                                body: formDataResidence,
                            });
                        }
                        let formDataPhoto = new FormData();
                        formDataPhoto.append('doc_type_id', 6); // personal photo
                        formDataPhoto.append('application_id', this.applicationData.application.applicationID);
                        formDataPhoto.append('file_name', this.applicationData.application.personal_photo.name);
                        formDataPhoto.append('file', this.applicationData.application.personal_photo);
                        url = 'api/v2/calls/' + callSegment
                                + '/applications/' + this.applicationData.application.applicationID
                                + '/documents';
                        uploadDocuments.push({
                            url,
                            body: formDataPhoto,
                        });

                        for (let ind in this.applicationData.application.academicDegrees) {
                            let formDataDegree = new FormData();
                            formDataDegree.append('doc_type_id', 2); // degree doc type
                            formDataDegree.append('application_id', this.applicationData.application.applicationID);
                            formDataDegree.append('file_name',
                                this.applicationData.application.academicDegrees[ind].certificate.name);
                            formDataDegree.append('file',
                                this.applicationData.application.academicDegrees[ind].certificate);
                            uploadDocuments.push({
                                url,
                                body: formDataDegree,
                            })
                        }
                        return Promise.all(
                            uploadDocuments.map(el =>
                                this.$http.post(el.url,
                                    el.body,
                                    { headers:
                                        { 'Content-Type': 'multipart/form-data' },
                                    }
                                )
                            )
                        );
                    }
                )
                .then( () => {
                    return this.$http.put('api/v2/calls/' + callSegment
                                    + '/applications/' + this.applicationData.application.applicationID
                                    + '/scores',
                            {
                                data: this.applicationData.application,
                                isLAQV: true
                            },
                            { }
                        )
                    }
                )
                .then( () => {
                    return this.$http.put('api/v2/calls/' + callSegment
                                    + '/applications/' + this.applicationData.application.applicationID
                                    + '/email-applicant',
                            { data: this.applicationData.application },
                            { }
                        )
                    }
                )
                .then( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {
                            this.success = false;
                            this.buttonDisabled = false;
                        }
                    , 1500)
                    this.$store.dispatch('setApplicationSubmitted',
                        {
                            submitted: true,
                            applicationID: this.applicationData.application.applicationID,
                            callID: this.applicationData.application.callID,
                        });
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    this.initialize();
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })

            }
        },
    }
}
</script>

<style scoped>
.caption.red--text {
    padding-top: 0px;
    padding-bottom: 0px;
}

.call-title {
    font-size: 26px;
}

.dates {
    font-weight: 600;
    margin-bottom: 10px;
}

.introduction {
    margin-bottom: 10px;
}

.development {
    margin-bottom: 10px;
}
.v-expansion-panel-header h2  {
    font-weight: 400;
}

.sponsors {
    margin-top: 30px;
    font-size: 12px;
}

.form-note {
    font-size: 0.8rem;
    max-width: 600px;
}
.note-warning {
    color: red;
}

</style>
