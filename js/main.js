const baseUrl = "https://www.saavn.com";
$(function() {

	const ipc = require('electron').ipcRenderer;

	const saavn = document.querySelector('webview');

	const $results = $('#results');
	const $search = $('#search');
	
	$('#searchForm').submit((e) => {
		e.preventDefault();
		let search = $.trim($('#search').val());
		if(search.includes(baseUrl)) {
			saavn.loadURL(search);
			$('#search').val('');
			saavn.addEventListener('did-finish-load', () => {
				console.log("Page loaded");

				saavn.openDevTools();
				saavn.send('download-songs');
			});
		}
	});



	
});
