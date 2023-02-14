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
})();

let num;
let width;
let speed;

let picoffset;


net.createServer(socket => {
	console.log("client connected");

	socket.on('data', data => {
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
	});

	socket.on('end', data => {
		console.log(data);
	});

	socket.on('error', data => {
		console.log(data);
	});
}).listen(3000);

async function resetCounter() {
	counter = 0;
	return await resetHttpGifId();
}

async function post(data) {
	return await fetch(`http://${ip}/post`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
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
async function sendHttpGif(PicNum, PicWidth, PicOffset, PicID, PicSpeed, PicData) {
	return await post({
		Command: 'Draw/SendHttpGif',
		PicNum,
		PicWidth,
		PicOffset,
		PicID,
		PicSpeed,
		PicData
	})
}