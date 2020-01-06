import VueRouter from 'vue-router'

import Person from '../components/person/Person' // this is not lazy-loaded
import PersonalTab from '../components/person/personal/PersonalTab'// this is not lazy-loaded

const PersonalTabHelp = () => import('../components/person/personal/PersonalTabHelp.vue')
const AcademicTab = () => import('../components/person/academic/AcademicTab.vue')
const AcademicTabHelp = () => import('../components/person/academic/AcademicTabHelp.vue')
const InstitutionalTab = () => import('../components/person/institutional/InstitutionalTab.vue')
const InstitutionalTabHelp = () => import('../components/person/institutional/InstitutionalTabHelp.vue')
const ProductivityTab = () => import('../components/person/productivity/ProductivityTab.vue')
const ProductivityTabHelp = () => import('../components/person/productivity/ProductivityTabHelp.vue')

const PersonOnBehalf = () => import('../components/person-on-behalf/personOnBehalf.vue')

const Team = () => import('../components/team/Team.vue')
const TeamMembersTab = () => import('../components/team/members/MembersTab.vue')
const TeamMembersTabHelp = () => import('../components/team/members/MembersTabHelp.vue')
const PreRegisterTab = () => import('../components/team/pre-register/PreRegisterTab.vue')
const PreRegisterTabHelp = () => import('../components/team/pre-register/PreRegisterTabHelp.vue')

const Group = () => import('../components/group/Group.vue')

const Manager = () => import('../components/manager/Manager.vue')
const ManagerMembersTab = () => import('../components/manager/members/MembersTab.vue')
const ManagerMembersTabHelp = () => import('../components/manager/members/MembersTabHelp.vue')

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
            {
                path: 'institutional',
                components: {
                    default: InstitutionalTab,
                    help: InstitutionalTabHelp
                },
            },
            {
                path: 'productivity',
                components: {
                    default: ProductivityTab,
                    help: ProductivityTabHelp
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
    {
        path: '/manager',
        component: Manager,
        children: [
            {
                path: 'unit/:unitName/city/:cityName',
                components: {
                    default: ManagerMembersTab,
                    help: ManagerMembersTabHelp
                }
            },
            {
                path: 'city/:cityName',
                components: {
                    default: ManagerMembersTab,
                    help: ManagerMembersTabHelp
                }
            },
            {
                path: 'unit/:unitName',
                components: {
                    default: ManagerMembersTab,
                    help: ManagerMembersTabHelp
                }
            },
            {
                path: 'members',
                components: {
                    default: ManagerMembersTab,
                    help: ManagerMembersTabHelp
                }
            },
            //{ path: '', redirect: 'members' }
        ],
    },
    { path: '*', redirect: '/' } // this redirect should be in the end always
]

const router = new VueRouter({
    mode: 'history',
    routes
})

export default router