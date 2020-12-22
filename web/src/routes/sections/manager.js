//TODO: Add a No Roles tab
const Manager = () => import(/* webpackChunkName: "manager" */ '@/components/manager/Manager.vue')
const ManagerMembersTab = () => import(/* webpackChunkName: "manager-members-tab" */ '@/components/manager/members/MembersTab.vue')
const ManagerMembersTabHelp = () => import(/* webpackChunkName: "manager-members-tab-help" */ '@/components/manager/members/MembersTabHelp.vue')
const ValidateTab = () => import(/* webpackChunkName: "manager-validate-tab" */ '@/components/manager/members/ValidateTab.vue')
const ValidateTabHelp = () => import(/* webpackChunkName: "manager-validate-tab-help" */ '@/components/manager/members/ValidateTabHelp.vue')
const UnknownAssociationsTab = () => import(/* webpackChunkName: "manager-unknown-tab" */ '@/components/manager/members/UnknownMembersTab.vue')
const UnknownAssociationsTabHelp = () => import(/* webpackChunkName: "manager-unknown-tab-help" */ '@/components/manager/members/UnknownMembersTabHelp.vue')


const routes = {
    path: '/manager',
    component: Manager,
    children: [
        {
            path: 'people-no-association',
            components: {
                default: UnknownAssociationsTab,
                help: UnknownAssociationsTabHelp
            }
        },
        {
            path: 'validate',
            components: {
                default: ValidateTab,
                help: ValidateTabHelp
            }
        },
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
}

export default routes