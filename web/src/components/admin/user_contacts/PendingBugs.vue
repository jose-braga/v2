<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Pending bugs list</h3>
        </div>
    </v-card-title>
    <v-container>
        <v-data-table
            item-key="id"
            :headers="headers"
            :footer-props="footerProps"
            :items="data.items"
            :items-per-page="10"

            :sort-by="['date_sent']"
            :sort-desc="[true]"
            multi-sort

            class='mt-4'
        >
            <template v-slot:top>
                <v-dialog v-model="dialog" max-width="1600px">
                    <ItemDetails
                        :item-type="'bug'"
                        :item-data="editedItem"
                        :item-id="itemID"
                    >
                    </ItemDetails>
                </v-dialog>
            </template>
            <template v-slot:item.details="{ item }">
                <v-row class="pr-2">
                    <v-col cols="6">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-icon v-on="on"
                                    @click="editItem(item)">mdi-file-document-multiple
                                </v-icon>
                            </template>
                            <span>View details</span>
                        </v-tooltip>
                    </v-col>
                </v-row>
            </template>

        </v-data-table>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import ItemDetails from './ItemDetails'

export default {
    components: {
        ItemDetails,
    },
    data() {
        return {
            dialog: false,
            formError: false,
            editedIndex: -1,
            editedItem: {
            },
            itemID: undefined,
            search: '',
            headers: [
                { text: 'Subject', value:'subject' },
                { text: 'User', value:'colloquial_name' },
                { text: 'Email', value:'email' },
                { text: 'Date', value:'date_sent' },
                { text: 'Details', value: 'details', sortable: false },
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
            data: {
                items: [],
            },
        }
    },
    mounted () {
        this.initialize();
        this.$root.$on('updatedUserContact', () => {
            this.dialog = false;
            this.initialize();
        });
    },
    methods: {
        initialize () {
            this.data.items = [];
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                subUtil.getInfoPopulate(this, 'api/admins/' + personID + '/bugs', true)
                .then( (result) => {
                    this.data.items = result;
                })
            }
        },
        editItem (item) {
            this.dialog = true;
            this.editedIndex = this.data.items.indexOf(item);
            this.editedItem = item;
            this.itemID = item.id;
        },
    },


}
</script>

<style>

</style>