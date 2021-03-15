import Person from '@/components/person/Person' // this is not lazy-loaded
import PersonalTab from '@/components/person/personal/PersonalTab'// this is not lazy-loaded

const PersonalTabHelp = () => import(/* webpackChunkName: "personal-tab-help" */ '@/components/person/personal/PersonalTabHelp.vue')
const AcademicTab = () => import(/* webpackChunkName: "academic-tab" */ '@/components/person/academic/AcademicTab.vue')
const AcademicTabHelp = () => import(/* webpackChunkName: "academic-tab-help" */ '@/components/person/academic/AcademicTabHelp.vue')
const InstitutionalTab = () => import(/* webpackChunkName: "institutional-tab" */ '@/components/person/institutional/InstitutionalTab.vue')
const InstitutionalTabHelp = () => import(/* webpackChunkName: "institutional-tab-help" */ '@/components/person/institutional/InstitutionalTabHelp.vue')
const ProfessionalTab = () => import(/* webpackChunkName: "professional-tab" */ '@/components/person/professional/ProfessionalTab.vue')
const ProfessionalTabHelp = () => import(/* webpackChunkName: "professional-tab-help" */ '@/components/person/professional/ProfessionalTabHelp.vue')
const ProductivityTab = () => import(/* webpackChunkName: "productivity-tab" */ '@/components/person/productivity/ProductivityTab.vue')
const SupervisorTab = () => import(/* webpackChunkName: "supervisor-tab" */ '@/components/person/productivity/SupervisorTab.vue')
const SupervisorTabHelp = () => import(/* webpackChunkName: "supervisor-tab-help" */ '@/components/person/productivity/SupervisorTabHelp.vue')
const PublicationsTab = () => import(/* webpackChunkName: "publications-tab" */ '@/components/person/productivity/PublicationsTab.vue')
const PublicationsTabHelp = () => import(/* webpackChunkName: "publications-tab-help" */ '@/components/person/productivity/PublicationsTabHelp.vue')

const AddPublicationsTab = () => import(/* webpackChunkName: "add-publications-tab" */ '@/components/person/productivity/AddPublicationsTab.vue')
const AddPublicationsTabHelp = () => import(/* webpackChunkName: "add-publication-tab-help" */ '@/components/person/productivity/AddPublicationsTabHelp.vue')

const ProjectsTab = () => import(/* webpackChunkName: "projects-tab" */ '@/components/person/productivity/ProjectsTab.vue')
const ProjectsTabHelp = () => import(/* webpackChunkName: "projects-tab-help" */ '@/components/person/productivity/ProjectsTabHelp.vue')

const OtherProductivityTab = () => import(/* webpackChunkName: "other-productivity-tab" */ '@/components/person/productivity/OtherProductivityTab.vue')
const OtherProductivityTabHelp = () => import(/* webpackChunkName: "other-productivity-tab-help" */ '@/components/person/productivity/OtherProductivityTabHelp.vue')

const SpacesTab = () => import(/* webpackChunkName: "spaces-tab" */ '@/components/person/spaces/SpacesTab.vue')
const SpacesTabHelp = () => import(/* webpackChunkName: "spaces-tab-help" */ '@/components/person/spaces/SpacesTabHelp.vue')

const WarehouseTab = () => import(/* webpackChunkName: "warehouse-tab" */ '@/components/person/warehouse/WarehouseTab.vue')
const StoreTab = () => import(/* webpackChunkName: "warehouse-store-tab" */ '@/components/person/warehouse/StoreTab.vue')
const StoreTabHelp = () => import(/* webpackChunkName: "warehouse-store-tab-help" */ '@/components/person/warehouse/StoreTabHelp.vue')
const UserManagementTab = () => import(/* webpackChunkName: "warehouse-user-management-tab" */ '@/components/person/warehouse/UserManagementTab.vue')
const UserManagementTabHelp = () => import(/* webpackChunkName: "warehouse-user-management-tab-help" */ '@/components/person/warehouse/UserManagementTabHelp.vue')
const StockManagementTab = () => import(/* webpackChunkName: "warehouse-stock-management-tab" */ '@/components/person/warehouse/StockManagementTab.vue')
const StockManagementTabHelp = () => import(/* webpackChunkName: "warehouse-stock-management-tab-help" */ '@/components/person/warehouse/StockManagementTabHelp.vue')
const OrderManagementTab = () => import(/* webpackChunkName: "warehouse-order-management-tab" */ '@/components/person/warehouse/OrderManagementTab.vue')
const OrderManagementTabHelp = () => import(/* webpackChunkName: "warehouse-order-management-tab-help" */ '@/components/person/warehouse/OrderManagementTabHelp.vue')
const FinancialManagementTab = () => import(/* webpackChunkName: "warehouse-financial-management-tab" */ '@/components/person/warehouse/FinancialManagementTab.vue')
const FinancialManagementTabHelp = () => import(/* webpackChunkName: "warehouse-financial-management-tab-help" */ '@/components/person/warehouse/FinancialManagementTabHelp.vue')

const routes = {
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
                    path: 'supervisor',
                    components: {
                        default: SupervisorTab,
                        help: SupervisorTabHelp
                    }
                },
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
                    path: 'projects',
                    components: {
                        default: ProjectsTab,
                        help: ProjectsTabHelp
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
        {
            path: 'spaces',
            components: {
                default: SpacesTab,
                help: SpacesTabHelp
            },
        },
        {
            path: 'warehouse',
            component: WarehouseTab,
            children: [
                {
                    path: 'store',
                    components: {
                        default: StoreTab,
                        help: StoreTabHelp
                    }
                },
                {
                    path: 'stock-management',
                    components: {
                        default: StockManagementTab,
                        help: StockManagementTabHelp
                    }
                },
                {
                    path: 'order-management',
                    components: {
                        default: OrderManagementTab,
                        help: OrderManagementTabHelp
                    }
                },
                {
                    path: 'user-management',
                    components: {
                        default: UserManagementTab,
                        help: UserManagementTabHelp
                    }
                },
                {
                    path: 'financial-management',
                    components: {
                        default: FinancialManagementTab,
                        help: FinancialManagementTabHelp
                    }
                },
                { path: '', redirect: 'store' }
            ]
        },
        { path: '', redirect: 'personal' }
    ]
}

export default routes