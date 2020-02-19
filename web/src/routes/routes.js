import VueRouter from 'vue-router'

import Person from '../components/person/Person' // this is not lazy-loaded
import PersonalTab from '../components/person/personal/PersonalTab'// this is not lazy-loaded

const PersonalTabHelp = () => import('../components/person/personal/PersonalTabHelp.vue')
const AcademicTab = () => import('../components/person/academic/AcademicTab.vue')
const AcademicTabHelp = () => import('../components/person/academic/AcademicTabHelp.vue')
const InstitutionalTab = () => import('../components/person/institutional/InstitutionalTab.vue')
const InstitutionalTabHelp = () => import('../components/person/institutional/InstitutionalTabHelp.vue')
const ProfessionalTab = () => import('../components/person/professional/ProfessionalTab.vue')
const ProfessionalTabHelp = () => import('../components/person/professional/ProfessionalTabHelp.vue')
const ProductivityTab = () => import('../components/person/productivity/ProductivityTab.vue')
const PublicationsTab = () => import('../components/person/productivity/PublicationsTab.vue')
const PublicationsTabHelp = () => import('../components/person/productivity/PublicationsTabHelp.vue')
const AddPublicationsTab = () => import('../components/person/productivity/AddPublicationsTab.vue')
const AddPublicationsTabHelp = () => import('../components/person/productivity/AddPublicationsTabHelp.vue')
const OtherProductivityTab = () => import('../components/person/productivity/OtherProductivityTab.vue')
const OtherProductivityTabHelp = () => import('../components/person/productivity/OtherProductivityTabHelp.vue')

const PersonOnBehalf = () => import('../components/person-on-behalf/personOnBehalf.vue')
const OtherPersonTab = () => import('../components/person-on-behalf/PersonTab.vue')
const OtherPersonTabHelp = () => import('../components/person-on-behalf/PersonTabHelp.vue')
const OtherPersonPersonalTab = () => import('../components/person-on-behalf/personal/PersonalTab.vue')

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
                path: 'professional',
                components: {
                    default: ProfessionalTab,
                    help: ProfessionalTabHelp
                },
            },
            {
                path: 'productivity',
                component: ProductivityTab,
                children: [
                    {
                        path: 'publications',
                        components: {
                            default: PublicationsTab,
                            help: PublicationsTabHelp
                        }
                    },
                    {
                        path: 'add-publications',
                        components: {
                            default: AddPublicationsTab,
                            help: AddPublicationsTabHelp
                        }
                    },
                    {
                        path: 'other',
                        components: {
                            default: OtherProductivityTab,
                            help: OtherProductivityTabHelp
                        }
                    },
                    { path: '', redirect: 'publications' }
                ]
            },
            { path: '', redirect: 'personal' }
        ]
    },
    {
        path: '/person-on-behalf',
        component: PersonOnBehalf,
        children: [
            {
                path: ':personName',
                components: {
                    default: OtherPersonTab,
                    help: OtherPersonTabHelp
                },
                children: [
                    {
                        path: 'personal',
                        component: OtherPersonPersonalTab
                    },
                    { path: '', redirect: 'personal' }
                ],
            },
        ]
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