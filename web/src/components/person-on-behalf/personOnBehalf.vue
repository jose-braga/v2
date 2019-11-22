<template>
    <p>
        Behalf
    </p>

</template>

<script>
export default {
    mounted: function () {
        this.$store.commit('setActiveTile', {
            newTile: 1,
            newToolbarText: 'Edit other people data'
        });
    },
    computed: {

    },
    methods: {

    }
}

</script>