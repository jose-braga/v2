<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Help for "Store" Tab</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <v-container>
                <v-row>
                    <v-col cols="12" md="3">
                        <b>Inventory</b>
                    </v-col>
                    <v-col cols="12" md="9">
                        This shows a table of the items currently in stock. The table
                        is sorted by Product Type and then by Product Name, but you
                        can also sort by Brand and Reference.<br>
                        Clicking on the "shopping cart" item on the right adds the item
                        to the Shopping Cart section (see below). You can add multiple
                        items to the shopping cart.<br>
                        To help you finding your desired items there is a search field
                        which will search items based on Product Type, Name, Brand
                        and Reference.
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" md="3">
                        <b>Shopping Cart</b>
                    </v-col>
                    <v-col cols="12" md="9">
                        After an item is added to the shopping cart, you have to
                        define the amount you want of that item. The total for
                        that order is updated accordingly.<br>
                        You can remove items from the shopping cart.
                        The order is finalized by pressing "Order". The order information
                        is sent to the server which will check the most up to date
                        existing stock amounts. If everything is OK the order is placed,
                        otherwise you will receive a notification that the order was
                        unsuccessful and no items will be ordered.
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" md="3">
                        <b>Orders and Financial Information</b>
                    </v-col>
                    <v-col cols="12" md="9">
                        This section provides an overview of the financial status
                        of your cost center for the current year and a list
                        of the orders you made.
                        You can check the details of each order by clicking the Info
                        column.
                    </v-col>
                </v-row>
        </v-container>
    </v-card-text>
</v-card>
</template>

<script>
export default {

}
</script>

<style>

</style>
