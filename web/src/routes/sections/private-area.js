const PrivateArea = () => import(/* webpackChunkName: "private-area" */ '@/components/private-area/PrivateArea.vue')
const PrivateAreaTab = () => import(/* webpackChunkName: "private-area-tab" */ '@/components/private-area/PrivateAreaTab.vue')
const PrivateAreaTabHelp = () => import(/* webpackChunkName: "private-area-tab-help" */ '@/components/private-area/PrivateAreaTabHelp.vue')

const routes = {
    path: '/private-area/:unitName',
    component: PrivateArea,
    children: [
        {
            path: 'tab/:tabName',
            components: {
                default: PrivateAreaTab,
                help: PrivateAreaTabHelp
            }
        },
        { path: '', redirect: 'tab/general' }
    ],
}

export default routes