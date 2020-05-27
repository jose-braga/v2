import VueRouter from 'vue-router'

import Person from '../components/person/Person' // this is not lazy-loaded
import PersonalTab from '../components/person/personal/PersonalTab'// this is not lazy-loaded

const PersonalTabHelp = () => import(/* webpackChunkName: "personal-tab-help" */ '../components/person/personal/PersonalTabHelp.vue')
const AcademicTab = () => import(/* webpackChunkName: "academic-tab" */ '../components/person/academic/AcademicTab.vue')
const AcademicTabHelp = () => import(/* webpackChunkName: "academic-tab-help" */ '../components/person/academic/AcademicTabHelp.vue')
const InstitutionalTab = () => import(/* webpackChunkName: "institutional-tab" */ '../components/person/institutional/InstitutionalTab.vue')
const InstitutionalTabHelp = () => import(/* webpackChunkName: "institutional-tab-help" */ '../components/person/institutional/InstitutionalTabHelp.vue')
const ProfessionalTab = () => import(/* webpackChunkName: "professional-tab" */ '../components/person/professional/ProfessionalTab.vue')
const ProfessionalTabHelp = () => import(/* webpackChunkName: "professional-tab-help" */ '../components/person/professional/ProfessionalTabHelp.vue')
const ProductivityTab = () => import(/* webpackChunkName: "productivity-tab" */ '../components/person/productivity/ProductivityTab.vue')
const PublicationsTab = () => import(/* webpackChunkName: "publications-tab" */ '../components/person/productivity/PublicationsTab.vue')
const PublicationsTabHelp = () => import(/* webpackChunkName: "publications-tab-help" */ '../components/person/productivity/PublicationsTabHelp.vue')
const AddPublicationsTab = () => import(/* webpackChunkName: "add-publications-tab" */ '../components/person/productivity/AddPublicationsTab.vue')
const AddPublicationsTabHelp = () => import(/* webpackChunkName: "add-publication-tab-help" */ '../components/person/productivity/AddPublicationsTabHelp.vue')
const OtherProductivityTab = () => import(/* webpackChunkName: "other-productivity-tab" */ '../components/person/productivity/OtherProductivityTab.vue')
const OtherProductivityTabHelp = () => import(/* webpackChunkName: "other-productivity-tab-help" */ '../components/person/productivity/OtherProductivityTabHelp.vue')

const PersonOnBehalf = () => import(/* webpackChunkName: "person-on-behalf" */ '../components/person-on-behalf/personOnBehalf.vue')
const OtherPersonTab = () => import(/* webpackChunkName: "person-on-behalf-tab" */ '../components/person-on-behalf/PersonTab.vue')
const OtherPersonTabHelp = () => import(/* webpackChunkName: "person-on-behalf-tab-help" */ '../components/person-on-behalf/PersonTabHelp.vue')
const OtherPersonPersonalTab = () => import(/* webpackChunkName: "person-on-behalf-personal" */ '../components/person-on-behalf/personal/PersonalTab.vue')
const OtherPersonAcademicTab = () => import(/* webpackChunkName: "person-on-behalf-academic" */ '../components/person-on-behalf/academic/AcademicTab.vue')
const OtherPersonInstitutionalTab = () => import(/* webpackChunkName: "person-on-behalf-institutional" */ '../components/person-on-behalf/institutional/InstitutionalTab.vue')

const Team = () => import(/* webpackChunkName: "team" */ '../components/team/Team.vue')
const TeamMembersTab = () => import(/* webpackChunkName: "team-members-tab" */ '../components/team/members/MembersTab.vue')
const TeamMembersTabHelp = () => import(/* webpackChunkName: "team-members-tab-help" */ '../components/team/members/MembersTabHelp.vue')
const PreRegisterTab = () => import(/* webpackChunkName: "pre-register" */ '../components/team/pre-register/PreRegisterTab.vue')
const PreRegisterTabHelp = () => import(/* webpackChunkName: "pre-register-tab-help" */ '../components/team/pre-register/PreRegisterTabHelp.vue')

const Group = () => import(/* webpackChunkName: "group" */ '../components/group/Group.vue')

const Manager = () => import(/* webpackChunkName: "manager" */ '../components/manager/Manager.vue')
const ManagerMembersTab = () => import(/* webpackChunkName: "manager-members-tab" */ '../components/manager/members/MembersTab.vue')
const ManagerMembersTabHelp = () => import(/* webpackChunkName: "manager-members-tab-help" */ '../components/manager/members/MembersTabHelp.vue')

const PreRegisterForm = () => import(/* webpackChunkName: "pre-register-form" */ '../components/pre-register/PreRegister.vue')
const PreRegisterFormHelp = () => import(/* webpackChunkName: "pre-register-form-help" */ '../components/pre-register/PreRegisterHelp.vue')

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
                path: ':id',
                components: {
                    default: OtherPersonTab,
                    help: OtherPersonTabHelp
                },
                children: [
                    {
                        path: 'personal',
                        component: OtherPersonPersonalTab
                    },
                    {
                        path: 'academic',
                        component: OtherPersonAcademicTab
                    },
                    {
                        path: 'institutional',
                        component: OtherPersonInstitutionalTab
                    },
                    //{ path: '', redirect: 'personal' }
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
    {
        path: '/pre-register/:username/:password',
        components: {
            default: PreRegisterForm,
            help: PreRegisterFormHelp,
        },
    },
    { path: '*', redirect: '/' } // this redirect should be in the end always
]

const router = new VueRouter({
    mode: 'history',
    routes
})

export default router