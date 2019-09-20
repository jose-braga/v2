const navigation = {
    state: {
        drawer: null,
        toolbarText: '',
        activeTile: 0,
        showHelp: false,
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
        },
    },
    actions: {
        changeDrawer ({ commit }) {
            commit('changeDrawer')
        },
        showHelp({ commit }) {
            commit('showHelp')
        }

    }

}
export default navigation