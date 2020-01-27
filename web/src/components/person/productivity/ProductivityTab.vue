<template>
<div class="px-4">
    <v-tabs v-model="currentTab">
        <v-tab to="/person/productivity/publications">
            Publications List
        </v-tab>
        <v-tab to="/person/productivity/add-publications">
            Add Publications
        </v-tab>
        <v-tab to="/person/productivity/other">
            Other
        </v-tab>
        <v-tabs-items>
            <!-- use :max="N" in keep-alive if necessary-->
            <keep-alive>
                <router-view
                        :current-tab="currentTab"
                ></router-view>
            </keep-alive>
        </v-tabs-items>
    </v-tabs>
</div>


</template>

<script>

export default {
    data () {
        return {
            currentTab: undefined,
        }
    },
    mounted() {
        this.initialize()
    },
    methods: {
        initialize() {
        }
    },

}
</script>

<style scoped>

</style>