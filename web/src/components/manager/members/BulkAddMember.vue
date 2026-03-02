<template>
<v-card>
    <v-card-title>
        Bulk Add Members
    </v-card-title>
    <v-form ref="form"
        @submit.prevent="submitForm()">
        <v-container fluid>
            <!--{{ unitData }} -->
            <v-row>
            <!-- {{ data }} -->
                <v-col cols="12">
                    <v-btn
                        color="primary"
                        dark
                        large
                        @click="addLine()"
                        class="mb-4"
                    >
                        Add new line
                    </v-btn>
                </v-col>
            </v-row>
            <v-row v-for="(member, i) in $v.data.$each.$iter" :key="i" dense>
                <v-col cols="12"> <h3>New Member {{ parseInt(i)+1 }}</h3></v-col>
                <v-col cols="2">
                    <v-row dense>
                        <v-col cols="12">
                            <v-text-field
                                v-model="member.name.$model"
                                :error="member.name.$error"
                                label="Name"
                                required
                            ></v-text-field>
                            <div v-if="member.name.$error">
                                <div v-if="!member.name.required">
                                    <p class="caption red--text">A name is required.</p>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12">
                            <v-text-field
                                v-model="member.colloquial_name.$model"
                                :error="member.colloquial_name.$error"
                                label="Colloquial Name"
                                required
                            ></v-text-field>
                            <div v-if="member.colloquial_name.$error">
                                <div v-if="!member.colloquial_name.required">
                                    <p class="caption red--text">A colloquial name is required.</p>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="2">
                    <v-row dense>
                        <v-col cols="12">
                            <v-text-field
                                v-model="member.email.$model"
                                :error="member.email.$error"
                                label="Institutional email"
                                required
                            ></v-text-field>
                            <div v-if="member.email.$error">
                                <div v-if="!member.email.required">
                                    <p class="caption red--text">An email is required.</p>
                                </div>
                                <div v-if="!member.email.email">
                                    <p class="caption red--text">Email is not valid.</p>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12">
                            <v-text-field
                                v-model="member.username.$model"
                                :error="member.username.$error"
                                label="Username">
                            </v-text-field>
                            <div v-if="member.username.$error">
                                <div v-if="!member.username.isUnique">
                                    <p class="caption red--text">Username already taken.</p>
                                </div>
                                <div v-if="!member.username.required">
                                    <p class="caption red--text">A username is required.</p>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="1">
                    <v-row dense>
                        <v-col cols="12">
                            <v-select v-model="member.$model.gender"
                            :items="genders" item-value="id" item-text="value"
                            label="Gender">
                        </v-select>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12">
                            <v-text-field
                                v-model="member.$model.ciencia_id"
                                label="Ciência ID (wwww-wwww-wwww)"
                                required
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="2">
                    <v-row dense>
                        <v-col cols="12">
                            <v-select v-model="member.$model.current_position.group_id"
                                :items="groups" item-value="id" item-text="name"
                                @change="changeLabsList(unitId, member.$model.current_position.group_id, i)"
                                label="Group">
                            </v-select>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12">
                            <v-select v-model="member.$model.current_position.lab_id"
                                :items="member.$model.labs" item-value="id" item-text="name"
                                label="Lab">
                            </v-select>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="1">
                    <v-row dense>
                        <v-col cols="12">
                            <v-select v-model="member.$model.current_position.lab_position_id"
                                :items="labPositions" item-value="id" item-text="name_en"
                                label="Position"
                            ></v-select>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12">
                            <v-menu ref="member.$model.current_position.show_valid_from"
                                v-model="member.$model.current_position.show_valid_from"
                                :close-on-content-click="false"
                                :nudge-right="10"
                                transition="scale-transition"
                                offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="member.$model.current_position.valid_from"
                                        label="From" v-on="on">
                                    </v-text-field>
                                </template>
                                <v-date-picker v-model="member.$model.current_position.valid_from"
                                        @input="member.$model.current_position.show_valid_from = false"
                                        no-title></v-date-picker>
                            </v-menu>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="1">
                    <v-row dense>
                        <v-col cols="12">
                            <v-text-field v-model="member.$model.current_position.dedication"
                                label="Dedication (%)"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12">
                            <v-select v-model="member.pole_id.$model"
                                :error="member.pole_id.$error"
                                :items="poles" item-value="id" item-text="city"
                                label="Pole"
                            ></v-select>
                            <div v-if="member.pole_id.$error">
                                <div v-if="!member.pole_id.required">
                                    <p class="caption red--text">A pole is required.</p>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="2">
                    <v-row dense>
                        <v-col cols="12">
                            <v-select
                                v-model="member.$model.professional_situation.situation_id"
                                @change="updateViewCategories(member.$model.professional_situation.situation_id, i)"
                                :items="situationsCategories.situations"
                                item-value="id" item-text="name_en"
                                label="Prof. Situations">
                            </v-select>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12">
                            <v-select v-model="member.$model.professional_situation.category_id"
                                :items="member.$model.categoriesFiltered"
                                item-value="category_id" item-text="category_name_en"
                                label="Prof. Categories">
                            </v-select>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="1">
                    <v-row dense>
                        <v-col cols="12">
                            <v-text-field v-model="member.$model.professional_situation.organization"
                                label="Organization"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12">
                            <v-menu ref="member.$model.professional_situation.show_valid_from"
                                v-model="member.$model.professional_situation.show_valid_from"
                                :close-on-content-click="false"
                                :nudge-right="10"
                                transition="scale-transition"
                                offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="member.$model.professional_situation.valid_from"
                                        label="From" v-on="on">
                                    </v-text-field>
                                </template>
                                <v-date-picker v-model="member.$model.professional_situation.valid_from"
                                        @input="member.$model.professional_situation.show_valid_from = false"
                                        no-title></v-date-picker>
                            </v-menu>
                        </v-col>
                    </v-row>
                    <v-row dense>
                        <v-col cols="12">
                            <v-btn
                                icon
                                color="red"
                                @click="data.splice(i, 1)">
                            <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="12">
                    <v-divider class="blue mb-1"></v-divider>
                    <v-divider class="blue"></v-divider>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-btn v-if="data.length > 0"
                        color="primary"
                        dark
                        large
                        @click="addLine()"
                        class="mb-4"
                    >
                        Add new line
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
        <v-card-actions>
            <v-container fluid>
                <v-row>
                    <v-col cols="6" sm="4">
                        <v-btn type="submit"
                            outlined
                            color="blue darken-1"
                            text
                        >
                            Add new members
                        </v-btn>
                    </v-col>
                    <v-col cols="2" sm="1">
                        <v-progress-circular indeterminate
                                v-show="progress"
                                :size="20" :width="2"
                                color="primary"></v-progress-circular>
                        <v-icon v-show="success" color="green">mdi-check</v-icon>
                        <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-actions>
    </v-form>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'
