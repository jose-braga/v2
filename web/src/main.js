import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuelidate from 'vuelidate'
import axios from 'axios'

import App from './App.vue'
import router from './routes/routes'
import store from './store/store'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(Vuelidate)

Vue.prototype.$http = axios
Vue.prototype.$http.defaults.baseURL = process.env.VUE_APP_API_BASE_URL

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
  beforeCreate() {
    this.$store.commit('checkExistingSession');
  },
}).$mount('#app')
