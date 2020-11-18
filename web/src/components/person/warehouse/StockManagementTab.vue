<template>
<div>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Stock</h3>
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
        :custom-sort="customSort"
        :sort-by="['item_categories', 'name_en']"
        :sort-desc="[false, false]"
        multi-sort
        dense
    >
        <template v-slot:item.item_categories="{ item }">
            <v-select v-model="item.item_categories"
                :items="productTypes" item-value="id" item-text="name_en"
                @change="changedItem(item)"
                multiple
                return-object
                dense
                class="product-categories"
            >
            </v-select>
        </template>
        <template v-slot:item.name_en="{ item }">
            <v-text-field v-model="item.name_en"
                @input="changedItem(item)"
                dense
                class="product-name"
            >
            </v-text-field>
        </template>
        <template v-slot:item.brand="{ item }">
            <v-text-field v-model="item.brand"
                @input="changedItem(item)"
                dense
                class="product-brand"
            >
            </v-text-field>
        </template>
        <template v-slot:item.reference="{ item }">
            <v-text-field v-model="item.reference"
                @input="changedItem(item)"
                dense
                class="product-reference"
            >
            </v-text-field>
        </template>
        <template v-slot:item.current_unit_price="{ item }">
            <v-text-field v-model="item.current_unit_price"
                @input="changedItem(item)"
                dense
                class="product-price"
            >
            </v-text-field>
        </template>
        <template v-slot:item.tax="{ item }">
            <v-text-field v-model="item.tax"
                @input="changedItem(item)"
                dense
                class="product-tax"
            >
            </v-text-field>
        </template>
        <template v-slot:item.in_stock="{ item }">
            <v-text-field v-if="item.decimal === 0"
                v-model="item.quantity_in_stock"
                @input="changedItem(item)"
                dense
                class="product-in-stock"
            >
            </v-text-field>
            <v-text-field v-else
                v-model="item.quantity_in_stock_decimal"
                @input="changedItem(item)"
                dense
                class="product-in-stock"
            >
            </v-text-field>
        </template>
        <template v-slot:item.in_requests="{ item }">
            <v-text-field v-if="item.decimal === 0"
                v-model="item.quantity_in_requests"
                @input="changedItem(item)"
                dense
                class="product-in-requests"
            >
            </v-text-field>
            <v-text-field v-else
                v-model="item.quantity_in_requests_decimal"
                @input="changedItem(item)"
                dense
                class="product-in-requests"
            >
            </v-text-field>
        </template>
        <template v-slot:item.quantity_type_name="{ item }">
            <v-select v-model="item.quantity_type_id"
                :items="quantityTypes" item-value="id" item-text="name_singular_en"
                @change="changedItem(item)"
                dense
                class="product-status"
            >
            </v-select>
        </template>
        <template v-slot:item.status="{ item }">
            <v-select v-model="item.status_id"
                :items="itemStatus" item-value="id" item-text="name_en"
                @change="changedItem(item)"
                dense
                class="product-status"
            >
            </v-select>
        </template>
        <template v-slot:item.visible="{ item }">
            <v-checkbox v-model="item.visible"
                @change="changedItem(item)"
                dense
            >
            </v-checkbox>
        </template>
        <template v-slot:item.action="{ item }">
            <v-icon
                color="red darken"
                @click="removeItem(data.inventory, item)"
                class="product-delete mb-2"
            >mdi-delete</v-icon>
        </template>
    </v-data-table>
    <v-container>
        <v-row align-content="center" justify="end">
            <v-col cols="2" align-self="end">
                <v-row justify="end">
                    <v-btn
                        @click="submitChanges"
                        large
                        outlined color="blue"
                    >Save</v-btn>
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
        <v-row align-content="center" justify="start">
            <h3 class="headline ml-4">Add new item to stock</h3>
        </v-row>
        <v-row align-content="center" justify="start">
            <v-col cols="12" md="2">
                <v-select v-model="$v.newItem.item_categories.$model"
                    :items="productTypes" item-value="id" item-text="name_en"
                    multiple
                    return-object
                    label="Prod. type"
                >
                </v-select>
            </v-col>
            <v-col cols="12" md="4">
                <v-text-field v-model="$v.newItem.name_en.$model"
                    :error="$v.newItem.name_en.$error"
                    label="Prod. name"
                >
                </v-text-field>
            </v-col>
            <v-col cols="12" md="2">
                <v-text-field v-model="$v.newItem.brand.$model"
                    :error="$v.newItem.brand.$error"
                    label="Brand"
                >
                </v-text-field>
            </v-col>
            <v-col cols="12" md="2">
                <v-text-field v-model="$v.newItem.reference.$model"
                    :error="$v.newItem.reference.$error"
                    label="Reference"
                >
                </v-text-field>
            </v-col>
        </v-row>
        <v-row align-content="center" justify="start">
            <v-col cols="6" md="2">
                <v-text-field v-model="$v.newItem.current_unit_price.$model"
                    :error="$v.newItem.current_unit_price.$error"
                    label="Price(€)/unit"
                >
                </v-text-field>
            </v-col>
            <v-col cols="6" md="2">
                <v-text-field v-model="$v.newItem.tax.$model"
                    :error="$v.newItem.tax.$error"
                    label="Tax(%)"
                >
                </v-text-field>
            </v-col>
            <v-col cols="12" md="2">
                <v-select v-model="$v.newItem.quantity_type_id.$model"
                    :error="$v.newItem.quantity_type_id.$error"
                    :items="quantityTypes" item-value="id" item-text="name_singular_en"
                    @change="checkUnitIsDecimal()"
                    label="Unit type"
                >
                </v-select>
            </v-col>
            <v-col cols="12" md="2">
                <v-text-field  v-if="!newItem.decimal"
                    v-model="$v.newItem.quantity_in_stock.$model"
                    :error="$v.newItem.quantity_in_stock.$error"
                    label="In stock"
                >
                </v-text-field>
                <v-text-field  v-else
                    v-model="$v.newItem.quantity_in_stock_decimal.$model"
                    :error="$v.newItem.quantity_in_stock_decimal.$error"
                    label="In stock"
                >
                </v-text-field>
            </v-col>
            <v-col cols="12" md="2">
                <v-select v-model="$v.newItem.status_id.$model"
                    :error="$v.newItem.status_id.$error"
                    :items="itemStatus" item-value="id" item-text="name_en"
                    label="Status"
                >
                </v-select>
            </v-col>
            <v-col cols="12" md="2" align-self="end">
                <v-checkbox v-model="$v.newItem.visible.$model"
                    label="Visible"
                >
                </v-checkbox>
            </v-col>
        </v-row>
        <v-row align-content="center" justify="end">
            <v-col cols="2" align-self="end">
                <v-row justify="end">
                    <v-btn
                        @click="addNewItem(newItem)"
                        large
                        outlined color="blue"
                    >Add new</v-btn>
                </v-row>
            </v-col>
            <v-col cols="1">
                <v-progress-circular indeterminate
                        v-show="progressNew"
                        :size="20" :width="2"
                        color="primary"></v-progress-circular>
                <v-icon v-show="successNew" color="green">mdi-check</v-icon>
                <v-icon v-show="errorNew" color="red">mdi-alert-circle-outline</v-icon>
            </v-col>
        </v-row>
    </v-container>
