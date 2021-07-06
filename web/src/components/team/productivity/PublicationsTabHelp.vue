<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Help for "Publications" Tab</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <v-container>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Your team publications</b>
                </v-col>
                <v-col cols="12" md="9">
                    This table contains a list of publications associated to your lab.<br>
                    For each publication you control if it is visible and highlighted in
                    the website Lab page (note that this is specific to the lab
                    and is independent from what was defined at the "Person" level).<br>
                    If a publication should not be associated to your lab click
                    the icon <v-icon color="green darken-1">mdi-link</v-icon>, it
                    will change to the icon <v-icon color="red darken-1">mdi-link-off</v-icon>
                    (if you change your mind just click the red icon again).
                     Changes will be committed if you press "Update".
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Publications from team members</b>
                </v-col>
                <v-col cols="12" md="9">
                    This table contains all the publications reported by team members
                    that are not yet part of your lab publications. Simply select
                    the ones which should be part of your lab publications and then click
                    "Associate to Lab".
                </v-col>
            </v-row>
        </v-container>
    </v-card-text>
</v-card>
</template>

<script>
export default {

}
</script>

<style scoped>

</style>
