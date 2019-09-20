import Vue from 'vue'
import Vuex from 'vuex'
import navigation from './modules/navigation'
import session from './modules/session'

Vue.use(Vuex)


const store = new Vuex.Store({
    modules: {
        navigation,
        session        
    }
})


export default store