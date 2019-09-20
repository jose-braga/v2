<template>
    <p>
        Group
    </p>
  
</template>

<script>
export default {
    mounted: function () {
        this.$store.commit('setActiveTile', {
            newTile: 2,
            newToolbarText: 'Edit your group details'
        });
    },
    computed: {
       
    },
    methods: {
        
    }
}

</script>
