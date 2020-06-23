<template>
<v-container>
    <v-form ref="form"
        @submit.prevent="submitForm">
        <p v-if="data.cars.length === 0">
            No data.
        </p>
        <div v-for="(car, i) in data.cars"
            :key="i">
            <v-row align="center">
                <v-col cols="12" sm="2">
                    <v-text-field
                        v-model="car.license"
                        label="Driver's license ID">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="3">
                    <v-text-field
                        v-model="car.brand"
                        label="Brand (e.g. Porsche, Ferrari)">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-text-field
                        v-model="car.model"
                        label="Model (e.g. 911)">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-text-field
                        v-model="car.color"
                        label="Color">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-text-field
                        v-model="car.plate"
                        label="Plate ID (e.g. 00-AA-00)">
                    </v-text-field>
                </v-col>
                <v-col cols="1">
                    <v-btn icon @click.stop="removeItem(data.cars, i)">
                        <v-icon color="red darken">mdi-delete</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-divider v-if="i < data.cars.length - 1"></v-divider>
        </div>
        <v-row>
            <v-btn class="ml-2" outlined @click="addItem()">
                Add another car
            </v-btn>
            <v-dialog
                v-model="dialog"
                width="500"
            >
                <template v-slot:activator="{ on }">
                    <v-btn
                        outlined
                        color="red"
                        v-on="on"
                        class="ml-4"
                        >
                        Notify responsible
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title
                        class="headline grey lighten-2"
                        primary-title
                    >
                        Car change: Notify a responsible
                    </v-card-title>
                    <v-form ref="emailForm"
                            @submit.prevent="submitEmailForm">
                        <v-textarea
                            v-model="message"
                            auto-grow
                            label="Observations to be sent"
                            rows="2"
                            class="pa-2 pt-4"
                        ></v-textarea>
                        <v-card-actions>
                            <v-btn text type="submit">Send</v-btn>
                            <div class="request-status-container">
                                <v-progress-circular indeterminate
                                        v-show="progressEmail"
                                        :size="20" :width="2"
                                        color="primary"></v-progress-circular>
                                <v-icon v-show="successEmail" color="green">mdi-check</v-icon>
                                <v-icon v-show="errorEmail" color="red">mdi-alert-circle-outline</v-icon>
                            </div>
                        </v-card-actions>
                    </v-form>
                </v-card>
            </v-dialog>
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
</v-container>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    props: {
        otherPersonId: Number,
        currentPerson: Object,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            progressEmail: false,
            successEmail: false,
            errorEmail: false,
            formError: false,
            emailFormError: false,
            dialog: false,
            message: '',
            cardTypes: [],
            data: {
                cars: [],
            },
            toDelete: [],
        }
    },
    watch: {
        otherPersonId () {
            this.initialize();
        },
    },
    mounted () {
        this.initialize();
    },
    methods: {
        initialize () {
            this.data.cars = [];
            if (this.$store.state.session.loggedIn) {
                subUtil.getInfoPopulate(this,
                            'api/people/'
                            + this.otherPersonId
                            + '/cars', true)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    for (let ind in result) {
                        this.$set(this.data.cars, ind, {});
                        Object.keys(result[ind]).forEach(key => {
                            let value = result[ind][key];
                            this.$set(this.data.cars[ind], key, value);
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
                let cars = this.data.cars;
                for (let ind in cars) {
                    if (cars[ind].id === 'new') {
                        cars[ind].person_id = this.otherPersonId;
                        urlCreate.push({
                                url: 'api/people/'
                                    + this.otherPersonId
                                    + '/cars',
                                body: cars[ind],
                            });

                    } else {
                        urlUpdate.push({
                                url: 'api/people/'
                                    + this.otherPersonId
                                    + '/cars/' + cars[ind].id,
                                body: cars[ind],
                            });
                    }
                }
                for (let ind in this.toDelete) {
                    urlDelete.push('api/people/'
                                    + this.otherPersonId
                                    + '/cars/'
                                    + this.toDelete[ind].id);
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
        submitEmailForm () {
            if (this.$store.state.session.loggedIn) {
                this.progressEmail = true;
                this.$http.post('api/people/'
                            + this.otherPersonId
                            + '/cars-message',
                    {
                        data: {
                            message: this.message,
                            personName: this.currentPerson.name,
                        }
                    },
                    {
                        headers: {'Authorization': 'Bearer ' + localStorage['v2-token']},
                    }
                )
                .then(() => {
                    this.progressEmail = false;
                    this.successEmail = true;
                    setTimeout(() => {
                        this.successEmail = false;
                        this.dialog = false;
                    }, 1500);
                })
                .catch((error) => {
                    this.progressEmail = false;
                    this.errorEmail = true;
                    setTimeout(() => {this.error = false;}, 6000)
                    console.log(error);
                });
            }
        },
        addItem() {
            this.data.cars.push({id: 'new', license: null,
                brand: null, model: null, color: null, plate: null});
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

</style>