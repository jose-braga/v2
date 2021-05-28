<template>
<div>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Cost Centers & Accounts</h3>
        </div>
    </v-card-title>
    <v-card-text class="px-4">
    </v-card-text>
    <v-container>
        <v-row>
            <v-col cols="12">
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search cost centers or accounts"
                    single-line
                    hide-details
                    class="px-2 mb-4"
                ></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-treeview
                    :search="search"
                    :items="data.costCenters"
                    item-key="new_id"
                    item-text="name_en"
                    item-children="accounts"
                    dense
                >
                    <template v-slot:prepend="{ item }">
                        <v-icon v-if="item.active === 1"
                            color="green"
                        >
                            mdi-check
                        </v-icon>
                        <v-icon v-else
                            color="red"
                        >
                            mdi-stop
                        </v-icon>
                    </template>

                    <template v-slot:label="{ item }">
                        <v-row v-if="item.editName"
                            align="center"
                        >
                            <v-col cols="9">
                                <v-text-field v-model="item.name_en">
                                </v-text-field>
                            </v-col>
                            <v-col cols="1">
                                <v-icon
                                    @click="updateItemName(item)"
                                >
                                    mdi-content-save
                                </v-icon>
                            </v-col>
                            <v-col cols="1" v-if="item.active === 1">
                                <v-icon
                                    @click="inactivateItem(item)"
                                    color="red"
                                >
                                    mdi-stop
                                </v-icon>
                            </v-col>
                            <v-col cols="1">
                                <v-progress-circular indeterminate
                                        v-show="item.progress"
                                        :size="20" :width="2"
                                        color="primary"></v-progress-circular>
                                <v-icon v-show="item.success" color="green">mdi-check</v-icon>
                                <v-icon v-show="item.error" color="red">mdi-alert-circle-outline</v-icon>
                            </v-col>
                        </v-row>
                        <v-row v-else>
                            <v-col cols="11">
                                <span>
                                    {{item.name_en}}
                                </span>

                                <v-icon
                                    @click="changeItemName(item)"
                                >
                                    mdi-pencil
                                </v-icon>
                                <v-dialog
                                    v-if="item.accounts === undefined"
                                    v-model="item.dialog"
                                    width="75%"
                                >
                                    <template v-slot:activator="{ on }">
                                        <v-icon
                                            v-on="on"
                                            class="ml-3"
                                        >
                                            mdi-format-list-bulleted
                                        </v-icon>
                                    </template>
                                    <v-card>
                                        <v-card-title
                                            class="headline grey lighten-2"
                                            primary-title
                                        >
                                            Financial information for {{item.name_en}}@{{item.cost_center_name_en}}
                                        </v-card-title>
                                        <ul>
                                            <li v-for="(finance, j) in item.finances"
                                                :key="item.cost_center_id + '-' + item.id + '-' + j"
                                            >
                                                <v-row align="center" dense>
                                                    <v-col cols="1">
                                                        <span class="year">{{finance.year}}</span>
                                                    </v-col>
                                                    <v-col cols="3">
                                                        <span class="current-available-header">Currently available: </span>
                                                        <span class="current-available-value">{{finance.current_amount_tax}} €</span>
                                                    </v-col>
                                                    <v-col cols="3">
                                                        <span class="current-requests-header">Amount in requests: </span>
                                                        <span class="current-requests-value">{{finance.amount_requests_tax}} €. </span>
                                                    </v-col>
                                                    <v-col cols="5" lg="4">
                                                        <v-row dense align="center">
                                                            <v-col cols="12" md="6">
                                                                <span class="initial-funds-text">Funds allocated this year: </span>
                                                            </v-col>
                                                            <v-col cols="12" md="6">
                                                                <span class="initial-funds-value">
                                                                    <v-text-field v-if="finance.year === currentYear"
                                                                        v-model="finance.initial_amount"
                                                                        label="Funds (€)"
                                                                        hide-details
                                                                        class="px-2 mb-4"
                                                                    ></v-text-field>
                                                                    <v-text-field v-else-if="finance.year === currentYear + 1"
                                                                        v-model="finance.initial_amount"
                                                                        label="Funds (€)"
                                                                        hide-details
                                                                        class="px-2 mb-4"
                                                                    ></v-text-field>
                                                                    <div v-else-if="finance.year < currentYear"
                                                                    >
                                                                        {{finance.initial_amount.toFixed(2)}} €
                                                                    </div>
                                                                </span>
                                                            </v-col>
                                                        </v-row>
                                                    </v-col>
                                                </v-row>
                                            </li>
                                        </ul>
                                        <v-card-actions
                                        >
                                            <v-btn v-if="!item.addedNextYear"
                                                @click="addNextYear(item, item.finances)"
                                                color="red"
                                                outlined
                                            >
                                                Add next year
                                            </v-btn>

                                            <v-btn
                                                @click="updateFinances(item, item.finances)"
                                                color="blue"
                                                outlined
                                            >
                                                Save
                                            </v-btn>
                                            <v-progress-circular indeterminate
                                                    v-show="item.progress"
                                                    :size="20" :width="2"
                                                    color="primary"></v-progress-circular>
                                            <v-icon v-show="item.success" color="green">mdi-check</v-icon>
                                            <v-icon v-show="item.error" color="red">mdi-alert-circle-outline</v-icon>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                                <v-icon v-if="item.accounts && !item.noChildrenAllowed"
                                    @click="addChild(item)"
                                >
                                    mdi-plus
                                </v-icon>
                            </v-col>

                        </v-row>
                    </template>
                </v-treeview>
            </v-col>
            <v-col cols="12">
                <v-btn
                    @click="addCostCenter"
                    outlined
                    color="blue"
                >
                    Add Cost Center
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</v-card>
</div>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

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
            costCenters: [],
            data: {
                costCenters: [],
            },
            newItem: {
            },
            toUpdate: [],
            toDelete: [],
            search: '',
            openPanel: [],
        }
    },
    mounted () {
        this.initialize();
        this.getCostCenters();
    },
    watch: {
        $route () {
            this.initialize();
            this.getCostCenters();
        },
    },
    computed: {
        currentYear () {
            let now = new Date(Date.now());
            return now.getFullYear();
        },
    },
    methods: {
        initialize () {
            this.data.costCenters = [];
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                return subUtil.getInfoPopulate(this, 'api/people/' + personID
                    + '/financial-management/cost-centers', true)
                .then( (result) => {
                    // sort by costCenter name and then by finance year
                    result.sort((a,b) => {
                        let nameA = a.name_en.toUpperCase();
                        let nameB = b.name_en.toUpperCase();
                        if (nameA < nameB) { return -1; }
                        if (nameA > nameB) { return 1; }
                        return 0;
                    })
                    for (let ind in result) {
                        result[ind].new_id = result[ind].id;
                        if (result[ind].accounts.length > 0 ) {
                            for (let indAcc in result[ind].accounts) {
                                result[ind].accounts[indAcc].new_id = result[ind].new_id + '-' + result[ind].accounts[indAcc].id
                                result[ind].accounts[indAcc].finances.sort((a,b) => {
                                    return a.year - b.year;
                                })
                                let hasCurrentYear = false;
                                let hasNextYear = false;
                                for (let indFin in result[ind].accounts[indAcc].finances) {
                                    result[ind].accounts[indAcc].finances[indFin].old_initial_amount =
                                        result[ind].accounts[indAcc].finances[indFin].initial_amount
                                    if (result[ind].accounts[indAcc].finances[indFin].year
                                            === this.currentYear) {
                                        hasCurrentYear = true;
                                    }
                                    if (result[ind].accounts[indAcc].finances[indFin].year
                                            === this.currentYear + 1) {
                                        hasNextYear = true;
                                    }
                                }
                                if (!hasCurrentYear) {
                                    result[ind].accounts[indAcc].finances.push({
                                        id: 'new',
                                        year: this.currentYear,
                                        account_id: result[ind].accounts[indAcc].id,
                                        initial_amount: 0,
                                        current_amount: 0,
                                        amount_requests: 0,
                                        current_amount_tax: 0,
                                        amount_requests_tax: 0,
                                    });
                                }
                                if (hasNextYear) {
                                    result[ind].accounts[indAcc].addedNextYear = true;
                                }
                            }
                        }
                    }
                    this.data.costCenters = result;
                })
            }
        },
        changeItemName (item) {
            this.$set(item, 'editName', true)
        },
        updateItemName (item) {
            this.$set(item, 'progress', true)
            let personID = this.$store.state.session.personID;
            let url = [];
            let action;
            if (item.accounts) {
                if (typeof item.id === 'number') {
                    url.push({
                        url: 'api/people/' + personID
                            + '/financial-management/cost-centers/' + item.id,
                        body: item,
                    });
                    action = this.Promise.all(
                        url.map(el =>
                            this.$http.put(el.url,
                                { data: el.body, },
                                { headers:
                                    { 'Authorization': 'Bearer ' + localStorage['v2-token'] },
                                }
                            ))
                    )
                } else {
                    url.push({
                        url: 'api/people/' + personID
                            + '/financial-management/cost-centers',
                        body: item,
                    });
                    action = this.Promise.all(
                        url.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    { 'Authorization': 'Bearer ' + localStorage['v2-token'] },
                                }
                            ))
                    )
                }
            } else {
                if (typeof item.id === 'number') {
                    url.push({
                        url: 'api/people/' + personID
                            + '/financial-management/cost-centers/' + item.cost_center_id
                            + '/accounts/' + item.id,
                        body: item,
                    });
                    action = this.Promise.all(
                        url.map(el =>
                            this.$http.put(el.url,
                                { data: el.body, },
                                { headers:
                                    { 'Authorization': 'Bearer ' + localStorage['v2-token'] },
                                }
                            ))
                    )
                } else {
                    url.push({
                        url: 'api/people/' + personID
                            + '/financial-management/cost-centers/' + item.cost_center_id
                            + '/accounts',
                        body: item,
                    });
                    action = this.Promise.all(
                        url.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    { 'Authorization': 'Bearer ' + localStorage['v2-token'] },
                                }
                            ))
                    )
                }
            }
            action
            .then( () => {
                this.$set(item, 'progress', false);
                this.$set(item, 'success', true);
                setTimeout(() => {
                    this.$set(item, 'success', false);
                    this.$set(item, 'editName', false)
                    this.initialize();
                }, 1500);

            })
            .catch((error) => {
                this.$set(item, 'progress', false);
                this.$set(item, 'error', true);
                setTimeout(() => {
                    this.$set(item, 'error', false);
                    this.initialize();
                }, 6000);
                console.log(error)
            })
        },
        inactivateItem (item) {
            this.$set(item, 'active', false)
            //this.$set(item, 'editName', false)
            this.$set(item, 'progress', true)
            let personID = this.$store.state.session.personID;
            let url = [];
            let action;
            if (item.accounts) {
                url.push({
                    url: 'api/people/' + personID
                        + '/financial-management/cost-centers/' + item.id,
                    body: item,
                });
                for (let ind in item.accounts) {
                    this.$set(item.accounts[ind], 'active', false)
                    url.push({
                        url: 'api/people/' + personID
                            + '/financial-management/cost-centers/' + item.id
                            + '/accounts/' + item.accounts[ind].id,
                        body: item.accounts[ind],
                    });
                }
                action = this.Promise.all(
                    url.map(el =>
                        this.$http.put(el.url,
                            { data: el.body, },
                            { headers:
                                { 'Authorization': 'Bearer ' + localStorage['v2-token'] },
                            }
                        ))
                )
            } else {
                this.$set(item, 'active', false)
                url.push({
                    url: 'api/people/' + personID
                        + '/financial-management/cost-centers/' + item.cost_center_id
                        + '/accounts/' + item.id,
                    body: item,
                });
                action = this.Promise.all(
                    url.map(el =>
                        this.$http.put(el.url,
                            { data: el.body, },
                            { headers:
                                { 'Authorization': 'Bearer ' + localStorage['v2-token'] },
                            }
                        ))
                )
            }
            action
            .then( () => {
                this.$set(item, 'progress', false);
                this.$set(item, 'success', true);
                setTimeout(() => {
                    this.$set(item, 'success', false);
                    this.$set(item, 'editName', false)
                    this.initialize();
                }, 1500);

            })
            .catch((error) => {
                this.$set(item, 'progress', false);
                this.$set(item, 'error', true);
                setTimeout(() => {
                    this.$set(item, 'error', false);
                    this.initialize();
                }, 6000);
                console.log(error)
            })
        },
        updateFinances (item, finances) {
            this.$set(item, 'progress', true);
            let urlUpdate = [];
            let urlCreate = [];
            let personID = this.$store.state.session.personID;
            for (let ind in finances) {
                if (typeof finances[ind].id === 'string'
                    && finances[ind].id.includes('new')
                ) {
                    urlCreate.push({
                        url: 'api/people/' + personID
                            + '/financial-management/cost-centers/' + item.cost_center_id
                            + '/accounts/' + item.id
                            + '/finances',
                        body: finances[ind],
                    });

                } else if (typeof finances[ind].id === 'number') {
                    // past years are not changed
                    if (finances[ind].year === this.currentYear
                        || finances[ind].year === this.currentYear + 1
                    ) {
                        urlUpdate.push({
                            url: 'api/people/' + personID
                                + '/financial-management/cost-centers/' + item.cost_center_id
                                + '/accounts/' + item.id
                                + '/finances/' + finances[ind].id,
                            body: finances[ind],
                        });
                    }
                }
            }
            this.Promise.all(
                urlUpdate.map(el =>
                    this.$http.put(el.url,
                        { data: el.body, },
                        { headers:
                            {'Authorization': 'Bearer ' + localStorage['v2-token']
                        },
                    }))
                .concat(
                    urlCreate.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        })))
            )
            .then( () => {
                this.$set(item, 'progress', false);
                this.$set(item, 'success', true);
                setTimeout(() => {
                    this.$set(item, 'success', false);
                    this.initialize();
                }, 1500);

            })
            .catch((error) => {
                this.$set(item, 'progress', false);
                this.$set(item, 'error', true);
                setTimeout(() => {
                    this.$set(item, 'error', false);
                    this.initialize();
                }, 6000);
                console.log(error)
            })
        },
        addChild (item) {
            if (typeof item.id === "number") {
                item.accounts.push(
                    {
                        id: 'new-'+ item.id + '-' + item.accounts.length,
                        new_id: 'new-'+ item.id + '-' + item.accounts.length,
                        name_en: '',
                        cost_center_id: item.id,
                        active: item.active,
                    }
                );
            }
        },
        addCostCenter () {
            this.data.costCenters.push(
                {
                    id: 'new-' + this.data.costCenters.length,
                    new_id: 'new-' + this.data.costCenters.length,
                    name_en: '',
                    active: 1,
                    accounts: [],
                    noChildrenAllowed: true, // only allowed after saving new Cost Center
                }
            );
        },
        addNextYear (item, finances) {
            this.$set(item, 'addedNextYear', 'true');
            finances.push({
                id: 'new-next-year',
                year: this.currentYear + 1,
                account_id: item.id,
                initial_amount: 0,
                current_amount: 0,
                amount_requests: 0,
                current_amount_tax: 0,
                amount_requests_tax: 0,
            })
        },
        getCostCenters() {
            var this_vm = this;
            const urlSubmit = 'api/v2/' + 'warehouse-cost-centers';
            subUtil.getPublicInfo(this_vm, urlSubmit, 'costCenters');
        },
    },

}
</script>

<style scoped>
.initial-funds-text{
    float: right;
}

</style>
