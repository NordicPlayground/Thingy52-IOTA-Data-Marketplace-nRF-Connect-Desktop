/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import { List, Set, Record } from 'immutable';
import { combineReducers } from 'redux';

import { logger } from 'nrfconnect/core';

import * as apiHelper from '../utils/api';

import deviceDetails from './deviceDetailsReducer';
//import serverSetup from './serverSetupReducer';
//import security from './securityReducer';

import * as AdapterAction from '../actions/adapterActions';
import * as DeviceDetailsActions from '../actions/deviceDetailsActions';

//import * as ServerSetupActions from '../actions/serverSetupActions';
//import * as SecurityActions from '../actions/securityActions';

const DEFAULT_ADAPTER_STATUS = 'Select serial port';

const ImmutableRoot = Record({
    api: { adapters: [], selectedAdapter: null },
    adapters: List(),
    adapterStatus: DEFAULT_ADAPTER_STATUS,
    adapterIndicator: 'off',
    connectedDevice: '',
    versionInfo: null,
    deviceInfo: null,
    selectedAdapterIndex: null, // Index of selected adapter in .adapters (not api.adapters)
    autoConnUpdate: true,
    ignoredDeviceAddresses: Set(),
    errors: List(),
});


function getImmutableRoot() {
    return new ImmutableRoot();
}


function getSelectedAdapter(state) {
    return {
        adapter: state.getIn(['adapters', state.selectedAdapterIndex]),
        index: state.selectedAdapterIndex,
    };
}



function addAdapter(state, adapter) {
    state.api.adapters.push(adapter);
    return state.set('adapters', state.adapters.push(apiHelper.getImmutableAdapter(adapter)));
}

function removeAdapter(oldState, adapter) {
    let state = oldState;
    const adapterIndex = state.api.adapters.indexOf(adapter);

    if (adapterIndex === -1) {
        logger.error(`You removed an adapter I did not know about: ${adapter.adapterStatus.port}.`);
        return state;
    }

    state.api.adapters.splice(adapterIndex, 1);

    if (adapterIndex === state.selectedAdapterIndex) {
        state = state.set('adapterIndicator', 'off');
        state = state.set('selectedAdapterIndex', null);
        state = state.set('adapterStatus', DEFAULT_ADAPTER_STATUS);
        state = state.set('connectedDevice', '')
    } else if (adapterIndex < state.selectedAdapterIndex) {
        state = state.set('selectedAdapterIndex', state.selectedAdapterIndex - 1);
    }

    state = state.deleteIn(['adapters', adapterIndex]);
    return state;
}


function setLocalDeviceInfo(state, deviceInfo) {
    return state.set('deviceInfo', deviceInfo);
}

function openAdapter(state, adapter) {
    logger.info(`Opening adapter connected to ${adapter.state.port}`);

    return state.set('adapterStatus', adapter.state.port);
}

function adapterOpened(oldState, adapter, versionInfo) {
    let state = oldState;
    logger.info(`Adapter connected to ${adapter.state.port} opened`);

    // Since we maintain state.api.adapters and state.adapters simultaneously
    // we use adapter index from state.api.adapters to access the "same" adapter
    // in state.adapters
    const adapterIndex = state.api.adapters.indexOf(adapter);

    state.api.selectedAdapter = adapter;

    state = state.set('selectedAdapterIndex', adapterIndex);
    state = state.set('adapterStatus', adapter.state.port);
    state = state.set('adapterIndicator', 'on');
    state = state.set('versionInfo', versionInfo);

    return state;
}


function adapterStateChanged(state, adapter, adapterState) {
    const adapterIndex = state.api.adapters.indexOf(adapter);

    const immutableState = apiHelper.getImmutableAdapterState(adapterState);
    return state.setIn(['adapters', adapterIndex, 'state'], immutableState);
}
/*
function closeAdapter(oldState, adapter) {
    let state = oldState;
    state.api.selectedAdapter = null;

    const index = state.api.adapters.indexOf(adapter);
    const adapterExists = index !== -1;

    // The adapter may have been unplugged before close is called, and then
    // it will no longer exist in the adapters list
    if (adapterExists) {
        state = state.setIn(['adapters', index, 'isServerSetupApplied'], false);
        state = state.updateIn(['adapters', index, 'connectedDevices'], connectedDevices => connectedDevices.clear());
    }

    state = state.set('adapterIndicator', 'off');
    state = state.set('selectedAdapterIndex', null);
    state = state.set('adapterStatus', DEFAULT_ADAPTER_STATUS);
    state = state.set('versionInfo', null);
    state = state.set('deviceInfo', null);

    return state;
}

function adapterError(oldState, adapter, error) {
    let state = oldState;
    logger.error(`Error on adapter ${adapter.state.port}: ${error.message}`);
    logger.debug(error.description);

    state.api.selectedAdapter = null;
    state = state.set('adapterStatus', 'Error connecting');
    state = state.set('adapterIndicator', 'error');
    state = state.set('selectedAdapterIndex', null);
    state = state.set('errors', state.errors.push(error.message));

    return state;
}

*/
function adapterResetPerformed(oldState, adapter) {
    let state = oldState;
    logger.info(`Reset performed on adapter ${adapter.state.port}`);

    const { index } = getSelectedAdapter(state);
    if (index !== undefined && index !== null) {
        state = state.setIn(['adapters', index, 'isServerSetupApplied'], false);
        state = state.updateIn(['adapters', index, 'connectedDevices'], connectedDevices => connectedDevices.clear());
    }

    return state;
}


