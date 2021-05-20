const Team = () => import(/* webpackChunkName: "team" */ '@/components/team/Team.vue')
const TeamTab = () => import(/* webpackChunkName: "team-members-tab" */ '@/components/team/TeamTab.vue')
const TeamMembersTab = () => import(/* webpackChunkName: "team-members-tab" */ '@/components/team/members/MembersTab.vue')
const TeamMembersTabHelp = () => import(/* webpackChunkName: "team-members-tab-help" */ '@/components/team/members/MembersTabHelp.vue')
const TeamPublicationsTab = () => import(/* webpackChunkName: "team-members-tab" */ '@/components/team/productivity/PublicationsTab.vue')
const TeamPublicationsTabHelp = () => import(/* webpackChunkName: "team-members-tab" */ '@/components/team/productivity/PublicationsTabHelp.vue')
const TeamSpacesTab = () => import(/* webpackChunkName: "team-spaces-tab" */ '@/components/team/spaces/SpacesTab.vue')
const TeamSpacesTabHelp = () => import(/* webpackChunkName: "team-spaces-tab-help" */ '@/components/team/spaces/SpacesTabHelp.vue')
const PreRegisterTab = () => import(/* webpackChunkName: "pre-register" */ '@/components/team/pre-register/PreRegisterTab.vue')
const PreRegisterTabHelp = () => import(/* webpackChunkName: "pre-register-tab-help" */ '@/components/team/pre-register/PreRegisterTabHelp.vue')

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
                {
                    path: 'spaces',
                    components: {
                        default: TeamSpacesTab,
                        help2: TeamSpacesTabHelp,
                    }
                },
            ]
        },
        //{ path: '', redirect: '' },
    ]
}

export default routes