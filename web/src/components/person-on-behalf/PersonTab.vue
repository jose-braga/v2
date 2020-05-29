<template>
<v-tabs show-arrows
>
    <v-tab :to="link + '/personal'">
        Personal
    </v-tab>
    <v-tab :to="link + '/academic'">
        Academic
    </v-tab>
    <v-tab :to="link + '/institutional'">
        Institutional
    </v-tab>
    <v-tab :to="link + '/professional'">
        Professional
    </v-tab>
    <v-tab :to="link + '/productivity'">
        Productivity
    </v-tab>
    <v-tabs-items>
        <keep-alive>
            <router-view
            ></router-view>
        </keep-alive>
    </v-tabs-items>
</v-tabs>
</template>

<script>
export default {
    props: {
    },
    data () {
        return {
        }
    },
    created() {
        this.$router.push(this.link + '/personal')
        .catch(err => {console.log(err)})

    },
    computed: {
        otherPersonId() {
            return this.$route.params.id;
        },
        link() {
            let path_split = this.$route.path.split('/');
            if (path_split.length === 3) {
                return this.$route.path;
            } else if (path_split.length === 4){
                path_split.splice(-1,1);
                return path_split.join('/');
            } else {
                path_split.splice(-2,2);
                return path_split.join('/');
            }
        },
    },
    watch: {
        otherPersonId () {
            this.$router.push(this.link + '/personal')
            .catch(err => {console.log(err)})
        },
    },
    methods: {
    },
}
</script>

<style scoped>

</style>