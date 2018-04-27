export const EXPANDED_PROP = 'EXPANDED_PROP';
export const CHECKBOX_CLICKED = 'CHECKBOX_CLICKED';

export const UPDATE_CHARACTERISTIC_VALUE = 'UPDATE_CHARACTERISTIC_VALUE';
export const PUBLISH = 'PUBLISH';
export const CLEAR_PUBLISH_INTERVAL = 'CLEAR_PUBLISH_INTERVAL';
export const INTERVAL_CHANGE = 'INTERVAL_CHANGE';

export function expandProp(){
    return {
        type: EXPANDED_PROP,
    }
}

export function handleChangeInterval(value){
	return {
		type: INTERVAL_CHANGE,
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