<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Current messages to users</h3>
        </div>
    </v-card-title>
    <v-container>
        <ol v-if="data.messages.length > 0">
            <li v-for="(message, i) in data.messages"
                :key="i"
            >
                <div class="message-time">{{message.time}}</div>
                <div class="message">{{message.msg}}</div>
            </li>
        </ol>
        <div v-else>
            There are no messages currently
        </div>
        <v-btn
            class="ml-2 mt-4"
            outlined
            color="red"
            @click="deleteMessages()"
        >
            Delete all
        </v-btn>
        <v-divider class="mt-4"></v-divider>
        <v-form ref="form"
                @submit.prevent="submitForm">
            <v-row align="center">
                <v-col cols="12">
                    <v-text-field
                        v-model="data.newMessage"
                        label="Message to send">
                    </v-text-field>
                </v-col>
            </v-row>
            <v-row class="mb-1">
                <v-btn
                    class="ml-4"
                    type="submit"
                    outlined
                    color="blue"
                >
                    Send
                </v-btn>
            </v-row>
        </v-form>
    </v-container>
</v-card>
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
                messages: [],
                newMessage: '',
            },
        }
    },
    computed: {},
    watch: {},
    mounted() {
        this.initialize();
    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                let urlSubmit = 'api/admins/messages';
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    this.data.messages = result;
                });
            }
        },
        submitForm() {
            if (this.$store.state.session.loggedIn && this.data.newMessage !== '') {
                let urlCreate = [];
                this.progress = true;
                let message = this.data.newMessage;
                urlCreate.push({
                    url: 'api/admins/messages',
                    body: message,
                });
                Promise.all(
                    urlCreate.map(el =>
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
                    setTimeout(() => {this.success = false;}, 1500)
                    this.data.newMessage = '';
                    this.initialize();
                })
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
        deleteMessages() {
            if (this.$store.state.session.loggedIn) {
                let urlDelete = [];
                this.progress = true;
                let messages = this.data.messages;
                urlDelete.push({
                    url: 'api/admins/messages',
                    body: messages,
                });
                Promise.all(
                    urlDelete.map(el =>
                        this.$http.delete(el.url,
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                )
                .then( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.data.newMessage = '';
                    this.initialize();
                })
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