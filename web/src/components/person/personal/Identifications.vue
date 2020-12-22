<template>
    <v-form ref="form"
        @submit.prevent="submitForm">
        <p v-if="data.identifications.length === 0">
            No data.
        </p>
        <div v-for="(identification, i) in data.identifications"
            :key="i">
            <v-row align="center">
                <v-col cols="11" sm="4">
                    <v-select v-model="identification.card_type_id"
                        :items="cardTypes" item-value="id" item-text="name_en"
                        label="Card Type">
                    </v-select>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-text-field
                        v-model="identification.card_number"
                        label="Card ID number">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="3">
                    <v-menu ref="identification.show_date_end"
                        v-model="identification.show_date_end"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="identification.valid_until"
                                label="Valid until" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="identification.valid_until"
                                @input="identification.show_date_end = false"
                                no-title></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="1">
                    <v-btn icon @click.stop="removeItem(data.identifications, i)">
                        <v-icon color="red darken">mdi-delete</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-divider v-if="i < data.identifications.length - 1"></v-divider>
        </div>
        <v-row>
            <v-btn class="ml-2" outlined @click="addItem()">
                Add an identification
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
import time from '@/components/common/date-utils'

export default {
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            cardTypes: [],
            data: {
                identifications: [],
            },
            toDelete: [],
        }
    },
    created () {
        this.initialize();
        this.getCardTypes();
    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                subUtil.getInfoPopulate(this, 'api/people/' + personID + '/identifications', true)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    if (result !== undefined) {
                        for (let ind in result) {
                            this.$set(this.data.identifications, ind, {});
                            Object.keys(result[ind]).forEach(key => {
                                let value = result[ind][key];
                                if (key === 'valid_until') {
                                    value = time.momentToDate(value);
                                }
                                this.$set(this.data.identifications[ind], key, value);
                            });
                        }
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
                let identifications = this.data.identifications;
                for (let ind in identifications) {
                    if (identifications[ind].id === 'new') {
                        identifications[ind].person_id = personID;
                        urlCreate.push({
                                url: 'api/people/' + personID + '/identifications',
                                body: identifications[ind],
                            });

                    } else {
                        urlUpdate.push({
                                url: 'api/people/' + personID
                                        + '/identifications/' + identifications[ind].id,
                                body: identifications[ind],
                            });
                    }
                }
                for (let ind in this.toDelete) {
                    urlDelete.push('api/people/' + personID
                                + '/identifications/' + this.toDelete[ind].id);
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
        getCardTypes () {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'card-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'cardTypes');
            }
        },
        addItem() {
            this.data.identifications.push({id: 'new', card_type_id: null,
                card_number: null, valid_until: null});
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