<template>
<div>
    <v-tabs
            v-if="loggedIn"
            show-arrows
            @change="tabChanged">
        <v-tab :to="'/private-area/' + unitName + '/tab/general'">
            General Info
        </v-tab>
        <v-tab v-for="(tab,i) in allTabs"
            :to="'/private-area/' + unitName + '/tab/'+ tab.tab_path"
            :key="i"
        >
            {{tab.tab_name}}
        </v-tab>
        <v-tabs-items>
            <keep-alive>
                <router-view
                    :unit-name="unitName"
                    :tab-name="tabName"
                    :tab-id="tabID"
                ></router-view>
            </keep-alive>
            <v-dialog v-model="showHelp" content-class="help">
                <router-view name="help"></router-view>
            </v-dialog>

        </v-tabs-items>
    </v-tabs>
    <v-row>
        <v-col v-if="!loggedIn">
            <div>Please login first (
                the symbol <v-icon color="green darken">mdi-login</v-icon>
                in the toolbar above).
            </div>
        </v-col>
    </v-row>
</div>

</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    components: {
    },
    data () {
        return {
            unitName: '',
            tabName: '',
            tabID: 0,
            allTabs: [],
            activeTab: 0,
        }
    },
    mounted() {
        this.initialize();
    },
    computed: {
        loggedIn () {
            return this.$store.state.session.loggedIn;
        },
        showHelp: {
            get() {
                return this.$store.state.navigation.showHelp;
            },
            set(state) {
                if (state !== this.$store.state.navigation.showHelp) {
                    this.$store.dispatch('showHelp')
                }
            }
        },
    },
    watch: {
        $route () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            this.unitName = this.$route.params.unitName;
            this.tabName = this.$route.params.tabName;
            let unit_id = null;
            if (this.unitName === 'UCIBIO') {
                unit_id = 1;

            } else if (this.unitName === 'LAQV'){
                unit_id = 2;
            }
            this.getDocumentTabs(unit_id)
            .then(() => {
                for (let ind in this.allTabs) {
                    if (this.allTabs[ind].tab_path === this.tabName ) {
                        this.tabID = this.allTabs[ind].id;
                    }
                }
                if (this.tabName === "general") {
                    this.tabID = 0;
                }
                if (this.unitName === 'UCIBIO') {
                    this.$store.commit('setActiveTile', {
                        newTile: 8,
                        newToolbarText: 'Private UCIBIO documents'
                    });

                } else if (this.unitName === 'LAQV') {
                    this.$store.commit('setActiveTile', {
                        newTile: 9,
                        newToolbarText: 'Private LAQV documents'
                    });

                }
            })
        },
        getDocumentTabs (unit_id) {
            let vm = this;
            const urlSubmit = 'api/v2/' + 'private-document-tabs?unit_id=' + unit_id;
            return subUtil.getPublicInfo(vm, urlSubmit, 'allTabs');
        },
        tabChanged: function(tab) {
            this.activeTab = tab;
        }
    }

}
</script>

<style scoped>

</style>