const Calls = () => import(/* webpackChunkName: "calls" */ '@/components/calls/Calls.vue')
const CallPage = () => import(/* webpackChunkName: "call-page" */ '@/components/calls/CallPage.vue')
const Applicants = () => import(/* webpackChunkName: "applicants" */ '@/components/calls/applicants/Applicants.vue')
const ApplicantsHelp = () => import(/* webpackChunkName: "applicants-help" */ '@/components/calls/applicants/ApplicantsHelp.vue')
const Reviewers = () => import(/* webpackChunkName: "reviewers" */ '@/components/calls/reviewers/Reviewers.vue')
const ReviewersHelp = () => import(/* webpackChunkName: "reviewers-help" */ '@/components/calls/reviewers/ReviewersHelp.vue')
const Recommenders = () => import(/* webpackChunkName: "recommenders" */ '@/components/calls/recommenders/Recommenders.vue')
const RecommendersHelp = () => import(/* webpackChunkName: "recommenders-help" */ '@/components/calls/recommenders/RecommendersHelp.vue')

const routes = [
    {
        path: '/calls',
        component: Calls,
    },
    {
        path: '/calls/:callID',
        components: {
            default: CallPage,
        },
    },
    {
        path: '/calls/:callID/applicants',
        components: {
            default: Applicants,
            help: ApplicantsHelp
        },
    },
    {
        path: '/calls/:callID/reviewers',
        components: {
            default: Reviewers,
            help: ReviewersHelp
        },
    },
    {
        path: '/calls/:callID/applications/:applicationID'
            + '/recommendations/:recommenderID/:password',
        components: {
            default: Recommenders,
            help: RecommendersHelp
        },
    }
]

export default routes