import router from '../../routes/routes'
import jwtDecode from 'jwt-decode'

var readLocalStorage = function (token) {
    return jwtDecode(token)
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
        currentDepartments: undefined,
        permissionsLevel: undefined,
        permissionsEndpoints: [],
        permissionsWebAreas: [],
        storeAccess: {},
        baseURL: undefined,

    },
    mutations: {
        checkExistingSession(state, payload) {
            if (localStorage['v2-token']) {
                let token_json = readLocalStorage(localStorage['v2-token']);
                if (token_json.exp > Date.now() / 1000) {
                    state.personID = token_json.personID;
                    state.personName = token_json.personName;
                    state.userID = token_json.userID;
                    state.username = token_json.username;
                    state.currentUnits = token_json.currentUnits;
                    state.currentCity = token_json.currentCity;
                    state.currentDepartments = token_json.currentDepartments;
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
                    state.storeAccess = token_json.storeAccess;
                    state.baseURL = token_json.base_url;
                    state.loggedIn = true;
                    if (router.currentRoute.path === '/call-managers') {
                        router.push({ path: '/call-managers/calls' });
                    }
                } else {
                    if (payload === undefined) {
                        router.push({ path: '/' });
                    } else if (payload.path !== undefined
                            && router.currentRoute.path !== payload.path) {
                        router.push({ path: payload.path });
                    }
                    localStorage.removeItem('v2-token');
                }
            } else {
                if (payload !== undefined
                        && payload.path !== undefined
                        && router.currentRoute.path !== payload.path) {
                    router.push({ path: payload.path });
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
            state.currentDepartments = token_json.currentDepartments;
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
            state.storeAccess = token_json.storeAccess;
            state.baseURL = token_json.base_url;
        },
        logoutProcedure(state, payload) {
            localStorage.removeItem('v2-token');
            state.loggedIn = false;
            state.personID = undefined;
            state.personName = undefined;
            state.userID = undefined;
            state.username = undefined;
            state.currentUnits = undefined;
            state.currentCity = undefined;
            state.currentDepartments = undefined;
            state.permissionsLevel = undefined;
            state.permissionsEndpoints = [];
            state.permissionsWebAreas = [];
            state.storeAccess = {};
            state.baseURL = undefined;
            if (payload === undefined) {
                router.push({ path: '/' });
            } else if (payload.path !== undefined) {
                router.push({ path: payload.path });
            }

            //router.go();
        },
    }
}
export default session