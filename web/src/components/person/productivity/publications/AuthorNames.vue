<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Names used as author of scientifc publications</h3>
        </div>
    </v-card-title>
    <v-card-text>
        Please list all variants of names used in publications, as this will help
        in matching publications to their respective authors.
    </v-card-text>
    <v-container>
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
                    @input="addName"
                    single-line
                >
                </v-text-field>
            </v-col>
            <v-col cols="2">
                <v-row align="center" justify="end">
                    <v-btn @click="submitData"
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
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
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
        currentTab () {
            if (this.currentTab === '/person/productivity/publications') {
                this.initialize();
            }
        },
    },
    mounted() {
        this.initialize();
    },
    methods: {
        initialize () {
            this.data.authorNames = [];
            this.toCreate = [];
            this.toDelete = [];
            this.newName = null;
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                let urlSubmit = 'api/people/' + personID + '/author-names';
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    this.data.authorNames = result;
                })
            }
        },
        submitData () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreate = [];
                let urlDelete = [];
                let personID = this.$store.state.session.personID;
                for (let ind in this.toCreate) {
                    urlCreate.push({
                        url: 'api/people/' + personID + '/author-names',
                        body: this.toCreate[ind],
                    });
                }
                for (let ind in this.toDelete) {
                    urlDelete.push({
                        url: 'api/people/' + personID
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
                    this.newName = null;
                    this.initialize();
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    this.toDelete = [];
                    this.toCreate = [];
                    this.newName = null;
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
                this.toCreate = [{
                    id: 'new',
                    name: this.newName,
                }];
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

<style scoped>

</style>