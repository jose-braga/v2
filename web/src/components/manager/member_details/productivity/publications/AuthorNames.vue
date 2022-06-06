<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Names used as author of scientifc publications</h3>
        </div>
    </v-card-title>
    <v-container>
        <v-form ref="form"
            @submit.prevent="submitForm"
        >
            <v-row align-content="center">
                <v-col cols="12" >
                    <v-chip-group
                        column
                    >
                        <v-chip
                            v-for="(author, i) in data.authorNames"
                            :key="i"
                            close
                            @click:close="removeName(author)"
                        >
                            {{ author.name }}
                        </v-chip>
                    </v-chip-group>
                </v-col>
            </v-row>
            <v-row align="center">
                <v-col cols="8" >
                    <v-text-field v-model="newName"
                        label="New name to add"
                        @change="addName"
                        single-line
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="2">
                    <v-row align="center" justify="end">
                        <v-btn @click="submitForm"
                        outlined color="blue">Update</v-btn>
                    </v-row>
                </v-col>
                <v-col cols="1">
                    <v-progress-circular indeterminate
                            v-show="progress"
                            :size="20" :width="2"
                            color="primary"></v-progress-circular>
                    <v-icon v-show="success" color="green">mdi-check</v-icon>
                    <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                </v-col>
            </v-row>
        </v-form>
    </v-container>
</v-card>

</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    props: {
        personId: Number,
        managerId: Number,
        endpoint: String,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            newName: null,
            data: {
                authorNames: [],
            },
            toCreate: [],
            toDelete: [],
        }
    },
     watch: {
        personId () {
            this.data.authorNames = [];
            this.initialize();
        },
    },
    mounted () {
        this.initialize();
    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                let urlSubmit = 'api' + this.endpoint
                                + '/members'
                                + '/' + this.personId + '/author-names';
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    this.data.authorNames = result;
                })
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreate = [];
                let urlDelete = [];
                let personID = this.personId;
                for (let ind in this.toCreate) {
                    urlCreate.push({
                        url: 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/author-names',
                        body: this.toCreate[ind],
                    });
                }
                for (let ind in this.toDelete) {
                    urlDelete.push({
                        url: 'api' + this.endpoint
                                + '/members'
                                + '/' + personID
                            + '/author-names/' + this.toDelete[ind].id,
                    });
                }
                Promise.all(
                    urlCreate.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token']
                            },
                        }))
                    .concat(
                        urlDelete.map(el =>
                            this.$http.delete(el.url,
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token']
                                },
                            })))
                )
                .then( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.toDelete = [];
                    this.toCreate = [];
                    this.initialize();
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    this.toDelete = [];
                    this.toCreate = [];
                    this.initialize();
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }

        },
        addName () {
            if (this.newName !== ''
                && this.newName !== undefined
                && this.newName !== null
            ) {
                let newItem = {
                    id: 'new',
                    name: this.newName,
                };
                this.data.authorNames.push(newItem);
                this.toCreate.push(newItem);
                this.newName = null;
            }
        },
        removeName (author) {
            let indDelete = this.data.authorNames.indexOf(author);
            this.data.authorNames.splice(indDelete,1);
            if (author.id !== 'new') {
                this.toDelete.push(author);
            } else {
                let indDeleteCreate = this.toCreate.indexOf(author);
                this.toCreate.splice(indDeleteCreate,1);
            }
        },
    }

}
</script>

<style>

</style>