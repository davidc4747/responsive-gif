const { ipcRenderer, remote } = require('electron');

let curWindow = remote.getCurrentWindow();

const duration = 1;
const repeatDelay = 1;
const fps = 60;
const totalFrames = (duration + repeatDelay) * fps;
let currentFrame = 0;





/*======================*\
    #Sacling Animation
\*======================*/

const siteFrame = document.querySelector('iframe');
const tween = TweenMax.fromTo(siteFrame, duration, {
    width: 320
},
    {
        width: 1600,
        yoyo: true,
        repeat: -1,
        repeatDelay: repeatDelay,
        ease: Power2.easeInOut,
        paused: true
    });





ipcRenderer.on('create-gif', function (event, arg) {
    // Get the site url
    siteFrame.src = arg.siteUrl;
    siteFrame.addEventListener("load", captureNextFrame);
});



ipcRenderer.on('next-frame', captureNextFrame);





function captureNextFrame() {
    if (currentFrame === totalFrames) {
        curWindow.close();
    }
    else {
        tween.pause(currentFrame / totalFrames);
        curWindow.getParentWindow().send('capture-window');
        currentFrame++;
    }















    // console.log("currentFrame: ", currentFrame);
    // console.log("totalFrames: ", totalFrames);

    // let animation play
    // curWindow.webContents.beginFrameSubscription(function (frameBuffer, dirtyRect) {
    //     curWindow.getParentWindow().send('preview-gif', frameBuffer);
    // });
    // tween.play();





    // tween.pause(currentFrame / totalFrames);
    // curWindow.capturePage(function (image) {
    //     // console.log('Capture', curWindow.getParentWindow());
    //     curWindow.getParentWindow().webContents.send('preview-gif', image);

    //     // let imgElem = new Image();
    //     // imgElem.src = image.toDataURL();

    //     // let previewWindow = document.querySelector('.preview');
    //     // previewWindow.appendChild(imgElem);

    //     if (currentFrame === totalFrames) {
    //         // curWindow.close();
    //     }
    //     else {
    //         currentFrame++;
    //         captureNextFrame();
    //     }
    // });

    // TODO: adjust frame by frame and then capture a picture.... 
    // Stitch them together with gif.js





    // Send the video back to the main.js  
    // setTimeout(function () {
    //     // curWindow.webContents.endFrameSubscription();
    //     curWindow.close();
    // }, (duration + repeatDelay) * 2000);
}