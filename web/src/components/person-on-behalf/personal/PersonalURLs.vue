<template>
<v-form ref="form"
    @submit.prevent="submitForm">
    <h3 class="subtitle-1 mb-4">For CV or Personal Institutional page</h3>
    <p v-if="data.personalURLs.length === 0">
        No data.
    </p>
    <div v-for="(url, i) in data.personalURLs"
        :key="i">
        <v-row align="center" class="px-2">
            <v-col cols="12" sm="6">
                <v-select v-model="url.url_type_id"
                    :items="urlTypes" item-value="id" item-text="type_en"
                    label="Type">
                </v-select>
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="url.description"
                    label="Description">
                </v-text-field>
            </v-col>

        </v-row>
        <v-row align="center" class="px-2">
            <v-col cols="10" sm="10">
                <v-text-field
                    v-model="url.url"
                    label="URL">
                </v-text-field>
            </v-col>
            <v-col cols="2">
                <v-btn icon @click.stop="removeItem(data.personalURLs, i)">
                    <v-icon color="red darken">mdi-delete</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-divider v-if="i < data.personalURLs.length - 1"></v-divider>
    </div>
    <v-row class="ml-4">
        <v-btn outlined @click="addItem()">
            Add a URL
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
            urlTypes: [],
            data: {
                personalURLs: [],
            },
            toDelete: [],
        }
    },
    mounted () {
        this.initialize();
        this.getPersonalURLTypes();
    },
    watch: {
        otherPersonId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            this.data.personalURLs = [];
            if (this.$store.state.session.loggedIn) {
                subUtil.getInfoPopulate(this,
                        'api/people/'
                        + this.otherPersonId
                        + '/personal-urls', true)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    for (let ind in result) {
                        this.$set(this.data.personalURLs, ind, {});
                        Object.keys(result[ind]).forEach(key => {
                            let value = result[ind][key];
                            this.$set(this.data.personalURLs[ind], key, value);
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
                let personalURLs = this.data.personalURLs;
                for (let ind in personalURLs) {
                    if (personalURLs[ind].id === 'new') {
                        personalURLs[ind].person_id = this.otherPersonId;
                        urlCreate.push({
                                url: 'api/people/'
                                    + this.otherPersonId
                                    + '/personal-urls',
                                body: personalURLs[ind],
                            });

                    } else {
                        urlUpdate.push({
                                url: 'api/people/'
                                    + this.otherPersonId
                                    + '/personal-urls/'
                                    + personalURLs[ind].id,
                                body: personalURLs[ind],
                            });
                    }
                }
                for (let ind in this.toDelete) {
                    urlDelete.push('api/people/'
                                + this.otherPersonId
                                + '/personal-urls/'
                                + this.toDelete[ind].id);
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
        getPersonalURLTypes () {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'personal-url-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'urlTypes');
            }
        },
        addItem() {
            this.data.personalURLs.push({id: 'new', url_type_id: null,
                url: null, description: null});
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