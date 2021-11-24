<template>
<v-card>
<v-form ref="form"
    @submit.prevent="submitForm">
    <v-card-title>
        Details of order: {{data.thisOrder.order_id}}
    </v-card-title>
    <v-card-text>
    </v-card-text>
    <v-container>
        <v-data-table class="ma-2"
            item-key="id"
            :headers="headers"
            :footer-props="footerProps"
            :items="data.thisOrder.items"
            :sort-by="['name_en']"
            :sort-desc="[false]"
            multi-sort
            dense
        >
            <template v-slot:item.ordered_amount_show="{ item }">
                <div v-if="data.thisOrder.orderPending">
                    <v-text-field v-if="item.decimal === 0"
                        :error="item.errorStock"
                        @input="computeCostOrder(item)"
                        v-model="item.quantity"
                        label="Change quant.">
                    </v-text-field>
                    <v-text-field v-else
                        :error="item.errorStock"
                        @input="computeCostOrder(item)"
                        v-model="item.quantity_decimal"
                        label="Change quant.">
                    </v-text-field>
                </div>
                <div v-else>
                    {{ item.ordered_amount_show }}
                </div>
            </template>
            <template v-slot:item.change_reason="{ item }">
                <div v-if="data.thisOrder.orderPending">
                    <v-text-field
                        v-model="item.change_reason"
                        label="Reason">
                    </v-text-field>
                </div>
                <div v-else>
                    {{ item.change_reason }}
                </div>
            </template>
            <template v-slot:item.this_delivery_show="{ item }">
                <div v-if="!data.thisOrder.orderPending">
                    <div v-if="item.delivered === 0">
                        <v-text-field v-if="item.decimal === 0"
                            :error="item.errorPartialAmount"
                            @input="checkPartialAmounts(item)"
                            v-model="item.this_delivery"
                            label="Partial amount">
                        </v-text-field>
                        <v-text-field v-else
                            :error="item.errorPartialAmount"
                            @input="checkPartialAmounts(item)"
                            v-model="item.this_delivery_decimal"
                            label="Partial amount">
                        </v-text-field>
                    </div>
                    <div v-else>
                        <v-icon color="green">mdi-check</v-icon>
                    </div>
                </div>
            </template>
        </v-data-table>
        <v-row justify="end" align="center">
            <v-col cols="6" sm="3" xl="2" class="price-highlight mt-2 mr-10 mb-4">
                <v-row justify="center">
                    <span class="total-text">Total:</span> {{data.thisOrder.total_cost_tax_show}} €
                </v-row>
            </v-col>
        </v-row>
        <v-row justify="end" class="mb-1">
            <v-col cols="2" align-self="end">
                <v-row justify="end">
                    <v-btn type="submit"
                    outlined color="blue">Save</v-btn>
                </v-row>
            </v-col>
            <v-col cols="1">
                <v-progress-circular indeterminate
                        v-show="progress"
                        :size="20" :width="2"
                        color="primary"></v-progress-circular>
                <v-icon v-show="success" color="green">mdi-check</v-icon>
                <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
            </v-col>
        </v-row>
    </v-container>
</v-form>
</v-card>
</template>