import { required, email } from 'vuelidate/lib/validators';

export default {
    props: {
        segmentType: String,
        unitId: Number,
        unitData: Object,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            data: [],
            genders: [
                {id: 'M', value: 'Male'},
                {id: 'F', value: 'Female'},
            ],
            poles: [],
            units: [],
            groups: [],
            labPositions: [],
            situationsCategories: {},

        }
    },
    mounted () {
        this.initialize();
    },
    watch: {
        unitId () {
            this.initialize();
        },
        cityId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            this.data = [];
            this.getUnits();
            this.getLabPositions();
            this.getSituationsCategories();
            this.getPoles();
        },
        getPoles() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'poles';
                return subUtil.getPublicInfo(vm, urlSubmit, 'poles');
            }
        },
        getGroups(unit_id) {
            let now  = time.moment();
            let unitsClone = JSON.parse(JSON.stringify(this.units))
            for (let indUnit in unitsClone) {
                if (unitsClone[indUnit].id === unit_id) {
                    let unit_group_altered = [];
                    for (let indItem in unitsClone[indUnit].groups) {
                        if (unitsClone[indUnit].groups[indItem].finished !== null &&
                            time.moment(unitsClone[indUnit].groups[indItem].finished).isBefore(now)) {
                                unitsClone[indUnit].groups[indItem].name = '(Closed) ' +
                                unitsClone[indUnit].groups[indItem].name
                        }
                        unit_group_altered.push(unitsClone[indUnit].groups[indItem])
                    }
                    unit_group_altered.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
                    this.$set(this, 'groups', unit_group_altered);
                    break;
                }
            }
        },
        getUnits() {
            let vm = this;
            subUtil.getPublicInfo(vm, 'api/v2/' + 'units', 'units')
            .then(() => {
                vm.getGroups(vm.unitId);
            })
        },
        getLabPositions () {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'lab-positions';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labPositions');
            }
        },
        getSituationsCategories() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'situations-categories';
                return subUtil.getPublicInfo(vm, urlSubmit, 'situationsCategories');
            }
        },
        changeLabsList(unit_id, group_id, ind) {
            let now  = time.moment();
            let unitsClone = JSON.parse(JSON.stringify(this.units))
            for (let indUnit in unitsClone) {
                if (unitsClone[indUnit].id === unit_id) {
                    for (let indGroup in unitsClone[indUnit].groups) {
                        if (unitsClone[indUnit].groups[indGroup].id === group_id) {
                            let unit_group_lab_altered = [];
                            for (let indItem in unitsClone[indUnit].groups[indGroup].labs) {
                                if (unitsClone[indUnit].groups[indGroup].labs[indItem].finished !== null &&
                                    time.moment(unitsClone[indUnit].groups[indGroup].labs[indItem].finished).isBefore(now)) {
                                        unitsClone[indUnit].groups[indGroup].labs[indItem].name = '(Closed) ' +
                                        unitsClone[indUnit].groups[indGroup].labs[indItem].name
                                }
                                unit_group_lab_altered.push(unitsClone[indUnit].groups[indGroup].labs[indItem])
                            }
                            unit_group_lab_altered.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
                            this.$set(this.data[ind],
                                'labs',
                                unit_group_lab_altered);
                            this.$set(this.data[ind].current_position, 'lab_id', null);
                            break;
                        }
                    }
                    break;
                }
            }
        },
        updateViewCategories (situation_id, ind) {
            let categoriesFiltered = [];
            if (situation_id !== undefined
                    && situation_id !== null) {
                for (let ind in this.situationsCategories.relationships) {
                    if (this.situationsCategories.relationships[ind].situation_id === situation_id) {
                        categoriesFiltered.push(this.situationsCategories.relationships[ind]);
                    }
                }
                this.$set(this.data[ind], 'categoriesFiltered', categoriesFiltered);
            } else {
                this.$set(this.data[ind], 'categoriesFiltered', []);
            }
        },
        addLine() {
            this.data.push({
                name: '',
                colloquial_name: '',
                email: '',
                username: '',
                gender: null,
                ciencia_id: null,
                current_position: {group_id: null, lab_id: null, lab_position_id: null},
                pole_id: null,
                professional_situation: {
                    situation_id: null,
                    category_id: null,
                    organization: null,
                    dedication: null,
                    valid_from: null,
                    valid_until: null,
                },
                categoriesFiltered: [],
                labs: [],
            })
        },
        submitForm() {
            this.$v.$touch();
            if (this.$v.$invalid) {
                console.log('Error in filling form');
            } else {
                this.progress = true;
                let urlCreate = [];
                if (this.$store.state.session.loggedIn) {
                    let url = 'api/managers/' + this.$store.state.session.userID
                    if (this.unitId) {
                        url = url + '/units/' + this.unitId
                    }
                    if (this.cityId) {
                        url = url + '/cities/' + this.cityId
                    }
                    url = url + '/bulk-members'
                    for (let ind in this.data) {
                        this.data[ind].changedBy = this.$store.state.session.userID;
                        this.data[ind].unitData = this.unitData;
                        urlCreate.push({
                            url: url,
                            body: this.data[ind],
                        });
                    }
                    Promise.all(
                        urlCreate.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .then( () => {
                        this.progress = false;
                        this.success = true;
                        setTimeout(() => {
                            this.success = false;
                            //this.data = [];
                        }, 1500);

                    })
                    .catch((error) => {
                        this.progress = false;
                        this.error = true;
                        setTimeout(() => {this.error = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    })

                }
            }
        },
    },
    validations: {
        data: {
            $each: {
                name: { required },
                colloquial_name: { required },
                username: {
                    required,
                    isUnique (value) {
                        if (this.$store.state.session.loggedIn && value !== undefined) {
                            if (value.length > 0) {
                                let urlSubmit = 'api/people/'
                                        + this.$store.state.session.personID
                                        + '/users/' + value;
                                return subUtil.getInfoPopulate(this, urlSubmit, true, true)
                                .then( (result) => {
                                    if (result.valid) {
                                        return result.valid;
                                    } else {
                                        return false;
                                    }
                                })
                                .catch((error) => {
                                    console.log(error)
                                    return false;
                                });
                            } else {
                                return true;
                            }


                        } else {
                            return false;
                        }
                    },
                },
                email: {
                    required,
                    email,
                },
                pole_id: { required },
            }
        }
    }


}

</script>

<style scoped>
</style>