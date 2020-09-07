<template>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">Motivation Letter</h3>
        </div>
    </v-card-title>
    <v-card-text>Why do you want to apply to this PhD program?
        What are your main strengths as a candidate? (2000 characters max)
    </v-card-text>
    <v-container class="px-6">
        <v-row>
            <v-col cols="12">
                <v-textarea
                    v-model="$v.data.motivation.$model"
                    :error="$v.data.motivation.$error"
                    @input="addValue"
                    rows="27"
                    counter
                    label="Motivation Letter*">
                </v-textarea>
                <div v-if="$v.data.motivation.$error">
                    <p v-if="!$v.data.motivation.maxLength" class="caption red--text">Maximum length is 5000 characters.</p>
                    <p v-if="!$v.data.motivation.required" class="caption red--text">Motivation Letter is required.</p>
                </div>
            </v-col>
        </v-row>
    </v-container>
</v-card>


</template>

<script>
import {maxLength, required} from 'vuelidate/lib/validators'

export default {
    data() {
        return {
            date_menu: false,
            data: {
                motivation: null,
            },
        }
    },
    mounted() {
        this.initialize();
    },
    computed: {
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
    },
    validations: {
        data: {
            motivation: { maxLength: maxLength(2000), required },
        }
    },

}
</script>

<style>

</style>