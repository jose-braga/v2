<template>
<v-card flat>
    <v-container class="px-6">
        <v-row v-if="$v.data.prizes.$model.length === 0">
            Please add prizes your received
        </v-row>
        <v-row v-else
            v-for="(v,i) in $v.data.prizes.$each.$iter"
            :key="i"
            align="center"
        >
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="v.$model.prize_name"
                    :error="v.prize_name.$error"
                    @input="v.prize_name.$touch(); addValue()"
                    label="Prize name*">
                </v-text-field>
                <div v-if="v.prize_name.$error">
                    <p v-if="!v.prize_name.maxLength" class="caption red--text">Maximum length is 200 characters.</p>
                    <p v-if="!v.prize_name.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="1">
                <v-text-field
                    v-model="v.$model.year"
                    :error="v.year.$error"
                    @input="v.year.$touch(); addValue()"
                    label="Year">
                </v-text-field>
                <div v-if="v.year.$error">
                    <p v-if="!v.year.integer" class="caption red--text">Must be integer.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="6">
                <v-textarea
                    v-model="v.$model.additional"
                    :error="v.additional.$error"
                    @input="v.additional.$touch(); addValue()"
                    rows="2"
                    counter
                    label="Additional relevant data">
                </v-textarea>
                <div v-if="v.additional.$error">
                    <p v-if="!v.additional.maxLength" class="caption red--text">Maximum length is 2000 characters.</p>
                </div>
            </v-col>
            <v-col cols="1" sm="1">
                <v-btn icon @click="removeItem(data.prizes, i)" class="mt-3">
                    <v-icon color="red darken">mdi-delete</v-icon>
                </v-btn>
            </v-col>
            <v-col cols="12">
                <v-divider></v-divider>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="mt-4">
                <v-btn outlined
                    @click="addItem(data.prizes)"
                >
                    Add a prize
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</v-card>
</template>

<script>
import {maxLength, required, integer} from 'vuelidate/lib/validators'

export default {
    data() {
        return {
            data: {
                prizes: [],
            },
        }
    },
    created() {
        this.initialize ();
    },

    methods: {
        initialize () {
            let callSegment = this.$route.params.callSegment;
            if (callSegment !== undefined) {
                let savedData = this.$store.state.application;
                Object.keys(this.data).forEach(key => {
                    let value = savedData.application[key];
                    this.$set(this.data, key, value);
                });
            }
        },
        addValue () {
            this.$store.dispatch('addApplicationData', this.data);
        },
        addItem(list) {
            list.push({
                prize_name: null,
                year: null,
                additional: null,
            })
            this.$store.dispatch('addApplicationData', this.data);
        },
        removeItem(list, ind) {
            list.splice(ind, 1);
            this.$store.dispatch('addApplicationData', this.data);
        },
    },
    validations: {
        data: {
            prizes: {
                $each: {
                    prize_name: { required, maxLength: maxLength(200) },
                    year: { integer },
                    additional: { maxLength: maxLength(2000) },
                }
            },
        },
    },

}
</script>

<style>

</style>