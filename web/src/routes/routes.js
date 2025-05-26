import VueRouter from 'vue-router'

import myself from './sections/myself'
import passwordRecovery from './sections/recovery'
import onBehalf from './sections/on-behalf'
import team from './sections/team'
import group from './sections/group'
import unit from './sections/unit'
import manager from './sections/manager'
import admin from './sections/admin'
import unitArea from './sections/unit-area' // area for documents: MyLAQV, MyUCIBIO
import privateArea from './sections/private-area'
import preRegister from './sections/pre-register'
import calls from './sections/calls'
import polls from './sections/polls'
import news from './sections/news'


let routes1 = [
    {
        path: '/',
        redirect: '/person/personal'
    },
    myself,
    passwordRecovery,
    onBehalf,
    team,
    group,
    unit,
    manager,
    admin,
    unitArea,
    privateArea,
    preRegister,
    news,
     // this redirect should be in the end always
]

const routes = routes1
        .concat(calls)
        .concat(polls)
        .concat([{ path: '*', redirect: '/' }])


const router = new VueRouter({
    mode: 'history',
    routes
})

export default router