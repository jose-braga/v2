<template>
<v-card class="px-3">
    <v-card-title>
        Details of order: {{orderData.order_id}}
    </v-card-title>
    <v-card-text>
    </v-card-text>
    <v-data-table class="ma-2"
        item-key="id"
        :headers="headers"
        :footer-props="footerProps"
        :items="orderData.items"
        :sort-by="['name_en']"
        :sort-desc="[false]"
        multi-sort
        dense
    >
    </v-data-table>
    <v-row justify="end" align="center">
        <v-col cols="6" sm="3" xl="2" class="price-highlight mt-2 mr-10 mb-4">
            <v-row justify="center">
                <span class="total-text">Total:</span> {{orderData.total_cost_tax}} €
            </v-row>
        </v-col>
    </v-row>
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
            headers: [
                { text: 'Prod. Name', value:'name_en' },
                { text: 'Brand', value:'brand' },
                { text: 'Reference', value:'reference' },
                { text: 'Ordered amount', value: 'ordered_amount_show', sortable: false},
                { text: 'Delivered amount', value: 'delivered_amount_show', sortable: false},
                { text: 'Tax (%)', value: 'tax_show', sortable: false},
                { text: 'Cost (€)', value: 'cost_show', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [-1]
            },
        }
    },
    mounted () {
        this.initialize();

    },
    watch: {
        orderId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            for (let ind in this.orderData.items) {
                if (this.orderData.items[ind].decimal === 0) {
                    this.$set(this.orderData.items[ind],
                        'ordered_amount_show',
                        this.orderData.items[ind].quantity
                    );
                    this.$set(this.orderData.items[ind],
                        'delivered_amount_show',
                        this.orderData.items[ind].delivered_quantity
                    );
                } else {
                    this.$set(this.orderData.items[ind],
                        'ordered_amount_show',
                        this.orderData.items[ind].quantity_decimal
                    )
                    this.$set(this.orderData.items[ind],
                        'delivered_amount_show',
                        this.orderData.items[ind].delivered_quantity_decimal
                    );
                }
                this.$set(this.orderData.items[ind],
                    'cost_show',
                    Number(this.orderData.items[ind].cost_tax).toFixed(2) + '€'
                )
                this.$set(this.orderData.items[ind],
                    'tax_show',
                    this.orderData.items[ind].tax
                )

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