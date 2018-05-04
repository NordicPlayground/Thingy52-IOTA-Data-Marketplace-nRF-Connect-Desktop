
import React from 'react';
import PropTypes from 'prop-types';

import { OrderedMap } from 'immutable';
import { bindActionCreators, getState } from 'redux';
import { connect } from 'react-redux';
import { logger } from 'nrfconnect/core';
import { Panel, Form, FormGroup, ControlLabel, FormControl, InputGroup, Checkbox } from 'react-bootstrap';

import * as dataPublisher from '../../iota/data_publisher';
import * as DeviceDetailsActions from '../actions/deviceDetailsActions';
import * as AdapterActions from '../actions/adapterActions';
import * as MenuActions from '../actions/menuActions';

import AboutDialogComponent from '../components/aboutDialog';

import { traverseItems, findSelectedItem } from './../common/treeViewKeyNavigation';
import { getInstanceIds } from '../utils/api';

const NOTIFY = 1;
const INDICATE = 2;
const CCCD_UUID = "2902"

class DeviceDetailsContainer extends React.PureComponent {

    constructor(props) {
        super(props)
        this.expandAttribute = this.expandAttribute.bind(this)

        this.toggleCharacteristicWrite = this.toggleCharacteristicWrite.bind(this)
        this.onToggleNotify = this.onToggleNotify.bind(this)
        this.findCccdDescriptor = this.findCccdDescriptor.bind(this)
        this.isNotifying = this.isNotifying.bind(this)
        this.checkBoxClicked = this.checkBoxClicked.bind(this)

        this.handleInputChange = this.handleInputChange.bind(this)
        this.publish = this.publish.bind(this)
        this.publishClick = this.publishClick.bind(this)
        this.getAttributeValue = this.getAttributeValue.bind(this)
        this.counter = this.counter.bind(this)

        this.state = {
            publishInterval: 1,
            counter: 0,
            counterInterval: null,
            buttonState: "Start Publishing",
            uuid: "thingy-02",
            secretKey: "T9XKPHUAMYBIPVC",
            gasExpanded: false,

        };
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
        const cccdDescriptor = this.findCccdDescriptor(characteristic.get("children"))
        const isDescriptorNotifying = this.isNotifying(cccdDescriptor);
        const hasNotifyProperty = characteristic.properties.notify//this.props.item.properties.notify;
        const hasIndicateProperty = characteristic.properties.indicate//this.props.item.properties.indicate;

        if (cccdDescriptor === undefined) { return; }
        if (!hasNotifyProperty && !hasIndicateProperty) { return; }

        let cccdValue;
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
        this.props.writeDescriptor(cccdDescriptor, value)
    }

    getAttributeValue(attributeID, characteristicID) {
        const service = this.props.sensorServices.get(this.props.deviceKey + attributeID)
        return service.get("children").get(this.props.deviceKey + attributeID + characteristicID).value

    }

    publish() {
        let packet = {
            time: Date.now(),
            data: {
                temperature: "",
                pressure: "",
                humidity: "",
                co2: "",
                voc: ""
            }
        }
        if (this.props.temperatureIsChecked) { packet.data.temperature = this.props.characteristics.temperature }
        if (this.props.pressureIsChecked)    { packet.data.pressure = this.props.characteristics.pressure }
        if (this.props.humidityIsChecked)    { packet.data.humidity = this.props.characteristics.humidity }
        if (this.props.co2IsChecked)         { packet.data.co2 = this.props.characteristics.co2 }
        if (this.props.vocIsChecked)         { packet.data.voc = this.props.characteristics.voc }
        console.log("Publishing packet:", packet)
        logger.info("Published packet!");
        dataPublisher.publish(packet)
    }

    counter() {
        if (this.state.counter == 0) { this.setState({ counter: this.state.publishInterval * 60 }) }
        let value = this.state.counter - 1
        this.setState({ counter: value })
    }

