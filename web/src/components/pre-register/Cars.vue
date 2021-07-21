<template>
<v-card  class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Cars (only for NOVA ST)</h3>
        </div>
    </v-card-title>
    <v-container class="px-6">
        <v-row>
            <v-col>
                <v-btn small outlined
                    @click="addItem(data.cars)">
                    Add a car
                </v-btn>
            </v-col>
        </v-row>
        <div v-for="(car,i) in data.cars"
            :key="i"
        >
            <v-row align="center">
                <v-col cols="12" sm="4">
                    <v-text-field
                        @input="addValue"
                        v-model="car.license"
                        label="Driver's license ID">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-text-field
                        @input="addValue"
                        v-model="car.brand"
                        label="Brand (e.g. Porsche, Ferrari)">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                    <v-text-field
                        @input="addValue"
                        v-model="car.model"
                        label="Model (e.g. 911)">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="3">
                    <v-text-field
                        @input="addValue"
                        v-model="car.color"
                        label="Color">
                    </v-text-field>
                </v-col>
                <v-col cols="12" sm="5">
                    <v-text-field
                        @input="addValue"
                        v-model="car.plate"
                        label="Plate ID (e.g. 00-AA-00)">
                    </v-text-field>
                </v-col>
                <v-col cols="1">
                    <v-btn icon @click.stop="removeItem(data.cars, i)">
                        <v-icon color="red darken">mdi-delete</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-divider v-if="i < data.cars.length - 1"></v-divider>
        </div>
    </v-container>
</v-card>
</template>

<script>
export default {
    data() {
        return {
            data: {
                cars: [],
            },
        }
    },

    methods: {

        addValue () {
            this.$store.commit('addPersonData', this.data);
        },
        addItem() {
            this.data.cars.push({id: 'new', license: null,
                brand: null, model: null, color: null, plate: null});
        },
        removeItem(list, ind) {
            if (list[ind].id !== 'new') {
                this.toDelete.push(list[ind]);
            }
            list.splice(ind, 1);
        },
    }
}
</script>

<style>

</style>