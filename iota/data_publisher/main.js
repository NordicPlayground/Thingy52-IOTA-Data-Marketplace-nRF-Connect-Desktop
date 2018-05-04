var fetch = require('node-fetch');
var crypto = require('crypto');
var Mam = require('./mam.node.js');
var IOTA = require('iota.lib.js');
var iota = new IOTA({ provider: 'https://testnet140.tangle.works' });

let endpoint = 'https://api.marketplace.tangle.works/newData';

const keyGen = length => {
	var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
	var values = crypto.randomBytes(length);
	var result = new Array(length);
	for (var i = 0; i < length; i++) {
		result[i] = charset[values[i] % charset.length];
	}
	return result.join('');
}

const publish = async (packet, seed, uuid, secret_key) => {
	if (seed === undefined) {
		seed = keyGen(81);
	}

	let mam_state = Mam.init(iota, seed);
	let side_key = keyGen(81);

	mam_state = Mam.changeMode(mam_state, 'restricted', side_key);
	var trytes = iota.utils.toTrytes(packet);
	var message = Mam.create(mam_state, trytes);

	console.log(message);

	await Mam.attach(message.payload, message.address);
	console.log('Attached Message');

	if (uuid !== uuid && uuid !== secret_key) {
		let pushToDemo = await pushKeys(message.root, side_key, uuid, secret_key);
		console.log(pushToDemo);
	} else {
		console.log("Not publishing to IDMP");
	}
}

const pushKeys = async (root, sidekey, uuid, secret_key) => {
	const packet = {
		sidekey: sidekey,
		root: root,
		time: Date.now()
	};
	var resp = await fetch(endpoint, {
		method: 'post',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ id: uuid, packet, sk: secretKey })
	});
	return resp.json();
}

async function main(argv) {
	var seed = undefined;
	var devid = undefined;
	var secret_key = undefined;
	var message = undefined;
	var next = undefined;
	var i = 1;

	// Compansate for the script name being sent to node.
	if (argv[0].endsWith('node')) {
		i = 2;
	}

	for (; i < argv.length; i++) {
		var token = argv[i];

		if (next === undefined) {
			if (token == '--seed' ||
			    token == '--devid' ||
			    token == '--secret-key') {
				next = token;
			} else {
				if (message === undefined) {
					message = token;
				} else {
					console.warn("Message is already specified (at " + token + ").")
				}
			}
		} else {
			if (next == '--seed') {
				seed = token;
			} else if (next == '--devid') {
				devid = token;
			} else if (next == '--secret-key') {
				secret_key = token;
			}
			next = undefined;
		}
	}

	if (message === undefined) {
		console.log("Missing required paramter message")
		return;
	}

	await publish(message, seed, devid, secret_key);
}

main(process.argv).then(() => console.log("Done"))
