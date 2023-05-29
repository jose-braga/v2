<template>
<v-carousel height="80vh">
    <v-carousel-item>
        <v-card height="80vh" class="px-12">
            <v-card-title primary-title>
                <h1 class="text-h2">Help for "Members" Tab</h1>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row class="text-sm-body-1">
                        <h4>
                            This tab contains two sections with similar functionality.
                            <ol>
                                <li>The first section shows a table of the current members of the
                            team and their current positions.</li>
                                <li>The second section shows a table of past members
                            and past positions of current members.</li>
                            </ol>
                        </h4>
                    </v-row>
                    <v-row class="text-sm-body-1 mt-4">
                        <v-col cols="12" md="3" class="text-md-right">
                            <b>Current members and positions</b>
                        </v-col>
                        <v-col cols="12" md="9">
                            To get and edit the details of a current member click on
                            <v-icon>mdi-pencil</v-icon>. You will be able to check/correct the
                            data for the current position.
                        </v-col>
                    </v-row>
                    <v-row class="text-sm-body-1">
                        <v-col cols="12" md="3" class="text-md-right">
                            <b>Past members and positions</b>
                        </v-col>
                        <v-col cols="12" md="9">
                            As in the previous section you can get and edit the details
                            of a person. The details window will show a list of previous
                            positions associated with her/him. You can change the data of
                            those and you can add other positions.<br>
                            After modifying the data press "Save".
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
    </v-carousel-item>
    <v-carousel-item>
        <v-card height="80vh" class="px-12">
            <v-card-title primary-title>
                <h1 class="text-h2">Edit team member data</h1>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <div class="text-sm-body-1">
                        If the person is no longer a member of the lab you should
                        simply insert an end date. Press "Save".
                        <v-row class="mt-2">
                            <v-col cols="10" offset="1" md="6" offset-md="3" >
                                <v-img
                                    :src="helpImages[0].final_link"
                                ></v-img>
                            </v-col>
                        </v-row>
                    </div>
                    <div class="text-sm-body-1 mt-2">
                        If the member has a newer position in your lab,
                        press "Add newer position", then you will be required to enter
                        an end date for the present position and to fill the details
                        of the new one. Press "Save".
                        <v-row class="mt-2">
                            <v-col cols="10" offset="1" md="6" offset-md="3" >
                                <v-img
                                    :src="helpImages[1].final_link"
                                ></v-img>
                            </v-col>
                        </v-row>
                    </div>
                </v-container>
            </v-card-text>
        </v-card>
    </v-carousel-item>
    <v-carousel-item>
        <v-card height="80vh" class="px-12">
            <v-card-title primary-title>
                <h1 class="text-h2">Edit team member data (cont.)</h1>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <div class="text-sm-body-1">
                        For professional situations, you can edit existing ones, or
                        add a new. Press "Update" in the end.
                        <v-row class="mt-2">
                            <v-col cols="12" offset="0" md="10" offset-md="1" >
                                <v-img
                                    :src="helpImages[2].final_link"
                                ></v-img>
                            </v-col>
                        </v-row>
                    </div>
                </v-container>
            </v-card-text>
        </v-card>
    </v-carousel-item>
</v-carousel>
<!--
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Help for "Members" Tab</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <v-container>
            <v-row>
                <h3>
                    This tab contains two sections with similar functionality.<br>
                    The first section shows a table of the current members of the
                    team and their current positions.<br>
                    The second section shows a table of past members
                    and past positions of current members.
                </h3>
            </v-row>
            <v-row class="mt-4">
                <v-col cols="12" md="3">
                    <b>Current members and positions</b>
                </v-col>
                <v-col cols="12" md="9">
                    To get and edit the details of a current member click on
                    <v-icon>mdi-pencil</v-icon>. You will be able to check/correct the
                    data for the current position. <br>
                    If the person is no longer a member of the lab you should
                    simply insert an end date.<br>
                    If the member has a newer position in your lab,
                    press "Add newer position", then you will be required to enter
                    an end date for the present position and to fill the details
                    of the new one.<br>
                    After modifying the data press "Save".
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="3">
                    <b>Past members and positions</b>
                </v-col>
                <v-col cols="12" md="9">
                    As in the previous section you can get and edit the details
                    of a person. The details window will show a list of previous
                    positions associated with her/him. You can change the data of
                    those and you can add other positions.<br>
                    After modifying the data press "Save".
                </v-col>
            </v-row>
        </v-container>
    </v-card-text>
</v-card>
-->
</template>

<script>
export default {
    data () {
        return {
            images: [
                {name: 'edit_member_1.png'},
                {name: 'edit_member_2.png'},
                {name: 'edit_member_3.png'},
            ],
            publicPath: process.env.VUE_APP_REQUEST_ORIGIN,
        }
    },
    computed: {
        helpImages () {
            let helpImages = [];
            for (let ind in this.images) {
                let img = this.images[ind];
                let final_link = this.publicPath + '/images/help/help/team/'
                            + this.images[ind].name
                img.final_link = final_link;
                helpImages.push(img);
            }
            return helpImages;
        }
    }
}
</script>

<style scoped>

</style>
