import VueRouter from 'vue-router'
import Person from '../components/person/Person' // this is not lazy-loaded
import PersonalTab from '../components/person/personal/PersonalTab'// this is not lazy-loaded
import Group from '../components/group/Group'

const PersonalTabHelp = () => import('../components/person/personal/PersonalTabHelp.vue')
const AcademicTab = () => import('../components/person/academic/AcademicTab.vue')
const AcademicTabHelp = () => import('../components/person/academic/AcademicTabHelp.vue')
const Team = () => import('../components/team/Team.vue')
const TeamMembersTab = () => import('../components/team/members/MembersTab.vue')
const TeamMembersTabHelp = () => import('../components/team/members/MembersTabHelp.vue')

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
                }
            },
            { path: '', redirect: 'personal' }
        ]
    },
    { 
        path: '/team', 
        component: Team,
        children: [
            { 
                path: 'members', components: { 
                    default: TeamMembersTab, 
                    help: TeamMembersTabHelp 
                } 
            },
            { path: '', redirect: 'members' },
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