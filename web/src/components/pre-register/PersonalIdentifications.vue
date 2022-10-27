<template>
<v-card class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Personal Identifications</h3>
        </div>
    </v-card-title>
    <v-card-text></v-card-text>
    <v-container class="px-6">
        <p v-if="data.identifications.length === 0">
            No data.
        </p>
        <div v-for="(identification, i) in data.identifications"
            :key="i">
            <v-row align="center">
                <v-col cols="11" sm="4">
                    <v-select v-model="identification.card_type_id"
                        :items="cardTypes" item-value="id" item-text="name_en"
                        @input="addValue"
                        label="Card Type">
                    </v-select>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-text-field
                        v-model="identification.card_number"
                        @input="addValue"
                        label="Card ID number">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="3">
                    <v-menu ref="identification.show_date_end"
                        v-model="identification.show_date_end"
                        :close-on-content-click="false"
                        :nudge-right="10"
                        transition="scale-transition"
                        offset-y min-width="290px">
                        <template v-slot:activator="{ on }">
                            <v-text-field v-model="identification.valid_until"
                                @input="addValue"
                                label="Valid until" v-on="on">
                            </v-text-field>
                        </template>
                        <v-date-picker v-model="identification.valid_until"
                                @input="identification.show_date_end = false; addValue()"
                                no-title></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="1">
                    <v-btn icon @click.stop="removeItem(data.identifications, i)">
                        <v-icon color="red darken">mdi-delete</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-divider v-if="i < data.identifications.length - 1"></v-divider>
        </div>
        <v-row>
            <v-btn class="ml-2 mb-4" outlined @click="addItem()">
                Add an identification
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
            cardTypes: [],
            data: {
                identifications: [],
            },
        }
    },
    created () {
        this.getCardTypes();
    },
    methods: {
        addValue () {
            this.$store.commit('addPersonData', this.data);
        },
        getCardTypes () {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'card-types';
            subUtil.getPublicInfo(vm, urlSubmit, 'cardTypes');
        },
        addItem() {
            this.data.identifications.push({id: 'new', card_type_id: null,
                card_number: null, valid_until: null});
        },
        removeItem(list, ind) {
            list.splice(ind, 1);
            this.addValue();
        },
    },

}
</script>

<style>

</style>