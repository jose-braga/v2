<template>
<v-form ref="form"
    @submit.prevent="submitForm"
>
    <v-row align="center" class="px-2">
        <v-col cols="12">
            <v-textarea
                v-model="data.shortCV.text"
                label="Your text here">
            </v-textarea>
        </v-col>
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
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            data: {
                shortCV: {},
            },
            toDelete: [],
        }
    },
    mounted () {
        this.initialize();
    },
    methods: {
        initialize () {
            this.data.shortCV = {};
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                subUtil.getInfoPopulate(this, 'api/people/' + personID
                        + '/text-types/' + 1
                        + '/website-texts'
                    , false)
                .then( (result) => {
                    if (result !== undefined) {
                        this.data.shortCV = result;
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
                let urlUpdate = [];
                let personID = this.$store.state.session.personID;
                let shortCV = this.data.shortCV;
                if (shortCV.id === null || shortCV.id === undefined) {
                    urlCreate.push({
                        url: 'api/people/' + personID
                            + '/text-types/' + 1
                            + '/website-texts',
                        body: shortCV,
                    });
                } else {
                    urlUpdate.push({
                        url: 'api/people/' + personID
                            + '/text-types/' + 1
                            + '/website-texts/' + shortCV.id,
                        body: shortCV,
                    });
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
    },
}
</script>

<style>

</style>