<template>
<div>
    <v-tabs v-model="currentTab">
        <v-tab :to="link + '/supervisor'">
            Supervisor
        </v-tab>
        <v-tab :to="link + '/publications'">
            Publications List
        </v-tab>
        <v-tab :to="link + '/add-publications'">
            Add Publications
        </v-tab>
        <v-tab :to="link + '/other'">
            Other
        </v-tab>
        <v-tabs-items>
            <keep-alive>
                <router-view
                        :other-person-id="otherPersonId"
                        :current-tab="currentTab"
                ></router-view>
            </keep-alive>
        </v-tabs-items>
    </v-tabs>
</div>


</template>

<script>

export default {
    props: {
    },
    data () {
        return {
            currentTab: '',
        }
    },
    mounted() {
        let path_split = this.$route.path.split('/');
        if (path_split.length !== 3) {
            this.$router.replace(this.link + '/publications')
                .catch(err => {console.log(err)})
        }
    },
    computed: {
        otherPersonId() {
            return parseInt(this.$route.params.id, 10);
        },
        link() {
            let path_split = this.$route.path.split('/');
            if (path_split.length === 3) {
                return this.$route.path;
            } else if (path_split.length === 4) {
                return this.$route.path;
            } else {
                path_split.splice(-1,1);
                return path_split.join('/');
            }
        },
    },
    watch: {
        otherPersonId () {
            if (this.$route.path.includes('person-on-behalf') && this.$route.path.includes('/personal')) {
                this.$router.push(this.link)
                    .catch(err => {console.log(err)})

            } else {
                this.$router.replace(this.link + '/publications')
                    .catch(err => {console.log(err)})
            }
        },
    },
    methods: {
        initialize() {
        }
    },

}
</script>

<style scoped>

</style>