<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="6">
                <NuclearInformation></NuclearInformation>
            </v-col>
            <v-col cols="12" md="6">
                <Photo></Photo>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import NuclearInformation from './NuclearInformation'
import Photo from './Photo'

export default {
    components: {
        NuclearInformation,
        Photo
    }

}
</script>

<style scoped>

</style>
