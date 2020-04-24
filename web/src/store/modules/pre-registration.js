const preregistration = {
    state: {
        person: {

        }
    },
    mutations: {
        addPersonData(state, payload) {
            Object.keys(payload).forEach(key => {
                let value = payload[key];
                state.person[key] = value;
            });
        },
    },
};

export default preregistration