<template>
    <v-row class="pa-4">
        <v-col cols="12" md="6">
            <Authorization></Authorization>
            <NuclearInformation></NuclearInformation>
        </v-col>
        <v-col cols="12" md="6">
            <Photo></Photo>
        </v-col>
        <v-col cols="12">
            
        </v-col>
    </v-row>
</template>

<script>
import Authorization from './Authorization'
import NuclearInformation from './NuclearInformation'
import Photo from './Photo'

export default {
    components: {
        Authorization,
        NuclearInformation,
        Photo,
    }

}
</script>

<style scoped>

</style>
