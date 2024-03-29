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
                {{team.team_name}}:
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
            <v-row align-content="center" justify="end" class="mb-1">
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
        labId: Number,
        depTeamId: Number,
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
            let urlSubmit
            if (this.labId !== undefined) {
                urlSubmit = 'api/labs/' + this.labId + '/spaces/' + this.spaceId;
            }
            if (this.depTeamId !== undefined) {
                urlSubmit = 'api/department-teams/' + this.depTeamId + '/spaces/' + this.spaceId;
            }
            subUtil.getInfoPopulate(this, urlSubmit, true)
            .then( (result) => {
                for (let ind in result.labs) {
                    result.labs[ind].valid_from = time.momentToDate(result.labs[ind].valid_from);
                    result.labs[ind].valid_until = time.momentToDate(result.labs[ind].valid_until);
                    if (this.labId !== undefined) {
                        if (result.labs[ind].lab_id === this.labId) {
                            result.labs[ind].can_edit = true;
                        }
                    }
                    if (this.depTeamId !== undefined) {
                        if (result.labs[ind].team_id === this.depTeamId) {
                            result.labs[ind].can_edit = true;
                        }
                    }
                }
                this.spaceDetails = result;
            })
        },
        submitForm () {
            this.progress = true;
            let urlUpdateLab = [];
            for (let ind in this.spaceDetails.labs) {
                let datum = this.spaceDetails.labs[ind];
                let url;
                if (this.labId !== undefined) {
                    url = 'api/labs/' + this.labId
                        + '/spaces/' + this.spaceId;
                }
                if (this.depTeamId !== undefined) {
                    url = 'api/department-teams/' + this.depTeamId
                        + '/spaces/' + this.spaceId;
                }
                urlUpdateLab.push({
                    url: url,
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
                this.$root.$emit('updateLabSpaceTable')
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