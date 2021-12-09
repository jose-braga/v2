import Vue from 'vue'
import Vuex from 'vuex'
import navigation from './modules/navigation'
import session from './modules/session'
import sessionreviewer from './modules/session-reviewer'
import preregistration from './modules/pre-registration'
import application from './modules/application'
import manager from './modules/manager'

Vue.use(Vuex)


const store = new Vuex.Store({
    modules: {
        navigation,
        session,
        sessionreviewer,
        preregistration,
        application,
        manager,
    }
})


export default store