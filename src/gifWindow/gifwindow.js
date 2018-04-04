const fs = require('fs');
const { ipcRenderer, remote } = require('electron');
const { dialog } = remote;
let curWindow = remote.getCurrentWindow();


/*======================*\
    #Sacling Animation
\*======================*/

// Create canvas
let canvas = document.createElement('canvas');
let context = canvas.getContext("2d");

const siteFrame = document.querySelector('iframe');
let settings;
let tween;

let imageCount = 0;
let totalFrames;
let currentFrame = 0;
let readyToCapture = false;// NOTE: never used [DC]
console.log("gifwindow.js");





/*======================*\
    #Update Settings
\*======================*/

ipcRenderer.on('settings-changed', function (event, newSettings) {
    readyToCapture = false;
    settings = newSettings;

    // Update window
    totalFrames = newSettings.totalFrames;
    curWindow.setSize(newSettings.canvasWidth * newSettings.animationScale, newSettings.canvasHeight * newSettings.animationScale);
    canvas.width = newSettings.canvasWidth;
    canvas.height = newSettings.canvasHeight;
    siteFrame.src = newSettings.siteUrl;
    siteFrame.addEventListener("load", function () {
        setTimeout(function () { readyToCapture = true; }, 1000);// Delay by one second to allow the page to load it's contents [DC]
    });

    // TODO: this tween is repeated in here and 'downloadgif' window. It should be a ...computed setting? [DC]
    // Update Animation
    tween = TweenMax.fromTo(siteFrame, newSettings.duration / 1000, {
        width: newSettings.animationStartWidth * newSettings.animationScale
    },
        {
            width: newSettings.animationEndWidth * newSettings.animationScale,
            yoyo: true,
            repeat: -1,
            repeatDelay: newSettings.repeatDelay / 1000,
            ease: EaseLookup.find(newSettings.easing),
            // paused: true
        });
});





/*======================*\
    #Creating the gif
\*======================*/

let wasCanceled = false;

ipcRenderer.on('create-gif', function (event, arg) {
    captureNextFrame();
});

ipcRenderer.on('cancel-gif', function (event, arg) {
    // Force cancel the gif creation
    wasCanceled = true;
    currentFrame = totalFrames;
    // captureNextFrame();
});



// Gif Creator
let encoder = new GIFEncoder();
encoder.setRepeat(0);

function captureNextFrame() {
    // if animation just started
    if (currentFrame === 0) {
        tween.pause(0);
        // NOTE: The gif encoder plays back gifs a little to fast.
        //      Added a '2.60' modifier to slow it down [DC]
        encoder.setDelay((1000 / settings.fps) * 2.60);
        encoder.setSize(settings.canvasWidth, settings.canvasHeight);
        encoder.start();
    }

    // if animation is finished
    if (currentFrame >= totalFrames) {
        // Reset animation variables
        currentFrame = 0;
        imageCount = 0;
        encoder.finish();

        // Skip dialog if 'wasCanceled'
        let downloadPath, gifBuffer;
        if (!wasCanceled) {
            downloadPath = dialog.showSaveDialog({ defaultPath: "download.gif", filters: [{ name: 'Gif', extensions: ['gif'] }] });
            gifBuffer = new Buffer(new Uint8Array(encoder.stream().bin));
        }

        console.log("Path: ", downloadPath);
        // if have valid 'downloadPath'
        if (downloadPath) {

            // Add the gif extension if needed
            if (downloadPath.endsWith(".gif") !== true) {
                downloadPath += ".gif";
            }

            // Write Gif to disk
            fs.writeFile(downloadPath, gifBuffer, function (err) {
                if (err) throw err;
            });
        }
        wasCanceled = false;
        // curWindow.close();
    }
    else {
        // Go to currentFrame in the animation
        tween.pause(currentFrame * 2 / settings.fps);// times 2 for the yoyo

        // Screenshot the window
        curWindow.capturePage(function (image) {
            let imgElem = new Image();
            imgElem.src = image.toDataURL();

            // on image load
            imgElem.onload = function () {
                // Draw the image on the main canvas
                context.fillStyle = settings.backgroundColor;
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(imgElem, 0, 0, canvas.width, canvas.height);

                // Capture the image
                imageCount++;
                encoder.addFrame(context);
                ipcRenderer.send('image-captured', { imageCount: imageCount, progress: currentFrame / Math.ceil(totalFrames) })

                // Get the next frame
                captureNextFrame();
            };

        });
        currentFrame++;
    }
}