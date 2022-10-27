<template>
<v-card  class="mb-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Post-registration actions (only NOVA ST)</h3>
        </div>
    </v-card-title>
    <v-container class="px-6">
        <p class="small-text">Requires definition of NOVA ST department (Academic Affiliations above).</p>
        <v-row>
            <v-col>
                <v-checkbox
                    @change="addValue"
                    v-model="data.selectCar"
                    label="Request car access to NOVA ST campus (if yes, insert car information below)"
                ></v-checkbox>
                <v-checkbox
                    @change="addValue"
                    v-model="data.selectAccess"
                    label="Request access to 'Departamental' building outside normal working hours (i.e. from 20:00 to 08:00 and holidays)"
                ></v-checkbox>
            </v-col>
        </v-row>
    </v-container>
</v-card>
</template>

<script>
export default {
    data() {
        return {
            data: {
                selectCar: false,
                selectAccess: false,
            },
        }
    },
    methods: {
        addValue () {
            this.$store.dispatch('addPersonData', this.data);
        },
    },
}
</script>

<style>
.small-text {
    font-size: 0.75rem;
}
</style>