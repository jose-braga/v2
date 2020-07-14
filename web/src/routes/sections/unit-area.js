// TODO: WORK HERE!!!!!!!!
const UnitArea = () => import(/* webpackChunkName: "unit-area" */ '@/components/unit-area/UnitArea.vue')
const UnitAreaTab = () => import(/* webpackChunkName: "unit-area-tab" */ '@/components/unit-area/UnitAreaTab.vue')
const UnitAreaTabHelp = () => import(/* webpackChunkName: "unit-area-tab-help" */ '@/components/unit-area/UnitAreaTabHelp.vue')

const routes = {
    path: '/unit-area/:unitName',
    component: UnitArea,
    children: [
        {
            path: '',
            components: {
                default: UnitAreaTab,
                help: UnitAreaTabHelp
            }
        },
        {
            path: 'city/:cityName',
            components: {
                default: UnitAreaTab,
                help: UnitAreaTabHelp
            }
        },
        { path: '', redirect: 'messages' }
    ],
}

export default routes