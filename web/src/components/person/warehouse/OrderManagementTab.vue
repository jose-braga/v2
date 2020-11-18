<template>
<div>
<v-container>
    <v-row>
        <v-col cols="12"
        >
            <v-card>
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline">Orders</h3>
                    </div>
                </v-card-title>
                <v-card-text class="px-4">
                </v-card-text>
                <v-data-table
                    item-key="id"
                    :headers="headers"
                    :footer-props="footerProps"
                    :items="data.orders"
                    :items-per-page="10"

                    :sort-by="['datetime']"
                    :sort-desc="[true]"
                    multi-sort
                    dense
                >
                    <template v-slot:top>
                        <v-dialog v-model="dialog" max-width="1600px">
                            <OrderDetails
                                :order-id="editedItem.id"
                                :order-data="editedItem"
                            >
                            </OrderDetails>
                        </v-dialog>
                    </template>
                    <template v-slot:item.details="{ item }">
                        <v-icon
                            @click="orderDetails(item)"
                        >mdi-format-list-bulleted</v-icon>
                    </template>
                    <template v-slot:item.action="{ item }">
                        <v-icon v-if="item.orderPending"
                            class="mr-3 mb-2" color="green"
                            @click="approveOrder(item)"
                        >mdi-thumb-up</v-icon>
                        <v-icon v-if="item.orderPending"
                            class="mb-2" color="red"
                            @click="rejectOrder(item)"
                        >mdi-thumb-down</v-icon>
                        <v-progress-circular indeterminate
                                v-show="item.progress"
                                :size="20" :width="2"
                                color="primary"></v-progress-circular>
                        <v-icon v-show="item.success" color="green">mdi-check</v-icon>
                        <v-icon v-show="item.error" color="red">mdi-alert-circle-outline</v-icon>
                    </template>
                    <template v-slot:item.close="{ item }">
                        <v-btn v-if="!item.orderPending && item.orderNotClosed"
                            small
                            outlined
                            @click="finishOrder(item)"
                        >
                            Done
                        </v-btn>
                    </template>
                </v-data-table>
            </v-card>
        </v-col>
    </v-row>

</v-container>
</div>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import OrderDetails from './ManagerOrderDetails'

