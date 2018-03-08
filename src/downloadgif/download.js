const path = require('path');
const { remote, ipcRenderer, nativeImage } = require('electron');
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
        frame: false,
        center: true,
    });

    // Open the DevTools.
    // gifWindow.webContents.openDevTools();

    gifWindow.once('ready-to-show', function () {
        gifWindow.show();

        // Pass url to 'gifwindow'
        let siteUrl = document.querySelector('.site-url');
        gifWindow.webContents.send('create-gif', { 'siteUrl': siteUrl.value });
    });

    // Load page
    // TODO: open the other window using 'puppeteer' or 'phantomjs'
    gifWindow.loadURL(path.resolve(__dirname, '../gifWindow/gifwindow.html'));
});


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

ipcRenderer.on('preview-gif', function (event, image) {
    console.log('event hit!!!', image);


    // let temp = new Buffer(frameBuffer, 'utf8');
    // // var base64Image = new Buffer(frameBuffer, 'binary').toString('base64');
    // // var decodedImage = new Buffer(base64Image, 'base64').toString('binary');

    // console.log("??", temp);
    // let image = nativeImage.createFromBuffer(temp);





    // let imgElem = new Image();
    // imgElem.src = image.toDataURL();

    // let previewWindow = document.querySelector('.preview');
    // previewWindow.appendChild(imgElem);









    // TODO: display a preview of the gif that was created
    // gifWindow.capturePage(function (image) {
    //     console.log('testing capture', image);

    //     let imgElem = new Image();
    //     imgElem.src = image.toDataURL();

    //     let previewWindow = document.querySelector('.preview');
    //     previewWindow.appendChild(imgElem);
    // });
});