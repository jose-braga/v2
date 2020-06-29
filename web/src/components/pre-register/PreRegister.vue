<template>
    <div>
        <v-app-bar app>
            <v-toolbar-title>
                <v-row align="center">
                <v-col>
                    <img src="/images/logo/ucibio-logo.png" width="40">
                </v-col>
                <v-col>
                    <img src="/images/logo/laqv-logo.png" width="64">
                </v-col>
                <v-col class="ml-6">LAQV/UCIBIO registration</v-col>
                </v-row>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on" @click.stop="showHelp">
                        <v-icon>mdi-help</v-icon>
                    </v-btn>
                </template>
                <span>Help for this page</span>
            </v-tooltip>
        </v-app-bar>
        <div v-if="loggedIn" class="px-4">
            <v-dialog v-model="showHelp2" content-class="help">
                <PreRegisterHelp></PreRegisterHelp>
            </v-dialog>
            <v-row justify="center">
                <span class="highlight-text mt-2">
                    Items with an asterisk (*) are <b>required</b>.
                    Press <b>"Submit"</b> at the bottom when finished!
                </span>
            </v-row>
            <v-row>
                <v-col cols="12" md="6">
                    <Password ref="password"></Password>
                    <NuclearInformation ref="nuclearInfo"></NuclearInformation>
                    <PersonalContacts ref="personalContacts"
                        v-if="personID"
                        :person-id="personID"
                        :token="token"
                    ></PersonalContacts>
                    <PersonalIdentifications ref="personalIdentifications"></PersonalIdentifications>
                    <InstitutionalContacts ref="institutionalContacts"></InstitutionalContacts>
                    <ProfessionalSituations ref="professionalSituations"></ProfessionalSituations>
                    <Comments ref="comments"></Comments>
                </v-col>
                <v-col cols="12" md="6">
                    <Authorization ref="authorization"></Authorization>
                    <Photo ref="photo"></Photo>
                    <Labs v-if="personID"
                        :person-id="personID"
                        :token="token"
                    ></Labs>
                    <Responsibles ref="responsibles"></Responsibles>
                    <AcademicAffiliations ref="academicAffiliations"></AcademicAffiliations>
                    <ScientificIdentifications ref="scientificIdentifications"></ScientificIdentifications>
                </v-col>
            </v-row>
            <v-row align-content="center" justify="center">
                <v-col cols="3" v-if="formError">
                    <v-row justify="end">
                        <p class="caption red--text">Unable to submit form.</p>
                    </v-row>
                </v-col>
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn @click="confirmForm" large
                        class="white--text"
                        color="blue">Submit</v-btn>
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

        </div>
        <div v-else class="pa-6">
            Wrong pre-registration link, please contact the science management team.
        </div>

    </div>
</template>

<script>
import PreRegisterHelp from './PreRegisterHelp'
import Password from './Password'
import NuclearInformation from './NuclearInformation'
import Authorization from './Authorization'
import Photo from './Photo'
import PersonalContacts from './PersonalContacts'
import InstitutionalContacts from './InstitutionalContacts'
import Labs from './Labs'
import Responsibles from './Responsibles'
import AcademicAffiliations from './AcademicAffiliations'
import ScientificIdentifications from './ScientificIdentifications'
import PersonalIdentifications from './PersonalIdentifications'
import ProfessionalSituations from './ProfessionalSituations'
import Comments from './Comments'

import { PDFDocument, PDFName, PDFBool, PDFString, PDFNumber } from 'pdf-lib'
//, StandardFonts
import subUtil from '@/components/common/submit-utils'
import download from 'downloadjs'
import time from '@/components/common/date-utils'

