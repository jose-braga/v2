import VueRouter from 'vue-router'

import myself from './sections/myself'
import onBehalf from './sections/on-behalf'
import team from './sections/team'
import group from './sections/group'
import manager from './sections/manager'
import admin from './sections/admin'
import preRegister from './sections/pre-register'


const routes = [
    {
        path: '/',
        redirect: '/person/personal'
    },
    myself,
    onBehalf,
    team,
    group,
    manager,
    admin,
    preRegister,
    { path: '*', redirect: '/' } // this redirect should be in the end always
]

const router = new VueRouter({
    mode: 'history',
    routes
})

export default router