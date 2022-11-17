<template>
  <v-app>
    <Drawer v-if="standardPath"></Drawer>
    <UpperToolbar v-if="standardPath"></UpperToolbar>
    <v-snackbar v-for="(message, i) in messages"
        v-model="message.show"
        :timeout="timeout"
        right
        top
        multi-line
        app
        :key="i"
    >
        <div class="message-time">{{message.time}}</div>
        <div class="message">{{message.msg}}</div>

        <template v-slot:action="{ attrs }">
            <v-btn
                color="red"
                text
                v-bind="attrs"
                @click="message.show = false"
            >
            Close
            </v-btn>
        </template>
    </v-snackbar>

    <v-main>
        <v-container fluid>
            <router-view></router-view>
            <v-dialog v-if="pollsPath" v-model="showHelp" content-class="help">
                <router-view name="help"></router-view>
            </v-dialog>
        </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Drawer from './components/navigation/Drawer'
import UpperToolbar from './components/navigation/UpperToolbar'
import jwtDecode from 'jwt-decode'

import io from 'socket.io-client'

var readLocalStorage = function (token) {
    return jwtDecode(token)
};

export default {
    name: 'App',
    components: {
        Drawer,
        UpperToolbar,
    },
    data () {
        return {
            standardPath: false,
            pollsPath: false,
            showAdminMessages: false,
            timeout: -1,
            messages: [],
            socketConnected: false,
            socket: {},
            sessionEndApproaching: false,
            checkTime: null,
        }
    },
    watch: {
        $route () {
            if (this.$route.path.includes('/pre-register/')) {
                this.standardPath = false;
            } else if (this.$route.path.includes('/calls')) {
                this.standardPath = false;
            } else if (this.$route.path.includes('/reviewers')) {
                this.standardPath = false;
            } else if (this.$route.path.includes('/call-managers')) {
                this.standardPath = false;
            } else { this.standardPath = true; }
            if (this.$route.path.includes('/polls')) {
                this.pollsPath = true;
            }
        }
    },
    created () {
        this.initialize()
    },
    mounted() {
        this.checkTime = setInterval(() => this.checkSessionEndApproaching(),
            60 * 1000)
    },
    beforeDestroy() {
        clearInterval(this.checkTime)
    },
    computed: {
        showHelp: {
            get() {
                return this.$store.state.navigation.showHelp;
            },
            set(state) {
                if (state !== this.$store.state.navigation.showHelp) {
                    this.$store.dispatch('showHelp')
                }
            }

        },
    },
    methods: {
        initialize () {
            if (!this.socketConnected) {
                this.socket = io(process.env.VUE_APP_API_BASE_URL, { withCredentials: true, });
                this.socket.on('connect', () => {
                    this.socketConnected = true;
                });
                this.socket.on('message_all', (history) => {
                    if (history.length > 0) {
                        this.showAdminMessages = true;
                        for (let ind in history) {
                            history[ind].show = true;
                        }
                        this.messages = history;
                    }
                });
            }
        },
        checkSessionEndApproaching () {
            if (localStorage['v2-token']) {
                let token_json = readLocalStorage(localStorage['v2-token']);
                //token_json.exp = 1668692626
                // if token expiry is less than hour ahead (times in seconds)
                if (token_json.exp - 3600 < Date.now() / 1000
                    && this.sessionEndApproaching === false
                ) {
                    this.sessionEndApproaching = true; // to show only once
                    let now = new Date();
                    this.messages.push({
                        show: true,
                        msg: 'Your session will expire in less than 1 hour.',
                        time: now.toISOString(),
                    })
                }
            }
        },
    },
}
</script>

<style scoped>
.message-time {
    font-size: 0.6rem;
    margin-bottom: 5px;
}

</style>
