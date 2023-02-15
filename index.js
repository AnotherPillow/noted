const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path');
const fs = require('fs');
const configPath = path.join(app.getPath('userData'), 'config.json');
let overrideConfig = false;

let config = require(configPath) || {}

if (!fs.existsSync(configPath) || overrideConfig || !config.sections)  {
    config = {
        background: '#FFFFFF',
        colour: '#000000',
        sections: {}
    }
    fs.writeFileSync(configPath, JSON.stringify(config));
}

var win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: __dirname + '/preload.js',
            nodeIntegration: true
        },
        //alwaysOnTop: true,
        skipTaskbar: false,
        frame: false,
        style: {
            zIndex: -1
        }
    })
    win.loadFile('renderer/index.html')

    win.on('closed', () => {
        win = null;
    });

    setTimeout(() => {
        win.webContents.send('conf', {config:config});
    }, 800)
}

app.on('ready', () => createWindow());

ipcMain.on('conf', (event, data) => {
    config = data.config;
    fs.writeFileSync(configPath, JSON.stringify(config));
})
ipcMain.on('close', (event, data) => {
    win.close();
    process.exit();
})
ipcMain.on('minimise', (event, data) => {
    win.minimize();
})
ipcMain.on('maximise', (event, data) => {
    if (win.isMaximized()) {
        win.unmaximize();
    } else {
        win.maximize();
    }
})