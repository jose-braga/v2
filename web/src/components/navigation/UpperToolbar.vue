<template>
    <div>
    <v-app-bar app>
        <v-app-bar-nav-icon @click.stop="changeDrawer"></v-app-bar-nav-icon>
        <v-toolbar-title>{{toolbarText}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-tooltip bottom v-if="!loggedIn">
            <template v-slot:activator="{ on }">
                <v-btn icon v-on="on" @click.stop="showLogin">
                    <v-icon color="green darken">mdi-login</v-icon>
                </v-btn>
            </template>
            <span>Sign in</span>
        </v-tooltip>
        <v-tooltip bottom v-if="loggedIn">
            <template v-slot:activator="{ on }">
                <v-btn icon v-on="on" @click.stop="logout">
                    <v-icon color="red darken">mdi-logout</v-icon>
                </v-btn>
            </template>
            <span>Sign out</span>
        </v-tooltip>
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon v-on="on" @click.stop="showHelp">
                    <v-icon>mdi-help</v-icon>
                </v-btn>
            </template>
            <span>Help for this page</span>
        </v-tooltip>
    </v-app-bar>
    <Login></Login>
    </div>
</template>

<script>
import Login from '../login/Login'

export default {
    components: {
        Login,
    },
    data() {
        return {
            data: {
                name: undefined,
                colloquial_name: undefined,
            }
        }
    },
    computed: {
        toolbarText () {
            return this.$store.state.navigation.toolbarText;
        },
        loggedIn () {
            return this.$store.state.session.loggedIn;
        }
    },
    methods: {
        changeDrawer: function () {
            this.$store.commit('changeDrawer');
        },
        logout: function () {
            this.$store.commit('logoutProcedure');
        },
        showLogin: function () {
            this.$store.commit('makeLogin',
                {val: true});
        },
        showHelp: function () {
            this.$store.commit('showHelp');
        },
    }
}

</script>

<style>
</style>