export default {
    components: {
        PreRegisterHelp,
        Password,
        NuclearInformation,
        Authorization,
        Photo,
        PersonalContacts,
        InstitutionalContacts,
        Labs,
        Responsibles,
        AcademicAffiliations,
        ScientificIdentifications,
        PersonalIdentifications,
        ProfessionalSituations,
        Comments,
    },
    data() {
        return {
            error: false,
            success: false,
            progress: false,
            formError: false,
            loggedIn: false,
            token: '',
            personID: null,
            userID: null,
            cropStyle: [
                {
                    width: 196,
                    height: 196,
                    imageType: 1 // this should exist always
                },
                {
                    width: 600,
                    height: 600,
                    imageType: 2
                },
            ],
            departments: [],
        }
    },
    created() {
        this.checkLogin();
        this.getDepartments();

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
            const urlSubmit = 'api/pre-registration-login';
            this.$http.post(
                urlSubmit,
                {
                    username: this.$route.params.username,
                    password: this.$route.params.password,
                }, {}
            )
            .then((result) => {
                // the user is logged in
                this.loggedIn = true;
                this.token = result.data.token;
                this.personID = result.data.person_id;
                this.userID = result.data.user_id;
            })
            .catch((error) => {
                this.loggedIn = false;
                // eslint-disable-next-line
                console.log(error)
            });
        },
        confirmForm() {
            //let person = this.$store.state.preregistration.person;
            //this.fillPDF(person);
            let proceed = true;
            let person = this.$store.state.preregistration.person;
            if (person.visible_public !== true) {
                proceed = confirm('You won\'t appear as a member'
                        + ' of the Research Units in their websites'
                        + ' unless you authorize that some data is made available'
                        + ' for the purposes stated in "Data visibility authorization".'
                        + ' \n\nIs this really what you want?');
            }
            if (proceed) {
                let person = this.$store.state.preregistration.person;
                // only after submitting all information is the PDF generated
                //console.log(person)
                let affiliationFCT = false;
                for (let ind in person.academicAffiliations) {
                    if (person.academicAffiliations[ind].department_id <= 4) {
                        affiliationFCT = true;
                        break;
                    }
                }
                if ( this.$refs.password.$v.$invalid
                    || this.$refs.nuclearInfo.$v.$invalid
                    || this.$refs.personalContacts.$v.$invalid
                    || this.$refs.institutionalContacts.$v.$invalid
                    || (person.emails !== undefined
                        && person.emails.requestEmail
                        && !affiliationFCT)
                    ) {
                    this.formError = true;
                    setTimeout(() => {
                        this.formError = false;
                        this.progress = false;
                    }, 3000);
                } else if (this.$refs.photo.selectedFile) {
                    this.progress = true;
                    this.uploadThisImage(0);
                } else {
                    this.progress = true;
                    this.submitForms();
                }
            }
        },
        uploadThisImage(i) {
            let urlSubmit = 'api/people/' + this.personID
                        + '/photos/' + this.cropStyle[i].imageType;
            const canvas = this.$store.state.preregistration.person.cropper
                .getCroppedCanvas({
                    width: this.cropStyle[i].width,
                    height: this.cropStyle[i].height
                });
            canvas.toBlob((blob) => {
                const formData = new FormData()
                formData.append('file_name', this.$refs.photo.selectedFile.name);
                formData.append('file', blob);

                this.$http.put(urlSubmit,
                    formData,
                    {
                        headers: {
                            'Authorization': 'Bearer ' + this.token,
                            'Content-Type': 'multipart/form-data'
                        },
                    }
                )
                .then(() => {
                    if (i + 1 < this.cropStyle.length) {
                        this.uploadThisImage(i + 1);
                    } else {
                        this.submitForms();
                    }
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                });
            }, 'image/png', 1);
        },
        async submitForms() {
            let person = this.$store.state.preregistration.person;
            delete person.cropper;
            let urlSubmit = 'api/pre-register/people/' + this.personID;
            person.userID = this.userID;
            this.$http.put(urlSubmit,
                { data: person, },
                {
                    headers: {'Authorization': 'Bearer ' + this.token },
                }
            )
            .then( () => {
                this.progress = false;
                this.success = true;
                setTimeout(() => {this.success = false;}, 1500)
                if (person.emails !== undefined && person.emails.requestEmail) {
                    this.fillPDF(person);
                }
            })
            .catch((error) => {
                this.progress = false;
                this.error = true;
                setTimeout(() => {this.error = false;}, 6000)
                // eslint-disable-next-line
                console.log(error)
            })
        },
        async fillPDF (person) {
            // adapted from https://github.com/Hopding/pdf-lib/issues/185#issuecomment-529146128
            let url = 'images/forms/correio_electronico_funcionario_v2.pdf';
            //let url = 'images/forms/test.pdf';
            let previousPDF = await this.$http.get(url,
                {
                    baseURL: process.env.VUE_APP_REQUEST_ORIGIN,
                    responseType: 'arraybuffer'
                })
                .then(result => result.data )
            const previousPDFDoc = await PDFDocument.load(previousPDF);
            const acroForm = await previousPDFDoc.context.lookup(
                previousPDFDoc.catalog.get(PDFName.of('AcroForm')),
            );
            acroForm.set( PDFName.of( 'NeedAppearances' ), PDFBool.True );
            const fieldRefs = acroForm.context.lookup(
                acroForm.get( PDFName.of( 'Fields' ))
            );
            const fields = fieldRefs.array.map( ref => acroForm.context.lookup( ref ));
            let department;
            for (let ind in this.departments) {
                if (this.departments[ind].id === person.academicAffiliations[0].department_id) {
                    department = this.departments[ind];
                }
            }
            let date = time.moment();

            let data = {
                'Nome completo': person.name,
                'Novo utilizador não dispõe de identificador CLIP': 'On',
                'Endereço de correio eletrónico': person.personal_emails.email,
                'Endereço de correio eletrónico alternativo sugerido': person.emails.email.split('@')[0],
                'Departamento ou Divisão': department.department_name_pt,
                'Nome completo_2': department.leaders[0].name,
                'Identificador CLIP_2': department.leaders[0].clip_id,
                'Função': department.leaders[0].position_name_pt,
                'dia3': date.date().toString(),
                'mes3': (date.month() + 1).toString(),
                'undefined_5': date.year().toString(),
            }
            if (person.phones !== undefined) {
                data['Telefone'] = person.phones.phone;
            }
            fields.forEach( field => {
                const name = field.get( PDFName.of( 'T' ));
                if ( name ) {
                    //console.log(name)
                    //console.log(field)
                    const newValue = data[ name.value ];
                    if (newValue
                        && name.value === 'Novo utilizador não dispõe de identificador CLIP') {
                        field.set( PDFName.of( 'V' ), PDFName.of( newValue ));
                        field.set( PDFName.of( 'Ff' ), PDFNumber.of( 1 ));
                        field.set( PDFName.of( 'AS' ), PDFName.of( newValue ));
                    } else if ( newValue ) {
                        field.set( PDFName.of( 'V' ), PDFString.of( newValue ));
                        field.set( PDFName.of( 'Ff' ), PDFNumber.of( 1 ));
                    }
                }
            });
            const filledPDF = await previousPDFDoc.save();
            download(filledPDF, "filled_correio_electronico_funcionario_v2.pdf",
                "application/pdf");
        },
        getDepartments () {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'departments';
                return subUtil.getPublicInfo(vm, urlSubmit, 'departments');
            }
        },

    },
}
</script>

<style scoped>
.highlight-text {
    font-size: 1.2em;
    color: green;
}
</style>