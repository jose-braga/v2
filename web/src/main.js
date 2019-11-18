import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuelidate from 'vuelidate'
import axios from 'axios'
import time from './components/common/date-utils'

import App from './App.vue'
import router from './routes/routes'
import store from './store/store'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(Vuelidate)

Vue.prototype.$http = axios
Vue.prototype.$http.defaults.baseURL = process.env.VUE_APP_API_BASE_URL

Vue.filter('formatDate', function (value) {
  if (value) {
    return time.momentToDate(value);
    //return moment(String(value)).format('MM/DD/YYYY hh:mm')
  }
})

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
  beforeCreate() {
    this.$store.commit('checkExistingSession');
  },
}).$mount('#app')
