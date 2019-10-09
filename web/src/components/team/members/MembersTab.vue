<template>
<v-layout wrap>
    <v-flex xs12 sm12 md6 lg6 pa-1>
        <p>Teste</p>
    </v-flex>
    <v-flex xs12 sm12 md6 lg6 pa-1>
        <p>Teste2</p>
    </v-flex>
</v-layout>
    
</template>

<script>
import subUtil from '../../common/submit-utils'

export default {
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            date_menu: false,
            data: {
                members: [],
            },
        }
    },
    created() {
        this.initialize();
    },


    methods: {
          initialize() {
            if (this.$store.state.session.loggedIn) {
                //let personID = this.$store.state.session.personID;
                let labID = 2;
                let urlSubmit = 'api/labs/' + labID + '/members';
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    // eslint-disable-next-line
                    console.log(result)
                    
                });                
            } else {
                this.$refs.form.reset();
            }
          },
     },

}
</script>

<style>

</style>
