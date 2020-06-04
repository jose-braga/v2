const PersonOnBehalf = () => import(/* webpackChunkName: "person-on-behalf" */ '../../components/person-on-behalf/personOnBehalf.vue')
const OtherPersonTab = () => import(/* webpackChunkName: "person-on-behalf-tab" */ '../../components/person-on-behalf/PersonTab.vue')
const OtherPersonTabHelp = () => import(/* webpackChunkName: "person-on-behalf-tab-help" */ '../../components/person-on-behalf/PersonTabHelp.vue')
const OtherPersonPersonalTab = () => import(/* webpackChunkName: "person-on-behalf-personal" */ '../../components/person-on-behalf/personal/PersonalTab.vue')
const OtherPersonAcademicTab = () => import(/* webpackChunkName: "person-on-behalf-academic" */ '../../components/person-on-behalf/academic/AcademicTab.vue')
const OtherPersonInstitutionalTab = () => import(/* webpackChunkName: "person-on-behalf-institutional" */ '../../components/person-on-behalf/institutional/InstitutionalTab.vue')
const OtherPersonProfessionalTab = () => import(/* webpackChunkName: "person-on-behalf-professional" */ '../../components/person-on-behalf/professional/ProfessionalTab.vue')
const OtherPersonProductivityTab = () => import(/* webpackChunkName: "person-on-behalf-productivity" */ '../../components/person-on-behalf/productivity/ProductivityTab.vue')
const OtherPersonProductivityPublicationsTab = () => import(/* webpackChunkName: "person-on-behalf-productivity-publications" */ '../../components/person-on-behalf/productivity/PublicationsTab.vue')
const OtherPersonProductivityAddPublicationsTab = () => import(/* webpackChunkName: "person-on-behalf-productivity-add-publications" */ '../../components/person-on-behalf/productivity/AddPublicationsTab.vue')
const OtherPersonProductivityOtherProductivityTab = () => import(/* webpackChunkName: "person-on-behalf-productivity-other-productivity" */ '../../components/person-on-behalf/productivity/OtherProductivityTab.vue')

const routes = {
    path: '/person-on-behalf',
    component: PersonOnBehalf,
    children: [
        {
            path: ':id',
            components: {
                default: OtherPersonTab,
                help: OtherPersonTabHelp
            },
            children: [
                {
                    path: 'personal',
                    component: OtherPersonPersonalTab
                },
                {
                    path: 'academic',
                    component: OtherPersonAcademicTab
                },
                {
                    path: 'institutional',
                    component: OtherPersonInstitutionalTab
                },
                {
                    path: 'professional',
                    component: OtherPersonProfessionalTab
                },
                {
                    path: 'productivity',
                    component: OtherPersonProductivityTab,
                    children: [
                        {
                            path: 'publications',
                            components: {
                                default: OtherPersonProductivityPublicationsTab,
                            }
                        },
                        {
                            path: 'add-publications',
                            components: {
                                default: OtherPersonProductivityAddPublicationsTab,
                            }
                        },
                        {
                            path: 'other',
                            components: {
                                default: OtherPersonProductivityOtherProductivityTab,
                            }
                        },
                        { path: '', redirect: 'publications' }
                    ]
                },
                //{ path: '', redirect: 'personal' }
            ],
        },
    ]
}

export default routes