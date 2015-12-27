var app = require('app'); // Module to control application life.
var BrowserWindow = require('browser-window'); // Module to create native browser window.
var ipc = require('ipc');
var ESI = require('electron-single-instance');

// Windows: Only ONE single App Instance possible
ESI.ensureSingleInstance('MyPlayer');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;
var appIsReady = null;

// path to music file to load
// on startup. init is false
global.loadOnStartup = false;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
	if (process.platform != 'darwin') {
		app.quit();
	}
});

if (process.platform == 'win32') {
	// path to music file to load
	// user opens the app with a file
	// windows Only
	global.loadOnStartup = process.argv[2];
}

/**
 * Event: User OS wants to use the application to open a file
 * @author Robert Agthe <robert@scriptshit.de
 * @param  {[type]} event [description]
 * @return {[type]} [description]
 */
app.on("open-file", function(event, path) {
	event.preventDefault();

	// path to music file to load
	// user opens the app with a file
	global.loadOnStartup = path;

	// app runs, but no windows open
	if (!mainWindow && appIsReady) {
		// create new window and listen on ready
		createMainPlayerWindow().on('did-finish-load', function() {
			// when window ready, open a file
			mainWindow.webContents.send('open-file', path);
		});
	}
	// a window exists and is ready loaded
	else if (mainWindow && appIsReady) {
		// just fire open-file event!
		mainWindow.webContents.send('open-file', path);
	}
});

var createMainPlayerWindow = function() {
	appIsReady = true;

	// Create the app window
	mainWindow = new BrowserWindow({
		width: 600,
		height: 200,
		center: true,
		resizable: false,
		title: "MyPlayer",
		"always-on-top": true,
		debug: true,
		"web-preferences": {
			"overlay-scrollbars": false
		}
	});

	// and load the index.html of the app.
	mainWindow.loadUrl('file://' + __dirname + '/index.html');

	// Open the devtools.
	//mainWindow.openDevTools();

	// Emitted when the window is closed.
	mainWindow.on('closed', function() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
	return mainWindow;
};

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', createMainPlayerWindow);
