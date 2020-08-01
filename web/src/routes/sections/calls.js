const Calls = () => import(/* webpackChunkName: "calls" */ '@/components/calls/Calls.vue')
const CallPage = () => import(/* webpackChunkName: "call-page" */ '@/components/calls/CallPage.vue')
const Applicants = () => import(/* webpackChunkName: "applicants" */ '@/components/calls/applicants/Applicants.vue')
const ApplicantsHelp = () => import(/* webpackChunkName: "applicants-help" */ '@/components/calls/applicants/ApplicantsHelp.vue')
const Reviewers = () => import(/* webpackChunkName: "reviewers" */ '@/components/calls/reviewers/Reviewers.vue')
const ReviewerCallsList = () => import(/* webpackChunkName: "reviewers-calls-list" */ '@/components/calls/reviewers/ReviewerCallsList.vue')
const ReviewerCallsListHelp = () => import(/* webpackChunkName: "reviewers-calls-list-help" */ '@/components/calls/reviewers/ReviewersHelp.vue')
const ReviewerCallApplicationsList = () => import(/* webpackChunkName: "reviewers-calls-applications-list" */ '@/components/calls/reviewers/ReviewerCallApplicationsList.vue')
const ReviewerCallApplicationsListHelp = () => import(/* webpackChunkName: "reviewers-calls-applications-list-help" */ '@/components/calls/reviewers/ReviewerCallApplicationsListHelp.vue')
const ReviewerCallApplication = () => import(/* webpackChunkName: "reviewers-calls-application" */ '@/components/calls/reviewers/ReviewerCallApplication.vue')
const ReviewerCallApplicationHelp = () => import(/* webpackChunkName: "reviewers-calls-application-help" */ '@/components/calls/reviewers/ReviewerCallApplicationHelp.vue')

const Recommenders = () => import(/* webpackChunkName: "recommenders" */ '@/components/calls/recommenders/Recommenders.vue')
const RecommendersHelp = () => import(/* webpackChunkName: "recommenders-help" */ '@/components/calls/recommenders/RecommendersHelp.vue')

const routes = [
    {
        path: '/calls',
        component: Calls,
    },
    {
        path: '/calls/:callSegment',
        components: {
            default: CallPage,
        },
    },
    {
        path: '/calls/:callSegment/applicants',
        components: {
            default: Applicants,
            help: ApplicantsHelp
        },
    },
    {
        path: '/reviewers',
        components: {
            default: Reviewers
        }
    },

    {
        path: '/reviewers/calls',
        components: {
            default: ReviewerCallsList,
            help: ReviewerCallsListHelp
        },
    },
    {
        path: '/reviewers/calls/:callSegment',
        components: {
            default: ReviewerCallApplicationsList,
            help: ReviewerCallApplicationsListHelp
        },
    },
    {
        path: '/reviewers/calls/:callSegment/applications/:applicationID',
        components: {
            default: ReviewerCallApplication,
            help: ReviewerCallApplicationHelp
        },
    },

    {
        path: '/calls/:callSegment/applications/:applicationID'
            + '/recommendations/:recommenderID/:password',
        components: {
            default: Recommenders,
            help: RecommendersHelp
        },
    },
    /*
    Add a route for an applicant to watch his/hers submission
    {
        path: '/calls/:callSegment/applications/:applicationID'
            + '/submitted/:password',
        components: {
            default: ApplicationSubmitted,
            help: ApplicationSubmittedHelp
        },
    },
    {
        path: '/calls/:callSegment/managers/:password',
        components: {
            default: ApplicationSubmitted,
            help: ApplicationSubmittedHelp
        },
    },
     */
]

export default routes