<template>
<div class="px-4">
    <v-tabs>
        <v-tab v-if="accessStore" to="/person/warehouse/store">
            Store
        </v-tab>
        <v-tab v-if="manageOrders" to="/person/warehouse/order-management">
            Manage Orders
        </v-tab>
        <v-tab v-if="manageStock" to="/person/warehouse/stock-management">
            Manage Stock
        </v-tab>
        <v-tab v-if="manageUsers" to="/person/warehouse/user-management">
            Manage Users
        </v-tab>
        <v-tab v-if="manageFinances" to="/person/warehouse/financial-management">
            Manage Finances
        </v-tab>
        <v-tabs-items>
            <!-- use :max="N" in keep-alive if necessary-->
            <keep-alive>
                <router-view
                ></router-view>
            </keep-alive>
        </v-tabs-items>
    </v-tabs>
</div>
</template>

<script>

export default {
    computed: {
        accessStore () {
            return this.$store.state.session.storeAccess.accessStore;
        },
        manageUsers () {
            return this.$store.state.session.storeAccess.manageUsers;
        },
        manageOrders () {
            return this.$store.state.session.storeAccess.manageOrders;
        },
        manageStock () {
            return this.$store.state.session.storeAccess.manageStock;
        },
        manageFinances () {
            return this.$store.state.session.storeAccess.manageFinances;
        },
    },
}
</script>

<style>

</style>
