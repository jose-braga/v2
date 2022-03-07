<template>
<div>
<v-card>
    <v-card-title primary-title>
        <div>
            <h3 class="headline">News</h3>
        </div>
    </v-card-title>
    <v-card-text>
        <ul>
            <li class="mb-4"
                v-for="(thisNew,i) in news"
                    :key="i"
            >
              <span class="news-title">{{thisNew.title}}</span>
              <span class="news-time ml-3"> {{thisNew.published}}</span><br>
              <div class="news-body ml-1 mt-1"> {{thisNew.body}}</div>

            </li>
        </ul>
    </v-card-text>
</v-card>

</div>
</template>

<script>
import subUtil from '@/components/common/submit-utils'

export default {
    components: {
    },
    data () {
        return {
            news: [],
        }
    },
    created () {
        this.$store.commit('setActiveTile', {
            newTile: 9,
            newToolbarText: 'Platform News'
        });
        this.initialize()
    },
    methods: {
        initialize () {
            if (this.$store.state.session.loggedIn) {
                const urlSubmit = 'api/v2/' + 'news';
                subUtil.getPublicInfo(this, urlSubmit, 'news');
            }
        },
    },

}
</script>

<style scoped>
.news-title {
    font-size: 1.4em;
    color:black
}

.news-body {
    white-space: pre-line;
    font-size: 1.2em;
}

.news-time {
    font-size: 0.7em;
}
</style>