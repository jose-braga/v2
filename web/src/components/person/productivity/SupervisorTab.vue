<template>
<v-row>
    <v-col cols="12">
        <SupervisingList
                :current-tab="currentTab"
        ></SupervisingList>
    </v-col>
</v-row>
</template>

<script>
import SupervisingList from './supervisor/SupervisingList'

export default {
    components: {
        SupervisingList,
    },
    props: {
        currentTab: String,
    },

}
</script>

<style scoped>

</style>