const Admin = () => import(/* webpackChunkName: "admin" */ '@/components/admin/Admin.vue')
const AdminMessagesTab = () => import(/* webpackChunkName: "admin-messages-tab" */ '@/components/admin/messages/MessagesTab.vue')
const AdminMessagesTabHelp = () => import(/* webpackChunkName: "admin-messages-tab-help" */ '@/components/admin/messages/MessagesTabHelp.vue')
const AdminUserContactsTab = () => import(/* webpackChunkName: "admin-user-contacts-tab" */ '@/components/admin/user_contacts/UserContactsTab.vue')
const AdminUserContactsTabHelp = () => import(/* webpackChunkName: "admin-user-contacts-tab-help" */ '@/components/admin/user_contacts/UserContactsTabHelp.vue')
const AdminEmailTab = () => import(/* webpackChunkName: "admin-email-tab" */ '@/components/admin/email_definitions/EmailTab.vue')
const AdminEmailTabHelp = () => import(/* webpackChunkName: "admin-email-tab-help" */ '@/components/admin/email_definitions/EmailTabHelp.vue')

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
        {
            path: 'user-contacts',
            components: {
                default: AdminUserContactsTab,
                help: AdminUserContactsTabHelp
            }
        },
        {
            path: 'email-definitions',
            components: {
                default: AdminEmailTab,
                help: AdminEmailTabHelp
            }
        },
        { path: '', redirect: 'messages' }
    ],
}

export default routes