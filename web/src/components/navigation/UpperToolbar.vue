<template>
    <div>
    <v-app-bar app>
        <v-app-bar-nav-icon @click.stop="changeDrawer"></v-app-bar-nav-icon>
        <v-toolbar-title>{{toolbarText}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-tooltip bottom  v-if="loggedIn">
            <template v-slot:activator="{ on }">
                <v-btn icon v-on="on" @click.stop="showContact">
                    <v-icon>mdi-comment-alert-outline</v-icon>
                </v-btn>
            </template>
            <span>Report bug / Suggestions</span>
        </v-tooltip>
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
                <v-btn id="help-icon" icon v-on="on" @click.stop="showHelp(); showHelp2()">
                    <v-icon>mdi-help</v-icon>
                </v-btn>
            </template>
            <span>Help for this page</span>
        </v-tooltip>
    </v-app-bar>
    <Login></Login>
    <ContactForm></ContactForm>
    </div>
</template>

<script>
import Login from '../login/Login'
import ContactForm from '../contact/ContactForm'

export default {
    components: {
        Login,
        ContactForm,
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
        showContact: function () {
            this.$store.commit('makeContact',
                {val: true});
        },
        showLogin: function () {
            this.$store.commit('makeLogin',
                {val: true});
        },
        showHelp: function () {
            if (
                !(this.$route.path.includes('/person/productivity/')
                    ||
                 this.$route.path.includes('/person/warehouse/')
                )
            ) {
                this.$store.commit('showHelp');
            }
        },
        showHelp2: function () {
            if (this.$route.path.includes('/person/productivity/')) {
                this.$store.commit('showHelp2');
            }
            if (this.$route.path.includes('/person/warehouse/')) {
                this.$store.commit('showHelp2a');
            }


        },
    }
}

</script>

<style scoped>
#help-icon .v-icon {
    animation-duration: 3s;
    animation-name: help-highlight;
    animation-iteration-count: infinite;
    animation-direction: normal;
}

@keyframes help-highlight {
  from {
    font-size: 24px;
  }

  10% {
    font-size: 35px;
  }

  20% {
    font-size: 24px;
  }

  to {
    font-size: 24px;
  }
}

</style>