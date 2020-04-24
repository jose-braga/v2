import Vue from 'vue'
import Vuex from 'vuex'
import navigation from './modules/navigation'
import session from './modules/session'
import preregistration from './modules/pre-registration'

Vue.use(Vuex)


const store = new Vuex.Store({
    modules: {
        navigation,
        session,
        preregistration,
    }
})


export default store