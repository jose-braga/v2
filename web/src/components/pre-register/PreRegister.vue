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
        </v-app-bar>
        {{$store.state.preregistration.person}}
        <div v-if="loggedIn" class="px-4">
            <v-row justify="center">
                <span class="highlight-text mt-2">Items with an asterisk (*) are required.<br>
                                                Press "Submit" at the bottom when finished!
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
                    <InstitutionalContacts ref="institutionalContacts"></InstitutionalContacts>
                </v-col>
                <v-col cols="12" md="6">
                    <Authorization ref="authorization"></Authorization>
                    <Photo ref="photo"></Photo>
                    <Labs></Labs>
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
                        <v-btn @click="submitForms"
                        outlined color="blue">Submit</v-btn>
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
import Password from './Password'
import NuclearInformation from './NuclearInformation'
import Authorization from './Authorization'
import Photo from './Photo'
import PersonalContacts from './PersonalContacts'
import InstitutionalContacts from './InstitutionalContacts'
import Labs from './Labs'

import { PDFDocument, PDFName, PDFBool,
PDFString, PDFNumber
} from 'pdf-lib'
//, StandardFonts
import download from 'downloadjs'

export default {
    components: {
        Password,
        NuclearInformation,
        Authorization,
        Photo,
        PersonalContacts,
        InstitutionalContacts,
        Labs,
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
        }
    },
    created() {
        this.checkLogin();
    },
    mounted() {},
    methods: {
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
            let data = {
                'Nome completo': person.name,
                'Novo utilizador não dispõe de identificador CLIP': 'On',
            }
            fields.forEach( field => {
                const name = field.get( PDFName.of( 'T' ));
                if ( name ) {
                    const newValue = data[ name.value ];
                    //console.log(name)
                    //console.log(field)


                    if (newValue
                        && name.value === 'Novo utilizador não dispõe de identificador CLIP') {
                        field.set( PDFName.of( 'V' ), PDFString.of( newValue ));
                        field.set( PDFName.of( 'Ff' ), PDFNumber.of( 1 ));
                        field.set( PDFName.of( 'AS' ), PDFString.of( newValue ));

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
        async submitForms() {
            let proceed = true;
            let person = this.$store.state.preregistration.person;
            //console.log(person)
            //this.fillPDF(person);
            //console.log(proceed)
            if (person.visible_public !== true) {
                proceed = confirm('You won\'t appear as a member'
                        + ' of the Research Units in their websites'
                        + ' unless you authorize that some data is made available'
                        + ' for the purposes stated in "Data visibility authorization".'
                        + ' \n\nIs this really what you want?');
            }
            if ( proceed === true
                && (this.$refs.password.$v.$invalid
                || this.$refs.nuclearInfo.$v.$invalid
                || this.$refs.personalContacts.$v.$invalid
                || this.$refs.institutionalContacts.$v.$invalid
                )) {
                this.formError = true;
                setTimeout(() => {this.formError = false;}, 3000);
            } else if (proceed === true) {
                console.log('all is fine')
                // put this inside .then after the request succeeded
                if (person.emails.requestEmail) {
                    this.fillPDF(person);
                }
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