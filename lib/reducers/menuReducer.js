
import { List, Record, Map, OrderedMap } from 'immutable';
import { logger } from 'nrfconnect/core';
import { fromJS } from 'immutable';

import * as menuActions from '../actions/menuActions';

const InitialState = Record({
    temperatureIsChecked: false,
    pressureIsChecked: false,
    humidityIsChecked: false,
    co2IsChecked: false,
    vocIsChecked: false,
    publishInterval: 1,
    isPublishing: false,
    interval: null,
    counterInterval: null,
    isExpanded: false,
    hideDialog: false, 
    thingy: null,
    characteristics: { temperature: null, pressure: null, humidity: null, co2: null, voc: null },
    uuid: "thingy-02",
    secretKey: "T9XKPHUAMYBIPVC",
});

const initialState = new InitialState()

function setPropExpanded(oldState, action) {
    let state = oldState;
    state = state.set('isExpanded', true)
    return state
}



function checkBoxClicked(oldState, action) {
    let state = oldState;
    switch (action.checkBox) {
        case "temperature":
            state = state.set('temperatureIsChecked', !state.temperatureIsChecked)
            break;
        case "pressure":
            state = state.set('pressureIsChecked', !state.pressureIsChecked)
            break;
        case "humidity":
            state = state.set('humidityIsChecked', !state.humidityIsChecked)
            break;
        case "co2":
            state = state.set('co2IsChecked', !state.co2IsChecked)
            break;
        case "voc":
            state = state.set('vocIsChecked', !state.vocIsChecked)
            break;


    }
    return state
}



function updateCharacteristicValue(oldState, action) {
    let state = oldState;
    let characteristics = oldState.characteristics
    console.log("characteristic: ", action.characteristic)
    switch (action.characteristic.name) {
        case "Temperature":
            characteristics.temperature = action.characteristic.value[0] + "." + action.characteristic.value[1]
            state.set('characteristics', characteristics)
            break;
        case "Pressure":
            const value = action.characteristic.value
            characteristics.pressure = (value[0] | value[1] << 8 | value[2] << 16) + (value[3] | value[4] << 8) / 1000
            state.set('characteristics', characteristics)
            break;
        case "Humidity":
            characteristics.humidity = action.characteristic.value[0]
            state.set('characteristics', characteristics)
            break;
        case "Gas (Air Quality)":
            const value2 = action.characteristic.value
            if (oldState.co2IsChecked){
                characteristics.co2 = value2[0] | value2[1] << 8
            }
            if (oldState.vocIsChecked){
                characteristics.voc = value2[2] | value2[3] << 8
            }
            state.set('characteristics', characteristics)
            break;

    }
    return state
}

function publish(oldState, action) {
    let state = oldState;
    state = state.set('isPublishing', !state.isPublishing)
    logger.info("Publishing to IOTA Tangle...");
    state = state.set('interval', setInterval(action.func, action.value));
    state = state.set('counterInterval', setInterval(action.counterfunc, 1000));
    return state
}

function clearPublishInterval(oldState, action) {
    clearInterval(oldState.interval)
    clearInterval(oldState.counterInterval)
    let state = oldState;
    state = state.set('isPublishing', !state.isPublishing)
    logger.info("Publishing STOPPED")
    return state
}

function handleChangeInterval(oldState, action) {
    let state = oldState;
    state = state.set('publishInterval', action.value);
    return state
}

function handleChangeUUID(oldState, action) {
    let state = oldState;
    state = state.set('uuid', action.value);
    return state
}

function handleChangeSecretKey(oldState, action) {
    let state = oldState;
    state = state.set('secretKey', action.value);
    return state
}



function aboutSelected(oldState, action){
    let state = oldState;
    if(action.entries[0].message == "Selected About"){
        state = state.set('hideDialog', !oldState.hideDialog)
    }
    return state
}

function closeAbout(oldState, action){
    let state = oldState;
    state = state.set('hideDialog', !oldState.hideDialog)
    return state
}

function connectedToThingy(oldState,action){
    let state = oldState;
    console.log(action.thingy)
    state = state.set('thingy', action.thingy)
    return state
}

export default function menu(state = initialState, action) {

    switch (action.type) {
        case menuActions.CHECKBOX_CLICKED:
            return checkBoxClicked(state, action)
        case menuActions.EXPANDED_PROP:
            return setPropExpanded(state, action)
        case menuActions.UPDATE_CHARACTERISTIC_VALUE:
            return updateCharacteristicValue(state, action)
        case menuActions.PUBLISH:
            return publish(state, action)
        case menuActions.CLEAR_PUBLISH_INTERVAL:
            return clearPublishInterval(state, action)
        case menuActions.INTERVAL_CHANGE:
            return handleChangeInterval(state, action)
        case menuActions.UUID_CHANGE:
            return handleChangeUUID(state, action)
        case menuActions.SECRETKEY_CHANGE:
            return handleChangeSecretKey(state,action)
        case menuActions.LOG_ADD_ENTRIES:
            return aboutSelected(state,action)
        case menuActions.CLOSE_ABOUT:
            return closeAbout(state, action)
        case menuActions.CONNEECTED_TO_THINGY:
            return connectedToThingy(state,action)
		default:
            return state;
    }

}