<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">App Area Permissions</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container class="px-6">
        <v-form ref="form"
                @submit.prevent="submitForm()">
            <v-row justify="start" class="ml-6 mb-6">
                <v-btn @click="addPermission()"
                    outlined color="blue">Add permission
                </v-btn>
            </v-row>
            <v-row v-for="(permission, i) in data.permissions"
                    :key="i"
            >
                <v-col cols="2" sm="1" align-self="auto">
                    {{ i + 1 }}:
                </v-col>
                <v-col cols="6" sm="2">
                    <v-select v-model="permission.app_area_id"
                        :items="appAreas"
                        item-value="id" item-text="app_area_en"
                        label="Area name"
                        dense>
                    </v-select>
                </v-col>
                <v-col cols="1">
                    <v-btn text @click="deletePermission(i)">
                        <v-icon color="red darken-1">mdi-eraser</v-icon>
                    </v-btn>
                </v-col>
                <v-col cols="12">
                    <v-divider></v-divider>
                </v-col>
            </v-row>
            <v-row justify="end">
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
        </v-form>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    props: {
        personId: Number,
        managerId: Number,
        endpoint: String,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            data: {
                permissions: [],
            },
            appAreas: [],
        }
    },
    mounted () {
        this.initialize();
        this.getAppAreas();
    },
    watch: {
        personId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            this.data.permissions = [];
            if (this.$store.state.session.loggedIn) {
                let urlSubmit = 'api' + this.endpoint
                                + '/members'
                                + '/' + this.personId
                                + '/app-area-permissions';
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    for (let ind in result) {
                        this.$set(this.data.permissions, ind, {});
                        Object.keys(result[ind]).forEach(key => {
                            let value = result[ind][key];
                            this.$set(this.data.permissions[ind], key, value);
                        });
                    }
                })
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlUpdate = [];
                let urlCreate = [];
                for (let ind in this.data.permissions) {
                    if (this.data.permissions[ind].id === 'new') {
                        urlCreate.push({
                            url: 'api' + this.endpoint
                                + '/members'
                                + '/' + this.personId
                                + '/app-area-permissions',
                            body: this.data.permissions[ind],
                        });
                    } else {
                        urlUpdate.push({
                            url: 'api' + this.endpoint
                                + '/members'
                                + '/' + this.personId
                                + '/app-area-permissions/'
                                + this.data.permissions[ind].id,
                            body: this.data.permissions[ind],
                        });
                    }
                }

                this.$http.all(
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
                            }))
                    )
                )
                .then(this.$http.spread( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {
                        this.success = false;
                        this.openPanel = undefined;
                    }, 1500)
                    this.initialize();
                }))
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    this.initialize();
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                });
            }
        },
        deletePermission (i) {
            if (this.$store.state.session.loggedIn) {
                let proceed = false;
                if (this.data.permissions[i].id === 'new') {
                    this.data.permissions.splice(i, 1);
                    this.openPanel = undefined;
                } else {
                    proceed = confirm('Are you sure?');
                }
                if (proceed) {
                    this.progress = true;
                    let urlDelete = [];
                    let permission = this.data.permissions[i];
                    urlDelete.push(
                        'api' + this.endpoint
                            + '/members'
                            + '/' + this.personId
                            + '/app-area-permissions/'
                            + permission.id
                    );
                    this.$http.all(
                        urlDelete.map(el =>
                            this.$http.delete(el,
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']},
                                }
                            )
                        )
                    )
                    .then(this.$http.spread( () => {
                        this.progress = false;
                        this.success = true;
                        setTimeout(() => {
                            this.success = false;
                            this.openPanel = undefined;
                        }, 1500)
                        this.initialize();
                    }))
                    .catch((error) => {
                        this.progress = false;
                        this.error = true;
                        this.initialize();
                        setTimeout(() => {this.error = false;}, 6000)
                        // eslint-disable-next-line
                        console.log(error)
                    });

                }
            }
        },
        addPermission () {
            this.data.permissions = [
                {
                    id: 'new',
                    app_area_id: null,
                },
                ...this.data.permissions
                ];
        },
        getAppAreas () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'app-areas';
                return subUtil.getPublicInfo(vm, urlSubmit, 'appAreas');
            }
        },
    },
}
</script>

<style scoped>

</style>