const preregistration = {
    state: {
        person: {
            name: '',
            selectCar: false,
            selectAccess: false,
        },

    },
    getters: {
        preRegisterData: state => {
            return state;
        },

    },
    mutations: {
        addPersonData(state, payload) {
            Object.keys(payload).forEach(key => {
                let value = payload[key];
                if (value === null) {
                    state.person[key] = value;
                } else if (key === 'cropper') {
                    state.person[key] = value;
                } else if (typeof value === 'object' ) {
                    state.person[key] = JSON.parse(JSON.stringify(value));
                } else {
                    state.person[key] = value;
                }

            });
        },
    },
    actions: {
        addPersonData({ commit }, payload) {
            commit('addPersonData', payload)
        },
    },
};

export default preregistration