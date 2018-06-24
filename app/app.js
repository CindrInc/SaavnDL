const electron = require('electron');
const download = require('download');
const id3 = require('node-id3');
const fs = require('fs');

const {app, BrowserWindow, session, Menu} = electron;
const ipc = electron.ipcMain;


console.log("Start!");

const appDirectory = 'file://' + __dirname + '/';
const baseUrl = "http://saavn.com";
const menuTemplate = [
	{
		label: 'Electron',
		submenu: [
			{
				label: 'About Electron',
				selector: 'orderFrontStandardAboutPanel:'
			},
			{
				type: 'separator'
			},
			{
				label: 'Services',
				submenu: []
			},
			{
				type: 'separator'
			},
			{
				label: 'Hide Electron',
				accelerator: 'Command+H',
				selector: 'hide:'
			},
			{
				label: 'Hide Others',
				accelerator: 'Command+Shift+H',
				selector: 'hideOtherApplications:'
			},
			{
				label: 'Show All',
				selector: 'unhideAllApplications:'
			},
			{
				type: 'separator'
			},
			{
				label: 'Quit',
				accelerator: 'Command+Q',
				click: function() { app.quit(); }
			},
		]
	},
	{
		label: 'Edit',
		submenu: [
			{
				label: 'Undo',
				accelerator: 'Command+Z',
				selector: 'undo:'
			},
			{
				label: 'Redo',
				accelerator: 'Shift+Command+Z',
				selector: 'redo:'
			},
			{
				type: 'separator'
			},
			{
				label: 'Cut',
				accelerator: 'Command+X',
				selector: 'cut:'
			},
			{
				label: 'Copy',
				accelerator: 'Command+C',
				selector: 'copy:'
			},
			{
				label: 'Paste',
				accelerator: 'Command+V',
				selector: 'paste:'
			},
			{
				label: 'Select All',
				accelerator: 'Command+A',
				selector: 'selectAll:'
			},
		]
	},
	{
		label: 'View',
		submenu: [
			{role: 'reload'},
			{role: 'forcereload'},
			{role: 'toggledevtools'},
			{type: 'separator'},
			{role: 'resetzoom'},
			{role: 'zoomin'},
			{role: 'zoomout'},
			{type: 'separator'},
			{role: 'togglefullscreen'}
		]
	},
	{
		label: 'Window',
		submenu: [
			{
				label: 'Minimize',
				accelerator: 'Command+M',
				selector: 'performMiniaturize:'
			},
			{
				label: 'Close',
				accelerator: 'Command+W',
				selector: 'performClose:'
			},
			{
				type: 'separator'
			},
			{
				label: 'Bring All to Front',
				selector: 'arrangeInFront:'
			},
		]
	},
	{
		label: 'Help',
		submenu: []
	}
];
if (process.platform === 'darwin') {
	menuTemplate.unshift({
		label: app.getName(),
		submenu: [
		{role: 'about'},
		{type: 'separator'},
		{role: 'services', submenu: []},
		{type: 'separator'},
		{role: 'hide'},
		{role: 'hideothers'},
		{role: 'unhide'},
		{type: 'separator'},
		{role: 'quit'}
		]
	});
}


let mainWindow;

app.on('ready', function() {
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
	mainWindow = new BrowserWindow({
		height: 600,
		width: 860,
		autoHideMenuBar: true,
		backgroundColor: '#FAFAFA'
	});

	mainWindow.loadURL(appDirectory + 'index.html');

	mainWindow.on('closed', function() {
		app.quit();
	});
	
});

ipc.on('download-song', (e, song) => {
	let mp3Link = song.mp3Link;
	let info = JSON.parse(song.info);
	let song_id = info.e_songid;

	let tempName = info.music + " - " + info.title;

	let artworkName = tempName + ".jpg";
	let mp3Name = tempName + ".mp3";

	let songsFolder = './songs/';
	let artworkFolder = './artwork/';

	mainWindow.webContents.send('download-start', song_id);
	download(mp3Link, songsFolder, {
		filename: mp3Name
	})
	.on('downloadProgress', progress => {

		/**
		 * progress object example:
		 * {
		 * 		percent: 0.1,
		 * 		transferred: 1024,
		 * 		total: 10240
		 * }
		 */

		// console.log("Percentage download of " + mp3Name + ": " + progress.percent);
		// mainWindow.setProgressBar(progress.percent);
		mainWindow.webContents.send('download-progress', {
			song_id: song_id,
			progress: progress
		});
	})
	.then(() => {
		console.log("Downloaded: " + mp3Name);

		download(info.image_url, artworkFolder, {
			filename: artworkName
		}).then(() => {
			console.log("Downloaded artwork: " + artworkName);

			let file = songsFolder + mp3Name;
			let tags = {
				artist: info.singers,
				title: info.title,
				album: info.album,
				date: parseInt(info.year),
				length: parseInt(info.duration),
				publisher: info.label,
				comment: {
					language: "eng",
					text: "Track Link: " + info.tiny_url
				},
				APIC: artworkFolder + artworkName
			}
			id3.write(tags, file, function(err) {
				if(err) {
					throw err;
				} else {
					console.log("File Fixed: " + mp3Name);

					fs.unlink(artworkFolder + artworkName, (err) => {
						if (err) {
							throw err;
						} else {
							console.log("Artwork deleted: " + artworkName);
						}
					})
				}
			})
		});
	}).catch((err) => console.log(err));
});

ipc.on('songs-info', (e, songs) => {
	console.log("Song 1: " + songs[0].title);
});