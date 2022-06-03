<template>
<v-card class="mt-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Research Interests</h3>
        </div>
    </v-card-title>
    <v-card-text class="px-4">
    </v-card-text>
    <v-container>
        <v-form ref="form"
                @submit.prevent="submitForm">
            <p v-if="data.researchInterests.length === 0">
                No data.
            </p>
            <div v-for="(interest, i) in data.researchInterests"
                :key="i">
                <v-row align="center" class="px-2">
                    <v-col cols="12" sm="8">
                        <v-text-field
                            v-model="interest.interests"
                            label="Research Interest">
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" sm="2">
                        <v-text-field
                            v-model="interest.sort_order"
                            label="Order">
                        </v-text-field>
                    </v-col>
                    <v-col cols="2">
                        <v-btn icon @click.stop="removeItem(data.researchInterests, i)">
                            <v-icon color="red darken">mdi-delete</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
                <v-divider v-if="i < data.researchInterests.length - 1"></v-divider>
            </div>
            <v-row class="ml-4">
                <v-btn outlined @click="addItem()">
                    Add an interest
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
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

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
                researchInterests: [],
            },
            toDelete: [],
        }
    },
    watch: {
        personId () {
            this.initialize();
        },
    },
    mounted () {
        this.initialize();
    },
    methods: {
        initialize () {
            this.data.researchInterests = [];
            if (this.$store.state.session.loggedIn) {
                subUtil.getInfoPopulate(this, 'api' + this.endpoint
                                + '/members'
                                + '/' + this.personId + '/research-interests', true)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    for (let ind in result) {
                        this.$set(this.data.researchInterests, ind, {});
                        Object.keys(result[ind]).forEach(key => {
                            let value = result[ind][key];
                            this.$set(this.data.researchInterests[ind], key, value);
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
                let researchInterests = this.data.researchInterests;
                for (let ind in researchInterests) {
                    if (researchInterests[ind].id === 'new') {
                        researchInterests[ind].person_id = personID;
                        urlCreate.push({
                                url: 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/research-interests',
                                body: researchInterests[ind],
                            });

                    } else {
                        urlUpdate.push({
                                url: 'api' + this.endpoint
                                + '/members'
                                + '/' + personID
                                + '/research-interests/' + researchInterests[ind].id,
                                body: researchInterests[ind],
                            });
                    }
                }
                for (let ind in this.toDelete) {
                    urlDelete.push('api' + this.endpoint
                                + '/members'
                                + '/' + personID
                                + '/research-interests/' + this.toDelete[ind].id);
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
        addItem() {
            this.data.researchInterests.push({id: 'new', interests: null,
                sort_order: null});
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