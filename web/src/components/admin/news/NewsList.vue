<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">News List</h3>
        </div>
    </v-card-title>
    <v-container>
        <v-btn
            color="primary"
            @click="editItem('new')"
            outlined
        >
            Add News
        </v-btn>
        <v-data-table
            item-key="id"
            :headers="headers"
            :footer-props="footerProps"
            :items="data.items"
            :items-per-page="10"

            :sort-by="['published']"
            :sort-desc="[true]"
            multi-sort

            class='mt-4'
        >
            <template v-slot:top>
                <v-dialog v-model="dialog"
                    max-width="1600px"
                    width="100%"
                >
                    <ItemDetails
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
                                    @click="editItem(item)">mdi-pencil
                                </v-icon>
                            </template>
                            <span>View details</span>
                        </v-tooltip>
                    </v-col>
                    <v-col cols="6">
                        <v-icon color="red darken"
                            @click="deleteItem(item)">mdi-delete
                        </v-icon>
                    </v-col>
                </v-row>
            </template>
        </v-data-table>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'
import ItemDetails from './NewsDetails'

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
                { text: 'Title', value:'title' },
                { text: 'Published', value:'published' },
                { text: 'Date from', value:'valid_from' },
                { text: 'Date until', value:'valid_until' },
                { text: 'Visible', value:'visible' },
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
        this.$root.$on('updatedNews', () => {
            this.dialog = false;
            this.initialize();
        });
    },
    methods: {
        initialize () {
            this.data.items = [];
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                subUtil.getInfoPopulate(this, 'api/admins/' + personID + '/news', true)
                .then( (result) => {
                    for (let ind in result) {
                        result[ind].date_published = time.momentToDate(result[ind].published, undefined, 'YYYY-MM-DD');
                        result[ind].time_published = time.momentToDate(result[ind].published, undefined, 'HH:mm:ss');
                        result[ind].date_valid_from = time.momentToDate(result[ind].valid_from, undefined, 'YYYY-MM-DD');
                        result[ind].time_valid_from = time.momentToDate(result[ind].valid_from, undefined, 'HH:mm:ss');
                        result[ind].date_valid_until = time.momentToDate(result[ind].valid_until, undefined, 'YYYY-MM-DD');
                        result[ind].time_valid_until = time.momentToDate(result[ind].valid_until, undefined, 'HH:mm:ss');
                    }
                    this.data.items = result;
                })
            }
        },
        editItem (item) {
            if (item === 'new') {
                this.dialog = true;
                this.editedIndex = 'new';
                this.editedItem = { id: 'new' };
                this.itemID = this.data.items.length;
            } else {
                this.dialog = true;
                this.editedIndex = this.data.items.indexOf(item);
                this.editedItem = item;
                this.itemID = item.id;
            }
        },
        deleteItem (item) {
            let proceed = confirm('Are you sure');
            if (proceed) {
                let personID = this.$store.state.session.personID;
                let urlDelete = [
                    {
                        url: 'api/admins/' + personID
                            + '/news/' + item.id
                    }
                ];
                Promise.all(urlDelete.map(el =>
                    this.$http.delete(el.url,
                        { headers:
                            {'Authorization': 'Bearer ' + localStorage['v2-token']
                        },
                    }))
                )
                .then(() => {
                    this.initialize();
                })
                .catch((error) => {
                    this.initialize();
                    console.log(error)
                })
            }
        },
    },

}
</script>

<style>

</style>