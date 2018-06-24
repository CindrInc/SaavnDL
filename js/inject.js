function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const ipc = require('electron').ipcRenderer;

let songs = [];

function scrapeSongsInfo() {
	let songJsons = $('.song-json');
	songs.length = 0;

	for(let i = 0; i < songJsons.length; i++) {
		try {
			songs.push(JSON.parse($(songJsons[i]).text()));
		} catch(error) {
			console.error(error);
			continue;
		}
		
	}
}

function playSong(song) {
	Player.playSong(song, 128);
}

function getCurrentSongUrl() {
	console.log("Current Song Url: " + Player.currentSongUrl);
	return Player.currentSongUrl;
}

async function sendSongForDownload(song) {
	Player.playSong(song, 128);

	await sleep(3000);

	console.log(song);

	ipc.send('download-song', {
		info: JSON.stringify(song),
		mp3Link: getCurrentSongUrl()
	});
}

async function downloadAllSongs() {
	console.log("Sending all downloads");
	console.log("Number of songs: " + songs.length);
	for(let i = 0; i < songs.length; i++) {
		sendSongForDownload(songs[i]);
		await sleep(3000);
	}
}


ipc.on('get-songs-info', () => {
	scrapeSongsInfo();
	console.log(songs);
	ipc.sendToHost('songs-info', songs);
});

ipc.on('download-song', (e, song) => {
	sendSongForDownload(song);
});

ipc.on('download-songs', function() {
	
	scrapeSongsInfo();
	downloadAllSongs();
})