    publishClick() {
        if (this.props.isExpanded) {
            if (this.props.isPublishing) {
                this.props.clearPublishInterval();
                this.setState({ buttonState: "Start Publishing" })
            } else {
                this.publish();
                this.props.setPublishInterval(this.publish, this.counter, this.state.publishInterval * 60000)
                this.state.counter = this.state.publishInterval * 60
                this.setState({ buttonState: "Stop Publishing" })
            }
        }
    }

    handleInputChange(event) {
        switch (event.target.id) {
            case "interval":
                this.setState({ publishInterval: event.target.value });
                this.props.handleChangeInterval(this.state.publishInterval);
                break;
            case "uuid":
                this.setState({ uuid: event.target.value });
                this.props.handleChangeUUID(this.state.uuid);
                dataPublisher.setUUID(this.props.uuid);
                break;
            case "secretKey":
                this.setState({ secretKey: event.target.value });
                this.props.handleChangeSecretKey(this.state.secretKey);
                dataPublisher.setSecretKey(this.props.secretKey);
                break;

        }
    }

    toggleCharacteristicWrite(attributeID, characteristicID) {

        const service = this.props.sensorServices.get(this.props.deviceKey + attributeID)
        this.onToggleNotify(service.get("children").get(this.props.deviceKey + attributeID + characteristicID))
    }


    checkBoxClicked(event) {
        //console.log("thingy: ",JSON.stringify(this.props.sensorServices,null,2))
        if (this.props.isExpanded) {

            switch (event.target.value) {
                case "5.6":
                    this.props.checkboxIsChecked("temperature")
                    this.toggleCharacteristicWrite(".5", ".2")
                    break;
                case "5.7":
                    this.props.checkboxIsChecked("pressure")
                    this.toggleCharacteristicWrite(".5", ".3")

                    break;
                case "5.8":
                    this.props.checkboxIsChecked("humidity")
                    this.toggleCharacteristicWrite(".5", ".4")
                    break;
                case "5.9-co2":
                    if (!this.props.vocIsChecked) { //co2 and voc values comes from the same array, toggle write only when 
                        this.toggleCharacteristicWrite(".5", ".5")
                    }
                    //this.expandAttribute(".5.5")
                    this.props.checkboxIsChecked("co2")
                    break;
                case "5.9-voc":
                    if (!this.props.co2IsChecked) {
                        this.toggleCharacteristicWrite(".5", ".5")
                    }
                    //this.expandAttribute(".5.5")
                    this.props.checkboxIsChecked("voc")
                    break;
            }
        }

    }

    expandAttribute(attributeID) {
        let thingy = this.props.thingy
        let sensorServices = this.props.sensorServices
        if (sensorServices) {
            const attribute = sensorServices.get(this.props.deviceKey + attributeID)
            //console.log(sensorServices)
            //console.log("inside expand")
            if (attribute && !this.props.isExpanded) {
                this.props.setAttributeExpanded(attribute, true)
                this.props.expandProp()
            }
            //console.log("sensorServices inside expandAttributes",JSON.stringify(sensorServices,null,2))
            if (attribute && this.props.isExpanded && !this.props.gasExpanded) {
                console.log("expanding GAS")
                console.log("gas attribute: ", JSON.stringify(sensorServices.get(this.props.deviceKey + ".5.5"),null,2))
                this.props.setAttributeExpanded(sensorServices.get(this.props.deviceKey + ".5.5"), true)
                this.props.expandProp()
            }


        }
        //console.log("sensorServices: ", JSON.stringify(sensorServices,null,2))  
    }

