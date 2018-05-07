const { spawn, spawnSync } = require('child_process');
const process = require('process');
const path = require('path');
const fs = require('fs');

let uuid = 'thingy-02';
let secretKey = 'T9XKPHUAMYBIPVC';

function uintToString(uintArray) {
    var encodedString = String.fromCharCode.apply(null, uintArray),
        decodedString = decodeURIComponent(escape(encodedString));
    return decodedString;
}

export function setUUID(value) {
	uuid = value;
	console.log("uuid changed to: ", value)
}

export function setSecretKey(value) {
	secretKey = value
	console.log("secret key changed to: ", value)
}

export const publish = async packet => {
	let args = [
		path.join(__dirname, 'data_publisher.js'),
		JSON.stringify(packet),
		'--devid', uuid,
		'--secret-key', secretKey,
	];
	console.log('Publishing...', args);
	let child = spawn('node', args);

	child.stdout.on('data', (chunk) => {
		console.log('stdout', uintToString(chunk));
	})
	child.stderr.on('data', (chunk) => {
		console.log('stderr', uintToString(chunk));
	})
	child.on('close', (code) => {
		if (code != 0) {
			console.log("Failed to publish, exited with code %i" % code);
		} else {
			console.log("Published");
		}
	});
}
