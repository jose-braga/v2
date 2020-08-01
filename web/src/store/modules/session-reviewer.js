import router from '../../routes/routes'
import jwtDecode from 'jwt-decode'

var readLocalStorage = function (token) {
    return jwtDecode(token)
};

const session = {
    state: {
        loggedIn: false,
        showLogin: false,
        reviewerID: undefined,
        reviewerName: undefined,
    },
    mutations: {
        checkExistingSessionReviewer(state) {
            if (localStorage['v2-reviewer-token']) {
                let token_json = readLocalStorage(localStorage['v2-reviewer-token']);
                if (token_json.exp > Date.now() / 1000) {
                    state.reviewerID = token_json.reviewerID;
                    state.reviewerName = token_json.reviewerName;
                    state.loggedIn = true;
                    if (router.currentRoute.path === '/reviewers') {
                        router.push({ path: '/reviewers/calls' });
                    }

                } else {
                    router.push({ path: '/reviewers' });
                    localStorage.removeItem('v2-reviewer-token');
                }
            } else {
                router.push({ path: '/reviewers' });
            }
        },
        makeLoginReviewer(state, payload) {
            state.showLogin = payload.val;
        },
        afterLoginProcedureReviewer(state, payload) {
            state.showLogin = payload.showLogin;
            state.loggedIn = payload.loggedIn;
            let token = payload.token;
            localStorage['v2-reviewer-token'] = token;
            let token_json = readLocalStorage(token);
            state.reviewerID = token_json.reviewerID;
            state.reviewerName = token_json.reviewerName;
        },
        logoutProcedureReviewer(state) {
            localStorage.removeItem('v2-reviewer-token');
            state.loggedIn = false;
            state.reviewerID = undefined;
            state.reviewerName = undefined;
            router.push({ path: '/reviewers' });
            //router.go();
        },
    }
}
export default session