
import { List, Record, Map, OrderedMap } from 'immutable';
import { logger } from 'nrfconnect/core';
import { fromJS } from 'immutable';

import * as menuActions from '../actions/menuActions';

const initialState = {
    temperatureIsChecked: false,
    pressureIsChecked: false,
    humidityIsChecked: false,
    publishInterval: 0.1,
    isPublishing: false,
    interval: null,
    CounterInterval: null,
    isExpanded: false,
    characteristics: { temperature: null, pressure: null, humidity: null }
};


function setPropExpanded(state, action){
    state.isExpanded = true
    return state
}



function checkBoxClicked(state, action){
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
	}
	return state
}

function updateCharacteristicValue(state,action){
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

function publish(state,action){
    state.isPublishing= !state.isPublishing
    logger.info("Publishing to IOTA Tangle...");
    state.interval = setInterval(action.func, action.value);
    state.CounterInterval = setInterval(action.counterfunc, action.value);
    return state
}

function clearPublishInterval(state, action){
    clearInterval(state.interval)
    state.isPublishing= !state.isPublishing
    logger.info("Publishing STOPPED")
    return state
}

function handleChangeInterval(state,action){
    state.publishInterval=action.value;
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