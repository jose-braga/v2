const application = {
    state: {
        application: {
            submitted: false,
            name: '',
            gender: null,
            birth_date: null,
            countries: null,
            identification_type_id: null,
            identification_number: null,
            identification_valid_until: null,
            phone: null,
            email: null,
            cv: null,
            motivation: null,
            academicDegrees: [],
            recommendations: [
                {name: '', email: '', institution: '', role: ''},
                {name: '', email: '', institution: '', role: ''},
            ],
            projects: [],
            papers: [],
            communications: [],
            posters: [],
            prizes: [],
            patents: [],
            professional: [],
        },
        callSegment: undefined,
    },
    getters: {
        applicationData: state => {
            return state;
        },

    },
    mutations: {
        checkExistingApplication(state, payload) {
            let callApplicationToken = 'v2-call-application-' + payload.callSegment;
            if (localStorage.getItem(callApplicationToken)) {
                state.application = JSON.parse(localStorage.getItem(callApplicationToken));
            } else {
                let initialValue = state.application;
                initialValue['callSegment'] = payload.callSegment;
                localStorage.setItem(callApplicationToken,
                    JSON.stringify(
                        initialValue
                    ));
            }
            state.application['callSegment'] = payload.callSegment;
            state.callSegment = payload.callSegment;
        },
        addApplicationData(state, payload) {
            // saves data in state and updates localStorage
            Object.keys(payload).forEach(key => {
                let value = payload[key];
                if (value === null) {
                    state.application[key] = value;
                } else if (typeof value === 'object' ) {
                    state.application[key] = value;
                    //state.application[key] = JSON.parse(JSON.stringify(value));
                } else {
                    state.application[key] = value;
                }
                /*
                 else if (value instanceof File) {
                    console.log('file')
                    //state.application[key] = value;
                    state.application[key] = URL.createObjectURL(value);
                }
                */
            });
            let callApplicationToken = 'v2-call-application-' + state.callSegment;
            localStorage.setItem(callApplicationToken, JSON.stringify(state.application));
        },
        setApplicationSubmitted(state, payload) {
            state.application.submitted = payload.submitted;
            let callApplicationToken = 'v2-call-application-' + state.callSegment;
            localStorage.setItem(callApplicationToken, JSON.stringify(state.application));
        },
    },
    actions: {
        addApplicationData({ commit }, payload) {
            commit('addApplicationData', payload)
        },
        setApplicationSubmitted({ commit }, payload) {
            commit('setApplicationSubmitted', payload)
        },

    }
};

export default application