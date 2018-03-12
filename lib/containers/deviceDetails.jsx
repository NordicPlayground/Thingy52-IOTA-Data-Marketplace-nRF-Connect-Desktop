
import React from 'react';
//import PropTypes from 'prop-types';


import { bindActionCreators, getState } from 'redux';
import { connect } from 'react-redux';
import {logger} from 'nrfconnect/core';

import * as DeviceDetailsActions from '../actions/deviceDetailsActions';
import * as AdapterActions from '../actions/adapterActions';

import { traverseItems, findSelectedItem } from './../common/treeViewKeyNavigation';
import { getInstanceIds } from '../utils/api';



export class DeviceDetailsContainer extends React.PureComponent {

    constructor(props){
        super(props)
        this.buttonClicked = this.buttonClicked.bind(this)
    }

    static contextTypes = {
        store: React.PropTypes.object
    }
    componentDidMount () {
        

    }

    buttonClicked() {
        let state = this.context.store.getState()
        const deviceDetails = state.app.adapter.getIn(['adapters', state.app.adapter.selectedAdapterIndex, 'deviceDetails']);
        let deviceDetail = deviceDetails.devices.get("F8:1B:03:0B:46:5D.0");
        const children = deviceDetail.get("children")
        const weather = children.get("F8:1B:03:0B:46:5D.0.5")
        console.log(weather)
    
        dispatch(DeviceDetailsActions.setAttributeExpanded(weather, !weather.expanded))

        /*
        
        if(children){
            children.forEach(child1 => {
                console.log("layer 1: ", child1.uuid)
                if (child1.get("children")){
                    child1.get("children").forEach(child2 => {
                        if(child2.uuid)

                    })
                }

            })
        }
        */
    }
        

    render() {

        return(
            <div><button onClick={this.buttonClicked}>click me</button> Hello world</div>
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

