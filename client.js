
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

let songJsons = $('.song-json');
let songs = [];

for(let i = 0; i < songJsons.length; i++) {
	songs.push(JSON.parse($(songJsons[i]).text()));
}

function playSong(song) {
	Player.playSong(song);
}

function getCurrentSongUrl() {
	console.log("Current Song Url: " + Player.currentSongUrl);
	return Player.currentSongUrl;
}

async function sendSongForDownload(song) {
	Player.playSong(song, 128);

	await sleep(3000);

	console.log(song);

	$.post('http://localhost:3000/song', {
		info: JSON.stringify(song),
		mp3Link: getCurrentSongUrl()
	});
}

async function downloadAllSongs() {
	for(let i = 0; i < songs.length; i++) {
		sendSongForDownload(songs[i]);
		await sleep(3000);
	}
}