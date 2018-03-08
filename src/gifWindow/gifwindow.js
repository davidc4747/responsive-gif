const { ipcRenderer } = require('electron');

const duration = 1;
const fps = 60;
const totalFrames = duration * fps;
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
        repeatDelay: 1,
        ease: Power2.easeInOut,
        paused: true
    });





ipcRenderer.on('create-gif', function (event, arg) {
    // Get the site url
    console.log('gifWindow: ', event,  arg);
    siteFrame.src = arg.siteUrl;

    // let animation play
    tween.play();

    // TODO: capture images from this window
    // send the video back to the main.js
});

