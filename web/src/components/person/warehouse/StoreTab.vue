<template>
<div>
    <v-container v-if="data.accounts.length > 1" class="mt-4 px-4">
        <v-row>
            <b>Please select the account through which you will make the orders:</b>
        </v-row>
        <v-row>
            <v-select v-model="data.chosenAccount"
                :items="data.accounts" item-value="account_id" item-text="full_name"
                @change="getOrdersHistory()"
                return-object
                label="Account@Cost Center">
            </v-select>
        </v-row>
    </v-container>
    <v-container v-if="data.accounts.length === 0">
        <b>You are not associated to any warehouse account. Contact warehouse manager.</b>
    </v-container>
    <v-container v-if="data.chosenAccount">
        <v-row>
            <v-col cols="12"
            >
                <v-card>
                    <v-card-title primary-title>
                        <div>
                            <h3 class="headline">Inventory</h3>
                        </div>
                    </v-card-title>
                    <v-card-text class="px-4">
                    </v-card-text>
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search prod. type, name, brand or reference"
                        single-line
                        hide-details
                        class="px-2 mb-4"
                    ></v-text-field>
                    <v-data-table
                        item-key="id"
                        :search="search"
                        :headers="headers"
                        :footer-props="footerProps"
                        :items="data.inventory"
                        :items-per-page="10"

                        :sort-by="['categories_text', 'name_en']"
                        :sort-desc="[false, false]"
                        multi-sort
                        dense
                    >
                        <template v-slot:item.status_icon="{ item }">
                            <div v-if="item.status_en === 'Available'">
                                <v-icon
                                    color="green darken-1"
                                >mdi-check</v-icon>
                            </div>
                            <div v-if="item.status_en === 'Ordered to supplier'">
                                <v-icon
                                    color="yellow darken-1"
                                >mdi-clock</v-icon>
                            </div>
                            <div v-if="item.status_en === 'Unavailable'">
                                <v-icon
                                    color="red darken-1"
                                >mdi-close-thick</v-icon>
                            </div>
                        </template>
                        <template v-slot:item.action="{ item }">
                            <v-icon
                                @click="addToCart(item)"
                            >mdi-cart-arrow-down</v-icon>
                        </template>


                    </v-data-table>
                </v-card>
            </v-col>
            <v-col cols="12">
                <v-card color="blue lighten-5" class="pb-2">
                    <v-card-title primary-title>
                        <div>
                            <h3 class="headline">Shopping cart</h3>
                        </div>
                    </v-card-title>
                    <v-card-text class="px-4">
                    </v-card-text>
                    <v-data-table
                        item-key="id"
                        :headers="headersCart"
                        :footer-props="footerPropsCart"
                        :items="data.cart"
                        :items-per-page="-1"
                        :sort-by="['categories_text', 'name_en']"
                        :sort-desc="[false, false]"
                        multi-sort
                        dense
                        class="blue lighten-5"
                    >
                        <template v-slot:item.order_amount_show="{ item }">
                            <v-text-field
                                v-model="item.amount_to_order"
                                :error="item.errorStock"
                                @input="computeCostOrder(item)"
                                single-line
                                hide-details
                                class="mb-4"
                            ></v-text-field>

                        </template>
                        <template v-slot:item.cost_show="{ item }">
                            {{ item.cost_show }}
                        </template>
                        <template v-slot:item.action="{ item }">
                            <v-icon
                                @click="removeFromCart(item)"
                            >mdi-cart-arrow-up</v-icon>
                        </template>
                    </v-data-table>
                    <v-row justify="end" align="center">
                        <v-col cols="6" sm="3" xl="2" class="price-highlight mt-2 mr-10 mb-4">
                            <v-row justify="center">
                                <span class="total-text">Total:</span>{{data.order_cost}} €
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-row align-content="center" justify="end"  class="mb-1">
                        <v-col cols="3" v-if="formError">
                            <v-row justify="end">
                                <p class="caption red--text">Check errors in amounts requested!</p>
                            </v-row>
                        </v-col>
                        <v-col cols="3" v-if="error">
                            <v-row justify="end">
                                <p class="caption red--text">{{this.errorMessage}}</p>
                            </v-row>
                        </v-col>
                        <v-col cols="2" align-self="end">
                            <v-row justify="end">
                                <v-btn
                                    @click="submitOrder"
                                    large
                                    outlined color="red"
                                >Order</v-btn>
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
                </v-card>
            </v-col>
            <v-col cols="12" v-if="data.currentFinances"
            >
                <v-card>
                    <v-card-title primary-title>
                        <div>
                            <h3 class="headline">Orders and Financial Information</h3>
                        </div>
                    </v-card-title>
                    <v-card-text class="px-4">
                    </v-card-text>
                    <v-row justify="start">
                        <v-col cols="12" md="4">
                            <div class="financial-information pa-2 ml-3 mt-2 mr-3">
                                <p><b>Financial Information for {{data.chosenAccount.account_name}}@{{data.chosenAccount.cost_center_name}}</b>:</p>
                                <p>Current available amount: <b>{{data.currentFinances.current_amount_tax}}€</b></p>
                                <p>Amount in pending requests: <b>{{data.currentFinances.amount_requests_tax}}€</b></p>
                                <p>Total funds allocated in {{data.currentFinances.year}}: <b>{{data.currentFinances.initial_amount}}€</b></p>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row justify="start">
                        <v-col cols="12">
                            <v-data-table
                                item-key="id"
                                :headers="headersOrders"
                                :footer-props="footerPropsOrders"
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
                                            :order-id="editedItem.order_id"
                                            :order-data="editedItem"
                                        >
                                        </OrderDetails>
                                    </v-dialog>
                                </template>
                                <template v-slot:item.action="{ item }">
                                    <v-icon
                                        @click="orderDetails(item)"
                                    >mdi-format-list-bulleted</v-icon>
                                </template>
                            </v-data-table>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
            <v-col cols="12" v-else
            >
                <v-card>
                    <v-card-title primary-title>
                        <div>
                            <h3 class="headline">Orders and Financial Information</h3>
                        </div>
                    </v-card-title>
                    <v-card-text class="px-4">
                        No financial information for the current year was found!<br>
                        Please contact warehouse manager.
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</div>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'
import OrderDetails from './OrderDetails'

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
                accounts: [],
                inventory: [],
                orders: [],
                finances: [],
                currentFinances: null,
                cart: [],
                order_cost: 0,
                chosenAccount: undefined
            },
            toDelete: [],
            search: '',
            headers: [
                { text: 'Prod. Type', value:'categories_text' },
                { text: 'Prod. Name', value:'name_en' },
                { text: 'Brand', value:'brand' },
                { text: 'Reference', value:'reference' },
                { text: 'Price', value: 'price_text', sortable: false},
                { text: 'Tax (%)', value: 'tax_text', sortable: false},
                { text: 'Available', value: 'available_text', sortable: false},
                { text: 'Status', value: 'status_icon', sortable: false},
                { text: 'Add', value: 'action', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            headersCart: [
                { text: 'Prod. Type', value:'categories_text' },
                { text: 'Prod. Name', value:'name_en' },
                { text: 'Brand', value:'brand' },
                { text: 'Reference', value:'reference' },
                { text: 'Price', value: 'price_text', sortable: false},
                { text: 'Tax (%)', value: 'tax_text', sortable: false},
                { text: 'Available', value: 'available_text', sortable: false},
                { text: 'Order amount', value: 'order_amount_show', sortable: false},
                { text: 'Cost (€)', value: 'cost_show', sortable: false},
                { text: 'Remove', value: 'action', sortable: false},
            ],
            footerPropsCart: {
                'items-per-page-options': [-1]
            },
            headersOrders: [
                { text: 'ID', value:'order_id' },
                { text: 'Date', value:'datetime' },
                { text: 'User', value:'user_ordered_name' },
                { text: 'Cost', value:'total_cost_tax' },
                { text: 'Status', value:'last_status.name_en' },
                { text: 'Info', value: 'action', sortable: false},
            ],
            footerPropsOrders: {
                'items-per-page-options': [10,20,50,-1]
            },
        }
    },
    mounted () {
        this.initialize();
    },
    watch: {
        $route () {
            this.initialize();
            if (this.data.chosenAccount !== undefined) {
                this.getOrdersHistory();
            }
        },
    },
    methods: {
        initialize () {
            this.data.accounts = [];
            this.data.inventory = [];
            if (this.$store.state.session.loggedIn) {
                this.getUserAccounts();
                this.getInventory();
            } else {
                this.$refs.form.reset();
            }
        },
        getUserAccounts () {
            let personID = this.$store.state.session.personID;
            subUtil.getInfoPopulate(this, 'api/people/' + personID + '/store', true)
            .then( (result) => {
                for (let ind in result) {
                    this.$set(this.data.accounts, ind, {});
                    Object.keys(result[ind]).forEach(key => {
                        let value = result[ind][key];
                        this.$set(this.data.accounts[ind], key, value);
                    });
                    this.$set(this.data.accounts[ind], 'full_name',
                        result[ind].account_name + '@'
                        + result[ind].cost_center_name);
                }
                if (result.length === 1) {
                    this.data.chosenAccount = this.data.accounts[0];
                    this.getOrdersHistory();
                }
            })
        },
        getInventory () {
            let personID = this.$store.state.session.personID;
            return subUtil.getInfoPopulate(this, 'api/people/' + personID + '/store/inventory', true)
            .then( (result) => {
                for (let ind in result) {
                    this.$set(this.data.inventory, ind, {});
                    Object.keys(result[ind]).forEach(key => {
                        let value = result[ind][key];
                        this.$set(this.data.inventory[ind], key, value);
                    });
                    let categories_text = '';
                    for (let indCat in result[ind].item_categories) {
                        if (indCat === '0') {
                            categories_text = categories_text
                                + result[ind].item_categories[indCat].name_en
                        } else {
                            categories_text = categories_text + ', '
                                + result[ind].item_categories[indCat].name_en
                        }
                    }
                    this.$set(this.data.inventory[ind], 'categories_text',
                        categories_text);
                    this.$set(this.data.inventory[ind], 'price_text',
                        Number(result[ind].current_unit_price).toFixed(2) + ' €/'
                        + result[ind].unit_singular_en
                    );
                    this.$set(this.data.inventory[ind], 'tax_text',
                        result[ind].tax
                    );
                    let available_text = '';
                    let available_number;
                    if (this.data.inventory[ind].decimal) {
                        available_number = result[ind].quantity_in_stock_decimal
                            - result[ind].quantity_in_requests_decimal
                        available_text = available_text
                            + available_number
                            + ' ' + result[ind].unit_plural_en;
                    } else {
                        available_number = result[ind].quantity_in_stock
                            - result[ind].quantity_in_requests
                        if (available_number === 1) {
                            available_text = available_text
                                + available_number
                                + ' ' + result[ind].unit_singular_en;
                        } else {
                            available_text = available_text
                                + available_number
                                + ' ' + result[ind].unit_plural_en;
                        }
                    }
                    this.$set(this.data.inventory[ind], 'available_text',
                        available_text
                    );
                }
            })
        },
        getOrdersHistory () {
            this.data.cart = [];
            let personID = this.$store.state.session.personID;
            subUtil.getInfoPopulate(this, 'api/people/' + personID
                + '/store/accounts/' + this.data.chosenAccount.account_id + '/orders',
                true)
            .then( (result) => {
                this.data.orders = result;
            })
            subUtil.getInfoPopulate(this, 'api/people/' + personID
                + '/store/accounts/' + this.data.chosenAccount.account_id + '/finances',
                true)
            .then( (result) => {
                this.data.finances = result;
                for (let ind in result) {
                    if (result[ind].year === time.moment().year()) {
                        this.data.currentFinances = result[ind];
                        break;
                    }
                }
            })


        },
        submitOrder () {
            this.formError = false;
            for (let ind in this.data.cart) {
                if (this.data.cart[ind].errorStock) {
                    this.formError = true;
                }
            }
            if (!this.formError) {
                this.progress = true;
                let personID = this.$store.state.session.personID;
                let urlCreate = [];
                urlCreate.push({
                    url: 'api/people/' + personID
                        + '/store/accounts/' + this.data.chosenAccount.account_id,
                    body: this.data.cart,
                });

                Promise.all(
                    urlCreate.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                )
                .then( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {
                        this.success = false;
                        this.data.cart = [];
                        this.data.order_cost = 0;
                        this.getInventory();
                        this.getOrdersHistory();
                    }
                    , 2500)
                    this.toDelete = [];

                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    // insert here the code for error message
                    if (error.response) {
                        this.errorMessage = error.response.data.message
                    }
                    this.toDelete = [];
                    setTimeout(() => {
                        this.getInventory()
                        .then (() => {
                            for (let ind in this.data.cart) {
                                let original_amount_to_order = this.data.cart[ind].amount_to_order;
                                for (let indStock in this.data.inventory) {
                                    if (this.data.cart[ind].id === this.data.inventory[indStock].id) {
                                        if ((this.data.cart[ind].decimal === 0
                                                && (Number(original_amount_to_order) >
                                                    Number(this.data.inventory[indStock].quantity_in_stock) - Number(this.data.inventory[indStock].quantity_in_requests)
                                                    || Number(original_amount_to_order) < 0)
                                            )
                                            ||
                                            (this.data.cart[ind].decimal === 1
                                                && (Number(original_amount_to_order) >
                                                    Number(this.data.inventory[indStock].quantity_in_stock_decimal) - Number(this.data.inventory[indStock].quantity_in_requests_decimal)
                                                    || Number(original_amount_to_order) < 0)
                                            )
                                            || Number.isNaN(Number(original_amount_to_order))
                                            ) {
                                                this.$set(this.data.cart, ind, this.data.inventory[indStock]);
                                                this.$set(this.data.cart[ind], 'amount_to_order', original_amount_to_order);
                                                this.$set(this.data.cart[ind], 'errorStock', true);
                                        }
                                        break;
                                    }
                                }
                            }
                            //this.errorMessage = 'Stock levels are now updated to latest values.';
                            setTimeout(() => {
                                this.error = false;
                                this.errorMessage = '';
                            }
                            , 5000)
                        })
                    }
                    , 3000)
                    // eslint-disable-next-line
                    console.log(error)
                })

            }

        },
        computeCostOrder (item) {
            if (item !== undefined
                &&
                ((item.decimal === 0
                    && (Number(item.amount_to_order) >
                        Number(item.quantity_in_stock) - Number(item.quantity_in_requests)
                        || Number(item.amount_to_order) < 0)
                )
                ||
                (item.decimal === 1
                    && (Number(item.amount_to_order) >
                        Number(item.quantity_in_stock_decimal) - Number(item.quantity_in_requests_decimal)
                        || Number(item.amount_to_order) < 0)
                )
                || Number.isNaN(Number(item.amount_to_order)))
                ) {
                this.$set(item, 'errorStock', true);
            } else {
                if (item !== undefined) {
                    this.$set(item, 'errorStock', false);
                    let cost = item.amount_to_order * item.current_unit_price * (1.0 + item.tax / 100.0)
                    cost = cost.toFixed(2);
                    this.$set(item, 'cost', cost);
                    this.$set(item, 'cost_show', cost);
                }
                this.data.order_cost = 0.0;
                for (let ind in this.data.cart) {
                    this.data.order_cost = this.data.order_cost + Number(this.data.cart[ind].cost);
                }
                this.data.order_cost = this.data.order_cost.toFixed(2)
            }
        },
        addToCart(item) {
            let found = false;
            for (let ind in this.data.cart) {
                if (this.data.cart[ind].id === item.id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                item.amount_to_order = 0;
                this.$set(item, 'cost', 0)
                this.$set(item, 'cost_show', 0)
                this.data.cart.push(item)
            }
        },
        removeFromCart(item) {
            for (let ind in this.data.cart) {
                if (this.data.cart[ind].id === item.id) {
                    this.data.cart.splice(ind, 1);
                    this.computeCostOrder();
                    break;
                }
            }
        },
        orderDetails (item) {
            this.dialog = true;
            this.editedIndex = this.data.orders.indexOf(item);
            this.editedItem = item;
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

.financial-information {
    font-size: 0.8em;
    line-height: 0.7em;
    border: solid 1px;
}

</style>
