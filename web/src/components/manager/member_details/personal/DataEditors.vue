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
                        :filter="customSearch"
                        disabled
                        cache-items
                        flat
                        hide-no-data
                        hide-details
                        label="Info. Editor">
                    </v-autocomplete>
                </v-col>
            </v-row>
            <v-divider v-if="i < data.editors.length - 1"></v-divider>
        </div>
    </v-form>

</template>

<script>
import subUtil from '@/components/common/submit-utils'

function prepareStringComparison(str) {
    if (str === null || str === undefined) {
        return null;
    } else {
        return str.toLocaleLowerCase()
            .replace(/[áàãâä]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[íìîï]/g, 'i')
            .replace(/[óòõôö]/g, 'o')
            .replace(/[úùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[ñ]/g, 'n')
            .replace(/(\.\s)/g, '')
            .replace(/(\.)/g, '')
            .replace(/[-:()]/g, ' ')
            .trim()
            ;
    }
}

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
            people: [],
            loadingPeople: false,
            data: {
                editors: [],
            },
            toDelete: [],
        }
    },
    watch: {
        personId () {
            this.initialize();
        },
    },
    mounted () {
        this.getPeople();
        this.initialize();
    },
    methods: {
        initialize () {
            this.data.editors = [];
            if (this.$store.state.session.loggedIn) {
                let personID = this.personId;
                subUtil.getInfoPopulate(this, 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/information-editors', true)
                .then( (result) => {
                    // only works if this.data and result have the same keys
                    for (let ind in result) {
                        this.$set(this.data.editors, ind, {});
                        Object.keys(result[ind]).forEach(key => {
                            let value = result[ind][key];
                            this.$set(this.data.editors[ind], key, value);
                        });
                    }
                })
            } else {
                this.$refs.form.reset();
            }
        },
        getPeople() {
            var vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'people-simple';
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
        customSearch (item, queryText, itemText) {
            let queryPre = prepareStringComparison(queryText);
            let query = queryPre.split(' ');
            let text = prepareStringComparison(itemText);
            for (let ind in query) {
                if (text.indexOf(query[ind]) === -1) {
                    return false;
                }
            }
            return true;
        },
    },

}
</script>

<style>
.small-text {
    font-size: 0.75rem;
}

</style>