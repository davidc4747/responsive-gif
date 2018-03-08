const path = require('path');
const { remote, ipcRenderer } = require('electron');
const BrowserWindow = remote.BrowserWindow;


let gifWindow;


// When Clicked
let createBtn = document.querySelector('.create');
createBtn.addEventListener('click', function () {
    // Open new window
    gifWindow = new BrowserWindow({
        parent: remote.getCurrentWindow(),

        // backgroundColor: '#0F1C3F',
        width: 800,
        height: 450,
        show: false,
        // alwaysOnTop: true, 
        // frame: false,
        // center: true,
    });

    // Open the DevTools.
    // gifWindow.webContents.openDevTools();

    gifWindow.once('ready-to-show', function() {
        gifWindow.show();
        
        // Pass url to 'gifwindow'
        let siteUrl = document.querySelector('.site-url');
        gifWindow.webContents.send('create-gif', { 'siteUrl': siteUrl.value });
    });

    gifWindow.loadURL(path.resolve(__dirname, '../gifWindow/gifwindow.html'));
});


ipcRenderer.on('preview-gif', function (event, args) {
    // TODO: display a preview of the gif that was created
});