    render() {
        if (!this.props.isExpanded) {
            this.expandAttribute(".5")
        }
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
        const checkboxContainerStyle = {
            width: "100%",
        }
        const checkboxLabelStyle = {
            marginTop: "10px",
            marginBottom: "10px",
        }

        return (
            <Panel ckassName="row" style={settingsPanelStyle}>
                
                <h3><b> Settings </b></h3>
                <hr />
                <AboutDialogComponent hideDialog={this.props.hideDialog} closeAboutDioalog={this.props.closeAboutDioalog} />
                <div className="col-md-6 col-md-auto" style={leftPanelStyle}>

                    <div className="container-fluid">
                        <div className="row" style={statusContainerStyle}>
                            <div className="col-md-6 col-md-auto" style={statusStyle}>
                                <b>Status</b><br />
                                <div>Connected to :{this.props.deviceKey}</div>
                                <div>Publishing: {this.props.isPublishing}</div>
                            </div>
                            <div className="col-md-6 col-md-auto" style={nextPublishStyle}>
                                <b>Next Publish</b><br />
                                {this.state.counter}s
                            </div>
                        </div>
                    </div>

                    <hr />

                    <Form>
                        <FormGroup>
                            <ControlLabel>How often should the data be published?</ControlLabel>
                            <InputGroup class="input-group-lg">
                                <InputGroup.Addon>Every</InputGroup.Addon>
                                <FormControl type="text" id="interval" value={this.state.publishInterval} onChange={this.handleInputChange} />
                                <InputGroup.Addon>minutes</InputGroup.Addon>
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <InputGroup.Addon>Device ID</InputGroup.Addon>
                            <FormControl type="text" id="uuid" value={this.state.uuid} onChange={this.handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <InputGroup.Addon>secretKey</InputGroup.Addon>
                            <FormControl type="text" id="secretKey" value={this.state.secretKey} onChange={this.handleInputChange} />
                        </FormGroup>
                    </Form>

                </div>

                <div className="col-md-6 col-md-auto" style={rightPanelStyle}>

                    <FormGroup>
                        <ControlLabel>Select what sensor data should be published</ControlLabel>
                        <div className="row" style={checkboxContainerStyle}>
                            <Checkbox
                                className="col-md-6 col-md-auto"
                                value="5.6"
                                checked={this.props.temperatureIsChecked}
                                onChange={this.checkBoxClicked}
                            >
                                Temperature
                            </Checkbox>
                            <div className="col-md-6 col-md-auto" style={checkboxLabelStyle} >
                                {this.props.characteristics.temperature} °C
                            </div>

                        </div>

                        <div className="row" style={checkboxContainerStyle}>
                            <Checkbox
                                className="col-md-6 col-md-auto"
                                value="5.7"
                                checked={this.props.pressureIsChecked}
                                onChange={this.checkBoxClicked}
                            >
                                Pressure
                            </Checkbox>
                            <div className="col-md-6 col-md-auto" style={checkboxLabelStyle} >
                                {this.props.characteristics.pressure} hPa
                            </div>
                        </div>

                        <div className="row" style={checkboxContainerStyle}>
                            <Checkbox
                                className="col-md-6 col-md-auto"
                                value="5.8"
                                checked={this.props.humidityIsChecked}
                                onChange={this.checkBoxClicked}
                            >
                                Humidity
                            </Checkbox>
                            <div className="col-md-6 col-md-auto" style={checkboxLabelStyle} >
                                {this.props.characteristics.humidity}%
                            </div>
                        </div>

                        <div className="row" style={checkboxContainerStyle}>
                            <Checkbox
                                className="col-md-6 col-md-auto"
                                value="5.9-co2"
                                checked={this.props.co2IsChecked}
                                onChange={this.checkBoxClicked}
                            >
                                CO2
                            </Checkbox>
                            <div className="col-md-6 col-md-auto" style={checkboxLabelStyle} >
                                {this.props.characteristics.co2}ppm
                            </div>
                        </div>

                        <div className="row" style={checkboxContainerStyle}>
                            <Checkbox
                                className="col-md-6 col-md-auto"
                                value="5.9-voc"
                                checked={this.props.vocIsChecked}
                                onChange={this.checkBoxClicked}
                            >
                                VOC
                            </Checkbox>
                            <div className="col-md-6 col-md-auto" style={checkboxLabelStyle} >
                                {this.props.characteristics.voc}ppb
                            </div>
                        </div>

                    </FormGroup>

                    <hr />

                    <button
                        title="Clear list (Alt+C)"
                        type="button"
                        className="btn btn-primary btn-lg btn-nordic padded-row"
                        onClick={this.publishClick}
                    >{this.state.buttonState}</button>

                </div>
            </Panel>
        );
    }

}


DeviceDetailsContainer.propTypes = {
    deviceKey: PropTypes.string,
    deviceDetails: PropTypes.object,
    thingy: PropTypes.object,
    sensorServices: PropTypes.object,
    temperatureIsChecked: PropTypes.bool,
    pressureIsChecked: PropTypes.bool,
    humidityIsChecked: PropTypes.bool,
    co2IsChecked: PropTypes.bool,
    voCIsChecked: PropTypes.bool,
    publishInterval: PropTypes.number,
    isPublishing: PropTypes.bool,
    interval: PropTypes.object,
    isExpanded: PropTypes.bool,
    characteristics: PropTypes.object,
    uuid: PropTypes.string,
    secretKey: PropTypes.string,
    hideDialog: PropTypes.bool,
}

DeviceDetailsContainer.defaultProps = {

};

function mapStateToProps(state) {
    const {
        adapter,
        menu,
    } = state.app;

    let selectedAdapter = adapter.getIn(['adapters', adapter.selectedAdapterIndex]);

    let deviceKey = state.app.adapter.connectedDevice + ".0"
    let deviceDetails = null
    let thingy = null
    let sensorServices = null

    if (deviceKey != ".0") {
        deviceDetails = state.app.adapter.getIn(['adapters', state.app.adapter.selectedAdapterIndex, 'deviceDetails']);
        thingy = deviceDetails.devices.get(deviceKey);
        sensorServices = thingy.get("children")
    }

    if (!selectedAdapter) {
        return {
            characteristics: { temperature: null, pressure: null, humidity: null },
            temperatureIsChecked: menu.temperatureIsChecked,
            pressureIsChecked: menu.pressureIsChecked,
            humidityIsChecked: menu.humidityIsChecked,
            publishInterval: menu.publishInterval,
            uuid: menu.uuid,
            secretKey: menu.secretKey,
            hideDialog: menu.hideDialog,
        };
    }
    return {
        deviceKey: deviceKey,
        deviceDetails: deviceDetails,
        thingy: thingy,
        sensorServices: sensorServices,
        isPublishing: menu.isPublishing,
        interval: menu.interval,
        isExpanded: menu.isExpanded,
        characteristics: menu.characteristics,
        temperatureIsChecked: menu.temperatureIsChecked,
        pressureIsChecked: menu.pressureIsChecked,
        humidityIsChecked: menu.humidityIsChecked,
        publishInterval: menu.publishInterval,
        uuid: menu.uuid,
        secretKey: menu.secretKey,
        hideDialog: menu.hideDialog,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setAttributeExpanded: (attribute, value) => { dispatch(DeviceDetailsActions.setAttributeExpanded(attribute, value)) },
        expandProp: () => { dispatch(MenuActions.expandProp()) },
        writeDescriptor: (cccdDescriptor, value) => { dispatch(DeviceDetailsActions.writeDescriptor(cccdDescriptor, value)) },
        checkboxIsChecked: (value) => { dispatch(MenuActions.checkboxIsChecked(value)) },
        setPublishInterval: (func, counterfunc, value) => { dispatch(MenuActions.publish(func, counterfunc, value)) },
        clearPublishInterval: () => { dispatch(MenuActions.clearPublishInterval()) },
        handleChangeInterval: (value) => { dispatch(MenuActions.handleChangeInterval(value)) },
        handleChangeUUID: (value) => { dispatch(MenuActions.handleChangeUUID(value)) },
        handleChangeSecretKey: (value) => { dispatch(MenuActions.handleChangeSecretKey(value)) }, 
        closeAboutDioalog: () => { dispatch(MenuActions.closeAboutDialog()) }
        
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceDetailsContainer)






