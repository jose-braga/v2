<template>
<v-card class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Responsibles within LAQV/UCIBIO</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container class="px-6">
        <v-row>
            <v-col>
                <v-btn small outlined
                    @click="addItem(data.responsibles)">
                    Add responsible
                </v-btn>
            </v-col>
        </v-row>
        <v-row
            v-for="(v,i) in $v.data.responsibles.$each.$iter"
            :key="i">
            <v-col cols="12" sm="5">
                <v-autocomplete
                    v-model="v.responsible_id"
                    :loading="loadingPeople"
                    :items="people" item-value="id" item-text="colloquial_name"
                    @input="addValue"
                    :search-input.sync="v.responsible_search"
                    :filter="customSearch"
                    cache-items
                    flat
                    hide-no-data
                    hide-details
                    label="Responsible">
                </v-autocomplete>
            </v-col>
            <v-col cols="12" sm="3">
                <v-menu ref="v.show_date_start" v-model="v.$model.show_date_start"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="v.$model.valid_from"
                            :error="v.valid_from.$error"
                            @input="addValue; v.valid_from.$touch()"
                            label="Started" v-on="on">
                        </v-text-field>
                        <div v-show="v.valid_from.$error">
                            <p v-show="!v.valid_from.isValid" class="caption red--text">Date format should be 'YYYY-MM-DD' (or empty)</p>
                        </div>
                    </template>
                    <v-date-picker v-model="v.$model.valid_from"
                            @input="v.$model.show_date_start = false; addValue()"
                            no-title></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="12" sm="3">
                <v-menu ref="v.show_date_end" v-model="v.$model.show_date_end"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="v.$model.valid_until"
                            :error="v.valid_until.$error"
                            @input="addValue; v.valid_until.$touch()"
                            label="Ended" v-on="on">
                        </v-text-field>
                        <div v-show="v.valid_until.$error">
                            <p v-show="!v.valid_until.isValid" class="caption red--text">Date format should be 'YYYY-MM-DD' (or empty)</p>
                        </div>
                    </template>
                    <v-date-picker v-model="v.$model.valid_until"
                            @input="v.$model.show_date_end = false; addValue()"
                            no-title></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="12" sm="1">
                <v-btn icon @click="removeItem(data.responsibles, i)" class="mt-3">
                    <v-icon color="red darken">mdi-delete</v-icon>
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

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
    data() {
        return {
            data: {
                responsibles: [],
            },
            people: [],
            loadingPeople: false,
        }
    },
    mounted() {
        this.getPeople();
    },
    methods: {
        addValue () {
            this.$store.commit('addPersonData', this.data);
        },

        getPeople() {
            var vm = this;
            const urlSubmit = 'api/v2/' + 'supervisors';
            return subUtil.getPublicInfo(vm, urlSubmit, 'people', 'colloquial_name');

        },
        addItem(list) {
            list.push({
                id: 'new',
                person_id: this.personId,
                responsible_id: null,
                valid_from: null,
                valid_until: null,
                show_date_start: false,
                show_date_end: false
            });
        },
        removeItem(list, ind) {
            list.splice(ind, 1);
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
    validations: {
        data: {
            responsibles: {
                $each: {
                    valid_from: { isValid: time.validate },
                    valid_until: { isValid: time.validate },
                },
            },
        },
    },

}
</script>

<style scoped>

</style>