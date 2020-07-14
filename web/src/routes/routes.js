import VueRouter from 'vue-router'

import myself from './sections/myself'
import onBehalf from './sections/on-behalf'
import team from './sections/team'
import group from './sections/group'
import manager from './sections/manager'
import admin from './sections/admin'
import unitArea from './sections/unit-area' // area for documents: MyLAQV, MyUCIBIO
import preRegister from './sections/pre-register'
import calls from './sections/calls'


let routes1 = [
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
    unitArea,
    preRegister,
     // this redirect should be in the end always
]

const routes = routes1
        .concat(calls)
        .concat([{ path: '*', redirect: '/' }])


const router = new VueRouter({
    mode: 'history',
    routes
})

export default router