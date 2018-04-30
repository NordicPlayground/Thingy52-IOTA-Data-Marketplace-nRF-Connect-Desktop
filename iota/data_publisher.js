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

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

let python_base = getUserHome() + '/.nrfconnect-apps/local/pc-nrfconnect-iota/iota/data_publisher/';
python_base = path.resolve(python_base);

try {
	var stats = fs.lstatSync(python_base);

	if (!stats.isDirectory()) {
		throw "Not a directory";
	}

} catch (e) {
	console.log("Could not find " + python_base + ". " + e)
	python_base = '~/.nrfconnect-apps/node_modules/pc-nrfconnect-iota/iota/data_publisher';
}

try {
	var stats = fs.lstatSync(python_base + '/env/bin/python');
} catch (e) {
	console.log("Installing python app")
	let ret = spawnSync('python3', [
		python_base + '/setup.py'
	]);

	console.log(ret);

	console.log(uintToString(ret.stdout));
	console.log(uintToString(ret.stderr));
	console.log(ret.status);
}

export const publish = async packet => {
	let cmd = ''
	let args = [
		python_base + '/main.py',
		JSON.stringify(packet),
		'--devid', uuid,
		'--secret-key', secretKey,
	];
	console.log('Publishing...', args);
	let child = spawn(python_base + '/env/bin/python', args);

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

publish({
	time: Date.now(),
	data: {
		temperature: 30,
		pressure: 1000,
	}
});
