const Team = () => import(/* webpackChunkName: "team" */ '../../components/team/Team.vue')
const TeamTab = () => import(/* webpackChunkName: "team-members-tab" */ '../../components/team/TeamTab.vue')
const TeamMembersTab = () => import(/* webpackChunkName: "team-members-tab" */ '../../components/team/members/MembersTab.vue')
const TeamMembersTabHelp = () => import(/* webpackChunkName: "team-members-tab-help" */ '../../components/team/members/MembersTabHelp.vue')
const TeamPublicationsTab = () => import(/* webpackChunkName: "team-members-tab" */ '../../components/team/productivity/PublicationsTab.vue')
const TeamPublicationsTabHelp = () => import(/* webpackChunkName: "team-members-tab" */ '../../components/team/productivity/PublicationsTabHelp.vue')
const PreRegisterTab = () => import(/* webpackChunkName: "pre-register" */ '../../components/team/pre-register/PreRegisterTab.vue')
const PreRegisterTabHelp = () => import(/* webpackChunkName: "pre-register-tab-help" */ '../../components/team/pre-register/PreRegisterTabHelp.vue')

const routes = {
    path: '/team',
    component: Team,
    children: [
        {
            path: 'pre-register',
            components: {
                default: PreRegisterTab,
                help2: PreRegisterTabHelp
            }
        },
        {
            path: ':labName',
            component: TeamTab,
            children: [
                {
                    path: 'members',
                    components: {
                        default: TeamMembersTab,
                        help2: TeamMembersTabHelp,
                    }
                },
                {
                    path: 'publications',
                    components: {
                        default: TeamPublicationsTab,
                        help2: TeamPublicationsTabHelp,
                    }
                },
            ]
        },
        //{ path: '', redirect: '' },
    ]
}

export default routes