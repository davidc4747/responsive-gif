const { ipcRenderer, remote } = require('electron');
let curWindow = remote.getCurrentWindow();
// curWindow.openDevTools();


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





/*======================*\
    #Update Settings
\*======================*/

ipcRenderer.on('settings-changed', function (event, newSettings) {
    console.log("Settings Changed..gifwindow.js", newSettings);
    readyToCapture = false;
    settings = newSettings;

    // Update window
    totalFrames = newSettings.totalFrames;
    canvas.width = newSettings.canvas.width;
    canvas.height = newSettings.canvas.height;
    siteFrame.src = newSettings.siteUrl;
    siteFrame.addEventListener("load", function () {
        setTimeout(function () { readyToCapture = true; }, 1000);// Delay by one second to allow the page to load it's contents [DC]
    });

    // Update Animation
    tween = TweenMax.fromTo(siteFrame, newSettings.duration / 1000, {
        width: 320
    },
        {
            width: 1600,
            yoyo: true,
            repeat: -1,
            repeatDelay: newSettings.repeatDelay / 1000,
            ease: EaseLookup.find(newSettings.easing),
            paused: true
        });
});





/*======================*\
    #Creating the gif
\*======================*/

ipcRenderer.on('create-gif', function (event, arg) {
    captureNextFrame();
});



// Gif Creator
let encoder = new GIFEncoder();
encoder.setRepeat(0);

function captureNextFrame() {
    if (currentFrame === 0) {
        tween.pause(0);
        // NOTE: The gif encoder plays back gifs a little to fast.
        //      Added a '2.75' modifier to slow it down [DC]
        encoder.setDelay((1000 / settings.fps) * 2.75);
        encoder.start();
    }

    if (currentFrame >= totalFrames) {
        // console.log('Animation Complete!!');
        currentFrame = 0;
        imageCount = 0;
        encoder.finish();
        encoder.download("download.gif");
        // curWindow.close();
    }
    else {
        // Go to currentFrame in the animation
        tween.pause(currentFrame * 2 / settings.fps);// times 2 for the yoyo

        // Screenshot the window
        curWindow.capturePage(function (image) {
            // console.log('Capture image...');

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