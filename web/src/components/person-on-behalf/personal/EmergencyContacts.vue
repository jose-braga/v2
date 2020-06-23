<template>
    <v-form ref="form"
        @submit.prevent="submitForm">
        <p v-if="data.emergencyContacts.length === 0">
            No data.
        </p>
        <div v-for="(contact, i) in data.emergencyContacts"
            :key="i">
            <v-row align="center">
                <v-col cols="12" sm="6">
                    <v-text-field
                        v-model="contact.name"
                        label="Name">
                    </v-text-field>
                </v-col>
                <v-col cols="11" sm="5">
                    <v-text-field
                        v-model="contact.phone"
                        label="Phone">
                    </v-text-field>
                </v-col>
                <v-col cols="1">
                    <v-btn icon @click.stop="removeItem(data.emergencyContacts, i)">
                        <v-icon color="red darken">mdi-delete</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-divider v-if="i < data.emergencyContacts.length - 1"></v-divider>
        </div>
        <v-row>
            <v-btn outlined class="ml-2" @click="addItem()">
                Add a contact
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
            formError: false,
            data: {
                emergencyContacts: [],
            },
            toDelete: [],
        }
    },
    created () {
        this.initialize();
    },
    watch: {
        otherPersonId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            this.data.emergencyContacts = []
            if (this.$store.state.session.loggedIn) {
                subUtil.getInfoPopulate(this,
                        'api/people/'
                        + this.otherPersonId
                        + '/emergency-contacts', true)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    Object.keys(result).forEach(key => {
                        let value = result[key];
                        this.$set(this.data.emergencyContacts, key, value);
                    });
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
                let contacts = this.data.emergencyContacts;
                for (let ind in contacts) {
                    if (contacts[ind].id === 'new') {
                        contacts[ind].person_id = this.otherPersonId;
                        urlCreate.push({
                                url: 'api/people/'
                                    + this.otherPersonId
                                    + '/emergency-contacts',
                                body: contacts[ind],
                            });

                    } else {
                        urlUpdate.push({
                                url: 'api/people/'
                                        + this.otherPersonId
                                        + '/emergency-contacts/'
                                        + contacts[ind].id,
                                body: contacts[ind],
                            });
                    }
                }
                for (let ind in this.toDelete) {
                    urlDelete.push('api/people/'
                                + this.otherPersonId
                                + '/emergency-contacts/'
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
        addItem() {
            this.data.emergencyContacts.push({id: 'new', name: null, phone: null});
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