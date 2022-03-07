<template>
<v-card>
    <v-form ref="form"
        @submit.prevent="submitForm"
    >
        <v-card-title>
            <span> News title: "{{itemDetails.title}}"
            </span>
        </v-card-title>
        <v-container>
            <v-row>
                <v-col cols="12">
                    <v-text-field
                        v-model="itemDetails.title"
                        label="Title"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                    <v-textarea
                        v-model="itemDetails.body"
                        label="News text"
                    ></v-textarea>
                    <v-row>
                        <v-col cols="12" sm="4">
                            <v-checkbox
                                v-model="itemDetails.visible"
                                :false-value=0 :true-value=1
                                label="Visible"
                            ></v-checkbox>
                        </v-col>
                        <v-col cols="12" sm="4" md="2">
                            <v-text-field
                                v-model="itemDetails.sort_order"
                                label="Sort #"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="12" sm="6">
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-menu ref="date_menu"
                                v-model="itemDetails.show_published"
                                :close-on-content-click="false"
                                :nudge-right="10"
                                transition="scale-transition"
                                offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="itemDetails.date_published"
                                        label="Published date" v-on="on">
                                    </v-text-field>
                                </template>
                                <v-date-picker v-model="itemDetails.date_published"
                                    @input="itemDetails.show_published = false"
                                    no-title
                                ></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="12" sm="6">
                        <v-menu ref="time_from_menu"
                            v-model="itemDetails.show_time_published"
                            :close-on-content-click="false"
                            :nudge-right="10"
                            transition="scale-transition"
                            offset-y min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="itemDetails.time_published"
                                    label="Published time" v-on="on">
                                </v-text-field>
                            </template>
                            <v-time-picker
                                v-model="itemDetails.time_published"
                                format="24hr"
                                use-seconds
                            ></v-time-picker>
                        </v-menu>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-menu ref="date_menu"
                                v-model="itemDetails.show_valid_from"
                                :close-on-content-click="false"
                                :nudge-right="10"
                                transition="scale-transition"
                                offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="itemDetails.date_valid_from"
                                        label="Start date" v-on="on">
                                    </v-text-field>
                                </template>
                                <v-date-picker v-model="itemDetails.date_valid_from"
                                    @input="itemDetails.show_valid_from = false"
                                    no-title
                                ></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="12" sm="6">
                        <v-menu ref="time_from_menu"
                            v-model="itemDetails.show_time_valid_from"
                            :close-on-content-click="false"
                            :nudge-right="10"
                            transition="scale-transition"
                            offset-y min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field v-model="itemDetails.time_valid_from"
                                    label="Start time" v-on="on">
                                </v-text-field>
                            </template>
                            <v-time-picker
                                v-model="itemDetails.time_valid_from"
                                format="24hr"
                                use-seconds
                            ></v-time-picker>
                        </v-menu>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-menu ref="date_menu"
                                v-model="itemDetails.show_valid_until"
                                :close-on-content-click="false"
                                :nudge-right="10"
                                transition="scale-transition"
                                offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="itemDetails.date_valid_until"
                                        label="End date" v-on="on">
                                    </v-text-field>
                                </template>
                                <v-date-picker v-model="itemDetails.date_valid_until"
                                    @input="itemDetails.show_valid_until = false"
                                    no-title
                                ></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-menu ref="time_until_menu"
                                v-model="itemDetails.show_time_valid_until"
                                :close-on-content-click="false"
                                :nudge-right="10"
                                transition="scale-transition"
                                offset-y min-width="290px">
                                <template v-slot:activator="{ on }">
                                    <v-text-field v-model="itemDetails.time_valid_until"
                                        label="End time" v-on="on">
                                    </v-text-field>
                                </template>
                                <v-time-picker
                                    v-model="itemDetails.time_valid_until"
                                    format="24hr"
                                    use-seconds
                                ></v-time-picker>
                            </v-menu>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-row align-content="center" justify="center" class="mb-1">
                <div>
                    <v-btn type="submit"
                        outlined color="blue">Save</v-btn>
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
        </v-container>
    </v-form>
</v-card>
</template>

<script>
import time from '@/components/common/date-utils'

export default {
    props: {
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
                this.progress = true;
                let personID = this.$store.state.session.personID;
                // If published date is null date is considered today
                // If published time is null time is considered now
                let now  = time.moment();
                let today = time.momentToDate(now, undefined, 'YYYY-MM-DD');
                let now_time = time.momentToDate(now, undefined, 'HH:mm:ss');
                if (this.itemDetails.date_published === null
                    || this.itemDetails.date_published === undefined
                    || this.itemDetails.date_published === ''
                ) {
                    if (this.itemDetails.time_published === null
                        || this.itemDetails.time_published === undefined
                        || this.itemDetails.time_published === ''
                    ) {
                        this.itemDetails.published = today + ' ' + now_time;
                    } else {
                        this.itemDetails.published = today + ' ' + this.itemDetails.time_published;
                    }
                } else {
                    if (this.itemDetails.time_published === null
                        || this.itemDetails.time_published === undefined
                        || this.itemDetails.time_published === ''
                    ) {
                        this.itemDetails.published = this.itemDetails.date_published + ' ' + '00:00:00';
                    } else {
                        this.itemDetails.published = this.itemDetails.date_published + ' ' + this.itemDetails.time_published;
                    }
                }

                if (this.itemDetails.date_valid_from === null
                    || this.itemDetails.date_valid_from === undefined
                    || this.itemDetails.date_valid_from === ''
                ) {
                    this.itemDetails.date_valid_from = null;
                } else {
                    if (this.itemDetails.time_valid_from === null
                        || this.itemDetails.time_valid_from === undefined
                        || this.itemDetails.time_valid_from === ''
                    ) {
                        // time will be considered as 00:00:00
                        this.itemDetails.valid_from = this.itemDetails.date_valid_from + ' ' + '00:00:00';
                    } else {
                        this.itemDetails.valid_from = this.itemDetails.date_valid_from
                                                + ' ' + this.itemDetails.time_valid_from;
                    }

                }
                if (this.itemDetails.date_valid_until === null
                    || this.itemDetails.date_valid_until === undefined
                    || this.itemDetails.date_valid_until === ''
                ) {
                    this.itemDetails.date_valid_until = null;
                } else {
                    if (this.itemDetails.time_valid_until === null
                        || this.itemDetails.time_valid_until === undefined
                        || this.itemDetails.time_valid_until === ''
                    ) {
                        // time will be considered as 23:59:59
                        this.itemDetails.valid_until = this.itemDetails.date_valid_until + ' ' + '23:59:59';
                    } else {
                        this.itemDetails.valid_until = this.itemDetails.date_valid_until
                                                + ' ' + this.itemDetails.time_valid_until;
                    }

                }

                if (this.itemDetails.id === 'new') {
                    let urlCreate = [
                        {
                            url: 'api/admins/' + personID
                                + '/news',
                            body: this.itemDetails,
                        }
                    ];
                    Promise.all(urlCreate.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                    )
                    .then(() => {
                        this.progress = false;
                        this.success = true;
                        this.$root.$emit('updatedNews')
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
                } else {
                    let urlUpdate = [
                        {
                            url: 'api/admins/' + personID
                                + '/news/' + this.itemDetails.id,
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
                        this.$root.$emit('updatedNews')
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
            }
        },
    },
}
</script>

<style>

</style>