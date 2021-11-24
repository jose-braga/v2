<template>
<v-card>
    <v-form ref="form"
        @submit.prevent="submitForm"
    >
        <v-card-title>
            <span> Check data for {{ itemType }} (contact ID:
                    <b>{{ itemDetails.id }}</b>)
            </span>
        </v-card-title>
        <v-card-text>
            Sent: {{ itemDetails.date_sent }}
        </v-card-text>
        <v-container>
            <v-row>
                <v-col cols="1">
                    <b>Subject:</b>
                </v-col>
                <v-col cols="11">
                    {{ itemDetails.subject }}
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="1">
                    <b>Text:</b>
                </v-col>
                <v-col cols="11">
                    {{ itemDetails.email_text }}
                </v-col>
            </v-row>
            <v-row align="center">
                <v-col cols="1">
                    <b>Solved:</b>
                </v-col>
                <v-col cols="1">
                    <v-checkbox
                        v-model="itemDetails.solved"
                        :false-value="0"
                        :true-value="1"
                    ></v-checkbox>
                </v-col>
                <v-col cols="10" v-if="itemDetails.solved">
                    Date solved: {{ itemDetails.date_solved }}
                </v-col>
            </v-row>
            <v-row align-content="center" justify="start" class="mb-1">
                <v-col cols="2">
                    <div>
                        <v-btn type="submit"
                            outlined color="blue">Save</v-btn>
                    </div>
                    <div class="request-status-container ml-2">
                        <v-progress-circular indeterminate
                                v-show="progress"
                                :size="20" :width="2"
                                color="primary"></v-progress-circular>
                        <v-icon v-show="success" color="green">mdi-check</v-icon>
                        <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                    </div>
                </v-col>
            </v-row>
        </v-container>
    </v-form>
</v-card>
</template>

<script>
export default {
    props: {
        itemType: String,
        itemData: Object,
        itemId: Number,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            itemDetails: {
            },
        }
    },
    watch: {
        itemData () {
            this.initialize();
        },
    },
    mounted () {
        this.initialize();
    },
    methods: {
        initialize () {
            this.itemDetails = Object.assign({}, this.itemData);
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                this.progress = true;
                let urlUpdate = [
                    {
                        url: 'api/admins'
                            + '/' + personID
                            + '/user-contacts/' + this.itemDetails.id,
                        body: this.itemDetails,
                    }
                ];
                Promise.all(urlUpdate.map(el =>
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
                    this.$root.$emit('updatedUserContact')
                    setTimeout(() => {
                        this.success = false;
                        this.itemDetails = {
                        };
                    }, 1500);
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
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