export default {
    components: {
        OrderDetails,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            errorMessage: '',
            formError: false,
            dialog: false,
            editedIndex: undefined,
            editedItem: {},
            data: {
                orders: [],
            },
            toDelete: [],
            headers: [
                { text: 'Order ID', value:'id' },
                { text: 'Who', value:'colloquial_name' },
                { text: 'Account', value:'account_name_en' },
                { text: 'Cost Center', value:'cost_center_name_en' },
                { text: 'Date', value: 'datetime'},
                { text: 'Status', value: 'last_status.name_en'},
                { text: 'Amount', value: 'cost_text', sortable: false},
                { text: '€ available', value: 'available_text', sortable: false},
                { text: 'Details', value: 'details', sortable: false},
                { text: 'Approve/ Reject', value: 'action', sortable: false},
                { text: 'Finish', value: 'close', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
        }
    },
    mounted () {
        this.initialize();
        this.$root.$on('orderManagerOrderUpdate',
            () => {
                this.initialize();
            }
        );
    },
    watch: {
        $route () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            let personID = this.$store.state.session.personID;
            subUtil.getInfoPopulate(this, 'api/people/' + personID
                + '/order-management/orders',
                true)
            .then( (result) => {
                this.data.orders = result;
                for (let ind in this.data.orders) {
                    this.$set(this.data.orders[ind],
                        'cost_text',
                        Number(this.data.orders[ind].total_cost_tax).toFixed(2) + '€'
                    )
                    this.$set(this.data.orders[ind],
                        'available_text',
                        Number(this.data.orders[ind].finances[0].current_amount_tax).toFixed(2) + '€'
                    )
                    if (this.data.orders[ind].last_status !== undefined) {
                        if (this.data.orders[ind].last_status.order_status_id === 1) {
                            this.$set(this.data.orders[ind], 'orderPending', true);
                            this.$set(this.data.orders[ind], 'approved', undefined);
                            this.$set(this.data.orders[ind], 'partiallyDelivered', undefined);
                            this.$set(this.data.orders[ind], 'orderNotClosed', true);
                        } else if (this.data.orders[ind].last_status.order_status_id === 2) {
                            this.$set(this.data.orders[ind], 'orderPending', false)
                            this.$set(this.data.orders[ind], 'approved', true)
                            this.$set(this.data.orders[ind], 'partiallyDelivered', undefined)
                            this.$set(this.data.orders[ind], 'orderNotClosed', true)
                        } else if (this.data.orders[ind].last_status.order_status_id === 3) {
                            this.$set(this.data.orders[ind], 'orderPending', false)
                            this.$set(this.data.orders[ind], 'approved', true)
                            this.$set(this.data.orders[ind], 'partiallyDelivered', false)
                            this.$set(this.data.orders[ind], 'orderNotClosed',false)
                        } else if (this.data.orders[ind].last_status.order_status_id === 4) {
                            this.$set(this.data.orders[ind], 'orderPending', false);
                            this.$set(this.data.orders[ind], 'approved', false);
                            this.$set(this.data.orders[ind], 'partiallyDelivered', undefined);
                            this.$set(this.data.orders[ind], 'orderNotClosed', undefined);
                        } else if (this.data.orders[ind].last_status.order_status_id === 5) {
                            this.$set(this.data.orders[ind], 'orderPending', false);
                            this.$set(this.data.orders[ind], 'approved', true);
                            this.$set(this.data.orders[ind], 'partiallyDelivered', true);
                            this.$set(this.data.orders[ind], 'orderNotClosed', true);
                        }
                    }
                    if (this.dialog && parseInt(ind, 10) === parseInt(this.editedIndex, 10)) {
                        this.$root.$emit('orderManagerOrdersReload', this.data.orders[ind]);
                    }
                }
            })
        },
        orderDetails (item) {
            this.dialog = true;
            this.editedIndex = this.data.orders.indexOf(item);
            this.editedItem = item;
        },
        approveOrder (item) {
            this.$set(item, 'progress', true);
            let personID = this.$store.state.session.personID;
            let urlUpdate = [];
            item.approveOrder = true;
            urlUpdate.push({
                url: 'api/people/' + personID
                    + '/order-management/orders/' + item.id,
                body: item,
            });
            this.$http.all(
                urlUpdate.map(el =>
                    this.$http.put(el.url,
                        { data: el.body, },
                        { headers:
                            {'Authorization': 'Bearer ' + localStorage['v2-token']
                        },
                    }))
            )
            .then(this.$http.spread( () => {
                this.$set(item, 'progress', false);
                this.$set(item, 'success', true);
                setTimeout(() => {
                    this.$set(item, 'success', false);
                    this.initialize();
                }
                , 1000)
            }))
            .catch((err) => {
                this.$set(item, 'progress', false);
                this.$set(item, 'error', true);
                setTimeout(() => {
                    this.$set(item, 'error', false);
                    this.initialize();
                }
                , 1000)
                console.log(err)
            });
        },
        rejectOrder (item) {
            this.$set(item, 'progress', true);
            let personID = this.$store.state.session.personID;
            let urlUpdate = [];
            item.rejectOrder = true;
            urlUpdate.push({
                url: 'api/people/' + personID
                    + '/order-management/orders/' + item.id,
                body: item,
            });
            this.$http.all(
                urlUpdate.map(el =>
                    this.$http.put(el.url,
                        { data: el.body, },
                        { headers:
                            {'Authorization': 'Bearer ' + localStorage['v2-token']
                        },
                    }))
            )
            .then(this.$http.spread( () => {
                this.$set(item, 'progress', false);
                this.$set(item, 'success', true);
                setTimeout(() => {
                    this.$set(item, 'success', false);
                    this.initialize();
                }
                , 1000)
            }))
            .catch((err) => {
                this.$set(item, 'progress', false);
                this.$set(item, 'error', true);
                setTimeout(() => {
                    this.$set(item, 'error', false);
                    this.initialize();
                }
                , 1000)
                console.log(err)
            });
        },
        finishOrder (order) {
            for (let ind in order.items) {
                if (order.items[ind].decimal === 0) {
                    if (parseInt(order.items[ind].delivered_quantity, 10) <
                        parseInt(order.items[ind].quantity, 10)) {
                        alert('Cannot close order while there are items with delivery pending!');
                        return;
                    }

                } else {
                    if (parseFloat(order.items[ind].delivered_quantity_decimal) >
                        parseFloat(order.items[ind].quantity_decimal)) {
                        alert('Cannot close order while there are items with delivery pending!');
                        return;
                    }
                }

            }
            this.$set(order, 'progress', true);
            let personID = this.$store.state.session.personID;
            let urlUpdate = [];
            order.closeOrder = true;
            urlUpdate.push({
                url: 'api/people/' + personID
                    + '/order-management/orders/' + order.id,
                body: order,
            });
            this.$http.all(
                urlUpdate.map(el =>
                    this.$http.put(el.url,
                        { data: el.body, },
                        { headers:
                            {'Authorization': 'Bearer ' + localStorage['v2-token']
                        },
                    }))
            )
            .then(this.$http.spread( () => {
                this.$set(order, 'progress', false);
                this.$set(order, 'success', true);
                setTimeout(() => {
                    this.$set(order, 'success', false);
                    this.initialize();
                }
                , 1000)
            }))
            .catch((err) => {
                this.$set(order, 'progress', false);
                this.$set(order, 'error', true);
                setTimeout(() => {
                    this.$set(order, 'error', false);
                    this.initialize();
                }
                , 1000)
                console.log(err)
            });
        },
    },
}
</script>

<style>

</style>
