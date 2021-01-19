const Polls = () => import(/* webpackChunkName: "polls" */ '@/components/polls/Polls.vue')
const PollsVote = () => import(/* webpackChunkName: "polls-vote" */ '@/components/polls/PollsVote.vue')
const PollsVoteHelp = () => import(/* webpackChunkName: "polls-vote-help" */ '@/components/polls/PollsVoteHelp.vue')
const PollsManage = () => import(/* webpackChunkName: "polls-manage" */ '@/components/polls/PollsManage.vue')
const PollsManageHelp = () => import(/* webpackChunkName: "polls-manage-help" */ '@/components/polls/PollsManageHelp.vue')

const routes = [
    {
        path: '/polls',
        component: Polls,
    },
    {
        path: '/polls/:pollId',
        components: {
            default: PollsVote,
            help: PollsVoteHelp,
        },
    },
    {
        path: '/polls/manage',
        components: {
            default: PollsManage,
            help: PollsManageHelp,
        }
    },
]

export default routes