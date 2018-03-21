const path = require('path');
const { remote, ipcRenderer, nativeImage } = require('electron');
const BrowserWindow = remote.BrowserWindow;





/*======================*\
    #Create gifWindow
\*======================*/

// Open new window
let gifWindow = new BrowserWindow({
    parent: remote.getCurrentWindow(),

    backgroundColor: '#0F1C3F',
    width: 800,
    height: 450,
    show: false,
});

// Hide Menu
gifWindow.setMenu(null);

gifWindow.once('ready-to-show', function () {
    gifWindow.show();
});

// Load page
// TODO: open the other window using 'puppeteer' or 'phantomjs' [DC]
gifWindow.loadURL(path.resolve(__dirname, '../gifWindow/gifwindow.html'));





/*======================*\
    #Window Events
\*======================*/

let createBtn = document.querySelector('.create');
let siteUrlElem = document.querySelector(".site-url");


createBtn.addEventListener('click', function () {
    // Pass url to 'gifwindow'
    gifWindow.webContents.send('create-gif', { 'siteUrl': siteUrlElem.value });
});

siteUrlElem.addEventListener("input", function (event) {
    console.log("input change!");
    gifWindow.webContents.send('load-siteUrl', { 'siteUrl': siteUrlElem.value });

    // Stap shot the gif window
    gifWindow.capturePage(function (image) {
        let imgElem = new Image();
        imgElem.src = image.toDataURL();

        // on image load
        imgElem.onload = function () {
            // Draw the image on the main canvas
            context.drawImage(imgElem, 0, 0, canvas.width, canvas.height);
        };

    });
});

siteUrlElem.value = "https://s.codepen.io/tylersticka/debug/daefb60e7a6962c0f36f4464321e2e7a";





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