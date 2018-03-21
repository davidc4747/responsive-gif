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
    });

    gifWindow.once('ready-to-show', function () {
        // gifWindow.show();

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

// problem: the gif looping doesn't look smooth.
// problem: losing quality because of the gifwindow scaling
// problem: I'm losing quality by jump through so many hoops
// problem: WAIT.. this thing is still slow as hell...
// problem: you can't run it twice

// Gif Creator
var encoder = new GIFEncoder();
encoder.setRepeat(0);
encoder.setDelay(100);// TODO: this should be a setting
encoder.start();

// Get the canvas
let canvas = document.querySelector(".testing");
let context = canvas.getContext("2d");

ipcRenderer.on('capture-window', function (event, args) {

    // Stap shot the gif window
    gifWindow.capturePage(function (image) {
        console.log('Capture image: ', image);

        let imgElem = new Image();
        imgElem.src = image.toDataURL();

        // let previewWindow = document.querySelector('.preview');
        // previewWindow.appendChild(imgElem);

        // on image load
        imgElem.onload = function () {
            // Draw the image on the main canvas
            context.drawImage(imgElem, 0, 0, canvas.width, canvas.height);

            // Capture the image
            encoder.addFrame(context);
            
            // Get the next frame
            gifWindow.webContents.send('next-frame');
        };

    });
});


ipcRenderer.on('end-animation', function (event, args) {
    console.log('Animation Done');
    encoder.finish();
    encoder.download("download.gif");
});