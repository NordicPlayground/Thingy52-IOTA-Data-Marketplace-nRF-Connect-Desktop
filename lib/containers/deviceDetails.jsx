
import React from 'react';
import PropTypes from 'prop-types';

import { OrderedMap } from 'immutable';
import { bindActionCreators, getState } from 'redux';
import { connect } from 'react-redux';
import { logger } from 'nrfconnect/core';
import { Panel, Form, FormGroup, ControlLabel, FormControl, InputGroup, Checkbox } from 'react-bootstrap';

import * as DeviceDetailsActions from '../actions/deviceDetailsActions';
import * as AdapterActions from '../actions/adapterActions';

import { traverseItems, findSelectedItem } from './../common/treeViewKeyNavigation';
import { getInstanceIds } from '../utils/api';

const NOTIFY = 1;
const INDICATE = 2;
const CCCD_UUID = "2902"

class DeviceDetailsContainer extends React.PureComponent {

    constructor(props) {
        super(props)
        this.g = this.g.bind(this)
        /*
        this.toggleCharacteristicWrite = this.toggleCharacteristicWrite.bind(this)
        this.onToggleNotify = this.onToggleNotify.bind(this)
        this.findCccdDescriptor = this.findCccdDescriptor.bind(this)
        this.isNotifying = this.isNotifying.bind(this)
        this.checkBoxClicked = this.checkBoxClicked.bind(this)
        this.expandAttribute = this.expandAttribute.bind(this)
        this.getSensorServices = this.getSensorServices.bind(this)
        this.handleUpdateChange = this.handleUpdateChange.bind(this)
        this.publish = this.publish.bind(this)
        this.getAttributeValue = this.getAttributeValue.bind(this)
        this.navn = this.navn.bind(this)
        this.checkIfConnected = this.checkIfConnected.bind(this)
        this.thingyIsConnected = this.thingyIsConnected.bind(this)
        
        this.state = {
            temperatureIsChecked: this.props.temperatureIsChecked,
            pressureIsChecked: this.props.pressureIsChecked,
            humidityIsChecked: this.props.humidityIschecked,
            publishInterval: this.props.publishInterval,
            isPublishing: this.props.isPublishing,
            interval: this.props.interval,
            isExpanded: this.props.isExpanded,
            isConnected: this.props.isConnected,
            isConnectedText: this.props.isConnectedText,
            adapter: this.props.adapter,
            adapterState: this.props.selectedAdapter.state,
            selectedComponent: this.props.selectedComponent,
            connectedDevices: this.props.connectedDevice,
            deviceDetails: this.props.deviceDetails,
            deviceInfo: this.props.deviceInfo,
        }
        */
    }

