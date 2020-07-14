<template>
<v-card class="px-4">
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Documents</h3>
        </div>
    </v-card-title>
    <v-container class="px-4">
        <v-row>
            <v-col v-for="(col, i) in data.col_documents"
                cols="12" md="4"
                :key="i"
            >
                <v-row v-for="(type, j) in col"
                    :key="i + '-' + j"
                >
                    <v-col>
                        <div class="type-name">{{type.type}}</div>
                        <v-row v-for="(item, k) in type.items"
                            :key="i + '-' + j + '-' + k"
                            align="center"
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
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</v-card>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    props: {
        cityId: Number,
        unitId: Number,
    },
    data () {
        return {
            data: {
                documents: [],
                documentsByType: {},
                col_documents:[],
            },
        }
    },
    mounted () {
        this.initialize();
    },
    watch: {
        cityId () {
            this.initialize();
        },
        unitId () {
            this.initialize();
        },
    },
    methods: {
        distributeColumns() {
            let num_columns = 3;
            // first get doc types
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
            for (let i = 0; i < num_columns; i++) {
                this.data.col_documents.push([]);
            }
            let ind = 0;
            for (let key in this.data.documentsByType) {
                for (let i = 0; i < num_columns; i++) {
                    if (ind % num_columns === i) {
                        let docObj = {};
                        docObj['type'] = key;
                        docObj['items'] = this.data.documentsByType[key];
                        this.data.col_documents[i].push(docObj);
                    }
                }
                ind++;
            }

        },
        initialize () {
            this.data.documents = [];
            this.data.col_documents = [];
            if (this.cityId !== undefined) {
                let urlSubmit = 'api/unit-areas/' + this.unitId
                                + '/cities/' + this.cityId
                                + '/documents';
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    this.data.documents = result;
                    this.distributeColumns()
                });
            } else {
                let urlSubmit = 'api/unit-areas/' + this.unitId
                                + '/documents';
                subUtil.getInfoPopulate(this, urlSubmit, true)
                .then( (result) => {
                    this.data.documents = result;
                    this.distributeColumns()
                });
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