import router from '../../routes/routes'

function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}
//window.atob(token.split('.')[1])
var readLocalStorage = function (token) {
    return JSON.parse(
        b64DecodeUnicode(token.split('.')[1])
    );
};

const session = {
    state: {
        loggedIn: false,
        showLogin: false,
        personID: undefined,
        personName: undefined,
        userID: undefined,
        username: undefined,
        currentUnits: undefined,
        currentCity: undefined,
        permissionsLevel: undefined,
        permissionsEndpoints: [],
        permissionsWebAreas: [],
        baseURL: undefined,

    },
    mutations: {
        checkExistingSession(state) {
            if (localStorage['v2-token']) {
                let token_json = readLocalStorage(localStorage['v2-token']);
                if (token_json.exp > Date.now() / 1000) {
                    state.personID = token_json.personID;
                    state.personName = token_json.personName;
                    state.userID = token_json.userID;
                    state.username = token_json.username;
                    state.currentUnits = token_json.currentUnits;
                    state.currentCity = token_json.currentCity;
                    state.permissionsLevel = token_json.permissionsLevel;
                    state.permissionsEndpoints = token_json.permissionsEndpoints;
                    for (let ind in state.permissionsEndpoints) {
                        let decomposedPath = state.permissionsEndpoints[ind]
                                                .endpoint_url
                                                .split('/')
                        decomposedPath.splice(0, 1);
                        state.permissionsEndpoints[ind].decomposedPath = decomposedPath;
                    }
                    state.permissionsWebAreas = token_json.permissionsWebAreas;
                    state.baseURL = token_json.base_url;
                    state.loggedIn = true;
                } else {
                    router.push({ path: '/' });
                    localStorage.removeItem('v2-token');
                }
            }
        },
        makeLogin(state, payload) {
            state.showLogin = payload.val;
        },
        afterLoginProcedure(state, payload) {
            state.showLogin = payload.showLogin;
            state.loggedIn = payload.loggedIn;
            let token = payload.token;
            localStorage['v2-token'] = token;
            let token_json = readLocalStorage(token);
            state.personID = token_json.personID;
            state.personName = token_json.personName;
            state.userID = token_json.userID;
            state.username = token_json.username;
            state.currentUnits = token_json.currentUnits;
            state.currentCity = token_json.currentCity;
            state.permissionsLevel = token_json.permissionsLevel;
            state.permissionsEndpoints = token_json.permissionsEndpoints;
            for (let ind in state.permissionsEndpoints) {
                let decomposedPath = state.permissionsEndpoints[ind]
                                        .endpoint_url
                                        .split('/')
                decomposedPath.splice(0, 1);
                state.permissionsEndpoints[ind].decomposedPath = decomposedPath;
            }
            state.permissionsWebAreas = token_json.permissionsWebAreas;
            state.baseURL = token_json.base_url;
        },
        logoutProcedure(state) {
            localStorage.removeItem('v2-token');
            state.loggedIn = false;
            state.personID = undefined;
            state.personName = undefined;
            state.userID = undefined;
            state.username = undefined;
            state.currentUnits = undefined;
            state.currentCity = undefined;
            state.permissionsLevel = undefined;
            state.permissionsEndpoints = [];
            state.permissionsWebAreas = [];
            state.baseURL = undefined;
            router.push({ path: '/' });
            //router.go();
        },
    }
}
export default session