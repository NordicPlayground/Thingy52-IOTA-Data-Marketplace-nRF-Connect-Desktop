
import React from 'react';
import PropTypes from 'prop-types';


const Box = ({isVisible}) =>{
	if(isVisible){
		return(<div>Hello world</div>)
	}
	return (<div></div>)
}

Box.propTypes = {
	isVisible: PropTypes.bool.isRequired
}

export default Box