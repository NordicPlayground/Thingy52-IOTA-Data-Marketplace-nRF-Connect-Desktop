
import React from 'react';
import PropTypes from 'prop-types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {logger} from 'nrfconnect/core';

import * as DeviceDetailsActions from '../actions/deviceDetailsActions';
import * as AdapterActions from '../actions/adapterActions';

import { traverseItems, findSelectedItem } from './../common/treeViewKeyNavigation';
import { getInstanceIds } from '../utils/api';


/*
class DeviceDetailsContainer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }


    
    onClick(){
        console.log("deviceDetails: ", this.props); 
    }
    render() {
        const {
            deviceDetails,
        } = this.props;
        return(
            <div><button onClick={this.onClick}>Click bar</button></div>
        );
    }

}

*/

const details = ({deviceDetails}) => {
    return (
        <div>
            {deviceDetails}
        </div>)
    }
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


