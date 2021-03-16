<template>
<v-card>
    <v-form ref="form"
                @submit.prevent="submitForm">
        <v-card-title>
            <span> Edit data for project
                    <b>{{ projectDetails.title_show }}</b>
            </span>
        </v-card-title>
        <v-card-text>
        </v-card-text>
        <v-container>
            <v-row justify="center" class="mb-4">
                <v-col cols="6">
                    <span class="larger-text">
                        <b>Source selected:</b>
                        {{projectDetails.sourceSelected.sourceNumbering}}
                    </span>
                </v-col>
            </v-row>
            <v-expansion-panels multiple>
                <v-expansion-panel v-for="(source, i) in projectDetails.details"
                    :key="i"
                >
                    <v-expansion-panel-header>
                        <div>
                            <h3 class="headline">Source {{ i + 1}} - {{source.sourceName}}</h3>
                        </div>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        Title: {{source.title}}<br>
                        Start date: {{source.startDate}}; End date: {{source.endDate}}<br>
                        Amount: {{source.amount_show}}<br>
                        Funding type: {{source.type}}<br>
                        Organization: {{source.organization_show}}<br>
                        References & Websites:
                        <ul v-if="source['external-ids'] && source['external-ids']['external-id']">
                            <li v-for="(extId, j) in source['external-ids']['external-id']"
                                :key="i + '-' + j"
                            >
                                {{extId['external-id-value']}}
                                <span v-if="extId['external-id-url'] && extId['external-id-url'].value">
                                    :
                                    <a :href="extId['external-id-url'].value"
                                        target="_blank"
                                    >{{extId['external-id-url'].value}}</a>
                                </span>
                            </li>
                        </ul>
                        <v-row align="center">
                            <v-col cols="3">
                                <v-checkbox
                                    v-model="source.selected"
                                    @change="deselectOther(source, i)"
                                    label="Use this source"
                                >
                                </v-checkbox>

                            </v-col>
                            <v-col cols="2" v-if="source.selected">
                                <v-btn type="submit"
                                    color="blue darken-1" outlined>
                                    Add project
                                </v-btn>
                            </v-col>
                            <v-col cols="1" v-if="source.selected">
                                <v-progress-circular indeterminate
                                        v-show="progress"
                                        :size="20" :width="2"
                                        color="primary"></v-progress-circular>
                                <v-icon v-show="success" color="green">mdi-check</v-icon>
                                <v-icon v-show="error" color="red">mdi-alert-circle-outline</v-icon>
                            </v-col>
                        </v-row>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-container>
    </v-form>
</v-card>
</template>

