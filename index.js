const { app, BrowserWindow } = require('electron');
const path = require('path');
const config = require('./config.json');

function createWindow() {
    const win = new BrowserWindow({
        width: config.simulation.width,
        height: config.simulation.height,
        webPreferences: {
            preload: path.join(__dirname, 'webview/preload.js')
        }
    });
    win.setContentSize(config.simulation.width, config.simulation.height, false);
    win.loadFile('webview/index.html');
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});