function adapterScanTimeout(state, adapter) {
    logger.info(`Scanning timed out on adapter ${adapter.state.port}`);
    return state;
}

function adapterAdvertisementTimeout(state, adapter) {
    logger.info(`Advertisement timed out on adapter ${adapter.state.port}`);
    return state;
}

function deviceConnect(state) {
    logger.info('Connecting to device');
    return state;
}

function deviceConnected(oldState, device) {
    let state = oldState;
    if (device.address === undefined) {
        return state;
    }

    logger.info(`Connected to device ${device.address}`);
    const Ldevice = apiHelper.getImmutableDevice(device);
    const { index } = getSelectedAdapter(state);

    state = state.updateIn(['adapters', index, 'connectedDevices'],
        connectedDevices => connectedDevices.set(Ldevice.instanceId, Ldevice));
    
    state = state.set('connectedDevice',device.address)

    const bonded = state.getIn(['adapters', index, 'security', 'bondStore', device.address]);
    if (bonded) {
        state = state.setIn(['adapters', index, 'connectedDevices', Ldevice.instanceId, 'bonded'], true);
    }
    return state;
}


function deviceConnectCanceled(state) {
    logger.info('Connect canceled');
    return state;
}
/*
function connectedDeviceUpdated(oldState, device) {
    let state = oldState;
    if (device.address === undefined) {
        return state;
    }

    logger.info(`Connection parameters updated for device ${device.address}: interval ${device.minConnectionInterval}ms, timeout ${device.connectionSupervisionTimeout}ms, latency: ${device.slaveLatency}`);

    const { index } = getSelectedAdapter(state);

    const nodePath = ['adapters', index, 'connectedDevices', device.instanceId];
    state = state.setIn(nodePath.concat('minConnectionInterval'), device.minConnectionInterval);
    state = state.setIn(nodePath.concat('maxConnectionInterval'), device.maxConnectionInterval);
    state = state.setIn(nodePath.concat('slaveLatency'), device.slaveLatency);
    state = state.setIn(nodePath.concat('connectionSupervisionTimeout'), device.connectionSupervisionTimeout);
    return state;
}
*/
function deviceDisconnected(state, device, reason) {
    logger.info(`Disconnected from device ${device.address}, reason: ${reason}`);
    const { index } = getSelectedAdapter(state);
    return state.deleteIn(['adapters', index, 'connectedDevices', device.instanceId]);
}
/*
function deviceInitiatePairing(state) {
    logger.info('Pairing initiated');
    return state;
}

function deviceSecurityChanged(state, device, parameters) {
    if (device.address === undefined) {
        return state;
    }

    const { index } = getSelectedAdapter(state);

    logger.info(`Security updated, mode:${parameters.securityMode}, level:${parameters.securityLevel} `);

    return state.setIn(['adapters', index, 'connectedDevices', device.instanceId, 'securityMode'], parameters.securityMode)
                .setIn(['adapters', index, 'connectedDevices', device.instanceId, 'securityLevel'], parameters.securityLevel);
}

function disableDeviceEvents(state, deviceAddress) {
    return state.set('ignoredDeviceAddresses', state.ignoredDeviceAddresses.add(deviceAddress));
}

function enableDeviceEvents(state, deviceAddress) {
    return state.set('ignoredDeviceAddresses', state.ignoredDeviceAddresses.remove(deviceAddress));
}
*/
function discoveredDeviceName(state, device, value) {
    if (!value) {
        return state;
    }

    if (device.address === undefined) {
        return state;
    }

    const nameBuffer = new Buffer(value);
    const name = nameBuffer.toString('utf8');

    const { index } = getSelectedAdapter(state);

    return state.setIn(['adapters', index, 'connectedDevices', device.instanceId, 'name'], name);
}
/*
function addError(state, error) {
    logger.error(error.message || error || 'Error does not contain a message! Something is wrong!');

    if (error.description) {
        logger.debug(error.description);
    }

    return state.update('errors', errors => errors.push(error.message));
}

function toggleAutoConnUpdate(state) {
    return state.set('autoConnUpdate', !state.autoConnUpdate);
}

function addBondInfo(state, device) {
    const { index } = getSelectedAdapter(state);
    return state.setIn(['adapters', index, 'connectedDevices', device.instanceId, 'bonded'], true);
}

function deleteBondInfo(state) {
    const { index } = getSelectedAdapter(state);
    const devices = state.getIn(['adapters', index, 'connectedDevices']);

    return devices.reduce((prevState, device) => (
        prevState.setIn(['adapters', index, 'connectedDevices', device.instanceId, 'bonded'], false)
    ), state);
}

function serverSetupApplied(state) {
    const { index } = getSelectedAdapter(state);

    return state.setIn(['adapters', index, 'isServerSetupApplied'], true);
}

*/

