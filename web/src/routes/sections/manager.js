//TODO: Add a No Roles tab
const Manager = () => import(/* webpackChunkName: "manager" */ '../../components/manager/Manager.vue')
const ManagerMembersTab = () => import(/* webpackChunkName: "manager-members-tab" */ '../../components/manager/members/MembersTab.vue')
const ManagerMembersTabHelp = () => import(/* webpackChunkName: "manager-members-tab-help" */ '../../components/manager/members/MembersTabHelp.vue')

const routes = {
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
}

export default routes