<template>
<v-card>
    <v-form @submit.prevent="submitForm(spaceDetails)">
        <v-card-title>
            <span> Edit data for
                    <b> {{ spaceDetails.reference }} - {{ spaceDetails.space_name }}</b>
            </span>
        </v-card-title>
        <v-container>
            <h2>Edit your roles in this space</h2>
            <v-row align-content="center" justify="start">
                <v-col cols="4" md="7" class="mt-3">
                    <v-row justify="center">
                        <v-btn
                            @click.stop="addItem(spaceDetails.roles)"
                            outlined color="black"
                        >
                            Add roles
                        </v-btn>
                    </v-row>
                </v-col>
            </v-row>
            <v-row v-for="(role, i) in spaceDetails.roles"
                :key="i"
            >
                <v-col cols="12" sm="3">
                    <v-select v-model="role.role_id"
                        :items="spaceRoles" item-value="id" item-text="name_pt"
                        label="Role">
                    </v-select>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-menu ref="date_menu"
                        v-model="role.show_valid_from"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="role.valid_from"
                                label="Start date" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="role.valid_from"
                            @input="role.show_valid_from = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="2">
                    <v-menu ref="menu_end_date"
                        v-model="role.show_valid_until"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="role.valid_until"
                                label="End date"
                                v-on="on"
                                v-bind="attrs"
                            >
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="role.valid_until"
                            @click="role.show_valid_until = false"
                            no-title
                        ></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="3">
                    <v-textarea
                        v-model="role.comments"
                        label="Comments"
                        rows="1"
                    ></v-textarea>
                </v-col>
                <v-col cols="12" sm="1">
                    <v-btn icon @click.stop="removeItem(spaceDetails.roles, i)" class="mt-3">
                        <v-icon color="red darken">mdi-delete</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-row align-content="center" justify="start" class="mb-2">
                <v-col cols="2" align-self="end">
                    <v-row justify="end">
                        <v-btn type="submit"
                        outlined color="blue">Update</v-btn>
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
import subUtil from '@/components/common/submit-utils'
///import time from '@/components/common/date-utils'

export default {
    props: {
        itemId: Number,
        personId: Number,
        spaceData: Object,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            spaceDetails: {
                space_name: '',
                roles:[],
            },
            toDeleteRoles: [],
            spaceRoles: [],
        }
    },
    watch: {
        itemId () {
            this.initialize();
        },
    },
    mounted() {
        this.initialize();
        this.getSpaceRoles();
    },
    methods: {
        initialize () {
            this.$set(this.spaceDetails, 'space_name', this.spaceData.space_name_pt);
            this.$set(this.spaceDetails, 'reference', this.spaceData.reference);
            this.spaceDetails.roles = [];
            for (let ind in this.spaceData.roles) {
                this.spaceDetails.roles.push(this.spaceData.roles[ind])
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreateRole = [];
                let urlDeleteRole = [];
                let urlUpdateRole = [];
                let personID = this.$store.state.session.personID;
                for (let ind in this.spaceDetails.roles) {
                    let datum = this.spaceDetails.roles[ind]
                    if (datum.id === 'new') {
                        urlCreateRole.push({
                            url: 'api/people/' + personID
                                + '/spaces/' + datum.space_id
                                + '/roles',
                            body: datum,
                        });
                    } else {
                        urlUpdateRole.push({
                            url: 'api/people/' + personID
                                + '/spaces/' + this.itemId
                                + '/roles/' + datum.id,
                            body: datum,
                        });
                    }
                }
                for (let ind in this.toDeleteRoles) {
                    let datum = this.toDeleteRoles[ind]
                    urlDeleteRole.push('api/people/' + personID
                                + '/spaces/' + this.itemId
                                + '/roles/' + datum.id)
                }
                console.log(urlUpdateRole)
                Promise.all(
                    urlDeleteRole.map(el =>
                        this.$http.delete(el,
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                    .concat(
                        urlCreateRole.map(el =>
                            this.$http.post(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                    .concat(
                        urlUpdateRole.map(el =>
                            this.$http.put(el.url,
                                { data: el.body, },
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            }))
                    )
                )
                .then(() => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.toDeleteRoles = []; // add the others
                    this.$root.$emit('updatePersonSpacesTable')
                    //this.initialize();
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    this.toDeleteRoles = [];
                    this.initialize();
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        getSpaceRoles () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'space-roles';
                return subUtil.getPublicInfo(vm, urlSubmit, 'spaceRoles');
            }

        },
        removeItem(list, ind) {
            if (list[ind].id !== 'new') {
                this.toDeleteRoles.push(list[ind])
            }
            list.splice(ind, 1);
        },
        addItem(list) {
            list.push({
                id: 'new',
                space_id: this.itemId,
                role_id: null,
                valid_from: null,
                valid_until: null,
            })
        },
    }


}
</script>

<style>

</style>