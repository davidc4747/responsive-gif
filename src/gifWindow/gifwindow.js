const { ipcRenderer, remote } = require('electron');

let curWindow = remote.getCurrentWindow();
// curWindow.openDevTools();

const duration = 1;
const repeatDelay = 1;
const fps = 120;
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








/*======================*\
    #Creating the gif
\*======================*/

ipcRenderer.on('create-gif', function (event, arg) {
    // Get the site url
    siteFrame.src = arg.siteUrl;
    siteFrame.addEventListener("load", captureNextFrame);
});

ipcRenderer.on('next-frame', captureNextFrame);

function captureNextFrame() {
    if (currentFrame === totalFrames) {
        curWindow.getParentWindow().send('end-animation');
        curWindow.close();
    }
    else {
        tween.pause(currentFrame / totalFrames);
        curWindow.getParentWindow().send('capture-window');
        currentFrame++;
    }
}