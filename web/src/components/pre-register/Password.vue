<template>
  <v-card class="mb-4">
      <v-card-title primary-title>
            <div>
                <h3 class="headline">Set your password</h3>
            </div>
        </v-card-title>
        <v-card-text></v-card-text>
        <v-container class="px-6">
            <v-text-field
                v-model="$v.data.password.$model"
                :error="$v.data.password.$error"
                @input="addValue"
                type="password"
                label="Password*">
            </v-text-field>
            <v-text-field
                v-model="$v.data.passwordConfirm.$model"
                :error="$v.data.passwordConfirm.$error"
                type="password"
                label="Repeat password*">
            </v-text-field>
        </v-container>
  </v-card>
</template>

<script>
import { minLength, required, sameAs } from 'vuelidate/lib/validators'


export default {
    data() {
        return {
            data: {
                password: undefined,
                passwordConfirm: undefined,
            }
        }
    },
    created() {},
    methods: {
        addValue () {
            this.$store.commit('addPersonData', this.data);
        },
    },
    validations: {
        data: {
            password: { required, minLength: minLength(6) },
            passwordConfirm: { required, sameAs: sameAs('password') }
        }
    }
}
</script>

<style>

</style>