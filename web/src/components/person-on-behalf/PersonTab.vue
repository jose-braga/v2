<template>
<v-tabs show-arrows
    @change="tabChanged"
>
    <v-tab :to="currentPerson.link + '/personal'">
        Personal
    </v-tab>
    <v-tab :to="currentPerson.link + '/academic'">
        Academic
    </v-tab>
    <v-tab :to="currentPerson.link + '/institutional'">
        Institutional
    </v-tab>
    <v-tab :to="currentPerson.link + '/professional'">
        Professional
    </v-tab>
    <v-tab :to="currentPerson.link + '/productivity '">
        Productivity
    </v-tab>
    <v-tabs-items>
        <keep-alive>
            <router-view
                    :other-person-id="otherPersonId"
                    :current-person="currentPerson"
                    :active-tab="activeTab"
                    :root-tab="rootTab"
            ></router-view>
        </keep-alive>
    </v-tabs-items>
</v-tabs>
</template>

<script>
export default {
    props: {
        otherPersonId: Number,
        currentPerson: Object,
        rootTab: String,
    },
    data () {
        return {
            activeTab: this.rootTab + '/personal',
        }
    },
    watch: {
        rootTab () {
            this.activeTab = this.rootTab + '/personal';

        },

    },
    methods: {
        tabChanged: function(tab) {
            this.activeTab = tab;
        }
    },
}
</script>

<style scoped>

</style>