<script>
export default {
    props: {
        projectData: Object,
        otherPersonId: Number,
        endpoint: String,
    },
    data() {
        return {
            progress: false,
            success: false,
            error: false,
            formError: false,
            projectDetails: {
                title: '',
                sourceSelected: {},
            },
        }
    },
    watch: {
        projectData () {
            this.initialize();
        },
    },
    mounted () {
        this.initialize();
    },
    methods: {
        initialize () {
            this.projectDetails = Object.assign({}, this.projectData);
            this.$set(this.projectDetails, 'sourceSelected', {})
            let urlGetProjects = [];
            let baseURL = 'https://pub.orcid.org';
            let version = 'v3.0';
            let resource = 'funding';
            for (let ind in this.projectData['funding-summary']) {
                let summary = this.projectData['funding-summary'][ind];
                if (summary !== null && summary !== undefined) {
                    let putCode = summary['put-code'];
                    resource = 'funding';
                    urlGetProjects.push(
                        baseURL
                        + '/' + version
                        + '/' + this.projectData.orcid_person
                        + '/' + resource
                        + '/' + putCode
                    )
                }
            }
            return Promise.all(
                urlGetProjects.map(el =>
                    this.$http.get(el,
                        {
                            headers: { 'Accept': 'application/json' },
                        }
                    )
                )
            )
            .then((result) => {
                this.$set(this.projectDetails,'details',[]);
                for (let ind in result) {
                    let sourceName = 'Unknown'
                    if (result[ind].data.source !== null && result[ind].data.source !== undefined) {
                        if (result[ind].data.source['source-name'] !== null && result[ind].data.source['source-name'] !== undefined) {
                            if (result[ind].data.source['source-name'].value !== null && result[ind].data.source['source-name'].value !== undefined) {
                                sourceName = result[ind].data.source['source-name'].value;
                            }
                        }
                    }
                    let thisTitle = ''
                    if (result[ind].data.title !== null && result[ind].data.title !== undefined) {
                        if (result[ind].data.title.title !== null && result[ind].data.title.title !== undefined) {
                            if (result[ind].data.title.title.value !== null && result[ind].data.title.title.value !== undefined) {
                                thisTitle = result[ind].data.title.title.value;
                            }
                        }
                    }
                    let dateStart = '';
                    let dateEnd = '';
                    if (result[ind].data['start-date'] !== null && result[ind].data['start-date'] !== undefined) {
                        if (result[ind].data['start-date'].year !== null && result[ind].data['start-date'].year !== undefined) {
                            if (result[ind].data['start-date'].year.value !== null && result[ind].data['start-date'].year.value !== undefined) {
                                dateStart = dateStart + result[ind].data['start-date'].year.value;
                            }
                        }
                        if (result[ind].data['start-date'].month !== null && result[ind].data['start-date'].month !== undefined) {
                            if (result[ind].data['start-date'].month.value !== null && result[ind].data['start-date'].month.value !== undefined) {
                                dateStart = dateStart + '-' + result[ind].data['start-date'].month.value;
                            }
                        }
                        if (result[ind].data['start-date'].day !== null && result[ind].data['start-date'].day !== undefined) {
                            if (result[ind].data['start-date'].day.value !== null && result[ind].data['start-date'].day.value !== undefined) {
                                dateStart = dateStart + '-' + result[ind].data['start-date'].day.value;
                            }
                        }
                    }
                    if (result[ind].data['end-date'] !== null && result[ind].data['end-date'] !== undefined) {
                        if (result[ind].data['end-date'].year !== null && result[ind].data['end-date'].year !== undefined) {
                            if (result[ind].data['end-date'].year.value !== null && result[ind].data['end-date'].year.value !== undefined) {
                                dateEnd = dateEnd + result[ind].data['end-date'].year.value;
                            }
                        }
                        if (result[ind].data['end-date'].month !== null && result[ind].data['end-date'].month !== undefined) {
                            if (result[ind].data['end-date'].month.value !== null && result[ind].data['end-date'].month.value !== undefined) {
                                dateEnd = dateEnd + '-' + result[ind].data['end-date'].month.value;
                            }
                        }
                        if (result[ind].data['end-date'].day !== null && result[ind].data['end-date'].day !== undefined) {
                            if (result[ind].data['end-date'].day.value !== null && result[ind].data['end-date'].day.value !== undefined) {
                                dateEnd = dateEnd + '-' + result[ind].data['end-date'].day.value;
                            }
                        }
                    }
                    let amount = '';
                    if (result[ind].data.amount !== null && result[ind].data.amount !== undefined) {
                        if (result[ind].data.amount.value !== null && result[ind].data.amount.value !== undefined) {
                            amount = amount + result[ind].data.amount.value;
                        }
                        if (result[ind].data.amount['currency-code'] !== null && result[ind].data.amount['currency-code'] !== undefined) {
                            amount = amount + ' ' + result[ind].data.amount['currency-code'];
                        }
                    }
                    let organization = ''
                    if (result[ind].data.organization !== null && result[ind].data.organization !== undefined) {
                        if (result[ind].data.organization.name !== null && result[ind].data.organization.name !== undefined) {
                            organization = organization + result[ind].data.organization.name;
                        }
                        if (result[ind].data.organization.address !== null && result[ind].data.organization.address !== undefined) {
                            if (result[ind].data.organization.address.country !== null && result[ind].data.organization.address.country !== undefined) {
                                organization = organization + ', ' + result[ind].data.organization.address.country;
                            }
                        }
                    }
                    this.$set(result[ind].data, 'sourceName', sourceName);
                    this.$set(result[ind].data, 'sourceNumbering',
                        'Source ' + (parseInt(ind, 10) + 1) + ' - ' +
                        sourceName);
                    this.$set(result[ind].data, 'title', thisTitle);
                    this.$set(result[ind].data, 'startDate', dateStart);
                    this.$set(result[ind].data, 'endDate', dateEnd);
                    this.$set(result[ind].data, 'amount_show', amount);
                    this.$set(result[ind].data, 'organization_show', organization);
                    this.projectDetails.details.push(result[ind].data);
                }
            })
        },
        submitForm () {
            let selectedSource = null;
            for (let ind in this.projectDetails.details) {
                if (this.projectDetails.details[ind].selected) {
                    selectedSource = this.projectDetails.details[ind];
                    break;
                }
            }
            if (selectedSource !== null) {
                this.progress = true;
                let personID = this.otherPersonId;
                let urlCreate = [
                    {
                        url: 'api' + this.endpoint
                                + '/members'
                                + '/' + personID + '/projects',
                        body: selectedSource
                    }
                ];
                Promise.all(urlCreate.map(el =>
                    this.$http.post(el.url,
                        { data: el.body, },
                        { headers:
                            {'Authorization': 'Bearer ' + localStorage['v2-token']
                        },
                    }))
                )
                .then(() => {
                    this.progress = false;
                    this.success = true;
                    setTimeout(() => {
                        this.success = false;
                        this.$root.$emit('addedProjectToDB')
                    }, 1500);
                })
                .catch((error) => {
                    this.progress = false;
                    this.error = true;
                    setTimeout(() => {this.error = false;}, 6000)
                    // eslint-disable-next-line
                    console.log(error)
                })
            }
        },
        deselectOther (source, i) {
            for (let ind in this.projectDetails.details) {
                if (parseInt(ind, 10) !== parseInt(i,10)) {
                    this.projectDetails.details[ind].selected = false;
                } else if (source.selected === true) {
                    this.$set(this.projectDetails, 'sourceSelected', source);
                } else if (source.selected === false) {
                    this.$set(this.projectDetails, 'sourceSelected', {});
                }
            }
        },
    },

}
</script>

<style scoped>
.larger-text {
    font-size: 1.1em;
}

</style>