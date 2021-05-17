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
    <v-row>
        <v-col cols="12">
            <PastMembers
                :segment-type="segmentType"
                :unit-id="unitId"
                :city-id="cityId"
                :unit-data="unitData"
                :city-data="cityData"
            ></PastMembers>
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="12">
            <FctManagement
                :segment-type="segmentType"
                :unit-id="unitId"
                :city-id="cityId"
                :unit-data="unitData"
                :city-data="cityData"
            ></FctManagement>
        </v-col>
    </v-row>
</v-container>
</template>

<script>
import CurrentMembers from './CurrentMembersList'
import PastMembers from './PastMembersList'
import FctManagement from './FctManagement'


export default {
    components: {
       CurrentMembers,
       PastMembers,
       FctManagement,
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