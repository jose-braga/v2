<template>
    <p>
        Group: Under Construction
    </p>

</template>

<script>
export default {
    mounted: function () {
        this.$store.commit('setActiveTile', {
            newTile: 3,
            newToolbarText: 'Edit your group details'
        });
    },
    computed: {

    },
    methods: {

    }
}

</script>
