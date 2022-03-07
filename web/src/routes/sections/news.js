const NewsTab = () => import(/* webpackChunkName: "news-tab" */ '@/components/news/NewsTab.vue')

const routes = {
    path: '/platform-news',
    components: {
        default: NewsTab,
    }
}

export default routes