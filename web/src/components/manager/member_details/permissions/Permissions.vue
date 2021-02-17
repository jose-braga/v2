<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Endpoint Permissions</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container class="px-6">
        <v-row justify="start" class="ml-6 mb-6">
            <v-btn @click="addPermission()"
                outlined color="blue">Add permission
            </v-btn>
        </v-row>
        <v-expansion-panels v-model="openPanel">
            <v-expansion-panel
            v-for="(permission, i) in data.permissions"
            :key="i"
            >
            <v-expansion-panel-header>
                <span v-if="permission.id === 'new'">
                    <span class="method">New endpoint permission {{ i + 1 }}</span>
                </span>
                <span v-else>
                    <span class="method">{{permission.method_name}}</span>:
                    <span class="url">{{permission.endpoint_url}}</span>
                </span>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
                <v-form :ref="'form-' + i"
                    @submit.prevent="submitForm(i)">
                    <v-row>
                        <v-col cols="12" sm="3">
                            <v-select v-model="permission.method_id"
                                multiple
                                :items="requestMethods"
                                item-value="id" item-text="name"
                                label="Methods"
                                dense>
                            </v-select>
                        </v-col>
                        <v-col cols="12" sm="3">
                            <v-checkbox
                                v-model="permission.allow_all_subpaths"
                                label="Allow all subpaths"
                                dense
                            ></v-checkbox>
                        </v-col>
                    </v-row>
                    <v-row align="center">
                        <v-col cols="12" sm="3">
                            <v-select v-model="permission.resource1_type_id"
                                @change="processGenericId(i, 1, 'resourceTypeID')"
                                :items="resourceTypes"
                                item-value="id" item-text="name"
                                label="Resource 1 Type"
                                dense>
                            </v-select>
                        </v-col>
                        <v-col cols="12" sm="3" v-if="permission.resource1_hasID">
                            <v-autocomplete v-if="permission.resource1_type_id === 1"
                                v-model="permission.resource1_id"
                                @change="processGenericId(i, 1, 'resourceID')"
                                :items="people"
                                item-value="id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 1 person name"
                                dense>
                            </v-autocomplete>
                            <v-select v-else-if="permission.resource1_type_id === 2"
                                v-model="permission.resource1_id"
                                @change="processGenericId(i, 1, 'resourceID')"
                                :items="labs"
                                item-value="id" item-text="name"
                                label="Resource 1 lab name"
                                dense>
                            </v-select>
                            <v-select v-else-if="permission.resource1_type_id === 3"
                                v-model="permission.resource1_id"
                                @change="processGenericId(i, 1, 'resourceID')"
                                :items="groups"
                                item-value="id" item-text="name"
                                label="Resource 1 group name"
                                dense>
                            </v-select>
                            <v-select v-else-if="permission.resource1_type_id === 4"
                                v-model="permission.resource1_id"
                                @change="processGenericId(i, 1, 'resourceID')"
                                :items="units"
                                item-value="id" item-text="short_name"
                                label="Resource 1 unit name"
                                dense>
                            </v-select>
                            <v-select v-else-if="permission.resource1_type_id === 5"
                                v-model="permission.resource1_id"
                                @change="processGenericId(i, 1, 'resourceID')"
                                :items="institutionCities"
                                item-value="id" item-text="city"
                                label="Resource 1 city name"
                                dense>
                            </v-select>
                            <v-autocomplete v-else-if="permission.resource1_type_id === 7"
                                v-model="permission.resource1_id"
                                @change="processGenericId(i, 1, 'resourceID')"
                                :items="people"
                                item-value="id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 1 person name"
                                dense>
                            </v-autocomplete>
                            <v-autocomplete v-else-if="permission.resource1_type_id === 8"
                                v-model="permission.resource1_id"
                                @change="processGenericId(i, 1, 'resourceID')"
                                :items="people"
                                item-value="id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 1 person name"
                                dense>
                            </v-autocomplete>
                            <v-autocomplete v-else-if="permission.resource1_type_id === 11"
                                v-model="permission.resource1_id"
                                @change="processGenericId(i, 1, 'resourceID')"
                                :items="people"
                                item-value="user_id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 1 person name"
                                dense>
                            </v-autocomplete>
                            <v-text-field v-else
                                v-model="permission.resource1_id"
                                @change="processGenericId(i, 1, 'resourceID')"
                                label="Resource 1 ID"
                                dense>
                            </v-text-field>
                        </v-col>
                        <v-col cols="6" sm="2">
                            <v-checkbox
                                v-model="permission.resource1_hasID"
                                @change="processGenericId(i, 1, 'hasID')"
                                label="Has ID?"
                                dense
                            ></v-checkbox>
                        </v-col>
                        <v-col cols="6" sm="2">
                            <v-checkbox
                                v-model="permission.resource1_resource_id_generic"
                                @change="processGenericId(i, 1, 'generic')"
                                label="Generic?"
                                dense
                            ></v-checkbox>
                        </v-col>
                    </v-row>
                    <v-row v-if="permission.resource1_hasID || permission.resource1_resource_id_generic"
                            align="center"
                    >
                        <v-col cols="12" sm="3">
                            <v-select v-model="permission.resource2_type_id"
                                @change="processGenericId(i, 2, 'resourceTypeID')"
                                :items="resourceTypes"
                                item-value="id" item-text="name"
                                label="Resource 2 Type"
                                dense>
                            </v-select>
                        </v-col>
                        <v-col cols="12" sm="3" v-if="permission.resource2_hasID">
                            <v-autocomplete v-if="permission.resource2_type_id === 1"
                                v-model="permission.resource2_id"
                                @change="processGenericId(i, 2, 'resourceID')"
                                :items="people"
                                item-value="id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 2 person name"
                                dense>
                            </v-autocomplete>
                            <v-select v-else-if="permission.resource2_type_id === 2"
                                v-model="permission.resource2_id"
                                @change="processGenericId(i, 2, 'resourceID')"
                                :items="labs"
                                item-value="id" item-text="name"
                                label="Resource 2 lab name"
                                dense>
                            </v-select>
                            <v-select v-else-if="permission.resource2_type_id === 3"
                                v-model="permission.resource2_id"
                                @change="processGenericId(i, 2, 'resourceID')"
                                :items="groups"
                                item-value="id" item-text="name"
                                label="Resource 2 group name"
                                dense>
                            </v-select>
                            <v-select v-else-if="permission.resource2_type_id === 4"
                                v-model="permission.resource2_id"
                                @change="processGenericId(i, 2, 'resourceID')"
                                :items="units"
                                item-value="id" item-text="short_name"
                                label="Resource 2 unit name"
                                dense>
                            </v-select>
                            <v-select v-else-if="permission.resource2_type_id === 5"
                                v-model="permission.resource2_id"
                                @change="processGenericId(i, 2, 'resourceID')"
                                :items="institutionCities"
                                item-value="id" item-text="city"
                                label="Resource 2 city name"
                                dense>
                            </v-select>
                            <v-autocomplete v-else-if="permission.resource2_type_id === 7"
                                v-model="permission.resource2_id"
                                @change="processGenericId(i, 2, 'resourceID')"
                                :items="people"
                                item-value="id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 2 person name"
                                dense>
                            </v-autocomplete>
                            <v-autocomplete v-else-if="permission.resource2_type_id === 8"
                                v-model="permission.resource2_id"
                                @change="processGenericId(i, 2, 'resourceID')"
                                :items="people"
                                item-value="id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 2 person name"
                                dense>
                            </v-autocomplete>
                            <v-autocomplete v-else-if="permission.resource2_type_id === 11"
                                v-model="permission.resource2_id"
                                @change="processGenericId(i, 2, 'resourceID')"
                                :items="people"
                                item-value="user_id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 2 person name"
                                dense>
                            </v-autocomplete>
                            <v-text-field v-else
                                v-model="permission.resource2_id"
                                @change="processGenericId(i, 2, 'resourceID')"
                                label="Resource 2 ID"
                                dense>
                            </v-text-field>
                        </v-col>
                        <v-col cols="5" sm="2">
                            <v-checkbox
                                v-model="permission.resource2_hasID"
                                @change="processGenericId(i, 2, 'hasID')"
                                label="Has ID?"
                                dense
                            ></v-checkbox>
                        </v-col>
                        <v-col cols="5" sm="2">
                            <v-checkbox
                                v-model="permission.resource2_resource_id_generic"
                                @change="processGenericId(i, 2, 'generic')"
                                label="Generic?"
                                dense
                            ></v-checkbox>
                        </v-col>
                        <v-col cols="2" sm="2">
                            <v-btn text @click="processGenericId(i, 2, 'blank')">
                                <v-icon color="red darken-1">mdi-eraser</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row v-if="permission.resource2_hasID || permission.resource2_resource_id_generic"
                        align="center"
                    >
                        <v-col cols="12" sm="3">
                            <v-select v-model="permission.resource3_type_id"
                                @change="processGenericId(i, 3, 'resourceTypeID')"
                                :items="resourceTypes"
                                item-value="id" item-text="name"
                                label="Resource 3 Type"
                                dense>
                            </v-select>
                        </v-col>
                        <v-col cols="12" sm="3" v-if="permission.resource3_hasID">
                            <v-autocomplete v-if="permission.resource3_type_id === 1"
                                v-model="permission.resource3_id"
                                @change="processGenericId(i, 3, 'resourceID')"
                                :items="people"
                                item-value="id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 3 person name"
                                dense>
                            </v-autocomplete>
                            <v-select v-else-if="permission.resource3_type_id === 2"
                                v-model="permission.resource3_id"
                                @change="processGenericId(i, 3, 'resourceID')"
                                :items="labs"
                                item-value="id" item-text="name"
                                label="Resource 3 lab name"
                                dense>
                            </v-select>
                            <v-select v-else-if="permission.resource3_type_id === 3"
                                v-model="permission.resource3_id"
                                @change="processGenericId(i, 3, 'resourceID')"
                                :items="groups"
                                item-value="id" item-text="name"
                                label="Resource 3 group name"
                                dense>
                            </v-select>
                            <v-select v-else-if="permission.resource3_type_id === 4"
                                v-model="permission.resource3_id"
                                @change="processGenericId(i, 3, 'resourceID')"
                                :items="units"
                                item-value="id" item-text="short_name"
                                label="Resource 3 unit name"
                                dense>
                            </v-select>
                            <v-select v-else-if="permission.resource3_type_id === 5"
                                v-model="permission.resource3_id"
                                @change="processGenericId(i, 3, 'resourceID')"
                                :items="institutionCities"
                                item-value="id" item-text="city"
                                label="Resource 3 city name"
                                dense>
                            </v-select>
                            <v-autocomplete v-else-if="permission.resource3_type_id === 7"
                                v-model="permission.resource3_id"
                                @change="processGenericId(i, 3, 'resourceID')"
                                :items="people"
                                item-value="id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 3 person name"
                                dense>
                            </v-autocomplete>
                            <v-autocomplete v-else-if="permission.resource3_type_id === 8"
                                v-model="permission.resource3_id"
                                @change="processGenericId(i, 3, 'resourceID')"
                                :items="people"
                                item-value="id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 3 person name"
                                dense>
                            </v-autocomplete>
                            <v-autocomplete v-else-if="permission.resource3_type_id === 11"
                                v-model="permission.resource1_id"
                                @change="processGenericId(i, 3, 'resourceID')"
                                :items="people"
                                item-value="user_id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 3 person name"
                                dense>
                            </v-autocomplete>
                            <v-text-field v-else
                                v-model="permission.resource3_id"
                                @change="processGenericId(i, 3, 'resourceID')"
                                label="Resource 3 ID"
                                dense>
                            </v-text-field>
                        </v-col>
                        <v-col cols="5" sm="2">
                            <v-checkbox
                                v-model="permission.resource3_hasID"
                                @change="processGenericId(i, 3, 'hasID')"
                                label="Has ID?"
                                dense
                            ></v-checkbox>
                        </v-col>
                        <v-col cols="5" sm="2">
                            <v-checkbox
                                v-model="permission.resource3_resource_id_generic"
                                @change="processGenericId(i, 3, 'generic')"
                                label="Generic?"
                                dense
                            ></v-checkbox>
                        </v-col>
                        <v-col cols="2" sm="2">
                            <v-btn text @click="processGenericId(i, 3, 'blank')">
                                <v-icon color="red darken-1">mdi-eraser</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row v-if="permission.resource3_hasID || permission.resource3_resource_id_generic"
                            align="center"
                    >
                        <v-col cols="12" sm="3">
                            <v-select v-model="permission.resource4_type_id"
                                @change="processGenericId(i, 4, 'resourceTypeID')"
                                :items="resourceTypes"
                                item-value="id" item-text="name"
                                label="Resource 4 Type"
                                dense>
                            </v-select>
                        </v-col>
                        <v-col cols="12" sm="3" v-if="permission.resource4_hasID">
                            <v-autocomplete v-if="permission.resource4_type_id === 1"
                                v-model="permission.resource4_id"
                                @change="processGenericId(i, 4, 'resourceID')"
                                :items="people"
                                item-value="id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 4 person name"
                                dense>
                            </v-autocomplete>
                            <v-select v-else-if="permission.resource4_type_id === 2"
                                v-model="permission.resource4_id"
                                @change="processGenericId(i, 4, 'resourceID')"
                                :items="labs"
                                item-value="id" item-text="name"
                                label="Resource 4 lab name"
                                dense>
                            </v-select>
                            <v-select v-else-if="permission.resource4_type_id === 3"
                                v-model="permission.resource4_id"
                                @change="processGenericId(i, 4, 'resourceID')"
                                :items="groups"
                                item-value="id" item-text="name"
                                label="Resource 4 group name"
                                dense>
                            </v-select>
                            <v-select v-else-if="permission.resource4_type_id === 4"
                                v-model="permission.resource1_id"
                                @change="processGenericId(i, 4, 'resourceID')"
                                :items="units"
                                item-value="id" item-text="short_name"
                                label="Resource 4 unit name"
                                dense>
                            </v-select>
                            <v-select v-else-if="permission.resource4_type_id === 5"
                                v-model="permission.resource4_id"
                                @change="processGenericId(i, 4, 'resourceID')"
                                :items="institutionCities"
                                item-value="id" item-text="city"
                                label="Resource 4 city name"
                                dense>
                            </v-select>
                            <v-autocomplete v-else-if="permission.resource4_type_id === 7"
                                v-model="permission.resource4_id"
                                @change="processGenericId(i, 4, 'resourceID')"
                                :items="people"
                                item-value="id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 4 person name"
                                dense>
                            </v-autocomplete>
                            <v-autocomplete v-else-if="permission.resource4_type_id === 8"
                                v-model="permission.resource4_id"
                                @change="processGenericId(i, 4, 'resourceID')"
                                :items="people"
                                item-value="id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 4 person name"
                                dense>
                            </v-autocomplete>
                            <v-autocomplete v-else-if="permission.resource4_type_id === 11"
                                v-model="permission.resource4_id"
                                @change="processGenericId(i, 4, 'resourceID')"
                                :items="people"
                                item-value="user_id" item-text="colloquial_name"
                                :filter="customSearch"
                                label="Resource 4 person name"
                                dense>
                            </v-autocomplete>
                            <v-text-field v-else
                                v-model="permission.resource4_id"
                                @change="processGenericId(i, 4, 'resourceID')"
                                label="Resource 4 ID"
                                dense>
                            </v-text-field>
                        </v-col>
                        <v-col cols="5" sm="2">
                            <v-checkbox
                                v-model="permission.resource4_hasID"
                                @change="processGenericId(i, 4, 'hasID')"
                                label="Has ID?"
                                dense
                            ></v-checkbox>
                        </v-col>
                        <v-col cols="5" sm="2">
                            <v-checkbox
                                v-model="permission.resource4_resource_id_generic"
                                @change="processGenericId(i, 4, 'generic')"
                                label="Generic?"
                                dense
                            ></v-checkbox>
                        </v-col>
                        <v-col cols="2" sm="2">
                            <v-btn text @click="processGenericId(i, 4, 'blank')">
                                <v-icon color="red darken-1">mdi-eraser</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row justify="end">
                        <v-col cols="2" align-self="end">
                            <v-row justify="end">
                                <v-btn @click="deletePermission(i)"
                                outlined color="red">Delete</v-btn>
                            </v-row>
                        </v-col>
                        <v-col v-if="permission.id === 'new'"
                                cols="2" align-self="end">
                            <v-row justify="end">
                                <v-btn @click="submitNewPermission(i)"
                                outlined color="blue">Create</v-btn>
                            </v-row>
                        </v-col>
                        <v-col v-else
                                cols="2" align-self="end">
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
            </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </v-container>
