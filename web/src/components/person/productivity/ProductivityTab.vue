<template>
<div class="px-4">
    <v-tabs>
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
                <router-view></router-view>
            </keep-alive>
        </v-tabs-items>
    </v-tabs>
</div>


</template>

<script>
export default {

}
</script>

<style scoped>

</style>