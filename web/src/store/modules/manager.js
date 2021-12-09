const manager = {
    state: {
        searchName: '',
        searchLab: '',
        searchGroup: '',
    },
    mutations: {
        setSearch(state, payload) {
            state.searchName = payload.searchName;
            state.searchLab = payload.searchLabStore;
            state.searchGroup = payload.searchGroupStore;
        },
    },
};

export default manager