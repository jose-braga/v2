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
        </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Drawer from './components/navigation/Drawer'
import UpperToolbar from './components/navigation/UpperToolbar'

import io from 'socket.io-client'

export default {
    name: 'App',
    components: {
        Drawer,
        UpperToolbar,
    },
    data () {
        return {
            standardPath: false,
            showAdminMessages: false,
            timeout: -1,
            messages: [],
            socketConnected: false,
            socket: {},
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
        }
    },
    created () {
        this.initialize()
    },
    methods: {
        initialize () {
            if (!this.socketConnected) {
                this.socket = io(process.env.VUE_APP_API_BASE_URL);
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
    },
}
</script>

<style scoped>
.message-time {
    font-size: 0.6rem;
    margin-bottom: 5px;
}

</style>
