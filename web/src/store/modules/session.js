import router from '../../routes/routes'

var readLocalStorage = function (token) {
    return JSON.parse(window.atob(token.split('.')[1]));
};

const session = {
    state: {
        loggedIn: false,
        showLogin: false,
        personID: undefined,
        userID: undefined,
        permissionID: [],
        permissionLabID: [],
        permissionGroupID: []
    },
    mutations: {
        checkExistingSession(state) {
            if (localStorage['v2-token']) {
                let token_json = readLocalStorage(localStorage['v2-token']);
                if (token_json.exp > Date.now() / 1000) {
                    state.personID = token_json.personID;
                    state.userID = token_json.userID;
                    state.permissionID = token_json.permissionID;
                    state.permissionLabID = token_json.permission_lab_id;
                    state.permissionGroupID = token_json.permission_group_id;
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
            state.userID = token_json.userID;
            state.permissionID = token_json.permissionID;
            state.permissionLabID = token_json.permission_lab_id;
            state.permissionGroupID = token_json.permission_group_id;
            // eslint-disable-next-line
            //console.log(token_json)            
        },
        logoutProcedure(state) {
            localStorage.removeItem('v2-token');
            state.loggedIn = false;
            state.personID = undefined;
            state.userID = undefined;
            state.permissionID = [];
            state.permissionLabID = [];
            state.permissionGroupID = [];
            router.push({ path: '/' });           
        },

    }

}
export default session