</v-card>

</template>
<script>
import subUtil from '@/components/common/submit-utils'

function makeEndpointURL(data) {
    for (let ind in data) {
        let url = '';
        // resource1 exists always
        if (data[ind].resource1_resource_id_generic === 1) {
            url = '/' + data[ind].resource1_type_name + '/' + '*';
        } else if (data[ind].resource1_resource_id_generic === null
                || data[ind].resource1_resource_id_generic === undefined) {
            url = '/' + data[ind].resource1_type_name;
            data[ind].endpoint_url = url;
            continue
        } else {
            url = '/' + data[ind].resource1_type_name + '/' + data[ind].resource1_id;
        }
        if (data[ind].resource2_type_name !== null && data[ind].resource2_type_name !== undefined)  {
            if (data[ind].resource2_resource_id_generic === 1) {
                url = url + '/' + data[ind].resource2_type_name + '/' + '*';
            } else if (data[ind].resource2_resource_id_generic === null
                || data[ind].resource2_resource_id_generic === undefined) {
                url = url + '/' + data[ind].resource2_type_name;
                data[ind].endpoint_url = url;
                continue
            } else {
                url = url + '/' + data[ind].resource2_type_name + '/' + data[ind].resource2_id;
            }
        } else {
            data[ind].endpoint_url = url;
            continue;
        }
        if (data[ind].resource3_type_name !== null && data[ind].resource3_type_name !== undefined) {
            if (data[ind].resource3_resource_id_generic === 1) {
                url = url + '/' + data[ind].resource3_type_name + '/' + '*';
            } else if (data[ind].resource3_resource_id_generic === null
                || data[ind].resource3_resource_id_generic === undefined) {
                url = url + '/' + data[ind].resource3_type_name;
                data[ind].endpoint_url = url;
                continue
            } else {
                url = url + '/' + data[ind].resource3_type_name + '/' + data[ind].resource3_id;
            }
        } else {
            data[ind].endpoint_url = url;
            continue;
        }
        if (data[ind].resource4_type_name !== null && data[ind].resource4_type_name !== undefined) {
            if (data[ind].resource4_resource_id_generic === 1) {
                url = url + '/' + data[ind].resource4_type_name + '/' + '*';
            } else if (data[ind].resource4_resource_id_generic === null
                || data[ind].resource4_resource_id_generic === undefined) {
                url = url + '/' + data[ind].resource4_type_name;
                data[ind].endpoint_url = url;
                continue
            } else {
                url = url + '/' + data[ind].resource4_type_name + '/' + data[ind].resource4_id;
            }
        } else {
            data[ind].endpoint_url = url;
            continue;
        }
    }
    return data;
}
function prepareStringComparison(str) {
    if (str === null || str === undefined) {
        return null;
    } else {
        return str.toLocaleLowerCase()
            .replace(/[áàãâä]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[íìîï]/g, 'i')
            .replace(/[óòõôö]/g, 'o')
            .replace(/[úùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[ñ]/g, 'n')
            .replace(/(\.\s)/g, '')
            .replace(/(\.)/g, '')
            .replace(/[-:()]/g, ' ')
            .trim()
            ;
    }
}

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
            openPanel: undefined,
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
            this.data.permissions = [];
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
                        //this.$set(this.data.permissions[ind], 'resource1_hasID', true);
                        if (this.data.permissions[ind].resource1_id === null) {
                            if (this.data.permissions[ind].resource1_resource_id_generic === 1
                                    || this.data.permissions[ind].resource1_resource_id_generic === true) {
                                this.$set(this.data.permissions[ind], 'resource1_hasID', true);
                            } else {
                                this.$set(this.data.permissions[ind], 'resource1_hasID', false);
                            }
                        } else {
                            this.$set(this.data.permissions[ind], 'resource1_hasID', true);
                        }
                        if (this.data.permissions[ind].resource2_id === null) {
                            if (this.data.permissions[ind].resource2_resource_id_generic === 1
                                    || this.data.permissions[ind].resource2_resource_id_generic === true) {
                                this.$set(this.data.permissions[ind], 'resource2_hasID', true);
                            } else {
                                this.$set(this.data.permissions[ind], 'resource2_hasID', false);
                            }
                        } else {
                            this.$set(this.data.permissions[ind], 'resource2_hasID', true);
                        }
                        if (this.data.permissions[ind].resource3_id === null) {
                            if (this.data.permissions[ind].resource3_resource_id_generic === 1
                                    || this.data.permissions[ind].resource3_resource_id_generic === true) {
                                this.$set(this.data.permissions[ind], 'resource3_hasID', true);
                            } else {
                                this.$set(this.data.permissions[ind], 'resource3_hasID', false);
                            }
                        } else {
                            this.$set(this.data.permissions[ind], 'resource3_hasID', true);
                        }
                        if (this.data.permissions[ind].resource4_id === null) {
                            if (this.data.permissions[ind].resource4_resource_id_generic === 1
                                    || this.data.permissions[ind].resource4_resource_id_generic === true) {
                                this.$set(this.data.permissions[ind], 'resource4_hasID', true);
                            } else {
                                this.$set(this.data.permissions[ind], 'resource4_hasID', false);
                            }
                        } else {
                            this.$set(this.data.permissions[ind], 'resource4_hasID', true);
                        }
                    }
                    this.data.permissions = makeEndpointURL(this.data.permissions)
                })
            }
        },
        submitForm (i) {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlUpdate = [];
                let permission = this.data.permissions[i];
                //first check which methods should be deleted or created
                for (let ind in permission.method_id) {
                    let found = false;
                    // if this method is not found on method_data, then is a new entry
                    for (let ind2 in permission.method_data) {
                        if (permission.method_data[ind2].method_id === permission.method_id[ind]) {
                            permission.method_data[ind2].action = 'update';
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        permission.method_data.push(
                            {
                                method_id: permission.method_id[ind],
                                id: 'new',
                                action: 'create',
                            }
                        );
                    }
                }
                for (let ind2 in permission.method_data) {
                    // if this method is not to be created or updated, must be deleted
                    if (permission.method_data[ind2].action === undefined) {
                        permission.method_data[ind2].action = 'delete';
                    }
                }
                urlUpdate.push({
                    url: 'api' + this.endpoint
                        + '/members'
                        + '/' + this.personId
                        + '/permissions/'
                        + permission.id,
                    body: permission,
                });
                this.$http.all(
                    urlUpdate.map(el =>
                        this.$http.put(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
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
        submitNewPermission (i) {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreate = [];
                let permission = this.data.permissions[i];
                for (let ind in permission.method_id) {
                    permission.method_data.push(
                        {
                            id:  'new',
                            method_id: permission.method_id[ind]
                        }
                    );
                    urlCreate.push({
                        url: 'api' + this.endpoint
                        + '/members'
                        + '/' + this.personId
                        + '/permissions',
                        body: {permission: permission, method_index: ind}
                    });
                }
                this.$http.all(
                    urlCreate.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
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
                    for (let ind in permission.method_data) {
                        urlDelete.push(
                            'api' + this.endpoint
                                + '/members'
                                + '/' + this.personId
                                + '/permissions/'
                                + permission.method_data[ind].id
                        );
                    }
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
            this.openPanel = 0;
            this.data.permissions = [
                {
                    id: 'new',
                    allow_all_subpaths: false,
                    resource1_type_id: null,
                    resource1_id: null,
                    resource1_resource_id_generic: null,
                    resource2_type_id: null,
                    resource2_id: null,
                    resource2_resource_id_generic: null,
                    resource3_type_id: null,
                    resource3_id: null,
                    resource3_resource_id_generic: null,
                    resource4_type_id: null,
                    resource4_id: null,
                    resource4_resource_id_generic: null,
                    method_data: [],
                },
                ...this.data.permissions
                ];
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
            if (field !=='blank' &&
                this.data.permissions[ind]['resource' + num + '_type_id'] === null) {
                this.data.permissions[ind]['resource' + num + '_id'] = null;
                this.data.permissions[ind]['resource' + num + '_hasID'] = null;
                this.data.permissions[ind]['resource' + num + '_resource_id_generic'] = null;
            } else {
                if (field === 'generic') {
                    if (this.data.permissions[ind]['resource' + num + '_resource_id_generic'] === 1
                        || this.data.permissions[ind]['resource' + num + '_resource_id_generic'] === true) {
                        this.data.permissions[ind]['resource' + num + '_id'] = null;
                        this.data.permissions[ind]['resource' + num + '_hasID'] = true;
                    } else if (this.data.permissions[ind]['resource' + num + '_resource_id_generic'] === null) {
                        this.data.permissions[ind]['resource' + num + '_id'] = null;
                        this.data.permissions[ind]['resource' + num + '_hasID'] = null;
                    }

                } else if (field === "resourceID") {
                    if (this.data.permissions[ind]['resource' + num + '_id'] !== null) {
                        this.data.permissions[ind]['resource' + num + '_resource_id_generic'] = false;
                        this.data.permissions[ind]['resource' + num + '_hasID'] = true;
                    }
                } else if (field === 'hasID') {
                    if (this.data.permissions[ind]['resource' + num + '_hasID'] === false) {
                        this.data.permissions[ind]['resource' + num + '_id'] = null;
                        this.data.permissions[ind]['resource' + num + '_resource_id_generic'] = null;
                        for (let k = num + 1; k <= 4; k++) {
                            this.data.permissions[ind]['resource' + k + '_id'] = null;
                            this.data.permissions[ind]['resource' + k + '_resource_id_generic'] = null;
                            this.data.permissions[ind]['resource' + k + '_hasID'] = null;
                            this.data.permissions[ind]['resource' + k + '_type_id'] = null;
                        }
                    }
                }  else if (field === 'blank') {
                    this.data.permissions[ind]['resource' + num + '_type_id'] = null;
                    this.data.permissions[ind]['resource' + num + '_id'] = null;
                    this.data.permissions[ind]['resource' + num + '_resource_id_generic'] = null;
                    this.data.permissions[ind]['resource' + num + '_hasID'] = false;
                    for (let k = num + 1; k <= 4; k++) {
                        this.data.permissions[ind]['resource' + k + '_id'] = null;
                        this.data.permissions[ind]['resource' + k + '_resource_id_generic'] = null;
                        this.data.permissions[ind]['resource' + k + '_hasID'] = null;
                        this.data.permissions[ind]['resource' + k + '_type_id'] = null;
                    }
                }
            }
        },
        customSearch (item, queryText, itemText) {
            let queryPre = prepareStringComparison(queryText);
            let query = queryPre.split(' ');
            let text = prepareStringComparison(itemText);
            for (let ind in query) {
                if (text.indexOf(query[ind]) === -1) {
                    return false;
                }
            }
            return true;
        },
    },

}
</script>

<style scoped>
.method {
    font-weight: 700;
}
.url {
    color:royalblue;
    font-weight: 600;
    font-size: 1.2em;
}

</style>