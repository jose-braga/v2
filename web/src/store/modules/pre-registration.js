const preregistration = {
    state: {
        person: {

        }
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
};

export default preregistration