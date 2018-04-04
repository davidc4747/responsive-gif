// const test = require('../libs/minified/TweenMax.min.js');
const { app, BrowserWindow, ipcMain } = require('electron');

/*======================*\
    #Start App
\*======================*/

let mainWindow, gifWindow;
app.on('ready', function () {
    /*-------------------------*\
        #Gif Window
    \*-------------------------*/
    gifWindow = new BrowserWindow({
        // width: 1600,
        // height: 900,
        show: false,
    });

    // Hide Menu
    gifWindow.setMenu(null);

    // Load page
    // TODO: open the other window using 'puppeteer' or 'phantomjs' [DC]
    gifWindow.loadURL(`file://${__dirname}/gifWindow/gifwindow.html`);

    // Open the DevTools.
    // gifWindow.webContents.openDevTools();



    /*-------------------------*\
        #Main Window
    \*-------------------------*/
    mainWindow = new BrowserWindow({
        // x: 16,
        // y: 240,
        width: 1150,
        height: 650,
        show: false
    });

    // Hide Menu
    mainWindow.setMenu(null);

    // Load page
    mainWindow.loadURL(`file://${__dirname}/downloadgif/download.html`);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    mainWindow.once('ready-to-show', function () {
        mainWindow.show();
    });



    /*-------------------------*\
        #Send Settings
    \*-------------------------*/

    mainWindow.webContents.on('did-finish-load', function () {
        mainWindow.webContents.send("settings-changed", settings);
    });

    gifWindow.webContents.on('did-finish-load', function () {
        gifWindow.webContents.send("settings-changed", settings);
    });


    /* Close the app */
    mainWindow.on('closed', () => { app.quit() });
    gifWindow.on('closed', () => { app.quit() });
});





/*======================*\
    #Manage Settings
\*======================*/

const ANIMATION_SCALE = 2;// Take gif images at a higher resolution to increase image quality [DC]
let settings = {
    tween: null,
    
    canvasWidth: 800,
    canvasHeight: 450,
    
    animationScale: ANIMATION_SCALE,
    animationStartWidth: 160,
    animationEndWidth: 800,

    siteUrl: 'http://davidchung.net',
    fps: 45,
    totalFrames: 80,//(settings.duration + settings.repeatDelay) / 1000 * settings.fps,

    duration: 1000,
    repeatDelay: 1000,
    easing: 'Power2.easeInOut',
    backgroundColor: '#0F1C3F'
};

ipcMain.on("update-settings", function (event, newSettings) {
    // Update settings with new values
    for (let prop in newSettings) {
        settings[prop] = newSettings[prop];
    }

    // Calculated setting??  NOTE: Setting might be more than just settings at this point [DC]
    settings.totalFrames = (settings.duration + settings.repeatDelay) / 1000 * settings.fps;

    console.log("New Settings", settings);
    mainWindow.webContents.send("settings-changed", settings);
    gifWindow.webContents.send("settings-changed", settings);
});





/*=========================*\
    #Capturing Animation
\*=========================*/

ipcMain.on('create-gif', function () {
    gifWindow.webContents.send('create-gif');
});

ipcMain.on('cancel-gif', function () {
    gifWindow.webContents.send('cancel-gif');
});

ipcMain.on('image-captured', function (e, args) {
    mainWindow.webContents.send('image-captured', args);
});