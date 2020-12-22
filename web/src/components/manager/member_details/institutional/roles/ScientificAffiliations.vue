<template>
<v-form ref="form"
        @submit.prevent="submitForm">
    <div v-for="(pos, i) in data.current_positions"
            :key="i">
        <v-row align="center">
            <v-switch v-model="pos.integrated" class="mx-2" label="Integrated"></v-switch>
            <v-switch v-model="pos.nuclearCV" class="mx-2" label="Nuclear CV"></v-switch>
            <v-switch v-model="pos.pluriannual" class="mx-2" label="Pluriannual"></v-switch>
        </v-row>
        <v-row align="center">
            <v-col cols="12" sm="4">
                <v-select v-model="pos.groups[0].units[0].id"
                    :items="units" item-value="id" item-text="short_name"
                    @change="changeGroupsList(pos.groups[0].units[0].id, i)"
                    label="Unit">
                </v-select>
            </v-col>
            <v-col cols="12" sm="4">
                <v-select v-model="pos.groups[0].id"
                    :items="pos.unit_groups" item-value="id" item-text="name"
                    @change="changeLabsList(pos.groups[0].units[0].id, pos.groups[0].id, i)"
                    label="Group">
                </v-select>
            </v-col>
            <v-col cols="12" sm="4">
                <v-select v-model="pos.lab_id"
                    :items="pos.unit_group_labs" item-value="id" item-text="name"
                    label="Lab">
                </v-select>
            </v-col>
        </v-row>
        <v-row align="center">
            <v-col cols="12" sm="6">
                <v-select v-model="pos.lab_position_id"
                    :items="labPositions" item-value="id" item-text="name_en"
                    label="Position"
                ></v-select>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field v-model="pos.dedication"
                    label="Dedication (%)"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row align="center">
            <v-col cols="12" sm="5">
                <v-menu ref="pos.show_valid_from"
                    v-model="pos.show_valid_from"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="pos.valid_from"
                            label="From" v-on="on">
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="pos.valid_from"
                            @input="pos.show_valid_from = false"
                            no-title></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="11" sm="5">
                <v-menu ref="pos.show_valid_until"
                    v-model="pos.show_valid_until"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="pos.valid_until"
                            label="Until" v-on="on">
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="pos.valid_until"
                            @input="pos.show_valid_until = false"
                            no-title></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="1">
                <v-btn icon @click.stop="removeItem(data.current_positions, i)">
                    <v-icon color="red darken">mdi-delete</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-divider></v-divider>
    </div>
    <v-row class="mt-4">
        <v-btn class="ml-2" outlined @click="addItem()">
            Add an affiliation
        </v-btn>
    </v-row>
    <v-row  justify="end">
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
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

