
import { List, Record, Map, OrderedMap } from 'immutable';
import { logger } from 'nrfconnect/core';
import { fromJS } from 'immutable';

import * as menuActions from '../actions/menuActions';

const InitialState = Record({
    temperatureIsChecked: false,
    pressureIsChecked: false,
    humidityIsChecked: false,
    publishInterval: 0.1,
    isPublishing: false,
    interval: null,
    counterInterval: null,
    isExpanded: false,
    characteristics: { temperature: null, pressure: null, humidity: null },
});

const initialState = new InitialState()

function setPropExpanded(oldState, action){
    let state = oldState; 
    state = state.set('isExpanded', true)
    return state
}



function checkBoxClicked(oldState, action){
    let state = oldState; 
	switch (action.checkBox){
		case "temperature":
            state = state.set('temperatureIsChecked', !state.temperatureIsChecked)
            break;
        case "pressure":
            state = state.set('pressureIsChecked', !state.pressureIsChecked)
            break;
        case "humidity":
            state = state.set('humidityIsChecked', !state.humidityIsChecked)
            break;
	}
	return state
}

function updateCharacteristicValue(oldState,action){
    let state = oldState; 
    let characteristics = oldState.characteristics
    switch (action.characteristic.name){
        case "Temperature":
            characteristics.temperature = action.characteristic.value
            state.set('characteristics', characteristics)
            break;
        case "Pressure":
            characteristics.pressure = action.characteristic.value
            state.set('characteristics', characteristics)
            break;
        case "Humidity":
            characteristics.humidity = action.characteristic.value
            state.set('characteristics', characteristics)
            break;
    }
    return state
}

function publish(oldState,action){
    let state = oldState; 
    state = state.set('isPublishing',!state.isPublishing)
    logger.info("Publishing to IOTA Tangle...");
    state = state.set('interval',setInterval(action.func, action.value));
    state = state.set('counterInterval', setInterval(action.counterfunc, 1000));
    return state
}

function clearPublishInterval(oldState, action){
    clearInterval(oldState.interval)
    clearInterval(oldState.counterInterval)
    let state = oldState;
    state = state.set('isPublishing', !state.isPublishing)
    logger.info("Publishing STOPPED")
    return state
}

function handleChangeInterval(oldState,action){
    let state = oldState; 
    state = state.set('publishInterval', action.value);
    return state
}

export default function menu(state = initialState, action) {

	switch (action.type) {
        case menuActions.CHECKBOX_CLICKED:
            return checkBoxClicked(state,action)
        case menuActions.EXPANDED_PROP:
			return setPropExpanded(state,action)
        case menuActions.UPDATE_CHARACTERISTIC_VALUE:
            return updateCharacteristicValue(state,action)
        case menuActions.PUBLISH:
            return publish(state,action)
        case menuActions.CLEAR_PUBLISH_INTERVAL:
            return clearPublishInterval(state, action)
        case menuActions.INTERVAL_CHANGE:
            return handleChangeInterval(state,action)
		default:
            return state;
	}

}