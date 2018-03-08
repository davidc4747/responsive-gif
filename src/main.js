const { app, BrowserWindow } = require('electron');

let win;
app.on('ready', function () {
    win = new BrowserWindow({
        width: 800,
        height: 600
    });


    win.loadURL(`file://${__dirname}/downloadgif/download.html`);

    // Open the DevTools.
    // win.webContents.openDevTools();
});