    /*
    
    checkIfConnected(){
        
        if(this.thingyIsConnected()){
            this.expandAttribute(".5")
            this.setState({isConnected: true, isConnectedText: ""})
        }

    }


    componentDidMount(){
         this.state = {
            
        };
        setInterval(this.checkIfConnected , 3000);
    }
    
    
    thingyIsConnected(){
        let connected = false
        let state = this.context.store.getState()
        if (state.app.adapter.connectedDevice != ''){
            connected = true
        }
        return connected
    }


    findCccdDescriptor(children) {
        if (!children) { return undefined; }
        return children.find(child => child.uuid === CCCD_UUID);
    }

    isNotifying(cccdDescriptor) {
        if (!cccdDescriptor) { return false; }
        const valueArray = cccdDescriptor.value.toArray();
        if (valueArray.length < 2) { return false; }
        return ((valueArray[0] & (NOTIFY | INDICATE)) > 0);
    }

    onToggleNotify(characteristic) {
        const cccdDescriptor = this.findCccdDescriptor(characteristic.get("children")) //fiks hardkoding
        const isDescriptorNotifying = this.isNotifying(cccdDescriptor);
        const hasNotifyProperty = characteristic.properties.notify//this.props.item.properties.notify;
        const hasIndicateProperty = characteristic.properties.indicate//this.props.item.properties.indicate;

        if (cccdDescriptor === undefined) { return; }
        if (!hasNotifyProperty && !hasIndicateProperty) { return; }

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
    }

    getAttributeValue(attributeID, characteristicID){ //
        
        let state = this.context.store.getState()
        const deviceKey = state.app.adapter.connectedDevice + ".0"
        const service = this.getSensorServices().get(deviceKey + attributeID)
        return service.get("children").get(deviceKey + attributeID + characteristicID).value        

    }    

    navn(){
        let temperature, pressure, humidity;

        if (this.state.temperatureIsChecked){
            temperature = this.getAttributeValue(".5", ".6")
        }
        if (this.state.pressureIsChecked){
            pressure = this.getAttributeValue(".5", ".7")
        }
        if (this.state.humidityIsChecked){
            humidity = this.getAttributeValue(".5", ".8")
        }
        
        console.log("temperature: ", temperature, "pressue: ", pressure, "humidity: ", humidity)
    }

    publish(){
        if(this.state.isExpanded){
            if(this.state.isPublishing){
                clearInterval(this.state.interval);
                this.setState({isPublishing: false})
            }else{
                this.setState({interval: setInterval(this.navn, this.state.publishInterval*1000)})
                this.setState({isPublishing: true})
            }  
        } 
    }


    getSensorServices() {
        let state = this.context.store.getState()
        const deviceKey = state.app.adapter.connectedDevice + ".0"

        const deviceDetails = state.app.adapter.getIn(['adapters', state.app.adapter.selectedAdapterIndex, 'deviceDetails']);
        const thingy = deviceDetails.devices.get(deviceKey);
        const sensorServices = thingy.get("children")
        return sensorServices;
    }

    toggleCharacteristicWrite(attributeID, characteristicID) {
        let state = this.context.store.getState()
        const deviceKey = state.app.adapter.connectedDevice + ".0"
        const service = this.getSensorServices().get(deviceKey + attributeID)
        this.onToggleNotify(service.get("children").get(deviceKey + attributeID + characteristicID))
    }


    checkBoxClicked(event) {
        if(this.props.isExpanded){
            switch (event.target.value) {
                case "5.6":
                this.props.set('temperatureIsChecked')
                    this.setState({ temperatureIsChecked: !this.state.temperatureIsChecked })
                    this.toggleCharacteristicWrite(".5", ".6")
                    break;
                case "5.7":
                    this.setState({ pressureIsChecked: !this.state.pressureIsChecked })
                    this.toggleCharacteristicWrite(".5", ".7")
                    break;
                case "5.8":
                    this.setState({ humidityIsChecked: !this.state.humidityIsChecked })
                    this.toggleCharacteristicWrite(".5", ".8")
                    break;
            }
        }
        
    }


    expandAttribute(attributeID) {
        if(this.thingyIsConnected()){
            let state = this.context.store.getState()
            const deviceKey = state.app.adapter.connectedDevice + ".0"

            const deviceDetails = state.app.adapter.getIn(['adapters', state.app.adapter.selectedAdapterIndex, 'deviceDetails'])
            const thingy = deviceDetails.devices.get(deviceKey)
            const sensorServices = thingy.get("children")
            const attribute = sensorServices.get(deviceKey + attributeID)
            this.context.store.dispatch(DeviceDetailsActions.setAttributeExpanded(attribute, true))
            this.setState({isExpanded: true})    
        }
        
        //console.log("sensorServices: ", JSON.stringify(sensorServices,null,2))    
    }

    handleUpdateChange(event){
        this.props.set('publishInterval',event.target.value)
    }
    
    */
    g(){
        if(this.props.connectedDevices != null){
            return (<div>{this.props.connectedDevices.map((item,i) => <li key={i}>Test</li>)} </div>)
        }
        
    }

