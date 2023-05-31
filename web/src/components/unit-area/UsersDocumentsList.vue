<template>
<v-card class="px-4" flat>
    <v-card-text>
        <v-expansion-panels>
            <v-expansion-panel
                v-for="(type,i) in data.documentsSortedTypes"
                :key="i"
            >
                <v-expansion-panel-header>
                    <span class="type-name">{{type.type}}</span>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <v-container>
                        <v-row>
                            <v-col cols="12" md="6" lg="4"
                                v-for="(doc, j) in type.documents"
                                :key="i + '-' + j"
                            >
                                <v-card class="pa-2">
                                <v-card-text>
                                    <v-row>
                                        <span class="item-title">{{ doc.title }}</span>
                                    </v-row>
                                    <v-row>
                                        <span class="item-content">{{ doc.content }}</span>
                                    </v-row>
                                    <v-row>
                                        <span v-if="doc.attachment_url !== null"
                                            class="item-url"
                                        >
                                            <a :href="doc.attachment_url" target="_blank">Link</a>
                                        </span>
                                    </v-row>
                                    <v-row>
                                        <span class="item-dates">
                                            Visible from
                                            <span v-if="doc.valid_from !== null">{{doc.valid_from | formatDate}}</span>
                                            <span v-else>-∞</span>
                                            to
                                            <span v-if="doc.valid_until !== null">{{doc.valid_until | formatDate}}</span>
                                            <span v-else>+∞</span>
                                        </span>
                                    </v-row>
                                </v-card-text>
                                </v-card>

                            </v-col>
                        </v-row>
                    </v-container>
                    <!--
                    <v-list three-line>
                        <v-list-item
                            v-for="(doc, j) in type.documents"
                            :key="i + '-' + j"
                        >

                            <v-list-item-content>
                                <v-list-item-title class="item-title">{{ doc.title }}</v-list-item-title>
                                <span class="item-content">{{ doc.content }}</span>
                                <span v-if="doc.attachment_url !== null"
                                    class="item-url"
                                >
                                    <a :href="doc.attachment_url" target="_blank">Link</a>
                                </span>
                                <span class="item-dates">
                                    Visible from
                                    <span v-if="doc.valid_from !== null">{{doc.valid_from | formatDate}}</span>
                                    <span v-else>-∞</span>
                                    to
                                    <span v-if="doc.valid_until !== null">{{doc.valid_until | formatDate}}</span>
                                    <span v-else>+∞</span>
                                </span>
                                <v-divider></v-divider>

                            </v-list-item-content>

                        </v-list-item>
                    </v-list>
                    -->
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </v-card-text>
    <!--
    <v-container fluid>
        <v-row>
            <v-col v-for="(col, i) in data.col_documents"
                cols="12" md="4"
                :key="i"
            >
                <v-row v-for="(type, j) in col"
                    :key="i + '-' + j"
                >
                    <v-col>
                        <v-card>
                            <v-card-title>
                                <span class="type-name">{{type.type}}</span>
                            </v-card-title>
                            <v-row v-for="(item, k) in type.items"
                                :key="i + '-' + j + '-' + k"
                                align="center"
                                class="px-3"
                            >
                                <v-col cols="12" class="item-title">{{item.title}}</v-col>
                                <v-col cols="12" class="item-content">{{item.content}}</v-col>
                                <v-col cols="12" v-if="item.attachment_url !== null"
                                    class="item-url"
                                >
                                    <a :href="item.attachment_url" target="_blank">Link</a>
                                </v-col>
                                <v-col cols="12" class="item-dates">
                                    Visible from
                                    <span v-if="item.valid_from !== null">{{item.valid_from | formatDate}}</span>
                                    <span v-else>-∞</span>
                                    to
                                    <span v-if="item.valid_until !== null">{{item.valid_until | formatDate}}</span>
                                    <span v-else>+∞</span>
                                </v-col>
                                <v-col cols="12">
                                    <v-divider></v-divider>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
    -->
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    props: {
        cityId: Number,
        unitId: Number,
        subTabId: Number,
    },
    data () {
        return {
            data: {
                documents: [],
                documentsByType: {},
                documentsSortedTypes: [],
            },
            documentTypes: [],
        }
    },
    mounted () {
        this.initialize();
        this.$root.$on('updateUnitUserDocumentsList',
            () => {
                this.initialize();
            }
        );
    },
    watch: {
        cityId () {
            this.initialize();
        },
        unitId () {
            this.initialize();
        },
        subTabId () {
            this.initialize();
        },
    },
    methods: {
        distributeByType() {
            // first get doc types that are in use
            let usedDocTypes = [];
            for (let ind in this.data.documents) {
                if(usedDocTypes.includes(this.data.documents[ind].doc_type_name)) {
                    this.data.documentsByType[this.data.documents[ind].doc_type_name]
                        .push(this.data.documents[ind]);
                } else {
                    usedDocTypes.push(this.data.documents[ind].doc_type_name)
                    this.data.documentsByType[this.data.documents[ind].doc_type_name]
                        = [this.data.documents[ind]];
                }
            }
            this.data.documentsSortedTypes = [];
            this.documentTypes.forEach(el => {
                if (usedDocTypes.includes(el.name)) {
                    let obj = {};
                    obj['type'] = el.name
                    obj['documents'] = this.data.documentsByType[el.name].sort((a,b) => {
                        if (a.sort_order !== null && b.sort_order !== null) {
                            return -(a.sort_order - b.sort_order);
                        } else if (a.sort_order === null) {
                            return +1;
                        } else if (b.sort_order === null) {
                            return -1;
                        } else {
                            return a.id - b.id;
                        }
                    });
                    this.data.documentsSortedTypes.push(obj);
                }
            })

        },
        initialize () {
            this.data.documents = [];
            this.data.documentsByType = {};
            this.data.documentsSortedTypes = [];
            this.getDocumentTypes()
            .then(() => {
                this.documentTypes.sort((a,b) => a.sort_order - b.sort_order)
                if (this.cityId !== undefined) {
                    let urlSubmit = 'api/unit-areas/' + this.unitId
                                    + '/cities/' + this.cityId
                                    + '/documents'
                                    + '/tabs/' + this.subTabId
                                    ;
                    subUtil.getInfoPopulate(this, urlSubmit, true)
                    .then( (result) => {
                        this.data.documents = result;
                        this.distributeByType()
                    });
                } else {
                    let urlSubmit = 'api/unit-areas/' + this.unitId
                                    + '/documents'
                                    + '/tabs/' + this.subTabId
                                    ;
                    subUtil.getInfoPopulate(this, urlSubmit, true)
                    .then( (result) => {
                        this.data.documents = result;
                        this.distributeByType()
                    });
                }
            })
        },
        getDocumentTypes() {
            let vm = this;
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'document-types';
                return subUtil.getPublicInfo(vm, urlSubmit, 'documentTypes');
            }
        },
    }
}
</script>

<style scoped>
.type-name {
    font-weight: 600;
    color: mediumblue;
    font-size: 1.3rem;
    margin-top: 10px;
    margin-bottom: 10px;
}
.item-title {
    font-weight: 500;
    padding-top: 0;
    padding-bottom: 0;
    font-size: 1rem;
}
.item-content {
    padding-top: 0;
    padding-bottom: 0;
    font-size: 0.9rem;
}
.item-url {
    padding-top: 0;
    padding-bottom: 0;
    font-size: 0.9rem;
}
.item-dates {
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 5px;
    font-size: 0.7rem;
}

</style>