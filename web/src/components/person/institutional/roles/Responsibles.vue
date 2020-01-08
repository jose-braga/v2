<template>
<v-form ref="form"
    @submit.prevent="submitForm">
    <v-row>
        <v-col>
            <v-btn small outlined
                @click="addItem(data.responsibles)">
                Add responsible
            </v-btn>
        </v-col>
    </v-row>
    <v-row 
        v-for="(v,i) in data.responsibles"
        :key="i">
        <v-col cols="12" sm="5">
            <v-autocomplete
                v-model="v.responsible_id"
                :loading="loadingPeople"
                :items="people" item-value="id" item-text="colloquial_name"
                :search-input.sync="v.responsible_search"
                cache-items
                flat
                hide-no-data
                hide-details
                label="Responsible">
            </v-autocomplete>
        </v-col>
        <v-col cols="12" sm="3">
            <v-menu ref="v.show_date_start" v-model="v.show_date_start"
                :close-on-content-click="false"
                :nudge-right="10"
                transition="scale-transition"
                offset-y min-width="290px">
                <template v-slot:activator="{ on }">
                    <v-text-field v-model="v.valid_from"
                        label="Started" v-on="on">
                    </v-text-field>
                </template>
                <v-date-picker v-model="v.valid_from"
                        @input="v.show_date_start = false"
                        no-title></v-date-picker>
            </v-menu>
        </v-col>
        <v-col cols="12" sm="3">
            <v-menu ref="v.show_date_end" v-model="v.show_date_end"
                :close-on-content-click="false"
                :nudge-right="10"
                transition="scale-transition"
                offset-y min-width="290px">
                <template v-slot:activator="{ on }">
                    <v-text-field v-model="v.valid_until"
                        label="Ended" v-on="on">
                    </v-text-field>
                </template>
                <v-date-picker v-model="v.valid_until"
                        @input="v.show_date_end = false"
                        no-title></v-date-picker>
            </v-menu>
        </v-col>
        <v-col cols="12" sm="1">
            <v-btn icon @click="removeItem(data.responsibles, i)" class="mt-3">
                <v-icon color="red darken">mdi-delete</v-icon>
            </v-btn>
        </v-col>
    </v-row>
    <v-row align="center" justify="end">
        <div>
            <v-btn type="submit" outlined color="blue">
                Save
            </v-btn>
        </div>     
        <div class="request-status-container">
            <v-progress-circular indeterminate
                    v-show="progress"
                    :size="20" :width="2"
                    color="primary"></v-progress-circular>
            <v-icon v-show="success" color="green">mdi-check</v-icon>
            <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
        </div>
    </v-row>
</v-form>
</template>

<script>
import time from '../../../common/date-utils'
import subUtil from '../../../common/submit-utils'

var processResponsibles = function(vm, result) {
    let responsibles = [];
    for (let ind in result) {
        result[ind].show_date_start = false;
        result[ind].show_date_end = false;
        result[ind].responsible_search = result[ind].colloquial_name;
        result[ind].valid_from = time.momentToDate(result[ind].valid_from);
        result[ind].valid_until = time.momentToDate(result[ind].valid_until);
        responsibles.push(result[ind]);
    }
    return {responsibles};
}

export default {
    props: {
        personId: Number,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            data: {
                responsibles: [],
            },
            toDelete: [],
            people: [],
            loadingPeople: false,
        }
    },
    mounted() {
        this.initialize();
        this.getPeople();
    },
    watch: {
        personId () {
            this.initialize();
        },
    },
    methods: {
        initialize() {
            if (this.$store.state.session.loggedIn) {
                let urlSubmit = 'api/people/' + this.personId + '/responsibles';
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    this.data = processResponsibles(this, result);
                });
            } else {
                this.$refs.form.reset();
            }
        },
        submitForm() {
            if (this.$store.state.session.loggedIn) {
                let urlCreate = [];
                let urlDelete = [];
                let urlUpdate = [];
                this.progress = true;
                for (let ind in this.data.responsibles) {
                    if (this.data.responsibles[ind].id === 'new') {
                        urlCreate.push({
                            url: 'api/people/' + this.personId + '/responsibles',
                            body: this.data.responsibles[ind],
                        });
                    } else {
                        urlUpdate.push({
                            url: 'api/people/' + this.personId
                                    + '/responsibles/' + this.data.responsibles[ind].id,
                            body: this.data.responsibles[ind],
                        });
                    }
                }
                for (let ind in this.toDelete) {
                    urlDelete.push('api/people/' + this.personId
                            + '/responsibles/' + this.toDelete[ind].id);
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
                    this.initialize();
                }))
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
        getPeople() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'people';
                return subUtil.getPublicInfo(vm, urlSubmit, 'people', 'colloquial_name');
            }
        },
        addItem(list) {
            list.push({
                id: 'new', 
                person_id: this.personId,
                responsible_id: null,
                valid_from: null, 
                valid_until: null,
                show_date_start: false, 
                show_date_end: false
            });
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