export default {
    props: {
        personId: Number,
        managerId: Number,
        endpoint: String,
    },
    data () {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            data: {
                current_positions: [],
                roles: [],
            },
            units: [],
            labPositions: [],
            toDelete: [],
        }
    },
    watch: {
        personId () {
            this.initialize();
        },
    },
    created () {
        this.initialize();
        this.getLabPositions();
        this.$root.$on('updateManagerRolesFromRoles',
            () => {
                this.initialize();
            }
        );
    },
    methods: {
        initialize () {
            this.data.current_positions = [];
            if (this.$store.state.session.loggedIn) {
                let personID = this.personId;
                subUtil.getInfoPopulate(this, 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/lab-affiliations', true)
                .then( (result) => {
                    for (let el in result) {
                        this.data.current_positions.push({});
                        Object.keys(result[el]).forEach(key => {
                            let value = result[el][key];
                            if (key === 'valid_from' || key === 'valid_until') {
                                value = time.momentToDate(value);
                            }
                            this.data.current_positions[el][key] = value;
                        });
                    }
                    this.data.current_positions = time.sorter(this.data.current_positions,'valid_from');
                    subUtil.getInfoPopulate(this, 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/roles', true)
                    .then( (result) => {
                        for (let el in result) {
                            this.data.roles.push({});
                            Object.keys(result[el]).forEach(key => {
                                let value = result[el][key];
                                this.data.roles[el][key] = value;
                            });
                        }
                    })
                    const urlSubmit = 'api/v2/' + 'units';
                    let vm = this;
                    subUtil.getPublicInfo(vm, urlSubmit, 'units')
                    .then( () => {
                        for (let ind in this.data.current_positions) {
                            for (let indUnit in this.units) {
                                if (this.units[indUnit].id === this.data.current_positions[ind].groups[0].units[0].id) {
                                    this.$set(this.data.current_positions[ind], 'unit_groups', this.units[indUnit].groups);
                                    for (let indGroup in this.units[indUnit].groups) {
                                        if (this.units[indUnit].groups[indGroup].id
                                                === this.data.current_positions[ind].groups[0].id) {
                                            this.$set(this.data.current_positions[ind], 'unit_group_labs', this.units[indUnit].groups[indGroup].labs);
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    })
                    ;
                })
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreate = [];
                let urlDelete = [];
                let urlUpdate = [];
                let urlCreateRoles = [];
                let personID = this.personId;
                let affiliations = this.data.current_positions;
                for (let ind in affiliations) {
                    if (affiliations[ind].id === 'new') {
                        affiliations[ind].person_id = personID;
                        urlCreate.push({
                                url: 'api' + this.endpoint
                                    + '/members'
                                    + '/' + personID + '/lab-affiliations',
                                body: affiliations[ind],
                            });
                        let roleFound = false;
                        let role_id = 1;
                        for (let indRole in this.data.roles) {
                            if (this.data.roles[indRole].role_id === role_id) {
                                roleFound = true;
                            }
                        }
                        if (!roleFound) {
                            urlCreateRoles = [
                                {
                                    url: 'api' + this.endpoint
                                        + '/members'
                                        + '/' + personID
                                        + '/roles',
                                    body: role_id,
                                }
                            ];
                        }

                    } else {
                        urlUpdate.push({
                                url: 'api' + this.endpoint
                                    + '/members'
                                    + '/' + personID
                                    + '/lab-affiliations/' + affiliations[ind].id,
                                body: affiliations[ind],
                            });
                    }
                }
                for (let ind in this.toDelete) {
                    urlDelete.push('api' + this.endpoint
                                    + '/members'
                                    + '/' + personID
                                    + '/lab-affiliations/' + this.toDelete[ind].id);
                }
                this.$http.all(
                    urlCreateRoles.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                )
                .then(this.$http.spread( () => {
                    return this.$http.all(
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
                }))
                .then(this.$http.spread( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.toDelete = [];
                    this.initialize();
                    this.$root.$emit('updateManagerRolesFromOffice')
                }))
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
        changeGroupsList(unit_id, ind) {
            for (let indUnit in this.units) {
                if (this.units[indUnit].id === unit_id) {
                    this.$set(this.data.current_positions[ind], 'unit_groups', this.units[indUnit].groups);
                    this.$set(this.data.current_positions[ind], 'unit_group_labs', []);
                    this.$set(this.data.current_positions[ind].groups[0], 'id', null);
                    break;
                }
            }
        },
        changeLabsList(unit_id, group_id, ind) {
            for (let indUnit in this.units) {
                if (this.units[indUnit].id === unit_id) {
                    for (let indGroup in this.units[indUnit].groups) {
                        if (this.units[indUnit].groups[indGroup].id === group_id) {
                            this.$set(this.data.current_positions[ind],
                                'unit_group_labs',
                                this.units[indUnit].groups[indGroup].labs);
                            this.$set(this.data.current_positions[ind], 'lab_id', null);
                            break;
                        }
                    }
                    break;
                }
            }
        },
        getLabPositions () {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'lab-positions';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labPositions');
            }
        },
        addItem() {
            this.data.current_positions.push({
                id: 'new',
                lab_position_id: null,
                valid_from: null,
                valid_until: null,
                groups: [
                    {
                        units: [{}]
                    }
                ]
            });
        },
        removeItem(list, ind) {
            if (list[ind].id !== 'new') {
                this.toDelete.push(list[ind]);
            }
            list.splice(ind, 1);
        },
    },
}
</script>

<style scoped>

li {
    margin-top: 20px;
}

.position-name {
    font-weight:bold;
    color:#000000;
}

.lab-name {
    color:#777777;
}

.unit-situation {
    color:midnightblue;
    font-size: 0.8rem;
    font-weight: 500;
}

.date-affiliation {
    font-size: 0.8rem;
}

.UCIBIO {
    color: blue;
}

.LAQV {
    color: green;
}
.unit {
    font-weight: 300;
}

</style>