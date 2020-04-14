<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Pre-register new member</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <ul>
            <li>Username field is used for credentials, e.g.: <i>johnsmith</i>. DO NOT USE SPACES!</li>
            <li>After pressing "Pre-register", the new user will receive an email with a link for a form in which additional data is filled.</li>
            <li>Finally, a member from the Science Management will approve the new registration.</li>
        </ul>
    </v-card-text>
    <v-container class="px-6">
        <v-form ref="form"
                @submit.prevent="submitForm">
            <v-row>
                <v-col cols="12" md="6">
                    <v-text-field
                        v-model="data.person.username"
                        label="Username">
                    </v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field
                        v-model="data.person.email"
                        label="Personal email">
                    </v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="6">
                    <v-select v-model="data.person.lab_id"
                        :items="myLabs"
                        item-value="id" item-text="name"
                        label="Lab/Office">
                    </v-select>
                </v-col>
                <v-col cols="12" md="6">
                    <v-select v-model="data.person.lab_position_id"
                        :items="labPositions"
                        item-value="id" item-text="name_en"
                        label="Position">
                    </v-select>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="6">
                    <v-text-field
                        v-model="data.person.dedication"
                        label="Dedication (%)">
                    </v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-select v-model="data.person.city_id"
                        :items="poles" item-value="id" item-text="city"
                        label="Institution Pole">
                    </v-select>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="6">
                    <v-menu ref="data.person.show_valid_from" v-model="data.person.show_valid_from"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="data.person.valid_from"
                                label="Start" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="data.person.valid_from"
                                @input="data.person.show_valid_from = false"
                                no-title></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="6">
                    <v-menu ref="data.person.show_valid_until" v-model="data.person.show_valid_until"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="data.person.valid_until"
                                label="End" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="data.person.valid_until"
                                @input="data.person.show_valid_until = false"
                                no-title></v-date-picker>
                    </v-menu>
                </v-col>
            </v-row>
            <v-row align-content="center" justify="end">
                <v-col cols="3" v-if="formError">
                    <v-row justify="end">
                        <p class="caption red--text">Unable to submit form.</p>
                    </v-row>
                </v-col>
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Pre-Register</v-btn>
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
        </v-form>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '../../common/submit-utils'

export default {
    props: {
        labId: Number,
        labData: Object,
        labPositions: Array,
        myLabs: Array,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            data: {
                person: {},
            },
            poles: [],
            labs: [],
            //labPositions: [],
        }
    },
    mounted() {
        this.getPoles();
        this.getLabs();

    },
    methods: {
        submitForm () {
            let urlCreate = [];
            if (this.$store.state.session.loggedIn) {
                urlCreate.push({
                    url: 'api/labs/' + this.labId
                            + '/people',
                    body: this.data.person,
                });
                this.$http.all(
                    urlCreate.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                )
                .then(this.$http.spread( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.$refs.form.reset();
                }))
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })

            }

        },
        getPoles () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'poles';
                return subUtil.getPublicInfo(vm, urlSubmit, 'poles');
            }
        },
        getLabs() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'labs';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labs');
            }
        },
    },
}
</script>

<style scoped>

</style>