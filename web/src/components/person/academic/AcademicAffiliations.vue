<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Affiliations to Academic Institutions</h3>
        </div>
    </v-card-title>
    <v-card-text class="px-4">
        <v-form ref="form"
            @submit.prevent="submitForm">
            <p v-if="data.academicAffiliations.length === 0">
                No data.
            </p>
            <div v-for="(department, i) in data.academicAffiliations"
                :key="i">
                <v-row align="center" class="px-2">
                    <v-col cols="12" sm="4">
                        <v-select
                            v-model="department.department_id"
                            :items="departments" item-value="id" item-text="short_str_department_en"
                            label="Academic Institution">
                        </v-select>
                    </v-col>
                    <v-col cols="12" sm="3">
                        <v-menu ref="department.show_date_start"
                            v-model="department.show_date_start"
                            :close-on-content-click="false"
                            :nudge-right="10"
                            transition="scale-transition"
                            offset-y min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="department.valid_from"
                                    label="Started" v-on="on">
                                </v-text-field>
                            </template>
                            <v-date-picker v-model="department.valid_from"
                                    @input="department.show_date_start = false"
                                    no-title></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="12" sm="3">
                        <v-menu ref="department.show_date_end"
                            v-model="department.show_date_end"
                            :close-on-content-click="false"
                            :nudge-right="10"
                            transition="scale-transition"
                            offset-y min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="department.valid_until"
                                    label="Ended" v-on="on">
                                </v-text-field>
                            </template>
                            <v-date-picker v-model="department.valid_until"
                                    @input="department.show_date_end = false"
                                    no-title></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="1">
                        <v-btn icon @click.stop="removeItem(data.academicAffiliations, i)">
                            <v-icon color="red darken">mdi-delete</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
                <v-divider v-if="i < data.academicAffiliations.length - 1"></v-divider>
            </div>
            <v-row class="ml-4">
                <v-btn outlined @click="addItem()">
                    Add an affiliation
                </v-btn>
            </v-row>
            <v-row align-content="center" justify="end" class="mb-1">
                <v-col cols="3" v-if="formError">
                    <v-row justify="end">
                        <p class="caption red--text">Unable to submit form.</p>
                    </v-row>
                </v-col>
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Update</v-btn>
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
    </v-card-text>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Workplace location</h3>
        </div>
    </v-card-title>
    <v-card-text class="px-4">
        <p>
            Fill in if in "Affiliations to Academic Institutions" you do not find your
            institution (or other situations).
        </p>
        <v-form ref="formWorkplace"
            @submit.prevent="submitWorkplace"
        >
            <v-row align="center">
                <v-col cols="12">
                    <v-text-field
                        v-model="data.workplace.workplace"
                        label="Workplace (Organization and/or address)">
                    </v-text-field>
                </v-col>
            </v-row>
            <v-row align-content="center" justify="end" class="mb-1">
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Update</v-btn>
                    </v-row>
                </v-col>
                <v-col cols="1">
                    <v-progress-circular indeterminate
                            v-show="progressWork"
                            :size="20" :width="2"
                            color="primary"></v-progress-circular>
                    <v-icon v-show="successWork" color="green">mdi-check</v-icon>
                    <v-icon v-show="errorWork" color="red">mdi-alert-circle-outline</v-icon>
                </v-col>
            </v-row>
        </v-form>
    </v-card-text>
</v-card>

</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

export default {
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            progressWork: false,
            successWork: false,
            errorWork: false,
            departments: [],
            data: {
                academicAffiliations: [],
                workplace: {},
            },
            toDelete: [],
        }
    },
    mounted () {
        this.initialize();
        this.getDepartments();
    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                subUtil.getInfoPopulate(this, 'api/people/' + personID + '/academic-affiliations', true)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    for (let ind in result) {
                        this.$set(this.data.academicAffiliations, ind, {});
                        Object.keys(result[ind]).forEach(key => {
                            let value = result[ind][key];
                            if (key === 'valid_from' || key === 'valid_until') {
                                value = time.momentToDate(value);
                            }
                            this.$set(this.data.academicAffiliations[ind], key, value);
                        });
                    }
                })
                subUtil.getInfoPopulate(this, 'api/people/' + personID + '/workplaces', false)
                .then( (result) => {
                    if (result !== undefined) {
                        this.data.workplace = result;
                    }

                })
            } else {
                this.$refs.form.reset();
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreate = [];
                let urlDelete = [];
                let urlUpdate = [];
                let personID = this.$store.state.session.personID;
                let affiliations = this.data.academicAffiliations;
                for (let ind in affiliations) {
                    if (affiliations[ind].id === 'new') {
                        affiliations[ind].person_id = personID;
                        urlCreate.push({
                                url: 'api/people/' + personID + '/academic-affiliations',
                                body: affiliations[ind],
                            });

                    } else {
                        urlUpdate.push({
                                url: 'api/people/' + personID
                                        + '/academic-affiliations/' + affiliations[ind].id,
                                body: affiliations[ind],
                            });
                    }
                }
                for (let ind in this.toDelete) {
                    urlDelete.push('api/people/' + personID
                                + '/academic-affiliations/' + this.toDelete[ind].id);
                }
                Promise.all(
                    urlUpdate.map(el =>
                        this.$http.put(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                    .concat(
                        urlCreate.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            })))
                    .concat(
                        urlDelete.map(el =>
                            this.$http.delete(el,
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            })))
                )
                .then( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.toDelete = [];
                    this.initialize();
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    this.toDelete = [];
                    this.initialize();
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        submitWorkplace () {
            if (this.$store.state.session.loggedIn) {
                this.progressWork = true;
                let urlCreate = [];
                let urlUpdate = [];
                let personID = this.$store.state.session.personID;
                if (this.data.workplace.id === undefined) {
                    urlCreate.push({
                        url: 'api/people/' + personID + '/workplaces',
                        body: this.data.workplace,
                    });
                } else {
                    urlUpdate.push({
                        url: 'api/people/' + personID + '/workplaces/'
                            + this.data.workplace.id,
                        body: this.data.workplace,
                    });

                }
                Promise.all(
                    urlUpdate.map(el =>
                        this.$http.put(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                    .concat(
                        urlCreate.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            })))
                )
                .then( () => {
                    this.progressWork = false;
                    this.successWork = true;
                    setTimeout(() => {this.successWork = false;}, 1500)
                    this.initialize();
                })
                .catch((error) => {
                    this.progressWork = false;
                    this.errorWork = true;
                    this.initialize();
                    setTimeout(() => {this.errorWork = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        getDepartments () {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'departments';
                return subUtil.getPublicInfo(vm, urlSubmit, 'departments');
            }
        },
        addItem() {
            this.data.academicAffiliations.push({id: 'new', department_id: null,
                valid_from: null, valid_until: null});
        },
        removeItem(list, ind) {
            if (list[ind].id !== 'new') {
                this.toDelete.push(list[ind]);
            }
            list.splice(ind, 1);
        },
    }

}
</script>

<style scoped>

</style>