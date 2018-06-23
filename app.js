const electron = require('electron');
const {app, BrowserWindow, session, Menu} = electron;
const {download} = require('electron-dl');
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


app.on('ready', function() {
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
	mainWindow = new BrowserWindow({
		height: 600,
		width: 800,
		autoHideMenuBar: true,
		backgroundColor: '#FAFAFA'
	});

	mainWindow.loadURL(appDirectory + 'index.html');

	mainWindow.on('closed', function() {
		app.quit();
	});
	
});

ipc.on('download-song', (e, song) => {
	let info = JSON.parse(song.info);
	console.log("Title: " + info.title);
});