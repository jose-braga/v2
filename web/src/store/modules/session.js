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
        username: undefined,
        cities: [],
        currentCities: [],
        labs: [],
        currentLabs: [],
        groups: [],
        currentGroups: [],
        units: [],
        currentUnits: [],
        technicianOffices: [],
        currentTechnicianOffices: [],
        scienceManagerOffices: [],
        currentScienceManagerOffices: [],
        administrativeOffices: [],
        currentAdministrativeOffices: [],
        permissionLevel: undefined,
        permissionPeople: [],
        permissionLabs: [],
        permissionLabsGroups: [],
        permissionGroups: [],
        permissionUnits: [],
        permissionUnitsCities: [],
        permissionCities: [],
        permissionDocuments: [],
        permissionWebAreas: [],
        baseURL: undefined,

    },
    mutations: {
        checkExistingSession(state) {
            if (localStorage['v2-token']) {
                let token_json = readLocalStorage(localStorage['v2-token']);
                if (token_json.exp > Date.now() / 1000) {
                    state.personID = token_json.personID;
                    state.userID = token_json.userID;
                    state.username = token_json.username;
                    state.cities = token_json.cities;
                    state.currentCities = token_json.currentCities;
                    state.labs = token_json.labs;
                    state.currentLabs = token_json.currentLabs;
                    state.groups = token_json.groups;
                    state.currentGroups = token_json.currentGroups;
                    state.units = token_json.units;
                    state.currentUnits = token_json.currentUnits;
                    state.technicianOffices = token_json.technicianOffices;
                    state.currentTechnicianOffices = token_json.currentTechnicianOffices;
                    state.scienceManagerOffices = token_json.scienceManagerOffices;
                    state.currentScienceManagerOffices = token_json.currentScienceManagerOffices;
                    state.administrativeOffices = token_json.administrativeOffices;
                    state.currentAdministrativeOffices = token_json.currentAdministrativeOffices;
                    state.permissionLevel = token_json.permissionLevel;
                    state.permissionPeople = token_json.permissionPeople;
                    state.permissionLabs = token_json.permissionLabs;
                    state.permissionLabsGroups = token_json.permissionLabsGroups;
                    state.permissionGroups = token_json.permissionGroups;
                    state.permissionUnits = token_json.permissionUnits;
                    state.permissionUnitsCities = token_json.permissionUnitsCities;
                    state.permissionCities = token_json.permissionCities;
                    state.permissionDocuments = token_json.permissionDocuments;
                    state.permissionWebAreas = token_json.permissionWebAreas;
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
            state.userID = token_json.userID;
            state.username = token_json.username;
            state.cities = token_json.cities;
            state.currentCities = token_json.currentCities;
            state.labs = token_json.labs;
            state.currentLabs = token_json.currentLabs;
            state.groups = token_json.groups;
            state.currentGroups = token_json.currentGroups;
            state.units = token_json.units;
            state.currentUnits = token_json.currentUnits;
            state.technicianOffices = token_json.technicianOffices;
            state.currentTechnicianOffices = token_json.currentTechnicianOffices;
            state.scienceManagerOffices = token_json.scienceManagerOffices;
            state.currentScienceManagerOffices = token_json.currentScienceManagerOffices;
            state.administrativeOffices = token_json.administrativeOffices;
            state.currentAdministrativeOffices = token_json.currentAdministrativeOffices;
            state.permissionLevel = token_json.permissionLevel;
            state.permissionPeople = token_json.permissionPeople;
            state.permissionLabs = token_json.permissionLabs;
            state.permissionLabsGroups = token_json.permissionLabsGroups;
            state.permissionGroups = token_json.permissionGroups;
            state.permissionUnits = token_json.permissionUnits;
            state.permissionUnitsCities = token_json.permissionUnitsCities;
            state.permissionCities = token_json.permissionCities;
            state.permissionDocuments = token_json.permissionDocuments;
            state.permissionWebAreas = token_json.permissionWebAreas;
            state.baseURL = token_json.base_url;
        },
        logoutProcedure(state) {
            localStorage.removeItem('v2-token');
            state.loggedIn = false;
            state.personID = undefined;
            state.userID = undefined;
            state.username = undefined;
            state.cities = [];
            state.currentCities = [];
            state.labs = [];
            state.currentLabs = [];
            state.groups = [];
            state.currentGroups = [];
            state.units = [];
            state.currentUnits = [];
            state.technicianOffices = [];
            state.currentTechnicianOffices = [];
            state.scienceManagerOffices = [];
            state.currentScienceManagerOffices = [];
            state.administrativeOffices = [];
            state.currentAdministrativeOffices = [];
            state.permissionLevel = undefined;
            state.permissionPeople = [];
            state.permissionLabs = [];
            state.permissionLabsGroups = [];
            state.permissionGroups = [];
            state.permissionUnits = [];
            state.permissionUnitsCities = [];
            state.permissionCities = [];
            state.permissionDocuments = [];
            state.permissionWebAreas = [];
            state.baseURL = undefined;
            router.push({ path: '/' });           
        },
    }
}
export default session