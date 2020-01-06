<template>
<v-container>
    <v-row>
        <v-col cols="12">
            <CurrentMembers
                :segment-type="segmentType"
                :unit-id="unitId"
                :city-id="cityId"
                :unit-data="unitData"
                :city-data="cityData"
            ></CurrentMembers>
        </v-col>
    </v-row>
    <!--
    <v-row>
        <v-col cols="12">
            <PastMembers></PastMembers>
        </v-col>
    </v-row>
    -->
</v-container>
</template>

<script>
import CurrentMembers from './CurrentMembersList'

export default {
     components: {
        CurrentMembers,
     },
     props: {
        segmentType: String,
        unitId: Number,
        cityId: Number,
        unitData: Object,
        cityData: Object,
     }

}
</script>
<style scoped>

</style>