</v-card>
</div>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import {maxLength, required, requiredIf, integer, decimal} from 'vuelidate/lib/validators'
import {orderBy} from 'lodash'

export default {
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            progressNew: false,
            successNew: false,
            errorNew: false,
            errorMessage: '',
            formError: false,
            dialog: false,
            editedIndex: undefined,
            editedItem: {},
            productTypes: [],
            itemStatus: [],
            quantityTypes: [],
            data: {
                inventory: [],
            },
            newItem: {
                item_categories: [],
                name_en: null,
                brand: null,
                reference: null,
                current_unit_price: null,
                tax: null,
                quantity_in_stock: null,
                quantity_in_stock_decimal: null,
                quantity_type_id: null,
                status_id: null,
                visible: true,
                decimal: false,
            },
            toUpdate: [],
            toDelete: [],
            search: '',
            headers: [
                { text: 'Prod. type', value:'item_categories', width: '5%' },
                { text: 'Prod. name', value:'name_en', width: '15%' },
                { text: 'Brand', value:'brand', width: '8%' },
                { text: 'Reference', value:'reference', sortable: false },
                { text: 'Price (€)', value: 'current_unit_price'},
                { text: 'Tax', value: 'tax', sortable: false},
                { text: 'In Stock', value: 'in_stock', sortable: false},
                { text: 'In requests', value: 'in_requests', sortable: false},
                { text: 'Unit type', value: 'quantity_type_name', sortable: false},
                { text: 'Status', value: 'status', sortable: false},
                { text: 'Visible', value: 'visible', sortable: false},
                { text: 'Delete', value: 'action', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
        }
    },
    mounted () {
        this.initialize();
        this.getProductTypes();
        this.getProductStatus();
        this.getQuantityTypes();
    },
    watch: {
        $route () {
            this.initialize();
            this.getProductTypes();
            this.getProductStatus();
            this.getQuantityTypes();
        },
    },
    methods: {
        initialize () {
            this.data.inventory = [];
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                return subUtil.getInfoPopulate(this, 'api/people/' + personID + '/stock-management/inventory', true)
                .then( (result) => {
                    this.data.inventory = result;
                    for (let ind in this.data.inventory) {
                        if (this.data.inventory[ind].visible === 1) {
                            this.$set(this.data.inventory[ind], 'visible', true);
                        } else {
                            this.$set(this.data.inventory[ind], 'visible', false);
                        }
                    }
                })
            }
        },
        submitChanges () {
            this.progress = true;
            let personID = this.$store.state.session.personID;
            let urlUpdate = [];
            let urlDelete = [];
            for (let ind in this.toUpdate) {
                urlUpdate.push({
                    url: 'api/people/' + personID
                        + '/stock-management/inventory/' + this.toUpdate[ind].stock_id,
                    body: this.toUpdate[ind],
                });
            }
            for (let ind in this.toDelete) {
                urlDelete.push({
                    url: 'api/people/' + personID
                        + '/stock-management/inventory/' + this.toDelete[ind].stock_id,
                });
            }
            this.$http.all(
                urlUpdate.map(el =>
                    this.$http.put(el.url,
                        { data: el.body, },
                        { headers:
                            { 'Authorization': 'Bearer ' + localStorage['v2-token'] },
                        }
                ))
                .concat(
                    urlDelete.map(el =>
                        this.$http.delete(el.url,
                            { headers:
                                { 'Authorization': 'Bearer ' + localStorage['v2-token'] },
                            }
                )))
            )
            .then(this.$http.spread( () => {
                this.progress = false;
                this.success = true;
                setTimeout(() => {this.success = false;}, 1500)
                this.toDelete = [];
                this.toUpdate = [];
                this.initialize();
            }))
            .catch((error) => {
                this.progress = false;
                this.error = true;
                this.toDelete = [];
                this.toUpdate = [];
                this.initialize();
                setTimeout(() => {this.error = false;}, 6000)
                // eslint-disable-next-line
                console.log(error)
            })


        },
        addNewItem(item) {
            if (this.$v.$invalid) {
                this.$v.$touch()
            } else {
                this.progressNew = true;
                let personID = this.$store.state.session.personID;
                let urlCreate = [];
                urlCreate.push({
                    url: 'api/people/' + personID
                        + '/stock-management/inventory',
                    body: item,
                });
                this.$http.all(
                    urlCreate.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                { 'Authorization': 'Bearer ' + localStorage['v2-token'] },
                            }
                        ))
                )
                .then(this.$http.spread( () => {
                    this.progressNew = false;
                    this.successNew = true;
                    setTimeout(() => {
                        this.successNew = false;
                        this.$v.$reset();
                        this.newItem = {
                            item_categories: [],
                            name_en: null,
                            brand: null,
                            reference: null,
                            current_unit_price: null,
                            tax: null,
                            quantity_in_stock: null,
                            quantity_in_stock_decimal: null,
                            quantity_type_id: null,
                            status_id: null,
                            visible: true,
                            decimal: false,
                        };
                        this.initialize();
                    }, 1500);
                }))
                .catch((error) => {
                    this.progressNew = false;
                    this.errorNew = true;
                    setTimeout(() => {
                        this.$v.$reset();
                        this.newItem = {
                            item_categories: [],
                            name_en: null,
                            brand: null,
                            reference: null,
                            current_unit_price: null,
                            tax: null,
                            quantity_in_stock: null,
                            quantity_in_stock_decimal: null,
                            quantity_type_id: null,
                            status_id: null,
                            visible: true,
                            decimal: false,
                        };
                        this.errorNew = false;
                        this.initialize();
                    }, 3000)

                    console.log(error)
                })
            }
        },
        getProductTypes() {
            var this_vm = this;
            const urlSubmit = 'api/v2/' + 'warehouse-product-types';
            subUtil.getPublicInfo(this_vm, urlSubmit, 'productTypes');
        },
        getProductStatus() {
            var this_vm = this;
            const urlSubmit = 'api/v2/' + 'warehouse-item-status';
            subUtil.getPublicInfo(this_vm, urlSubmit, 'itemStatus');
        },
        getQuantityTypes() {
            var this_vm = this;
            const urlSubmit = 'api/v2/' + 'warehouse-quantity-units';
            subUtil.getPublicInfo(this_vm, urlSubmit, 'quantityTypes');
        },
        changedItem (item) {
            let found = false;
            for (let ind in this.toUpdate) {
                if (item.id === this.toUpdate[ind].id) {
                    found = true;
                    this.toUpdate[ind] = item;
                    break;
                }
            }
            if (!found) {
                this.toUpdate.push(item);
            }
        },
        removeItem(list, item) {
            for (let ind in this.toUpdate) {
                if (item.id === this.toUpdate[ind].id) {
                    this.toUpdate.splice(ind, 1);
                    break;
                }
            }
            let indRemove;
            for (let ind in list) {
                if (item.id === list[ind].id) {
                    indRemove = ind;
                    break;
                }
            }
            if (list[indRemove].id !== 'new') {
                this.toDelete.push(list[indRemove]);
            }
            list.splice(indRemove, 1);
        },
        checkUnitIsDecimal () {
            for (let ind in this.quantityTypes) {
                if (this.newItem.quantity_type_id === this.quantityTypes[ind].id) {
                    if (this.quantityTypes[ind].decimal === 1
                        || this.quantityTypes[ind].decimal === true ) {
                        this.newItem.decimal = true;
                        return;
                    }
                }
            }
            this.newItem.decimal = false;
        },
        customSort (items, sortBy, sortDesc) {
            let funcOrderArray = [];
            let directionArray = [];
            for (let ind in sortBy) {
                if (sortDesc[ind] === false) {
                    directionArray.push('asc');
                } else {
                    directionArray.push('desc');
                }
                // special cases when a column is sorted based on a different 'hidden' value
                if (sortBy[ind] === 'item_categories') {
                    funcOrderArray.push(
                        function (el) {
                            return el.item_categories[0].name_en;
                        }
                    )
                } else {
                    funcOrderArray.push(
                        function (el) {
                            let levels = sortBy[ind].split('.');
                            let thisLevel = el;
                            for (let indLevel in levels) {
                                thisLevel = thisLevel[levels[indLevel]];
                                if (thisLevel === undefined) {
                                    break;
                                }
                            }
                            return thisLevel;
                        }
                    )
                }
            }
            items = orderBy(items, funcOrderArray, directionArray);

            return items
        },
    },
    validations: {
        newItem: {
            item_categories: {},
            name_en: { required, maxLength: maxLength(200)},
            brand: { required, maxLength: maxLength(45)},
            reference: { required, maxLength: maxLength(45)},
            current_unit_price: { required, decimal },
            tax: { required, decimal },
            quantity_in_stock: { required, integer },
            quantity_in_stock_decimal: {
                required: requiredIf(function () { return this.newItem.decimal }),
                decimal,
            },
            quantity_type_id: { required },
            status_id: { required },
            visible: { },
        },
    }
}
</script>

<style scoped>
.product-categories,
.product-name,
.product-brand,
.product-reference,
.product-price,
.product-tax,
.product-in-stock,
.product-in-requests,
.product-status,
.product-in-delete
 {
    font-size: 0.7em;
}

v-data-table tr,
v-data-table td{
    height: 50px;
}

.v-input--selection-controls {
    margin-top: 0px;
}
</style>
