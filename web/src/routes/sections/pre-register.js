const PreRegisterForm = () => import(/* webpackChunkName: "pre-register-form" */ '@/components/pre-register/PreRegister.vue')
//const PreRegisterFormHelp = () => import(/* webpackChunkName: "pre-register-form-help" */ '@/components/pre-register/PreRegisterHelp.vue')

const routes = {
    path: '/pre-register/:username/:password',
    components: {
        default: PreRegisterForm,
        //help: PreRegisterFormHelp,
    },
}

export default routes