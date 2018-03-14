
import React from 'react';
//import PropTypes from 'prop-types';


import { bindActionCreators, getState } from 'redux';
import { connect } from 'react-redux';
import { logger } from 'nrfconnect/core';

import * as DeviceDetailsActions from '../actions/deviceDetailsActions';
import * as AdapterActions from '../actions/adapterActions';

import { traverseItems, findSelectedItem } from './../common/treeViewKeyNavigation';
import { getInstanceIds } from '../utils/api';

const NOTIFY = 1;
const INDICATE = 2;
let buttonClicked = 0;
const CCCD_UUID = "2902"

export class DeviceDetailsContainer extends React.PureComponent {

    constructor(props) {
        super(props)
        this.buttonClicked = this.buttonClicked.bind(this)
        this.writeDescriptorButtonClicked = this.writeDescriptorButtonClicked.bind(this)
        this.onToggleNotify = this.onToggleNotify.bind(this)
        this.findCccdDescriptor = this.findCccdDescriptor.bind(this)
        this.isNotifying = this.isNotifying.bind(this)
        this.asyncFunction = this.asyncFunction.bind(this)
        this.toggleMotionCheckboxChange = this.toggleMotionCheckboxChange.bind(this)
        this.toggleWeatherCheckboxChange = this.toggleWeatherCheckboxChange.bind(this)

        this.state = {
            weatherIsChecked: false,
            motionIsChecked: false

        };
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
        this.context.store.dispatch(DeviceDetailsActions.writeDescriptor(cccdDescriptor, value))
        console.log("weather3", JSON.stringify(characteristic, null, 2))
    }

    writeDescriptorButtonClicked() {
        let state = this.context.store.getState()
        const deviceDetails = state.app.adapter.getIn(['adapters', state.app.adapter.selectedAdapterIndex, 'deviceDetails']);
        console.log("selectedAdapterIndex: ", state.app.adapter.selectedAdapterIndex)
        let thingy = deviceDetails.devices.get("F8:1B:03:0B:46:5D.0");
        const sensorServices = thingy.get("children")

        /*
        sensorServices.forEach(service => {

            //console.log("service: ",service)
            
            //console.log("service")
            console.log(service.get("children"))
            if (service.get("children")){
                let subServices = service.get("children")
                subServices.forEach(subService => {
                    console.log("subservice: ", JSON.stringify(subService,null,2))              
                    if (subService.get("children")) {
                        let subSubServices = subService.get("children")
                        subSubServices.forEach(subSubService => {
                            console.log(JSON.stringify(subSubService,null,2))
                        })
                    }
                })
            }
        })
        */

        console.log(JSON.stringify(thingy.get("children"), null, 2))
        /*
        let state = this.context.store.getState()
        console.log("App state: ",JSON.stringify(state.app,null,2))
        const deviceDetails = state.app.adapter.getIn(['adapters', state.app.adapter.selectedAdapterIndex, 'deviceDetails']);
        let deviceDetail = deviceDetails.devices.get("F8:1B:03:0B:46:5D.0");
        const children = deviceDetail.get("children")
        const weather = children.get("F8:1B:03:0B:46:5D.0.5")

        this.onToggleNotify(weather.get("children").get("F8:1B:03:0B:46:5D.0.5.6"))*/
    }

    asyncFunction(item, callback) {
        setTimeout(() => {
            this.context.store.dispatch(DeviceDetailsActions.setAttributeExpanded(item, !item.expanded));
            callback();
        }, 2000)
    }

    buttonClicked() {
        if (buttonClicked === 0) {

        }
        let state = this.context.store.getState()
        const deviceDetails = state.app.adapter.getIn(['adapters', state.app.adapter.selectedAdapterIndex, 'deviceDetails']);
        let thingy = deviceDetails.devices.get("F8:1B:03:0B:46:5D.0");
        //let thingy = deviceDetails.devices.forEach(device => {
        //    console.log("device: ", JSON.stringify(device.get("children"),null,2))
        //})

        const sensorServices = thingy.get("children")
        console.log("sensorservices: ", JSON.stringify(sensorServices, null,2))
        //const weather = sensorServices.get("F8:1B:03:0B:46:5D.0.5")
        //const weather = sensorServices.get("children")

        let requests = sensorServices.map(service => {
            return new Promise(resolve => {
                
                this.asyncFunction(service, resolve);
                console.log("promise!")
            })
        })


        Promise.all(requests).then(() => console.log("sensorServices: ", JSON.stringify(sensorServices, null, 2)))

        //this.context.store.dispatch(DeviceDetailsActions.setAttributeExpanded(weather, !weather.expanded))
        //console.log("weather2: ",JSON.stringify(sensorServices,null,2))

    }

    toggleWeatherCheckboxChange(){
        if (!this.state.weatherIsChecked){

            let state = this.context.store.getState()
            const deviceDetails = state.app.adapter.getIn(['adapters', state.app.adapter.selectedAdapterIndex, 'deviceDetails']);
            let thingy = deviceDetails.devices.get("F8:1B:03:0B:46:5D.0");
            const sensorServices = thingy.get("children")
            const weather = sensorServices.get("F8:1B:03:0B:46:5D.0.5")
            this.context.store.dispatch(DeviceDetailsActions.setAttributeExpanded(weather, !weather.expanded));

            console.log("weather expanded")
            this.setState({weatherIsChecked: true})
        }
        else {
            this.setState({weatherIsChecked: false})
        }   
    }

    toggleMotionCheckboxChange(){
        if (!this.state.motionIsChecked){

            let state = this.context.store.getState()
            const deviceDetails = state.app.adapter.getIn(['adapters', state.app.adapter.selectedAdapterIndex, 'deviceDetails']);
            let thingy = deviceDetails.devices.get("F8:1B:03:0B:46:5D.0");
            const sensorServices = thingy.get("children")
            const motion = sensorServices.get("F8:1B:03:0B:46:5D.0.6")
            this.context.store.dispatch(DeviceDetailsActions.setAttributeExpanded(motion, !motion.expanded));

            console.log("motion expanded")
            this.setState({motioIsChecked: true})
        }
        else {
            this.setState({motionIsChecked: false})
        }   
    }
    render() {



        return (
            <div>
                <div><button onClick={this.buttonClicked}>expand attributes</button></div>
                <div><button onClick={this.writeDescriptorButtonClicked}>write descriptor</button></div>
                <div>
                    <input
                        type="checkbox"
                        checked={this.state.WeatherIsChecked}
                        onChange={this.toggleWeatherCheckboxChange}
                    /> Weather
                    <input
                        type="checkbox"
                        checked={this.state.MotionIsChecked}
                        onChange={this.toggleMotionCheckboxChange}
                    /> Motion
                </div>
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

