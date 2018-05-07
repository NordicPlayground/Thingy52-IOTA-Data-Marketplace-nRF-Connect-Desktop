export const EXPANDED_PROP = 'EXPANDED_PROP';
export const CHECKBOX_CLICKED = 'CHECKBOX_CLICKED';

export const UPDATE_CHARACTERISTIC_VALUE = 'UPDATE_CHARACTERISTIC_VALUE';
export const PUBLISH = 'PUBLISH';
export const CLEAR_PUBLISH_INTERVAL = 'CLEAR_PUBLISH_INTERVAL';
export const INTERVAL_CHANGE = 'INTERVAL_CHANGE';
export const UUID_CHANGE = "UUID_CHANGE";
export const SECRETKEY_CHANGE = "SECRETKEY_CHANGE";
export const LOG_ADD_ENTRIES = "LOG_ADD_ENTRIES";
export const CLOSE_ABOUT = "CLOSE_ABOUT";
export const CONNEECTED_TO_THINGY = "CONNEECTED_TO_THINGY";


export function closeAboutDialog(){
	return {
		type: CLOSE_ABOUT,
	}
}

export function expandProp(){
    return {
        type: EXPANDED_PROP,
    }
}

export function connectedToThingy(thingy){
	return{
		type: CONNEECTED_TO_THINGY,
		thingy: thingy,
	}
}

export function handleChangeInterval(value){
	return {
		type: INTERVAL_CHANGE,
		value: value,
	}
}

export function handleChangeUUID(value){
	return {
		type: UUID_CHANGE,
		value: value,
	}
}

export function handleChangeSecretKey(value){
	return {
		type: SECRETKEY_CHANGE,
		value: value,
	}
}

export function clearPublishInterval(){
	return {
		type: CLEAR_PUBLISH_INTERVAL,
	}
}

export function publish(func, counterfunc, value){
	return {
		type: PUBLISH,
		func: func,
		counterfunc: counterfunc,
		value: value,
	}
}

export function checkboxIsChecked(value){
    return {
        type: CHECKBOX_CLICKED,
        checkBox: value,
    }
}

export function updateCharacteristicValue(characteristic){
	return {
		type: UPDATE_CHARACTERISTIC_VALUE,
		characteristic: characteristic,
	}
}