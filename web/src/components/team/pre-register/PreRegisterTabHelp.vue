<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Help for "Pre-Register" Tab</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <v-container>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Search person in database</b>
                </v-col>
                <v-col cols="12" md="9">
                    To avoid registering duplicates of people already in the
                    database please use the search (char > 3).
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Pre-register new member</b>
                </v-col>
                <v-col cols="12" md="9">
                    Fill in the required fields. This is the only input that is
                    needed from the Lab/Team Leader. After pressing "Pre-register" the following
                    sequence of events occur:
                    <ol>
                        <li>the new person will receive immediately an email with
                            a link to a form (if she didn't, please ask her to check
                            the Spam folder);
                        </li>
                        <li>The new person submits
                            the registration form and Science Management is warned that
                            a registration awaits approval;
                        </li>
                        <li>a member of the Science Management Office may make a
                            few corrections to the form and then validates the registration.
                        </li>
                    </ol>
                    <br> Only after successful validation will a new member appear
                        in the plataform (also do not forget that to appear in the
                        website the member must also authorize the communication
                        between the platform and the websites).
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
