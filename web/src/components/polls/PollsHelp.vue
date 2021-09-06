<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Help for Polls Section</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <v-container>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Open Polls</b>
                </v-col>
                <v-col cols="12" md="9">
                    Presents a list of currently open polls. To be able to vote you
                    must have been authorized by a Poll Manager. When voting, your vote
                    will be recorded in the database, you will be tagged as having voted,
                    and we will register the date and time of your vote. However, it won't
                    be possible to associate your vote to you so voting is anonymous.
                    Also it won't be possible to vote more than once in a poll.
                    <br><br>
                    Please vote carefully, as <b>voting cannot be undone</b>.
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Upcoming Polls</b>
                </v-col>
                <v-col cols="12" md="9">
                    Presents a list of upcoming polls.
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Past Polls</b>
                </v-col>
                <v-col cols="12" md="9">
                    [Under construction] Click on a past poll to get poll details,
                    provided you had permissions to vote.
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

<style>

</style>