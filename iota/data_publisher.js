var IOTA = require('iota.lib.js');
//require('./mam.web.js');
const pify = require('pify')
var iota = new IOTA({ provider: 'https://testnet140.tangle.works' });
console.log(iota.utils)
//let Mam = require('mam.client.js');
//import mamClient from 'mam.client.js/src/node'
//import { MAM, Merkle } from 'mam.client.js';
//console.log("mam: ",MAM, Merkle );

// Set Varibles
var debug = false; // Set to 'false' to publish data live
let uuid = 'thingy-02'; // Your device ID is here.
let secretKey = 'T9XKPHUAMYBIPVC'; // Your device's secret key here

// API end point
let endpoint = 'https://api.marketplace.tangle.works/newData'

// Random Key Generator
const keyGen = length => {
	var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9'
	var array = new Uint32Array(length)
	var values = window.crypto.getRandomValues(array)
	var result = new Array(length)
	for (var i = 0; i < length; i++) {
		result[i] = charset[values[i] % charset.length]
	}
	return result.join('')
}

let mam_initialized = false;
let mamState;
let mamKey = keyGen(81)

export const publish = async packet => {
	const seed = keyGen(81);
	const sideKey = keyGen(81);
	const start = 0;
	const security = 3;
	const count = 4;

	const tree0 = new Merkle(seed, start, count, security)
	const tree1 = new Merkle(seed, start + count, count, security)

	const mam = MAM.create({
		message: iota.utils.toTrytes(JSON.stringify(packet)),//'WCTC9D9DCDFAEADBNA'
		merkleTree: tree0,
		index: 0,
		nextRoot: tree1.root.hash.toString(),
		channelKey: mamKey
	})

	console.log(await attach(mam.trytes[0], tree0.root.hash.toString()))




	if (!debug) {
		// Push the MAM root to the demo DB
		let pushToDemo = await pushKeys(tree0.root.hash.toString(), mamKey)
		console.log(pushToDemo)
		// Change MAM key on each loop
		mamKey = keyGen(81)
	}



	// console.log("mam.nextKey: ", mam)
	// const parsed = MAM.parse({
	// 	key: mam.nextKey, 
	// 	message: mam.trytes
	// })
	// console.log("parsed: ",parsed)
}


/*
function init_mam() {
	//Mam = window.Mam;
	// Initialise MAM State
	mamState = Mam.init(iota, keyGen(81))
	mamKey = keyGen(81) // Set initial key
}

// Publish to tangle
export const publish = async packet => {
	if (!mam_initialized) {
		init_mam();
	}
	// Set channel mode & update key
	mamState = Mam.changeMode(mamState, 'restricted', mamKey)
	// Create Trytes
	var trytes = iota.utils.toTrytes(JSON.stringify(packet))
	// Get MAM payload
	var message = Mam.create(mamState, trytes)
	// Save new mamState
	mamState = message.state
	// Attach the payload.
	await Mam.attach(message.payload, message.address)
	console.log('Attached Message')
	console.log(packet, message.address, mamKey);

	if (!debug) {
		// Push the MAM root to the demo DB
		let pushToDemo = await pushKeys(message.root, mamKey)
		console.log(pushToDemo)
		// Change MAM key on each loop
		mamKey = keyGen(81)
	}
}
*/
const attach = async (trytes, root, depth = 6, mwm = 14) => {
	var transfers = [
		{
			address: root,
			value: 0,
			message: trytes
		}
	]
	// if (isClient) curl.overrideAttachToTangle(iota)
	try {
		let objs = await pify(iota.api.sendTransfer.bind(iota.api))(
			keyGen(81),
			depth,
			mwm,
			transfers
		)
		return objs
	} catch (e) {
		return console.error('failed to attach message:', '\n', e)
	}
}

// Push keys to market place.
const pushKeys = async (root, sidekey) => {
	const packet = {
		sidekey: sidekey,
		root: root,
		time: Date.now()
	}
	// Initiate Fetch Call
	var resp = await fetch(endpoint, {
		method: 'post',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ id: uuid, packet, sk: secretKey })
	})
	return resp.json()
}
