<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Academic Degrees*</h3>
        </div>
    </v-card-title>
    <v-container class="px-6">
        <v-row v-if="$v.data.academicDegrees.$model.length === 0">
            Please add your academic data
        </v-row>
        <v-row v-else
            v-for="(v,i) in $v.data.academicDegrees.$each.$iter"
            :key="i"
            align="center"
        >
            <v-col cols="12" sm="2">
                <v-select v-model="v.$model.academic_degree_id"
                    :error="v.academic_degree_id.$error"
                    @input="v.academic_degree_id.$touch(); addValue()"
                    :items="degrees" item-value="id" item-text="name"
                    label="Degree*">
                </v-select>
                <div v-if="v.academic_degree_id.$error">
                    <p v-if="!v.academic_degree_id.required" class="caption red--text">This field is required</p>
                    <p v-if="!v.academic_degree_id.degreesOK" class="caption red--text">Incompatible degrees</p>
                </div>

            </v-col>
            <v-col cols="12" sm="3">
                <v-text-field
                    v-model="v.$model.course_name"
                    :error="v.course_name.$error"
                    @input="v.course_name.$touch(); addValue()"
                    label="Course*">
                </v-text-field>
                <div v-if="v.course_name.$error">
                    <p v-if="!v.course_name.maxLength" class="caption red--text">Maximum length is 200 characters.</p>
                    <p v-if="!v.course_name.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="3">
                <v-text-field
                    v-model="v.$model.institution"
                    :error="v.institution.$error"
                    @input="v.institution.$touch(); addValue()"
                    label="Institution*">
                </v-text-field>
                <div v-if="v.institution.$error">
                    <p v-if="!v.institution.maxLength" class="caption red--text">Maximum length is 200 characters.</p>
                    <p v-if="!v.institution.required" class="caption red--text">Field is required.</p>
                </div>
            </v-col>
            <v-col cols="12" sm="2">
                <v-menu ref="v.$model.show_date_end"
                    v-model="v.$model.show_date_end"
                    :close-on-content-click="false"
                    :nudge-right="10"
                    transition="scale-transition"
                    offset-y min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="v.$model.date_end"
                            :error="v.date_end.$error"
                            @input="v.date_end.$touch(); addValue()"
                            label="End date*" v-on="on">
                        </v-text-field>
                    </template>
                    <v-date-picker v-model="v.$model.date_end"
                            @input="v.$model.show_date_end = false; addValue()"
                            no-title></v-date-picker>
                </v-menu>
                <div v-if="v.date_end.$error">
                    <p v-if="!v.date_end.required" class="caption red--text">Input required.</p>
                </div>
            </v-col>
            <v-col cols="4" sm="2">
                <v-text-field
                    v-model="v.$model.grade"
                    :error="v.grade.$error"
                    @input="v.grade.$touch(); addValue()"
                    label="Grade* (0-20)">
                </v-text-field>
                <div v-if="v.grade.$error">
                    <p v-if="!v.grade.decimal" class="caption red--text">Input must be decimal.</p>
                    <p v-if="!v.grade.minValue" class="caption red--text">Must be between 0 and 20.</p>
                    <p v-if="!v.grade.maxValue" class="caption red--text">Must be between 0 and 20..</p>
                    <p v-if="!v.grade.required" class="caption red--text">Input required.</p>
                </div>
            </v-col>
            <v-col cols="11" sm="2">
                <v-file-input
                    v-model="v.$model.certificate"
                    :error="v.certificate.$error"
                    accept=".doc,.docx,.pdf,.odt"
                    show-size
                    name
                    @change="addValue()"
                    @input="addValue()"
                    label="Certificate*">
                </v-file-input>
                <div v-if="v.certificate.$error">
                    <p v-if="!v.certificate.required" class="caption red--text">Input required.</p>
                </div>
            </v-col>
            <v-col cols="11" sm="1">
                <v-btn icon @click="removeItem(data.academicDegrees, i)" class="mt-3">
                    <v-icon color="red darken">mdi-delete</v-icon>
                </v-btn>
            </v-col>
            <v-col cols="12">
                <v-divider></v-divider>
            </v-col>
        </v-row>
        <v-row v-if="data.academicDegrees.length < 2">
            <v-col class="mt-4">
                <v-btn outlined
                    @click="addItem(data.academicDegrees)"
                >
                    Add a degree
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</v-card>

</template>

<script>
import subUtil from '@/components/common/submit-utils'
import {maxLength, decimal, required, minValue, maxValue} from 'vuelidate/lib/validators'
/*
const degreesOK = (value, vm) => {
    console.log(value)
    //
}
*/
export default {
    data() {
        return {
            data: {
                academicDegrees: [],
            },
            degrees: [],
        }
    },
    created() {
        this.initialize ();
        this.getDegrees();
    },
    methods: {
        initialize () {
            let callSegment = this.$route.params.callSegment;
            if (callSegment !== undefined) {
                let savedData = this.$store.state.application;
                Object.keys(this.data).forEach(key => {
                    let value = savedData.application[key];
                    this.$set(this.data, key, value);
                });
            }
        },
        addValue () {
            this.$store.dispatch('addApplicationData', this.data);
        },
        getDegrees() {
            var this_vm = this;
            const urlSubmit = 'api/v2/' + 'application-degrees';
            subUtil.getPublicInfo(this_vm, urlSubmit, 'degrees');
        },
        addItem(list) {
            if (list.length < 2) {
                list.push({
                    academic_degree_id: null,
                    institution: null,
                    date_end: null,
                    grade: null,
                    certificate: null,

                })
                this.$store.dispatch('addApplicationData', this.data);
            }
        },
        removeItem(list, ind) {
            list.splice(ind, 1);
            this.$store.dispatch('addApplicationData', this.data);
        },
    },
    validations: {
        data: {
            academicDegrees: {
                $each: {
                    academic_degree_id: {
                        required,
                        degreesOK: function(value) {
                            let countSame = 0;
                            for (let ind in this.data.academicDegrees) {
                                if (this.data.academicDegrees.length > 1
                                        && this.data.academicDegrees[ind].academic_degree_id === 1) {
                                    return false;
                                }
                                if (this.data.academicDegrees[ind].academic_degree_id === value) {
                                    countSame++;
                                }
                            }
                            if (countSame > 1) return false;
                            return true;
                        }
                    },
                    course_name: { required, maxLength: maxLength(200) },
                    institution: { required, maxLength: maxLength(200) },
                    date_end: { required },
                    grade: { decimal, required, minValue: minValue(0), maxValue: maxValue(20) },
                    certificate: { required },
                }
            },
        },
    },

}
</script>

<style>

</style>