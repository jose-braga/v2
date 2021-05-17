<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Cost Centers</h3>
        </div>
    </v-card-title>
    <v-card-text class="px-4">
        <v-form ref="form"
                @submit.prevent="submitForm">
            <p v-if="data.costCenters.length === 0">
                No data.
            </p>
            <div v-for="(cc, i) in data.costCenters"
                :key="i">
                <v-row align="center" class="px-2">
                    <v-col cols="12" sm="4">
                        <v-select v-model="cc.cost_center_id"
                            :items="costCenters" item-value="id" item-text="short_name"
                            label="Cost Center">
                        </v-select>
                    </v-col>
                    <v-col cols="12" sm="3">
                        <v-menu ref="cc.show_date_start" v-model="cc.show_date_start"
                            :close-on-content-click="false"
                            :nudge-right="10"
                            transition="scale-transition"
                            offset-y min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="cc.valid_from"
                                    label="From" v-on="on">
                                </v-text-field>
                            </template>
                            <v-date-picker v-model="cc.valid_from"
                                    @input="cc.show_date_start = false"
                                    no-title></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="12" sm="3">
                        <v-menu ref="cc.show_date_end" v-model="cc.show_date_end"
                            :close-on-content-click="false"
                            :nudge-right="10"
                            transition="scale-transition"
                            offset-y min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="cc.valid_until"
                                    label="Until" v-on="on">
                                </v-text-field>
                            </template>
                            <v-date-picker v-model="cc.valid_until"
                                    @input="cc.show_date_end = false"
                                    no-title></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="2">
                        <v-btn icon @click.stop="removeItem(data.costCenters, i)">
                            <v-icon color="red darken">mdi-delete</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
                <v-divider v-if="i < data.costCenters.length - 1"></v-divider>
            </div>
            <v-row class="ml-4">
                <v-btn outlined @click="addItem()">
                    Add cost center
                </v-btn>
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
</v-card>
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
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            data: {
                costCenters: [],
            },
            toDelete: [],
            costCenters: [],
        }
    },
    watch: {
        personId () {
            this.initialize();
        },
    },
    created () {
        this.initialize();
        this.getCostCenters();
    },
    methods: {
        initialize () {
            this.data.costCenters = [];
            if (this.$store.state.session.loggedIn) {
                let personID = this.personId;
                subUtil.getInfoPopulate(this, 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/cost-centers', true)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    for (let ind in result) {
                        this.$set(this.data.costCenters, ind, {});
                        Object.keys(result[ind]).forEach(key => {
                            let value = result[ind][key];
                            if (key === 'valid_from' || key === 'valid_until') {
                                value = time.momentToDate(value);
                            }
                            this.$set(this.data.costCenters[ind], key, value);
                        });
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
                let personID = this.personId;
                let costCenters = this.data.costCenters;
                for (let ind in costCenters) {
                    if (costCenters[ind].id === 'new') {
                        costCenters[ind].person_id = personID;
                        urlCreate.push({
                                url: 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/cost-centers',
                                body: costCenters[ind],
                            });

                    } else {
                        urlUpdate.push({
                                url: 'api' + this.endpoint
                                    + '/members'
                                    + '/' + personID
                                    + '/cost-centers/' + costCenters[ind].id,
                                body: costCenters[ind],
                            });
                    }
                }
                for (let ind in this.toDelete) {
                    urlDelete.push('api' + this.endpoint
                                + '/members'
                                + '/' + personID
                                + '/cost-centers/' + this.toDelete[ind].id);
                }
                this.$http.all(
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
                .then(this.$http.spread( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.toDelete = [];
                    this.initialize();
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
        getCostCenters () {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'cost-centers';
                return subUtil.getPublicInfo(vm, urlSubmit, 'costCenters');
            }
        },
        addItem() {
            this.data.costCenters.push({id: 'new', cost_center_id: null,
                valid_from: null, valid_until: null});
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

<style>

</style>