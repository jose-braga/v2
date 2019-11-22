import VueRouter from 'vue-router'

import Person from '../components/person/Person' // this is not lazy-loaded
import PersonalTab from '../components/person/personal/PersonalTab'// this is not lazy-loaded
import Group from '../components/group/Group' //to be lazy-loaded in the future

const PersonOnBehalf = () => import('../components/person-on-behalf/personOnBehalf.vue')

const PersonalTabHelp = () => import('../components/person/personal/PersonalTabHelp.vue')
const AcademicTab = () => import('../components/person/academic/AcademicTab.vue')
const AcademicTabHelp = () => import('../components/person/academic/AcademicTabHelp.vue')
const Team = () => import('../components/team/Team.vue')
const TeamMembersTab = () => import('../components/team/members/MembersTab.vue')
const TeamMembersTabHelp = () => import('../components/team/members/MembersTabHelp.vue')
const PreRegisterTab = () => import('../components/team/pre-register/PreRegisterTab.vue')
const PreRegisterTabHelp = () => import('../components/team/pre-register/PreRegisterTabHelp.vue')

const routes = [
    {
        path: '/',
        redirect: '/person/personal'
    },
    {
        path: '/person',
        component: Person,
        children: [
            {
                path: 'personal',
                components: {
                    default: PersonalTab,
                    help: PersonalTabHelp
                }
            },
            {
                path: 'academic',
                components: {
                    default: AcademicTab,
                    help: AcademicTabHelp
                },
            },
            { path: '', redirect: 'personal' }
        ]
    },
    {
        path: '/person-on-behalf',
        component: PersonOnBehalf,
    },
    {
        path: '/team',
        component: Team,
        children: [
            {
                path: 'pre-register',
                components: {
                    default: PreRegisterTab,
                    help: PreRegisterTabHelp
                }
            },
            {
                path: ':labName',
                components: {
                    default: TeamMembersTab,
                    help: TeamMembersTabHelp
                },
            },
            //{ path: '', redirect: '' },
        ]
    },
    { path: '/group', component: Group },
    { path: '*', redirect: '/' } // this redirect should be in the end always
]

const router = new VueRouter({
    mode: 'history',
    routes
})

export default router