import React from 'react';
import PropTypes from 'prop-types'

import { bindActionCreators, getState } from 'redux';
import { connect } from 'react-redux';
import { logger } from 'nrfconnect/core';
import { Panel, Form, FormGroup, ControlLabel, FormControl, InputGroup, Checkbox } from 'react-bootstrap';

import selectedDevice from '../components/selectedDevice'

const isConnected = (connectedDevice) =>{
	if (connectedDevice != ''){
		return true
	}
	else{
		return false
	}
}


const mapStateToProps = (state, props) => {
	return {
		isVisible: isConnected(state.app.adapter.connectedDevice)
	}
}

const test = connect (mapStateToProps)(selectedDevice)

export default test