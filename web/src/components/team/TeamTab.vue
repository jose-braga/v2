<template>
<v-tabs show-arrows
>
    <v-tab :to="link + '/members'">
        Members
    </v-tab>
    <v-tab :to="link + '/publications'">
        Publications
    </v-tab>
    <v-tabs-items>

            <router-view
                :lab-id="labId"
                :lab-data="labData"
                :lab-positions="labPositions"
                :my-labs="myLabs"
            ></router-view>
        
        <v-dialog v-model="showHelp" content-class="help">
            <router-view name="help2"></router-view>
        </v-dialog>
    </v-tabs-items>
</v-tabs>

</template>

<script>
export default {
    props: {
        labId: Number,
        labData: Object,
        labPositions: Array,
        myLabs: Array,
    },
    data () {
        return {
            coisa: true
        }
    },
    mounted () {
        this.initialize();
    },
    computed: {
        link() {
            return this.labData.link;
        },
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
    watch: {
        labId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            this.$router.replace(this.link + '/members')
                .catch((err)=>console.log(err));
        },
    }

}
</script>

<style scoped>

</style>