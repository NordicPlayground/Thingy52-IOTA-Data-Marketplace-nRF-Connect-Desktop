
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
        //console.log(state)
        const deviceDetails = state.app.adapter.getIn(['adapters', state.app.adapter.selectedAdapterIndex, 'deviceDetails']);
        console.log("deviceDetails: ",deviceDetails.devices)
        let devicedetail = deviceDetails.devices.get("F8:1B:03:0B:46:5D.0");
        console.log("devicedetail: ", devicedetail)
        
        const children = devicedetail.get("children")
        if(children){
            console.log("child0")
            children.forEach(child1 => {
                if (child1.get("children")){
                    console.log("child1")
                    child1.get("children").forEach(child2 => {
                        if (child2.get("children")){
                            console.log("child2", child2.uuid)
                            child2.get("children").forEach(child3 => {
                                console.log("child uuid: ", child3.uuid)
                            })
                        }
                    })
                }

            })
        }


        let foundCurrent = false;
        
        // eslint-disable-next-line no-restricted-syntax
        for (const item of traverseItems(deviceDetails, false)) {
            //console.log(item)
            if (item.children){
                //console.log("items with children: ",item.children)
                let child = item.children.find(child => child.uuid === "2902")
                //console.log("children with uuid 2902",child)
            }
            

        }
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

