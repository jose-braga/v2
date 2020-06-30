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
const PublicationsTab = () => import(/* webpackChunkName: "publications-tab" */ '@/components/person/productivity/PublicationsTab.vue')
const PublicationsTabHelp = () => import(/* webpackChunkName: "publications-tab-help" */ '@/components/person/productivity/PublicationsTabHelp.vue')
const AddPublicationsTab = () => import(/* webpackChunkName: "add-publications-tab" */ '@/components/person/productivity/AddPublicationsTab.vue')
const AddPublicationsTabHelp = () => import(/* webpackChunkName: "add-publication-tab-help" */ '@/components/person/productivity/AddPublicationsTabHelp.vue')
const OtherProductivityTab = () => import(/* webpackChunkName: "other-productivity-tab" */ '@/components/person/productivity/OtherProductivityTab.vue')
const OtherProductivityTabHelp = () => import(/* webpackChunkName: "other-productivity-tab-help" */ '@/components/person/productivity/OtherProductivityTabHelp.vue')

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
                    path: 'other',
                    components: {
                        default: OtherProductivityTab,
                        help: OtherProductivityTabHelp
                    }
                },
                { path: '', redirect: 'publications' }
            ]
        },
        { path: '', redirect: 'personal' }
    ]
}

export default routes