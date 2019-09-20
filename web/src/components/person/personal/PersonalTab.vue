<template>
    <v-layout wrap>
        <v-flex xs12 sm12 md6 lg6 pa-1>
            <NuclearInformation></NuclearInformation>                
        </v-flex>
        <v-flex xs12 sm12 md6 lg6 pa-1>
            <Photo></Photo>                
        </v-flex>
    </v-layout>
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

<style>

</style>
