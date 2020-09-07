<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Permissions</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container class="px-6">
        <v-form ref="form"
            @submit.prevent="submitForm">
            <v-row v-for="(permission, i) in data.permissions"
                :key="i"
            >
                <v-col cols="12">
                <v-row>
                    <v-col cols="12" sm="3">
                        <v-select v-model="permission.method_id"
                        multiple
                            :items="requestMethods"
                            item-value="id" item-text="name"
                            label="Methods">
                        </v-select>
                    </v-col>
                    <!-- Allow all subpaths -->
                </v-row>
                <v-row>
                    <v-col cols="12" sm="3" v-if="permission.resource1_hasID">
                        <v-select v-model="permission.resource1_type_id"
                            :items="resourceTypes"
                            item-value="id" item-text="name"
                            label="Resource 1 Type">
                        </v-select>
                    </v-col>
                    <v-col cols="12" sm="3">
                        <v-select v-if="permission.resource1_type_id === 2"
                            v-model="permission.resource1_id"
                            @change="processGenericId(i, 1, 'resourceID')"
                            :items="labs"
                            item-value="id" item-text="name"
                            label="Resource 1 ID">
                        </v-select>
                    </v-col>
                    <v-col cols="6" sm="2">
                        <v-checkbox
                            disabled
                            v-model="permission.resource1_hasID"
                            @change="processGenericId(i, 1, 'hasID')"
                            label="Has ID?"
                        ></v-checkbox>
                    </v-col>
                    <v-col cols="6" sm="2">
                        <v-checkbox
                            v-model="permission.resource1_resource_id_generic"
                            @change="processGenericId(i, 1, 'generic')"
                            label="Generic?"
                        ></v-checkbox>
                    </v-col>

                </v-row>
                <v-row>
                    <v-col cols="12" sm="3">
                        <v-select v-model="permission.resource2_type_id"
                            :items="resourceTypes"
                            item-value="id" item-text="name"
                            label="Resource 2 Type">
                        </v-select>
                    </v-col>
                    <v-col cols="12" sm="3" v-if="permission.resource2_hasID">
                        <v-select v-if="permission.resource2_type_id === 2"
                            v-model="permission.resource2_id"
                            @change="processGenericId(i, 2, 'resourceID')"
                            :items="labs"
                            item-value="id" item-text="name"
                            label="Resource 2 ID">
                        </v-select>
                    </v-col>
                    <v-col cols="6" sm="2">
                        <v-checkbox
                            v-model="permission.resource2_hasID"
                            @change="processGenericId(i, 2, 'hasID')"
                            label="Has ID?"
                        ></v-checkbox>
                    </v-col>
                    <v-col cols="6" sm="2">
                        <v-checkbox
                            v-model="permission.resource2_resource_id_generic"
                            @change="processGenericId(i, 2, 'generic')"
                            label="Generic?"
                        ></v-checkbox>
                    </v-col>

                </v-row>
                <v-row v-if="permission.resource2_hasID || permission.resource2_resource_id_generic">
                    <v-col cols="12" sm="3">
                        <v-select v-model="permission.resource3_type_id"
                            :items="resourceTypes"
                            item-value="id" item-text="name"
                            label="Resource 3 Type">
                        </v-select>
                    </v-col>
                    <v-col cols="12" sm="3" v-if="permission.resource3_hasID">
                        <v-select v-if="permission.resource3_type_id === 2"
                            v-model="permission.resource3_id"
                            @change="processGenericId(i, 3, 'resourceID')"
                            :items="labs"
                            item-value="id" item-text="name"
                            label="Resource 3 ID">
                        </v-select>
                    </v-col>
                    <v-col cols="6" sm="2">
                        <v-checkbox
                            v-model="permission.resource3_hasID"
                            @change="processGenericId(i, 3, 'hasID')"
                            label="Has ID?"
                        ></v-checkbox>
                    </v-col>
                    <v-col cols="6" sm="2">
                        <v-checkbox
                            v-model="permission.resource3_resource_id_generic"
                            @change="processGenericId(i, 3, 'generic')"
                            label="Generic?"
                        ></v-checkbox>
                    </v-col>
                </v-row>
                <v-row v-if="permission.resource3_hasID || permission.resource3_resource_id_generic">
                    <v-col cols="12" sm="3">
                        <v-select v-model="permission.resource4_type_id"
                            :items="resourceTypes"
                            item-value="id" item-text="name"
                            label="Resource 4 Type">
                        </v-select>
                    </v-col>
                    <v-col cols="12" sm="3" v-if="permission.resource4_hasID">
                        <v-select v-if="permission.resource4_type_id === 2"
                            v-model="permission.resource4_id"
                            @change="processGenericId(i, 4, 'resourceID')"
                            :items="labs"
                            item-value="id" item-text="name"
                            label="Resource 3 ID">
                        </v-select>
                    </v-col>
                    <v-col cols="6" sm="2">
                        <v-checkbox
                            v-model="permission.resource4_hasID"
                            @change="processGenericId(i, 4, 'hasID')"
                            label="Has ID?"
                        ></v-checkbox>
                    </v-col>
                    <v-col cols="6" sm="2">
                        <v-checkbox
                            v-model="permission.resource4_resource_id_generic"
                            @change="processGenericId(i, 4, 'generic')"
                            label="Generic?"
                        ></v-checkbox>
                    </v-col>
                </v-row>
                {{permission}}
                <v-divider></v-divider>
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
            requestMethods: [],
            resourceTypes: [],
            people: [],
            labs: [],
            groups: [],
            units: [],
            institutionCities : [],
        }
    },
    mounted () {
        this.initialize();
        this.getRequestMethods();
        this.getResourceTypes();
        this.getPeople();
        this.getLabs();
        this.getGroups();
        this.getUnits();
        this.getInstitutionCities();
    },
    watch: {
        personId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                let urlSubmit = 'api' + this.endpoint
                                + '/members'
                                + '/' + this.personId
                                + '/permissions';
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
                    for (let ind in this.data.permissions) {
                        /*
                        if (this.data.permissions[ind].resource2_type_id === null) {
                            this.$set(this.data.permissions[ind], 'level', 1);
                        } else if (this.data.permissions[ind].resource3_type_id === null) {
                            this.$set(this.data.permissions[ind], 'level', 2);
                        } else if (this.data.permissions[ind].resource4_type_id === null) {
                            this.$set(this.data.permissions[ind], 'level', 3);
                        } else {
                            this.$set(this.data.permissions[ind], 'level', 4);
                        }
                        */
                       this.$set(this.data.permissions[ind], 'resource1_hasID', true);
                        if (this.data.permissions[ind].resource2_id === null) {
                            this.$set(this.data.permissions[ind], 'resource2_hasID', false);
                        } else {
                            this.$set(this.data.permissions[ind], 'resource2_hasID', true);
                        }
                        if (this.data.permissions[ind].resource3_id === null) {
                            this.$set(this.data.permissions[ind], 'resource3_hasID', false);
                        } else {
                            this.$set(this.data.permissions[ind], 'resource3_hasID', true);
                        }
                        if (this.data.permissions[ind].resource4_id === null) {
                            this.$set(this.data.permissions[ind], 'resource4_hasID', false);
                        } else {
                            this.$set(this.data.permissions[ind], 'resource4_hasID', true);
                        }
                    }
                })
            } else {
                this.$refs.form.reset();
            }
        },
        getRequestMethods () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'request-methods';
                return subUtil.getPublicInfo(vm, urlSubmit, 'requestMethods');
            }
        },
        getResourceTypes () {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'resource-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'resourceTypes');
            }
        },
        getPeople() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'people-simple';
                return subUtil.getPublicInfo(vm, urlSubmit, 'people', 'colloquial_name');
            }
        },
        getLabs() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'labs';
                return subUtil.getPublicInfo(vm, urlSubmit, 'labs');
            }
        },
        getGroups() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'groups';
                return subUtil.getPublicInfo(vm, urlSubmit, 'groups');
            }
        },
        getUnits() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'units';
                return subUtil.getPublicInfo(vm, urlSubmit, 'units');
            }
        },
        getInstitutionCities() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'institution-cities';
                return subUtil.getPublicInfo(vm, urlSubmit, 'institutionCities');
            }
        },
        processGenericId(ind, num, field) {
            if (this.data.permissions[ind]['resource' + num + '_type_id'] === null) {
                this.data.permissions[ind]['resource' + num + '_id'] = null;
                this.data.permissions[ind]['resource' + num + '_resource_id_generic'] = null;
            } else {
                if (field === 'generic') {
                    if (this.data.permissions[ind]['resource' + num + '_resource_id_generic'] === 1
                           || this.data.permissions[ind]['resource' + num + '_resource_id_generic'] === true) {
                        this.data.permissions[ind]['resource' + num + '_id'] = null;
                    } else if (this.data.permissions[ind]['resource' + num + '_resource_id_generic'] === null) {
                        this.data.permissions[ind]['resource' + num + '_id'] = null;
                    }

                } else if (field === "resourceID") {
                    if (this.data.permissions[ind]['resource' + num + '_id'] !== null) {
                        this.data.permissions[ind]['resource' + num + '_resource_id_generic'] = false;
                    }
                }
            }
        },
    },

}
</script>

<style scoped>

</style>