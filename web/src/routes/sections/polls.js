const Polls = () => import(/* webpackChunkName: "polls" */ '@/components/polls/Polls.vue')
const PollsHelp = () => import(/* webpackChunkName: "polls" */ '@/components/polls/PollsHelp.vue')
const PollsVote = () => import(/* webpackChunkName: "polls-vote" */ '@/components/polls/PollsVote.vue')
const PollsVoteHelp = () => import(/* webpackChunkName: "polls-vote-help" */ '@/components/polls/PollsVoteHelp.vue')
const PollsManage = () => import(/* webpackChunkName: "polls-manage" */ '@/components/polls/PollsManage.vue')
const PollsManageHelp = () => import(/* webpackChunkName: "polls-manage-help" */ '@/components/polls/PollsManageHelp.vue')
const PollsEdit = () => import(/* webpackChunkName: "polls-edit" */ '@/components/polls/PollsEdit.vue')
const PollsEditHelp = () => import(/* webpackChunkName: "polls-edit-help" */ '@/components/polls/PollsEditHelp.vue')
const PollsResults = () => import(/* webpackChunkName: "polls-results" */ '@/components/polls/PollsResults.vue')
const PollsResultsHelp = () => import(/* webpackChunkName: "polls-results-help" */ '@/components/polls/PollsResultsHelp.vue')

const routes = [
    {
        path: '/polls',
        components: {
            default: Polls,
            help: PollsHelp,
        },
    },
    {
        path: '/polls/managers',
        components: {
            default: PollsManage,
            help: PollsManageHelp,
        }
    },
    {
        path: '/polls/managers/:pollId',
        components: {
            default: PollsEdit,
            help: PollsEditHelp,
        }
    },
    {
        path: '/polls/:pollId',
        components: {
            default: PollsVote,
            help: PollsVoteHelp,
        },
    },
    {
        path: '/polls/:pollId/results',
        components: {
            default: PollsResults,
            help: PollsResultsHelp,
        },
    },
]

export default routes