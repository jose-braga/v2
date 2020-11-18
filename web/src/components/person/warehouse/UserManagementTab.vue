<template>
<div>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Users</h3>
        </div>
    </v-card-title>
    <v-card-text class="px-4">
    </v-card-text>
    <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search people, cost centers or accounts"
        single-line
        hide-details
        class="px-2 mb-4"
    ></v-text-field>
    <v-data-table
        item-key="id"
        :search="search"
        :headers="headers"
        :footer-props="footerProps"
        :items="data.users"
        :items-per-page="10"
        :sort-by="['cost_center_name_en', 'account_name_en', 'colloquial_name']"
        :sort-desc="[false, false]"
        multi-sort
        dense
    >
        <template v-slot:item.account_active="{ item }">
            <v-checkbox v-model="item.account_active"
                readonly
                dense
            >
            </v-checkbox>
        </template>
        <template v-slot:item.action="{ item }">
            <v-icon
                color="red darken"
                @click="removeItem(data.users, item)"
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
            <h3 class="headline ml-4">Add new user</h3>
        </v-row>
        <v-row align-content="center" justify="start">
            <v-col cols="12" md="3">
                <v-autocomplete v-model="$v.newItem.user_id.$model"
                    :items="people" item-value="user_id" item-text="colloquial_name"
                    label="Person Name"
                >
                </v-autocomplete>
            </v-col>
            <v-col cols="12" md="2">
                <v-select v-model="$v.newItem.role_id.$model"
                    :items="roles" item-value="id" item-text="name_en"
                    label="Roles"
                >
                </v-select>
            </v-col>
            <v-col cols="12" md="2">
                <v-select v-model="$v.newItem.cost_center.$model"
                    :items="costCenters" item-value="id" item-text="name_en"
                    return-object
                    label="Cost Centers"
                >
                </v-select>
            </v-col>
            <v-col cols="12" md="2" v-if="newItem.cost_center !== null">
                <v-select v-model="$v.newItem.account_id.$model"
                    :items="newItem.cost_center.accounts" item-value="id" item-text="name_en"
                    label="Accounts"
                >
                </v-select>
            </v-col>
            <v-col cols="10" md="2">
                <v-row justify="end">
                    <v-btn
                        @click="addNewItem(newItem)"
                        large
                        outlined color="blue"
                    >Add new</v-btn>
                </v-row>
            </v-col>
            <v-col cols="2" md="1">
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
import { required } from 'vuelidate/lib/validators'

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
            people: [],
            roles: [],
            data: {
                users: [],
            },
            newItem: {
                user_id: null,
                role_id: null,
                cost_center: null,
                account_id: null,
            },
            toUpdate: [],
            toDelete: [],
            search: '',
            headers: [
                { text: 'Name', value:'colloquial_name' },
                { text: 'Email', value:'email' },
                { text: 'Role', value:'role_name_en' },
                { text: 'Cost Center', value:'cost_center_name_en' },
                { text: 'Account', value:'account_name_en' },
                { text: 'Account active?', value: 'account_active'},
                { text: 'Delete', value: 'action', sortable: false},
            ],
            footerProps: {
                'items-per-page-options': [10,20,50,-1]
            },
        }
    },
    mounted () {
        this.initialize();
        this.getCostCenters();
        this.getPeople();
        this.getRoles();
    },
    watch: {
        $route () {
            this.initialize();
            this.getCostCenters();
            this.getPeople();
            this.getRoles();
        },
    },
    methods: {
        initialize () {
            this.data.users = [];
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                return subUtil.getInfoPopulate(this, 'api/people/' + personID
                    + '/users-management/users', true)
                .then( (result) => {
                    this.data.users = result;
                })
            }

        },
        submitChanges () {
            this.progress = true;
            let personID = this.$store.state.session.personID;
            let urlDelete = [];
            for (let ind in this.toDelete) {
                urlDelete.push({
                    url: 'api/people/' + personID
                        + '/users-management/users/' + this.toDelete[ind].accounts_people_id,
                });
            }
            this.$http.all(
                urlDelete.map(el =>
                    this.$http.delete(el.url,
                        { headers:
                            { 'Authorization': 'Bearer ' + localStorage['v2-token'] },
                        }
                ))
            )
            .then(this.$http.spread( () => {
                this.progress = false;
                this.success = true;
                setTimeout(() => {this.success = false;}, 1500)
                this.toDelete = [];
                this.initialize();
            }))
            .catch((error) => {
                this.progress = false;
                this.error = true;
                this.toDelete = [];
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
                        + '/users-management/users',
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
                            user_id: null,
                            role_id: null,
                            cost_center: null,
                            account_id: null,
                        };
                        this.initialize();
                    }, 1500);

                }))
                .catch((error) => {
                    this.progressNew = false;
                    this.errorNew = true;
                    this.initialize();
                    setTimeout(() => {
                        this.errorNew = false;
                        this.$v.$reset();
                        this.newItem = {
                            user_id: null,
                            role_id: null,
                            cost_center: null,
                            account_id: null,
                        };
                    }, 6000);
                    console.log(error)
                })
            }
        },
        getCostCenters() {
            var this_vm = this;
            const urlSubmit = 'api/v2/' + 'warehouse-cost-centers';
            subUtil.getPublicInfo(this_vm, urlSubmit, 'costCenters');
        },
        getPeople() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'people-simple';
                return subUtil.getPublicInfo(vm, urlSubmit, 'people', 'colloquial_name');
            }
        },
        getRoles() {
            var this_vm = this;
            const urlSubmit = 'api/v2/' + 'warehouse-accounts-roles';
            subUtil.getPublicInfo(this_vm, urlSubmit, 'roles');
        },
        removeItem(list, item) {
            let indRemove;
            for (let ind in list) {
                if (item.accounts_people_id === list[ind].accounts_people_id) {
                    indRemove = ind;
                    break;
                }
            }
            if (list[indRemove].id !== 'new') {
                this.toDelete.push(list[indRemove]);
            }
            list.splice(indRemove, 1);
        },

    },
    validations: {
        newItem: {
            user_id: { required },
            role_id: { required },
            cost_center: { required },
            account_id: { required },
        },
    },

}
</script>

<style>

</style>
