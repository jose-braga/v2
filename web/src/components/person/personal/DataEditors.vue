<template>
    <v-form ref="form"
        @submit.prevent="submitForm">
        <p class="small-text">
            You may select other users as co-responsibles for editing your data.
        </p>
        <p v-if="data.editors.length === 0">
            No one assigned as editor of your data.
        </p>
        <div v-for="(editor, i) in data.editors"
            :key="i">
            <v-row align="center">
                <v-col cols="12" sm="5">
                    <v-autocomplete
                        v-model="editor.user_id"
                        :loading="loadingPeople"
                        :items="people" item-value="user_id" item-text="colloquial_name"
                        :search-input="editor.editor_search"
                        :disabled="editor.id !== 'new'"
                        cache-items
                        flat
                        hide-no-data
                        hide-details
                        label="Info. Editor">
                    </v-autocomplete>
                </v-col>
                <v-col cols="1">
                    <v-btn icon @click.stop="removeItem(data.editors, i)">
                        <v-icon color="red darken">mdi-delete</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-divider v-if="i < data.editors.length - 1"></v-divider>
        </div>
        <v-row>
            <v-btn class="ml-2 mt-4" outlined @click="addItem()">
                Add an editor
            </v-btn>
        </v-row>
        <v-row align-content="center" justify="end">
            <v-col cols="3" v-if="formError">
                <v-row justify="end">
                    <p class="caption red--text">Unable to submit form.</p>
                </v-row>
            </v-col>
            <v-col cols="2" align-self="end">
                <v-row justify="end">
                    <v-btn type="submit"
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
            people: [],
            loadingPeople: false,
            data: {
                editors: [],
            },
            toDelete: [],
        }
    },
    mounted () {
        this.getPeople();
        this.initialize(true);
    },
    methods: {
        initialize (mounting) {
            if (this.$store.state.session.loggedIn) {
                let personID = this.$store.state.session.personID;
                subUtil.getInfoPopulate(this, 'api/people/' + personID + '/information-editors', true)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    for (let ind in result) {
                        if (mounting) {
                            this.$set(this.data.editors, ind, {});
                            Object.keys(result[ind]).forEach(key => {
                                let value = result[ind][key];
                                this.$set(this.data.editors[ind], key, value);
                            });
                        }
                    }
                })
            } else {
                this.$refs.form.reset();
            }
        },
        submitForm () {
            if (this.$store.state.session.loggedIn) {
                this.progress = true;
                let urlCreate = [];
                let urlDelete = [];
                let personID = this.$store.state.session.personID;
                let editors = this.data.editors;
                for (let ind in editors) {
                    if (editors[ind].id === 'new') {
                        urlCreate.push({
                            url: 'api/people/' + personID + '/information-editors',
                            body: editors[ind],
                        });
                    }
                }
                for (let ind in this.toDelete) {
                    urlDelete.push('api/people/' + personID
                                + '/information-editors/' + this.toDelete[ind].user_id);
                }
                this.$http.all(
                    urlCreate.map(el =>
                        this.$http.post(el.url,
                            { data: el.body, },
                            { headers:
                                {'Authorization': 'Bearer ' + localStorage['v2-token'] },
                            }
                        )
                    )
                    .concat(
                        urlDelete.map(el =>
                            this.$http.delete(el,
                                { headers:
                                    {'Authorization': 'Bearer ' + localStorage['v2-token'] },
                                }
                            )
                        )
                    )
                )
                .then(this.$http.spread( () => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {this.success = false;}, 1500)
                    this.toDelete = [];
                    this.initialize(true);
                }))
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    this.toDelete = [];
                    this.initialize(true);
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        getPeople() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'people';
                return subUtil.getPublicInfo(vm, urlSubmit, 'people', 'colloquial_name');
            }
        },
        addItem() {
            this.data.editors.push({id: 'new', user_id: null, colloquial_name: null});
        },
        removeItem(list, ind) {
            if (list[ind].id !== 'new') {
                this.toDelete.push(list[ind]);
            }
            list.splice(ind, 1);
        },
    },

}
</script>

<style>
.small-text {
    font-size: 0.75rem;
}

</style>