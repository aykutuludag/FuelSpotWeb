import { combineReducers, createStore } from 'redux';



// actions.js
export const activateGeod = geod => ({
    type: 'ACTIVATE_GEOD',
    geod
});

export const activateStation = station => ({
    type: 'ACTIVATE_STATION',
    station
});





// reducers.js
export const geod = (state = {}, action) => {
    switch (action.type) {
        case 'ACTIVATE_GEOD':
            return action.geod;
        default:
            return state;
    }
};

export const stations = (state = {}, action) => {
    switch (action.type) {
        case 'ACTIVATE_STATION':
            return action.station;
        default:
            return state;
    }
};



export const reducers = combineReducers({
    geod,
    stations
});




// store.js
export function configureStore(initialState = {}) {
    const store = createStore(reducers, initialState);
    return store;
}

export const store = configureStore();
