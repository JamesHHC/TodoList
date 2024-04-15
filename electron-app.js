// GLOBAL VARIABLES /////////////////////////////////////////////////////////////////////////////////////////

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { contextBridge, ipcRenderer } = require('electron/renderer');
const path = require('node:path');
var Datastore = require('nedb')
  , db = new Datastore({ filename: './todoData', autoload: true });

// APP FUNCTIONALITY ////////////////////////////////////////////////////////////////////////////////////////

// Create app window
const createWindow = () => {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
		}
	});
	win.loadFile('todoApp.html');
}

// Quit app if all windows closed
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

// Run after process start
app.whenReady().then(() => {
	createWindow();
	// Open window if none are open
	app.on('activate', () => {
    	if (BrowserWindow.getAllWindows().length === 0) createWindow()
  	});
  	ipcMain.handle('testing', test);
  	ipcMain.handle('loadData', loadData);
  	ipcMain.handle('saveData', saveData);
  	ipcMain.handle('delData', delData);
});

// ADDITIONAL FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////

function test(event, arg) {
	console.log("Test:", arg);
}

function loadData() {
	console.log("Data loaded");
	return new Promise((resolve, reject) => {
		db.find({}, function (err, docs) {
			if (err) {
				console.error(err);
				resolve(null);
			}
			else resolve(docs);
		});
	});
}

function saveData(event, arg) {
	console.log("Data saved");
	db.insert(arg, function(err, newDoc) {
		if (err) console.error(err);
	});
}

function delData(event, arg) {
	console.log("Document deleted");
	db.remove({idn:arg}, {}, function (err, numRemoved) {
		if (err) console.error(err);
	});
}