const navigation = {
    state: {
        drawer: null,
        toolbarText: '',
        activeTile: 0,
        showHelp: false,
        showHelp2: false,
        showHelp2a: false,
    },
    mutations: {
        setActiveTile(state, payload) {
            state.activeTile = payload.newTile;
            state.toolbarText = payload.newToolbarText;
        },
        changeDrawer(state) {
            if (state.drawer === null) {
                state.drawer = true;
            } else {
                state.drawer = !state.drawer;
            }
        },
        showHelp(state) {
            state.showHelp = !state.showHelp;
            state.showHelp2 = false;
            state.showHelp2a = false;
        },
        showHelp2(state) {
            state.showHelp2 = !state.showHelp2;
            state.showHelp = false;
            state.showHelp2a = false;
        },
        showHelp2a(state) {
            state.showHelp2a = !state.showHelp2a;
            state.showHelp = false;
            state.showHelp2 = false;
        },
    },
    actions: {
        changeDrawer ({ commit }) {
            commit('changeDrawer')
        },
        showHelp({ commit }) {
            commit('showHelp')
        },
        showHelp2({ commit }) {
            commit('showHelp2')
        },
        showHelp2a({ commit }) {
            commit('showHelp2a')
        },

    }

}
export default navigation