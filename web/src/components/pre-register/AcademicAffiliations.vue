<template>
<v-card class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Affiliation to Academic Institutions</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container class="px-6">
        <p v-if="data.academicAffiliations.length === 0">
            No data.
        </p>
        <div v-for="(department, i) in data.academicAffiliations"
            :key="i">
            <v-row align="center">
                <v-col cols="12" sm="4">
                    <v-select
                        v-model="department.department_id"
                        @input="addValue"
                        :items="departments" item-value="id" item-text="short_str_department_en"
                        label="Academic Institution">
                    </v-select>
                </v-col>
                <v-col cols="12" sm="3">
                    <v-menu ref="department.show_date_start"
                        v-model="department.show_date_start"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="department.valid_from"
                                @input="addValue"
                                label="Started" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="department.valid_from"
                                @input="department.show_date_start = false; addValue()"
                                no-title></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" sm="3">
                    <v-menu ref="department.show_date_end"
                        v-model="department.show_date_end"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="department.valid_until"
                                @input="addValue"
                                label="Ended" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="department.valid_until"
                                @input="department.show_date_end = false; addValue()"
                                no-title></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="1">
                    <v-btn icon @click.stop="removeItem(data.academicAffiliations, i)">
                        <v-icon color="red darken">mdi-delete</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-divider v-if="i < data.academicAffiliations.length - 1"></v-divider>
        </div>
        <v-row class="ml-4">
            <v-btn outlined @click="addItem()">
                Add an affiliation
            </v-btn>
        </v-row>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    data() {
        return {
            departments: [],
            data: {
                academicAffiliations: [],
            },
        }
    },
    created() {
        this.getDepartments();
    },
    methods: {
        addValue () {
            this.$store.commit('addPersonData', this.data);
        },
        getDepartments () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'departments';
            return subUtil.getPublicInfo(vm, urlSubmit, 'departments');

        },
        addItem() {
            this.data.academicAffiliations.push({id: 'new', department_id: null,
                valid_from: null, valid_until: null});
        },
        removeItem(list, ind) {
            list.splice(ind, 1);
            this.addValue();
        },
    },

}
</script>

<style scoped>

</style>