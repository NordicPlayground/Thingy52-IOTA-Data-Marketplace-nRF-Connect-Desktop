import { Aggregator } from '../../iota/aggregator';
import { List, Record, Map, OrderedMap } from 'immutable';
import { logger } from 'nrfconnect/core';
import { fromJS } from 'immutable';
import { reactLocalStorage } from 'reactjs-localstorage';

import * as dataPublisher from '../../iota/data_publisher';
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
    thingy: {name: null},
    characteristics: { temperature: "--", pressure: "--", humidity: "--", co2: "--", voc: "--" },
    uuid: reactLocalStorage.get('uuid'),
    secretKey: reactLocalStorage.get('secretKey'),
    publishButtonStyle: "btn btn-primary btn-lg btn-nordic padded-row",
    publishButtonState: "Start Publishing",
});

const initialState = new InitialState()
let aggregator = new Aggregator

function setPropExpanded(oldState, action) {
    let state = oldState;
    state = state.set('isExpanded', true)
    return state
}



function checkBoxClicked(oldState, action) {
    let state = oldState;
    let characteristics = oldState.characteristics
    switch (action.checkBox) {
        case "temperature":
            state = state.set('temperatureIsChecked', !state.temperatureIsChecked)
            if(!state.temperatureIsChecked){
                characteristics.temperature = "--"
                state.set('characteristics', characteristics)}
            break;
        case "pressure":
            state = state.set('pressureIsChecked', !state.pressureIsChecked)
            if(!state.pressureIsChecked){
                characteristics.pressure = "--"
                state.set('characteristics', characteristics)}
            break;
        case "humidity":
            state = state.set('humidityIsChecked', !state.humidityIsChecked)
            if(!state.humidityIsChecked){
                characteristics.humidity = "--" 
                state.set('characteristics', characteristics)}
            break;
        case "co2":
            state = state.set('co2IsChecked', !state.co2IsChecked)
            if(!state.co2IsChecked){
                characteristics.co2 = "--"
                state.set('characteristics', characteristics)}
            break;
        case "voc":
            state = state.set('vocIsChecked', !state.vocIsChecked)
            if(!state.vocIsChecked){
                characteristics.voc = "--" 
                state.set('characteristics', characteristics)}
            break;
    }
    return state
}



function updateCharacteristicValue(oldState, action) {
    let state = oldState;
    let characteristics = oldState.characteristics
    switch (action.characteristic.name) {
        case "Temperature":
            characteristics.temperature = action.characteristic.value[0] + "." + action.characteristic.value[1] 
            aggregator.append_datapoint(action.characteristic.value[0], action.characteristic.name)
            characteristics.temperature = characteristics.temperature + " °C"
            state.set('characteristics', characteristics)
            break;
        case "Pressure":
            const value = action.characteristic.value
            characteristics.pressure = (value[0] | value[1] << 8 | value[2] << 16) + (value[3] | value[4] << 8) / 1000
            
            aggregator.append_datapoint(action.characteristic.value[0], action.characteristic.name)
            characteristics.pressure = characteristics.pressure + " hPa"
            state.set('characteristics', characteristics)
            break;
        case "Humidity":
            characteristics.humidity = action.characteristic.value[0] 
            
            aggregator.append_datapoint(action.characteristic.value[0], action.characteristic.name)
            characteristics.humidity = characteristics.humidity + " %"
            state.set('characteristics', characteristics)
            break;
        case "Gas (Air Quality)":
            const value2 = action.characteristic.value
            if (oldState.co2IsChecked){
                characteristics.co2 = (value2[0] | value2[1] << 8 )
                aggregator.append_datapoint(action.characteristic.value[0], "co2")
                characteristics.co2 = characteristics.co2 + " ppm"
            }
            if (oldState.vocIsChecked){
                characteristics.voc = (value2[2] | value2[3] << 8 )
                aggregator.append_datapoint(action.characteristic.value[0], "voc")
                characteristics.voc = characteristics.voc + " ppb"
            }
            state.set('characteristics', characteristics)
            break;

    }
    return state
}

function publish(oldState, action) {
    let state = oldState;
    state = state.set('isPublishing', !state.isPublishing)
    state = state.set('publishButtonStyle', "btn btn-danger btn-lg btn-nordic padded-row")
    state = state.set('publishButtonState', "Stop Publishing")
    logger.info("Publishing to IOTA Tangle...");
    state = state.set('interval', setInterval(action.func, action.value));
    state = state.set('counterInterval', setInterval(action.counterfunc, 1000));
    return state
}

function publishPacket(state){
    let packet = aggregator.compose_packet()
    dataPublisher.publish({
		time: Date.now(),
		data: packet,
	})
    console.log("Publishing packet:", packet)
    return state;
}

function clearPublishInterval(oldState, action) {
    clearInterval(oldState.interval)
    clearInterval(oldState.counterInterval)
    let state = oldState;
    state = state.set('isPublishing', !state.isPublishing)
    state = state.set('publishButtonStyle', "btn btn-primary btn-lg btn-nordic padded-row")
    state = state.set('publishButtonState', "Start Publishing")
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

function adapterRemoved(oldState, action){
    let state = oldState;
    logger.error("The system does not yet allow this function.... The adapter is still connected")
    if(oldState.interval != null){clearPublishInterval(state, action)}
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
        case menuActions.PUBLISH_PACKET:
            return publishPacket(state)
        case "SERIAL_PORT_DESELECTED":
            return adapterRemoved(state, action)
		default:
            return state;
    }

}