export default function (oldState = getImmutableRoot(), action) {
    let state = oldState;
    const adapterSubReducers = combineReducers({
        deviceDetails,
    });


    if (state.selectedAdapterIndex !== null) {

        const selectedAdapter = state.getIn(['adapters', state.selectedAdapterIndex]);

        if (selectedAdapter) {
            const newSubReducerStates = adapterSubReducers(
                {
                    deviceDetails: selectedAdapter.deviceDetails,
                }, action);

            state = state.mergeIn(['adapters', state.selectedAdapterIndex], newSubReducerStates);
        }
    }
    switch (action.type) {

        case AdapterAction.ADAPTER_OPEN:
            return openAdapter(state, action.adapter);
        case AdapterAction.ADAPTER_OPENED: // used 
            return adapterOpened(state, action.adapter, action.versionInfo);
        case AdapterAction.ADAPTER_CLOSED:
            return closeAdapter(state, action.adapter);
        case AdapterAction.ADAPTER_ADDED:  //used
            return addAdapter(state, action.adapter);
        case AdapterAction.ADAPTER_REMOVED:
            return removeAdapter(state, action.adapter);
        case AdapterAction.ADAPTER_ERROR:
            return adapterError(state, action.adapter, action.error);
        case AdapterAction.ADAPTER_STATE_CHANGED:
            return adapterStateChanged(state, action.adapter, action.state);
        case AdapterAction.ADAPTER_RESET_PERFORMED:    //used 
            return adapterResetPerformed(state, action.adapter);
        case AdapterAction.ADAPTER_SCAN_TIMEOUT:
            return adapterScanTimeout(state, action.adapter);
        case AdapterAction.ADAPTER_ADVERTISEMENT_TIMEOUT:
            return adapterAdvertisementTimeout(state, action.adapter);
        case AdapterAction.ADAPTER_LOCAL_DEVICE_INFO_LOADED:
            return setLocalDeviceInfo(state, action.deviceInfo);
        case AdapterAction.ERROR_OCCURED:
            return addError(state, action.error);
        case AdapterAction.DEVICE_CONNECT:
            return deviceConnect(state, action.device);
        case AdapterAction.DEVICE_CONNECTED:
            return deviceConnected(state, action.device);
        case AdapterAction.DEVICE_CONNECT_CANCELED:
            return deviceConnectCanceled(state);
        case AdapterAction.DEVICE_DISCONNECTED:
            return deviceDisconnected(state, action.device, action.reason);
        case AdapterAction.DEVICE_INITIATE_PAIRING:
            return deviceInitiatePairing(state, action.device);
        case AdapterAction.DEVICE_CONNECTION_PARAMS_UPDATED:
            return connectedDeviceUpdated(state, action.device);
        //case AdapterAction.DEVICE_SECURITY_CHANGED:
        //    return deviceSecurityChanged(state, action.device, action.parameters);
        case AdapterAction.DEVICE_TOGGLE_AUTO_CONN_UPDATE:
            return toggleAutoConnUpdate(state);
        case AdapterAction.DEVICE_ADD_BOND_INFO:
            return addBondInfo(state, action.device, action.parameters);
        case AdapterAction.DEVICE_DISABLE_EVENTS:
            return disableDeviceEvents(state, action.deviceAddress);
        case AdapterAction.DEVICE_ENABLE_EVENTS:
            return enableDeviceEvents(state, action.deviceAddress);
        //case SecurityActions.SECURITY_DELETE_BOND_INFO:
        //    return deleteBondInfo(state);
        case DeviceDetailsActions.DISCOVERED_DEVICE_NAME:
            return discoveredDeviceName(state, action.device, action.value);
        //case ServerSetupActions.APPLIED_SERVER:
        //    return serverSetupApplied(state);
        default:
            return state;

    }
}
