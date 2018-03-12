
import React from 'react';
//import PropTypes from 'prop-types';


import { bindActionCreators, getState } from 'redux';
import { connect } from 'react-redux';
import {logger} from 'nrfconnect/core';

import * as DeviceDetailsActions from '../actions/deviceDetailsActions';
import * as AdapterActions from '../actions/adapterActions';

import { traverseItems, findSelectedItem } from './../common/treeViewKeyNavigation';
import { getInstanceIds } from '../utils/api';

const NOTIFY = 1;
const INDICATE = 2;
let buttonClicked = 0;
const CCCD_UUID = "2902"

export class DeviceDetailsContainer extends React.PureComponent {

    constructor(props){
        super(props)
        this.buttonClicked = this.buttonClicked.bind(this)
        this.writeDescriptorButtonClicked = this.writeDescriptorButtonClicked.bind(this)
        this.onToggleNotify = this.onToggleNotify.bind(this)
        this.findCccdDescriptor = this.findCccdDescriptor.bind(this)
        this.isNotifying = this.isNotifying.bind(this)
    }

    static contextTypes = {
        store: React.PropTypes.object
    }

    findCccdDescriptor(children) {
        if (!children) {
            return undefined;
        }

        return children.find(child => child.uuid === CCCD_UUID);
    }

    isNotifying(cccdDescriptor) {
        if (!cccdDescriptor) {
            return false;
        }
    
        const valueArray = cccdDescriptor.value.toArray();
    
        if (valueArray.length < 2) {
            return false;
        }
    
        return ((valueArray[0] & (NOTIFY | INDICATE)) > 0);
    }

    onToggleNotify(characteristic) {
        const cccdDescriptor = this.findCccdDescriptor(characteristic.get("children")) //fiks hardkoding
        const isDescriptorNotifying = this.isNotifying(cccdDescriptor);
        const hasNotifyProperty = characteristic.properties.notify//this.props.item.properties.notify;
        const hasIndicateProperty = characteristic.properties.indicate//this.props.item.properties.indicate;

        if (cccdDescriptor === undefined) {
            return;
        }

        if (!hasNotifyProperty && !hasIndicateProperty) {
            return;
        }

        let cccdValue;
        logger.error(cccdDescriptor.value);
        if (!isDescriptorNotifying) {
            if (hasNotifyProperty) {
                cccdValue = NOTIFY;
            } else {
                cccdValue = INDICATE;
            }
        } else {
            cccdValue = 0;
        }

        const value = [cccdValue, 0];
        //this.props.onWriteDescriptor(this.cccdDescriptor, value);
        this.context.store.dispatch(DeviceDetailsActions.writeDescriptor(cccdDescriptor,value))
        console.log("weather3",JSON.stringify(characteristic,null,2))
    }

    writeDescriptorButtonClicked(){
        let state = this.context.store.getState()
        const deviceDetails = state.app.adapter.getIn(['adapters', state.app.adapter.selectedAdapterIndex, 'deviceDetails']);
        let deviceDetail = deviceDetails.devices.get("F8:1B:03:0B:46:5D.0");
        const children = deviceDetail.get("children")
        const weather = children.get("F8:1B:03:0B:46:5D.0.5")

        this.onToggleNotify(weather.get("children").get("F8:1B:03:0B:46:5D.0.5.6"))
    }

    buttonClicked() {
        if (buttonClicked === 0){

        }
        let state = this.context.store.getState()
        const deviceDetails = state.app.adapter.getIn(['adapters', state.app.adapter.selectedAdapterIndex, 'deviceDetails']);
        let deviceDetail = deviceDetails.devices.get("F8:1B:03:0B:46:5D.0");
        const children = deviceDetail.get("children")
        const weather = children.get("F8:1B:03:0B:46:5D.0.5")
        console.log(weather.get("children"))
    
        this.context.store.dispatch(DeviceDetailsActions.setAttributeExpanded(weather, !weather.expanded))
        console.log("weather2: ",JSON.stringify(weather,null,2))
    }
        

    render() {

        return(
            <div>
                <div><button onClick={this.buttonClicked}>expand attributes</button></div>
                <div><button onClick={this.writeDescriptorButtonClicked}>write descriptor</button></div>
            </div>
            
        );
    }

}


/*
const details = ({deviceDetails}) => {
    return (
        <div>
            {deviceDetails}
        </div>)
    }


function mapStateToProps(state) {
    console.log("mapStateToprops")
    const {
        adapter,
    } = state.app;

    const selectedAdapter = adapter.getIn(['adapters', adapter.selectedAdapterIndex]);

    if (!selectedAdapter) {
        return {};
    }

    return {
        deviceDetails: selectedAdapter.deviceDetails
    };
}


export default connect(
    mapStateToProps,
)(details)


*/

