
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
    print: false,
});

const initialStae = new InitialState()

function setPropExpanded(oldState, action){
    let state = oldState; 
    state.isExpanded = true
    return state
}



function checkBoxClicked(oldState, action){
    let state = oldState; 
	switch (action.checkBox){
		case "temperature":
            state.temperatureIsChecked = !state.temperatureIsChecked
            break;
        case "pressure":
            state.pressureIsChecked = !state.pressureIsChecked
            break;
        case "humidity":
            state.humidityIsChecked = !state.humidityIsChecked
            break;
        case "print":
            state.print = !state.print
            break;
	}
	return state
}

function updateCharacteristicValue(oldState,action){
    let state = oldState; 
    switch (action.characteristic.name){
        case "Temperature":
            state.characteristics.temperature = action.characteristic.value
            break;
        case "Pressure":
            state.characteristics.pressure = action.characteristic.value
            break;
        case "Humidity":
            state.characteristics.humidity = action.characteristic.value
            break;
    }
    return state
}

function publish(oldState,action){
    let state = oldState; 
    state.isPublishing= !state.isPublishing
    logger.info("Publishing to IOTA Tangle...");
    state.interval = setInterval(action.func, action.value);
    state.CounterInterval = setInterval(action.counterfunc, 1000);
    return state
}

function clearPublishInterval(oldState, action){
    let state = oldState; 
    clearInterval(state.interval)
    clearInterval(state.CounterInterval)
    state.isPublishing= !state.isPublishing
    logger.info("Publishing STOPPED")
    return state
}

function handleChangeInterval(oldState,action){
    let state = oldState; 
    state.set('publishInterval', action.value);
    console.log("new",state)
    console.log("old",oldState)
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