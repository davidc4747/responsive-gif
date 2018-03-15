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

// TODO: try the other one

// Gif Creator
let gif = new GIF({
    workers: 2,
    quality: 10
});

// Get the canvas
let canvas = document.querySelector(".testing");
let context = canvas.getContext("2d");

gif.addFrame(canvas, { delay: 17 });
gif.on('finished', function (blob) {
    let downloadBtn = document.querySelector('.download');
    downloadBtn.addEventListener('click', function () {
        console.log('Download click.');
        window.open(URL.createObjectURL(blob));
    });
});



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
            context.drawImage(imgElem, 0, 0, canvas.width, canvas.height);
            // gif.addFrame(imgElem);
            // gif.addFrame(context, { copy: true });

            // Get the next frame
            gifWindow.webContents.send('next-frame');
        };

    });
});


ipcRenderer.on('end-animation', function (event, args) {
    console.log('Animation Done');
    gif.render();
});