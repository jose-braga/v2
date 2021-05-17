<template>
<v-card class="px-4">
    <v-form @submit.prevent="submitForm()">
        <v-card-title>
            <span> Edit data for
                    <b>{{ spaceData.reference }} - {{ spaceData.space_name_pt }}</b>
            </span>
        </v-card-title>
        <v-card-text>
            <b>Space type:</b> {{spaceDetails.space_type_name_pt}}; <b>Area:</b> {{spaceDetails.area}} m<sup>2</sup>
        </v-card-text>
        <v-container>
            <h3>Teams associated with this lab
            </h3>
            <v-row v-for="(team, i) in spaceDetails.labs"
                :key="i"
                align="center"
            >
                {{team.name}} ({{team.leaders_show}})
                <v-col cols="12" sm="2">
                    <v-text-field
                        v-model="team.percentage"
                        :disabled="team.can_edit !== true"
                        label="% Occupation">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-menu ref="date_menu"
                        v-model="team.show_valid_from"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="team.valid_from"
                                :disabled="team.can_edit !== true"
                                label="Start date" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="team.valid_from"
                            @input="team.show_valid_from = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-menu ref="menu_end_date"
                        v-model="team.show_valid_until"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="team.valid_until"
                                :disabled="team.can_edit !== true"
                                label="End date"
                                v-on="on"
                                v-bind="attrs"
                            >
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="team.valid_until"
                            @click="team.show_valid_until = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12">
                    <v-divider></v-divider>
                </v-col>
            </v-row>
            <v-row v-for="(supervisor, i) in spaceDetails.supervisors"
                :key="'sup-' + i"
                align="center"
            >
                {{supervisor.labs_show}} ({{ supervisor.colloquial_name }})
                <v-col cols="12" sm="2">
                    <v-text-field
                        v-model="supervisor.percentage"
                        :disabled="supervisor.can_edit !== true"
                        label="% Occupation">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-menu ref="date_menu"
                        v-model="supervisor.show_valid_from"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="supervisor.valid_from"
                                :disabled="supervisor.can_edit !== true"
                                label="Start date" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="supervisor.valid_from"
                            @input="supervisor.show_valid_from = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-menu ref="menu_end_date"
                        v-model="supervisor.show_valid_until"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="supervisor.valid_until"
                                :disabled="supervisor.can_edit !== true"
                                label="End date"
                                v-on="on"
                                v-bind="attrs"
                            >
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="supervisor.valid_until"
                            @click="supervisor.show_valid_until = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12">
                    <v-divider></v-divider>
                </v-col>
            </v-row>
            <v-row align-content="center" justify="end">
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
        </v-container>
    </v-form>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

export default {
    props: {
        itemId: Number,
        spaceId: Number,
        supervisorId: Number,
        spaceData: Object,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            spaceDetails: {

            },

        }
    },
    watch: {
        itemId () {
            this.initialize();
        },
    },
    mounted() {
        this.initialize();
    },
    methods: {
        initialize () {
            this.$set(this.spaceDetails, 'area', this.spaceData.area);
            let urlSubmit = 'api/people/' + this.supervisorId + '/supervisor-spaces/' + this.spaceId;
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then( (result) => {
                for (let ind in result.labs) {
                    result.labs[ind].valid_from = time.momentToDate(result.labs[ind].valid_from);
                    result.labs[ind].valid_until = time.momentToDate(result.labs[ind].valid_until);
                    let leaders_show = ''
                    for (let indLeader in result.labs[ind].leaders) {
                        leaders_show = leaders_show + result.labs[ind].leaders[indLeader].colloquial_name;
                        if (parseInt(indLeader,10) + 1 < result.labs[ind].leaders.length) {
                            leaders_show = leaders_show + ',';
                        }
                    }
                    result.labs[ind].leaders_show = leaders_show;
                }
                for (let ind in result.supervisors) {
                    result.supervisors[ind].valid_from = time.momentToDate(result.supervisors[ind].valid_from);
                    result.supervisors[ind].valid_until = time.momentToDate(result.supervisors[ind].valid_until);
                    if (result.supervisors[ind].person_id === this.supervisorId) {
                        result.supervisors[ind].can_edit = true;
                    }
                    let labs_show = ''
                    for (let indLab in result.supervisors[ind].labs) {
                        labs_show = labs_show + result.supervisors[ind].labs[indLab].name;
                        if (parseInt(indLab,10) + 1 < result.supervisors[ind].labs.length) {
                            labs_show = labs_show + ',';
                        }
                    }
                    result.supervisors[ind].labs_show = labs_show;
                }
                this.spaceDetails = result;
            })
        },
        submitForm () {
            this.progress = true;
            let urlUpdateLab = [];
            for (let ind in this.spaceDetails.supervisors) {
                let datum = this.spaceDetails.supervisors[ind];
                urlUpdateLab.push({
                    url: 'api/people/' + this.supervisorId
                        + '/supervisor-spaces/' + this.spaceId,
                    body: datum,
                });
            }
            Promise.all(
                urlUpdateLab.map(el =>
                    this.$http.put(el.url,
                        { data: el.body, },
                        { headers:
                            {'Authorization': 'Bearer ' + localStorage['v2-token']
                        },
                    }))
                )
            .then(() => {
                this.progress = false;
                this.success = true;
                setTimeout(() => {this.success = false;}, 1500)
                this.$root.$emit('updateSupervisorSpaceTable')
                //this.initialize();
            })
            .catch((error) => {
                this.progress = false;
                this.error = true;
                this.initialize();
                setTimeout(() => {this.error = false;}, 6000)
                // eslint-disable-next-line
                console.log(error)
            })
        },
    },



}
</script>

<style scoped>

</style>