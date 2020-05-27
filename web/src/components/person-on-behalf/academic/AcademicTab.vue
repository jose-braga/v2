<template>
    <Degrees
        :other-person-id="otherPersonId"
    ></Degrees>
</template>

<script>
import Degrees from './Degrees'

export default {
    components: {
        Degrees
    },
    props: {
    },
    computed: {
        otherPersonId() {
            return parseInt(this.$route.params.id, 10);
        },
    },
    data () {
        return {

        }
    },
}
</script>

<style scoped>

</style>
