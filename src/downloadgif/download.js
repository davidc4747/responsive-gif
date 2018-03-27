const path = require('path');
const { remote, ipcRenderer } = require('electron');
const BrowserWindow = remote.BrowserWindow;


// TODO:  for controlling sizing, timing, easing and background
// TODO:  Google's Puppeteer for screenshots??
// TODO:  ~~Record a Gif of any GreenSock animation?
// TODO: Error if the button is pressed twice
// TODO: Should I use react for this??

/*======================*\
    #Create gifWindow
\*======================*/

// Open new window
let gifWindow = new BrowserWindow({
    parent: remote.getCurrentWindow(),

    // backgroundColor: settings.backgroundColor,
    // width: settings.canvas.width,
    // height: settings.canvas.height,
    show: false,
});

// Hide Menu
gifWindow.setMenu(null);

// Load page
// TODO: open the other window using 'puppeteer' or 'phantomjs' [DC]
gifWindow.loadURL(path.resolve(__dirname, '../gifWindow/gifwindow.html'));


/*======================*\
    #Settings Events
\*======================*/

document.querySelector('.background-color').addEventListener("input", function () {
    updateSettings();
});

function updateSettings() {
    ipcRenderer.send('update-settings', { backgroundColor: '#f00' })
}

ipcRenderer.on('settings-changed', function (event, settings) {
    console.log("Settings CHANGED!!!!", settings);
});

function updateView(settings) { }



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
    updateSettings();
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





/*======================*\
    #Capture Image
\*======================*/

// Gif Creator
var encoder = new GIFEncoder();
encoder.setRepeat(0);
encoder.setDelay(46);// TODO: this should be a setting
// encoder.setFrameRate(60);// TODO: this should be a setting
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