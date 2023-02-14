const net = require('net');

if (process.argv.length != 3) {
	console.log("marcus skärp dig, gör rätt");
	process.exit();
}

let ip = process.argv[2];
let counter = 0;

let initalBuffer = new Array(64 * 64).fill([86, 34, 112]);

(async () => {

	console.log("hej marcus, jag ser att du ska hacka");

	await resetCounter();
	await sendGIF(Buffer.from(initalBuffer.flat()), 1, 64, 0);

	//recursive();
	

	//console.log(Buffer.from(buffer).toString('base64'))
})();

/*
let prev = Date.now();
async function recursive() {

	let promise = new Promise(function(resolve, reject) {    
		setTimeout(() => {
			console.log("> " + (Date.now() - prev));
			prev = Date.now();
	
			buff = new Array(64 * 64).fill([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]);
			sendBuffer();
			resolve();
		}, 200);
	});

	await promise;

	recursive();
}
*/

let num;
let width;
let speed;

let picoffset;


net.createServer(socket => {
	console.log("client connected");

	socket.on('data', data => {
		//console.log(data);

		if(data.length == 4){
			num = data.readUInt8();
			width = data.readUint8(1);
			speed = data.readUint16LE(2);
			
			picoffset = 0;

			console.log("first data recived");
			console.log({num, width, speed});
			return;
		}

		if(num > picoffset){
			console.log("got picture: " + picoffset);
			sendGIF(data, num, width, speed);
		}

		//console.log({buff2, num, width, speed});

		//sendGIF(buff2, num, width, speed);
		//buff = new Array(64 * 64).fill([Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]);
		//sendBuffer();
	});

	socket.on('end', data => {
		console.log(data);
	});

	socket.on('error', data => {
		console.log(data);
	});
}).listen(3000);

async function resetCounter() {
	//console.log("reset");

	counter = 0;
	return await resetHttpGifId();
}

async function post(data) {
	//console.log("post");
	await fetch(`http://${ip}/post`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
	
	//console.log(await response.text());
}

async function sendGIF(buffer, num, width, speed) {
	if (counter >= 1000) await resetCounter();

	console.log("c: " + counter);

	return await sendHttpGif(
		num, // PicNum
		width, // PicWidth
		picoffset++, // PicOffset
		counter++, // PicID
		speed, // PicSpeed
		buffer.toString('base64') // PicData
	);
}

//reset
async function resetHttpGifId() {
	return await post({
		Command: 'Draw/ResetHttpGifId'
	})
}

//send image
async function sendHttpGif(picNum, picWidth, picOffset, picId, picSpeed, picData) {
	return await post({
		Command: 'Draw/SendHttpGif',
		PicNum: picNum,
		PicWidth: picWidth,
		PicOffset: picOffset,
		PicID: picId,
		PicSpeed: picSpeed,
		PicData: picData
	})
}