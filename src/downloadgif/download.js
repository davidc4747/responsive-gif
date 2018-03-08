const path = require('path');
const { remote, ipcRenderer, nativeImage } = require('electron');
const BrowserWindow = remote.BrowserWindow;

let gifWindow;



/*======================*\
    #Display Pop up
\*======================*/

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
        frame: false,
        center: true,
    });

    gifWindow.once('ready-to-show', function () {
        gifWindow.show();

        // Pass url to 'gifwindow'
        let siteUrl = document.querySelector('.site-url');
        gifWindow.webContents.send('create-gif', { 'siteUrl': siteUrl.value });
    });

    // Load page
    // TODO: open the other window using 'puppeteer' or 'phantomjs' [DC]
    gifWindow.loadURL(path.resolve(__dirname, '../gifWindow/gifwindow.html'));
});





/*======================*\
    #Capture Image
\*======================*/

ipcRenderer.on('capture-window', function (event, args) {
    // Stap shot the gif window
    gifWindow.capturePage(function (image) {
        console.log('Capture image: ', image);

        let imgElem = new Image();
        imgElem.src = image.toDataURL();

        let previewWindow = document.querySelector('.preview');
        previewWindow.appendChild(imgElem);

        // Get the next frame
        gifWindow.webContents.send('next-frame');
    });
});