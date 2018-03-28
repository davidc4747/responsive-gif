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
        width: 1600,
        height: 900,
        show: false,
    });
    
    // Hide Menu
    gifWindow.setMenu(null);
    
    // Load page
    // TODO: open the other window using 'puppeteer' or 'phantomjs' [DC]
    gifWindow.loadURL(`file://${__dirname}/gifWindow/gifwindow.html`);



    /*-------------------------*\
        #Main Window
    \*-------------------------*/
    mainWindow = new BrowserWindow({
        x: 0,
        y: 240,
        width: 850,
        height: 600
    });

    // Hide Menu
    mainWindow.setMenu(null);

    // Load page
    mainWindow.loadURL(`file://${__dirname}/downloadgif/download.html`);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();



    /*-------------------------*\
        #Send Settings
    \*-------------------------*/

    mainWindow.webContents.on('did-finish-load', function () {
        mainWindow.webContents.send("settings-changed", settings);
    });

    gifWindow.webContents.on('did-finish-load', function () {
        gifWindow.webContents.send("settings-changed", settings);
    });



});





/*======================*\
    #Manage Settings
\*======================*/

let settings = {
    canvas: {
        width: 800,
        height: 450
    },
    siteUrl: 'http://davidchung.net',
    fps: 45,
    
    duration: 1000,
    repeatDelay: 1000,
    easing: 'Power2.easeInOut',
    backgroundColor: '#0F1C3F'
};

ipcMain.on("update-settings", function (event, args) {
    // Update settings with new values
    for (let prop in args) {
        settings[prop] = args[prop];
    }

    console.log("New Settings", settings);
    mainWindow.webContents.send("settings-changed", settings);
    gifWindow.webContents.send("settings-changed", settings);
});





/*=========================*\
    #Capturing Animation
\*=========================*/

ipcMain.on('create-gif', function() {
    gifWindow.webContents.send('create-gif');
});