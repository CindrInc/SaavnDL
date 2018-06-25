const baseUrl = "https://www.saavn.com";
const ipc = require('electron').ipcRenderer;

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

$(function() {

	let queue = [];

	const saavn = document.querySelector('webview');
	const $search = $('#search');

	const elements = {
		song: {
			$rowDiv: $('<div class="song-row"></div>'),
			$thumbnailDiv: $('<div class="song-column thumbnail"></div>'),
			$thumbnailImage: $('<img src="">'),
			$mainInfoDiv: $('<div class="song-column main-info"></div>'),
			$title: $('<h2 class="title"></h2>'),
			$album: $('<h3 class="album"></h3>'),
			$music: $('<h3 class="music"></h3>'),
			$singersDiv: $('<div class="song-column singers"></div>'),
			$artists: $('<h3 class="artists"></h3>'),
			$downloadStatusDiv: $('<div class="song-column download-status"></div>'),
			$downloadButton: $('<span class="download-button"><i class="fas fa-download download-button"></i></span>'),
			$progressBar: $('<div class="progressBar-border"><div class="progressBar">0%</div></div>')
		}
	}


	saavn.setAudioMuted(true);
	
	$('#searchForm').submit((e) => {
		e.preventDefault();
		let search = $.trim($('#search').val());
		if(!search.includes(baseUrl)) {
			search = baseUrl + "/search/" + encodeURI(search);
		}
		saavn.loadURL(search);
		$('#search').val('');
		$('#results').html("");
		saavn.addEventListener('did-finish-load', () => {
			console.log("Page loaded");

			// saavn.openDevTools();
			saavn.send('get-songs-info');
		});
	});

	saavn.addEventListener('ipc-message', event => {
		if(event.channel === 'songs-info') {
			let songs = event.args[0];
			for(let i = 0; i < songs.length; i++) {
				createSongElement(songs[i]);
			}
		}
	});
	ipc.on('download-start', (e, song_id) => {
		let $song_element = $('div[song_id="' + song_id + '"]');
		let $downloadStatusDiv = $song_element.find('div.download-status');
		$downloadStatusDiv.html("");
		$downloadStatusDiv.append(elements.song.$progressBar.clone());
	});
	ipc.on('download-progress', (e, progress_info) => {
		updateDownloadProgress(progress_info.song_id, progress_info.progress.percent);
	});

	function createSongElement(song) {
		let $song = elements.song.$rowDiv.clone();

		$song.attr('song_info', JSON.stringify(song));
		$song.attr('song_id', song.e_songid);

		let image_url = song.image_url.split('-');
		image_url.pop();
		image_url = image_url.join('-') + "-50x50.jpg";
		let $thumbnailImage = elements.song.$thumbnailImage.clone();
		$thumbnailImage.attr('src', image_url);
		let $thumbnailDiv = elements.song.$thumbnailDiv.clone();
		$thumbnailDiv.append($thumbnailImage);

		$song.append($thumbnailDiv);

		let $title = elements.song.$title.clone();
		$title.text(song.title);
		let $album = elements.song.$album.clone();
		$album.text(song.album);
		let $music = elements.song.$music.clone();
		$music.text("by " + song.music);

		let $mainInfoDiv = elements.song.$mainInfoDiv.clone();
		$mainInfoDiv.append($title);
		$mainInfoDiv.append($album);
		$mainInfoDiv.append($music);

		$song.append($mainInfoDiv);

		let $artists = elements.song.$artists.clone();
		let artists = song.singers.split(', ');
		if(artists.length > 3) {
			artists.length = 3;
			artists = artists.join(', ');
			artists += ", etc...";
		} else {
			artists = artists.join(', ');
		}
		$artists.text(artists);

		let $singersDiv = elements.song.$singersDiv.clone();
		$singersDiv.append($artists);

		$song.append($singersDiv);

		let $downloadButton = elements.song.$downloadButton.clone();
		$downloadButton.click(function(e) {
			e.preventDefault();
			let song_info = JSON.parse($(this).parent().parent().attr('song_info'));
			queue.push(song_info);
			
		});

		let $downloadStatusDiv = elements.song.$downloadStatusDiv.clone();
		$downloadStatusDiv.append($downloadButton);

		$song.append($downloadStatusDiv);

		$('#results').append($song);

	}

	function updateDownloadProgress(song_id, percent) {
		let $progressBar = $('div[song_id="' + song_id + '"]').find('div.progressBar');
		percent = percent * 100;
		$progressBar.css('width', percent + "%");
		$progressBar.text(percent + "%");
	}


	setInterval(function() {
		if(queue.length > 0) {
			saavn.send('download-song', queue.shift());
		}
	}, 3000);



	
});