    render() {
        return(
            <div>
                {this.g()}
            </div>
        )
    };
}
        /*
        // Styles
        const settingsPanelStyle = {
            width: "100%",
            maxWidth: "800px",
            background: "white",
        }
        const leftPanelStyle = {
            width: "50%"
        }
        const rightPanelStyle = {
            width: "50%"
        }
        const statusContainerStyle = {
        }
        const statusStyle = {
            //borderRight: "1px solid lightgrey"
        }
        const nextPublishStyle = {
        }

        return (
            <Panel ckassName="row" style={settingsPanelStyle}>
                <h3><b> Settings </b></h3>
                <hr />
                <div className="col-md-6 col-md-auto" style={leftPanelStyle}>
                    
                    <div className="container-fluid">
                        <div className="row" style={statusContainerStyle}>
                            <div className="col-md-6 col-md-auto" style={statusStyle}>
                                <b>Status</b><br />
                                Not publishing
                            </div>
                            <div className="col-md-6 col-md-auto" style={nextPublishStyle}>
                                <b>Next Publish</b><br />
                                Never
                            </div>
                        </div>
                    </div>

                    <hr />
                    
                    <Form>
                        <FormGroup>
                            <ControlLabel>How often should the data be published?</ControlLabel>
                            <InputGroup class="input-group-lg">
                                <InputGroup.Addon>Every</InputGroup.Addon>
                                <FormControl type="text" value={this.props.publishInterval} onChange={this.handleUpdateChange} />
                                <InputGroup.Addon>minutes</InputGroup.Addon>
                            </InputGroup>
                        </FormGroup>
                    </Form>
                    
                </div>

                <div className="col-md-6 col-md-auto" style={rightPanelStyle}>

                    <FormGroup>
                        <ControlLabel>Select what sensor data should be published</ControlLabel>
                        <Checkbox value="5.6" checked={this.props.temperatureIsChecked} onChange={this.checkBoxClicked} >Temperature</Checkbox>
                        <Checkbox value="5.7" checked={this.props.pressureIsChecked} onChange={this.checkBoxClicked} >Pressure</Checkbox>
                        <Checkbox value="5.8" checked={this.props.humidityIschecked} onChange={this.checkBoxClicked} >Humidity</Checkbox>
                       
                    </FormGroup>

                    <hr />

                    <button
                        title="Clear list (Alt+C)"
                        type="button"
                        className="btn btn-primary btn-lg btn-nordic padded-row"
                        onClick={this.publish}
                    >Start publishing</button>

                </div>

                <div>Thingy is {this.state.isConnectedText} connected</div>

            </Panel>
        );
    }

}


*/

DeviceDetailsContainer.propTypes = {
    adapterState: PropTypes.object,
    selectedComponent: PropTypes.string,
    deviceDetails: PropTypes.object,
    deviceInfo: PropTypes.object,
    connectedDevices: PropTypes.object,
}

DeviceDetailsContainer.defaultProps = {
    temperatureIsChecked: false,
    pressureIsChecked: false,
    humidityIsChecked: false,
    publishInterval: 10,
    isPublishing: false,
    interval: null,
    isExpanded: false,
    isConnected: false,
    isConnectedText: "not",
    adapter: null,
};

function mapStateToProps(state) {
    const {
        adapter,
    } = state.app;

    const selectedAdapter = adapter.getIn(['adapters', adapter.selectedAdapterIndex]);

    if (!selectedAdapter) {
        return {};
    }

    return {
        adapterState: selectedAdapter.state,
        selectedComponent: (selectedAdapter.deviceDetails
            && selectedAdapter.deviceDetails.selectedComponent),
        connectedDevices: selectedAdapter.connectedDevices,
        deviceDetails: selectedAdapter.deviceDetails,
        deviceInfo: adapter.deviceInfo,
    };
}


export default connect(mapStateToProps)(DeviceDetailsContainer)






