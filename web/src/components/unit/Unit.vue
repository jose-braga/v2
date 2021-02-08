<template>
    <p>
        Unit: Under Construction
    </p>

</template>

<script>
export default {
    mounted: function () {
        this.$store.commit('setActiveTile', {
            newTile: 4,
            newToolbarText: 'Get Unit info'
        });
    },
    computed: {

    },
    methods: {

    }
}

</script>
