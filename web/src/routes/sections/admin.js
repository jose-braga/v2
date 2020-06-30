const Admin = () => import(/* webpackChunkName: "admin" */ '@/components/admin/Admin.vue')
const AdminMessagesTab = () => import(/* webpackChunkName: "admin-messages-tab" */ '@/components/admin/messages/MessagesTab.vue')
const AdminMessagesTabHelp = () => import(/* webpackChunkName: "admin-messages-tab-help" */ '@/components/admin/messages/MessagesTabHelp.vue')

const routes = {
    path: '/admin',
    component: Admin,
    children: [
        {
            path: 'messages',
            components: {
                default: AdminMessagesTab,
                help: AdminMessagesTabHelp
            }
        },
        { path: '', redirect: 'messages' }
    ],
}

export default routes