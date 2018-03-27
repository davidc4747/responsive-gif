const { app, BrowserWindow, ipcMain } = require('electron');


/* Default Settings */
let settings = {
    canvas: {
        width: 1600,
        height: 900
    },
    duration: 8000,
    repeatDelay: 1000,
    easing: 'Power2.easeInOut',
    backgroundColor: '#0F1C3F'
};



/* Open Main Window */
let win;
app.on('ready', function () {
    win = new BrowserWindow({
        x: 0,
        y: 240,
        width: 850,
        height: 600
    });

    // Hide Menu
    win.setMenu(null);

    // Load page
    win.loadURL(`file://${__dirname}/downloadgif/download.html`);

    // Open the DevTools.
    win.webContents.openDevTools();
    win.webContents.on('did-finish-load', function () {
        win.webContents.send("settings-changed", settings);
    });
});

ipcMain.on("update-settings", function (event, args) {
    console.log("updating settings", args);
});