<script>
export default {
    props: {
        orderId: Number,
        orderData: Object,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            data: {
                thisOrder: {},
            },
            headers: [
                { text: 'Prod. Name', value:'name_en' },
                { text: 'Brand', value:'brand' },
                { text: 'Reference', value:'reference' },
                { text: 'Ordered amount', value: 'ordered_amount_show', sortable: false},
                { text: 'Change reason', value: 'change_reason', sortable: false},
                { text: 'Partial delivery amount', value: 'this_delivery_show', sortable: false},
                { text: 'Total delivered amount', value: 'delivered_amount_show', sortable: false},
                { text: 'Cost (€)', value: 'cost_show', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [-1]
            },
        }
    },
    mounted () {
        this.initialize();
        this.$root.$on('orderManagerOrdersReload',
            (order) => {
                this.initialize(order);
            }
        );

    },
    watch: {
        orderId () {
            this.initialize();
        },
        orderData () {
            this.initialize();
        },
    },
    methods: {
        initialize (order) {
            if (order !== undefined) {
                this.data.thisOrder = order;
            } else {
                this.data.thisOrder = this.orderData;
            }
            for (let ind in this.data.thisOrder.items) {
                if (this.data.thisOrder.items[ind].decimal === 0) {
                    this.$set(this.data.thisOrder.items[ind],
                        'ordered_amount_show',
                        this.data.thisOrder.items[ind].quantity
                    );
                    this.$set(this.data.thisOrder.items[ind],
                        'delivered_amount_show',
                        this.data.thisOrder.items[ind].delivered_quantity
                    );
                    this.$set(this.data.thisOrder.items[ind],
                        'original_ordered_amount',
                        this.data.thisOrder.items[ind].quantity
                    );
                } else {
                    this.$set(this.data.thisOrder.items[ind],
                        'ordered_amount_show',
                        this.data.thisOrder.items[ind].quantity_decimal
                    )
                    this.$set(this.data.thisOrder.items[ind],
                        'delivered_amount_show',
                        this.data.thisOrder.items[ind].delivered_quantity_decimal
                    );
                    this.$set(this.data.thisOrder.items[ind],
                        'original_ordered_amount_decimal',
                        this.data.thisOrder.items[ind].quantity_decimal
                    );
                }
                this.$set(this.data.thisOrder.items[ind],
                    'cost_show',
                    Number(this.data.thisOrder.items[ind].cost_tax).toFixed(2) + '€'
                )
                this.$set(this.data.thisOrder.items[ind],
                    'tax_show',
                    this.data.thisOrder.items[ind].tax
                )
            }
            this.$set(this.data.thisOrder,'original_total_cost',this.data.thisOrder.total_cost)
            this.$set(this.data.thisOrder,'original_total_cost_tax',this.data.thisOrder.total_cost_tax)
            this.$set(this.data.thisOrder,
                'total_cost_tax_show',
                this.data.thisOrder.total_cost_tax.toFixed(2)
            )
        },
        submitForm () {
            //this.$set(item, 'progress', true);
            this.progress = true;
            let personID = this.$store.state.session.personID;
            let urlUpdate = [];
            if (this.data.thisOrder.orderPending) {
                this.data.thisOrder.updateOrder = true;
            } else {
                this.data.thisOrder.partialDelivery = true;
            }
            urlUpdate.push({
                url: 'api/people/' + personID
                    + '/order-management/orders/' + this.data.thisOrder.id,
                body: this.data.thisOrder,
            });
            Promise.all(
                urlUpdate.map(el =>
                    this.$http.put(el.url,
                        { data: el.body, },
                        { headers:
                            {'Authorization': 'Bearer ' + localStorage['v2-token']
                        },
                    }))
            )
            .then( () => {
                this.progress = false;
                this.success = true;
                this.$root.$emit('orderManagerOrderUpdate');
                setTimeout(() => {
                    this.success = false;
                }
                , 1000)
            })
            .catch((err) => {
                this.progress = false;
                this.error = true;
                setTimeout(() => {
                    this.error = false;
                    //this.initialize();
                }
                , 1000)
                console.log(err)
            });
        },
        computeCostOrder (item) {
            if (item !== undefined
                &&
                ((item.decimal === 0
                    && (Number(item.quantity) >
                        Number(item.quantity_in_stock) -
                        (Number(item.quantity_in_requests) - Number(item.original_ordered_amount))
                        || Number(item.quantity) < 0)
                )
                ||
                (item.decimal === 1
                    && (Number(item.quantity_decimal) >
                        Number(item.quantity_in_stock_decimal) -
                        (Number(item.quantity_in_requests_decimal) - Number(item.original_ordered_amount_decimal))
                        || Number(item.quantity_decimal) < 0)
                )
                ||( item.decimal === 0 && Number.isNaN(Number(item.quantity)))
                ||( item.decimal === 1 && Number.isNaN(Number(item.quantity_decimal))))
                ) {
                this.$set(item, 'errorStock', true);
            } else {
                if (item !== undefined) {
                    this.$set(item, 'errorStock', false);
                    this.$set(item, 'changed_by_manager', true);
                    let cost = 0;
                    let cost_tax = 0;
                    if (item.decimal === 0) {
                        cost = Number(item.quantity) * item.current_unit_price
                        cost_tax = Number(item.quantity) * item.current_unit_price * (1.0 + item.tax / 100.0)
                    } else {
                        cost = Number(item.quantity_decimal) * item.current_unit_price
                        cost_tax = Number(item.quantity_decimal) * item.current_unit_price * (1.0 + item.tax / 100.0)
                    }
                    cost = cost.toFixed(2);
                    cost_tax = cost_tax.toFixed(2);
                    this.$set(item, 'cost_tax', cost_tax);
                    this.$set(item, 'cost', cost);
                    this.$set(item, 'cost_show', cost_tax + '€');
                }
                this.data.thisOrder.order_cost_tax = 0.0;
                this.data.thisOrder.order_cost = 0.0;
                for (let ind in this.data.thisOrder.items) {
                    this.data.thisOrder.order_cost_tax = this.data.thisOrder.order_cost_tax + Number(this.data.thisOrder.items[ind].cost_tax);
                    this.data.thisOrder.order_cost = this.data.thisOrder.order_cost + Number(this.data.thisOrder.items[ind].cost);
                }
                this.$set(this.data.thisOrder, 'cost_difference', Number(Number(this.data.thisOrder.order_cost - this.data.thisOrder.original_total_cost).toFixed(2)))
                this.$set(this.data.thisOrder, 'cost_difference_tax', Number(Number(this.data.thisOrder.order_cost_tax - this.data.thisOrder.original_total_cost_tax).toFixed(2)))
                this.$set(this.data.thisOrder, 'total_cost_tax', Number(Number(this.data.thisOrder.order_cost_tax).toFixed(2)))
                this.$set(this.data.thisOrder, 'total_cost_tax_show', this.data.thisOrder.order_cost_tax.toFixed(2))
            }
        },
        checkPartialAmounts (item) {
            if (item !== undefined
                &&
                ((item.decimal === 0
                    && (Number(item.this_delivery) + Number(item.delivered_quantity) >
                        Number(item.quantity))
                )
                ||
                (item.decimal === 1
                    && (Number(item.this_delivery_decimal) + Number(item.delivered_quantity_decimal) >
                        Number(item.quantity_decimal))
                )
                ||( item.decimal === 0 && Number.isNaN(Number(item.this_delivery)))
                ||( item.decimal === 1 && Number.isNaN(Number(item.this_delivery_decimal))))
                ) {
                this.$set(item, 'errorPartialAmount', true);
            } else {
                this.$set(item, 'errorPartialAmount', false);
            }
        },
    },
}
</script>

<style scoped>
.price-highlight .total-text{
    font-weight: 500;
    margin-right: 10px;
}

.price-highlight {
    font-size: 1.2em;
    border: solid;
}

</style>