const { ipcRenderer, remote } = require('electron');

let curWindow = remote.getCurrentWindow();
// curWindow.openDevTools();

const duration = 1;
const repeatDelay = 1;
const fps = 60;
const totalFrames = (duration + repeatDelay) * fps;
const totalDuration = (duration + repeatDelay) * 2;
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

ipcRenderer.on('load-siteUrl', function(event, arg) {
    // Get the site url
    siteFrame.src = arg.siteUrl;
});

ipcRenderer.on('create-gif', function (event, arg) {
    // Get the site url
    siteFrame.src = arg.siteUrl;
    siteFrame.addEventListener("load", function(){
        setTimeout(captureNextFrame, 1000);// delay by one second to allow the page to load it's contents [DC]
    });
});

ipcRenderer.on('next-frame', captureNextFrame);

function captureNextFrame() {
    if (currentFrame >= totalFrames) {
        curWindow.getParentWindow().send('end-animation');
        curWindow.close();
    }
    else {
        tween.pause((currentFrame / totalFrames) * totalDuration);
        curWindow.getParentWindow().send('capture-window');
        currentFrame++;
    }
}